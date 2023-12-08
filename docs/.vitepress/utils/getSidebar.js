const fs = require("fs");
const path = require("path");

//定义读取的源目录路径
const markdownDir = path.join(process.cwd(), "/docs");
//定义递归读取目录中不需要的文件
const exIncludes = [".vitepress", "index.md", "public"];
//定义最总返回的侧边栏对象
let sidebar = {};

//定义一个递归读取目录文件的方法
const getAllFiles = (markdownDir, sidebar, fatherDir) => {
  //读取当前目录下所有的文件,并过滤
  const files = fs
    .readdirSync(markdownDir)
    .filter((file) => !exIncludes.includes(file));
  //遍历files，判断成员是否为文件夹
  sidebar.text = fatherDir;
  console.log(sidebar.text);
  sidebar.link = fatherDir === "" ? fatherDir : `/${fatherDir}`;
  sidebar.items = [];
  files.forEach((file) => {
    let item = {};
    item.text = file;
    item.link =
      fatherDir === ""
        ? `${fatherDir}/${file.split(".md")[0]}`
        : `/${fatherDir}/${file.split(".md")[0]}`;
    //如果是文件夹，则递归遍历
    if (!fs.lstatSync(`${markdownDir}\\${file}`).isFile()) {
      //递归遍历下级目录
      const nextFiles = fs
        .readdirSync(`${markdownDir}\\${file}`)
        .filter((file) => !exIncludes.includes(file));
      item.text = file;
      if (nextFiles.length > 0) {
        item.items = [];
        item.items.push(file);
        getAllFiles(
          `${markdownDir}\\${file}`,
          item,
          fatherDir === ""
            ? `${file.split(".md")[0]}`
            : `${fatherDir}/${file.split(".md")[0]}`
        );
      }
    }
    sidebar.items.push(item);
  });
  return sidebar;
};
let res = getAllFiles(markdownDir, {}, "");
let backResult = {};
res.items.map((item) => {
  let backResult_key = `/${item.text}/`;
  backResult[backResult_key] = [];
  backResult[backResult_key].push(item);
});
console.log(backResult["/GoLang/"][0].items);
export default backResult;
