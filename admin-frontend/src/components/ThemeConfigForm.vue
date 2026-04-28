<template>
  <div class="theme-config-form">
    <!-- Loading State -->
    <div v-if="loading" class="form-loading">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- Form Content -->
    <template v-else>
      <!-- Config File Tabs -->
      <el-tabs v-model="activeFileName" @tab-change="handleFileChange">
        <el-tab-pane
          v-for="file in configFiles"
          :key="file.key"
          :label="file.name"
          :name="file.name"
        >
          <!-- Dynamic Form based on TOML structure -->
          <div class="config-content">
            <div class="config-toolbar">
              <span class="config-info">
                {{ getFileDescription(file.name) }}
              </span>
              <div class="config-actions">
                <el-button
                  size="small"
                  @click="expandAllSections"
                >
                  展开所有
                </el-button>
                <el-button
                  size="small"
                  @click="collapseAllSections"
                >
                  折叠所有
                </el-button>
              </div>
            </div>

            <!-- Render TOML data as nested collapsible sections -->
            <div class="toml-data-container">
              <el-collapse v-model="activeSections" class="config-sections">
                <!-- Group top-level keys by common prefix -->
                <template v-for="(section, sectionId) in groupedData" :key="sectionId">
                  <el-collapse-item :name="sectionId">
                    <template #title>
                      <div class="section-title-wrapper">
                        <el-icon class="section-icon"><FolderOpened /></el-icon>
                        <span class="section-title">{{ sectionId }}</span>
                        <el-tag size="small" class="section-count">{{ Object.keys(section).length }} 项</el-tag>
                      </div>
                    </template>

                    <!-- Render fields in this section -->
                    <div class="section-fields">
                      <TomlFormField
                        v-for="key in Object.keys(section)"
                        :key="key"
                        :label="key"
                        :model-value="workingFileData[sectionId]?.[key]"
                        :field-path="`${sectionId}.${key}`"
                        :show-label="true"
                        @update:model-value="updateValue(sectionId, key, $event)"
                      />
                    </div>
                  </el-collapse-item>
                </template>

                <!-- Root level keys (no grouping) -->
                <el-collapse-item v-if="rootLevelKeys.length > 0" name="root">
                  <template #title>
                    <div class="section-title-wrapper">
                      <el-icon class="section-icon"><Document /></el-icon>
                      <span class="section-title">其他配置</span>
                      <el-tag size="small" class="section-count">{{ rootLevelKeys.length }} 项</el-tag>
                    </div>
                  </template>

                  <div class="section-fields">
                    <TomlFormField
                      v-for="key in rootLevelKeys"
                      :key="key"
                      :label="key"
                      :model-value="workingFileData[key]"
                      :field-path="key"
                      :show-label="true"
                      @update:model-value="updateValue('', key, $event)"
                    />
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- Form Actions -->
      <div class="form-actions">
        <el-button type="primary" :loading="saving" @click="handleSave">
          <el-icon><Check /></el-icon>
          保存配置
        </el-button>
        <el-button @click="handleReset">
          <el-icon><RefreshRight /></el-icon>
          重置
        </el-button>
        <el-button @click="handleMerge" :loading="merging">
          <el-icon><Refresh /></el-icon>
          手动合并配置
        </el-button>
        <el-button type="info" @click="handlePreviewJSON">
          <el-icon><Document /></el-icon>
          预览配置
        </el-button>
      </div>
    </template>

    <!-- JSON Preview Dialog -->
    <el-dialog
      v-model="previewDialogVisible"
      title="配置预览 (TOML)"
      width="800px"
      :destroy-on-close="true"
    >
      <el-input
        :model-value="formatAsToml(workingFileData)"
        type="textarea"
        :rows="20"
        readonly
        class="toml-preview"
      />
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="copyToml">复制</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Check,
  RefreshRight,
  Refresh,
  Document,
  FolderOpened
} from '@element-plus/icons-vue'
import { mergeConfig } from '@/api/theme'
import TomlFormField from './TomlFormField.vue'

