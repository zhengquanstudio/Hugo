<template>
  <el-drawer
    v-model="internalVisible"
    title="云存储上传"
    direction="rtl"
    :size="420"
    :before-close="handleClose"
    :append-to-body="true"
    class="cloud-upload-drawer"
  >
    <div class="cloud-upload-panel">
      <!-- 标签页 -->
      <el-tabs v-model="activeTab" class="panel-tabs">
        <el-tab-pane label="上传" name="upload">
          <!-- 配置选择 -->
          <div class="config-select">
            <span class="label">云存储:</span>
            <el-select
              v-model="selectedConfigId"
              placeholder="选择云存储配置"
              size="default"
              :loading="loadingConfigs"
            >
              <el-option
                v-for="cfg in configs"
                :key="cfg.id"
                :label="cfg.name"
                :value="cfg.id"
              >
                <span class="config-option">
                  <span class="config-name">{{ cfg.name }}</span>
                  <el-tag v-if="cfg.isDefault" size="small" type="success">默认</el-tag>
                </span>
              </el-option>
            </el-select>
          </div>

          <!-- 上传区域 -->
          <div
            class="upload-zone"
            :class="{ 'is-dragover': isDragover, 'is-uploading': uploading }"
            @dragover.prevent="handleDragover"
            @dragleave.prevent="handleDragleave"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
            @paste="handlePaste"
            tabindex="0"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileSelect"
            />
            <template v-if="!uploading">
              <el-icon class="upload-icon" :size="48"><Upload /></el-icon>
              <p class="upload-text">拖放图片到这里，或点击选择</p>
              <p class="upload-hint">支持粘贴截图 (Ctrl+V)</p>
            </template>
            <template v-else>
              <div class="upload-progress">
                <el-icon class="loading-icon" :size="32"><Loading /></el-icon>
                <p class="uploading-file">{{ uploadingFile }}</p>
                <el-progress
                  :percentage="uploadProgress"
                  :stroke-width="6"
                  :show-text="true"
                />
              </div>
            </template>
          </div>

          <!-- 无配置提示 -->
          <el-alert
            v-if="!loadingConfigs && configs.length === 0"
            title="暂无可用的云存储配置"
            type="warning"
            :closable="false"
            show-icon
          >
            <template #default>
              <router-link to="/cloud-storage" @click="handleClose">前往配置云存储</router-link>
            </template>
          </el-alert>
        </el-tab-pane>

        <el-tab-pane label="历史" name="history">
          <!-- 搜索 -->
          <el-input
            v-model="searchQuery"
            placeholder="搜索文件名..."
            size="default"
            :prefix-icon="Search"
            clearable
            @input="handleSearchInput"
          />

          <!-- 图片网格 -->
          <div class="history-grid" v-loading="loadingHistory">
            <div
              v-for="item in historyItems"
              :key="item.id"
              class="history-item"
              @click="insertFromHistory(item)"
            >
              <el-image
                :src="item.url"
                :alt="item.filename"
                fit="cover"
                lazy
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="item-overlay">
                <span class="item-filename">{{ item.filename }}</span>
              </div>
            </div>

            <!-- 空状态 -->
            <el-empty
              v-if="!loadingHistory && historyItems.length === 0"
              description="暂无上传记录"
              :image-size="80"
            />
          </div>

          <!-- 加载更多 -->
          <div v-if="hasMore && historyItems.length > 0" class="load-more">
            <el-button text type="primary" :loading="loadingMore" @click="loadMore">
              加载更多
            </el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { Upload, Search, Picture, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getCloudStorageConfigs,
  uploadToCloudStorage,
  getCloudStorageHistory
} from '@/api/cloudStorage'

const emit = defineEmits(['insert', 'close', 'update:visible'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// 双向绑定 visible
const internalVisible = computed({
  get: () => props.visible,
  set: (val) => {
    if (!val) {
      emit('close')
    }
    emit('update:visible', val)
  }
})

// Refs
const fileInputRef = ref(null)

// 状态
const activeTab = ref('upload')
const loadingConfigs = ref(false)
const configs = ref([])
const selectedConfigId = ref('')

// 上传状态
const uploading = ref(false)
const uploadingFile = ref('')
const uploadProgress = ref(0)
const isDragover = ref(false)

// 历史状态
const historyItems = ref([])
const searchQuery = ref('')
const page = ref(1)
const hasMore = ref(true)
const loadingHistory = ref(false)
const loadingMore = ref(false)

let searchDebounceTimer = null

// 初始化
onMounted(async () => {
  await loadConfigs()
})

// 监听面板打开
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    // 重置状态
    activeTab.value = 'upload'
    page.value = 1
    searchQuery.value = ''
    // 加载数据
    if (configs.value.length === 0) {
      await loadConfigs()
    }
    await loadHistory()
  }
})

// 加载云存储配置
const loadConfigs = async () => {
  loadingConfigs.value = true
  try {
    const res = await getCloudStorageConfigs()
    if (res.success) {
      // 只显示已启用的配置
      configs.value = (res.data || []).filter(c => c.enabled)
      // 设置默认选中
      const defaultConfig = configs.value.find(c => c.isDefault)
      selectedConfigId.value = defaultConfig?.id || configs.value[0]?.id || ''
    }
  } catch (error) {
    console.error('加载云存储配置失败:', error)
  } finally {
    loadingConfigs.value = false
  }
}

