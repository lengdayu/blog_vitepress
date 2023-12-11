# node实现自定义命令行工具

## 初始化 `cli` 项目

1. 在项目根目录下执行 `npm init` 命令，创建 `package.json` 文件

2. 在项目根目录下创建 `bin` 文件夹，内部创建 `index.js` 文件

3. 在`package.json` 文件中添加如下配置：
   
   ```js
   "bin": {
       "lengdayu": "bin/cli.mjs"
     },
   ```

4. 在 `bin/index.js` 中添加如下代码：
   
   ```js
   // 告诉操作系统用 Node 来运行此文件
   #!/usr/bin/env node 
   ```

5. 在项目根目录下执行 `npm link` 命令，将当前 `cli` 挂载到全局中，此后，在任意命令行窗口执行 `mycli` 命令，即可打开该 `cli` ，并执行其中代码

6. `npm unlink 包名 -g` 取消全局挂载

## commander部分

```js
import myAction from "./action.mjs";

const myCommander = function (program) {
  program
    //command 参数1代表指令 参数2代表参数 参数3代表其他所有的参数的数组
    .command("changeRegistry")
    //alias 代表指令别名， 就像--help 的别名 -h
    .alias("cRegistry")
    //description代表问题描述
    .description("切换你需要的npm源镜像地址")
    //action代指操作，后续的执行的逻辑都在这里
    .action(myAction);
};

export default myCommander;
```

## action部分

```js
import inquirer from "inquirer";
import chalk from "chalk";
import { exec } from "child_process";

const registryList = {
  npm: "https://registry.npmjs.org",
  cnpm: "http://r.cnpmjs.org",
  taobao: "https://registry.npm.taobao.org",
  nj: "https://registry.nodejitsu.com",
  npmMirror: "https://skimdb.npmjs.com/registry",
  edunpm: "http://registry.enpmjs.org",
};

const myAction = async (project, args) => {
  let choices = [];
  for (const key in registryList) {
    if (Object.hasOwnProperty.call(registryList, key)) {
      choices.push(key);
    }
  }
  const answer = await inquirer.prompt([
    {
      type: "list",
      name: "choose",
      choices,
      message: "请选择下面列表中的npm镜像地址!",
    },
  ]);
  changeR(answer.choose, registryList[answer.choose]);
};

const changeR = async (choose, registry) => {
  console.log(chalk.green(`开始切换 ${choose} 镜像地址`));
  await new Promise((resolve, reject) => {
    exec(`npm config set registry ${registry}`, (error, stdout, stderr) => {
      if (error) {
        reject(console.error(chalk.red(err)));
      }
      resolve({ stdout, stderr });
    });
  });
  console.log(chalk.green(`${choose} 镜像地址切换完成！`));
};

export default myAction;
```

完整代码 `npm i lengdayu`