const props = defineProps({
  themeName: {
    type: String,
    required: true
  },
  configData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['save', 'reset'])

// State
const loading = ref(false)
const saving = ref(false)
const merging = ref(false)
const previewDialogVisible = ref(false)

// Working copy of current file data
const workingFileData = ref({})

// Original configuration (for reset comparison)
const originalFileData = ref({})

// Active file tab
const activeFileName = ref('')

// Active collapse sections
const activeSections = ref([])

// Available config files for current theme
const configFiles = computed(() => {
  const data = props.configData
  if (!data || !data.files) return []

  return Object.entries(data.files).map(([name, info]) => ({
    name,
    key: name,
    path: info.path || '',
    description: getFileDescription(name)
  }))
})

// Get current file data from props
 const sourceFileData = computed(() => {
  const files = props.configData?.files || {}
  const activeFile = activeFileName.value

  if (!activeFile || !files[activeFile]) {
    return {}
  }

  return files[activeFile]?.data || {}
})

// Group data by top-level prefix (e.g., homepage, blogger, etc.)
const groupedData = computed(() => {
  const data = workingFileData.value
  const groups = {}
  const rootKeys = []

  for (const [key, value] of Object.entries(data)) {
    // Check if value is a nested object (potential section)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // This is a nested object, treat as a section
      groups[key] = value
    } else {
      // Root level key
      rootKeys.push(key)
    }
  }

  return groups
})

// Root level keys (not grouped)
const rootLevelKeys = computed(() => {
  const data = workingFileData.value
  return Object.keys(data).filter(key => {
    const value = data[key]
    return !(value && typeof value === 'object' && !Array.isArray(value))
  })
})

// Get file description
const getFileDescription = (fileName) => {
  const descriptions = {
    'params.toml': '主题参数配置（布局、首页、博主卡片、打赏等）',
    'services.toml': '外部服务配置（统计分析、评论系统等）',
    'homepage.toml': '首页侧边栏卡片配置（公告、日历、标签等）',
    'sections.toml': 'Section URL 映射配置（中文目录名 → SEO URL）',
    'teektools.toml': '构建工具配置（hugo-teek-tools 设置）',
    'menus.toml': '导航菜单配置',
    'module.toml': 'Hugo 模块配置'
  }
  return descriptions[fileName] || '配置文件'
}

// Initialize configuration
const initConfig = () => {
  // Set first file as active
  const files = configFiles.value
  if (files.length > 0) {
    activeFileName.value = files[0].name
  }

  // Expand first section by default
  const groups = groupedData.value
  const groupKeys = Object.keys(groups)
  if (groupKeys.length > 0) {
    activeSections.value = [groupKeys[0]]
  } else if (rootLevelKeys.value.length > 0) {
    activeSections.value = ['root']
  }
}

// Check if there are unsaved changes
const hasUnsavedChanges = computed(() => {
  return JSON.stringify(workingFileData.value) !== JSON.stringify(originalFileData.value)
})

// Update value at path (using direct mutation for reactivity)
const updateValue = (section, key, value) => {
  if (section) {
    // Nested update - mutate directly for reactivity
    if (workingFileData.value[section]) {
      workingFileData.value[section][key] = value
    } else {
      workingFileData.value[section] = { [key]: value }
    }
  } else {
    // Root level update - mutate directly for reactivity
    workingFileData.value[key] = value
  }
}

// Expand all sections
const expandAllSections = () => {
  const groupKeys = Object.keys(groupedData.value)
  activeSections.value = [...groupKeys, 'root']
}

// Collapse all sections
const collapseAllSections = () => {
  activeSections.value = []
}

// Handle file tab change
const handleFileChange = (fileName) => {
  activeFileName.value = fileName
  // Reset active sections
  const groups = groupedData.value
  const groupKeys = Object.keys(groups)
  if (groupKeys.length > 0) {
    activeSections.value = [groupKeys[0]]
  } else if (rootLevelKeys.value.length > 0) {
    activeSections.value = ['root']
  }
}

// Handle save
const handleSave = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要保存当前配置吗？保存后将自动触发配置合并。',
      '确认保存',
      {
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    saving.value = true
    emit('save', {
      fileName: activeFileName.value,
      config: workingFileData.value
    })
  } catch (error) {
    // User cancelled
  } finally {
    saving.value = false
  }
}

// Mark as saved after successful save
const markAsSaved = () => {
  originalFileData.value = JSON.parse(JSON.stringify(workingFileData.value))
}

