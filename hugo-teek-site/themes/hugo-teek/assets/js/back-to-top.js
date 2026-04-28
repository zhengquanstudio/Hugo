/* 🚀 火箭导航轮盘 - 滚动控制与交互功能 */
/* 🕊️ 白木开发 火箭导航轮盘功能 🔗https://gl.baimu.live/ */
(function() {
  const rocketWheel = document.getElementById('rocket-wheel');
  const backToTopBtn = document.getElementById('back-to-top');
  if (!rocketWheel || !backToTopBtn) return;

  const progressBar = backToTopBtn.querySelector('.progress-circle-bar');
  const radius = 30; /* ◀️ VP使用r=30 */
  const circumference = 2 * Math.PI * radius; /* ◀️ 188.5 */

  let ticking = false;
  let isLaunching = false;
  let isWheelOpen = false;

  /* 🔘 轮盘按钮元素 */
  const wheelScrollTopBtn = document.getElementById('wheel-scroll-top');
  const wheelScrollBottomBtn = document.getElementById('wheel-scroll-bottom');

  /* 📊 更新进度圆环和按钮可见性 */
  function updateProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = scrollHeight <= 0 ? 0 : Math.min(Math.max(scrollTop / scrollHeight, 0), 1);

    /* ◀️ 更新进度圆环（VP样式：从188.5减少到0） */
    const offset = circumference * (1 - scrollPercent);
    if (progressBar) {
      progressBar.style.strokeDashoffset = offset;
    }

    /* ◀️ 根据滚动位置显示/隐藏按钮 */
    if (scrollTop > 100) { /* ◀️ VP使用100px阈值 */
      rocketWheel.classList.add('visible');
    } else {
      rocketWheel.classList.remove('visible');
      /* ◀️ 隐藏时关闭轮盘 */
      closeWheel();
    }

    ticking = false;
  }

  /* 🎯 切换轮盘显示状态 */
  function toggleWheel() {
    if (isWheelOpen) {
      closeWheel();
    } else {
      openWheel();
    }
  }

  /* 📂 打开轮盘 */
  function openWheel() {
    isWheelOpen = true;
    rocketWheel.classList.add('wheel-open');
    backToTopBtn.setAttribute('aria-label', '关闭导航');
    backToTopBtn.setAttribute('title', '关闭导航');
  }

  /* 📁 关闭轮盘 */
  function closeWheel() {
    isWheelOpen = false;
    rocketWheel.classList.remove('wheel-open');
    backToTopBtn.setAttribute('aria-label', '打开导航');
    backToTopBtn.setAttribute('title', '打开导航');
  }

  /* ⬆️ 平滑滚动到顶部 */
  function scrollToTop() {
    if (isLaunching) return;

    /* ◀️ 设置发射状态 */
    isLaunching = true;
    backToTopBtn.classList.add('launching');

    /* ◀️ 关闭轮盘 */
    closeWheel();

    /* ◀️ 立即开始滚动 */
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    /* ◀️ 监听滚动结束，重置发射状态 */
    const checkScrollEnd = () => {
      if (window.scrollY <= 0) {
        setTimeout(() => {
          isLaunching = false;
          backToTopBtn.classList.remove('launching');
        }, 300);
        window.removeEventListener('scroll', checkScrollEnd);
      }
    };

    window.addEventListener('scroll', checkScrollEnd);
  }

  /* ⬇️ 平滑滚动到底部 */
  function scrollToBottom() {
    /* ◀️ 关闭轮盘 */
    closeWheel();

    /* ◀️ 获取页面最大滚动高度 */
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    window.scrollTo({
      top: scrollHeight,
      behavior: 'smooth'
    });
  }

  /* 🖱️ 事件监听器 - 使用requestAnimationFrame优化 */
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });

  /* 🚀 火箭按钮点击 - 切换轮盘 */
  backToTopBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleWheel();
  });

  /* 🔝 轮盘顶部按钮 */
  if (wheelScrollTopBtn) {
    wheelScrollTopBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      scrollToTop();
    });
  }

  /* 🔚 轮盘底部按钮 */
  if (wheelScrollBottomBtn) {
    wheelScrollBottomBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      scrollToBottom();
    });
  }

  /* 🌐 点击页面其他地方关闭轮盘 */
  document.addEventListener('click', function(e) {
    if (isWheelOpen && !rocketWheel.contains(e.target)) {
      closeWheel();
    }
  });

  /* ⌨️ 按ESC键关闭轮盘 */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isWheelOpen) {
      closeWheel();
    }
  });

  /* 🔄 初始调用 */
  updateProgress();
})();

