<template>
  <div class="cloud-storage-page">
    <div class="page-header">
      <h2>云存储</h2>
      <p class="page-description">上传图片和视频到云存储，获取 CDN 加速链接</p>
    </div>

    <el-tabs v-model="activeTab" class="storage-tabs">
      <el-tab-pane label="上传文件" name="upload">
        <UploadArea
          ref="uploadAreaRef"
          :configs="configs"
          @uploaded="handleUploaded"
        />
      </el-tab-pane>

      <el-tab-pane label="上传历史" name="history">
        <UploadHistory
          ref="historyRef"
          :configs="configs"
        />
      </el-tab-pane>

      <el-tab-pane label="云存储配置" name="config">
        <StorageConfig
          ref="configRef"
          @update="handleConfigUpdate"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UploadArea from '@/components/CloudStorage/UploadArea.vue'
import UploadHistory from '@/components/CloudStorage/UploadHistory.vue'
import StorageConfig from '@/components/CloudStorage/StorageConfig.vue'

// 数据
const activeTab = ref('upload')
const configs = ref([])
const uploadAreaRef = ref(null)
const historyRef = ref(null)
const configRef = ref(null)

// 处理配置更新
const handleConfigUpdate = (newConfigs) => {
  configs.value = newConfigs
}

// 处理上传完成
const handleUploaded = () => {
  // 刷新历史记录
  if (historyRef.value) {
    historyRef.value.fetchHistory()
  }
}
</script>

<style scoped lang="scss">
.cloud-storage-page {
  width: 100%;
}

.page-header {
  margin-bottom: 24px;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #303133;
  }

  .page-description {
    margin: 8px 0 0;
    font-size: 14px;
    color: #909399;
  }
}

.storage-tabs {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  :deep(.el-tabs__header) {
    padding: 0 16px;
    margin: 0;
    border-bottom: 1px solid #e4e7ed;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    height: 48px;
    line-height: 48px;
    font-size: 14px;
  }

  :deep(.el-tabs__content) {
    padding: 0;
  }
}
</style>
