<template>
  <div class="schema-form">
    <!-- Loading State -->
    <div v-if="loading" class="form-loading">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- Form Content -->
    <template v-else>
      <!-- Config File Tabs -->
      <el-tabs v-model="activeTab" class="config-tabs">
        <el-tab-pane
          v-for="(config, configKey) in schemaConfigs"
          :key="configKey"
          :name="configKey"
        >
          <template #label>
            <span class="tab-label">
              <el-icon v-if="config.icon" class="tab-icon"><component :is="config.icon" /></el-icon>
              <span>{{ config.label }}</span>
            </span>
          </template>

          <!-- Config Description -->
          <div class="config-description">
            <p>{{ config.description }}</p>
          </div>

          <!-- Sections with Collapse -->
          <div class="sections-container">
            <el-collapse v-model="activeSections" class="config-sections">
              <el-collapse-item
                v-for="section in config.sections"
                :key="section.id"
                :name="section.id"
              >
                <template #title>
                  <div class="section-header">
                    <div class="section-icon-wrapper">
                      <el-icon class="section-icon"><component :is="section.icon" /></el-icon>
                    </div>
                    <div class="section-info">
                      <span class="section-title">{{ section.title }}</span>
                      <span v-if="section.description" class="section-description">
                        {{ section.description }}
                      </span>
                    </div>
                    <el-tag size="small" class="section-count">
                      {{ getFieldCount(section) }} 项
                    </el-tag>
                  </div>
                </template>

                <!-- Fields Grid -->
                <div class="section-fields">
                  <SchemaFormField
                    v-for="field in section.fields"
                    :key="field.key"
                    :field="field"
                    :model-value="getFieldValue(configKey, field.key)"
                    @update:model-value="updateFieldValue(configKey, field.key, $event)"
                  />
                </div>
              </el-collapse-item>
            </el-collapse>
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
        <el-button @click="handlePreviewJSON" type="info">
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
        :model-value="formatAsToml(workingData)"
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
import { Check, RefreshRight, Document } from '@element-plus/icons-vue'
import { getThemeSchema } from '@/config/themeSchemas'
import SchemaFormField from './SchemaFormField.vue'

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
const previewDialogVisible = ref(false)
const activeTab = ref('')
const activeSections = ref([])

// Working data - organized by config file
const workingData = ref({})

// Original data for reset comparison
const originalData = ref({})

// Get schema for current theme
const schema = computed(() => getThemeSchema(props.themeName))

// Get config sections from schema
const schemaConfigs = computed(() => {
  if (!schema.value) return {}
  // Filter out internal properties like fileName, label, description
  const configs = {}
  for (const [key, value] of Object.entries(schema.value)) {
    if (value && value.fileName && value.sections) {
      configs[key] = value
    }
  }
  return configs
})

// Initialize working data from config data
const initWorkingData = () => {
  if (!props.configData || !props.configData.files) return

  const files = props.configData.files
  const data = {}

  // For each config file in schema, get its data
  for (const [configKey, config] of Object.entries(schemaConfigs.value)) {
    const fileName = config.fileName
    if (files[fileName] && files[fileName].data) {
      data[configKey] = JSON.parse(JSON.stringify(files[fileName].data))
    } else {
      data[configKey] = {}
    }
  }

  workingData.value = data
  originalData.value = JSON.parse(JSON.stringify(data))
}

// Get field value by config key and field key (supports nested keys like 'homepage.paginatePCSize')
const getFieldValue = (configKey, fieldKey) => {
  const config = workingData.value[configKey] || {}

  // Support nested keys with dot notation
  const keys = fieldKey.split('.')
  let value = config

  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key]
    } else {
      return undefined
    }
  }

  return value
}

// Update field value
const updateFieldValue = (configKey, fieldKey, value) => {
  if (!workingData.value[configKey]) {
    workingData.value[configKey] = {}
  }

  const config = workingData.value[configKey]
  const keys = fieldKey.split('.')

  // Navigate to the nested location
  let current = config
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!current[key]) {
      current[key] = {}
    }
    current = current[key]
  }

  // Set the final value
  current[keys[keys.length - 1]] = value

  // Trigger reactivity
  workingData.value[configKey] = { ...config }
}

// Get field count for a section
const getFieldCount = (section) => {
  return section.fields ? section.fields.length : 0
}

// Check for unsaved changes
const hasUnsavedChanges = computed(() => {
  return JSON.stringify(workingData.value) !== JSON.stringify(originalData.value)
})

// Initialize active sections
const initActiveSections = () => {
  const configs = schemaConfigs.value
  const configKeys = Object.keys(configs)

  if (configKeys.length > 0) {
    activeTab.value = configKeys[0]
    // Expand first section of first config
    const firstConfig = configs[configKeys[0]]
    if (firstConfig.sections && firstConfig.sections.length > 0) {
      activeSections.value = [firstConfig.sections[0].id]
    }
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

    // Emit save event for each config file
    for (const [configKey, config] of Object.entries(schemaConfigs.value)) {
      const fileName = config.fileName
      const data = workingData.value[configKey] || {}

      emit('save', {
        fileName,
        config: data
      })
    }
  } catch (error) {
    // User cancelled
  } finally {
    saving.value = false
  }
}

// Mark as saved
const markAsSaved = () => {
  originalData.value = JSON.parse(JSON.stringify(workingData.value))
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
    workingData.value = JSON.parse(JSON.stringify(originalData.value))
    ElMessage.success('已重置为原始配置')
  }).catch(() => {
    // User cancelled
  })
}

// Handle JSON preview
const handlePreviewJSON = () => {
  previewDialogVisible.value = true
}

