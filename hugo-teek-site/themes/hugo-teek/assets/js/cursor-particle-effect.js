// ========================================
// 光标彩色粒子特效
// Cursor Colorful Particle Effect
// ========================================
// 从 VitePress Theme Teek 移植
// 鼠标移动时生成彩色星星拖尾效果
// 已添加性能检测：低性能设备自动禁用

(function() {
  'use strict';

  /**
   * 检查是否应该启用粒子效果
   * 统一使用性能检测器的 quickCheck 方法
   * @returns {boolean} true 表示低性能设备（应禁用粒子）
   */
  function checkLowEndDevice() {
    // 使用性能检测器的快速检测方法
    if (window.PerformanceDetector && typeof window.PerformanceDetector.quickCheck === 'function') {
      // quickCheck 返回 true 表示低性能设备
      return window.PerformanceDetector.quickCheck();
    }

    // 备用检测：检查性能配置
    if (window.__PERFORMANCE_CONFIG__) {
      return window.__PERFORMANCE_CONFIG__.enableCursorParticles === false;
    }

    // 默认非低性能（性能检测器不可用时）
    return false;
  }

  // 性能检测：存储结果避免重复调用
  const isLowEnd = checkLowEndDevice();
  
  // 如果低性能设备，直接返回
  if (isLowEnd) {
    console.log('[CursorParticles] 低性能设备或用户偏好，跳过粒子效果');
    return;
  }

  let fallDirection = 1;
  let x1 = 0;
  let y1 = 0;

  // 视口高度
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  // 配置参数（根据性能调整）
  
  const dist_to_draw = isLowEnd ? 80 : 50;        // 低性能设备：增大触发距离，减少粒子数量
  const delay = isLowEnd ? 800 : 1000;            // 低性能设备：缩短动画时间
  const fsize = isLowEnd ? ['0.8rem', '1.1rem'] : ['1.1rem', '1.4rem', '.8rem', '1.7rem'];  // 低性能：减少字体大小种类

  // 彩色星星配置（VP原版6种颜色）
  const colors = isLowEnd ? [
    '#E23636',      // 红色
    '#001affff',    // 蓝色
    '#00ffeaff'     // 青色（低性能：减少颜色种类）
  ] : [
    '#E23636',      // 红色
    '#001affff',    // 蓝色
    '#00ffeaff',    // 青色
    '#ff009dff',    // 粉色
    '#ff9595ff',    // 淡红色
    '#004370ff'     // 深蓝色
  ];

  // 工具函数
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const selRand = (arr) => arr[rand(0, arr.length - 1)];
  const distanceTo = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const shouldDraw = (x, y) => distanceTo(x1, y1, x, y) >= dist_to_draw;

  // 创建粒子容器
  const container = document.createElement('div');
  container.id = 'guangbiao-container';
  document.body.appendChild(container);

  // 添加星星粒子
  const addStar = (x, y) => {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.top = `${y + rand(-20, 20)}px`;
    star.style.left = `${x}px`;
    star.style.color = selRand(colors);
    star.style.fontSize = selRand(fsize);
    container.appendChild(star);

    const fs = 10 + 5 * parseFloat(getComputedStyle(star).fontSize);

    // 3D旋转消失动画
    star.animate(
      {
        transform: [
          `translate(${rand(-5, 5)}px, ${(y + fs > vh ? vh - y : fs) * fallDirection * 0.3}px)`,
          `translate(${rand(-20, 20)}px, ${(y + fs > vh ? vh - y : fs) * fallDirection}px) rotateX(${rand(1, 500)}deg) rotateY(${rand(1, 500)}deg)`
        ],
        opacity: [1, 0]
      },
      {
        duration: delay,
        fill: 'forwards'
      }
    );

    // 动画结束后移除元素
    setTimeout(() => star.remove(), delay);
  };

  // 鼠标移动事件监听（使用基于时间的节流，约60fps）
  let lastTime = 0;
  window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - lastTime >= 16) { // 约60fps
      lastTime = now;
      const { clientX, clientY } = e;
      if (shouldDraw(clientX, clientY)) {
        addStar(clientX, clientY);
        x1 = clientX;
        y1 = clientY;
      }
    }
  }, { passive: true });

  console.log('[CursorParticles] 粒子效果已启用（性能模式:', isLowEnd ? '低' : '高', ')');

})();
