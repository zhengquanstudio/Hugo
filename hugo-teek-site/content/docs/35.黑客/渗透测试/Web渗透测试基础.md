---
author: 余温Gueen
categories:
    - 黑客
coverImg: https://img.xxdevops.cn/blog/wallpaper/bg11.webp
date: "2025-10-17T13:00:00+08:00"
description: Web 应用安全测试的基本方法和常用工具介绍
draft: false
tags:
    - 渗透测试
    - Web安全
    - 网络安全
    - 漏洞挖掘
title: Web 渗透测试基础入门
url: /hacker/ckhhh
---
## 什么是渗透测试？

渗透测试（Penetration Testing）是一种模拟黑客攻击的安全评估方法，用于发现系统中的安全漏洞。

> **免责声明**：本文内容仅用于合法的安全测试和学习目的，请勿用于非法活动。

## 常见 Web 漏洞类型

### SQL 注入

```sql
-- 不安全的查询
SELECT * FROM users WHERE username = '$username' AND password = '$password'

-- 注入payload
username: admin' OR '1'='1
password: anything
```

### XSS 跨站脚本

```html
<!-- 反射型 XSS -->
<script>alert(document.cookie)</script>

<!-- 存储型 XSS -->
<img src=x onerror="alert('XSS')">
```

### CSRF 跨站请求伪造

```html
<!-- 恶意页面 -->
<form action="https://victim.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker">
  <input type="hidden" name="amount" value="1000">
</form>
<script>document.forms[0].submit();</script>
```

## 常用渗透测试工具

### Burp Suite

```bash
# 配置浏览器代理
Proxy: 127.0.0.1:8080

# 常用功能
- Proxy: 拦截和修改请求
- Repeater: 重放请求
- Intruder: 自动化攻击
- Scanner: 漏洞扫描
```

### OWASP ZAP

```bash
# 启动 ZAP
zap.sh -daemon -port 8080

# 扫描目标
zap-cli quick-scan http://example.com
```

### Nmap 端口扫描

```bash
# 扫描开放端口
nmap -sV -sC target.com

# 操作系统检测
nmap -O target.com

# 漏洞扫描
nmap --script vuln target.com
```

## 渗透测试流程

1. **信息收集** - 收集目标信息
2. **漏洞扫描** - 发现潜在漏洞
3. **漏洞利用** - 验证漏洞可行性
4. **权限提升** - 获取更高权限
5. **报告编写** - 记录发现和建议

## 防御措施

### 输入验证

```python
import re

def validate_input(user_input):
    # 白名单验证
    pattern = r'^[a-zA-Z0-9_-]+$'
    if not re.match(pattern, user_input):
        raise ValueError("Invalid input")
    return user_input
```

### 参数化查询

```python
# 使用参数化查询防止 SQL 注入
cursor.execute("SELECT * FROM users WHERE username = ? AND password = ?",
               (username, password))
```

### CSRF Token

```html
<!-- 添加 CSRF Token -->
<form method="POST">
  <input type="hidden" name="csrf_token" value="{{ csrf_token }}">
  <!-- 其他表单字段 -->
</form>
```

## 学习资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [HackTheBox](https://www.hackthebox.com/)
- [TryHackMe](https://tryhackme.com/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)

## 总结

Web 渗透测试是一个持续学习的过程。掌握基础知识后，需要不断实践和更新技能。
