/* 🕊️白木 开发 🔗gl.baimu.live */

/**
 * 💬 Twikoo 管理员后台独立窗口模块
 * 🎯 功能：点击齿轮图标后，在页面中央以独立窗口形式展示管理员后台
 */

(function() {
  'use strict';

  /* 🔗 管理面板模态窗口配置 */
  const CONFIG = {
    modalId: 'tk-admin-modal-wrapper', // ◀️ 模态窗口包装器ID
    overlayId: 'tk-admin-modal-overlay', // ◀️ 遮罩层ID
    animationDuration: 300, // ◀️ 动画持续时间（毫秒）
    zIndex: 10000 // ◀️ 模态窗口层级
  };

  /* 🎯 创建管理面板模态窗口 */
  function createAdminModal() {
    /* 🚫 如果已存在则不再创建 */
    if (document.getElementById(CONFIG.modalId)) {
      return;
    }

    /* 🎨 创建遮罩层 */
    const overlay = document.createElement('div');
    overlay.id = CONFIG.overlayId;
    overlay.className = 'tk-admin-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: ${CONFIG.zIndex - 1};
      opacity: 0;
      transition: opacity ${CONFIG.animationDuration}ms ease;
      display: none;
    `;

    /* 🎨 创建模态窗口容器 */
    const modalWrapper = document.createElement('div');
    modalWrapper.id = CONFIG.modalId;
    modalWrapper.className = 'tk-admin-modal-wrapper';
    modalWrapper.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      z-index: ${CONFIG.zIndex};
      width: 90vw;
      max-width: 600px;
      max-height: 80vh;
      opacity: 0;
      transition: all ${CONFIG.animationDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1);
      display: none;
    `;

    /* 🎨 创建模态窗口内容区 */
    const modalContent = document.createElement('div');
    modalContent.className = 'tk-admin-modal-content';
    modalContent.style.cssText = `
      background: var(--tk-comment-glass-bg, rgba(255, 255, 255, 0.85));
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid var(--tk-comment-glass-border, rgba(255, 255, 255, 0.5));
      border-radius: 20px;
      box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    /* 🎨 创建模态窗口头部 */
    const modalHeader = document.createElement('div');
    modalHeader.className = 'tk-admin-modal-header';
    modalHeader.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--tk-comment-glass-border, rgba(255, 255, 255, 0.3));
      background: var(--tk-comment-item-bg, rgba(255, 255, 255, 0.5));
    `;

    /* 📝 标题 */
    const modalTitle = document.createElement('h3');
    modalTitle.className = 'tk-admin-modal-title';
    modalTitle.textContent = '🔧 评论管理后台';
    modalTitle.style.cssText = `
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-color, #1f2937);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    `;

    /* ❌ 关闭按钮 */
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tk-admin-modal-close';
    closeBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    `;
    closeBtn.style.cssText = `
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: var(--tk-comment-input-bg, rgba(255, 255, 255, 0.6));
      border: 1px solid var(--tk-comment-input-border, rgba(14, 116, 144, 0.2));
      cursor: pointer;
      transition: all 0.3s ease;
      color: var(--text-secondary, #6b7280);
    `;
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'var(--tk-comment-item-hover-bg, rgba(255, 255, 255, 0.8))';
      closeBtn.style.borderColor = 'var(--tk-comment-input-focus-border, rgba(14, 116, 144, 0.5))';
      closeBtn.style.color = 'var(--primary-color, #0e7490)';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'var(--tk-comment-input-bg, rgba(255, 255, 255, 0.6))';
      closeBtn.style.borderColor = 'var(--tk-comment-input-border, rgba(14, 116, 144, 0.2))';
      closeBtn.style.color = 'var(--text-secondary, #6b7280)';
    });
    closeBtn.addEventListener('click', hideAdminModal);

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeBtn);

    /* 📦 内容区域 */
    const modalBody = document.createElement('div');
    modalBody.className = 'tk-admin-modal-body';
    modalBody.style.cssText = `
      padding: 1.25rem;
      overflow-y: auto;
      max-height: calc(80vh - 70px);
    `;

    /* 🎯 管理面板容器 - 用于存放原始的管理面板 */
    const adminContainerPlaceholder = document.createElement('div');
    adminContainerPlaceholder.id = 'tk-admin-container-placeholder';
    adminContainerPlaceholder.style.cssText = `
      min-height: 200px;
    `;

    modalBody.appendChild(adminContainerPlaceholder);
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalWrapper.appendChild(modalContent);

    document.body.appendChild(overlay);
    document.body.appendChild(modalWrapper);

    /* 🎯 点击遮罩层关闭 */
    overlay.addEventListener('click', hideAdminModal);

    /* 🎯 ESC键关闭 */
    document.addEventListener('keydown', handleEscKey);

    return { overlay, modalWrapper, adminContainerPlaceholder };
  }

  /* ⌨️ 处理ESC键 */
  function handleEscKey(e) {
    if (e.key === 'Escape') {
      hideAdminModal();
    }
  }

  /* 👁️ 显示管理面板模态窗口 */
  function showAdminModal() {
    const modal = createAdminModal();
    if (!modal) {
      /* 🔄 如果已经创建，直接显示 */
      const existingModal = document.getElementById(CONFIG.modalId);
      const existingOverlay = document.getElementById(CONFIG.overlayId);
      if (existingModal && existingOverlay) {
        existingOverlay.style.display = 'block';
        existingModal.style.display = 'block';
        setTimeout(() => {
          existingOverlay.style.opacity = '1';
          existingModal.style.opacity = '1';
          existingModal.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
      }
      return;
    }

    const { overlay, modalWrapper } = modal;

    /* 🎬 显示动画 */
    overlay.style.display = 'block';
    modalWrapper.style.display = 'block';

    /* 🎯 移动原始管理面板到模态窗口 */
    moveAdminPanelToModal();

    setTimeout(() => {
      overlay.style.opacity = '1';
      modalWrapper.style.opacity = '1';
      modalWrapper.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);

    /* 🚫 禁止背景滚动 */
    document.body.style.overflow = 'hidden';
  }

  /* 🙈 隐藏管理面板模态窗口 */
  function hideAdminModal() {
    const modalWrapper = document.getElementById(CONFIG.modalId);
    const overlay = document.getElementById(CONFIG.overlayId);

    if (!modalWrapper || !overlay) return;

    /* 🎬 隐藏动画 */
    overlay.style.opacity = '0';
    modalWrapper.style.opacity = '0';
    modalWrapper.style.transform = 'translate(-50%, -50%) scale(0.9)';

    setTimeout(() => {
      overlay.style.display = 'none';
      modalWrapper.style.display = 'none';

      /* 🎯 将管理面板移回原位 */
      restoreAdminPanel();

      /* ✅ 恢复背景滚动 */
      document.body.style.overflow = '';
    }, CONFIG.animationDuration);
  }

  /* 🔄 移动管理面板到模态窗口 */
  function moveAdminPanelToModal() {
    const originalContainer = document.querySelector('.tk-admin-container');
    const placeholder = document.getElementById('tk-admin-container-placeholder');

    if (originalContainer && placeholder) {
      /* 💾 保存原始父元素引用 */
      window._tkAdminOriginalParent = originalContainer.parentElement;
      window._tkAdminOriginalNextSibling = originalContainer.nextElementSibling;

      /* 🎯 移动到模态窗口 */
      placeholder.appendChild(originalContainer);

      /* 🎨 调整管理面板样式以适应模态窗口 */
      originalContainer.style.cssText = `
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
      `;

      /* 🎨 调整内部管理面板样式 */
      const adminPanel = originalContainer.querySelector('.tk-admin');
      if (adminPanel) {
        adminPanel.style.cssText = `
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
        `;
      }
    }
  }

  /* 🔄 恢复管理面板到原位 */
  function restoreAdminPanel() {
    const originalContainer = document.querySelector('.tk-admin-container');

    if (originalContainer && window._tkAdminOriginalParent) {
      /* 🎯 恢复原始样式 */
      originalContainer.style.cssText = '';

      const adminPanel = originalContainer.querySelector('.tk-admin');
      if (adminPanel) {
        adminPanel.style.cssText = '';
      }

      /* 🎯 移回原位 */
      if (window._tkAdminOriginalNextSibling) {
        window._tkAdminOriginalParent.insertBefore(originalContainer, window._tkAdminOriginalNextSibling);
      } else {
        window._tkAdminOriginalParent.appendChild(originalContainer);
      }

      /* 🧹 清理引用 */
      window._tkAdminOriginalParent = null;
      window._tkAdminOriginalNextSibling = null;
    }
  }

  /* 🔗 劫持齿轮点击事件 */
  function hijackAdminButton() {
    /* 🎯 使用事件委托监听齿轮按钮点击 */
    document.addEventListener('click', function(e) {
      /* 🔍 查找点击的元素是否是齿轮按钮或其子元素 */
      const adminBtn = e.target.closest('.tk-admin');

      if (adminBtn) {
        /* 🚫 阻止默认行为 */
        e.preventDefault();
        e.stopPropagation();

        /* 🎬 显示管理面板模态窗口 */
        showAdminModal();
      }
    });

    /* 🎯 同时监听刷新按钮，确保在管理面板打开时也能刷新 */
    document.addEventListener('click', function(e) {
      const refreshBtn = e.target.closest('.tk-icon.__comments');
      if (refreshBtn) {
        /* 🔄 如果模态窗口打开，先关闭它 */
        const modalWrapper = document.getElementById(CONFIG.modalId);
        if (modalWrapper && modalWrapper.style.display === 'block') {
          hideAdminModal();
        }
      }
    });
  }

  /* 🚀 初始化 */
  function init() {
    /* 🎯 劫持齿轮按钮点击事件 */
    hijackAdminButton();

    console.log('[TwikooAdminModal] ✅ 管理员后台模态窗口模块已初始化');
  }

  /* 🎯 DOM 加载完成后初始化 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* 🎯 导出到全局，供其他脚本调用 */
  window.TwikooAdminModal = {
    show: showAdminModal,
    hide: hideAdminModal
  };
})();
