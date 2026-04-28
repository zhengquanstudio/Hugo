<template>
  <div class="mobile-editor" :class="{ 'preview-mode': isPreview }">
    <!-- 标题输入 -->
    <div class="title-input-wrapper">
      <input
        ref="titleInput"
        v-model="localTitle"
        type="text"
        class="title-input"
        placeholder="请输入文章标题..."
        @input="handleTitleChange"
      />
    </div>

    <!-- 编辑区域 / 预览区域 -->
    <div class="editor-content">
      <!-- 编辑模式 -->
      <textarea
        v-show="!isPreview"
        ref="textareaRef"
        v-model="localContent"
        class="content-textarea"
        placeholder="开始写作..."
        @input="handleContentChange"
        @scroll="handleScroll"
      ></textarea>

      <!-- 预览模式 -->
      <div
        v-show="isPreview"
        class="content-preview"
        v-html="renderedContent"
      ></div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <span class="word-count">{{ wordCount }} 字</span>
      <span v-if="lastSaved" class="save-status">
        <el-icon><Check /></el-icon>
        {{ lastSavedText }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  isPreview: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:title', 'update:content', 'auto-save'])

const titleInput = ref(null)
const textareaRef = ref(null)
const localTitle = ref(props.title)
const localContent = ref(props.content)
const lastSaved = ref(null)
const autoSaveTimer = ref(null)

// 计算字数
const wordCount = computed(() => {
  return localContent.value.length
})

// 最后保存时间文本
const lastSavedText = computed(() => {
  if (!lastSaved.value) return ''
  const now = new Date()
  const diff = Math.floor((now - lastSaved.value) / 1000)
  if (diff < 60) return '刚刚已保存'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前已保存`
  return `${Math.floor(diff / 3600)} 小时前已保存`
})

// 渲染预览内容
const renderedContent = computed(() => {
  try {
    return marked(localContent.value || '')
  } catch (e) {
    return localContent.value
  }
})

// 同步外部值
watch(() => props.title, (val) => {
  if (val !== localTitle.value) {
    localTitle.value = val
  }
})

watch(() => props.content, (val) => {
  if (val !== localContent.value) {
    localContent.value = val
  }
})

// 处理标题变化
function handleTitleChange() {
  emit('update:title', localTitle.value)
  scheduleAutoSave()
}

// 处理内容变化
function handleContentChange() {
  emit('update:content', localContent.value)
  scheduleAutoSave()
}

// 处理滚动（保存滚动位置）
function handleScroll() {
  // 可以用于后续恢复滚动位置
}

// 定时自动保存
function scheduleAutoSave() {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
  autoSaveTimer.value = setTimeout(() => {
    emit('auto-save')
    lastSaved.value = new Date()
  }, 30000) // 30秒自动保存
}

// 插入文本
function insertText(data) {
  if (!textareaRef.value) return

  const textarea = textareaRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = localContent.value.substring(0, start)
  const after = localContent.value.substring(end)

  // 如果是图片上传请求
  if (data.action === 'image') {
    // 触发父组件打开图片上传
    emit('open-image-upload')
    return
  }

  localContent.value = before + data.text + after
  emit('update:content', localContent.value)

  // 设置光标位置
  nextTick(() => {
    textarea.focus()
    const newPos = start + (data.cursorOffset || data.text.length)
    textarea.setSelectionRange(newPos, newPos)
  })
}

// 插入图片链接
function insertImageUrl(url, alt = '图片') {
  const markdown = `![${alt}](${url})`
  insertText({ text: markdown })
}

// 聚焦到内容区域
function focusContent() {
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

// 组件挂载
onMounted(() => {
  // 根据内容决定聚焦位置
  if (!localTitle.value) {
    titleInput.value?.focus()
  } else {
    focusContent()
  }
})

// 组件卸载
onUnmounted(() => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
})

// 暴露方法
defineExpose({
  insertText,
  insertImageUrl,
  focusContent
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.mobile-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: $bg-card;
}

.title-input-wrapper {
  padding: $spacing-4;
  border-bottom: 1px solid $border-light;
}

.title-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: $text-xl;
  font-weight: $font-semibold;
  color: $text-primary;
  background: transparent;

  &::placeholder {
    color: $text-muted;
  }
}

.editor-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.content-textarea {
  width: 100%;
  height: 100%;
  padding: $spacing-4;
  border: none;
  outline: none;
  resize: none;
  font-size: $text-base;
  line-height: 1.8;
  font-family: $font-mono;
  color: $text-primary;
  background: transparent;

  &::placeholder {
    color: $text-muted;
  }
}

.content-preview {
  width: 100%;
  height: 100%;
  padding: $spacing-4;
  overflow-y: auto;
  font-size: $text-base;
  line-height: 1.8;
  color: $text-primary;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: $font-semibold;
    color: $text-primary;
  }

  :deep(h1) {
    font-size: $text-2xl;
    border-bottom: 1px solid $border-light;
    padding-bottom: $spacing-2;
  }

  :deep(h2) {
    font-size: $text-xl;
  }

  :deep(h3) {
    font-size: $text-lg;
  }

  :deep(p) {
    margin: 1em 0;
  }

  :deep(code) {
    padding: 2px 6px;
    background: $bg-secondary;
    border-radius: $radius-sm;
    font-family: $font-mono;
    font-size: 0.9em;
  }

  :deep(pre) {
    padding: $spacing-4;
    background: $bg-secondary;
    border-radius: $radius-md;
    overflow-x: auto;

    code {
      padding: 0;
      background: transparent;
    }
  }

  :deep(blockquote) {
    margin: 1em 0;
    padding-left: $spacing-4;
    border-left: 4px solid $primary;
    color: $text-secondary;
  }

  :deep(ul),
  :deep(ol) {
    margin: 1em 0;
    padding-left: 1.5em;
  }

  :deep(li) {
    margin: 0.5em 0;
  }

  :deep(a) {
    color: $primary;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(img) {
    max-width: 100%;
    border-radius: $radius-md;
  }

  :deep(hr) {
    margin: 2em 0;
    border: none;
    border-top: 1px solid $border-light;
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;

    th,
    td {
      padding: $spacing-2 $spacing-3;
      border: 1px solid $border-light;
      text-align: left;
    }

    th {
      background: $bg-secondary;
      font-weight: $font-semibold;
    }
  }
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-2 $spacing-4;
  font-size: $text-xs;
  color: $text-muted;
  border-top: 1px solid $border-light;
  background: $bg-secondary;
}

.word-count {
  font-family: $font-mono;
}

.save-status {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  color: $success;

  .el-icon {
    font-size: 14px;
  }
}
</style>
