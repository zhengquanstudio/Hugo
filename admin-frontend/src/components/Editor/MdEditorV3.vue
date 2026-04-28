<template>
  <div class="md-editor-v3-wrapper">
    <MdEditor
      ref="editorRef"
      v-model="content"
      :theme="theme"
      :preview-theme="previewTheme"
      :code-theme="codeTheme"
      :toolbars="toolbars"
      @on-upload-img="handleUploadImg"
      @save="handleSave"
    >
      <!-- 自定义工具栏按钮 - 云存储上传 -->
      <template #defToolbars>
        <NormalToolbar title="云存储上传" @onClick="handleCloudUploadClick">
          <template #trigger>
            <svg viewBox="0 0 24 24" width="20" height="20" class="cloud-upload-icon">
              <path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
            </svg>
          </template>
        </NormalToolbar>
      </template>
    </MdEditor>

    <!-- 云存储上传面板 -->
    <CloudUploadPanel
      v-model:visible="cloudUploadVisible"
      @insert="handleCloudInsert"
      @close="cloudUploadVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { MdEditor, NormalToolbar } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import './styles/index.scss'
import CloudUploadPanel from './CloudUploadPanel.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  uploadUrl: {
    type: String,
    default: '/api/v1/media/upload'
  }
})

const emit = defineEmits(['update:modelValue', 'fullscreen-change'])

const editorRef = ref(null)
const content = ref(props.modelValue)
const theme = ref('light')
const previewTheme = ref('vuepress')
const codeTheme = ref('github')

// 云存储上传状态
const cloudUploadVisible = ref(false)

// 工具栏配置 - 在图片按钮后添加云上传按钮
const toolbars = [
  'bold', 'underline', 'italic', 'strikeThrough',
  '-',
  'title', 'sub', 'sup', 'quote',
  '-',
  'unorderedList', 'orderedList', 'task',
  '-',
  'code', 'codeRow',
  '-',
  'link', 'image', 0,  // 0 表示第一个自定义工具栏（云上传）
  'table', 'mermaid', 'katex',
  '-',
  'revoke', 'next',
  '=',
  'pageFullscreen', 'fullscreen', 'preview', 'previewOnly', 'htmlPreview', 'catalog'
]

// 监听内容变化
watch(content, (newValue) => {
  emit('update:modelValue', newValue)
})

// 监听外部变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    content.value = newValue
  }
})

// 图片上传处理
const handleUploadImg = async (files, callback) => {
  const formData = new FormData()
  formData.append('file', files[0])

  try {
    const response = await fetch(props.uploadUrl, {
      method: 'POST',
      body: formData
    })
    const result = await response.json()

    if (result.success) {
      callback([result.data.url])
    } else {
      console.error('上传失败:', result.message)
    }
  } catch (error) {
    console.error('上传错误:', error)
  }
}

// 保存快捷键处理
const handleSave = (value) => {
  emit('update:modelValue', value)
}

// 云存储上传按钮点击
const handleCloudUploadClick = () => {
  cloudUploadVisible.value = true
}

// 插入云存储图片到编辑器
const handleCloudInsert = (markdown: string) => {
  if (editorRef.value?.insert) {
    editorRef.value.insert(() => {
      return {
        targetValue: markdown,
        select: false,
        deviationStart: 0,
        deviationEnd: 0
      }
    })
  }
}

// 暴露方法给父组件
defineExpose({
  getValue: () => content.value,
  setValue: (value) => { content.value = value }
})
</script>

<!-- 样式已迁移至 ./styles/ 目录 -->