// Handle reset
const handleReset = () => {
  ElMessageBox.confirm(
    '确定要重置所有未保存的修改吗？',
    '确认重置',
    {
      confirmButtonText: '重置',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // Reset using Object.assign to preserve reactivity
    const resetData = JSON.parse(JSON.stringify(originalFileData.value))
    Object.keys(workingFileData.value).forEach(key => {
      delete workingFileData.value[key]
    })
    Object.assign(workingFileData.value, resetData)
    ElMessage.success('已重置为原始配置')
  }).catch(() => {
    // User cancelled
  })
}

// Handle manual merge
const handleMerge = async () => {
  merging.value = true
  try {
    const res = await mergeConfig()
    if (res.code === 200) {
      ElMessage.success('配置合并成功')
    } else {
      ElMessage.error(res.message || '配置合并失败')
    }
  } catch (error) {
    ElMessage.error('配置合并失败：' + (error.message || '未知错误'))
  } finally {
    merging.value = false
  }
}

// Handle JSON preview
const handlePreviewJSON = () => {
  previewDialogVisible.value = true
}

// Copy JSON to clipboard
// Format data as TOML
const formatAsToml = (data) => {
  if (!data) return ''

  const tomlLines = []

  for (const [sectionKey, sectionData] of Object.entries(data)) {
    if (sectionData && typeof sectionData === 'object' && !Array.isArray(sectionData)) {
      tomlLines.push(`[${sectionKey}]`)
      tomlLines.push(...formatObjectAsToml(sectionData, ''))
      tomlLines.push('')
    } else {
      tomlLines.push(`${sectionKey} = ${formatValue(sectionData)}`)
    }
  }

  return tomlLines.join('\n')
}

// Format object as TOML key-value pairs
const formatObjectAsToml = (obj, prefix) => {
  const lines = []

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      lines.push(`[${fullKey}]`)
      lines.push(...formatObjectAsToml(value, ''))
    } else {
      lines.push(`${key} = ${formatValue(value)}`)
    }
  }

  return lines
}

// Format a single value for TOML
const formatValue = (value) => {
  if (value === null || value === undefined) return '""'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    return `"${escaped}"`
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map(v => {
      if (typeof v === 'string') {
        const escaped = v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
        return `"${escaped}"`
      }
      return String(v)
    })
    return `[${items.join(', ')}]`
  }
  return JSON.stringify(value)
}

