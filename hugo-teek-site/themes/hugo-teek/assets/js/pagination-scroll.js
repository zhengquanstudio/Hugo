/**
 * 首页分页 Hash 清理
 * 浏览器原生处理 #content 跳转，此脚本仅负责延迟清理 hash
 */
(function() {
  'use strict';

  // 配置项
  const CONFIG = {
    targetHash: 'content',              // 目标 hash（不含 #）
    clearHashDelay: 1000,               // 清理 hash 延迟（ms）
    debugMode: false                    // 调试模式
  };

  /**
   * 清理 hash
   */
  function cleanupHash() {
    const hash = window.location.hash.substring(1); // 移除 # 号

    if (hash !== CONFIG.targetHash) {
      if (CONFIG.debugMode) console.log('[Pagination Hash] Hash 不匹配，跳过清理:', hash);
      return;
    }

    // 延迟清理 hash，让浏览器完成原生跳转
    setTimeout(() => {
      if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.href.replace(/#.*$/, '');
        window.history.replaceState(null, '', cleanUrl);
        if (CONFIG.debugMode) console.log('[Pagination Hash] Hash 已清理');
      }
    }, CONFIG.clearHashDelay);
  }

  // 页面加载完成后清理 hash
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanupHash);
  } else {
    cleanupHash();
  }

  // 监听 hashchange 事件（兼容浏览器前进/后退）
  window.addEventListener('hashchange', cleanupHash);
})();
