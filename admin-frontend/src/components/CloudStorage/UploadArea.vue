<template>
  <div class="upload-area">
    <!-- 配置选择 -->
    <div class="upload-header">
      <div class="config-selector">
        <span class="label">上传到：</span>
        <el-select
          v-model="selectedConfigId"
          placeholder="选择云存储配置"
          :disabled="uploading || configs.length === 0"
          style="width: 240px"
        >
          <el-option
            v-for="config in enabledConfigs"
            :key="config.id"
            :label="config.name + (config.isDefault ? ' (默认)' : '')"
            :value="config.id"
          >
            <div class="config-option">
              <span>{{ config.name }}</span>
              <el-tag v-if="config.isDefault" type="success" size="small">默认</el-tag>
            </div>
          </el-option>
        </el-select>
      </div>
    </div>

    <!-- 上传区域 -->
    <div
      class="dropzone"
      :class="{ 'is-dragover': isDragover, 'is-uploading': uploading }"
      @dragover.prevent="handleDragover"
      @dragleave.prevent="handleDragleave"
      @drop.prevent="handleDrop"
      @click="triggerFileSelect"
      @paste="handlePaste"
      tabindex="0"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*,video/*"
        style="display: none"
        @change="handleFileSelect"
      />

      <template v-if="!uploading">
        <el-icon :size="48" class="upload-icon"><UploadFilled /></el-icon>
        <p class="upload-text">拖放文件到此处，或点击上传</p>
        <p class="upload-hint">支持图片和视频，单文件最大 10MB</p>
        <p class="paste-hint">
          <el-icon><DocumentCopy /></el-icon>
          也可以直接 Ctrl+V 粘贴剪贴板中的图片
        </p>
      </template>

      <template v-else>
        <el-progress
          type="circle"
          :percentage="uploadProgress"
          :width="100"
          :stroke-width="8"
        />
        <p class="upload-text">正在上传...</p>
        <p class="upload-hint">{{ uploadingFile }}</p>
      </template>
    </div>

    <!-- 上传结果 -->
    <div v-if="lastUploadResult" class="upload-result">
      <LinkGenerator :result="lastUploadResult" />
    </div>

    <!-- 上传队列 -->
    <div v-if="uploadQueue.length > 0" class="upload-queue">
      <h4>上传队列</h4>
      <div class="queue-list">
        <div
          v-for="(item, index) in uploadQueue"
          :key="index"
          class="queue-item"
          :class="{ 'is-done': item.status === 'done', 'is-error': item.status === 'error' }"
        >
          <div class="queue-item-info">
            <el-icon v-if="item.status === 'pending'" class="status-icon"><Loading /></el-icon>
            <el-icon v-else-if="item.status === 'uploading'" class="status-icon uploading"><Loading /></el-icon>
            <el-icon v-else-if="item.status === 'done'" class="status-icon success"><CircleCheck /></el-icon>
            <el-icon v-else-if="item.status === 'error'" class="status-icon error"><CircleClose /></el-icon>
            <span class="filename">{{ item.filename }}</span>
            <span class="filesize">{{ formatSize(item.size) }}</span>
          </div>
          <div v-if="item.status === 'done' && item.url" class="queue-item-url">
            <el-input v-model="item.url" readonly size="small">
              <template #append>
                <el-button @click="copyToClipboard(item.url)">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
          <div v-else-if="item.status === 'error'" class="queue-item-error">
            {{ item.error }}
          </div>
        </div>
      </div>
      <el-button
        v-if="uploadQueue.every(item => item.status !== 'uploading' && item.status !== 'pending')"
        text
        type="primary"
        @click="clearQueue"
      >
        清空队列
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  UploadFilled,
  DocumentCopy,
  Loading,
  CircleCheck,
  CircleClose
} from '@element-plus/icons-vue'
import { uploadToCloudStorage, formatFileSize } from '@/api/cloudStorage'
import LinkGenerator from './LinkGenerator.vue'

const props = defineProps({
  configs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['uploaded'])

// 数据
const fileInput = ref(null)
const selectedConfigId = ref('')
const isDragover = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadingFile = ref('')
const lastUploadResult = ref(null)
const uploadQueue = ref([])

// 计算属性
const enabledConfigs = computed(() => {
  return props.configs.filter(c => c.enabled)
})

// 监听配置变化，自动选择默认配置
const updateDefaultConfig = () => {
  if (enabledConfigs.value.length > 0 && !selectedConfigId.value) {
    const defaultConfig = enabledConfigs.value.find(c => c.isDefault)
    selectedConfigId.value = defaultConfig ? defaultConfig.id : enabledConfigs.value[0].id
  }
}

// 触发文件选择
const triggerFileSelect = () => {
  if (!uploading.value) {
    fileInput.value?.click()
  }
}

// 处理文件选择
const handleFileSelect = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    processFiles(Array.from(files))
  }
  // 清空 input 以允许重复选择相同文件
  event.target.value = ''
}

// 处理拖放
const handleDragover = () => {
  isDragover.value = true
}

const handleDragleave = () => {
  isDragover.value = false
}

const handleDrop = (event) => {
  isDragover.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFiles(Array.from(files))
  }
}

// 处理粘贴
const handlePaste = async (event) => {
  const items = event.clipboardData?.items
  if (!items) return

  const files = []
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        // 为剪贴板图片生成文件名
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const ext = file.type.split('/')[1] || 'png'
        const newFile = new File([file], `clipboard-${timestamp}.${ext}`, { type: file.type })
        files.push(newFile)
      }
    }
  }

  if (files.length > 0) {
    processFiles(files)
  }
}

// 处理文件列表
const processFiles = async (files) => {
  if (!selectedConfigId.value) {
    ElMessage.warning('请先选择云存储配置')
    return
  }

  // 验证文件
  const validFiles = []
  const maxSize = 10 * 1024 * 1024 // 10MB

  for (const file of files) {
    if (file.size > maxSize) {
      ElMessage.warning(`文件 ${file.name} 超过 10MB 限制`)
      continue
    }
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      ElMessage.warning(`文件 ${file.name} 类型不支持`)
      continue
    }
    validFiles.push(file)
  }

  if (validFiles.length === 0) return

  // 添加到队列
  for (const file of validFiles) {
    uploadQueue.value.push({
      filename: file.name,
      size: file.size,
      file: file,
      status: 'pending',
      url: '',
      error: ''
    })
  }

  // 开始上传
  await uploadFiles()
}

// 上传文件
const uploadFiles = async () => {
  const pendingItems = uploadQueue.value.filter(item => item.status === 'pending')

  for (const item of pendingItems) {
    item.status = 'uploading'
    uploading.value = true
    uploadingFile.value = item.filename
    uploadProgress.value = 0

    try {
      const formData = new FormData()
      formData.append('file', item.file)
      formData.append('configId', selectedConfigId.value)

      const res = await uploadToCloudStorage(formData, (progress) => {
        uploadProgress.value = progress
      })

      if (res.success) {
        item.status = 'done'
        item.url = res.data.url
        lastUploadResult.value = res.data
        emit('uploaded', res.data)
        ElMessage.success(`${item.filename} 上传成功`)
      } else {
        item.status = 'error'
        item.error = res.error || '上传失败'
      }
    } catch (err) {
      item.status = 'error'
      item.error = err.message || '上传失败'
    }
  }

  uploading.value = false
  uploadingFile.value = ''
  uploadProgress.value = 0
}

// 复制到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

// 清空队列
const clearQueue = () => {
  uploadQueue.value = []
  lastUploadResult.value = null
}

// 格式化文件大小
const formatSize = (bytes) => {
  return formatFileSize(bytes)
}

// 监听配置变化
onMounted(() => {
  updateDefaultConfig()
})

// 监听 props 变化
import { watch } from 'vue'
watch(() => props.configs, updateDefaultConfig, { immediate: true })
</script>

<style scoped lang="scss">
.upload-area {
  padding: 16px;
}

.upload-header {
  margin-bottom: 16px;
}

.config-selector {
  display: flex;
  align-items: center;
  gap: 8px;

  .label {
    font-size: 14px;
    color: #606266;
  }
}

.config-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.dropzone {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;

  &:hover,
  &:focus {
    border-color: #409eff;
    background: #f0f9ff;
  }

  &.is-dragover {
    border-color: #409eff;
    background: #e6f4ff;
    transform: scale(1.01);
  }

  &.is-uploading {
    cursor: default;
    pointer-events: none;
  }
}

.upload-icon {
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #606266;
  margin: 0 0 8px;
}

.upload-hint {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.paste-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  color: #c0c4cc;
  margin: 16px 0 0;

  .el-icon {
    font-size: 14px;
  }
}

.upload-result {
  margin-top: 24px;
}

.upload-queue {
  margin-top: 24px;

  h4 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.queue-item {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px;

  &.is-done {
    background: #f0f9eb;
  }

  &.is-error {
    background: #fef0f0;
  }
}

.queue-item-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-icon {
  font-size: 16px;
  color: #909399;

  &.uploading {
    animation: spin 1s linear infinite;
    color: #409eff;
  }

  &.success {
    color: #67c23a;
  }

  &.error {
    color: #f56c6c;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.filename {
  flex: 1;
  font-size: 13px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filesize {
  font-size: 12px;
  color: #909399;
}

.queue-item-url {
  margin-top: 8px;
}

.queue-item-error {
  margin-top: 8px;
  font-size: 12px;
  color: #f56c6c;
}
</style>
