// Hero Background Image Slider - 高性能混合模式
class HeroBgSlider {
  constructor(images, options = {}) {
    this.images = images || [];
    this.staticImages = [];  // 静态图片列表（优先级最高）
    this.currentIndex = 0;
    this.interval = options.interval || 8000;
    this.autoPlay = options.autoPlay !== false;

    // 配置项
    this.config = {
      mode: options.mode || 'hybrid',  // hybrid | static | api
      useStaticFirst: options.useStaticFirst !== false,
      apiUrl: options.apiUrl || null,
      apiEnabled: options.apiEnabled !== false,
      apiCacheDuration: options.apiCacheDuration || 3600,

      // 性能优化配置
      performance: {
        preloadCount: options.preloadCount || 3,
        lazyLoadDelay: options.lazyLoadDelay || 500,
        predictivePreload: options.predictivePreload !== false,
        pauseOnHidden: options.pauseOnHidden !== false
      },

      // 响应式图片配置
      responsive: {
        mobile: {
          width: 1080,
          height: 720,
          quality: 75,
          breakpoint: 768
        },
        desktop: {
          width: 1920,
          height: 1080,
          quality: 85
        }
      }
    };

    this.heroSection = document.querySelector('.hero-section-fullscreen');
    this.navBar = document.querySelector('.VPNavBar');  // 导航栏元素

    // VP风格的切换状态管理
    this.isTransitioning = false;  // 是否正在切换中
    this.pendingSwitchQueue = [];  // 待处理的切换队列
    this.nextPreloadTimer = null;  // 预测性预加载定时器

    // 亮度检测缓存
    this.brightnessCache = new Map();

    // 滚动位置检测状态
    this.currentDetectionMode = 'wallpaper';  // 'wallpaper' | 'article'

    if (!this.heroSection) {
      return;
    }

    this.init();
  }

  async init() {
    /* console.log('🎨 Hero 背景系统初始化中...', `模式: ${this.config.mode}`); */

    // 混合模式加载逻辑
    await this.loadImagesByMode();

    // 如果没有图片,使用 fallback
    if (!this.images || this.images.length === 0) {
      this.images = this.getFallbackImages();
      /* console.log('⚠️ 使用 Fallback 图片'); */
    }

    // 🎲 打乱图片列表（实现随机显示）
    this.images = this.shuffleArray(this.images);
    /* console.log('🔀 壁纸列表已随机打乱'); */

    // 🚀 立即设置第一张图片（不等待预加载）
    this.currentIndex = 0;
    this.heroSection.style.setProperty('--hero-bg-image-1', `url('${this.images[0]}')`);
    this.heroSection.style.setProperty('--hero-bg-opacity-1', '1');
    /* console.log('✅ 首张背景已设置，浏览器开始加载'); */

    // 🚀 后台预加载前两张图片（非阻塞）
    const imagesToPreload = this.images.slice(0, Math.min(2, this.images.length));
    this.preloadImagesWithCallback(imagesToPreload).then(() => {
      /* console.log('✅ 前两张图片预加载完成'); */
    }).catch(error => {
      /* console.warn('⚠️ 图片预加载失败:', error); */
    });

    // 🎨 检测首张壁纸亮度并更新导航栏样式
    this.analyzeImageBrightness(this.images[0]).then(isLight => {
      this.updateNavBarStyle(isLight);
    });

    // 🎯 设置滚动监听器 - 根据滚动位置动态切换亮度检测模式
    this.setupScrollListener();

    // 🖼️ 设置全屏监听器 - F11 全屏时只显示壁纸
    this.setupFullscreenListener();

    // 延迟预加载其余图片（避免阻塞）
    setTimeout(() => {
      const remainingCount = this.config.performance.preloadCount - 2;
      if (remainingCount > 0) {
        this.preloadImages(remainingCount + 2); // 从第3张开始
        /* console.log(`📥 预加载其余 ${remainingCount} 张图片`); */
      }
    }, this.config.performance.lazyLoadDelay);

    // 启动自动轮播
    if (this.autoPlay) {
      this.startAutoPlay();
    }

    // 页面可见性优化
    if (this.config.performance.pauseOnHidden) {
      this.setupVisibilityOptimization();
    }
  }

