// ========================================
// Simple Sidebar - Collapse功能
// ========================================

(function() {
  'use strict';

  // ========================================
  // 配置
  // ========================================

  const STORAGE_KEY = 'simple-sidebar-collapsed';
  const COLLAPSED_CLASS = 'simple-sidebar-collapsed';
  const COLLAPSED_WIDTH = 60;  // 折叠后的宽度

  // ========================================
  // 元素引用
  // ========================================

  const collapseBtn = document.getElementById('sidebar-collapse');

  if (!collapseBtn) {
    console.log('[SidebarCollapse] collapse按钮未找到，跳过初始化');
    return;
  }

  console.log('[SidebarCollapse] 初始化');

  // ========================================
  // 核心函数：切换折叠状态
  // ========================================

  function toggleCollapsed() {
    const isCollapsed = document.body.classList.toggle(COLLAPSED_CLASS);

    if (isCollapsed) {
      // 折叠时：将sidebar宽度CSS变量改为60px
      const currentWidth = localStorage.getItem('simple-sidebar-width') || '280';
      localStorage.setItem('simple-sidebar-width-before-collapse', currentWidth);
      document.documentElement.style.setProperty('--sidebar-width', COLLAPSED_WIDTH + 'px');
    } else {
      // 展开时：恢复之前的宽度
      const savedWidth = localStorage.getItem('simple-sidebar-width-before-collapse') || '280';
      document.documentElement.style.setProperty('--sidebar-width', savedWidth + 'px');
    }

    // 更新按钮状态
    collapseBtn.setAttribute('aria-expanded', !isCollapsed);
    collapseBtn.title = isCollapsed ? '展开侧边栏' : '折叠侧边栏';

    // 切换图标显示
    const iconCollapse = collapseBtn.querySelector('.icon-collapse');
    const iconExpand = collapseBtn.querySelector('.icon-expand');
    if (iconCollapse && iconExpand) {
      iconCollapse.style.display = isCollapsed ? 'none' : 'block';
      iconExpand.style.display = isCollapsed ? 'block' : 'none';
    }

    // 保存状态
    localStorage.setItem(STORAGE_KEY, isCollapsed ? 'true' : 'false');

    console.log('[SidebarCollapse] 状态切换:', isCollapsed ? '已折叠' : '已展开');
  }

  // ========================================
  // 初始化：恢复保存的状态
  // ========================================

  function restoreCollapsedState() {
    const savedState = localStorage.getItem(STORAGE_KEY);
    const iconCollapse = collapseBtn.querySelector('.icon-collapse');
    const iconExpand = collapseBtn.querySelector('.icon-expand');

    if (savedState === 'true') {
      // 恢复折叠状态
      document.body.classList.add(COLLAPSED_CLASS);
      document.documentElement.style.setProperty('--sidebar-width', COLLAPSED_WIDTH + 'px');
      collapseBtn.setAttribute('aria-expanded', 'false');
      collapseBtn.title = '展开侧边栏';
      // 显示展开图标
      if (iconCollapse && iconExpand) {
        iconCollapse.style.display = 'none';
        iconExpand.style.display = 'block';
      }
      console.log('[SidebarCollapse] 恢复折叠状态');
    } else {
      // 确保展开状态显示正确的图标
      if (iconCollapse && iconExpand) {
        iconCollapse.style.display = 'block';
        iconExpand.style.display = 'none';
      }
    }
  }

  // ========================================
  // 绑定事件
  // ========================================

  collapseBtn.addEventListener('click', toggleCollapsed);

  // 页面加载时恢复状态
  restoreCollapsedState();

  console.log('[SidebarCollapse] 初始化完成');

})();
