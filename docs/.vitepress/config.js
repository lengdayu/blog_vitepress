import my_sidebar from "./utils/getSidebar.js";

module.exports = {
  //网站的标题。 类型：string
  title: "冷大宇不会飞",
  //允许自定义每个页面的标题后缀或整个标题 类型：string | boolean
  titleTemplate: false,
  //网站的描述。这将呈现为<meta>页面 HTML 中的标签。 类型：string
  description: "随便写写",
  cleanUrls: true, //When set to true, VitePress will remove the trailing .html from URLs.
  lastUpdated: true,
  themeConfig: {
    siteTitle: "立即行动", //网站标题
    logo: { light: "/logo.png", dark: "/logo.png" }, //徽标  亮/暗模式设置不同的模块
    nav: [
      { text: "CSS", link: "/CSS/" },
      { text: "JavaScript", link: "/JavaScript/" },
      { text: "Node", link: "/Node/" },
      { text: "Vue", link: "/Vue/" },
      { text: "React", link: "/React/" },
      { text: "GoLang", link: "/GoLang/" },
      { text: "Docker", link: "/Docker/" },
      { text: "PackageAndDeploy", link: "/PackageAndDeploy/" },
    ],
    sidebar: my_sidebar,
    lastUpdated: {
      text: "Updated at",
      formatOptions: {
        dateStyle: "full",
        timeStyle: "medium",
      },
    },
    search: {
      provider: "local",
    },
  },
};