  /**
   * 根据模式加载图片
   */
  async loadImagesByMode() {
    const { mode, useStaticFirst, apiEnabled, apiUrl } = this.config;

    // 优先加载静态图片（无网络延迟，性能最佳）
    if (mode === 'static' || mode === 'hybrid') {
      const staticImages = this.getStaticImages();
      if (staticImages.length > 0) {
        this.staticImages = staticImages;
        this.images = staticImages;
        /* console.log(`✅ 静态图片加载完成 (${staticImages.length} 张)`); */
      }
    }

    // 后台异步加载 API 图片（不阻塞初始化）
    if ((mode === 'api' || mode === 'hybrid') && apiEnabled && apiUrl) {
      this.loadImagesFromApi().then(apiImages => {
        if (apiImages && apiImages.length > 0) {
          if (mode === 'hybrid' && useStaticFirst) {
            // 混合模式：合并静态 + API
            this.images = [...this.staticImages, ...apiImages];
            /* console.log(`✅ 混合模式：静态 ${this.staticImages.length} 张 + API ${apiImages.length} 张`); */
          } else {
            // API 模式：仅使用 API 图片
            this.images = apiImages;
            /* console.log(`✅ API 图片加载完成 (${apiImages.length} 张)`); */
          }

          // API 加载完成后，预加载更多图片
          setTimeout(() => {
            this.preloadImages(5);
          }, 1000);
        }
      });
    }
  }

  /**
   * 获取静态图片列表（从 data/hero-backgrounds.yaml）
   */
  getStaticImages() {
    try {
      // 尝试从全局变量获取（由 Hugo 渲染到 HTML）
      if (window.heroBgStaticImages && Array.isArray(window.heroBgStaticImages)) {
        return window.heroBgStaticImages.map(img =>
          this.applyResponsiveParams(img)
        );
      }
      return [];
    } catch (error) {
      /* console.warn('获取静态图片失败:', error); */
      return [];
    }
  }

  /**
   * 应用响应式图片参数 - LCP 优化核心
   */
  applyResponsiveParams(imageUrl) {
    try {
      // 检测设备类型
      const isMobile = window.innerWidth < this.config.responsive.mobile.breakpoint;
      const deviceConfig = isMobile ? this.config.responsive.mobile : this.config.responsive.desktop;

      // 如果URL不支持参数化（非img.xxdevops.cn），直接返回
      if (!imageUrl.includes('img.xxdevops.cn')) {
        return imageUrl;
      }

      // 构建CDN参数（适配 img.xxdevops.cn）
      const params = new URLSearchParams({
        w: deviceConfig.width,
        h: deviceConfig.height,
        q: deviceConfig.quality,
        fm: 'webp',
        fit: 'cover'
      });

      // 拼接参数
      const separator = imageUrl.includes('?') ? '&' : '?';
      return `${imageUrl}${separator}${params.toString()}`;
    } catch (error) {
      /* console.warn('应用响应式参数失败:', error); */
      return imageUrl;
    }
  }

