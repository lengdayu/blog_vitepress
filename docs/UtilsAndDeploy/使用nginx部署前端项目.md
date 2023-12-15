## 1.安装 nginx

#### 直接安装报错复现

```bash
 yum -y install nginx
```

## 2.启动 Nginx

**Nginx 安装完成后，启动 Nginx 服务**

```bash
 systemctl start nginx      #启动服务
 systemctl enable nginx     #设置开机自启
 systemctl status nginx      #查看启动状态
```

## 3.配置 Nginx

**由于 Nginx 默认配置文件并不适合我们的需求，我们需要对其进行修改。您可以按照下面的步骤操作：**

**备份默认配置文件：**

```bash
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak
```

使用文本编辑器打开新的配置文件  `/etc/nginx/nginx.conf`，并将其修改为以下内容：

```yaml
user  nginx;
worker_processes  auto;
worker_rlimit_nofile 8192;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    access_log  /var/log/nginx/access.log;
    error_log   /var/log/nginx/error.log;

    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;

    #gzip  on;

    server {
        listen       80;
        server_name  localhost;
        root         /usr/share/nginx/html;

        # Load configuration files for the default server block.
        include /etc/nginx/default.d/*.conf;
        charset utf-8;

        location / {
        }

        error_page 404 /404.html;
            location = /40x.html {
        }

        error_page 500 502 503 504 /50x.html;
            location = /50x.html {
        }
    }
}
```

**上述配置文件将**Nginx 运行的用户来指定为 nginx，同时为每个 CPU 核心配置一个 worker 进程，在“http”部分添加了一些基础配置，为 Nginx 添加了默认的 www 根目录和默认的网站，以及配置了几个常见的错误页面

## 4.重启 Nginx

```bash
systemctl restart nginx
```

现在，您已经成功地安装和配置了 Nginx。您可以通过打开服务器的 IP 地址或域名，以 HTTP 协议访问服务器进行测试

## 5.配置自己网页

### 5.1 创建网站根目录

**在服务器上创建一个新的目录来存放您的网站文件。例如，您可以在 /var/www/目录中创建一个名为 mysite 的新目录：**

```bash
 mkdir -p /var/www/dist
```

### 5.2 添加网站文件

可使用 ftp 工具，也可以自己创建一个 html

### 5.3 配置 Nginx

```bash
vim /etc/nginx/nginx.conf
```

```yaml
server {
        listen 8888; #配置端口
        listen [::]:8888;

        server_name 192.168.6.100; #修改为您的域名

        root /var/www/mysite; #必须在这个层里面有自己的index.html首页
        index index.html;
        charset utf-8;

        location / {
                try_files $uri $uri/ =404;
        }
}
```

在 Nginx 配置文件中的 server 块中，经常会看到两个 listen 语句，看起来会有点奇怪：

```yaml
server {
listen 80;
listen [::]:80;
---
}
```

其中，`listen 80;`  表示将监听服务器的端口 80，而  `listen [::]:80;`  则是 IPv6 地址的监听器，同时监听端口 80

这种方式可以确保您的网站可以通过 IPv4 和 IPv6 连接进行访问。例如，如果您使用的是第一个 listen 语句，那么只能使用 IPv4 地址连接到您的网站（例如，192.0.2.1），而如果您的服务器支持 IPv6，则使用 [::ffff:192.0.2.1] 进行 IPv4 转换。而如果您将其更改为仅使用 IPv6，那么仅支持 IPv6 的浏览器将无法访问您的网站。

因此，为了使您的网站能够通过 IPv4 和 IPv6 访问，最好同时使用  `listen 80;`  和  `listen [::]:80;`。如果您认为您的网站仅需要通过一个协议进行访问，请仅使用相应的  `listen`  语句。

**上述配置文件指定了一个新的虚拟主机，其中“server_name”指定为您要托管的网站的名称，例如“192.168.6.100”，“root”指定为您创建的网站根目录，例如“/var/www/mysite”，并且“index”指定为默认的网站文件名。**

**请注意，其余配置文件的内容将保持不变，您无需更改默认配置文件就可以进行启动和访问**

### 5.4 测试 Nginx 配置

```bash
nginx -t
```

测试成功以后，直接访问 nginx 配置的端口即可。
