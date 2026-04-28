// 🎉 复制事件横幅提示功能
// 🔗 搭配 copy-banner.scss 使用
// 🕊️ 白木 gl.baimu.live 开发

/**
 * 📝 显示复制成功的横幅提示
 * @param {string} message - 提示文本内容，默认为【你拷贝了哦！~被我发现呢，一定要标注本文来源哦！】
 */
function showCopyBanner(message) {
  // 🧹 移除已存在的横幅，避免重复显示
  const existingBanner = document.querySelector('.slide-banner');
  if (existingBanner) {
    existingBanner.remove();
  }

  const banner = document.createElement('div');
  banner.className = 'slide-banner';
  banner.innerHTML = `
    <div class="slide-content">
      <h1>${message || '你拷贝了哦！~被我发现呢，一定要标注本文来源哦！'}</h1>
    </div>
    <div class="slide-block"></div>
  `;

  document.body.appendChild(banner);

  // ✨ 强制重排确保动画触发
  banner.offsetHeight;

  // 🎬 触发动画
  requestAnimationFrame(() => {
    banner.classList.add('show');
  });

  // ⏰ 3.5秒后自动隐藏
  setTimeout(() => {
    banner.classList.add('hide');
  }, 3500);

  // 🧹 动画结束后移除元素
  setTimeout(() => {
    banner.remove();
  }, 4000);
}

/**
 * 🔗 初始化全局复制事件监听
 * @param {string} message - 可选的自定义提示文本
 */
function initCopyBanner(message) {
  document.addEventListener('copy', () => {
    showCopyBanner(message);
  });
}

// 💕 暴露到全局作用域，供外部调用
window.showCopyBanner = showCopyBanner;
window.initCopyBanner = initCopyBanner;

// 🚀 自动初始化（如果页面加载完成）
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    initCopyBanner();
  });
} else {
  // DOM 已经加载完成，直接初始化
  initCopyBanner();
}
