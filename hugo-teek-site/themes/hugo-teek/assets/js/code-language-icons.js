/* 🔤 代码语言图标映射配置 */
/* 定义各种编程语言对应的官方SVG图标，用于代码块头部显示
/* 白木开发 🔗https://gl.baimu.live/ 
*/

(function() {
  'use strict';

  /* 🎨 语言图标 SVG 数据 - 使用官方品牌图标 */
  const languageIcons = {
    /* 📄 Markdown - 官方图标 - 与JS同风格，黑色背景白色字母 */
    md: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3" fill="#000000"/><text x="12" y="17" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">MD</text></svg>`,
    markdown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3" fill="#000000"/><text x="12" y="17" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">MD</text></svg>`,

    /* 🟢 Vue - 官方图标 */
    vue: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#42b883" d="M2 3h3.5L12 14.75 18.5 3H22L12 21 2 3m6.5 0H12l6.5 11.25V3H15l-3 5.25L9 3H6.5v11.25L2 3h4.5z"/></svg>`,

    /* 🔵 CSS - 官方图标 */
    css: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#264de4" d="M5 3l-.65 3.34h13.59L17.5 8.5H3.92l-.66 3.33h13.59l-.76 3.81-5.48 1.81-4.75-1.81.33-1.64H2.85l-.79 4 7.85 3 9.05-3 1.2-6.03.24-1.21L21.94 3z"/></svg>`,

    /* 🩷 SCSS/Sass - 官方图标 */
    scss: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#cf649a" d="M5 3l-.65 3.34h13.59L17.5 8.5H3.92l-.66 3.33h13.59l-.76 3.81-5.48 1.81-4.75-1.81.33-1.64H2.85l-.79 4 7.85 3 9.05-3 1.2-6.03.24-1.21L21.94 3z"/></svg>`,
    sass: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#cf649a" d="M5 3l-.65 3.34h13.59L17.5 8.5H3.92l-.66 3.33h13.59l-.76 3.81-5.48 1.81-4.75-1.81.33-1.64H2.85l-.79 4 7.85 3 9.05-3 1.2-6.03.24-1.21L21.94 3z"/></svg>`,

    /* 🔷 TypeScript - 官方图标 - 与JS同风格，蓝色背景白色字母 */
    ts: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3" fill="#3178c6"/><text x="12" y="17" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">TS</text></svg>`,
    typescript: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3" fill="#3178c6"/><text x="12" y="17" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">TS</text></svg>`,

    /* 🟡 JavaScript - 官方图标 - 优化版本带深色背景 */
    js: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3" fill="#323330"/><path fill="#f7df1e" d="M4 4h16v16H4V4zm3.73 11.04c.4.85 1.19 1.55 2.54 1.55 1.5 0 2.53-.8 2.53-2.55v-5.78h-1.7v5.77c0 .86-.35 1.31-1.05 1.31-.61 0-.98-.27-1.38-.93l-1.94 1.63zm5.58.03c.5.98 1.51 1.55 3.13 1.55 1.93 0 3.17-1.03 3.17-2.75 0-1.8-1.19-2.38-3.08-2.93-1.13-.33-1.52-.66-1.52-1.22 0-.48.36-.88 1.08-.88.66 0 1.11.28 1.46.93l1.36-.98c-.54-.98-1.26-1.36-2.82-1.36-1.78 0-2.95 1.02-2.95 2.62 0 1.66 1.05 2.27 2.92 2.82 1.13.33 1.63.7 1.63 1.36 0 .57-.5 1.02-1.44 1.02-.96 0-1.53-.42-1.93-1.13l-1.41.97z"/></svg>`,
    javascript: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3" fill="#323330"/><path fill="#f7df1e" d="M4 4h16v16H4V4zm3.73 11.04c.4.85 1.19 1.55 2.54 1.55 1.5 0 2.53-.8 2.53-2.55v-5.78h-1.7v5.77c0 .86-.35 1.31-1.05 1.31-.61 0-.98-.27-1.38-.93l-1.94 1.63zm5.58.03c.5.98 1.51 1.55 3.13 1.55 1.93 0 3.17-1.03 3.17-2.75 0-1.8-1.19-2.38-3.08-2.93-1.13-.33-1.52-.66-1.52-1.22 0-.48.36-.88 1.08-.88.66 0 1.11.28 1.46.93l1.36-.98c-.54-.98-1.26-1.36-2.82-1.36-1.78 0-2.95 1.02-2.95 2.62 0 1.66 1.05 2.27 2.92 2.82 1.13.33 1.63.7 1.63 1.36 0 .57-.5 1.02-1.44 1.02-.96 0-1.53-.42-1.93-1.13l-1.41.97z"/></svg>`,

    /* 🐘 PHP - 官方图标 */
    php: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#777bb4" d="M7.5 15.5H4.5V8.5H7.5C9.5 8.5 10.5 9.5 10.5 11.5V12.5C10.5 14.5 9.5 15.5 7.5 15.5M7.5 10H6V14H7.5C8.5 14 9 13.5 9 12.5V11.5C9 10.5 8.5 10 7.5 10M16.5 15.5H13.5V8.5H16.5C18.5 8.5 19.5 9.5 19.5 11.5V12.5C19.5 14.5 18.5 15.5 16.5 15.5M16.5 10H15V14H16.5C17.5 14 18 13.5 18 12.5V11.5C18 10.5 17.5 10 16.5 10M12 6L10 18H12L14 6H12Z"/></svg>`,

    /* 🟠 HTML5 - 官方图标 */
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#e34c26" d="M1.5 0h21l-1.91 21.563L12 24 1.41 21.563 1.5 0zm7.055 11.196l-.5 5.625 4.27 1.156 4.26-1.156.52-5.625h-8.55zm1.97-.723h5.65l.18-2.033h-5.99l-.16-1.82h6.29l.16-1.79H6.72l-.5 5.643h7.75l-.17 1.84H9.525z"/></svg>`,

    /* 🐹 Go/Golang - 官方图标 */
    go: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#00add8" d="M2.2 12.2c0-.5.4-.9.9-.9h11.6c.5 0 .9.4.9.9s-.4.9-.9.9H3.1c-.5 0-.9-.4-.9-.9m0 3.5c0-.5.4-.9.9-.9h11.6c.5 0 .9.4.9.9s-.4.9-.9.9H3.1c-.5 0-.9-.4-.9-.9m15.8-5.6c-1.3 0-2.4 1.1-2.4 2.4s1.1 2.4 2.4 2.4 2.4-1.1 2.4-2.4-1.1-2.4-2.4-2.4m0 3.8c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4m3.2-3.8c-1.3 0-2.4 1.1-2.4 2.4s1.1 2.4 2.4 2.4 2.4-1.1 2.4-2.4-1.1-2.4-2.4-2.4m0 3.8c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4"/></svg>`,
    golang: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#00add8" d="M2.2 12.2c0-.5.4-.9.9-.9h11.6c.5 0 .9.4.9.9s-.4.9-.9.9H3.1c-.5 0-.9-.4-.9-.9m0 3.5c0-.5.4-.9.9-.9h11.6c.5 0 .9.4.9.9s-.4.9-.9.9H3.1c-.5 0-.9-.4-.9-.9m15.8-5.6c-1.3 0-2.4 1.1-2.4 2.4s1.1 2.4 2.4 2.4 2.4-1.1 2.4-2.4-1.1-2.4-2.4-2.4m0 3.8c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4m3.2-3.8c-1.3 0-2.4 1.1-2.4 2.4s1.1 2.4 2.4 2.4 2.4-1.1 2.4-2.4-1.1-2.4-2.4-2.4m0 3.8c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4"/></svg>`,

    /* 🐍 Python - 官方图标 */
    python: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#3776ab" d="M9.9 2.1c-1.5 0-2.8.3-3.9.9-1.1.6-1.7 1.4-1.7 2.4v2.8h6.1v.9H2.3c-1.2 0-2.2.4-2.9 1.1-.7.7-1.1 1.7-1.1 2.9v3.3c0 1.2.4 2.2 1.1 2.9.7.7 1.7 1.1 2.9 1.1h1.7v-3.1c0-1.2.4-2.2 1.1-2.9.7-.7 1.7-1.1 2.9-1.1h5.8c1.2 0 2.2-.4 2.9-1.1.7-.7 1.1-1.7 1.1-2.9V5.4c0-1-.6-1.8-1.7-2.4-1.1-.6-2.4-.9-3.9-.9H9.9zm-2.5 1.6c.6 0 1.1.2 1.5.6.4.4.6.9.6 1.5s-.2 1.1-.6 1.5c-.4.4-.9.6-1.5.6s-1.1-.2-1.5-.6c-.4-.4-.6-.9-.6-1.5s.2-1.1.6-1.5c.4-.4.9-.6 1.5-.6z"/><path fill="#ffd43b" d="M18.1 7.6v2.9c0 1.2-.4 2.2-1.1 2.9-.7.7-1.7 1.1-2.9 1.1H8.3c-1.2 0-2.2.4-2.9 1.1-.7.7-1.1 1.7-1.1 2.9v3.3c0 1 .6 1.8 1.7 2.4 1.1.6 2.4.9 3.9.9h4.2c1.5 0 2.8-.3 3.9-.9 1.1-.6 1.7-1.4 1.7-2.4v-2.8h-6.1v-.9h9.8c1.2 0 2.2-.4 2.9-1.1.7-.7 1.1-1.7 1.1-2.9v-3.3c0-1.2-.4-2.2-1.1-2.9-.7-.7-1.7-1.1-2.9-1.1h-1.7v3.1c0 1.2-.4 2.2-1.1 2.9-.7.7-1.7 1.1-2.9 1.1H9.3c-1.2 0-2.2.4-2.9 1.1-.7.7-1.1 1.7-1.1 2.9v5.4h9.8c1.2 0 2.2-.4 2.9-1.1.7-.7 1.1-1.7 1.1-2.9V7.6h-1zm-3.4 10.7c.6 0 1.1.2 1.5.6.4.4.6.9.6 1.5s-.2 1.1-.6 1.5c-.4.4-.9.6-1.5.6s-1.1-.2-1.5-.6c-.4-.4-.6-.9-.6-1.5s.2-1.1.6-1.5c.4-.4.9-.6 1.5-.6z"/></svg>`,

    /* 🔷 C - 官方图标 */
    c: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#00599c" d="M9.5 6c-3.5 0-6.5 2.5-6.5 6s3 6 6.5 6c2.1 0 3.9-1 5-2.5l-2.1-1.5c-.6.9-1.6 1.5-2.9 1.5-2.1 0-3.5-1.5-3.5-3.5S7.4 8.5 9.5 8.5c1.3 0 2.3.6 2.9 1.5l2.1-1.5C13.4 7 11.6 6 9.5 6z"/></svg>`,

    /* 💜 C# - 官方图标 */
    'c#': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#9b4f96" d="M9.5 6c-3.5 0-6.5 2.5-6.5 6s3 6 6.5 6c2.1 0 3.9-1 5-2.5l-2.1-1.5c-.6.9-1.6 1.5-2.9 1.5-2.1 0-3.5-1.5-3.5-3.5S7.4 8.5 9.5 8.5c1.3 0 2.3.6 2.9 1.5l2.1-1.5C13.4 7 11.6 6 9.5 6z"/><path fill="#9b4f96" d="M17 6h1v2h2V6h1v2h2v1h-2v2h2v1h-2v2h-1v-2h-2v2h-1v-2h-2v-1h2V9h-2V8h2V6z"/><path fill="#9b4f96" d="M18 9h2v2h-2z"/></svg>`,
    csharp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#9b4f96" d="M9.5 6c-3.5 0-6.5 2.5-6.5 6s3 6 6.5 6c2.1 0 3.9-1 5-2.5l-2.1-1.5c-.6.9-1.6 1.5-2.9 1.5-2.1 0-3.5-1.5-3.5-3.5S7.4 8.5 9.5 8.5c1.3 0 2.3.6 2.9 1.5l2.1-1.5C13.4 7 11.6 6 9.5 6z"/><path fill="#9b4f96" d="M17 6h1v2h2V6h1v2h2v1h-2v2h2v1h-2v2h-1v-2h-2v2h-1v-2h-2v-1h2V9h-2V8h2V6z"/><path fill="#9b4f96" d="M18 9h2v2h-2z"/></svg>`,

    /* ☕ Java - 官方图标 */
    java: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#007396" d="M8.85 18.17s-.94.55.66.74c1.96.23 2.96.2 5.13-.22 0 0 .57.35 1.36.66-4.86 2.08-11.01-.12-7.15-1.18zm-.56-2.6s-1.05.78.55.94c2.07.21 3.7.23 6.52-.31 0 0 .4.4 1.03.62-5.79 1.7-12.24.13-8.1-1.25z"/><path fill="#007396" d="M13.86 10.68c1.17 1.35-.31 2.56-.31 2.56s2.97-1.53 1.61-3.45c-1.24-1.76-2.19-2.63 2.96-5.65 0 0-8.09 2.02-4.26 6.54z"/><path fill="#f8981d" d="M18.1 20.35c5.15-3.01 2.77-5.9 1.11-5.52-.39.1-.57.18-.57.18s.15-.23.43-.33c3.23-1.13 5.73 3.33-1.05 5.87 0 0 .08-.07.08-.2z"/><path fill="#007396" d="M14.88 0s2.92 2.93-2.77 7.45c-4.56 3.6-1.04 5.65 0 8.01-2.66-2.4-4.61-4.52-3.3-6.49 1.92-2.83 7.28-4.19 6.07-8.97z"/></svg>`,

    /* 🦀 Rust - 官方图标 */
    rust: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#dea584" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>`,

    /* 🟣 Kotlin - 官方图标 */
    kotlin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#7f52ff" d="M2 2h20v20H2V2zm2 2v16h16V4H4zm2 2h5v5H6V6zm7 0h5v5h-5V6zM6 13h5v5H6v-5zm7 0h5v5h-5v-5z"/></svg>`,

    /* 🐚 Bash/Shell - 终端脚本图标 */
    bash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#2e3436" d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z"/><path fill="none" stroke="#ffffff" stroke-width="1.5" d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z"/><text x="7.5" y="15" font-family="monospace" font-size="8" font-weight="bold" fill="#ffffff">$_</text><path fill="#4eaa25" d="M16 14h2v1.5h-2z"/></svg>`,
    shell: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#2e3436" d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z"/><path fill="none" stroke="#ffffff" stroke-width="1.5" d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z"/><text x="7.5" y="15" font-family="monospace" font-size="8" font-weight="bold" fill="#ffffff">$_</text><path fill="#4eaa25" d="M16 14h2v1.5h-2z"/></svg>`,
    sh: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#2e3436" d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z"/><path fill="none" stroke="#ffffff" stroke-width="1.5" d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z"/><text x="7.5" y="15" font-family="monospace" font-size="8" font-weight="bold" fill="#ffffff">$_</text><path fill="#4eaa25" d="M16 14h2v1.5h-2z"/></svg>`,

    /* 📋 TOML - 配置文件图标 */
    toml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" fill="#9c4121"/><text x="12" y="16" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">TOML</text></svg>`,

    /* 🗄️ SQL - 数据库圆柱图标 */
    sql: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4479a1" d="M12 2c-4.42 0-8 1.34-8 3v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5c0-1.66-3.58-3-8-3zm0 2c3.87 0 6 1.12 6 2s-2.13 2-6 2-6-1.12-6-2 2.13-2 6-2zm-6 4.68V8c0 .88 2.13 2 6 2s6-1.12 6-2v.68c0 .88-2.13 2-6 2s-6-1.12-6-2zm0 4V12c0 .88 2.13 2 6 2s6-1.12 6-2v.68c0 .88-2.13 2-6 2s-6-1.12-6-2zm0 4V16c0 .88 2.13 2 6 2s6-1.12 6-2v.68c0 .88-2.13 2-6 2s-6-1.12-6-2z"/></svg>`,

    /* 🐬 MySQL - 官方图标 */
    mysql: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4479a1" d="M12.7 2.9c-.6-.1-1.1.1-1.5.4-.4.3-.6.7-.7 1.2-.1.5 0 1 .2 1.4.2.4.6.7 1.1.9.5.2 1 .2 1.5 0 .4-.2.8-.5 1-.9.2-.4.3-.9.2-1.4-.1-.5-.4-.9-.8-1.2-.4-.3-.9-.5-1.4-.5l.4.1zm-2.3 3.2c-.3 0-.6.1-.8.3-.2.2-.3.5-.3.8 0 .3.1.6.3.8.2.2.5.3.8.3.3 0 .6-.1.8-.3.2-.2.3-.5.3-.8 0-.3-.1-.6-.3-.8-.2-.2-.5-.3-.8-.3zm4.6 0c-.3 0-.6.1-.8.3-.2.2-.3.5-.3.8 0 .3.1.6.3.8.2.2.5.3.8.3.3 0 .6-.1.8-.3.2-.2.3-.5.3-.8 0-.3-.1-.6-.3-.8-.2-.2-.5-.3-.8-.3zm-6.9 2.3c-.2 0-.4.1-.5.2-.1.1-.2.3-.2.5s.1.4.2.5c.1.1.3.2.5.2s.4-.1.5-.2c.1-.1.2-.3.2-.5s-.1-.4-.2-.5c-.1-.1-.3-.2-.5-.2zm9.2 0c-.2 0-.4.1-.5.2-.1.1-.2.3-.2.5s.1.4.2.5c.1.1.3.2.5.2s.4-.1.5-.2c.1-.1.2-.3.2-.5s-.1-.4-.2-.5c-.1-.1-.3-.2-.5-.2zm-7.4 2.3c-.4 0-.8.2-1.1.5-.3.3-.4.7-.4 1.1 0 .4.2.8.5 1.1.3.3.7.4 1.1.4.4 0 .8-.2 1.1-.5.3-.3.4-.7.4-1.1 0-.4-.2-.8-.5-1.1-.3-.3-.7-.4-1.1-.4zm5.6 0c-.4 0-.8.2-1.1.5-.3.3-.4.7-.4 1.1 0 .4.2.8.5 1.1.3.3.7.4 1.1.4.4 0 .8-.2 1.1-.5.3-.3.4-.7.4-1.1 0-.4-.2-.8-.5-1.1-.3-.3-.7-.4-1.1-.4zm-2.8 3.5c-.5 0-1 .2-1.4.6-.4.4-.6.9-.6 1.4 0 .5.2 1 .6 1.4.4.4.9.6 1.4.6.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4 0-.5-.2-1-.6-1.4-.4-.4-.9-.6-1.4-.6z"/><path fill="#f29111" d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z"/></svg>`,

    /* 🐘 PostgreSQL - 官方图标 */
    postgresql: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#336791" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path fill="#336791" d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/><path fill="#fff" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>`,
    pgsql: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#336791" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path fill="#336791" d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/><path fill="#fff" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>`,

    /* 🍃 MongoDB - 官方图标 */
    mongodb: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#001e2b" d="M12.18 2.04c-.63 2.34-1.4 4.3-2.26 6.08-.33.68-.7 1.35-1.1 2-.4.65-.83 1.28-1.28 1.88-.45.6-.92 1.17-1.4 1.7-.48.53-.97 1.02-1.46 1.46-.5.44-.98.83-1.46 1.17-.47.34-.93.63-1.37.87-.44.24-.85.42-1.22.54-.37.12-.7.17-.97.15-.27-.02-.48-.13-.63-.33-.15-.2-.23-.5-.23-.9 0-.4.08-.88.23-1.44.15-.56.36-1.17.63-1.83.27-.66.59-1.35.96-2.07.37-.72.78-1.44 1.22-2.15.44-.71.91-1.4 1.4-2.07.5-.67 1-1.3 1.52-1.88.52-.58 1.05-1.1 1.58-1.56.53-.46 1.05-.85 1.56-1.17.5-.32.98-.55 1.44-.7.46-.15.88-.2 1.26-.15.38.05.7.23.96.54.26.31.44.76.54 1.35.1.59.13 1.32.1 2.18-.03.86-.12 1.85-.27 2.97-.15 1.12-.35 2.36-.6 3.72-.25 1.36-.55 2.82-.9 4.38-.35 1.56-.74 3.2-1.17 4.92l-.18.72c-.06.24-.12.47-.18.7l-.18.66-.18.6-.18.54c-.06.18-.12.34-.18.48-.06.14-.12.26-.18.36-.06.1-.12.18-.18.24-.06.06-.12.1-.18.12-.06.02-.12.02-.18 0-.06-.02-.12-.06-.18-.12-.06-.06-.12-.14-.18-.24-.06-.1-.12-.22-.18-.36-.06-.14-.12-.3-.18-.48l-.18-.54-.18-.6-.18-.66c-.06-.23-.12-.46-.18-.7l-.18-.72c-.43-1.72-.82-3.36-1.17-4.92-.35-1.56-.65-3.02-.9-4.38-.25-1.36-.45-2.6-.6-3.72-.15-1.12-.24-2.11-.27-2.97-.03-.86 0-1.59.1-2.18.1-.59.28-1.04.54-1.35.26-.31.58-.49.96-.54.38-.05.8 0 1.26.15.46.15.94.38 1.44.7.5.32 1.03.71 1.56 1.17.53.46 1.06.98 1.58 1.56.52.58 1.02 1.21 1.52 1.88.49.67.96 1.36 1.4 2.07.44.71.85 1.43 1.22 2.15.37.72.69 1.41.96 2.07.27.66.48 1.27.63 1.83.15.56.23 1.04.23 1.44 0 .4-.08.7-.23.9-.15.2-.36.31-.63.33-.27.02-.6-.03-.97-.15-.37-.12-.78-.3-1.22-.54-.44-.24-.9-.53-1.37-.87-.48-.34-.96-.73-1.46-1.17-.49-.44-.98-.93-1.46-1.46-.48-.53-.95-1.1-1.4-1.7-.45-.6-.88-1.23-1.28-1.88-.4-.65-.77-1.32-1.1-2-.86-1.78-1.63-3.74-2.26-6.08h.36z"/><path fill="#00ed64" d="M12 22.2c-.1 0-.2-.1-.2-.2 0-.1.1-.2.2-.2.1 0 .2.1.2.2 0 .1-.1.2-.2.2z"/></svg>`,
    mongo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#001e2b" d="M12.18 2.04c-.63 2.34-1.4 4.3-2.26 6.08-.33.68-.7 1.35-1.1 2-.4.65-.83 1.28-1.28 1.88-.45.6-.92 1.17-1.4 1.7-.48.53-.97 1.02-1.46 1.46-.5.44-.98.83-1.46 1.17-.47.34-.93.63-1.37.87-.44.24-.85.42-1.22.54-.37.12-.7.17-.97.15-.27-.02-.48-.13-.63-.33-.15-.2-.23-.5-.23-.9 0-.4.08-.88.23-1.44.15-.56.36-1.17.63-1.83.27-.66.59-1.35.96-2.07.37-.72.78-1.44 1.22-2.15.44-.71.91-1.4 1.4-2.07.5-.67 1-1.3 1.52-1.88.52-.58 1.05-1.1 1.58-1.56.53-.46 1.05-.85 1.56-1.17.5-.32.98-.55 1.44-.7.46-.15.88-.2 1.26-.15.38.05.7.23.96.54.26.31.44.76.54 1.35.1.59.13 1.32.1 2.18-.03.86-.12 1.85-.27 2.97-.15 1.12-.35 2.36-.6 3.72-.25 1.36-.55 2.82-.9 4.38-.35 1.56-.74 3.2-1.17 4.92l-.18.72c-.06.24-.12.47-.18.7l-.18.66-.18.6-.18.54c-.06.18-.12.34-.18.48-.06.14-.12.26-.18.36-.06.1-.12.18-.18.24-.06.06-.12.1-.18.12-.06.02-.12.02-.18 0-.06-.02-.12-.06-.18-.12-.06-.06-.12-.14-.18-.24-.06-.1-.12-.22-.18-.36-.06-.14-.12-.3-.18-.48l-.18-.54-.18-.6-.18-.66c-.06-.23-.12-.46-.18-.7l-.18-.72c-.43-1.72-.82-3.36-1.17-4.92-.35-1.56-.65-3.02-.9-4.38-.25-1.36-.45-2.6-.6-3.72-.15-1.12-.24-2.11-.27-2.97-.03-.86 0-1.59.1-2.18.1-.59.28-1.04.54-1.35.26-.31.58-.49.96-.54.38-.05.8 0 1.26.15.46.15.94.38 1.44.7.5.32 1.03.71 1.56 1.17.53.46 1.06.98 1.58 1.56.52.58 1.02 1.21 1.52 1.88.49.67.96 1.36 1.4 2.07.44.71.85 1.43 1.22 2.15.37.72.69 1.41.96 2.07.27.66.48 1.27.63 1.83.15.56.23 1.04.23 1.44 0 .4-.08.7-.23.9-.15.2-.36.31-.63.33-.27.02-.6-.03-.97-.15-.37-.12-.78-.3-1.22-.54-.44-.24-.9-.53-1.37-.87-.48-.34-.96-.73-1.46-1.17-.49-.44-.98-.93-1.46-1.46-.48-.53-.95-1.1-1.4-1.7-.45-.6-.88-1.23-1.28-1.88-.4-.65-.77-1.32-1.1-2-.86-1.78-1.63-3.74-2.26-6.08h.36z"/><path fill="#00ed64" d="M12 22.2c-.1 0-.2-.1-.2-.2 0-.1.1-.2.2-.2.1 0 .2.1.2.2 0 .1-.1.2-.2.2z"/></svg>`,

    /* 🔴 Redis - 官方图标 */
    redis: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#dc382d" d="M20.5 11.2c-1.6.8-9.9 4.1-11.3 4.9-1.4.8-2.1.7-3.2.4-1.1-.4-9.5-3.9-11-4.5-1.6-.6-1.6.1-1.6.4s.2 4.8.2 4.8c0 .3-.1.7 1.4 1.4 1.5.7 10.1 4.3 11.3 4.9 1.2.6 1.8.5 3-.1 1.2-.6 9.3-4.1 10.8-4.7 1.5-.6 1.4-.9 1.4-1.2 0-.3-.2-4.7-.2-4.7s.1-.7-1.5-.1z"/><path fill="#dc382d" d="M20.5 6.3c-1.6.8-9.9 4.1-11.3 4.9-1.4.8-2.1.7-3.2.4-1.1-.4-9.5-3.9-11-4.5-1.6-.6-1.6.1-1.6.4s.2 4.8.2 4.8c0 .3-.1.7 1.4 1.4 1.5.7 10.1 4.3 11.3 4.9 1.2.6 1.8.5 3-.1 1.2-.6 9.3-4.1 10.8-4.7 1.5-.6 1.4-.9 1.4-1.2 0-.3-.2-4.7-.2-4.7s.1-.7-1.5-.1z"/><path fill="#a32422" d="M20.5 6.3c-1.6.8-9.9 4.1-11.3 4.9-1.4.8-2.1.7-3.2.4-1.1-.4-9.5-3.9-11-4.5-1.6-.6-1.6.1-1.6.4s.2 4.8.2 4.8c0 .3-.1.7 1.4 1.4 1.5.7 10.1 4.3 11.3 4.9 1.2.6 1.8.5 3-.1 1.2-.6 9.3-4.1 10.8-4.7 1.5-.6 1.4-.9 1.4-1.2 0-.3-.2-4.7-.2-4.7s.1-.7-1.5-.1z"/><path fill="#fff" d="M8.2 8.6c2.4-.6 4.1-1.1 6.5-1.7 2.4-.6 1.9-.8 4.3-.2 2.4.6 3.3 1.4 3.3 1.4s-1.4 1.6-3.8 2.2c-2.4.6-4.1 1.1-6.5 1.7-2.4.6-1.9.8-4.3.2-2.4-.6-3.3-1.4-3.3-1.4s1.4-1.6 3.8-2.2z"/><path fill="#fff" d="M8.2 13.5c2.4-.6 4.1-1.1 6.5-1.7 2.4-.6 1.9-.8 4.3-.2 2.4.6 3.3 1.4 3.3 1.4s-1.4 1.6-3.8 2.2c-2.4.6-4.1 1.1-6.5 1.7-2.4.6-1.9.8-4.3.2-2.4-.6-3.3-1.4-3.3-1.4s1.4-1.6 3.8-2.2z"/><text x="12" y="11" font-family="Arial, sans-serif" font-size="3" font-weight="bold" fill="#dc382d" text-anchor="middle">REDIS</text></svg>`,

    /* 🔷 SQLite - 官方图标 */
    sqlite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#003b57" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path fill="#003b57" d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/><path fill="#003b57" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/><path fill="#97d9f6" d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>`,

    /* 📊 SQL Server - 官方图标 */
    sqlserver: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#a91d22" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path fill="#a91d22" d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/><text x="12" y="16" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="#a91d22" text-anchor="middle">T</text></svg>`,
    mssql: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#a91d22" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path fill="#a91d22" d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/><text x="12" y="16" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="#a91d22" text-anchor="middle">T</text></svg>`,

    /* 🟠 MariaDB - 官方图标 */
    mariadb: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#003545" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path fill="#c49a6c" d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>`,

    /* 🟡 Elasticsearch - 官方图标 */
    elasticsearch: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fec514" d="M12 2l-8 4v12l8 4 8-4V6l-8-4zm0 2.5l6 3-6 3-6-3 6-3zM5 9l6 3v8.5l-6-3V9zm14 0v8.5l-6 3v-8.5l6-3z"/></svg>`,

    /* 📋 默认代码图标 - 当语言未匹配时显示 </> */
    default: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="13" y1="5" x2="11" y2="19"/></svg>`
  };

  /* 🔄 语言别名映射 - 处理大小写差异和常见别名 */
  const languageAliases = {
    /* JavaScript 别名 */
    'javascript': 'js',
    'js': 'js',
    'jsx': 'js',
    'mjs': 'js',
    'cjs': 'js',

    /* TypeScript 别名 */
    'typescript': 'ts',
    'ts': 'ts',
    'tsx': 'ts',
    'mts': 'ts',
    'cts': 'ts',

    /* Vue 别名 */
    'vue': 'vue',
    'vuejs': 'vue',

    /* CSS 别名 */
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'css',
    'stylus': 'css',

    /* HTML 别名 */
    'html': 'html',
    'htm': 'html',
    'xhtml': 'html',

    /* Markdown 别名 */
    'markdown': 'md',
    'md': 'md',
    'mdx': 'md',

    /* Python 别名 */
    'python': 'python',
    'py': 'python',
    'py3': 'python',
    'python3': 'python',

    /* Go 别名 */
    'go': 'go',
    'golang': 'go',

    /* C 别名 */
    'c': 'c',
    'h': 'c',

    /* C# 别名 */
    'csharp': 'c#',
    'c#': 'c#',
    'cs': 'c#',

    /* Java 别名 */
    'java': 'java',

    /* Rust 别名 */
    'rust': 'rust',
    'rs': 'rust',

    /* Kotlin 别名 */
    'kotlin': 'kotlin',
    'kt': 'kotlin',
    'kts': 'kotlin',

    /* PHP 别名 */
    'php': 'php',

    /* Shell/Bash 别名 */
    'bash': 'bash',
    'shell': 'shell',
    'sh': 'sh',
    'zsh': 'bash',

    /* TOML 别名 */
    'toml': 'toml',

    /* 数据库别名 */
    'sql': 'sql',
    'mysql': 'mysql',
    'postgresql': 'postgresql',
    'pgsql': 'pgsql',
    'postgres': 'postgresql',
    'mongodb': 'mongodb',
    'mongo': 'mongo',
    'redis': 'redis',
    'sqlite': 'sqlite',
    'sqlserver': 'sqlserver',
    'mssql': 'mssql',
    'mariadb': 'mariadb',
    'elasticsearch': 'elasticsearch',
    'es': 'elasticsearch'
  };

  /* 🏷️ 语言官方名称映射 - 用于显示在代码块标题 */
  const languageDisplayNames = {
    /* JavaScript/TypeScript */
    'js': 'JavaScript',
    'javascript': 'JavaScript',
    'jsx': 'JavaScript',
    'mjs': 'JavaScript',
    'cjs': 'JavaScript',
    'ts': 'TypeScript',
    'typescript': 'TypeScript',
    'tsx': 'TypeScript',
    'mts': 'TypeScript',
    'cts': 'TypeScript',

    /* Web 前端 */
    'vue': 'Vue',
    'css': 'CSS',
    'scss': 'SCSS',
    'sass': 'Sass',
    'less': 'Less',
    'stylus': 'Stylus',
    'html': 'HTML',
    'htm': 'HTML',
    'xhtml': 'XHTML',

    /* 文档/配置 */
    'md': 'Markdown',
    'markdown': 'Markdown',
    'mdx': 'MDX',
    'json': 'JSON',
    'yaml': 'YAML',
    'yml': 'YAML',
    'toml': 'TOML',
    'ini': 'INI',
    'properties': 'Properties',

    /* Shell/脚本 */
    'bash': 'Bash',
    'shell': 'Shell',
    'sh': 'Shell',
    'zsh': 'Zsh',
    'powershell': 'PowerShell',
    'ps1': 'PowerShell',
    'bat': 'Batch',
    'cmd': 'Batch',

    /* 后端语言 */
    'python': 'Python',
    'py': 'Python',
    'py3': 'Python',
    'python3': 'Python',
    'go': 'Go',
    'golang': 'Go',
    'c': 'C',
    'h': 'C',
    'cpp': 'C++',
    'c++': 'C++',
    'cxx': 'C++',
    'cc': 'C++',
    'hpp': 'C++',
    'c#': 'C#',
    'csharp': 'C#',
    'cs': 'C#',
    'java': 'Java',
    'rust': 'Rust',
    'rs': 'Rust',
    'kotlin': 'Kotlin',
    'kt': 'Kotlin',
    'kts': 'Kotlin',
    'php': 'PHP',
    'ruby': 'Ruby',
    'rb': 'Ruby',
    'swift': 'Swift',
    'objectivec': 'Objective-C',
    'objc': 'Objective-C',
    'scala': 'Scala',
    'lua': 'Lua',
    'perl': 'Perl',
    'r': 'R',

    /* 数据库/查询 */
    'sql': 'SQL',
    'mysql': 'MySQL',
    'postgresql': 'PostgreSQL',
    'pgsql': 'PostgreSQL',
    'postgres': 'PostgreSQL',
    'mongodb': 'MongoDB',
    'mongo': 'MongoDB',
    'redis': 'Redis',
    'sqlite': 'SQLite',
    'sqlserver': 'SQL Server',
    'mssql': 'SQL Server',
    'mariadb': 'MariaDB',
    'elasticsearch': 'Elasticsearch',
    'es': 'Elasticsearch',
    'graphql': 'GraphQL',
    'gql': 'GraphQL',

    /* DevOps/配置 */
    'dockerfile': 'Dockerfile',
    'docker': 'Docker',
    'makefile': 'Makefile',
    'make': 'Makefile',
    'nginx': 'Nginx',
    'apache': 'Apache',
    'terraform': 'Terraform',
    'hcl': 'HCL',

    /* 其他 */
    'text': 'Text',
    'txt': 'Text',
    'plaintext': 'Plain Text',
    'diff': 'Diff',
    'patch': 'Patch',
    'log': 'Log',
    'regex': 'Regex',
    'regexp': 'Regex'
  };

  /**
   * 🎨 获取语言图标 SVG
   * @param {string} lang - 语言标识
   * @returns {string} - SVG 字符串
   */
  function getLanguageIcon(lang) {
    const normalizedLang = normalizeLanguage(lang);
    return languageIcons[normalizedLang] || languageIcons['default'];
  }

  /**
   * 🌈 获取语言主题色
   * @param {string} lang - 语言标识
   * @returns {string} - 颜色代码
   */
  function getLanguageColor(lang) {
    const colors = {
      'js': '#f7df1e',
      'ts': '#3178c6',
      'vue': '#42b883',
      'css': '#264de4',
      'scss': '#cf649a',
      'html': '#e34c26',
      'php': '#777bb4',
      'python': '#3776ab',
      'go': '#00add8',
      'java': '#007396',
      'c': '#00599c',
      'c#': '#9b4f96',
      'rust': '#dea584',
      'kotlin': '#7f52ff',
      'md': '#087ea4',
      'bash': '#4eaa25',
      'shell': '#89e051',
      'sh': '#89e051',
      'toml': '#9c4121',
      'sql': '#4479a1',
      'mysql': '#4479a1',
      'postgresql': '#336791',
      'pgsql': '#336791',
      'mongodb': '#47a248',
      'mongo': '#47a248',
      'redis': '#dc382d',
      'sqlite': '#003b57',
      'sqlserver': '#a91d22',
      'mssql': '#a91d22',
      'mariadb': '#003545',
      'elasticsearch': '#fec514'
    };

    const normalizedLang = normalizeLanguage(lang);
    return colors[normalizedLang] || '#8b949e';
  }

  /**
   * 🔄 标准化语言标识
   * @param {string} lang - 原始语言标识
   * @returns {string} - 标准化后的语言标识
   */
  function normalizeLanguage(lang) {
    if (!lang || typeof lang !== 'string') {
      return 'default';
    }

    /* 转换为小写并去除空白 */
    const normalized = lang.toLowerCase().trim();

    /* 检查是否有别名映射 */
    if (languageAliases[normalized]) {
      return languageAliases[normalized];
    }

    /* 处理带参数的情况，如 "jsx?line=1-10" */
    const baseLang = normalized.split(/[?{\s]/)[0];
    if (languageAliases[baseLang]) {
      return languageAliases[baseLang];
    }

    return baseLang || 'default';
  }

  /**
   * 🔍 从代码块前面的 HTML 注释中提取标题
   * @param {HTMLElement} codeBlock - 代码块元素
   * @returns {string} - 标题内容
   */
  function extractTitleFromComment(codeBlock) {
    /* 🔍 查找代码块前面的注释节点 */
    let prevNode = codeBlock.previousSibling;
    
    while (prevNode) {
      /* 跳过空白文本节点 */
      if (prevNode.nodeType === Node.TEXT_NODE) {
        if (prevNode.textContent.trim() === '') {
          prevNode = prevNode.previousSibling;
          continue;
        }
      }
      
      /* 检查是否是注释节点 */
      if (prevNode.nodeType === Node.COMMENT_NODE) {
        const commentText = prevNode.textContent.trim();
        /* 匹配 CODE_BLOCK_TITLE: 格式的注释 */
        const titleMatch = commentText.match(/CODE_BLOCK_TITLE:(.+)/);
        if (titleMatch) {
          return titleMatch[1].trim();
        }
        /* 也匹配旧的 code-title: 格式 */
        const oldTitleMatch = commentText.match(/code-title:\s*(.+)/i);
        if (oldTitleMatch) {
          return oldTitleMatch[1].trim();
        }
      }
      
      /* 如果遇到其他元素，停止查找 */
      if (prevNode.nodeType === Node.ELEMENT_NODE) {
        break;
      }
      
      prevNode = prevNode.previousSibling;
    }
    
    return '';
  }

  /**
   * 🔍 识别代码块的语言和标题
   * @param {HTMLElement} codeBlock - 代码块元素
   * @returns {Object} - 包含语言和标题的对象 {lang, title}
   */
  function detectCodeLanguage(codeBlock) {
    if (!codeBlock || !codeBlock.classList) {
      return { lang: '', title: '' };
    }

    let rawLang = '';
    let title = '';

    /* 方法1: 从 class 中提取语言（如 language-go, language-javascript） */
    const classList = Array.from(codeBlock.classList);
    const langClass = classList.find(
      (cls) => cls.startsWith('language-') || cls.startsWith('highlight-')
    );

    if (langClass) {
      rawLang = langClass.replace(/^language-/, '').replace(/^highlight-/, '');
    }

    /* 方法2: 从 data-lang 属性获取 */
    if (!rawLang) {
      rawLang = codeBlock.getAttribute('data-lang') || '';
    }

    /* 方法3: 从 code 元素的 data-lang 属性获取 */
    if (!rawLang) {
      const codeElement = codeBlock.querySelector('code[data-lang]');
      if (codeElement) {
        rawLang = codeElement.getAttribute('data-lang');
      }
    }

    /* 方法4: 从 code 元素的 class 获取 */
    if (!rawLang) {
      const codeElement = codeBlock.querySelector('code');
      if (codeElement) {
        const codeClasses = Array.from(codeElement.classList);
        const codeLangClass = codeClasses.find(cls => cls.startsWith('language-'));
        if (codeLangClass) {
          rawLang = codeLangClass.replace(/^language-/, '');
        }
      }
    }

    /* 方法5: 从 pre 元素的 class 获取 */
    if (!rawLang) {
      const preElement = codeBlock.querySelector('pre');
      if (preElement) {
        const preClasses = Array.from(preElement.classList);
        const preLangClass = preClasses.find(cls => cls.startsWith('language-'));
        if (preLangClass) {
          rawLang = preLangClass.replace(/^language-/, '');
        }
      }
    }

    /* 🔍 确定最终语言 */
    let lang = rawLang;

    /* 🆕 方法6: 从 data-title 属性获取标题 */
    title = codeBlock.getAttribute('data-title') || '';

    return { lang: normalizeLanguage(lang), title };
  }

  /**
   * 🏷️ 为代码块添加语言图标和标题
   * @param {HTMLElement} codeBlock - 代码块元素
   */
  function addLanguageIcon(codeBlock) {
    /* 检查是否已添加图标 */
    if (codeBlock.querySelector('.code-lang-icon')) {
      return;
    }

    const { lang, title: attrTitle } = detectCodeLanguage(codeBlock);
    const iconSvg = getLanguageIcon(lang);

    /* 🆕 优先从 HTML 注释提取标题 */
    const commentTitle = extractTitleFromComment(codeBlock);
    const title = commentTitle || attrTitle;

    /* 创建图标容器 */
    const iconWrapper = document.createElement('span');
    iconWrapper.className = 'code-lang-icon';
    iconWrapper.setAttribute('data-lang', lang || 'code');
    iconWrapper.setAttribute('aria-label', lang ? `${lang} code` : 'code');
    iconWrapper.innerHTML = iconSvg;

    /* 将图标插入到代码块的头部 */
    codeBlock.appendChild(iconWrapper);

    /* 📝 确定要显示的标题 */
    let displayTitle = '';
    if (title && title.trim()) {
      /* 使用用户自定义标题 */
      displayTitle = title.trim();
    } else if (lang) {
      /* 使用语言官方名称 */
      displayTitle = languageDisplayNames[lang] || '代码';
    }

    /* 📝 添加标题元素 */
    if (displayTitle) {
      const titleElement = document.createElement('span');
      titleElement.className = 'code-block-title';
      titleElement.textContent = displayTitle;
      titleElement.setAttribute('data-code-title', displayTitle);
      codeBlock.appendChild(titleElement);
    }
  }

  /**
   * 🚀 初始化所有代码块的语言图标
   */
  function initCodeLanguageIcons() {
    /* 🔍 查找所有 highlight 元素 */
    const selectors = [
      '.vp-doc .highlight',
      '.vp-doc div[class*="language-"]',
      '.highlight',
      'div[class*="language-"]'
    ];

    /* 合并选择器 */
    const codeBlocks = document.querySelectorAll(selectors.join(', '));

    codeBlocks.forEach((block) => {
      /* 跳过已处理的代码块 */
      if (block.hasAttribute('data-icon-initialized')) {
        return;
      }

      /* 跳过特殊的代码块 */
      const parentClass = block.parentElement?.className || '';
      if (parentClass.includes('details') || parentClass.includes('tk-vp-code')) {
        return;
      }

      /* 跳过 code-group 内部的代码块（由标签页统一显示图标） */
      if (block.closest('.vp-code-group')) {
        return;
      }

      /* 标记为已处理 */
      block.setAttribute('data-icon-initialized', 'true');

      /* 添加语言图标 */
      addLanguageIcon(block);
    });
  }

  /**
   * 👀 使用 Intersection Observer 延迟初始化
   */
  function lazyInitCodeLanguageIcons() {
    /* 🔍 查找所有 highlight 元素 */
    const selectors = [
      '.vp-doc .highlight',
      '.vp-doc div[class*="language-"]',
      '.highlight',
      'div[class*="language-"]'
    ];

    const codeBlocks = document.querySelectorAll(selectors.join(', '));

    if (!('IntersectionObserver' in window)) {
      /* 不支持 IntersectionObserver，直接初始化 */
      codeBlocks.forEach((block) => {
        if (!block.hasAttribute('data-icon-initialized')) {
          /* 跳过 code-group 内部的代码块（由标签页统一显示图标） */
          if (block.closest('.vp-code-group')) {
            return;
          }
          addLanguageIcon(block);
          block.setAttribute('data-icon-initialized', 'true');
        }
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const block = entry.target;
            if (!block.hasAttribute('data-icon-initialized')) {
              /* 跳过 code-group 内部的代码块（由标签页统一显示图标） */
              if (block.closest('.vp-code-group')) {
                observer.unobserve(block);
                return;
              }
              addLanguageIcon(block);
              block.setAttribute('data-icon-initialized', 'true');
            }
            observer.unobserve(block);
          }
        });
      },
      { rootMargin: '100px' }
    );

    codeBlocks.forEach((block) => {
      if (!block.hasAttribute('data-icon-initialized')) {
        observer.observe(block);
      }
    });
  }

  /* 📡 导出公共 API */
  window.CodeLanguageIcons = {
    getIcon: getLanguageIcon,
    getColor: getLanguageColor,
    normalizeLanguage: normalizeLanguage,
    detectLanguage: detectCodeLanguage,
    init: initCodeLanguageIcons,
    lazyInit: lazyInitCodeLanguageIcons
  };

  /* 🎯 自动初始化 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', lazyInitCodeLanguageIcons);
  } else {
    lazyInitCodeLanguageIcons();
  }

  /* 🔄 监听动态添加的代码块 */
  if ('MutationObserver' in window) {
    const observer = new MutationObserver((mutations) => {
      let shouldInit = false;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            if (
              element.classList?.contains('highlight') ||
              element.classList?.toString().includes('language-') ||
              element.querySelector?.('.highlight, div[class*="language-"]')
            ) {
              shouldInit = true;
            }
          }
        });
      });

      if (shouldInit) {
        setTimeout(initCodeLanguageIcons, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();