/* 💬 跳转到评论区按钮功能 */
(function() {
  const commentBtn = document.getElementById('scroll-to-comment');
  if (!commentBtn) {
    console.log('[评论按钮] 未找到 #scroll-to-comment 元素');
    return;
  }

  /* 🔍 查找评论区容器（多种方式尝试） */
  function findCommentSection() {
    /* ◀️ 优先查找包裹容器 */
    let section = document.querySelector('.tk-doc-comment');
    if (section) return section;

    /* ◀️ 查找Twikoo渲染后的容器 */
    section = document.getElementById('twikoo');
    if (section) return section;

    /* ◀️ 查找初始容器 */
    section = document.getElementById('tcomment');
    if (section) return section;

    return null;
  }

  let commentSection = findCommentSection();

  /* ◀️ 如果一开始找不到，等待一段时间后重试（Twikoo可能还在加载） */
  if (!commentSection) {
    console.log('[评论按钮] 评论区还未加载，等待重试...');
    setTimeout(() => {
      commentSection = findCommentSection();
      if (commentSection) {
        console.log('[评论按钮] 评论区加载完成，初始化成功');
        initCommentButton();
      } else {
        console.log('[评论按钮] 未找到评论区容器，按钮将保持隐藏');
      }
    }, 1000);
    return;
  }

  console.log('[评论按钮] 初始化成功', {
    按钮: commentBtn,
    评论区: commentSection
  });

  initCommentButton();

  function initCommentButton() {
    if (!commentSection) {
      commentSection = findCommentSection();
      if (!commentSection) return;
    }

    let ticking = false;

    /* ◀️ 根据滚动位置显示/隐藏按钮 */
    function updateCommentBtnVisibility() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const commentPosition = commentSection.getBoundingClientRect().top + scrollTop;
      const windowHeight = window.innerHeight;

      const shouldShow = scrollTop > 300 && scrollTop + windowHeight < commentPosition;

      /* ◀️ 显示按钮：滚动超过300px 且 还没到达评论区 */
      if (shouldShow) {
        commentBtn.classList.add('visible');
      } else {
        commentBtn.classList.remove('visible');
      }

      ticking = false;
    }

    /* ◀️ 平滑滚动到评论区 */
    function scrollToComment() {
      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--vp-nav-height')) || 64;
      const offset = navHeight + 20; /* ◀️ 额外20px间距 */

      const commentPosition = commentSection.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top: commentPosition,
        behavior: 'smooth'
      });
    }

    /* 🖱️ 事件监听器 - 使用requestAnimationFrame优化 */
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(updateCommentBtnVisibility);
        ticking = true;
      }
    }, { passive: true });

    commentBtn.addEventListener('click', scrollToComment);

    /* 🔄 初始调用 */
    updateCommentBtnVisibility();
  }
})();