// Copy TOML to clipboard
const copyToml = () => {
  const toml = formatAsToml(workingFileData.value)
  navigator.clipboard.writeText(toml).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// Watch for config data changes
watch(() => props.configData, (newData) => {
  if (newData && newData.files) {
    const files = Object.keys(newData.files)
    if (files.length > 0 && !activeFileName.value) {
      activeFileName.value = files[0]
    }
  }
}, { deep: true, immediate: true })

// Watch for source file data changes and sync to working data
watch(sourceFileData, (newData) => {
  // Only update if working data is empty or source has changed significantly
  if (Object.keys(workingFileData.value).length === 0 || !hasUnsavedChanges.value) {
    workingFileData.value = JSON.parse(JSON.stringify(newData))
    if (Object.keys(originalFileData.value).length === 0) {
      originalFileData.value = JSON.parse(JSON.stringify(newData))
    }
  }
}, { deep: true, immediate: true })

// Watch for current file changes
watch(workingFileData, (newData) => {
  // Keep originalFileData in sync when data is first loaded
  if (Object.keys(originalFileData.value).length === 0 && Object.keys(newData).length > 0) {
    originalFileData.value = JSON.parse(JSON.stringify(newData))
  }
}, { deep: true })

// Initialize on mount
onMounted(() => {
  initConfig()
})

// Expose methods for parent component
defineExpose({
  getConfig: () => workingFileData.value,
  resetConfig: initConfig,
  markAsSaved,
  hasUnsavedChanges: () => hasUnsavedChanges.value
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/form-system.scss' as *;

.theme-config-form {
  .form-loading {
    padding: $spacing-6;
  }

  // Config tabs styling
  :deep(.el-tabs) {
    .el-tabs__header {
      margin: 0 0 $spacing-6 0;
      border-bottom: 1px solid $border-light;
    }

    .el-tabs__nav-wrap::after {
      display: none;
    }

    .el-tabs__item {
      font-size: $text-base;
      font-weight: $font-medium;
      color: $text-secondary;
      padding: 0 $spacing-6;
      height: 48px;
      line-height: 48px;
      transition: $transition-colors;

      &:hover {
        color: $primary;
      }

      &.is-active {
        color: $primary;
        font-weight: $font-semibold;
      }
    }

    .el-tabs__active-bar {
      height: 3px;
      background: $primary;
      border-radius: 2px;
    }
  }

  .config-content {
    margin-bottom: $spacing-6;
  }

  .config-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-4;
    padding: $spacing-4 $spacing-5;
    background: linear-gradient(135deg, $bg-card 0%, $bg-secondary 100%);
    border-radius: $radius-lg;
    border: 1px solid $border-light;
    box-shadow: $shadow-sm;

    .config-info {
      font-size: $text-sm;
      color: $text-secondary;
      font-weight: $font-semibold;
    }

    .config-actions {
      display: flex;
      gap: $spacing-2;
    }
  }

  .toml-data-container {
    min-height: 200px;
  }

  .config-sections {
    border: none;

    :deep(.el-collapse-item) {
      margin-bottom: $spacing-4;
      border-radius: $form-section-radius;
      border: 1px solid $form-section-border;
      overflow: hidden;
      background: $form-section-bg;
      box-shadow: $shadow-sm;
      transition: $transition-all;

      &:hover {
        box-shadow: $shadow-md;
        border-color: $border-default;
      }

      &.is-active {
        border-color: $primary-light;
        box-shadow: 0 0 0 3px rgba($primary, 0.08);
      }
    }

    :deep(.el-collapse-item__header) {
      background: linear-gradient(to right, $form-section-bg 0%, $bg-secondary 100%);
      border-bottom: none;
      padding: $spacing-4 $spacing-5;
      height: auto;
      line-height: 1.5;
      font-weight: $font-semibold;
      font-size: $text-base;
      color: $text-primary;
      transition: $transition-all;

      &:hover {
        background: linear-gradient(to right, $bg-secondary 0%, $border-light 100%);
      }

      .el-collapse-item__arrow {
        color: $primary;
        font-size: 16px;
      }
    }

    :deep(.el-collapse-item__wrap) {
      border-bottom: none;
      background: $form-section-bg;
    }

    :deep(.el-collapse-item__content) {
      padding: $spacing-5;
      border-top: 1px solid $border-light;
      background: $bg-card;
    }
  }

  .section-title-wrapper {
    display: flex;
    align-items: center;
    gap: $spacing-2;

    .section-icon {
      font-size: 20px;
      color: $primary;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: rgba($primary, 0.1);
      border-radius: $radius-md;
    }

    .section-title {
      font-size: 15px;
      font-weight: $font-semibold;
      color: $text-primary;
      letter-spacing: 0.01em;
    }

    .section-count {
      margin-left: auto;
      font-size: $text-xs;
    }
  }

  .section-fields {
    display: flex;
    flex-direction: column;
    gap: $spacing-4;
  }

  .form-actions {
    display: flex;
    gap: $spacing-3;
    padding: $spacing-6;
    background: $bg-secondary;
    border-radius: $radius-lg;
    border: 1px solid $border-light;
    margin-top: $spacing-6;

    .el-button {
      height: 40px;
      padding: 0 $spacing-5;
      font-size: $text-sm;
      font-weight: $font-medium;
      border-radius: $radius-md;
      transition: $transition-all;

      &:hover {
        transform: translateY(-1px);
      }

      &.el-button--primary {
        background: $primary;
        border-color: $primary;

        &:hover {
          background: $primary-dark;
          border-color: $primary-dark;
          box-shadow: 0 4px 12px rgba($primary, 0.3);
        }
      }
    }

    @media (max-width: $breakpoint-md) {
      flex-wrap: wrap;

      .el-button {
        flex: 1;
        min-width: 120px;
      }
    }
  }

  .json-preview {
    :deep(.el-textarea__inner) {
      font-family: 'Fira Code', monospace;
      font-size: 13px;
      line-height: 1.6;
      background: $bg-secondary;
      border-color: $border-light;

      &:focus {
        border-color: $primary;
        box-shadow: 0 0 0 3px rgba($primary, 0.08);
      }
    }
  }
}
</style>
