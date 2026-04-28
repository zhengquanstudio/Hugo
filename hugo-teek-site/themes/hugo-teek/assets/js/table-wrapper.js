// 💜 表格包装器 - 为超宽表格添加滚动容器
document.addEventListener('DOMContentLoaded', function() {
  // 查找所有 vp-doc 中的表格
  const tables = document.querySelectorAll('.vp-doc table');
  
  tables.forEach(function(table) {
    // 检查表格是否已经被包装
    if (table.parentElement && table.parentElement.classList.contains('table-wrapper')) {
      return;
    }
    
    // 创建包装容器
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    
    // 将表格插入到包装容器中
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
});

// 兼容 PJAX 页面切换
document.addEventListener('pjax:complete', function() {
  const tables = document.querySelectorAll('.vp-doc table');
  
  tables.forEach(function(table) {
    if (table.parentElement && table.parentElement.classList.contains('table-wrapper')) {
      return;
    }
    
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
});