// Format data as TOML
const formatAsToml = (data) => {
  if (!data) return ''

  const tomlLines = []

  for (const [sectionKey, sectionData] of Object.entries(data)) {
    if (sectionData && typeof sectionData === 'object') {
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
      // Nested object - create a new section
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
    // Escape special characters and wrap in quotes
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    return `"${escaped}"`
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    // Simple array of strings
    const items = value.map(v => {
      if (typeof v === 'string') {
        const escaped = v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
        return `"${escaped}"`
      }
      return String(v)
    })
    return `[${items.join(', ')}]`
  }
  // Fallback to JSON
  return JSON.stringify(value)
}

// Copy TOML to clipboard
const copyToml = () => {
  const toml = formatAsToml(workingData.value)
  navigator.clipboard.writeText(toml).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// Watch for config data changes
watch(() => props.configData, () => {
  initWorkingData()
}, { deep: true, immediate: true })

// Initialize on mount
onMounted(() => {
  initActiveSections()
  initWorkingData()
})

// Expose methods
defineExpose({
  getData: () => workingData.value,
  resetData: initWorkingData,
  markAsSaved,
  hasUnsavedChanges: () => hasUnsavedChanges.value
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/form-system.scss' as *;

.schema-form {
  .form-loading {
    padding: $spacing-6;
  }

  // Config tabs
  .config-tabs {
    :deep(.el-tabs__header) {
      margin: 0 0 $spacing-6 0;
      border-bottom: 2px solid $border-light;
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }

    .tab-label {
      display: flex;
      align-items: center;
      gap: $spacing-2;
      font-size: $text-base;
      font-weight: $font-medium;
    }

    .tab-icon {
      font-size: 18px;
    }

    :deep(.el-tabs__item) {
      color: $text-secondary;
      padding: 0 $spacing-5;
      height: 50px;
      line-height: 50px;
      transition: $transition-all;

      &:hover {
        color: $primary;
      }

      &.is-active {
        color: $primary;
        font-weight: $font-semibold;
      }
    }

    :deep(.el-tabs__active-bar) {
      height: 3px;
      background: linear-gradient(90deg, $primary, $primary-light);
      border-radius: 2px;
    }
  }

  // Config description
  .config-description {
    margin-bottom: $spacing-5;
    padding: $spacing-4;
    background: linear-gradient(135deg, rgba($primary, 0.05) 0%, rgba($primary, 0.02) 100%);
    border-radius: $radius-lg;
    border-left: 3px solid $primary;

    p {
      margin: 0;
      font-size: $text-sm;
      color: $text-secondary;
      line-height: 1.6;
    }
  }

  // Sections
  .sections-container {
    margin-bottom: $spacing-5;
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
        box-shadow: 0 0 0 3px rgba($primary, 0.08), $shadow-md;
      }
    }

    :deep(.el-collapse-item__header) {
      background: linear-gradient(to right, $form-section-bg 0%, rgba($primary, 0.03) 100%);
      border-bottom: none;
      padding: $spacing-4 $spacing-5;
      height: auto;
      line-height: 1.5;
      font-weight: $font-normal;
      color: $text-primary;
      transition: $transition-all;

      &:hover {
        background: linear-gradient(to right, rgba($primary, 0.03) 0%, rgba($primary, 0.08) 100%);
      }

      .el-collapse-item__arrow {
        color: $primary;
        font-size: 16px;
        font-weight: $font-semibold;
      }
    }

    :deep(.el-collapse-item__wrap) {
      border-bottom: none;
      background: $bg-card;
    }

    :deep(.el-collapse-item__content) {
      padding: $spacing-5;
      border-top: 1px solid $border-light;
    }
  }

  // Section header
  .section-header {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    width: 100%;

    .section-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, rgba($primary, 0.1) 0%, rgba($primary, 0.05) 100%);
      border-radius: $radius-md;
      transition: $transition-all;

      .section-icon {
        font-size: 20px;
        color: $primary;
      }
    }

    .section-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;

      .section-title {
        font-size: $text-base;
        font-weight: $font-semibold;
        color: $text-primary;
      }

      .section-description {
        font-size: $text-xs;
        color: $text-muted;
      }
    }

    .section-count {
      font-size: $text-xs;
      background: $bg-secondary;
      border-color: $border-light;
      color: $text-secondary;
    }
  }

  // Section fields
  .section-fields {
    display: flex;
    flex-direction: column;
    gap: $spacing-3;
  }

  // Form actions
  .form-actions {
    display: flex;
    gap: $spacing-3;
    padding: $spacing-5;
    background: linear-gradient(135deg, $bg-secondary 0%, $bg-card 100%);
    border-radius: $radius-lg;
    border: 1px solid $border-light;
    margin-top: $spacing-6;
    box-shadow: $shadow-sm;

    .el-button {
      height: 42px;
      padding: 0 $spacing-6;
      font-size: $text-sm;
      font-weight: $font-medium;
      border-radius: $radius-md;
      transition: $transition-all;

      &:hover {
        transform: translateY(-2px);
        box-shadow: $shadow-md;
      }

      &.el-button--primary {
        background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
        border-color: $primary;
        box-shadow: 0 4px 12px rgba($primary, 0.25);

        &:hover {
          background: linear-gradient(135deg, $primary-dark 0%, #2563EB 100%);
          box-shadow: 0 6px 16px rgba($primary, 0.35);
        }
      }
    }

    @media (max-width: $breakpoint-md) {
      flex-wrap: wrap;

      .el-button {
        flex: 1;
        min-width: 100px;
      }
    }
  }

  // JSON preview
  .json-preview {
    :deep(.el-textarea__inner) {
      font-family: 'Fira Code', 'Consolas', monospace;
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