// 加载历史记录
const loadHistory = async (append = false) => {
  if (append) {
    loadingMore.value = true
  } else {
    loadingHistory.value = true
  }

  try {
    const res = await getCloudStorageHistory({
      page: page.value,
      limit: 12,
      search: searchQuery.value
    })
    if (res.success) {
      const items = res.data?.items || []
      if (append) {
        historyItems.value = [...historyItems.value, ...items]
      } else {
        historyItems.value = items
      }
      hasMore.value = items.length === 12
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  } finally {
    loadingHistory.value = false
    loadingMore.value = false
  }
}

// 搜索防抖
const handleSearchInput = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  searchDebounceTimer = setTimeout(() => {
    page.value = 1
    loadHistory()
  }, 300)
}

// 加载更多
const loadMore = () => {
  page.value++
  loadHistory(true)
}

// 触发文件选择
const triggerFileInput = () => {
  if (!uploading.value && fileInputRef.value) {
    fileInputRef.value.click()
  }
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    handleUpload(file)
  }
  // 重置 input，允许重复选择同一文件
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
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
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    handleUpload(file)
  } else {
    ElMessage.warning('请拖放图片文件')
  }
}

// 处理粘贴
const handlePaste = (event) => {
  const items = event.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        // 为粘贴的图片生成文件名
        const ext = file.type.split('/')[1] || 'png'
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
        const newFile = new File([file], `paste-${timestamp}.${ext}`, { type: file.type })
        handleUpload(newFile)
        break
      }
    }
  }
}

// 上传文件
const handleUpload = async (file) => {
  if (!selectedConfigId.value) {
    ElMessage.warning('请先选择云存储配置')
    return
  }

  // 验证文件
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('只支持上传图片文件')
    return
  }

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    ElMessage.warning('图片大小不能超过 10MB')
    return
  }

  uploading.value = true
  uploadingFile.value = file.name
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('configId', selectedConfigId.value)

    const res = await uploadToCloudStorage(formData, (percent) => {
      uploadProgress.value = percent
    })

    if (res.success) {
      // 生成 Markdown 格式
      const alt = res.data.filename?.replace(/\.[^/.]+$/, '') || 'image'
      const markdown = `![${alt}](${res.data.url})`
      emit('insert', markdown)
      emit('close')
      ElMessage.success('上传成功')
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
  } finally {
    uploading.value = false
    uploadingFile.value = ''
    uploadProgress.value = 0
  }
}

// 从历史插入
const insertFromHistory = (item) => {
  const alt = item.filename?.replace(/\.[^/.]+$/, '') || 'image'
  const markdown = `![${alt}](${item.url})`
  emit('insert', markdown)
  emit('close')
}

// 关闭面板
const handleClose = () => {
  internalVisible.value = false
}
</script>

<style scoped>
.cloud-upload-panel {
  height: 100%;
}

.panel-tabs {
  height: 100%;
}

.panel-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.panel-tabs :deep(.el-tabs__content) {
  height: calc(100% - 56px);
  overflow: auto;
}

.panel-tabs :deep(.el-tab-pane) {
  height: 100%;
}

/* 配置选择 */
.config-select {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.config-select .label {
  font-size: 13px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.config-select .el-select {
  flex: 1;
}

.config-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.config-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 上传区域 */
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  padding: 24px;
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.upload-zone:hover,
.upload-zone:focus {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.upload-zone.is-dragover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-8);
}

.upload-zone.is-uploading {
  cursor: default;
  pointer-events: none;
}

.upload-icon {
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
}

.upload-text {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0 0 4px 0;
}

.upload-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

/* 上传进度 */
.upload-progress {
  width: 100%;
  text-align: center;
}

.loading-icon {
  color: var(--el-color-primary);
  animation: rotate 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.uploading-file {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 历史网格 */
.history-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 16px;
  min-height: 200px;
}

.history-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.2s ease;
}

.history-item:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.history-item :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.history-item :deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
}

.item-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px 6px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.history-item:hover .item-overlay {
  opacity: 1;
}

.item-filename {
  font-size: 11px;
  color: #fff;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 空状态 */
.history-grid :deep(.el-empty) {
  grid-column: 1 / -1;
  padding: 20px;
}

/* 加载更多 */
.load-more {
  text-align: center;
  margin-top: 12px;
}

/* 警告提示 */
:deep(.el-alert) {
  margin-top: 16px;
}

:deep(.el-alert a) {
  color: var(--el-color-primary);
  text-decoration: none;
}

:deep(.el-alert a:hover) {
  text-decoration: underline;
}
</style>

<!-- 全局样式 - drawer 需要全局样式 -->
<style>
.cloud-upload-drawer .el-drawer__header {
  margin-bottom: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.cloud-upload-drawer .el-drawer__body {
  padding: 16px 20px;
}

.cloud-upload-drawer .el-drawer__title {
  font-size: 16px;
  font-weight: 600;
}
</style>
