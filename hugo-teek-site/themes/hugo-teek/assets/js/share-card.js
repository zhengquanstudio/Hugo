/**
 * 🔗 分享按钮功能模块
 * ☀️ 支持 PJAX 页面切换后重新初始化
 */

(function () {
  'use strict';

  /**
   * 🚀 初始化分享按钮
   * ◀️ 将函数暴露到 window 对象，供 PJAX 调用
   */
  function initShareButtons() {
    const shareButtons = document.querySelectorAll('.tk-share-button');
    if (!shareButtons.length) return;

    shareButtons.forEach(shareButton => {
      // 避免重复初始化
      if (shareButton.dataset.initialized) return;
      shareButton.dataset.initialized = 'true';

      const url = shareButton.getAttribute('data-url');
      if (!url) return;

      const iconEl = shareButton.querySelector('.share-icon');
      const textEl = shareButton.querySelector('.share-text');

      if (!iconEl || !textEl) return;

      // 保存原始内容
      const originalIcon = iconEl.textContent;
      const originalText = textEl.textContent;

      // 点击按钮直接复制链接
      shareButton.addEventListener('click', async function () {
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(url);
          } else {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = url;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
          }

          // 第一步：淡出当前内容
          shareButton.classList.add('fading-out');

          // 等待淡出动画完成后切换内容
          setTimeout(() => {
            // 切换内容
            iconEl.textContent = '👍';
            textEl.textContent = '链接已复制';
            shareButton.classList.add('copied');

            // 移除淡出，添加淡入
            shareButton.classList.remove('fading-out');
            shareButton.classList.add('fading-in');

            // 清除淡入动画类
            setTimeout(() => {
              shareButton.classList.remove('fading-in');
            }, 500);
          }, 200);

          // 2秒后恢复原始状态
          setTimeout(() => {
            // 再次淡出
            shareButton.classList.add('fading-out');

            setTimeout(() => {
              // 恢复原始内容
              iconEl.textContent = originalIcon;
              textEl.textContent = originalText;
              shareButton.classList.remove('copied');

              // 淡入
              shareButton.classList.remove('fading-out');
              shareButton.classList.add('fading-in');

              setTimeout(() => {
                shareButton.classList.remove('fading-in');
              }, 500);
            }, 200);
          }, 2000);

          showCopyBanner('🔗链接已复制到剪贴板，记得注明来源哦~');
        } catch (err) {
          console.error('复制失败:', err);
          showCopyBanner('复制失败，请手动复制');
        }
      });
    });

    console.log(`[Share] Initialized ${shareButtons.length} share buttons`);
  }

  /**
   * 💕 将初始化函数暴露到全局
   * ◀️ 供 PJAX 页面切换后调用
   */
  window.initShareButton = initShareButtons;

  /**
   * 🔄 DOM 加载完成后自动初始化
   * ◀️ 确保首次页面加载时也能正常工作
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShareButtons);
  } else {
    /* 💕 DOM 已加载，立即执行 */
    initShareButtons();
  }
})();
