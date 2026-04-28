// ========================================
// Code Group 标签页切换功能
// 实现 VitePress code-group 风格的代码块标签页切换
// ========================================

(function() {
  'use strict';

  /**
   * 初始化所有 code-group 组件
   */
  function initCodeGroups() {
    const groups = document.querySelectorAll('.vp-code-group');

    groups.forEach(group => {
      // 跳过已初始化的
      if (group.dataset.init === 'true') return;
      group.dataset.init = 'true';

      const inputs = group.querySelectorAll('.tabs .tab-input');
      const blocks = group.querySelectorAll('.blocks > .highlight, .blocks > div[class*="highlight"]');

      if (inputs.length === 0 || blocks.length === 0) {
        console.warn('[CodeGroup] 未找到标签页或代码块:', group.id);
        return;
      }

      // 为标签添加语言图标
      const tabLabels = group.querySelectorAll('.tab-label');
      tabLabels.forEach(label => {
        const lang = label.dataset.lang;
        const iconSpan = label.querySelector('.tab-icon');
        if (lang && iconSpan && window.CodeLanguageIcons) {
          const iconSvg = window.CodeLanguageIcons.getIcon(lang);
          if (iconSvg) {
            iconSpan.innerHTML = iconSvg;
          }
        }
      });

      // 初始化：确保第一个代码块显示，其他隐藏
      blocks.forEach((block, i) => {
        block.style.display = i === 0 ? 'block' : 'none';
      });

      // 为每个标签页绑定切换事件
      inputs.forEach((input, i) => {
        input.addEventListener('change', () => {
          if (!input.checked) return;

          // 隐藏所有代码块
          blocks.forEach(block => {
            block.style.display = 'none';
          });

          // 显示对应的代码块
          if (blocks[i]) {
            blocks[i].style.display = 'block';

            // 触发代码块重新初始化（如果有复制按钮等功能）
            const event = new CustomEvent('codeblock:visible', {
              detail: { block: blocks[i] }
            });
            blocks[i].dispatchEvent(event);
          }
        });
      });

      console.log('[CodeGroup] 初始化完成:', group.id, '标签数:', inputs.length);
    });
  }

  /**
   * 保存标签页选择状态到 sessionStorage
   * @param {string} groupId - code-group 的 ID
   * @param {number} tabIndex - 选中的标签页索引
   */
  function saveTabState(groupId, tabIndex) {
    try {
      const key = `code-group-tab-${groupId}`;
      sessionStorage.setItem(key, tabIndex.toString());
    } catch (e) {
      // sessionStorage 不可用，忽略
    }
  }

  /**
   * 恢复标签页选择状态
   * @param {string} groupId - code-group 的 ID
   * @returns {number|null} - 保存的标签页索引，或 null
   */
  function restoreTabState(groupId) {
    try {
      const key = `code-group-tab-${groupId}`;
      const value = sessionStorage.getItem(key);
      return value !== null ? parseInt(value, 10) : null;
    } catch (e) {
      return null;
    }
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeGroups);
  } else {
    initCodeGroups();
  }

  // 支持 PJAX / SPA 页面切换
  document.addEventListener('pjax:complete', initCodeGroups);
  document.addEventListener('turbolinks:load', initCodeGroups);
  document.addEventListener('swup:contentReplaced', initCodeGroups);

  // 暴露给外部使用
  window.CodeGroup = {
    init: initCodeGroups,
    saveState: saveTabState,
    restoreState: restoreTabState
  };
})();
