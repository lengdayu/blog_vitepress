# sqlx库使用指南

## 一、查询

示例所需结构体：

```go
type user struct {
    AccountId string `db:"account_id"`
    Name      string `db:"name"`
    Address   string `db:"address"`
}
```

## 单条查询示例:

```go
func queryRow() {
    sqlStr := "select account_id ,name ,address from user where account_id = ?"
    var u user
    err := db.Get(&u, sqlStr, "381343535")
    if err != nil {
        fmt.Printf("search failed err:%v\n", err)
        return
    }
    fmt.Printf("account_id:%v name:%v address:%v\n", u.AccountId, u.Name, u.Address)
}
```

## 多条示例查询

```go
func queryRows() {
    sqlStr := "select account_id ,name,address from user where id > ?"
    var users []user
    err := db.Select(&users, sqlStr, 0)
    if err != nil {
        return
    }
    fmt.Printf("users:%v\n", users)
}
```

## 二、 插入、更新、删除

sqlx中的exec方法与原生sql中的exec使用基本一致：

```go
// 插入数据
func insertRowDemo() {
    sqlStr := "insert into user(name, age) values (?,?)"
    ret, err := db.Exec(sqlStr, "iu", 19)
    if err != nil {
        fmt.Printf("insert failed, err:%v\n", err)
        return
    }
    theID, err := ret.LastInsertId() // 新插入数据的id
    if err != nil {
        fmt.Printf("get lastinsert ID failed, err:%v\n", err)
        return
    }
    fmt.Printf("insert success, the id is %d.\n", theID)
}

// 更新数据
func updateRowDemo() {
    sqlStr := "update user set age=? where id = ?"
    ret, err := db.Exec(sqlStr, 39, 6)
    if err != nil {
        fmt.Printf("update failed, err:%v\n", err)
        return
    }
    n, err := ret.RowsAffected() // 操作影响的行数
    if err != nil {
        fmt.Printf("get RowsAffected failed, err:%v\n", err)
        return 
    }
    fmt.Printf("update success, affected rows:%d\n", n)
}

// 删除数据
func deleteRowDemo() {
    sqlStr := "delete from user where id = ?"
    ret, err := db.Exec(sqlStr, 6)
    if err != nil {
        fmt.Printf("delete failed, err:%v\n", err)
        return
    }
    n, err := ret.RowsAffected() // 操作影响的行数
    if err != nil {
        fmt.Printf("get RowsAffected failed, err:%v\n", err)
        return
    }
    fmt.Printf("delete success, affected rows:%d\n", n)
}
```

## 三、事务操作

对于事务操作，我们可以使用`sqlx`中提供的`db.Beginx()`和`tx.Exec()`方法。示例代码如下：

```go
func transactionDemo2()(err error) {
    tx, err := db.Beginx() // 开启事务
    if err != nil {
        fmt.Printf("begin trans failed, err:%v\n", err)
        return err
    }
    defer func() {
        if p := recover(); p != nil {
            tx.Rollback()
            panic(p) // re-throw panic after Rollback
        } else if err != nil {
            fmt.Println("rollback")
            tx.Rollback() // err is non-nil; don't change it
        } else {
            err = tx.Commit() // err is nil; if Commit returns error update err
            fmt.Println("commit")
        }
    }()

    sqlStr1 := "Update user set age=20 where id=?"

    rs, err := tx.Exec(sqlStr1, 1)
    if err!= nil{
        return err
    }
    n, err := rs.RowsAffected()
    if err != nil {
        return err
    }
    if n != 1 {
        return errors.New("exec sqlStr1 failed")
    }
    sqlStr2 := "Update user set age=50 where i=?"
    rs, err = tx.Exec(sqlStr2, 5)
    if err!=nil{
        return err
    }
    n, err = rs.RowsAffected()
    if err != nil {
        return err
    }
    if n != 1 {
        return errors.New("exec sqlStr1 failed")
    }
    return err
}
```

## 四、sqlx.In

### sqlx.In的批量插入示例

#### 表结构

为了方便演示插入数据操作，这里创建一个`user`表，表结构如下：

```sql
CREATE TABLE `user` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(20) DEFAULT '',
    `age` INT(11) DEFAULT '0',
    PRIMARY KEY(`id`)
)ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
```

#### 结构体

定义一个`user`结构体，字段通过tag与数据库中user表的列一致。

```go
type User struct {
    Name string `db:"name"`
    Age  int    `db:"age"`
}
```

#### bindvars（绑定变量）

查询占位符`?`在内部称为**bindvars（查询占位符）**,它非常重要。你应该始终使用它们向数据库发送值，因为它们可以防止SQL注入攻击。`database/sql`不尝试对查询文本进行任何验证；它与编码的参数一起按原样发送到服务器。除非驱动程序实现一个特殊的接口，否则在执行之前，查询是在服务器上准备的。因此`bindvars`是特定于数据库的:

- MySQL中使用`?`
- PostgreSQL使用枚举的`$1`、`$2`等bindvar语法
- SQLite中`?`和`$1`的语法都支持
- Oracle中使用`:name`的语法

`bindvars`的一个常见误解是，它们用来在sql语句中插入值。它们其实仅用于参数化，不允许更改SQL语句的结构。例如，使用`bindvars`尝试参数化列或表名将不起作用：

