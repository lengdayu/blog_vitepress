# GO 操作数据库

## 一、链接数据库

- 下载依赖

```bash
go get -u github.com/go-sql-driver/mysql
```

- ### 使用MySQL驱动

```go
func Open(driverName, dataSourceName string) (*DB, error)
```

- Ping()方法校验是否接通数据库

完整代码：

```go
package main

//_ "github.com/go-sql-driver/mysql" 对应的sql驱动也要隐式导入
import (
    "database/sql"
    "fmt"
    _ "github.com/go-sql-driver/mysql"
)

func main() {
    dsn := "user:password@tcp(127.0.0.1:3306)/dbname"
    //db 一般定义在函数外，做全局的db使用
    db, err := sql.Open("mysql", dsn)
    if err != nil {
        panic(err)
        return
    }

    if err = db.Ping(); err != nil {
        fmt.Printf("db connect failed%v\n", err)
        return
    }
}
```

### SetConnMaxLifetime

```go
func (db *DB) SetConnMaxLifetime(d time.Duration)
```

`SetConnMaxLifetime`设置链接最大存活时间

### SetMaxOpenConns

```go
func (db *DB) SetMaxOpenConns(n int)
```

`SetMaxOpenConns`设置与数据库建立连接的最大数目。 如果n大于0且小于最大闲置连接数，会将最大闲置连接数减小到匹配最大开启连接数的限制。 如果n<=0，不会限制最大开启连接数，默认为0（无限制）。

### SetMaxIdleConns

```go
func (db *DB) SetMaxIdleConns(n int)
```

SetMaxIdleConns设置连接池中的最大闲置连接数。 如果n大于最大开启连接数，则新的最大闲置连接数会减小到匹配最大开启连接数的限制。 如果n<=0，不会保留闲置连接。

## 二、database/sql与mysql注册驱动详解

## 三、增删改查操作

- #### 单行查询
  
  - 单行查询`db.QueryRow()`执行一次查询，并期望返回最多一行结果（即Row）。QueryRow总是返回非nil的值，直到返回值的Scan方法被调用时，才会返回被延迟的错误。（如：未找到结果）
  
  示例代码：

```go
type user struct {
    id   int
    sex  string
    name string
}

// queryRowDemo 查询单条数据示例
func queryRowDemo() {
    sqlStr := "select id ,sex ,name from user where id = ? "
    var u user
    //    非常重要:确保QueryRow之后调用Scan方法，否则持有的数据库链接不会释放
    row := db.QueryRow(sqlStr, 1)
    if err := row.Scan(&u.id, &u.sex, &u.name); err != nil {
        fmt.Printf("scan failed err:%v\n", err)
        return
    }
    fmt.Printf("id:%v sex:%v name:%v\n", u.id, u
```

- #### 多行查询
  
  - 多行查询`db.Query()`执行一次查询，返回多行结果（即Rows），一般用于执行select命令。参数args表示query中的占位参数。

示例代码:

```go
// queryMultiRowsDemo 查询多行数据
func queryMultiRowsDemo() {
    sqlStr := "select id, name, sex from user where id > ? "
    row, err := db.Query(sqlStr, 0)
    if err != nil {
        fmt.Printf("Query failed,err:%v\n", err)
        return
    }
    //    非常重要，关闭rows释放所持有的数据库链接
    defer row.Close()

    //循环读取结果集中的数据
    for row.Next() {
        var u user
        if err = row.Scan(&u.id, &u.sex, &u.name); err != nil {
            fmt.Printf("Scan failed,err:%v\n", err)
            return
        }
        fmt.Printf("id:%v name:%v sex:%v\n", u.id, u.name, u.sex)
    }
}
```

- #### 插入数据
  
  - 插入、更新和删除操作都使用`Exec`方法。

示例代码:

```go
// insertRowDemo 插入数据
func insertRowDemo() {
    sqlStr := "insert into user(account_id,account_pwd,name,sex) values (?,?,?,?)"
    result, err := db.Exec(sqlStr, "777777777", "6666666", "uu", "0")
    if err != nil {
        fmt.Printf("Exec failed,err:%v\n", err)
        return
    }
    rId, err := result.LastInsertId() //新插入数据的id
    if err != nil {
        fmt.Printf("get LastInsertId failed,err:%v\n", err)
        return
    }
    fmt.Printf("the id of last insert:%v\n ", rId)
}
```

