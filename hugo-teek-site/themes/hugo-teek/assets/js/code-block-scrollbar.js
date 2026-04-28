/* 🎨 代码块底部滚动条指示器 - 当代码内容超宽时显示 */
/* 🕊️ 白木 gl.baimu.live 开发 */
(function () {
  'use strict';

  /* 🔧 配置选项 */
  const config = {
    enabled: true,
    scrollbarHeight: '6px', /* 🔽 滚动条高度 */
    scrollbarColor: 'var(--vp-c-brand-1, #3b82f6)', /* 🔽 滚动条颜色 */
    scrollbarTrackColor: 'rgba(0, 0, 0, 0.1)', /* 🔽 滚动条轨道颜色 */
    scrollbarBorderRadius: '3px', /* 🔽 滚动条圆角 */
    checkDelay: 100, /* 🔽 检测延迟（毫秒） */
  };

  /* 🚀 等待 DOM 加载完成 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    if (!config.enabled) return;

    /* ⏰ 延迟执行，确保代码块已渲染 */
    setTimeout(() => {
      initCodeBlockScrollbars();
    }, config.checkDelay);

    /* 🔄 监听窗口大小变化，重新检测 */
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateAllScrollbars();
      }, 200);
    });

    /* 👀 使用 MutationObserver 监听动态添加的代码块 */
    if ('MutationObserver' in window) {
      const observer = new MutationObserver((mutations) => {
        let hasNewCodeBlock = false;
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { /* 🔽 Element node */
              if (isCodeBlockElement(node)) {
                hasNewCodeBlock = true;
              } else if (node.querySelectorAll) {
                const codeBlocks = node.querySelectorAll(
                  '.vp-doc div[class*="language-"], .highlight, div[class*="language-"]'
                );
                if (codeBlocks.length > 0) {
                  hasNewCodeBlock = true;
                }
              }
            }
          });
        });

        if (hasNewCodeBlock) {
          setTimeout(() => {
            initCodeBlockScrollbars();
          }, config.checkDelay);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  /* 🔍 检查元素是否为代码块 */
  function isCodeBlockElement(element) {
    if (!element || !element.classList) return false;
    const className = element.className || '';
    return className.includes('language-') || className.includes('highlight');
  }

  /* 🎯 获取代码块内实际滚动的元素 */
  function getScrollElement(block) {
    /* 🔽 首先尝试查找 pre 元素 - pre 元素是设计的滚动容器 */
    const preElement = block.querySelector('pre');
    if (preElement) {
      return preElement;
    }
    /* 🔽 如果没有 pre 元素，则返回代码块本身 */
    return block;
  }

  /* 🎯 初始化所有代码块滚动条 */
  function initCodeBlockScrollbars() {
    const codeBlocks = document.querySelectorAll(
      '.vp-doc div[class*="language-"], .highlight, div[class*="language-"]'
    );

    codeBlocks.forEach((block) => {
      /* 🔽 跳过已处理的代码块 */
      if (block.hasAttribute('data-scrollbar-initialized')) return;

      /* 🔽 标记为已处理 */
      block.setAttribute('data-scrollbar-initialized', 'true');

      /* 🔽 获取实际滚动的元素 */
      const scrollElement = getScrollElement(block);

      /* 🔽 添加自定义滚动条样式 */
      addCustomScrollbar(block, scrollElement);

      /* 🔽 检测并更新滚动条状态 */
      updateScrollbarVisibility(block, scrollElement);

      /* 🔽 监听滚动事件，同步自定义滚动条 */
      scrollElement.addEventListener('scroll', () => {
        updateCustomScrollbarThumb(block, scrollElement);
      });
    });
  }

  /* 📊 更新所有代码块的滚动条状态 */
  function updateAllScrollbars() {
    const codeBlocks = document.querySelectorAll('[data-scrollbar-initialized="true"]');
    codeBlocks.forEach((block) => {
      const scrollElement = getScrollElement(block);
      updateScrollbarVisibility(block, scrollElement);
    });
  }

  /* 🎨 添加自定义滚动条到代码块 */
  function addCustomScrollbar(block, scrollElement) {
    /* 🔽 确保代码块有相对定位 */
    const computedStyle = window.getComputedStyle(block);
    if (computedStyle.position === 'static') {
      block.style.position = 'relative';
    }

    /* 🔽 创建自定义滚动条容器 */
    const scrollbarContainer = document.createElement('div');
    scrollbarContainer.className = 'code-block-scrollbar-container';
    scrollbarContainer.setAttribute('aria-hidden', 'true');
    scrollbarContainer.innerHTML = `
      <div class="code-block-scrollbar-track">
        <div class="code-block-scrollbar-thumb"></div>
      </div>
    `;

    /* 🔽 添加样式 - 使用与页面滚动条相同的 CSS 变量 */
    const style = document.createElement('style');
    style.textContent = `
      /* 🎨 代码块自定义滚动条样式 - 绑定页面滚动条配色 */
         使用 --scrollbar-bg 和 --scrollbar-bg-hover 变量，与页面滚动条保持一致 */
      .code-block-scrollbar-container {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: ${config.scrollbarHeight};
        background: transparent; /* ◀️ 轨道透明，简化视觉效果 */
        border-radius: 0 0 8px 8px;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
        z-index: 100;
        overflow: hidden;
        cursor: pointer;
      }

      .code-block-scrollbar-container.visible {
        opacity: 1;
        visibility: visible;
      }

      .code-block-scrollbar-track {
        width: 100%;
        height: 100%;
        position: relative;
      }

      .code-block-scrollbar-thumb {
        height: 100%;
        background: var(--scrollbar-bg, var(--vp-c-brand-1, #3b82f6)); /* ◀️ 使用页面滚动条颜色变量 */
        border-radius: ${config.scrollbarBorderRadius};
        position: absolute;
        left: 0;
        top: 0;
        transition: left 0.1s ease-out, background-color 0.2s ease;
        min-width: 30px;
        cursor: grab;
        will-change: left;
      }

      .code-block-scrollbar-thumb:active {
        cursor: grabbing;
      }

      .code-block-scrollbar-thumb:hover {
        background: var(--scrollbar-bg-hover, var(--vp-c-brand-3, #60a5fa)); /* ◀️ 使用页面滚动条悬停颜色变量 */
      }

      /* 📱 移动端优化 */
      @media (max-width: 640px) {
        .code-block-scrollbar-container {
          height: 4px;
        }
      }
    `;

    /* 🔽 将样式添加到代码块内部（避免污染全局） */
    if (!block.querySelector('.code-block-scrollbar-styles')) {
      style.className = 'code-block-scrollbar-styles';
      block.appendChild(style);
    }

    /* 🔽 添加滚动条容器到代码块 */
    block.appendChild(scrollbarContainer);

    /* 🔽 添加交互功能 */
    addScrollbarInteraction(block, scrollbarContainer, scrollElement);

    /* 🔽 监听原生滚动条的显示/隐藏 */
    observeNativeScrollbar(block, scrollElement);
  }

  /* 🖱️ 添加滚动条交互功能（拖拽和点击） */
  function addScrollbarInteraction(block, scrollbarContainer, scrollElement) {
    const scrollbarThumb = scrollbarContainer.querySelector('.code-block-scrollbar-thumb');
    if (!scrollbarThumb) return;

    let isDragging = false;
    let startX = 0;
    let startThumbLeft = 0;
    let trackWidth = 0;
    let thumbWidth = 0;

    /* 🔘 鼠标按下 - 开始拖拽 */
    scrollbarThumb.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      
      /* 🔽 获取当前滑块位置 */
      const thumbRect = scrollbarThumb.getBoundingClientRect();
      const trackRect = scrollbarContainer.getBoundingClientRect();
      startThumbLeft = thumbRect.left - trackRect.left;
      
      trackWidth = scrollbarContainer.offsetWidth;
      thumbWidth = scrollbarThumb.offsetWidth;
      
      scrollbarThumb.style.cursor = 'grabbing';
      scrollbarThumb.style.transition = 'none';
      
      e.preventDefault();
      e.stopPropagation();
    });

    /* 🖐️ 鼠标移动 - 拖拽中 */
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const newThumbLeft = Math.max(0, Math.min(startThumbLeft + deltaX, trackWidth - thumbWidth));
      
      /* 🔽 直接设置 left 位置 */
      scrollbarThumb.style.left = newThumbLeft + 'px';
      
      /* 🔽 同步滚动代码块内容 */
      const scrollRatio = newThumbLeft / (trackWidth - thumbWidth);
      const scrollableWidth = scrollElement.scrollWidth - scrollElement.clientWidth;
      scrollElement.scrollLeft = scrollRatio * scrollableWidth;
    });

    /* 🖐️ 鼠标释放 - 结束拖拽 */
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        scrollbarThumb.style.cursor = 'grab';
        scrollbarThumb.style.transition = 'left 0.1s ease-out';
      }
    });

    /* 👆 点击轨道 - 跳转到对应位置 */
    scrollbarContainer.addEventListener('click', (e) => {
      /* 🔽 如果点击的是滑块，不处理（避免与拖拽冲突） */
      if (e.target === scrollbarThumb || scrollbarThumb.contains(e.target)) return;

      const rect = scrollbarContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const trackWidth = rect.width;
      const thumbWidth = scrollbarThumb.offsetWidth;
      const scrollableWidth = scrollElement.scrollWidth - scrollElement.clientWidth;

      /* 🔽 计算点击位置对应的滚动比例（以滑块中心为基准） */
      let newThumbLeft = clickX - thumbWidth / 2;
      newThumbLeft = Math.max(0, Math.min(newThumbLeft, trackWidth - thumbWidth));
      
      /* 🔽 更新滑块位置 */
      scrollbarThumb.style.left = newThumbLeft + 'px';
      
      /* 🔽 同步滚动 */
      const scrollRatio = newThumbLeft / (trackWidth - thumbWidth);
      scrollElement.scrollLeft = scrollRatio * scrollableWidth;
    });

    /* 📱 触摸支持（移动端） */
    scrollbarThumb.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
      
      const thumbRect = scrollbarThumb.getBoundingClientRect();
      const trackRect = scrollbarContainer.getBoundingClientRect();
      startThumbLeft = thumbRect.left - trackRect.left;
      
      trackWidth = scrollbarContainer.offsetWidth;
      thumbWidth = scrollbarThumb.offsetWidth;
      
      scrollbarThumb.style.transition = 'none';
      
      e.stopPropagation();
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;

      const deltaX = e.touches[0].clientX - startX;
      const newThumbLeft = Math.max(0, Math.min(startThumbLeft + deltaX, trackWidth - thumbWidth));
      
      scrollbarThumb.style.left = newThumbLeft + 'px';
      
      const scrollRatio = newThumbLeft / (trackWidth - thumbWidth);
      const scrollableWidth = scrollElement.scrollWidth - scrollElement.clientWidth;
      scrollElement.scrollLeft = scrollRatio * scrollableWidth;
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        scrollbarThumb.style.transition = 'left 0.1s ease-out';
      }
    });
  }

  /* 👁️ 监听原生滚动条的变化 */
  function observeNativeScrollbar(block, scrollElement) {
    /* 🔽 使用 ResizeObserver 监听代码块大小变化 */
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(() => {
        updateScrollbarVisibility(block, scrollElement);
      });
      resizeObserver.observe(block);
      resizeObserver.observe(scrollElement);
    }

    /* 🔽 监听代码块的滚动事件 */
    scrollElement.addEventListener('scroll', () => {
      updateCustomScrollbarThumb(block, scrollElement);
    });
  }

  /* 📏 更新滚动条可见性 */
  function updateScrollbarVisibility(block, scrollElement) {
    const scrollbarContainer = block.querySelector('.code-block-scrollbar-container');

    if (!scrollbarContainer) return;

    /* 🔽 检测内容是否超宽 */
    const hasHorizontalOverflow = scrollElement.scrollWidth > scrollElement.clientWidth;

    if (hasHorizontalOverflow) {
      scrollbarContainer.classList.add('visible');
      updateCustomScrollbarThumb(block, scrollElement);
    } else {
      scrollbarContainer.classList.remove('visible');
    }
  }

  /* 🎚️ 更新自定义滚动条滑块位置 */
  function updateCustomScrollbarThumb(block, scrollElement) {
    const scrollbarThumb = block.querySelector('.code-block-scrollbar-thumb');
    const scrollbarContainer = block.querySelector('.code-block-scrollbar-container');
    if (!scrollbarThumb || !scrollbarContainer) return;

    const scrollLeft = scrollElement.scrollLeft;
    const scrollWidth = scrollElement.scrollWidth;
    const clientWidth = scrollElement.clientWidth;

    /* 🔽 计算滚动百分比 */
    const scrollPercent = scrollLeft / (scrollWidth - clientWidth);

    /* 🔽 计算滑块宽度和位置 */
    const trackWidth = scrollbarContainer.offsetWidth;
    const thumbWidth = Math.max((clientWidth / scrollWidth) * trackWidth, 30);
    const maxThumbLeft = trackWidth - thumbWidth;
    const thumbLeft = scrollPercent * maxThumbLeft;

    /* 🔽 应用样式 - 使用 left 而不是 transform */
    scrollbarThumb.style.width = thumbWidth + 'px';
    scrollbarThumb.style.left = thumbLeft + 'px';
  }

  /* 🔄 重新初始化（供外部调用） */
  window.reinitCodeBlockScrollbars = function () {
    /* 🔽 清除所有已初始化标记 */
    const codeBlocks = document.querySelectorAll('[data-scrollbar-initialized="true"]');
    codeBlocks.forEach((block) => {
      block.removeAttribute('data-scrollbar-initialized');
      const scrollbar = block.querySelector('.code-block-scrollbar-container');
      const styles = block.querySelector('.code-block-scrollbar-styles');
      if (scrollbar) scrollbar.remove();
      if (styles) styles.remove();
    });

    /* 🔽 重新初始化 */
    initCodeBlockScrollbars();
  };
})();
