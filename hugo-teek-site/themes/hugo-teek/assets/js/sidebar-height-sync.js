/* 🎯 侧边栏高度自适应同步控制器 */
/* 让侧边栏 aside 高度自适应 section 文章卡片区域长度
/* 白木开发 🔗https://gl.baimu.live/
*/

(function() {
  'use strict';

  /* 📊 配置参数 */
  const CONFIG = {
    sidebarSelector: '.home-sidebar',
    sectionSelector: '.posts-section',
    resizeDelay: 100,
    minHeight: 300,
    hintHideDelay: 8000  /* ◀️ 8秒后自动隐藏 */
  };

  /* 💬 提示气泡管理器 */
  const ScrollHintManager = {
    hintElement: null,
    hideTimeout: null,
    isVisible: false,

    /* 创建提示气泡元素 */
    create() {
      const hint = document.createElement('div');
      hint.className = 'sidebar-scroll-hint';
      hint.innerHTML = `
        <span class="hint-icon">⬇️</span>
        <span class="hint-text">滚动查看更多</span>
      `;
      document.body.appendChild(hint);
      this.hintElement = hint;
      return hint;
    },

    /* 显示提示气泡 */
    show() {
      if (!this.hintElement) {
        this.create();
      }

      /* 清除之前的隐藏定时器 */
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
      }

      /* 显示气泡 */
      this.hintElement.classList.add('is-visible');
      this.isVisible = true;

      /* 8秒后自动隐藏 */
      this.hideTimeout = setTimeout(() => {
        this.hide();
      }, CONFIG.hintHideDelay);
    },

    /* 隐藏提示气泡 */
    hide() {
      if (this.hintElement) {
        this.hintElement.classList.remove('is-visible');
        this.isVisible = false;
      }
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
    },

    /* 检查侧边栏是否需要滚动 */
    checkNeedScroll(sidebar) {
      if (!sidebar) return false;
      /* 如果内容高度大于可视高度，说明需要滚动 */
      return sidebar.scrollHeight > sidebar.clientHeight;
    }
  };

  /* 🔍 获取元素 */
  function getElements() {
    return {
      sidebar: document.querySelector(CONFIG.sidebarSelector),
      section: document.querySelector(CONFIG.sectionSelector)
    };
  }

  /* 📏 计算并设置侧边栏高度 */
  function syncSidebarHeight() {
    /* 📱 移动端不需要高度同步，让卡片全部展开 */
    if (window.innerWidth <= 768) {
      const { sidebar } = getElements();
      if (sidebar) {
        /* 清除可能存在的内联样式，让 CSS 媒体查询生效 */
        sidebar.style.maxHeight = '';
        sidebar.style.height = '';
        sidebar.style.overflowY = '';
        sidebar.style.overflowX = '';
      }
      return;
    }

    const { sidebar, section } = getElements();

    if (!sidebar || !section) {
      return;
    }

    /* 获取 section 的实际高度（不包含 margin） */
    const sectionHeight = section.getBoundingClientRect().height;

    /* 设置侧边栏最大高度为 section 高度 */
    sidebar.style.maxHeight = `${sectionHeight}px`;
    sidebar.style.height = 'auto';

    /* 确保侧边栏内容超出时可以滚动 */
    sidebar.style.overflowY = 'auto';
    sidebar.style.overflowX = 'hidden';

    /* 添加平滑滚动效果 */
    sidebar.style.scrollBehavior = 'smooth';

    /* 🎨 应用彩色滚动条样式 */
    sidebar.classList.add('vp-colorful-scrollbar');
  }

  /* 🖱️ 初始化提示气泡交互 */
  function initScrollHint() {
    const { sidebar } = getElements();
    if (!sidebar) return;

    /* 鼠标移入侧边栏区域时显示提示 */
    sidebar.addEventListener('mouseenter', () => {
      /* 只有需要滚动时才显示提示 */
      if (ScrollHintManager.checkNeedScroll(sidebar)) {
        ScrollHintManager.show();
      }
    });

    /* 鼠标移出侧边栏区域时隐藏提示 */
    sidebar.addEventListener('mouseleave', () => {
      ScrollHintManager.hide();
    });

    /* 开始滚动时隐藏提示 */
    sidebar.addEventListener('scroll', () => {
      ScrollHintManager.hide();
    }, { passive: true });
  }

  /* 🔄 防抖处理函数 */
  let resizeTimeout;
  function debouncedSync() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(syncSidebarHeight, CONFIG.resizeDelay);
  }

  /* 🚀 初始化 */
  function init() {
    /* 页面加载完成后执行 */
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        syncSidebarHeight();
        initScrollHint();
      });
    } else {
      syncSidebarHeight();
      initScrollHint();
    }

    /* 监听窗口大小变化 */
    window.addEventListener('resize', debouncedSync, { passive: true });

    /* 监听图片加载完成（影响 section 高度） */
    const images = document.querySelectorAll('.posts-section img');
    images.forEach(img => {
      if (img.complete) {
        syncSidebarHeight();
      } else {
        img.addEventListener('load', syncSidebarHeight, { once: true });
      }
    });

    /* 监听分页变化（如果使用了动态分页） */
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.target.classList.contains('post-grid')) {
          debouncedSync();
        }
      });
    });

    const postGrid = document.querySelector('.post-grid');
    if (postGrid) {
      observer.observe(postGrid, { childList: true, subtree: true });
    }

    /* 页面完全加载后再次同步（确保所有资源加载完成） */
    window.addEventListener('load', syncSidebarHeight, { once: true });
  }

  /* 启动 */
  init();

})();
