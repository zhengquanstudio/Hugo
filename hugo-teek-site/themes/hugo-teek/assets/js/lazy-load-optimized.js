/**
 * 优化的懒加载模块
 * 根据设备性能自动调整懒加载策略
 */

(function() {
  'use strict';

  /**
   * 获取懒加载配置
   */
  function getLazyLoadConfig() {
    const perfConfig = window.__PERFORMANCE_CONFIG__ || {};
    const isLowEnd = window.__PERFORMANCE_LEVEL__ === 'low';
    
    return {
      // 根边距：低性能设备提前更少距离加载
      rootMargin: isLowEnd ? '100px 0px' : '200px 0px',
      
      // 阈值
      threshold: 0.01,
      
      // 延迟时间
      delay: perfConfig.lazyLoadDelay || (isLowEnd ? 200 : 0),
      
      // 是否使用原生懒加载（低性能设备优先使用）
      useNativeLazy: isLowEnd,
      
      // 是否禁用动画
      disableAnimation: isLowEnd || perfConfig.simplifyTransitions
    };
  }

  /**
   * 初始化优化的懒加载
   */
  function initOptimizedLazyLoad() {
    const config = getLazyLoadConfig();
    
    // 如果浏览器不支持 IntersectionObserver，使用原生懒加载
    if (!('IntersectionObserver' in window) || config.useNativeLazy) {
      initNativeLazyLoad();
      return;
    }
    
    // 清理旧的 observer
    if (window._lazyLoadObserver) {
      window._lazyLoadObserver.disconnect();
    }
    
    const imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // 延迟加载（低性能设备）
          if (config.delay > 0) {
            setTimeout(() => loadImage(img, config), config.delay);
          } else {
            loadImage(img, config);
          }
          
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: config.rootMargin,
      threshold: config.threshold
    });
    
    window._lazyLoadObserver = imageObserver;
    
    // 观察所有需要懒加载的图片
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(function(img) {
      if (config.disableAnimation) {
        img.classList.add('instant-load');
      }
      imageObserver.observe(img);
    });
    
    console.log('[LazyLoad] 优化懒加载已初始化', config);
  }

  /**
   * 加载图片
   */
  function loadImage(img, config) {
    if (!img.dataset.src) return;
    
    const src = img.dataset.src;
    
    // 低性能设备：降低图片质量
    if (window.__PERFORMANCE_LEVEL__ === 'low' && src.includes('img.xxdevops.cn')) {
      const optimizedSrc = optimizeImageUrl(src);
      img.src = optimizedSrc;
    } else {
      img.src = src;
    }
    
    img.removeAttribute('data-src');
    
    // 添加加载完成标记
    img.addEventListener('load', function() {
      if (!config.disableAnimation) {
        img.classList.add('lazy-loaded');
      }
    });
    
    img.addEventListener('error', function() {
      handleImageError(img);
    });
  }

  /**
   * 优化图片 URL（降低质量）
   */
  function optimizeImageUrl(url) {
    if (!url.includes('img.xxdevops.cn')) return url;
    
    const params = new URLSearchParams({
      q: 60,  // 降低质量
      fm: 'webp'
    });
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }

  /**
   * 原生懒加载（备用方案）
   */
  function initNativeLazyLoad() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    lazyImages.forEach(function(img) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
    
    console.log('[LazyLoad] 原生懒加载已启用');
  }

  /**
   * 处理图片加载错误
   */
  function handleImageError(img) {
    console.warn('[LazyLoad] 图片加载失败:', img.src);
    
    // 添加错误标记
    img.classList.add('img-error');
    
    // 触发全局错误处理（如果存在）
    if (window.handleImageError) {
      window.handleImageError(img);
    }
  }

  /**
   * 预加载关键图片
   */
  function preloadCriticalImages() {
    const criticalImages = document.querySelectorAll('img[data-priority="high"], img[loading="eager"]');
    
    criticalImages.forEach(function(img) {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    });
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      preloadCriticalImages();
      initOptimizedLazyLoad();
    });
  } else {
    preloadCriticalImages();
    initOptimizedLazyLoad();
  }
  
  // 导出全局函数
  window.initOptimizedLazyLoad = initOptimizedLazyLoad;
  
})();
