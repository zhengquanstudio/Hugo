/**
 * PjaxLite 初始化
 * 配置 Pjax 实例并注册页面切换后的回调
 */

(function() {
  'use strict';

  function initPjax() {
    // 检查是否在文档页面（有 #swup 容器）
    if (!document.querySelector('#swup')) {
      console.log('[Pjax] 非文档页面，跳过初始化');
      return;
    }

    // 检查 PjaxLite 类是否已加载
    if (typeof PjaxLite === 'undefined') {
      console.warn('[Pjax] PjaxLite 类未加载，等待中...');
      setTimeout(initPjax, 100);
      return;
    }

    // 创建 PjaxLite 实例
    const pjax = new PjaxLite({
      container: '#swup',
      linkSelector: 'a[href^="/"]:not([data-no-pjax]):not([href^="#"]):not([target]):not([href*="admin-center"]):not([href*=".pdf"]):not([href*=".zip"]):not([download])',
      animationDuration: 150,
      cacheSize: 20,
      preloadDelay: 200
    });

    // ============================================================
    // 页面切换前的处理
    // ============================================================
    pjax.on('before', ({ url }) => {
      console.log('[Pjax] 🔄 页面切换开始:', url);

      // 关闭所有移动端抽屉
      if (window.closeMobileDrawers) {
        window.closeMobileDrawers();
      }

      // 预先激活侧边栏（在新页面渲染前就激活，实现完全同步）
      if (window.pjaxPreActivateSidebar) {
        requestAnimationFrame(() => {
          window.pjaxPreActivateSidebar(url);
        });
      }
    });

    // ============================================================
    // 页面切换后的处理（重新初始化 JavaScript）
    // ============================================================
    pjax.on('after', ({ url }) => {
      console.log('[Pjax] ✅ 页面切换完成:', url);

      // 触发 pjax:complete 事件，供其他脚本监听（如 mermaid、table-wrapper、code-group）
      document.dispatchEvent(new CustomEvent('pjax:complete', { detail: { url } }));

      // === 优先级1：立即执行 - 关键路径脚本 ===

      // 🆕 Simple Sidebar重新初始化（同分类内切换）
      if (window.simpleSidebarReinit) {
        console.log('[Pjax] 📂 重新初始化sidebar激活状态');
        window.simpleSidebarReinit();
      }

      // 侧边栏折叠交互
      // 注释掉：sidebar-dynamic.js 已经有完整的 Pjax 钩子和事件绑定
      // if (window.initSidebarToggle) {
      //   console.log('[Pjax] 🔧 重新初始化侧边栏折叠功能');
      //   window.initSidebarToggle();
      // }

      // 分享按钮初始化
      if (window.initShareButton) {
        window.initShareButton();
      }

      // 折叠所有导航下拉框
      const dropdownButtons = document.querySelectorAll('.VPFlyout .button[aria-expanded="true"]');
      dropdownButtons.forEach(button => {
        button.setAttribute('aria-expanded', 'false');
      });

      // TOC 高亮：立即执行，实现同步更新
      if (window.initTocHighlight) {
        requestAnimationFrame(() => {
          console.log('[Pjax] 📝 重新初始化 TOC 高亮');
          window.initTocHighlight();
        });
      }

      // === 优先级2：异步执行 - 代码高亮 ===

      const highlightCode = () => {
        if (window.Prism) {
          const swupContainer = document.querySelector('#swup');
          if (swupContainer) {
            Prism.highlightAllUnder(swupContainer);
            console.log('[Pjax] 🎨 代码高亮完成');
          }
        }
      };

      // 使用 requestIdleCallback 延迟高亮，避免阻塞主线程
      if ('requestIdleCallback' in window) {
        requestIdleCallback(highlightCode, { timeout: 2000 });
      } else {
        setTimeout(highlightCode, 50);
      }

      // === 优先级3：延迟执行 - 低优先级脚本 ===

      const lowPriorityTasks = [
        () => window.initLazyLoad && window.initLazyLoad(),
        () => window.initSearch && window.initSearch(),
        () => window.initMobileFab && window.initMobileFab(),
        () => window.initMobileToolbar && window.initMobileToolbar(),
        () => window.initCodeBlocksVitePress && window.initCodeBlocksVitePress(),
        () => window.initTocTooltip && window.initTocTooltip(),
        () => window.initTocResize && window.initTocResize(),
        () => window.initAppreciation && window.initAppreciation(),
        () => window.initInlineToc && window.initInlineToc(),
        () => window.initWechatUnlock && window.initWechatUnlock(),
        () => window.CodeGroup && window.CodeGroup.init()
      ];

      // 使用任务队列分批执行，避免长任务
      const processTask = () => {
        if (lowPriorityTasks.length > 0) {
          const task = lowPriorityTasks.shift();
          task();
          // 再次调度下一个任务
          setTimeout(processTask, 10);
        }
      };

      // 启动任务队列
      setTimeout(processTask, 100);

      // 侧边栏激活状态：双重 requestAnimationFrame 确保DOM完全更新后再执行
      // 第一帧：等待 DOM 更新
      requestAnimationFrame(() => {
        // 第二帧：DOM 已完全更新，立即激活侧边栏
        requestAnimationFrame(() => {
          if (window.initSidebarEvents) {
            console.log('[Pjax] 📂 初始化侧边栏事件');
            window.initSidebarEvents();
          }
          
          if (window.setActiveSidebarItem) {
            console.log('[Pjax] ✅ 设置侧边栏激活状态');
            window.setActiveSidebarItem();
            if (window.expandToActiveItem) {
              window.expandToActiveItem();
            }
          }
        });
      });

      // 评论系统单独处理 - 确保在 DOM 稳定后初始化
      setTimeout(() => {
        if (window.initTwikoo && document.getElementById('tcomment')) {
          console.log('[Pjax] 💬 准备初始化评论系统');
          window.initTwikoo();
        }
      }, 300);

      // 更新 Google Analytics（如果可用）
      if (window.gtag) {
        gtag('config', window.GA_MEASUREMENT_ID || 'G-XXXXXXXXXX', {
          page_path: url
        });
      }
    });

    // ============================================================
    // 错误处理
    // ============================================================
    pjax.on('error', ({ url, error }) => {
      console.error('[Pjax] ❌ 页面切换失败:', url, error);
      // PjaxLite 会自动降级到完整刷新
    });

    // ============================================================
    // 性能监控
    // ============================================================
    let navigationStart = 0;

    pjax.on('before', () => {
      navigationStart = Date.now();

      if (window.performance && window.performance.mark) {
        performance.mark('pjax-navigation-start');
      }
    });

    pjax.on('after', ({ url }) => {
      const duration = Date.now() - navigationStart;

      if (window.performance && window.performance.mark) {
        performance.mark('pjax-navigation-end');
        performance.measure('pjax-navigation', 'pjax-navigation-start', 'pjax-navigation-end');
      }

      console.log(`[Pjax] ⚡ 页面切换耗时: ${duration}ms`);

      // 发送到 Google Analytics（如果可用）
      if (window.gtag) {
        gtag('event', 'page_transition', {
          event_category: 'Navigation',
          event_label: url,
          value: duration
        });
      }
    });

    // 将 pjax 实例挂载到 window，供其他脚本使用
    window.pjax = pjax;

    console.log('[Pjax] ✅ 初始化完成');
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPjax);
  } else {
    initPjax();
  }
})();
