# MongonDB的安装

- 打开 https://www.mongodb.com/ 官网

- 点击Resources 导航栏

- 点击[Documentation](https://www.mongodb.com/docs/) 文档导航栏

- 点击MongoDB Database Manual 板块

- 点击左侧 installation 菜单，按步骤一步步安装即可

- 安装完以后，windows环境需要在环境变量的path中添加 mongodb的安装目录，一般为`C:\Program Files\MongoDB\Server\5.0\bin`

## 简单指令

- `show dbs`  查看数据库

- `use db` 进入某个数据库

- `db` 查看当前数据库

- `exit;`   `quit();`退出

## MongoDB的基础概念

- 数据存储结构及存储库 
  
  - 类似于josn格式的概念

- 集合
  
  - 每一个表

- 文档
  
  - 每一条数据

## NodeJs连接MongoDB

```js
const { MongoClient } = require('mongodb');
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'myProject';

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  const collection = db.collection('documents');

  // the following code examples can be pasted here...

  return 'done.';
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());
```
