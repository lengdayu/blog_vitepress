const fs = require("fs");
const path = require("path");

// 指定Markdown源路径
const markdownDir = path.join(process.cwd(), "/docs");
// markdown下不读取的文件目录名称
const exIncludes = [".vitepress", "index.md", "public"];
let sidebar = {};

// 获取Markdown所有分类的文件夹
const fileLists = fs.readdirSync(markdownDir);

// 获取每个分类下的所有md文件
fileLists.forEach((item) => {
  //过滤掉非目录的成员
  if (!exIncludes.includes(item)) {
    let obj = {};
    obj.text = item;
    //读取当前成员目录下的所有文件
    const files = fs.readdirSync(path.join(markdownDir, item));
    //如果目录下有文件
    if (files.length > 0) {
      obj.items = [];
      files.map((secItem) => {
        secItem !== "index.md" &&
          obj.items.push({
            text: secItem,
            link: `/${item}/${secItem}`,
          });
      });
    } else {
      obj.link = `/${item}`;
    }
    let key = `/${item}/`;
    sidebar[key] = [];
    sidebar[key].push(obj);
  }
});
module.exports = { sidebar };