  /**
   * 打乱数组 - Fisher-Yates 算法
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 获取随机索引（不重复当前）
   */
  getRandomIndex() {
    if (this.images.length <= 1) return 0;
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * this.images.length);
    } while (randomIndex === this.currentIndex);
    return randomIndex;
  }

  /**
   * 预加载多张图片并等待完成
   */
  preloadImagesWithCallback(urls) {
    return Promise.all(
      urls.map(url => this.preloadImage(url))
    );
  }

  // 页面可见性优化 - 隐藏时暂停动画和轮播
  setupVisibilityOptimization() {
    const heroSection = this.heroSection;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 页面隐藏时暂停动画
        heroSection.classList.add('paused');
        this.stopAutoPlay();  // 暂停轮播
        /* console.log('📴 壁纸系统已暂停 (页面隐藏)'); */
      } else {
        // 页面可见时恢复
        heroSection.classList.remove('paused');
        if (this.autoPlay) {
          this.startAutoPlay();  // 恢复轮播
        }
        /* console.log('▶️ 壁纸系统已恢复 (页面可见)'); */
      }
    });
  }

  // VP风格的图片预加载验证 (3秒超时)
  preloadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();

      // 设置3秒超时
      const timeout = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        resolve(false);
      }, 3000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);  // 加载成功
      };
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);  // 加载失败
      };
      img.src = src;
    });
  }

  // 处理待处理的切换队列
  processQueue() {
    if (this.isTransitioning || this.pendingSwitchQueue.length === 0) {
      return;
    }

    // 获取最早的待处理项目
    const nextIndex = this.pendingSwitchQueue.shift();
    /* console.log('📋 处理待切换队列, 索引:', nextIndex); */
    this.setBackground(nextIndex);
  }

  preloadImages(count) {
    const loadCount = Math.min(count, this.images.length);
    let loaded = 0;
    const maxConcurrent = 2; // Limit concurrent loads to prevent lag
    const activeLoads = []; // 跟踪活跃的图片加载

    const loadNextBatch = () => {
      const batch = [];
      for (let i = 0; i < maxConcurrent && loaded < loadCount; i++, loaded++) {
        const img = new Image();
        const imageUrl = this.images[loaded];
        
        // 🚀 设置5秒超时，防止图片加载挂起
        const timeoutId = setTimeout(() => {
          img.onload = null;
          img.onerror = null;
          /* console.warn(`⚠️ 预加载图片超时: ${imageUrl}`); */
          
          const index = batch.indexOf(img);
          if (index > -1) {
            batch.splice(index, 1);
          }
          const activeIndex = activeLoads.indexOf(timeoutId);
          if (activeIndex > -1) {
            activeLoads.splice(activeIndex, 1);
          }
          
          if (batch.length === 0 && loaded < loadCount) {
            setTimeout(loadNextBatch, 100);
          }
        }, 5000);
        
        activeLoads.push(timeoutId);
        img.src = imageUrl;

        img.onload = img.onerror = () => {
          clearTimeout(timeoutId);
          const activeIndex = activeLoads.indexOf(timeoutId);
          if (activeIndex > -1) {
            activeLoads.splice(activeIndex, 1);
          }
          
          const index = batch.indexOf(img);
          if (index > -1) {
            batch.splice(index, 1);
          }
          if (batch.length === 0 && loaded < loadCount) {
            // Wait a bit before loading next batch to avoid blocking
            setTimeout(loadNextBatch, 100);
          }
        };

        batch.push(img);
      }
    };

    loadNextBatch();
    
    // 🚀 返回清理函数，用于页面卸载时清理未完成的加载
    return () => {
      activeLoads.forEach(timeoutId => clearTimeout(timeoutId));
      activeLoads.length = 0;
    };
  }

  async loadImagesFromApi() {
    try {
      /* 🎨 从API加载图片列表 - 支持多种API格式 */
      const cacheKey = 'hero-bg-images';
      const cacheTimeKey = 'hero-bg-images-time';
      const cacheExpiry = 3600000; /* ◀️ 1小时缓存过期时间 */

      const cachedImages = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTimeKey);

      if (cachedImages && cachedTime) {
        const age = Date.now() - parseInt(cachedTime);
        if (age < cacheExpiry) {
          /* console.log('Using cached images'); */
          this.images = JSON.parse(cachedImages);
          return;
        }
      }

      /* console.log('Fetching images from API:', this.config.apiUrl); */

      /* 🔧 智能检测API类型并构建正确的请求URL */
      let apiUrl = this.config.apiUrl;
      const isImgServer = apiUrl.includes('img-server') || apiUrl.includes('cnb.cool');

      /* 🎯 img-server 项目特殊处理 - 确保使用 /api/images 端点 */
      if (isImgServer && !apiUrl.includes('/api/images')) {
        /* 移除末尾斜杠并添加 /api/images */
        apiUrl = apiUrl.replace(/\/$/, '') + '/api/images';
        /* console.log('🔄 检测到 img-server API，自动修正URL:', apiUrl); */
      }

      /* ⏱️ 设置请求超时 */
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); /* ◀️ 5秒超时 */

      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      /* 🔄 处理API返回的数据 - 支持多种响应格式 */
      let imageList = [];
      if (Array.isArray(data)) {
        /* ✅ 标准格式：直接返回图片URL数组 */
        imageList = data;
      } else if (data.images && Array.isArray(data.images)) {
        /* ✅ 嵌套格式：{ images: [...] } */
        imageList = data.images;
      } else if (data.data && Array.isArray(data.data)) {
        /* ✅ 包装格式：{ data: [...] } */
        imageList = data.data;
      } else {
        /* console.warn('Unexpected API response format:', data); */
        imageList = [];
      }

      /* 🔗 将相对路径转换为完整URL */
      const apiUrlObj = new URL(apiUrl);
      const baseUrl = `${apiUrlObj.protocol}//${apiUrlObj.host}`;

      this.images = imageList.map(img => {
        /* ✅ 如果已经是完整URL，直接返回 */
        if (img.startsWith('http://') || img.startsWith('https://')) {
          return img;
        }
        /* 🔧 否则拼接baseUrl - img-server 返回的是 /images/filename.jpg 格式 */
        return baseUrl + (img.startsWith('/') ? img : '/' + img);
      });

      /* 💾 保存到本地缓存 */
      try {
        localStorage.setItem(cacheKey, JSON.stringify(this.images));
        localStorage.setItem(cacheTimeKey, Date.now().toString());
      } catch (e) {
        /* console.warn('Failed to cache images:', e); */
      }

      /* console.log(`Loaded ${this.images.length} images from API`);
      if (this.images.length > 0) {
        console.log('Sample image:', this.images[0]);
      } */
    } catch (error) {
      /* console.error('Failed to load images from API:', error); */
      /* 🔄 使用fallback图片作为备用 */
      if (!this.images || this.images.length === 0) {
        this.images = this.getFallbackImages();
      }
    }
  }

  getFallbackImages() {
    return [
      'https://img.xxdevops.cn/blog/article_cover/photo-1618005182384-a83a8bd57fbe.avif',
      'https://img.xxdevops.cn/blog/article_cover/photo-1614850523459-c2f4c699c52e.avif',
      'https://img.xxdevops.cn/blog/article_cover/photo-1550745165-9bc0b252726f.avif'
    ];
  }

  async setBackground(index) {
    if (index < 0 || index >= this.images.length) return;

    // 如果正在切换中,将请求加入队列
    if (this.isTransitioning) {
      /* console.log('⏭️ 正在切换中,将索引加入队列:', index); */
      this.pendingSwitchQueue.push(index);
      return;
    }

    this.isTransitioning = true;
    const imageUrl = this.images[index];

    // VP风格: 预加载图片确保切换时不会有闪烁
    const preloadSuccess = await this.preloadImage(imageUrl);

    if (!preloadSuccess) {
      /* console.warn('❌ 图片预加载失败, 跳过切换:', imageUrl); */
      this.isTransitioning = false;
      // 尝试处理队列中的下一个
      setTimeout(() => this.processQueue(), 100);
      return;
    }

    this.currentIndex = index;

    // 交叉淡入淡出切换
    // 检查当前显示的是哪一层
    const opacity1 = parseFloat(getComputedStyle(this.heroSection).getPropertyValue('--hero-bg-opacity-1') || '1');

    if (opacity1 > 0.5) {
      // 当前显示layer1, 切换到layer2
      this.heroSection.style.setProperty('--hero-bg-image-2', `url('${imageUrl}')`);
      this.heroSection.style.setProperty('--hero-bg-opacity-2', '1');
      this.heroSection.style.setProperty('--hero-bg-opacity-1', '0');
    } else {
      // 当前显示layer2, 切换到layer1
      this.heroSection.style.setProperty('--hero-bg-image-1', `url('${imageUrl}')`);
      this.heroSection.style.setProperty('--hero-bg-opacity-1', '1');
      this.heroSection.style.setProperty('--hero-bg-opacity-2', '0');
    }

    // 🎨 只有在壁纸区时，壁纸切换才更新导航栏样式
    // 如果在文章区，导航栏应该跟随文章区颜色，不受壁纸切换影响
    if (this.currentDetectionMode === 'wallpaper') {
      this.analyzeImageBrightness(imageUrl).then(isLight => {
        this.updateNavBarStyle(isLight);
        /* console.log('🎨 壁纸切换 → 更新导航栏颜色（当前在壁纸区）'); */
      });
    } else {
      /* console.log('📄 壁纸切换 → 不更新导航栏（当前在文章区）'); */
    }

    // 切换完成后重置状态并处理队列
    setTimeout(() => {
      this.isTransitioning = false;
      this.processQueue();  // 处理队列中可能的待处理请求

      // 预测性预加载下一张图片
      if (this.config.performance.predictivePreload) {
        this.startPredictivePreload();
      }
    }, 3600);  // 等待过渡动画完全结束 (3.5s过渡 + 100ms缓冲)
  }

  /**
   * 预测性预加载 - 在切换前500ms预加载下一张图片
   */
  startPredictivePreload() {
    // 清除之前的定时器
    if (this.nextPreloadTimer) {
      clearTimeout(this.nextPreloadTimer);
    }

    // 计算预加载时机（切换前500ms）
    const preloadDelay = this.interval - 500;

    this.nextPreloadTimer = setTimeout(() => {
      const nextIndex = (this.currentIndex + 1) % this.images.length;
      const nextImageUrl = this.images[nextIndex];

      if (nextImageUrl) {
        /* console.log(`📥 预测性预加载下一张: ${nextIndex}`); */
        this.preloadImage(nextImageUrl);
      }
    }, preloadDelay);
  }

  /**
   * 简化的亮度检测 - 直接采样原始图片判断深浅
   * @param {string} imageUrl - 图片 URL
   * @returns {Promise<boolean>} - true: 浅色壁纸（需要黑色文字），false: 深色壁纸（需要白色文字）
   */
  async analyzeImageBrightness(imageUrl) {
    // 检查缓存
    if (this.brightnessCache.has(imageUrl)) {
      return this.brightnessCache.get(imageUrl);
    }

    return new Promise((resolve) => {
      const img = new Image();
      
      // 🚀 设置5秒超时，防止图片加载挂起导致浏览器持续显示加载状态
      const timeoutId = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        /* console.warn('⚠️ 亮度检测图片加载超时，使用深色模式'); */
        resolve(false);
      }, 5000);

      img.onload = () => {
        clearTimeout(timeoutId);
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // 缩小图片到 10% 以提升性能
          const scale = 0.1;
          canvas.width = Math.floor(img.width * scale);
          canvas.height = Math.floor(img.height * scale);

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // 只采样顶部 1/4 区域（导航栏位置）
          const sampleHeight = Math.floor(canvas.height * 0.25);
          const imageData = ctx.getImageData(0, 0, canvas.width, sampleHeight);
          const pixels = imageData.data;

          // 计算平均亮度（大幅降采样）
          let totalBrightness = 0;
          let count = 0;

          for (let i = 0; i < pixels.length; i += 64) {  // 每隔 16 个像素
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
            totalBrightness += brightness;
            count++;
          }

          const avgBrightness = totalBrightness / count;

          // 阈值 130（较保守，偏向深色模式）
          const threshold = 130;
          const isLight = avgBrightness > threshold;

          /* console.log(`🎨 亮度: ${avgBrightness.toFixed(2)} → ${isLight ? '浅色' : '深色'} (阈值: ${threshold})`); */

          this.brightnessCache.set(imageUrl, isLight);
          resolve(isLight);

        } catch (error) {
          /* console.warn('⚠️ 检测失败，使用深色模式:', error); */
          resolve(false);  // 默认深色
        }
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        /* console.warn('⚠️ 图片加载失败，使用深色模式'); */
        resolve(false);
      };

      // 🚀 使用匿名模式加载，但添加错误处理
      img.crossOrigin = 'Anonymous';
      img.src = imageUrl;
    });
  }

  /**
   * 更新导航栏样式 - 已禁用自动换色，固定为白色文本
   * @param {boolean} isLight - 是否为浅色壁纸（已忽略）
   */
  updateNavBarStyle(isLight) {
    // 导航栏文本颜色已固定为白色，不再随壁纸变化
    // 保留方法但不执行任何操作
    /* console.log('📌 导航栏文本颜色已固定，自动换色功能已禁用'); */
  }


  /**
   * 设置滚动监听器 - 检测导航栏是否完全离开壁纸区
   */
  setupScrollListener() {
    let ticking = false;
    const navBarHeight = 80;  // 导航栏高度
    const hysteresis = 50;     // 迟滞带：50px 缓冲区，避免边界频繁切换

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const heroHeight = this.heroSection?.offsetHeight || 0;
          const scrollY = window.scrollY;

          // 导航栏底部位置 = 滚动位置 + 导航栏高度
          const navBarBottom = scrollY + navBarHeight;

          // 使用迟滞带避免频繁切换：
          // - 如果当前在壁纸区，需要超过 heroHeight + hysteresis 才切换到文章区
          // - 如果当前在文章区，需要低于 heroHeight - hysteresis 才切换回壁纸区
          let hasLeftHero;
          if (this.currentDetectionMode === 'wallpaper') {
            // 当前在壁纸区，需要明确超出壁纸区才切换
            hasLeftHero = navBarBottom > (heroHeight + hysteresis);
          } else {
            // 当前在文章区，需要明确回到壁纸区才切换
            hasLeftHero = navBarBottom > (heroHeight - hysteresis);
          }

          const newMode = hasLeftHero ? 'article' : 'wallpaper';

          // 只在区域切换时才重新检测，避免在同一区域内频繁改变颜色
          if (newMode !== this.currentDetectionMode) {
            /* console.log(`🔄 区域切换: ${this.currentDetectionMode} → ${newMode}`); */
            this.currentDetectionMode = newMode;

            if (newMode === 'article') {
              // 导航栏离开壁纸区，进入文章区 - 移除 .light-bg，添加 .left-hero，交给亮暗模式接管
              /* console.log('📄 导航栏已完全离开壁纸区，由亮暗模式接管'); */
              if (this.navBar) {
                this.navBar.classList.remove('light-bg');
                this.navBar.classList.add('left-hero');
                /* console.log('✅ 已添加 .left-hero 类，当前类:', this.navBar.className); */
              }
            } else {
              // 导航栏返回壁纸区 - 移除 .left-hero，使用壁纸亮度
              /* console.log('🖼️ 导航栏返回壁纸区，使用壁纸亮度'); */
              if (this.navBar) {
                this.navBar.classList.remove('left-hero');
              }
              const currentImageUrl = this.images[this.currentIndex];
              this.analyzeImageBrightness(currentImageUrl).then(isLight => {
                this.updateNavBarStyle(isLight);
              });
            }
          }
          // 在同一区域内滚动 - 不做任何改变

          ticking = false;
        });
        ticking = true;
      }
    });

    /* console.log('✅ 滚动监听器已设置（检测导航栏是否离开壁纸区，带50px迟滞带）'); */
  }

  /**
   * 设置全屏监听器 - F11 全屏时只显示壁纸
   */
  setupFullscreenListener() {
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      if (isFullscreen) {
        // 进入全屏 - 添加 class 隐藏其他内容
        document.documentElement.classList.add('wallpaper-fullscreen-mode');
        /* console.log('🖼️ 进入全屏壁纸模式'); */
      } else {
        // 退出全屏 - 移除 class 恢复显示
        document.documentElement.classList.remove('wallpaper-fullscreen-mode');
        /* console.log('📱 退出全屏壁纸模式'); */
      }
    };

    // 监听各浏览器的全屏事件
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    /* console.log('✅ 全屏监听器已设置（F11 全屏时只显示壁纸）'); */
  }

  next() {
    // 随机选择下一张（不重复当前）
    const nextIndex = this.getRandomIndex();
    this.setBackground(nextIndex);
  }

  previous() {
    const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.setBackground(prevIndex);
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.timer = setInterval(() => {
      this.next();
    }, this.interval);
  }

  stopAutoPlay() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    // 清除预测性预加载定时器
    if (this.nextPreloadTimer) {
      clearTimeout(this.nextPreloadTimer);
      this.nextPreloadTimer = null;
    }
  }
}

