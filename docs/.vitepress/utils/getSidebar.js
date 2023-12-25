const fs = require("fs");
const path = require("path");

//定义读取的源目录路径
const markdownDir = path.join(process.cwd(), "/docs");
//定义递归读取目录中不需要的文件
const exIncludes = [".vitepress", "index.md", "public"];

//定义一个递归读取目录文件的方法
const getAllFiles = (markdownDir, sidebar, fatherDirName) => {
  //读取当前目录下所有的文件,并过滤
  const files = fs
    .readdirSync(markdownDir)
    .filter((file) => !exIncludes.includes(file));
  // 遍历files
  files.forEach((file, index) => {
    //判断是否为目录，如果是，则递归调用
    if (fs.lstatSync(`${markdownDir}\\${file}`).isFile()) {
      sidebar.push({
        text: file.split(".md")[0],
        link: `${fatherDirName}/${file.split(".md")[0]}`,
      });
    } else {
      sidebar.push({ text: file.split(".md")[0], items: [] });
      let currentLink =
        fatherDirName === "/"
          ? `/${file.split(".md")[0]}`
          : `${fatherDirName}/${file.split(".md")[0]}`;
      //是目录，则递归调用
      getAllFiles(`${markdownDir}\\${file}`, sidebar[index].items, currentLink);
    }
  });
  //返回的侧边栏对象
  return sidebar;
};

let res = getAllFiles(markdownDir, [], "/");
let my_sidebar = {};
res.map((item) => {
  let my_sidebar_key = `/${item.text}/`;
  my_sidebar[my_sidebar_key] = [];
  my_sidebar[my_sidebar_key].push(item);
});

export default my_sidebar;
