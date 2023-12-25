# chrome 获取客户端 ip

## 前端获取

内网 IP 的获取相对比较复杂，主要是需要依赖 webRTC 这么一个非常用的 API

WebRTC，名称源自网页即时通信（英语：Web Real-Time Communication）的缩写，是一个支持网页浏览器进行实时语音对话或视频对话的 API。它于 2011 年 6 月 1 日开源并在 Google、Mozilla、Opera 支持下被纳入万维网联盟的 W3C 推荐标准。

webRTC 是 HTML5 的一个扩展，允许去获取当前客户端的 IP 地址，可以查看当前网址：net.ipcalf.com/

但如果使用 chrome 浏览器打开，此时可能会看到一串类似于：e87e041d-15e1-4662-adad-7a6601fca9fb.local 的机器码，这是因为 chrome 默认是隐藏掉内网 IP 地址的，可以通过修改 chrome 浏览器的配置更改此行为：

- 1、在 chrome 浏览器地址栏中输入：chrome://flags/

- 2、搜索 #enable-webrtc-hide-local-ips-with-mdns 该配置 并将属性改为 disabled

- 3、点击 relaunch 浏览器即可查看到本机的内网 IP 地址

```js
let getIP = new Promise((resolve, reject) => {
  let recode = {};
  let RTCPeerConnection =
    window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection;
  // 如果不存在则使用一个iframe绕过
  if (!RTCPeerConnection) {
    // 因为这里用到了iframe，所以在调用这个方法的script上必须有一个iframe标签
    // <iframe id="iframe" sandbox="allow-same-origin" style="display:none;"></iframe>
    let win = iframe.contentWindow;
    RTCPeerConnection =
      win.RTCPeerConnection ||
      win.mozRTCPeerConnection ||
      win.webkitRTCPeerConnection;
  }

  //创建实例，生成连接
  let pc = new RTCPeerConnection();

  // 匹配字符串中符合ip地址的字段
  function handleCandidate(candidate) {
    let ip_regexp =
      /([0-9]{1,3}(\.[0-9]{1,3}){3}|([a-f0-9]{1,4}((:[a-f0-9]{1,4}){7}|:+[a-f0-9]{1,4}){6}))/;
    let ip_isMatch = candidate.match(ip_regexp)[1];
    if (!recode[ip_isMatch]) {
      resolve(ip_isMatch);
      recode[ip_isMatch] = true;
    }
  }

  //监听icecandidate事件
  pc.onicecandidate = (ice) => {
    if (ice.candidate) {
      handleCandidate(ice.candidate.candidate);
    }
  };
  //建立一个伪数据的通道
  pc.createDataChannel("");
  pc.createOffer(
    (res) => {
      pc.setLocalDescription(res);
    },
    () => {}
  );

  //延迟，让一切都能完成
  setTimeout(() => {
    let lines = pc.localDescription.sdp.split("\n");
    lines.forEach((item) => {
      if (item.indexOf("a=candidate:") === 0) {
        handleCandidate(item);
      }
    });
  }, 1000);
});
```

调用:

```csharp
 getIP.then((res) => {
    console.log(res); // ip地址
 })
```

注意：记得一定要确保用户的浏览器要经过第一步的设置，不然可能就无法拿到了，且该方法只测试了谷歌浏览器

## 后台解决方法

nginx 配置修改

```bash
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

[转载](https://www.jianshu.com/p/7ec601f9c02a)
