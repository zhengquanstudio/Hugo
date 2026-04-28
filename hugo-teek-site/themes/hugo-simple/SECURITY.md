# 安全配置指南

## Content Security Policy (CSP)

### Meta 标签 vs HTTP 响应头

主题在 HTML 中通过 `<meta>` 标签设置了基础 CSP，但某些指令**只能通过 HTTP 响应头**设置：

- ❌ **Meta 标签不支持**: `frame-ancestors`, `report-uri`, `sandbox`
- ✅ **Meta 标签支持**: `default-src`, `script-src`, `style-src`, `img-src` 等

### 当前配置

#### HTML Meta 标签（已配置）

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://img.xxdevops.cn data:;
  font-src 'self' data:;
  connect-src 'self';
  base-uri 'self';
  form-action 'self';
">
<meta http-equiv="X-Frame-Options" content="DENY">
```

#### HTTP 响应头（需要配置）

为了获得完整的安全保护，建议在服务器级别添加以下响应头：

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://img.xxdevops.cn data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## 托管平台配置

### 1. Netlify

#### 方法一：`_headers` 文件

在 `static/_headers` 创建文件：

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://img.xxdevops.cn data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

#### 方法二：`netlify.toml`

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://img.xxdevops.cn data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

### 2. Cloudflare Pages

在 `static/_headers` 创建文件（同 Netlify 方法一）。

### 3. Vercel

在项目根目录创建 `vercel.json`：

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://img.xxdevops.cn data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        }
      ]
    }
  ]
}
```

### 4. GitHub Pages

**注意**: GitHub Pages 不支持自定义 HTTP 响应头。考虑使用：
- Cloudflare CDN 代理（可添加响应头）
- 切换到 Netlify/Vercel

### 5. Nginx

在 `nginx.conf` 或站点配置文件中：

```nginx
server {
    # ... 其他配置

    location / {
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://img.xxdevops.cn data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

        try_files $uri $uri/ =404;
    }
}
```

### 6. Apache

在 `.htaccess` 文件中：

```apache
<IfModule mod_headers.c>
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://img.xxdevops.cn data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>
```

## CSP 指令说明

### 基础指令

| 指令 | 作用 | 当前设置 |
|------|------|----------|
| `default-src` | 默认策略 | `'self'` - 只允许同源 |
| `script-src` | JavaScript 来源 | `'self' 'unsafe-inline'` - 同源 + 内联 |
| `style-src` | CSS 来源 | `'self' 'unsafe-inline'` - 同源 + 内联 |
| `img-src` | 图片来源 | `'self' https://img.xxdevops.cn data:` |
| `font-src` | 字体来源 | `'self' data:` |
| `connect-src` | AJAX/WebSocket | `'self'` |
| `base-uri` | `<base>` 标签 | `'self'` |
| `form-action` | 表单提交 | `'self'` |
| `frame-ancestors` | 嵌入限制 | `'none'` - 禁止被嵌入 |

### 自定义 CDN

如果使用其他 CDN，需要修改 `img-src`：

```
img-src 'self' https://your-cdn.com data:;
```

如果需要加载外部字体：

```
font-src 'self' https://fonts.gstatic.com data:;
```

### 移除 `unsafe-inline`（推荐）

当前配置使用了 `'unsafe-inline'`，这会降低安全性。如果可能，应该：

1. **提取内联脚本到外部文件**
2. **使用 nonce 或 hash**

#### 使用 Nonce（推荐）

Hugo 配置：

```html
{{ $nonce := randomString 32 }}
<meta http-equiv="Content-Security-Policy" content="script-src 'self' 'nonce-{{ $nonce }}';">
<script nonce="{{ $nonce }}">
  // 你的脚本
</script>
```

#### 使用 Hash

计算脚本的 SHA-256 哈希：

```bash
echo -n "your script content" | openssl dgst -sha256 -binary | base64
```

然后：

```html
<meta http-equiv="Content-Security-Policy" content="script-src 'self' 'sha256-HASH';">
```

## 验证配置

### 在线工具

- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) - Google CSP 评估工具
- [Security Headers](https://securityheaders.com/) - 检查响应头配置

### 浏览器测试

1. 打开网站
2. 打开 Chrome DevTools Console
3. 检查是否有 CSP 违规警告

### 命令行测试

```bash
# 检查响应头
curl -I https://your-site.com

# 查看 CSP
curl -I https://your-site.com | grep -i content-security
```

## 常见问题

### Q: 为什么需要 `'unsafe-inline'`？

A: 主题使用了内联 JavaScript（懒加载脚本）。未来版本将提取到外部文件。

### Q: 如何添加更多 CDN？

A: 在对应指令后添加域名，例如：
```
img-src 'self' https://img.xxdevops.cn https://cdn2.example.com data:;
```

### Q: 配置后网站出现问题？

A:
1. 检查浏览器 Console 是否有 CSP 违规
2. 根据违规信息调整策略
3. 使用 `Content-Security-Policy-Report-Only` 测试

### Q: GitHub Pages 无法配置响应头？

A: 使用 Cloudflare CDN 代理，在 Cloudflare 设置响应头转换规则。

## 安全最佳实践

1. ✅ 定期更新 CSP 策略
2. ✅ 监控 CSP 违规报告
3. ✅ 使用 HTTPS
4. ✅ 启用 HSTS（HTTP Strict Transport Security）
5. ✅ 定期进行安全审计

## 更多资源

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP: CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [CSP Guide](https://content-security-policy.com/)

---

**最后更新**: 2025-11-26
**主题版本**: hugo-simple v1.0
