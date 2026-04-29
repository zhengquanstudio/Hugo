---
coverImg: https://mu.baimu.live/img/mn/
date: 2025-03-03T10:00:00+08:00
description: 关于本站的基本信息、运行状态和最新动态
draft: false
title: 关于本站
slug: about-site
type: about-site
url: /about/website/
layout: single

# ⚠️ 请注意！修改以下内容，保存后需要重启项目才能生效
# 页面来源于 hugo-teek-site\themes\hugo-teek\layouts\about-site\single.html
# 需要自己DIY或者新增模块，可到single.html中自行修改代码

aboutSite:
  # 🌐 站点基本信息
  siteInfo:
    # 网站名称
    name: "余温Gueen"
    # 网站描述
    description: "余温Gueen的技术博客，专注于Linux运维、容器编排、前端开发、编程语言等技术分享，记录技术成长之路"
    # 当前主题名称
    theme: "Hugo Teek"
    # 归属人/博主名称
    owner: "余温Gueen"
    # 博主身份/角色描述
    role: "独立开发者、博主"
    # 博主座右铭/个性签名
    motto: "保持热爱，奔赴山海"
    # 站点启动日期（用于计算运行时长）
    startDate: "2025-10-28"
    # 访问主页链接
    homeLink: "https://wiki.xxdevops.cn/"

  # 📊 站点统计配置
  stats:
    # 是否显示运行时长
    showUptime: true
    # 是否显示文章数量
    showPostCount: true
    # 是否显示分类数量
    showCategoryCount: false
    # 是否显示标签数量
    showTagCount: false

  # 📝 最近文档配置
  recentDocs:
    # 是否启用
    enabled: true
    # 标题
    title: "📚 最近文档"
    # 显示数量
    count: 6
    # 显示摘要字数
    summaryLength: 80

  # 💬 最新评论配置
  recentComments:
    # 是否启用
    enabled: true
    # 标题
    title: "💬 最新评论"
    # 显示数量
    count: 5

  # 📊 站点状态监控配置
  status:
    # 是否启用
    enabled: true
    # 标题
    title: "📊 站点状态"
    # 状态页面链接
    url: "https://status.xxdevops.cn/status/dashboard"
    # 显示的服务列表
    services:
      - name: "余温博客站"
        status: "normal"
        uptime: "99.72%"
      - name: "余温umami"
        status: "normal"
        uptime: "100%"
      - name: "余温图集服务"
        status: "normal"
        uptime: "99.86%"
      - name: "余温的评论组件"
        status: "error"
        uptime: "0%"

  # 📈 Umami 站点统计配置
  umami:
    # 是否启用
    enabled: true
    # 标题
    title: "📈 站点统计"
    # Umami 分享链接
    shareUrl: "https://umami.xxdevops.cn/share/qccg5h22ZNjycizb/xxdevops.cn"
    # API 地址（用于获取数据）
    apiUrl: "https://umami.xxdevops.cn/api/share/qccg5h22ZNjycizb"
    # 显示的数据项
    metrics:
      - key: "pageviews"
        label: "总浏览量"
        icon: "👁️"
      - key: "visitors"
        label: "独立访客"
        icon: "👤"
      - key: "visits"
        label: "访问次数"
        icon: "🔄"
      - key: "bounce_rate"
        label: "跳出率"
        icon: "📊"
    # 地图配置
    map:
      enabled: true
      title: "🌍 全球访问分布"

  # 🎯 站点使命配置
  mission:
    # 是否启用
    enabled: true
    # 标题
    title: "🎯 站点使命"
    # 内容
    content: "本站致力于分享【技术干货】与【实践经验】，涵盖 Linux 运维、容器化部署、前端开发等多个领域。希望每一篇文章都能为你带来价值，让技术学习之路不再孤单。"

  # 🛠️ 技术栈配置
  techStack:
    # 是否启用
    enabled: true
    # 标题
    title: "🛠️ 技术栈"
    # 技术项列表
    items:
      - name: "静态站点生成器"
        value: "Hugo"
        color: "purple"
      - name: "主题"
        value: "Hugo Teek"
        color: "blue"
      - name: "部署平台"
        value: "Cloudflare Pages"
        color: "green"
      - name: "评论系统"
        value: "Twikoo"
        color: "orange"

  # 📮 联系方式配置
  contact:
    # 是否启用
    enabled: true
    # 标题
    title: "📮 联系方式"
    # 描述文本
    desc: "如有任何问题或建议，欢迎通过以下方式联系："
    # 联系链接列表
    links:
      - icon: "🌐"
        text: "个人主页"
        url: "https://wiki.xxdevops.cn/"
        openInNewTab: true
      - icon: "💬"
        text: "评论区留言"
        url: "#comments"
        openInNewTab: false
      - icon: "📧"
        text: "邮件联系"
        url: "mailto:admin@xxdevops.cn"
        openInNewTab: false

  # 🙏 致谢配置
  thanks:
    desc: "感谢打赏的人，因为你们，让我感受到创造博客这件事情能够给你们带来便利"
    buttonText: "☕ 投喂作者"

  # 💭 评论配置
  comments:
    enabled: true
---

<!-- 🥳 关于本站页面内容区域 -->
<!-- 💕 以下内容会渲染在页面中 -->

