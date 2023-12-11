# node开发原生服务器

## 一、使用node创建HTTP服务器

```js
//1.导入http模块
import http from "http";

//2.创建服务器
// 获取到服务器的实例对象
const app = http.createServer();
app.listen(9090, () => {
  console.log("run http://127.0.0.1:9090");
});

//3.监听请求事件
app.on("request", (req, res) => {
  console.log(req);
  res.write("send response!");
  res.end();
});
```

## 二、服务器数据响应类型处理

```js
//3.监听请求事件
app.on("request", async (req, res) => {
  //1.纯文本类型响应
  res.setHeader("Content-type", "text/plain;charset=utf-8");
  res.write("你好！");

  //2.html文本类型响应
  res.setHeader("Content-type", "text/html;charset=utf-8");
  res.write("<h1>你好！</h1>");

  //3.html文件类型响应
  const result = await fs.readFile("./index.html", "utf-8");
  res.write(result);

  res.end();
});
```

## 三、处理客户端不同的请求类型

```js
import url from "url";
//3.监听请求事件
app.on("request", async (req, res) => {
  if (req.method === "GET") {
    console.log(url.parse(req.url, true).query.id);
    const result = await fs.readFile("./index.html", "utf-8");
    res.write(result);
  } else if (req.method === "POST") {
    // do somethings
  }
  res.end();
});
```

## 四、获取客户端POST请求数据

```js
//3.监听请求事件
app.on("request", async (req, res) => {
  if (req.method === "GET") {
    console.log(url.parse(req.url, true).query.id);
    const result = await fs.readFile("./index.html", "utf-8");
    res.write(result);
  } else if (req.method === "POST") {
    // do somethings
    let result = "";
    req.on("data", (data) => {
      result += data;
    });
    req.on("end", () => {
      //querystring解析chunk流
      console.log(querystring.parse(result));
    });
  }
  res.end();
});
```
