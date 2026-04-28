/**
 * 设备性能检测器
 * 根据设备性能自动调整功能加载策略
 */

(function() {
  'use strict';

  // 性能等级枚举
  const PerformanceLevel = {
    LOW: 'low',      // 低性能设备（老旧手机、低配电脑）
    MEDIUM: 'medium', // 中等性能设备
    HIGH: 'high'     // 高性能设备
  };

  // 性能检测配置
  const config = {
    // 内存阈值 (GB)
    memoryThresholds: {
      low: 2,
      medium: 4
    },
    // 逻辑核心数阈值
    coresThresholds: {
      low: 2,
      medium: 4
    },
    // 基准测试分数阈值（ms）
    benchmarkThresholds: {
      low: 100,   // 执行时间 > 100ms 视为低性能
      medium: 50  // 执行时间 > 50ms 视为中等性能
    }
  };

  /**
   * 运行简单的基准测试（异步版本，使用 requestIdleCallback）
   * @returns {Promise<number>} 执行时间（毫秒）
   */
  function runBenchmarkAsync() {
    return new Promise((resolve) => {
      const start = performance.now();
      const timeout = 50; // 50ms超时保护
      const batchSize = 500; // 每批次迭代次数，减少阻塞
      let result = 0;
      let i = 0;
      
      function runBatch(deadline) {
        // 检查超时或没有剩余时间
        if (performance.now() - start >= timeout || deadline.timeRemaining() <= 0) {
          resolve(performance.now() - start);
          return;
        }
        
        // 在空闲时间执行计算
        while (i < 10000 && performance.now() - start < timeout && deadline.timeRemaining() > 0) {
          const batchEnd = Math.min(i + batchSize, 10000);
          for (; i < batchEnd && performance.now() - start < timeout; i++) {
            result += Math.sqrt(i) * Math.sin(i);
          }
        }
        
        if (i < 10000 && performance.now() - start < timeout) {
          // 还有更多计算且未超时，继续调度
          requestIdleCallback(runBatch, { timeout: 20 });
        } else {
          // 完成或超时
          resolve(performance.now() - start);
        }
      }
      
      // 开始执行
      if ('requestIdleCallback' in window) {
        requestIdleCallback(runBatch, { timeout: 100 });
      } else {
        // 降级方案：使用 setTimeout
        setTimeout(() => {
          while (i < 10000 && performance.now() - start < timeout) {
            const batchEnd = Math.min(i + batchSize, 10000);
            for (; i < batchEnd; i++) {
              result += Math.sqrt(i) * Math.sin(i);
            }
          }
          resolve(performance.now() - start);
        }, 0);
      }
    });
  }
  
  /**
   * 检测设备性能等级（异步版本）
   * @returns {Promise<string>} 性能等级
   */
  async function detectPerformanceLevel() {
    let score = 0;
    let factors = 0;

    // 1. 检测内存（如果可用）
    if (navigator.deviceMemory) {
      const memory = navigator.deviceMemory;
      if (memory <= config.memoryThresholds.low) {
        score += 1;
      } else if (memory <= config.memoryThresholds.medium) {
        score += 2;
      } else {
        score += 3;
      }
      factors++;
    }

    // 2. 检测 CPU 核心数
    if (navigator.hardwareConcurrency) {
      const cores = navigator.hardwareConcurrency;
      if (cores <= config.coresThresholds.low) {
        score += 1;
      } else if (cores <= config.coresThresholds.medium) {
        score += 2;
      } else {
        score += 3;
      }
      factors++;
    }

    // 3. 检测是否为移动设备（移动设备通常性能较低）
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      score += 1;
    } else {
      score += 2;
    }
    factors++;

    // 4. 检测是否开启省电模式/流量节省模式
    // 使用 Network Information API 作为可靠的替代方案
    if ('connection' in navigator && navigator.connection) {
      // saveData 表示用户开启了流量节省模式（通常是省电的）
      if (navigator.connection.saveData) {
        window.__POWER_SAVE_MODE__ = true;
      }
      // 检测有效类型为 2g/3g 也可能是低功耗模式
      if (navigator.connection.effectiveType === '2g' || navigator.connection.effectiveType === '3g') {
        window.__LOW_BANDWIDTH_MODE__ = true;
      }
    }

    // 5. 运行基准测试（异步，避免阻塞主线程）
    const benchmarkTime = await runBenchmarkAsync();
    if (benchmarkTime > config.benchmarkThresholds.low) {
      score += 1;
    } else if (benchmarkTime > config.benchmarkThresholds.medium) {
      score += 2;
    } else {
      score += 3;
    }
    factors++;

    // 计算平均分数并确定性能等级
    const averageScore = score / factors;
    
    if (averageScore <= 1.5) {
      return PerformanceLevel.LOW;
    } else if (averageScore <= 2.5) {
      return PerformanceLevel.MEDIUM;
    } else {
      return PerformanceLevel.HIGH;
    }
  }

  /**
   * 获取性能优化配置
   * @param {string} level 性能等级
   * @returns {Object} 优化配置
   */
  function getOptimizationConfig(level) {
    const configs = {
      [PerformanceLevel.LOW]: {
        // 视觉效果
        enableCursorParticles: false,      // 禁用光标粒子
        enableHeroAnimations: false,       // 禁用 Hero 动画
        enableScrollAnimations: false,     // 禁用滚动动画
        enableImageZoom: false,            // 禁用图片放大
        
        // 功能
        enableSearch: true,                // 保留搜索（核心功能）
        enableComments: false,             // 禁用评论（非首屏）
        enableAnalytics: false,            // 禁用统计
        enablePjax: false,                 // 禁用 PJAX
        
        // 图片
        lazyLoadDelay: 200,                // 延迟懒加载
        imageQuality: 'low',               // 低质量图片
        
        // 轮询和定时器
        reducePolling: true,               // 减少轮询
        
        // CSS
        simplifyTransitions: true,         // 简化过渡效果
        disableComplexEffects: true        // 禁用复杂效果
      },
      
      [PerformanceLevel.MEDIUM]: {
        enableCursorParticles: false,
        enableHeroAnimations: true,
        enableScrollAnimations: true,
        enableImageZoom: true,
        
        enableSearch: true,
        enableComments: true,
        enableAnalytics: false,
        enablePjax: true,
        
        lazyLoadDelay: 100,
        imageQuality: 'medium',
        
        reducePolling: true,
        simplifyTransitions: false,
        disableComplexEffects: false
      },
      
      [PerformanceLevel.HIGH]: {
        enableCursorParticles: true,
        enableHeroAnimations: true,
        enableScrollAnimations: true,
        enableImageZoom: true,
        
        enableSearch: true,
        enableComments: true,
        enableAnalytics: true,
        enablePjax: true,
        
        lazyLoadDelay: 0,
        imageQuality: 'high',
        
        reducePolling: false,
        simplifyTransitions: false,
        disableComplexEffects: false
      }
    };
    
    return configs[level] || configs[PerformanceLevel.MEDIUM];
  }

  /**
   * 应用性能优化
   * @param {Object} config 优化配置
   */
  function applyOptimizations(config) {
    // 将配置挂载到全局，供其他脚本读取
    window.__PERFORMANCE_CONFIG__ = config;
    
    // 添加性能等级标记到 HTML
    document.documentElement.dataset.performanceLevel = window.__PERFORMANCE_LEVEL__;
    
    // 应用 CSS 优化
    if (config.simplifyTransitions) {
      document.documentElement.classList.add('reduce-motion');
    }
    
    if (config.disableComplexEffects) {
      document.documentElement.classList.add('simple-mode');
    }
    
    console.log('[Performance] 性能等级:', window.__PERFORMANCE_LEVEL__, config);
  }

  /**
   * 初始化性能检测（异步版本）
   */
  async function init() {
    // 检测性能等级
    const level = await detectPerformanceLevel();
    window.__PERFORMANCE_LEVEL__ = level;
    
    // 获取优化配置
    const optimizationConfig = getOptimizationConfig(level);
    
    // 应用优化
    applyOptimizations(optimizationConfig);
    
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('performance-detected', {
      detail: { level, config: optimizationConfig }
    }));
  }

  // 立即执行（在 head 中内联）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  /**
   * 快速检测是否为低性能设备（无需等待完整检测）
   * 供其他脚本在性能检测器初始化前使用
   * @returns {boolean}
   */
  function quickLowEndCheck() {
    // 1. 检查性能检测器已确定的结果
    if (window.__PERFORMANCE_LEVEL__) {
      return window.__PERFORMANCE_LEVEL__ === PerformanceLevel.LOW;
    }
    
    // 2. 检查性能配置（任一主要动画被禁用则视为低性能）
    if (window.__PERFORMANCE_CONFIG__ && 
        (window.__PERFORMANCE_CONFIG__.enableHeroAnimations === false || 
         window.__PERFORMANCE_CONFIG__.enableCursorParticles === false)) {
      return true;
    }
    
    // 3. 快速硬件检测
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
      return true;
    }
    
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
      return true;
    }
    
    // 4. 检测用户偏好（减少动画）
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    
    // 5. 检测省电模式
    if (window.__POWER_SAVE_MODE__) {
      return true;
    }
    
    return false;
  }

  // 导出全局函数
  window.PerformanceDetector = {
    getLevel: () => window.__PERFORMANCE_LEVEL__,
    getConfig: () => window.__PERFORMANCE_CONFIG__,
    isLowEnd: () => window.__PERFORMANCE_LEVEL__ === PerformanceLevel.LOW,
    isPowerSaveMode: () => window.__POWER_SAVE_MODE__ === true,
    quickCheck: quickLowEndCheck  // 新增快速检测方法
  };
  
  // 导出独立的快速检测函数，供其他脚本在检测器未加载时使用
  window.quickLowEndCheck = quickLowEndCheck;
  
})();
