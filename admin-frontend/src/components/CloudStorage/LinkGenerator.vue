<template>
  <div class="link-generator">
    <h4>复制链接</h4>
    <div class="link-list">
      <div class="link-item" v-for="(value, key) in links" :key="key">
        <span class="link-label">{{ labelMap[key] }}</span>
        <div class="link-input">
          <el-input v-model="links[key]" readonly size="small">
            <template #append>
              <el-button @click="copyLink(key)" :type="copiedKey === key ? 'success' : 'default'">
                <el-icon v-if="copiedKey === key"><Check /></el-icon>
                <el-icon v-else><DocumentCopy /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 预览 -->
    <div v-if="result.mimeType?.startsWith('image/')" class="preview">
      <img :src="result.url" :alt="result.filename" @error="handleImageError" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy, Check } from '@element-plus/icons-vue'

const props = defineProps({
  result: {
    type: Object,
    required: true
  }
})

const labelMap = {
  url: 'URL',
  markdown: 'Markdown',
  html: 'HTML',
  bbcode: 'BBCode'
}

const copiedKey = ref('')

// 生成链接
const links = computed(() => {
  const url = props.result.url || ''
  const filename = props.result.filename || ''
  const alt = filename.replace(/\.[^/.]+$/, '')

  return {
    url: url,
    markdown: `![${alt}](${url})`,
    html: `<img src="${url}" alt="${alt}" />`,
    bbcode: `[img]${url}[/img]`
  }
})

// 复制链接
const copyLink = async (key) => {
  try {
    await navigator.clipboard.writeText(links.value[key])
    copiedKey.value = key
    ElMessage.success('已复制到剪贴板')

    // 2秒后重置状态
    setTimeout(() => {
      if (copiedKey.value === key) {
        copiedKey.value = ''
      }
    }, 2000)
  } catch {
    ElMessage.error('复制失败')
  }
}

// 处理图片加载错误
const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// 监听 result 变化，重置复制状态
watch(() => props.result, () => {
  copiedKey.value = ''
})
</script>

<style scoped lang="scss">
.link-generator {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;

  h4 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
}

.link-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.link-label {
  width: 72px;
  font-size: 13px;
  color: #606266;
  flex-shrink: 0;
}

.link-input {
  flex: 1;

  :deep(.el-input__wrapper) {
    background: #fff;
  }

  :deep(.el-input-group__append) {
    padding: 0 8px;
  }
}

.preview {
  margin-top: 16px;
  text-align: center;

  img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
