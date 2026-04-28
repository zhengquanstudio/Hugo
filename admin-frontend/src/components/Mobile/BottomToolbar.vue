<template>
  <div class="bottom-toolbar">
    <!-- 格式化工具按钮 -->
    <div class="toolbar-main">
      <button
        v-for="tool in mainTools"
        :key="tool.action"
        class="toolbar-btn"
        :title="tool.label"
        @click="handleAction(tool.action)"
      >
        <span class="toolbar-icon" v-html="tool.icon"></span>
      </button>

      <!-- 更多按钮 -->
      <button class="toolbar-btn" title="更多" @click="showMoreTools = true">
        <span class="toolbar-icon">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <circle cx="5" cy="12" r="2" fill="currentColor"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
            <circle cx="19" cy="12" r="2" fill="currentColor"/>
          </svg>
        </span>
      </button>
    </div>

    <!-- 预览切换 -->
    <button
      class="toolbar-btn preview-btn"
      :class="{ active: isPreview }"
      @click="$emit('toggle-preview')"
    >
      <el-icon :size="18"><View /></el-icon>
      <span>预览</span>
    </button>

    <!-- 更多工具抽屉 -->
    <el-drawer
      v-model="showMoreTools"
      direction="btt"
      size="auto"
      :show-close="false"
      class="more-tools-drawer"
    >
      <template #header>
        <div class="drawer-header">
          <span>更多格式</span>
          <el-button text @click="showMoreTools = false">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>

      <div class="more-tools-grid">
        <button
          v-for="tool in moreTools"
          :key="tool.action"
          class="more-tool-item"
          @click="handleMoreAction(tool.action)"
        >
          <span class="tool-icon" v-html="tool.icon"></span>
          <span class="tool-label">{{ tool.label }}</span>
        </button>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  isPreview: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['insert', 'toggle-preview'])

const showMoreTools = ref(false)

// 主工具栏按钮
const mainTools = [
  {
    action: 'bold',
    label: '加粗',
    icon: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>'
  },
  {
    action: 'italic',
    label: '斜体',
    icon: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>'
  },
  {
    action: 'link',
    label: '链接',
    icon: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>'
  },
  {
    action: 'image',
    label: '图片',
    icon: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>'
  },
  {
    action: 'code',
    label: '代码块',
    icon: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>'
  }
]

// 更多工具
const moreTools = [
  {
    action: 'h1',
    label: '一级标题',
    icon: '<svg viewBox="0 0 24 24" width="24" height="24"><text x="4" y="18" font-size="16" font-weight="bold" fill="currentColor">H1</text></svg>'
  },
  {
    action: 'h2',
    label: '二级标题',
    icon: '<svg viewBox="0 0 24 24" width="24" height="24"><text x="4" y="18" font-size="16" font-weight="bold" fill="currentColor">H2</text></svg>'
  },
  {
    action: 'h3',
    label: '三级标题',
    icon: '<svg viewBox="0 0 24 24" width="24" height="24"><text x="4" y="18" font-size="16" font-weight="bold" fill="currentColor">H3</text></svg>'
  },
  {
    action: 'ul',
    label: '无序列表',
    icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>'
  },
  {
    action: 'ol',
    label: '有序列表',
    icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>'
  },
  {
    action: 'quote',
    label: '引用',
    icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>'
  },
  {
    action: 'hr',
    label: '分割线',
    icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M4 11h16v2H4z"/></svg>'
  },
  {
    action: 'strikethrough',
    label: '删除线',
    icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/></svg>'
  },
  {
    action: 'inline-code',
    label: '行内代码',
    icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 16h8v2H8zm0-4h8v2H8zm6-10H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>'
  },
  {
    action: 'tip',
    label: '提示块',
    icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
  },
  {
    action: 'warning',
    label: '警告块',
    icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>'
  },
  {
    action: 'danger',
    label: '危险块',
    icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
  }
]

// 处理工具点击
function handleAction(action) {
  let text = ''
  let cursorOffset = 0

  switch (action) {
    case 'bold':
      text = '**文本**'
      cursorOffset = 2
      break
    case 'italic':
      text = '*文本*'
      cursorOffset = 1
      break
    case 'link':
      text = '[链接文字](url)'
      cursorOffset = 1
      break
    case 'image':
      emit('insert', { action: 'image' })
      return
    case 'code':
      text = '```\n代码\n```'
      cursorOffset = 4
      break
  }

  emit('insert', { text, cursorOffset })
}

// 处理更多工具点击
function handleMoreAction(action) {
  let text = ''
  let cursorOffset = 0

  switch (action) {
    case 'h1':
      text = '# 标题'
      cursorOffset = 2
      break
    case 'h2':
      text = '## 标题'
      cursorOffset = 3
      break
    case 'h3':
      text = '### 标题'
      cursorOffset = 4
      break
    case 'ul':
      text = '- 列表项'
      cursorOffset = 2
      break
    case 'ol':
      text = '1. 列表项'
      cursorOffset = 3
      break
    case 'quote':
      text = '> 引用内容'
      cursorOffset = 2
      break
    case 'hr':
      text = '\n---\n'
      cursorOffset = 0
      break
    case 'strikethrough':
      text = '~~文本~~'
      cursorOffset = 2
      break
    case 'inline-code':
      text = '`代码`'
      cursorOffset = 1
      break
    case 'tip':
      text = '::: tip 提示\n内容\n:::'
      cursorOffset = 10
      break
    case 'warning':
      text = '::: warning 注意\n内容\n:::'
      cursorOffset = 13
      break
    case 'danger':
      text = '::: danger 危险\n内容\n:::'
      cursorOffset = 12
      break
  }

  showMoreTools.value = false
  emit('insert', { text, cursorOffset })
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.bottom-toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: $bg-card;
  border-top: 1px solid $border-light;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-3;
  z-index: $z-fixed;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}

.toolbar-main {
  display: flex;
  align-items: center;
  gap: $spacing-1;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  border-radius: $radius-lg;
  color: $text-secondary;
  cursor: pointer;
  transition: all $transition-fast $ease-out;

  &:hover,
  &:active {
    background: rgba($primary, 0.1);
    color: $primary;
  }

  &.active {
    background: $primary;
    color: white;
  }
}

.toolbar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-btn {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  padding: 0 $spacing-3;
  width: auto;
  font-size: $text-sm;
  font-weight: $font-medium;

  span {
    margin-left: $spacing-1;
  }
}

// 更多工具抽屉
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: $text-lg;
  font-weight: $font-semibold;
}

.more-tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-3;
  padding: $spacing-4;
}

.more-tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-3;
  background: $bg-secondary;
  border: none;
  border-radius: $radius-lg;
  cursor: pointer;
  transition: all $transition-fast $ease-out;

  &:hover,
  &:active {
    background: rgba($primary, 0.1);
  }

  .tool-icon {
    color: $text-secondary;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tool-label {
    font-size: $text-xs;
    color: $text-secondary;
  }
}

:deep(.more-tools-drawer) {
  .el-drawer__header {
    padding: $spacing-4;
    margin-bottom: 0;
  }

  .el-drawer__body {
    padding: 0;
  }
}
</style>
