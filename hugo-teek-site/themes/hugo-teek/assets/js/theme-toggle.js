/* 🕊️白木 优化 🔗gl.baimu.live */
/* 🎨 主题切换动画 - V4 性能优化 */
(function() {
  function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    const moreThemeToggle = document.getElementById('theme-toggle-more');
    const root = document.documentElement;
    const body = document.body;

    const config = {
      transitionDuration: 400,
      isTransitioning: false
    };

    const getStoredTheme = () => {
      try {
        return localStorage.getItem('theme');
      } catch (err) {
        return null;
      }
    };

    const storeTheme = (value) => {
      try {
        localStorage.setItem('theme', value);
      } catch (err) {}
    };

    const applyThemeWithoutAnimation = (isDark) => {
      root.classList.toggle('dark-mode', isDark);
      body.classList.toggle('dark-mode', isDark);
      if (themeToggle) {
        themeToggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
      }
      if (mobileThemeToggle) {
        mobileThemeToggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
      }
      if (moreThemeToggle) {
        moreThemeToggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
      }
    };

    const performThemeSwitch = (isDark) => {
      if (config.isTransitioning) return;
      config.isTransitioning = true;

      /* 🎨 添加过渡效果 */
      body.style.transition = 'background-color 0.2s ease-out, color 0.2s ease-out';

      requestAnimationFrame(() => {
        root.classList.toggle('dark-mode', isDark);
        body.classList.toggle('dark-mode', isDark);
        if (themeToggle) {
          themeToggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
        }
        if (mobileThemeToggle) {
          mobileThemeToggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
        }
        if (moreThemeToggle) {
          moreThemeToggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
        }
        setTimeout(() => {
          config.isTransitioning = false;
          /* 🎨 移除过渡效果，避免影响后续操作 */
          body.style.transition = '';
        }, config.transitionDuration);
      });
    };

    /* 🌟 创建性能优化V11涟漪动画效果 - 使用 clip-path 实现真正的涟漪扩散 */
    const createRippleEffect = (event, isDark) => {
      if (config.isTransitioning) return;
      config.isTransitioning = true;

      try {
        const clickX = event.clientX || (event.touches?.[0]?.clientX ?? window.innerWidth / 2);
        const clickY = event.clientY || (event.touches?.[0]?.clientY ?? window.innerHeight / 2);

        /* 📐 计算最大半径 */
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const maxRadius = Math.sqrt(vw * vw + vh * vh);

        /* 🎨 创建涟漪层 - 使用 clip-path 实现圆形扩散 */
        const ripple = document.createElement('div');
        ripple.id = 'theme-ripple';

        /* 💨 设置样式 - 全屏覆盖，使用 clip-path 裁剪成圆形 */
        ripple.style.cssText = `
          position:fixed;
          top:0;
          left:0;
          width:100vw;
          height:100vh;
          background:${isDark ? '#0f172a' : '#f9fafb'};
          pointer-events:none;
          z-index:2147483647;
          clip-path:circle(0px at ${clickX}px ${clickY}px);
          will-change:clip-path;
        `;

        document.body.appendChild(ripple);

        /* 🎬 强制重排 */
        ripple.offsetHeight;

        /* ⚡ 动画配置 */
        const expandDuration = 400;

        /* 🚀 启动扩散动画 */
        ripple.style.transition = `clip-path ${expandDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        ripple.style.clipPath = `circle(${maxRadius}px at ${clickX}px ${clickY}px)`;

        /* 🎨 在动画进行到一半时切换主题 */
        setTimeout(() => {
          root.classList.toggle('dark-mode', isDark);
          body.classList.toggle('dark-mode', isDark);
          if (themeToggle) themeToggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
          if (mobileThemeToggle) mobileThemeToggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
          if (moreThemeToggle) moreThemeToggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
        }, expandDuration * 0.5);

        /* 🗑️ 动画结束后清理 */
        setTimeout(() => {
          ripple.remove();
          config.isTransitioning = false;
        }, expandDuration);

      } catch (err) {
        performThemeSwitch(isDark);
      }
    };

    const handleThemeToggle = (event) => {
      const nextIsDark = !root.classList.contains('dark-mode');
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* 🖥️ 桌面端使用涟漪效果，减少动画偏好时使用普通切换 */
      if (prefersReducedMotion) {
        performThemeSwitch(nextIsDark);
      } else {
        createRippleEffect(event, nextIsDark);
      }
      storeTheme(nextIsDark ? 'dark' : 'light');
    };

    const handleSchemeChange = (event) => {
      const saved = getStoredTheme();
      /* 🎨 只有当用户没有手动设置主题时，才跟随系统主题变化 */
      if (!saved || saved === 'null' || saved === 'undefined') {
        performThemeSwitch(event.matches);
      }
    };

    /* 🎨 主题初始化：
     * head.html 中的内联脚本已经设置了主题，这里只需要同步 aria-checked 状态
     * 避免重复操作导致闪烁
     */
    const isCurrentlyDark = root.classList.contains('dark-mode');

    /* 同步按钮状态 */
    if (themeToggle) {
      themeToggle.setAttribute('aria-checked', isCurrentlyDark ? 'true' : 'false');
    }
    if (mobileThemeToggle) {
      mobileThemeToggle.setAttribute('aria-checked', isCurrentlyDark ? 'true' : 'false');
    }
    if (moreThemeToggle) {
      moreThemeToggle.setAttribute('aria-checked', isCurrentlyDark ? 'true' : 'false');
    }

    if (themeToggle) {
      themeToggle.addEventListener('click', handleThemeToggle);
    }
    if (mobileThemeToggle) {
      mobileThemeToggle.addEventListener('click', handleThemeToggle);
    }
    if (moreThemeToggle) {
      moreThemeToggle.addEventListener('click', handleThemeToggle);
    }

    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSchemeChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleSchemeChange);
      }
    }
  }

  /* 🔗 平板断点更多菜单交互 */
  function initMoreMenu() {
    const moreMenu = document.querySelector('.more-menu');
    if (!moreMenu) return;

    const moreButton = moreMenu.querySelector('.more-button');
    if (!moreButton) return;

    /* 🔘 点击按钮切换下拉菜单 */
    moreButton.addEventListener('click', function(e) {
      e.stopPropagation();
      const isOpen = moreMenu.classList.toggle('is-open');
      moreButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    /* 📋 点击外部关闭下拉菜单 */
    document.addEventListener('click', function(e) {
      if (!moreMenu.contains(e.target)) {
        moreMenu.classList.remove('is-open');
        moreButton.setAttribute('aria-expanded', 'false');
      }
    });

    /* ⌨️ ESC键关闭下拉菜单 */
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && moreMenu.classList.contains('is-open')) {
        moreMenu.classList.remove('is-open');
        moreButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initThemeToggle();
      initMoreMenu();
    });
  } else {
    initThemeToggle();
    initMoreMenu();
  }
})();
