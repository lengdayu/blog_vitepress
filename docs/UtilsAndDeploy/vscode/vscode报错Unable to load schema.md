# vscode 报错 Unable to load schema

Package.json 报错：Unable to load schema from 'http://json.schemastore.org/package': Bad request. The request cannot be fulfilled due to bad syntax. Invalid header received from client. .

文件-首选项-设置-应用程序 - proxy Authorization：

<img title="" src="../public/UtilsAndDeploy/20231215143438.png" alt="" data-align="left">

点击 settings.json,在其中添加

```json
"http.proxyAuthorization": "false"
```

[转载](https://www.imqianduan.com/javascript/530.html)