```go
// ？不能用来插入表名（做SQL语句中表名的占位符）
db.Query("SELECT * FROM ?", "mytable")

// ？也不能用来插入列名（做SQL语句中列名的占位符）
db.Query("SELECT ?, ? FROM people", "name", "location")
```

#### 自己拼接语句实现批量插入

比较笨，但是很好理解。就是有多少个User就拼接多少个`(?, ?)`。

```go
// BatchInsertUsers 自行构造批量插入的语句
func BatchInsertUsers(users []*User) error {
    // 存放 (?, ?) 的slice
    valueStrings := make([]string, 0, len(users))
    // 存放values的slice
    valueArgs := make([]interface{}, 0, len(users) * 2)
    // 遍历users准备相关数据
    for _, u := range users {
        // 此处占位符要与插入值的个数对应
        valueStrings = append(valueStrings, "(?, ?)")
        valueArgs = append(valueArgs, u.Name)
        valueArgs = append(valueArgs, u.Age)
    }
    // 自行拼接要执行的具体语句
    stmt := fmt.Sprintf("INSERT INTO user (name, age) VALUES %s",
        strings.Join(valueStrings, ","))
    _, err := DB.Exec(stmt, valueArgs...)
    return err
}
```

#### 使用sqlx.In实现批量插入

前提是需要我们的结构体实现`driver.Valuer`接口：

```go
func (u User) Value() (driver.Value, error) {
    return []interface{}{u.Name, u.Age}, nil
}
```

使用`sqlx.In`实现批量插入代码如下：

```go
// BatchInsertUsers2 使用sqlx.In帮我们拼接语句和参数, 注意传入的参数是[]interface{}
func BatchInsertUsers2(users []interface{}) error {
    query, args, _ := sqlx.In(
        "INSERT INTO user (name, age) VALUES (?), (?), (?)",
        users..., // 如果arg实现了 driver.Valuer, sqlx.In 会通过调用 Value()来展开它
    )
    fmt.Println(query) // 查看生成的querystring
    fmt.Println(args)  // 查看生成的args
    _, err := DB.Exec(query, args...)
    return err
}
```

#### 使用NamedExec实现批量插入

**注意** ：该功能需1.3.1版本以上，并且1.3.1版本目前还有点问题，sql语句最后不能有空格和`;`，详见[issues/690](https://github.com/jmoiron/sqlx/issues/690)。

使用`NamedExec`实现批量插入的代码如下：

```go
// BatchInsertUsers3 使用NamedExec实现批量插入
func BatchInsertUsers3(users []*User) error {
    _, err := DB.NamedExec("INSERT INTO user (name, age) VALUES (:name, :age)", users)
    return err
}
```

把上面三种方法综合起来试一下：

```go
func main() {
    err := initDB()
    if err != nil {
        panic(err)
    }
    defer DB.Close()
    u1 := User{Name: "iu", Age: 18}
    u2 := User{Name: "7v", Age: 28}
    u3 := User{Name: "uu", Age: 38}

    // 方法1
    users := []*User{&u1, &u2, &u3}
    err = BatchInsertUsers(users)
    if err != nil {
        fmt.Printf("BatchInsertUsers failed, err:%v\n", err)
    }

    // 方法2
    users2 := []interface{}{u1, u2, u3}
    err = BatchInsertUsers2(users2)
    if err != nil {
        fmt.Printf("BatchInsertUsers2 failed, err:%v\n", err)
    }

    // 方法3
    users3 := []*User{&u1, &u2, &u3}
    err = BatchInsertUsers3(users3)
    if err != nil {
        fmt.Printf("BatchInsertUsers3 failed, err:%v\n", err)
    }
}
```

### sqlx.In的查询示例

关于`sqlx.In`这里再补充一个用法，在`sqlx`查询语句中实现In查询和FIND_IN_SET函数。即实现`SELECT * FROM user WHERE id in (3, 2, 1);`和`SELECT * FROM user WHERE id in (3, 2, 1) ORDER BY FIND_IN_SET(id, '3,2,1');`。

#### in查询

查询id在给定id集合中的数据。

```go
// QueryByIDs 根据给定ID查询
func QueryByIDs(ids []int)(users []User, err error){
    // 动态填充id
    query, args, err := sqlx.In("SELECT name, age FROM user WHERE id IN (?)", ids)
    if err != nil {
        return
    }
    // sqlx.In 返回带 `?` bindvar的查询语句, 我们使用Rebind()重新绑定它
    query = DB.Rebind(query)

    err = DB.Select(&users, query, args...)
    return
}
```

#### in查询和FIND_IN_SET函数

查询id在给定id集合的数据并维持给定id集合的顺序。

```go
// QueryAndOrderByIDs 按照指定id查询并维护顺序
func QueryAndOrderByIDs(ids []int)(users []User, err error){
    // 动态填充id
    strIDs := make([]string, 0, len(ids))
    for _, id := range ids {
        strIDs = append(strIDs, fmt.Sprintf("%d", id))
    }
    query, args, err := sqlx.In("SELECT name, age FROM user WHERE id IN (?) ORDER BY FIND_IN_SET(id, ?)", ids, strings.Join(strIDs, ","))
    if err != nil {
        return
    }

    // sqlx.In 返回带 `?` bindvar的查询语句, 我们使用Rebind()重新绑定它
    query = DB.Rebind(query)

    err = DB.Select(&users, query, args...)
    return
}
```

当然，在这个例子里面你也可以先使用`IN`查询，然后通过代码按给定的ids对查询结果进行排序。
