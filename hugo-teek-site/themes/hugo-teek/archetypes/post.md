---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
lastmod: {{ .Date }}
draft: false
author: "{{ .Site.Params.author.name }}"
categories:
  - "{{ path.Dir .File.Path | path.Base }}"
tags: []
coverImg: ""
slug: ""
description: ""
weight: 0
---

## 内容开始

在这里编写你的博客内容...
