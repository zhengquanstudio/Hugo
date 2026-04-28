// Mobile menu toggle
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navBar = document.querySelector('.VPNavBar');

    if (!mobileMenuToggle || !navBar) {
      return;
    }

    const closeMenu = () => {
      navBar.classList.remove('is-mobile-open');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    };

    mobileMenuToggle.addEventListener('click', function (event) {
      event.stopPropagation();
      const isOpen = navBar.classList.toggle('is-mobile-open');
      mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', function (event) {
      if (!navBar.contains(event.target)) {
        closeMenu();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) {
        closeMenu();
      }
    });
  });
})();

/* 🔗 当在首页的时候，页面滚动10%后
 * 点击导航栏的LOGO，则回到页面顶部
 * 如果已在顶部区域，则直接刷新页面
 * 酉 白木 gl.baimu.live 开发
*/
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    /* 🎯 获取LOGO链接元素（桌面端和移动端） */
    const logoLinks = document.querySelectorAll('.VPNavBarTitle .title, .mobile-avatar');

    logoLinks.forEach(function (logoLink) {
      logoLink.addEventListener('click', function (event) {
        /* 📏 获取当前滚动位置 */
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        /* 🏠 如果已经在页面顶部（滚动距离小于等于10px），则刷新页面 */
        if (scrollTop <= 10) {
          /* 🔄 已在顶部，允许默认行为（刷新页面） */
          return;
        }

        /* ⬆️ 如果已经滚动过，阻止默认跳转行为，平滑滚动到顶部 */
        event.preventDefault();

        /* 🌟 平滑滚动到页面顶部 */
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    });
  });
})();

/* 🎉 Hero区域向下滚动指示器点击事件 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const scrollIndicator = document.querySelector('.hero-scroll-indicator');

    if (scrollIndicator) {
      scrollIndicator.addEventListener('click', function () {
        /* 📄 滚动到文章内容区域（而不是固定的innerHeight） */
        const contentSection = document.querySelector('.home-content-section');

        if (contentSection) {
          /* 📐 获取导航栏高度（导航栏是固定定位，需要减去其高度） */
          const navBar = document.querySelector('.VPNavBar');
          const navHeight = navBar ? navBar.offsetHeight : 64; /* ◀️ 默认64px */

          /* 🎯 获取内容区域的顶部位置，减去导航栏高度 */
          const targetPosition = contentSection.offsetTop - navHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        } else {
          /* 🔄 如果找不到内容区域，回退到默认行为 */
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        }
      });
    }
  });
})();

/* 🎊 导航栏网站名称逐字跳动动画初始化 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    /* 🎯 获取网站名称元素 */
    const bloggerName = document.querySelector('.VPNavBarTitle .blogger-name');

    if (!bloggerName) {
      return;
    }

    /* 📝 获取原始文本内容 */
    const text = bloggerName.textContent || '';

    /* 🎭 将每个字符包裹在span标签中 */
    const chars = text.split('').map(function (char) {
      /* 🎨 创建字符包裹元素 */
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char;
      return span;
    });

    /* 🔄 清空原内容并添加字符元素 */
    bloggerName.innerHTML = '';
    chars.forEach(function (charSpan) {
      bloggerName.appendChild(charSpan);
    });
  });
})();
