---
author: 余温Gueen
categories:
    - 运维
coverImg: https://img.xxdevops.cn/blog/article_cover/docker-orchestration.webp
date: "2025-10-17T10:00:00+08:00"
description: 深入讲解 Docker Compose 和 Docker Swarm 的容器编排技术，帮助你轻松管理多容器应用
draft: false
tags:
    - Docker
    - 容器编排
    - Docker Compose
    - 微服务
title: Docker 容器编排实战指南
url: /linux/hsgkh
---
## 简介

容器编排是现代云原生应用的核心技术之一。本文将介绍如何使用 Docker Compose 和 Docker Swarm 进行容器编排。

## Docker Compose 快速入门

Docker Compose 是用于定义和运行多容器 Docker 应用程序的工具。

### 基本配置

```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    networks:
      - app-network

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: myapp
    volumes:
      - db-data:/var/lib/mysql
    networks:
      - app-network

volumes:
  db-data:

networks:
  app-network:
    driver: bridge
```

### 常用命令

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## Docker Swarm 集群编排

Docker Swarm 是 Docker 官方的集群管理和编排工具。

### 初始化 Swarm

```bash
# 初始化 Swarm 集群
docker swarm init --advertise-addr <MANAGER-IP>

# 加入工作节点
docker swarm join --token <TOKEN> <MANAGER-IP>:2377
```

### 部署服务

```bash
# 部署服务
docker service create \
  --name web \
  --replicas 3 \
  --publish 80:80 \
  nginx:latest

# 更新服务
docker service update --image nginx:alpine web

# 扩缩容
docker service scale web=5
```

## 最佳实践

1. **使用健康检查** - 确保容器正常运行
2. **资源限制** - 防止容器占用过多资源
3. **日志管理** - 集中化日志收集
4. **网络隔离** - 使用自定义网络隔离服务

## 总结

掌握容器编排技术对于现代应用部署至关重要。选择合适的编排工具能够大大提高运维效率。
