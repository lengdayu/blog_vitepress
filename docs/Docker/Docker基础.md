# Docker基础

## 一、镜像的获取、查看及删除

- 搜索镜像 `docker search image_name`
  
  - 是否为官方镜像 `docker search --filter "is-official=true" image_name`
  
  - 是否是自动化构建 `docker serch --filter "is-automated=true image_name"`

- 下载镜像 `docker pull image_name`

- 本地镜像查看 `docker images`

- 本地镜像删除 `docker rmi image_name`

## 二、容器的基础操作

- 创建容器 `docker run -itd --name=container_name image_name`
  
  - `-i` 表示以交互模式运行容器
  
  - `-d` 表示后台运行容器，并返回容器id
  
  - `-t` 为容器重新分配一个伪输入终端
  
  - `-name` 为容器制定名称

- 查看容器（运行中）`docker ps `

- 查看容器（包括停止）`docker ps -a`

- 停止容器 `docker stop container_name/container_id`

- 启动容器 `docker start container_name/container_id`

- 重启容器 `docker restart container_name/container_id`

- 删除容器(停止的容器) `docker rm container_name/container_id`

## 三、容器的修改和保存

- 进入容器 `docker exec -it container_name/container_id /bin/bash`

- 退出容器 `exit`

- 提交修改 `docker commit -a "author -m "message" container_id new_image_name:tag_name`
  
   *参数说明*
  
  `-a` 参数可选，用于指定作者，可以写自己名字
  
  `-m` 参数可选，提交信息，修改说明
  
  `container_id` 被修改容器ID
  
  `new_amge_name` 新镜像的名字，可自定义
  
  `tag_name` 新镜像的标签，不写，默认latest

## 四、容器的进阶操作

- 端口映射

-----------------------------------------------------------------------

|                 -------------------                                                   宿主机       |

|               |        容器       |                                                                    |

80<------->80                    |                                                                    |

|                |                      |                                                                    |

|                  ------------------                                                                      |

---

`docker run -itd -p  宿主机端口号：容器端口号`

- 文件挂载
  
  `docker run -itd -v /宿主机/文件目录：/容器/目录`

- 将容器文件复制到本地
  
  `docker cp 容器名：/容器目录/文件名 /宿主机目录/文件名 `

- 将本地文件复制到容器
  
  `docker cp /宿主机目录/文件名  容器名：/容器目录/文件名`

- 容器互联
  
  `docker run -itd --link 要关联的容器名：容器在被关联的容器中的别名`

**修改mysql密码**

`ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '123456'`