/* 📱 移动端文档工具功能 - 960px-1279px 断点专用 */
/* 🕊️ 白木开发 移动端文档工具 🔗https://gl.baimu.live/ */
(function() {
  const mobileDocTools = document.getElementById('mobile-doc-tools');
  const mobileDocToolsBtn = document.getElementById('mobile-doc-tools-btn');
  const mobileDocToolsMenu = document.getElementById('mobile-doc-tools-menu');
  const mobileTocBtn = document.getElementById('mobile-toc-btn');
  const mobileShareBtn = document.getElementById('mobile-share-btn');

  /* ◀️ 检查必要元素是否存在（页面无TOC时不会渲染） */
  if (!mobileDocTools || !mobileDocToolsBtn || !mobileDocToolsMenu) {
    return;
  }

  let isToolsMenuOpen = false;

  /* 🎯 切换工具菜单显示状态 */
  function toggleToolsMenu() {
    if (isToolsMenuOpen) {
      closeToolsMenu();
    } else {
      openToolsMenu();
    }
  }

  /* 📂 打开工具菜单 */
  function openToolsMenu() {
    isToolsMenuOpen = true;
    mobileDocTools.classList.add('tools-menu-open');
    mobileDocToolsBtn.setAttribute('aria-label', '关闭工具菜单');
    mobileDocToolsBtn.setAttribute('title', '关闭工具菜单');
  }

  /* 📁 关闭工具菜单 */
  function closeToolsMenu() {
    isToolsMenuOpen = false;
    mobileDocTools.classList.remove('tools-menu-open');
    mobileDocToolsBtn.setAttribute('aria-label', '文档工具');
    mobileDocToolsBtn.setAttribute('title', '文档工具');
  }

  /* 📑 打开本页导航抽屉 */
  function openTocDrawer() {
    closeToolsMenu();

    /* ◀️ 查找移动端 TOC 抽屉 */
    const tocDrawer = document.getElementById('mobile-toc-drawer');
    if (tocDrawer) {
      tocDrawer.classList.add('is-open');
      document.body.style.overflow = 'hidden'; /* ◀️ 禁止背景滚动 */

      /* ◀️ 绑定关闭按钮事件 */
      const tocCloseBtn = document.getElementById('mobile-toc-close');
      if (tocCloseBtn && !tocCloseBtn.dataset.eventBound) {
        tocCloseBtn.dataset.eventBound = 'true';
        tocCloseBtn.addEventListener('click', closeTocDrawer);
      }

      /* ◀️ 绑定 TOC 链接点击事件 */
      const tocLinks = tocDrawer.querySelectorAll('.mobile-toc-link');
      tocLinks.forEach(function (link) {
        if (!link.dataset.eventBound) {
          link.dataset.eventBound = 'true';
          link.addEventListener('click', function (e) {
            e.preventDefault();
            const hash = decodeURIComponent(link.getAttribute('href') || '').replace(/^#/, '');
            if (!hash) return;

            const heading = document.getElementById(hash);
            if (heading) {
              closeTocDrawer();

              /* ◀️ 延迟滚动到目标位置 */
              setTimeout(function () {
                const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--vp-nav-height')) || 64;
                const offset = navHeight + 20;
                const targetPosition = heading.getBoundingClientRect().top + window.pageYOffset - offset;

                window.scrollTo({
                  top: targetPosition,
                  behavior: 'smooth'
                });

                history.replaceState(null, '', '#' + hash);
              }, 300);
            }
          });
        }
      });
    } else {
      /* ◀️ 如果没有找到抽屉，显示提示 */
      showNotification('本页暂无导航内容', 'info');
    }
  }

  /* 📁 关闭本页导航抽屉 */
  function closeTocDrawer() {
    const tocDrawer = document.getElementById('mobile-toc-drawer');
    if (tocDrawer) {
      tocDrawer.classList.remove('is-open');
      document.body.style.overflow = ''; /* ◀️ 恢复背景滚动 */
    }
  }

  /* 🔗 分享本文功能 */
  function shareArticle() {
    closeToolsMenu();

    /* ◀️ 获取分享链接 */
    const shareUrl = mobileShareBtn ? mobileShareBtn.getAttribute('data-share-url') : window.location.href;

    if (!shareUrl) {
      /* ◀️ 使用桌面端横幅提示 */
      if (typeof showCopyBanner === 'function') {
        showCopyBanner('分享链接获取失败，请手动复制');
      }
      return;
    }

    /* ◀️ 复制到剪贴板 */
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        /* ◀️ 使用桌面端横幅提示 */
        if (typeof showCopyBanner === 'function') {
          showCopyBanner('链接已复制到剪贴板，去分享吧！');
        }
      }).catch(() => {
        /* ◀️ 降级方案 */
        fallbackCopyText(shareUrl);
      });
    } else {
      /* ◀️ 降级方案 */
      fallbackCopyText(shareUrl);
    }
  }

  /* 📋 降级复制方案 */
  function fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      /* ◀️ 使用桌面端横幅提示 */
      if (typeof showCopyBanner === 'function') {
        showCopyBanner('链接已复制到剪贴板，去分享吧！');
      }
    } catch (err) {
      /* ◀️ 使用桌面端横幅提示 */
      if (typeof showCopyBanner === 'function') {
        showCopyBanner('复制失败，请手动复制链接');
      }
    }

    document.body.removeChild(textarea);
  }

  /* 🖱️ 事件监听器 */
  mobileDocToolsBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleToolsMenu();
  });

  /* 📑 本页导航按钮 */
  if (mobileTocBtn) {
    mobileTocBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      openTocDrawer();
    });
  }

  /* 🔗 分享按钮 */
  if (mobileShareBtn) {
    mobileShareBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      shareArticle();
    });
  }

  /* 🌐 点击页面其他地方关闭菜单 */
  document.addEventListener('click', function(e) {
    if (isToolsMenuOpen && !mobileDocTools.contains(e.target)) {
      closeToolsMenu();
    }
  });

  /* ⌨️ 按ESC键关闭菜单或抽屉 */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (isToolsMenuOpen) {
        closeToolsMenu();
      }
      /* ◀️ 同时检查并关闭 TOC 抽屉 */
      const tocDrawer = document.getElementById('mobile-toc-drawer');
      if (tocDrawer && tocDrawer.classList.contains('is-open')) {
        closeTocDrawer();
      }
    }
  });

  console.log('[移动端文档工具] 初始化成功');
})();