// 🚀 全局存储 HeroBgSlider 实例，用于页面卸载时清理
window.heroBgSliders = window.heroBgSliders || [];

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  // Get background images from data attribute or default list
  const heroSection = document.querySelector('.hero-section-fullscreen');

  if (!heroSection) {
    return;
  }

  // ⚠️ 性能优化：检查是否启用动态壁纸
  // 如果禁用，完全跳过初始化，避免无效的 API 请求和图片预加载
  const autoPlayAttr = heroSection.dataset.autoplay;
  const isEnabled = autoPlayAttr !== 'false';

  if (!isEnabled) {
    /* console.log('📴 Hero background disabled (heroBg.enabled = false), skipping initialization'); */
    return;  // 完全跳过初始化
  }
  
  // 🚀 性能检测：低性能设备简化 Hero 背景
  // 使用性能检测器的统一方法，或独立的快速检测函数
  const isLowEnd = window.PerformanceDetector 
    ? window.PerformanceDetector.quickCheck()
    : (window.quickLowEndCheck ? window.quickLowEndCheck() : false);
  
  if (isLowEnd) {
    console.log('[HeroBg] 低性能设备，使用简化模式');
    // 低性能设备：只显示第一张静态图片，禁用轮播和亮度检测
    initSimpleHero(heroSection);
    return;
  }

  /* console.log('✅ Hero background enabled, initializing slider...'); */

  const bgDataElement = document.getElementById('hero-bg-data');
  const apiUrlElement = document.getElementById('hero-bg-api-url');
  const apiEnabledElement = document.getElementById('hero-bg-api-enabled');
  const modeElement = document.getElementById('hero-bg-mode');
  let images = [];
  let apiUrl = null;
  let apiEnabled = false;
  let mode = 'hybrid';  // 默认混合模式

  // 优先使用API URL
  if (apiUrlElement) {
    try {
      apiUrl = apiUrlElement.textContent.trim();
      /* console.log('Hero background API URL:', apiUrl); */
    } catch (e) {
      /* console.error('Failed to parse API URL:', e); */
    }
  }

  // 读取 API 启用状态
  if (apiEnabledElement) {
    try {
      apiEnabled = apiEnabledElement.textContent.trim() === 'true';
      /* console.log('Hero background API enabled:', apiEnabled); */
    } catch (e) {
      /* console.error('Failed to parse API enabled status:', e); */
    }
  }

  // 读取模式配置
  if (modeElement) {
    try {
      mode = modeElement.textContent.trim();
      /* console.log('Hero background mode:', mode); */
    } catch (e) {
      /* console.error('Failed to parse mode:', e); */
    }
  }

  // 如果没有API,尝试从静态配置读取
  if (!apiUrl && bgDataElement) {
    try {
      images = JSON.parse(bgDataElement.textContent);
    } catch (e) {
      /* console.error('Failed to parse hero background data:', e); */
    }
  }

  // Initialize slider
  const intervalValue = parseInt(heroSection.dataset.interval) || 8000;
  /* console.log(`⏱️  壁纸切换间隔: ${intervalValue}ms (${intervalValue / 1000}秒)`); */

  const slider = new HeroBgSlider(images, {
    interval: intervalValue,  // 默认 8 秒，与 hugo.toml 保持一致
    autoPlay: true,  // 走到这里说明已经启用
    apiUrl: apiUrl,
    apiEnabled: apiEnabled,  // 传递 API 启用状态
    mode: mode  // 传递模式配置
  });
  
  // 🚀 存储实例用于页面卸载时清理
  window.heroBgSliders.push(slider);
});

