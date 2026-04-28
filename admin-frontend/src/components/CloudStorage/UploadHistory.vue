<template>
  <div class="upload-history">
    <!-- 搜索和筛选 -->
    <div class="history-header">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索文件名或 URL"
        clearable
        style="width: 280px"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select
        v-model="filterConfigId"
        placeholder="筛选配置"
        clearable
        style="width: 180px"
        @change="fetchHistory"
      >
        <el-option label="全部配置" value="" />
        <el-option
          v-for="config in configs"
          :key="config.id"
          :label="config.name"
          :value="config.id"
        />
      </el-select>

      <el-button
        type="danger"
        plain
        :disabled="history.length === 0"
        @click="handleClearHistory"
      >
        <el-icon><Delete /></el-icon>
        清空历史
      </el-button>
    </div>

    <!-- 历史列表 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="history.length > 0" class="history-list">
      <div
        v-for="item in history"
        :key="item.id"
        class="history-item"
        @click="selectItem(item)"
      >
        <div class="item-preview">
          <template v-if="item.mimeType?.startsWith('image/')">
            <img :src="item.url" :alt="item.filename" @error="handleImageError" />
          </template>
          <template v-else>
            <el-icon :size="32"><VideoPlay /></el-icon>
          </template>
        </div>

        <div class="item-info">
          <div class="item-filename" :title="item.filename">{{ item.filename }}</div>
          <div class="item-meta">
            <span class="config-name">{{ item.configName }}</span>
            <span class="separator">·</span>
            <span class="file-size">{{ formatSize(item.size) }}</span>
            <span class="separator">·</span>
            <span class="upload-time">{{ formatTime(item.createdAt) }}</span>
          </div>
          <div class="item-url" :title="item.url">{{ item.url }}</div>
        </div>

        <div class="item-actions" @click.stop>
          <el-tooltip content="复制 URL">
            <el-button text @click="copyUrl(item.url)">
              <el-icon><Link /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="复制 Markdown">
            <el-button text @click="copyMarkdown(item)">
              <el-icon><DocumentCopy /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="删除记录">
            <el-button text type="danger" @click="deleteItem(item)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>

    <el-empty v-else description="暂无上传历史" />

    <!-- 分页 -->
    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchHistory"
      />
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="文件详情"
      width="500px"
    >
      <template v-if="selectedItem">
        <div class="detail-preview">
          <template v-if="selectedItem.mimeType?.startsWith('image/')">
            <img :src="selectedItem.url" :alt="selectedItem.filename" />
          </template>
          <template v-else>
            <video :src="selectedItem.url" controls />
          </template>
        </div>

        <LinkGenerator :result="selectedItem" />

        <el-descriptions :column="1" border class="detail-info">
          <el-descriptions-item label="文件名">{{ selectedItem.filename }}</el-descriptions-item>
          <el-descriptions-item label="大小">{{ formatSize(selectedItem.size) }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ selectedItem.mimeType }}</el-descriptions-item>
          <el-descriptions-item label="上传配置">{{ selectedItem.configName }}</el-descriptions-item>
          <el-descriptions-item label="上传时间">{{ formatTime(selectedItem.createdAt) }}</el-descriptions-item>
          <el-descriptions-item v-if="selectedItem.width" label="尺寸">
            {{ selectedItem.width }} × {{ selectedItem.height }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Delete, Link, DocumentCopy, VideoPlay } from '@element-plus/icons-vue'
import {
  getCloudStorageHistory,
  deleteCloudStorageHistory,
  clearCloudStorageHistory,
  formatFileSize
} from '@/api/cloudStorage'
import LinkGenerator from './LinkGenerator.vue'

const props = defineProps({
  configs: {
    type: Array,
    default: () => []
  }
})

// 数据
const loading = ref(false)
const history = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const searchKeyword = ref('')
const filterConfigId = ref('')
const detailVisible = ref(false)
const selectedItem = ref(null)

let searchTimer = null

// 获取历史记录
const fetchHistory = async () => {
  loading.value = true
  try {
    const res = await getCloudStorageHistory({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchKeyword.value,
      configId: filterConfigId.value
    })

    if (res.success) {
      history.value = res.data.items || []
      total.value = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    fetchHistory()
  }, 300)
}

// 选择项目
const selectItem = (item) => {
  selectedItem.value = item
  detailVisible.value = true
}

// 复制 URL
const copyUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('URL 已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

// 复制 Markdown
const copyMarkdown = async (item) => {
  const alt = item.filename.replace(/\.[^/.]+$/, '')
  const markdown = `![${alt}](${item.url})`
  try {
    await navigator.clipboard.writeText(markdown)
    ElMessage.success('Markdown 已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

// 删除项目
const deleteItem = async (item) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条上传记录吗？（不会删除云端文件）',
      '删除确认',
      { type: 'warning' }
    )

    const res = await deleteCloudStorageHistory(item.id)
    if (res.success) {
      ElMessage.success('记录已删除')
      fetchHistory()
    }
  } catch {
    // 用户取消
  }
}

// 清空历史
const handleClearHistory = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有上传历史吗？（不会删除云端文件）',
      '清空确认',
      { type: 'warning' }
    )

    const res = await clearCloudStorageHistory()
    if (res.success) {
      ElMessage.success('历史已清空')
      history.value = []
      total.value = 0
    }
  } catch {
    // 用户取消
  }
}

// 处理图片加载错误
const handleImageError = (e) => {
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f5f7fa" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dominant-baseline="middle" fill="%23c0c4cc" font-size="12"%3E加载失败%3C/text%3E%3C/svg%3E'
}

// 格式化文件大小
const formatSize = (bytes) => {
  return formatFileSize(bytes)
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 1小时内
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
  }

  // 24小时内
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }

  // 7天内
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }

  // 其他
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 初始化
onMounted(() => {
  fetchHistory()
})

// 暴露方法
defineExpose({
  fetchHistory
})
</script>

<style scoped lang="scss">
.upload-history {
  padding: 16px;
}

.history-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.loading-state {
  padding: 24px;
}

.history-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  height: 100%;
  box-sizing: border-box;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  }
}

.item-preview {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .el-icon {
    color: #909399;
  }
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-filename {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.separator {
  color: #dcdfe6;
}

.config-name {
  color: #409eff;
}

.item-url {
  margin-top: 4px;
  font-size: 12px;
  color: #c0c4cc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.detail-preview {
  text-align: center;
  margin-bottom: 16px;

  img,
  video {
    max-width: 100%;
    max-height: 300px;
    border-radius: 8px;
  }
}

.detail-info {
  margin-top: 16px;
}
</style>
