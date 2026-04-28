// 🔗 动态版权链接更新
// 🌐 根据当前浏览器地址栏的实际域名动态更新文章链接
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const linkElement = document.querySelector('[data-dynamic-link]');
    if (!linkElement) {
      return;
    }

    // 📝 获取当前页面的实际 URL「不包含 hash 和 query 参数」
    const currentUrl = window.location.origin + window.location.pathname;
    // 🔄 移除末尾的斜杠
    const cleanUrl = currentUrl.replace(/\/$/, '');

    // 💫 更新链接的 href 和显示文本
    linkElement.href = cleanUrl;
    linkElement.textContent = cleanUrl;
  });
})();
