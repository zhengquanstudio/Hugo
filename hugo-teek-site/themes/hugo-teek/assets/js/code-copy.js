// ========================================
// Code Block Copy功能
// 为代码块添加复制按钮
// ========================================

(function () {
  'use strict';

  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeCopy);
  } else {
    initCodeCopy();
  }

  function initCodeCopy() {
    // 查找所有代码块
    const codeBlocks = document.querySelectorAll('.highlight, div[class*="language-"]');

    codeBlocks.forEach((block) => {
      // 跳过已经添加过按钮的代码块
      if (block.querySelector('.copy-code-button')) {
        return;
      }

      // 创建复制按钮
      const button = createCopyButton();

      // 将按钮添加到代码块
      block.appendChild(button);

      // 绑定复制事件
      button.addEventListener('click', () => {
        copyCode(block, button);
      });
    });

    // 提取语言标签并设置 data-lang 属性
    setLanguageLabels();
  }

  /**
   * 创建复制按钮
   */
  function createCopyButton() {
    const button = document.createElement('button');
    button.className = 'copy-code-button';
    button.type = 'button';
    button.setAttribute('aria-label', '复制代码');
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span>复制</span>
    `;
    return button;
  }

  /**
   * 复制代码到剪贴板
   */
  function copyCode(block, button) {
    // 获取代码内容
    const code = getCodeContent(block);

    if (!code) {
      showToast('无法获取代码内容', 'error');
      return;
    }

    // 复制到剪贴板
    copyToClipboard(code)
      .then(() => {
        // 更新按钮状态
        button.classList.add('copied');
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>已复制</span>
        `;
        button.setAttribute('aria-label', '代码已复制');

        // 🎉 显示横幅提示
        showCopyBanner('代码已复制到剪贴板~记得标注来源哦！');

        // 2秒后恢复按钮状态
        setTimeout(() => {
          button.classList.remove('copied');
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>复制</span>
          `;
          button.setAttribute('aria-label', '复制代码');
        }, 2000);
      })
      .catch((err) => {
        console.error('复制失败:', err);
        showCopyBanner('复制失败了，请手动复制吧~');
      });
  }

  /**
   * 获取代码块的文本内容
   */
  function getCodeContent(block) {
    const pre = block.querySelector('pre');
    if (!pre) return '';

    const code = pre.querySelector('code');
    if (!code) return pre.textContent || '';

    // 如果有行号表格，只获取代码部分
    const codeTable = code.querySelector('.lntable');
    if (codeTable) {
      const codeCell = codeTable.querySelector('.lntd:last-child');
      return codeCell ? codeCell.textContent || '' : '';
    }

    return code.textContent || '';
  }

  /**
   * 复制文本到剪贴板
   */
  function copyToClipboard(text) {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    // 降级方案：使用 execCommand
    return new Promise((resolve, reject) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        const successful = document.execCommand('copy');
        textarea.remove();
        if (successful) {
          resolve();
        } else {
          reject(new Error('execCommand 复制失败'));
        }
      } catch (err) {
        textarea.remove();
        reject(err);
      }
    });
  }

  /**
   * 🎉 显示复制成功的横幅提示
   */
  function showCopyBanner(message) {
    const banner = document.createElement("div");
    banner.className = "slide-banner";
    banner.innerHTML = `
      <div class="slide-content">
        <h1>${message || "你拷贝了哦！~被我发现呢，一定要标注本文来源哦！"}</h1>
      </div>
      <div class="slide-block"></div>
    `;

    document.body.appendChild(banner);

    // ✨ 出现动画~
    setTimeout(() => {
      banner.classList.add("show");
    }, 10);

    setTimeout(() => {
      const slideBlock = banner.querySelector(".slide-block");
      if (slideBlock) {
        slideBlock.style.width = "100%";
      }
    }, 10);

    setTimeout(() => {
      banner.classList.add("hide");
    }, 5000);

    // 🧹 动画结束后移除元素
    setTimeout(() => {
      banner.remove();
    }, 6000);
  }

  /**
   * 设置语言标签
   */
  function setLanguageLabels() {
    const codeBlocks = document.querySelectorAll('.highlight, div[class*="language-"]');

    codeBlocks.forEach((block) => {
      // 跳过已经设置过的
      if (block.hasAttribute('data-lang')) {
        return;
      }

      // 从 class 名中提取语言
      const classList = Array.from(block.classList);
      const langClass = classList.find((cls) => cls.startsWith('language-') || cls.includes('highlight-'));

      if (langClass) {
        let lang = langClass.replace(/^language-/, '').replace(/^highlight-/, '');

        // 处理特殊语言名称
        const langMap = {
          js: 'javascript',
          ts: 'typescript',
          py: 'python',
          rb: 'ruby',
          sh: 'bash',
          yml: 'yaml',
          md: 'markdown',
        };

        lang = langMap[lang] || lang;
        block.setAttribute('data-lang', lang);
      }

      // 从 pre 标签的 class 中提取语言
      const pre = block.querySelector('pre');
      if (pre && !block.hasAttribute('data-lang')) {
        const preClassList = Array.from(pre.classList);
        const preLangClass = preClassList.find((cls) => cls.startsWith('language-'));

        if (preLangClass) {
          let lang = preLangClass.replace(/^language-/, '');
          block.setAttribute('data-lang', lang);
        }
      }
    });
  }

  // 导出函数供外部使用
  window.initCodeCopy = initCodeCopy;
})();
