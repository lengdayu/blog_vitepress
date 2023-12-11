# Express

## 一、项目构建

- 创建指令 `npn init -y` 、`npm i express - D`

- express 提供了示例工程，可以通过`npx express-generator`指令来完成创建

## 二、基本使用

```js
import express from "express";
import fs from "fs/promises";
import json5 from "json5";

const app = express();

app.get("/", async (req, res) => {
  try {
    const data = await fs.readFile("./db.json5", { encoding: "utf-8" });
    res.send(json5.parse(data).users);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(5000, () => {
  console.log("serve running in 5000");
});
0");
```

## 三、解析 post 请求

```js
//解析post中不同类型的数据
app.use(express.urlencoded()); //x-www-form-urlencoded
app.use(express.json()); //json

app.post("/add", async (req, res) => {
  console.log(req.headers);
  console.log(req.body);
  let body = req.body;
  if (!body) {
    res.status(403).json({
      error: "缺少用户信息",
    });
  } else {
    let db = await fs.readFile("./db.json5", { encoding: "utf-8" });
    const jsonObj = json5.parse(db);
    body.id = jsonObj.users[jsonObj.users.length - 1].id + 1;
    jsonObj.users.push(body);
    await fs.writeFile("./db.json5", json5.stringify(jsonObj));
    res.send("写入成功");
  }
});
```

## 四、Express 中间件

### 1、中间件的优点

```js
// 在某个路由中都需要统一的处理
// 如果按下面的方式去写太过繁琐
function logs(req) {
  console.log(`${req.method},${req.url},${Date.now()}`);
}

app.get("/", (req, res) => {
  logs(req);
  res.send("/index");
});

app.get("/register", (req, res) => {
  logs(req);
  res.send("/register");
});

app.get("/login", (req, res) => {
  logs(req);
  res.send("/login");
});
```

```js
// 合理利用中间件可以极大的提高开发的效率
// 一定要在路由前挂载
app.use((req, res, next) => {
  console.log(`${req.method},${req.url},${Date.now()}`);
  next();
});

app.get("/", (req, res) => {
  res.send("/index");
});

app.get("/register", (req, res) => {
  res.send("/register");
});

app.get("/login", (req, res) => {
  res.send("/login");
});
```

### 2、中间件的分类

- 应用程序

- 路由

- 错误处理

- 内置

- 三方
