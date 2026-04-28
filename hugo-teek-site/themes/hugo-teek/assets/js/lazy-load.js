// Lazy Loading - 按行自动加载（首页）/ IntersectionObserver（其他页）
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    /* 🖼️ 为所有已有图片添加错误处理监听 */
    initImageErrorHandling();

    // 检测是否为首页文章卡片图片
    const isHomePage = document.querySelector('.post-grid') !== null;

    if (!isHomePage) {
      // 非首页使用 IntersectionObserver
      initDefaultLazyLoad();
      return;
    }

    // 首页：按行自动加载所有图片
    const articleCards = document.querySelectorAll('.article-card-compact');

    // 根据屏幕宽度计算列数
    const isMobile = window.innerWidth < 768;
    const columnsPerRow = isMobile ? 1 : 3;  // 移动端1列，PC端3列

    // 收集所有卡片图片
    const cardImages = [];
    articleCards.forEach(function(card, index) {
      const img = card.querySelector('img[loading="lazy"]');
      if (img) {
        img.classList.add('lazy-image');
        img.dataset.cardIndex = index;

        // 计算卡片所在行号（从0开始）
        const rowIndex = Math.floor(index / columnsPerRow);
        img.dataset.rowIndex = rowIndex;

        cardImages.push(img);
      }
    });

    // 按行分组加载
    cardImages.forEach(function(img) {
      const rowIndex = parseInt(img.dataset.rowIndex);

      if (rowIndex < 2) {
        // 前2行：立即加载，无动画
        img.classList.add('instant-load');
        loadImage(img);
      } else {
        // 后续行：按行延迟加载，同行同时飘上来
        const delay = (rowIndex - 2) * 100;  // 每行间隔100ms

        setTimeout(function() {
          loadImage(img, true);  // 第二个参数表示需要动画
        }, delay);
      }
    });
  });

  /**
   * 加载图片
   * @param {HTMLImageElement} img - 图片元素
   * @param {boolean} withAnimation - 是否显示动画
   */
  function loadImage(img, withAnimation) {
    /* 🖼️ 如果图片已经有 src 属性，跳过（使用浏览器原生懒加载） */
    if (!img.dataset.src) {
      /* ✅ 如果有 src 但没有 data-src，直接标记为已加载 */
      if (img.src) {
        if (withAnimation) {
          requestAnimationFrame(function() {
            img.classList.add('lazy-loaded');
          });
        }
      }
      return;
    }

    const srcUrl = img.dataset.src;

    /* 🎲 检测是否为随机图片API（需要特殊处理重定向） */
    const isRandomApi = img.dataset.randomApi === 'true' ||
                        srcUrl.includes('imgapi') ||
                        srcUrl.includes('random');

    if (isRandomApi) {
      /* 🔄 随机API：通过fetch获取真实图片URL（处理302重定向） */
      loadRandomApiImage(img, srcUrl, withAnimation);
    } else {
      /* ✅ 普通图片：直接加载 */
      img.src = srcUrl;
      img.removeAttribute('data-src');

      img.addEventListener('load', function() {
        if (withAnimation) {
          requestAnimationFrame(function() {
            img.classList.add('lazy-loaded');
          });
        }
      });

      img.addEventListener('error', function() {
        console.warn('❌ Failed to load image:', img.src);
        handleImageError(img);
      });
    }
  }

  /**
   * 🎲 加载随机API图片 - 处理302重定向获取真实URL
   * @param {HTMLImageElement} img - 图片元素
   * @param {string} apiUrl - 随机API地址
   * @param {boolean} withAnimation - 是否显示动画
   */
  function loadRandomApiImage(img, apiUrl, withAnimation) {
    /* ⏱️ 设置超时防止请求挂起 */
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); /* ◀️ 10秒超时 */

    fetch(apiUrl, {
      method: 'HEAD', /* ◀️ 使用HEAD请求减少数据传输 */
      signal: controller.signal,
      redirect: 'manual' /* ◀️ 手动处理重定向以获取真实URL */
    }).then(response => {
      clearTimeout(timeout);

      let finalUrl = apiUrl;

      /* 🔍 尝试从响应中获取真实URL */
      if (response.type === 'opaqueredirect' || response.status === 0) {
        /* 📝 浏览器阻止了重定向信息，直接使用API URL让img标签自己处理 */
        finalUrl = apiUrl;
      } else if (response.redirected) {
        /* ✅ 获取到重定向后的真实URL */
        finalUrl = response.url;
      } else if (response.headers.get('location')) {
        /* ✅ 从location头获取 */
        finalUrl = response.headers.get('location');
      }

      /* 🖼️ 设置图片src */
      img.src = finalUrl;
      img.removeAttribute('data-src');

      img.addEventListener('load', function() {
        if (withAnimation) {
          requestAnimationFrame(function() {
            img.classList.add('lazy-loaded');
          });
        }
      });

      img.addEventListener('error', function() {
        console.warn('❌ Failed to load random API image:', finalUrl);
        /* 🔄 错误时尝试直接使用API URL（让浏览器处理重定向） */
        if (img.src !== apiUrl) {
          img.src = apiUrl;
        } else {
          handleImageError(img);
        }
      });

    }).catch(error => {
      clearTimeout(timeout);
      console.warn('⚠️ Random API fetch failed, falling back to direct load:', error);
      /* 🔄 fetch失败时，直接让img标签加载API URL */
      img.src = apiUrl;
      img.removeAttribute('data-src');

      img.addEventListener('load', function() {
        if (withAnimation) {
          requestAnimationFrame(function() {
            img.classList.add('lazy-loaded');
          });
        }
      });

      img.addEventListener('error', function() {
        console.warn('❌ Failed to load random API image:', apiUrl);
        handleImageError(img);
      });
    });
  }

  /**
   * 非首页默认懒加载逻辑（IntersectionObserver）
   */
  function initDefaultLazyLoad() {
    // 清理旧的 observer（如果存在）
    if (window._lazyLoadObserver) {
      window._lazyLoadObserver.disconnect();
      console.log('[LazyLoad] 🧹 清理旧的 IntersectionObserver');
    }

    // 降级处理：不支持 IntersectionObserver 的浏览器
    if (!('IntersectionObserver' in window)) {
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      lazyImages.forEach(function(img) {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
      return;
    }

    const imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          // 只处理有 data-src 的图片，已经有 src 的使用浏览器原生懒加载
          if (img.dataset.src) {
            loadImage(img, true);
          }
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '200px 0px',  // 🆕 提前 200px 加载 (更激进的策略)
      threshold: 0.01
    });

    // 保存 observer 引用以便后续清理
    window._lazyLoadObserver = imageObserver;

    // 🆕 优先加载关键图片 (首屏、高优先级)
    const criticalImages = document.querySelectorAll('img[data-priority="high"], img[loading="eager"]');
    criticalImages.forEach(function(img) {
      if (img.dataset.src) {
        loadImage(img, false);  // 立即加载，无动画
      }
    });

    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(function(img) {
      // 只观察需要手动懒加载的图片（有 data-src 的）
      if (img.dataset.src) {
        img.classList.add('lazy-image');
        imageObserver.observe(img);
      }
    });
  }

  // 🆕 智能链接预加载 - 鼠标悬停时预取 HTML
  function initLinkPrefetch() {
    let prefetchTimeout;
    const prefetchedLinks = new Set();

    document.addEventListener('mouseover', function(e) {
      const link = e.target.closest('a[href^="/"]');

      // 排除条件：没有链接、已预取、Swup 管理的链接
      if (!link || prefetchedLinks.has(link.href) || link.dataset.noSwup) {
        return;
      }

      clearTimeout(prefetchTimeout);
      prefetchTimeout = setTimeout(() => {
        // 使用 <link rel="prefetch"> 预取页面
        const prefetch = document.createElement('link');
        prefetch.rel = 'prefetch';
        prefetch.href = link.href;
        prefetch.as = 'document';
        document.head.appendChild(prefetch);

        prefetchedLinks.add(link.href);
        console.log('[Prefetch] 🔗', link.href);
      }, 200);  // 悬停 200ms 后触发
    }, { passive: true });
  }

  // 初始化链接预加载 (仅在非 Swup 页面或作为后备方案)
  if (!window.swup) {
    initLinkPrefetch();
  }

  // 导出全局函数供 Pjax 重新初始化使用
  window.initLazyLoad = initDefaultLazyLoad;

  /**
   * 🖼️ 初始化图片错误处理
   */
  function initImageErrorHandling() {
    /* 获取所有带有 loading="lazy" 属性的图片 */
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    lazyImages.forEach(function(img) {
      /* 跳过已经处理过的图片 */
      if (img.dataset.errorInit === 'true') {
        return;
      }
      img.dataset.errorInit = 'true';

      /* 如果图片已经在 img-error-wrapper 中，初始化加载状态 */
      const parent = img.parentElement;
      if (parent && parent.classList.contains('img-error-wrapper')) {
        initImageLoadingState(img);
      }
    });

    /* 处理文档内容中的图片（没有 wrapper 的） */
    const docImages = document.querySelectorAll('.vp-doc img, .content-container img, .post-content img');
    docImages.forEach(function(img) {
      if (img.dataset.errorInit === 'true') {
        return;
      }
      img.dataset.errorInit = 'true';

      /* 为图片创建 wrapper 并初始化加载状态 */
      wrapImageWithLoadingState(img);
    });
  }

  /**
   * ⏳ 初始化图片加载状态 - 显示占位图直到加载完成
   * @param {HTMLImageElement} img - 图片元素
   */
  function initImageLoadingState(img) {
    const parent = img.parentElement;
    if (!parent || !parent.classList.contains('img-error-wrapper')) {
      return;
    }

    /* 检查图片是否已经加载完成 */
    if (img.complete) {
      if (img.naturalWidth === 0) {
        /* ❌ 图片加载失败 */
        handleImageError(img);
      } else {
        /* ✅ 图片已加载完成，确保显示图片 */
        showLoadedImage(img);
      }
      return;
    }

    /* 图片还在加载中，显示占位图 */
    showLoadingPlaceholder(img);

    /* 监听加载完成事件 */
    img.addEventListener('load', function() {
      showLoadedImage(img);
    });

    /* 监听加载失败事件 */
    img.addEventListener('error', function() {
      handleImageError(img);
    });
  }

  /**
   * 📦 为图片添加包装器并初始化加载状态
   * @param {HTMLImageElement} img - 图片元素
   */
  function wrapImageWithLoadingState(img) {
    /* 如果已经处理过，跳过 */
    if (img.dataset.errorHandled === 'true') {
      return;
    }

    /* 获取图片的父元素 */
    const parent = img.parentElement;
    if (!parent) {
      return;
    }

    /* 如果父元素已经是 wrapper，直接初始化加载状态 */
    if (parent.classList.contains('img-error-wrapper')) {
      initImageLoadingState(img);
      return;
    }

    /* 创建 wrapper */
    const wrapper = document.createElement('span');
    wrapper.className = 'img-error-wrapper';

    /* 将图片移动到 wrapper 中 */
    parent.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    /* 初始化加载状态 */
    initImageLoadingState(img);
  }

  /**
   * ⏳ 显示加载中占位图
   * @param {HTMLImageElement} img - 图片元素
   */
  function showLoadingPlaceholder(img) {
    const parent = img.parentElement;
    if (!parent) {
      return;
    }

    /* 先隐藏图片 */
    img.style.opacity = '0';

    /* 检查是否已经有占位图 */
    let placeholder = parent.querySelector('.img-error-placeholder');
    if (!placeholder) {
      /* 创建占位图容器 */
      placeholder = document.createElement('div');
      placeholder.className = 'img-error-placeholder';

      /* 创建动画容器 */
      const animation = document.createElement('div');
      animation.className = 'img-error-placeholder__animation';

      /* 创建粉色元素 */
      const girl = document.createElement('span');
      girl.className = 'img-error-placeholder__girl';

      /* 创建蓝色容器 */
      const boys = document.createElement('div');
      boys.className = 'img-error-placeholder__boys';

      /* 创建4个元素 */
      for (let i = 0; i < 4; i++) {
        const boy = document.createElement('span');
        boy.className = 'img-error-placeholder__boy';
        boys.appendChild(boy);
      }

      /* 组装动画结构 */
      animation.appendChild(girl);
      animation.appendChild(boys);
      placeholder.appendChild(animation);

      /* 将占位图插入到父容器中 */
      parent.appendChild(placeholder);
    }

    /* 显示占位图 */
    placeholder.style.display = 'flex';
    parent.classList.add('is-loading');
  }

  /**
   * ✅ 显示已加载完成的图片
   * @param {HTMLImageElement} img - 图片元素
   */
  function showLoadedImage(img) {
    const parent = img.parentElement;
    if (!parent) {
      return;
    }

    /* 隐藏占位图 */
    const placeholder = parent.querySelector('.img-error-placeholder');
    if (placeholder) {
      placeholder.style.display = 'none';
    }

    /* 显示图片 */
    img.style.opacity = '1';
    img.style.display = 'block';

    /* 移除加载中标记 */
    parent.classList.remove('is-loading');
    parent.classList.add('is-loaded');
  }

  /**
   * 📦 为图片添加错误处理包装器
   * @param {HTMLImageElement} img - 图片元素
   */
  function wrapImageWithErrorHandler(img) {
    /* 如果已经处理过，跳过 */
    if (img.dataset.errorHandled === 'true') {
      return;
    }

    /* 获取图片的父元素 */
    const parent = img.parentElement;
    if (!parent) {
      return;
    }

    /* 如果父元素已经是 wrapper，直接处理 */
    if (parent.classList.contains('img-error-wrapper')) {
      handleImageError(img);
      return;
    }

    /* 创建 wrapper 并替换图片 */
    const wrapper = document.createElement('span');
    wrapper.className = 'img-error-wrapper';

    /* 将图片移动到 wrapper 中 */
    parent.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    /* 调用错误处理函数 */
    handleImageError(img);
  }

  /**
   * 🖼️ 处理图片加载失败 - 显示16:9动画占位图
   * @param {HTMLImageElement} img - 加载失败的图片元素
   */
  function handleImageError(img) {
    /* 如果已经处理过，跳过 */
    if (img.dataset.errorHandled === 'true') {
      return;
    }
    img.dataset.errorHandled = 'true';

    /* 获取图片的父容器 */
    const parent = img.parentElement;
    if (!parent) {
      return;
    }

    /* 隐藏原始图片 */
    img.style.display = 'none';

    /* 检查是否已经有占位图 */
    const existingPlaceholder = parent.querySelector('.img-error-placeholder');
    if (existingPlaceholder) {
      existingPlaceholder.style.display = 'flex';
      return;
    }

    /* 创建占位图容器 */
    const placeholder = document.createElement('div');
    placeholder.className = 'img-error-placeholder';

    /* 创建动画容器 */
    const animation = document.createElement('div');
    animation.className = 'img-error-placeholder__animation';

    /* 创建女孩元素 */
    const girl = document.createElement('span');
    girl.className = 'img-error-placeholder__girl';

    /* 创建男孩们容器 */
    const boys = document.createElement('div');
    boys.className = 'img-error-placeholder__boys';

    /* 创建4个男孩元素 */
    for (let i = 0; i < 4; i++) {
      const boy = document.createElement('span');
      boy.className = 'img-error-placeholder__boy';
      boys.appendChild(boy);
    }

    /* 组装动画结构 */
    animation.appendChild(girl);
    animation.appendChild(boys);
    placeholder.appendChild(animation);

    /* 将占位图插入到父容器中 */
    parent.appendChild(placeholder);

    /* 给父容器添加标记类 */
    parent.classList.add('img-error-wrapper', 'has-error');
  }

  /* 🔗 导出全局函数供其他脚本使用 */
  window.handleImageError = handleImageError;
})();