// 🚀 页面卸载时清理所有 HeroBgSlider 实例
window.addEventListener('beforeunload', function() {
  if (window.heroBgSliders && window.heroBgSliders.length > 0) {
    window.heroBgSliders.forEach(function(slider) {
      if (slider && slider.stopAutoPlay) {
        slider.stopAutoPlay();
      }
    });
    window.heroBgSliders = [];
  }
});

/**
 * 🚀 简化版 Hero 背景初始化（低性能设备）
 * 只显示第一张静态图片，禁用轮播和复杂效果
 */
function initSimpleHero(heroSection) {
  // 获取静态图片列表
  let images = [];
  const bgDataElement = document.getElementById('hero-bg-data');
  
  if (bgDataElement) {
    try {
      images = JSON.parse(bgDataElement.textContent);
    } catch (e) {
      console.warn('[HeroBg] 解析图片数据失败');
    }
  }
  
  // 如果没有图片，使用 fallback
  if (!images || images.length === 0) {
    images = [
      'https://img.xxdevops.cn/blog/article_cover/photo-1618005182384-a83a8bd57fbe.avif'
    ];
  }
  
  // 只使用第一张图片，静态显示
  const imageUrl = images[0];
  
  // 应用响应式参数（低质量）
  const isMobile = window.innerWidth < 768;
  let finalUrl = imageUrl;
  
  if (imageUrl.includes('img.xxdevops.cn')) {
    const params = new URLSearchParams({
      w: isMobile ? 768 : 1280,  // 低性能设备使用更小尺寸
      h: isMobile ? 512 : 720,
      q: 60,  // 更低质量
      fm: 'webp',
      fit: 'cover'
    });
    const separator = imageUrl.includes('?') ? '&' : '?';
    finalUrl = `${imageUrl}${separator}${params.toString()}`;
  }
  
  // 设置静态背景
  heroSection.style.setProperty('--hero-bg-image-1', `url('${finalUrl}')`);
  heroSection.style.setProperty('--hero-bg-opacity-1', '1');
  
  // 预加载图片
  const img = new Image();
  img.src = finalUrl;
  
  console.log('[HeroBg] 简化模式已启用，静态背景:', finalUrl);
}
