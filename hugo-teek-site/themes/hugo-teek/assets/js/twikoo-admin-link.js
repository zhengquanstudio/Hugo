/* 🕊️白木 开发 🔗gl.baimu.live */

/**
 * 💬 Twikoo 管理员后台新页面打开模块
 * 🎯 功能：点击齿轮图标后，在新页面打开管理员后台
 */

(function() {
  'use strict';

  /* 🔗 管理后台页面路径 */
  const ADMIN_PAGE_PATH = '/twikoo-admin/';

  /* 🎯 处理齿轮点击 */
  function handleAdminClick(e) {
    /* 🔍 查找点击的元素是否是齿轮按钮 */
    const adminBtn = e.target.closest('.tk-admin');

    if (!adminBtn) return;

    /* 🚫 阻止默认行为 */
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    /* 🎯 在新页面打开管理后台 */
    window.open(ADMIN_PAGE_PATH, '_blank');

    return false;
  }

  /* 🚀 初始化 */
  function init() {
    /* 🎨 添加隐藏样式 */
    const style = document.createElement('style');
    style.textContent = `
      .tk-admin-container { display: none !important; }
    `;
    document.head.appendChild(style);

    /* 🎯 在捕获阶段监听点击事件 */
    document.addEventListener('click', handleAdminClick, true);

    console.log('[TwikooAdminLink] ✅ 已初始化');
  }

  /* 🚀 启动 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