- #### 更新数据

示例代码:

```go
// updateRowDemo 更新数据
func updateRowDemo() {
    sqlStr := "update  user set account_id=?,account_pwd=?,name=?,sex=? where id = ?"
    result, err := db.Exec(sqlStr, "777777777", "6666666", "uuu", "1", "7")
    if err != nil {
        fmt.Printf("update failed,err:%v\n", err)
        return
    }
    n, err := result.RowsAffected() //新插入数据的id
    if err != nil {
        fmt.Printf("get n failed,err:%v\n", err)
        return
    }
    fmt.Printf("update success affect rows:%v\n ", n)
}
```

- #### 删除数据（同更新）

## 四、MYSQL预处理

- #### Go实现MySQL预处理

```go
// 预处理查询示例
func prepareQueryDemo() {
    sqlStr := "select id, name, age from user where id > ?"
    stmt, err := db.Prepare(sqlStr)
    if err != nil {
        fmt.Printf("prepare failed, err:%v\n", err)
        return
    }
    defer stmt.Close()
    rows, err := stmt.Query(0)
    if err != nil {
        fmt.Printf("query failed, err:%v\n", err)
        return
    }
    defer rows.Close()
    // 循环读取结果集中的数据
    for rows.Next() {
        var u user
        err := rows.Scan(&u.id, &u.name, &u.age)
        if err != nil {
            fmt.Printf("scan failed, err:%v\n", err)
            return
        }
        fmt.Printf("id:%d name:%s age:%d\n", u.id, u.name, u.age)
    }
}
```

插入、更新和删除操作的预处理十分类似，这里以插入操作的预处理为例：

```go
// 预处理插入示例
func prepareInsertDemo() {
    sqlStr := "insert into user(name, age) values (?,?)"
    stmt, err := db.Prepare(sqlStr)
    if err != nil {
        fmt.Printf("prepare failed, err:%v\n", err)
        return
    }
    defer stmt.Close()
    _, err = stmt.Exec("uuu", 18)
    if err != nil {
        fmt.Printf("insert failed, err:%v\n", err)
        return
    }
    _, err = stmt.Exec("iiuu", 18)
    if err != nil {
        fmt.Printf("insert failed, err:%v\n", err)
        return
    }
    fmt.Println("insert success.")
}
```

五、GO实现MYSQL事务

示例代码:

```go
// 事务操作示例
func transactionDemo() {
    tx, err := db.Begin() // 开启事务
    if err != nil {
        if tx != nil {
            tx.Rollback() // 回滚
        }
        fmt.Printf("begin trans failed, err:%v\n", err)
        return
    }
    sqlStr1 := "Update user set age=30 where id=?"
    ret1, err := tx.Exec(sqlStr1, 2)
    if err != nil {
        tx.Rollback() // 回滚
        fmt.Printf("exec sql1 failed, err:%v\n", err)
        return
    }
    affRow1, err := ret1.RowsAffected()
    if err != nil {
        tx.Rollback() // 回滚
        fmt.Printf("exec ret1.RowsAffected() failed, err:%v\n", err)
        return
    }

    sqlStr2 := "Update user set age=40 where id=?"
    ret2, err := tx.Exec(sqlStr2, 3)
    if err != nil {
        tx.Rollback() // 回滚
        fmt.Printf("exec sql2 failed, err:%v\n", err)
        return
    }
    affRow2, err := ret2.RowsAffected()
    if err != nil {
        tx.Rollback() // 回滚
        fmt.Printf("exec ret1.RowsAffected() failed, err:%v\n", err)
        return
    }

    fmt.Println(affRow1, affRow2)
    if affRow1 == 1 && affRow2 == 1 {
        fmt.Println("事务提交啦...")
        tx.Commit() // 提交事务
    } else {
        tx.Rollback()
        fmt.Println("事务回滚啦...")
    }

    fmt.Println("exec trans success!")
}
```
