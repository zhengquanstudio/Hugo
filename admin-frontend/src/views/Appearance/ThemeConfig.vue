<template>
  <div class="theme-config">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">主题配置编辑器</h1>
        <p class="page-subtitle">
          当前主题：<el-tag type="primary" size="large">{{ themeDisplayName }}</el-tag>
        </p>
      </div>
      <div class="header-actions">
        <el-button :icon="RefreshRight" @click="loadConfig" :loading="loading">
          刷新配置
        </el-button>
      </div>
    </div>

    <!-- User Hints -->
    <div class="page-hints">
      <FormHint
        type="tip"
        text="配置保存后会自动触发配置合并，Hugo 将重建站点使更改生效"
      />
      <FormHint
        type="info"
        text="修改配置前建议先备份，可以在预览JSON中复制当前配置"
      />
      <FormHint
        v-if="!hasSchema"
        type="warning"
        text="此主题暂无中文表单定义，将显示原始 TOML 结构"
      />
    </div>

    <!-- Config Form -->
    <el-card shadow="never" class="config-card">
      <!-- Schema-driven form -->
      <SchemaForm
        v-if="!loading && configData && hasSchema"
        ref="schemaFormRef"
        :theme-name="themeName"
        :config-data="configData"
        @save="handleSave"
        @reset="handleReset"
      />

      <!-- Fallback: Dynamic form -->
      <ThemeConfigForm
        v-else-if="!loading && configData"
        ref="themeConfigFormRef"
        :theme-name="themeName"
        :config-data="configData"
        @save="handleSave"
        @reset="handleReset"
      />

      <!-- Loading Skeleton -->
      <div v-else-if="loading" class="loading-skeleton">
        <el-skeleton :rows="8" animated />
      </div>

      <!-- Empty State -->
      <el-empty
        v-else
        description="暂无配置数据"
        :image-size="200"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RefreshRight } from '@element-plus/icons-vue'
import { getThemeConfig, updateThemeConfig, mergeConfig } from '@/api/theme'
import { getThemeSchema } from '@/config/themeSchemas'
import SchemaForm from '@/components/SchemaForm.vue'
import ThemeConfigForm from '@/components/ThemeConfigForm.vue'
import FormHint from '@/components/FormHint.vue'

const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const schemaFormRef = ref(null)
const themeConfigFormRef = ref(null)

// Theme name from route
const themeName = ref(route.params.theme || route.query.theme || 'hugo-teek')

// All config data from backend (includes files data)
const configData = ref(null)

// Check if theme has schema definition
const hasSchema = computed(() => {
  return !!getThemeSchema(themeName.value)
})

// Get theme display name
const themeDisplayName = computed(() => {
  return themeName.value.replace(/^hugo-/, '').toUpperCase()
})

// Load theme configuration from backend
const loadConfig = async () => {
  loading.value = true
  try {
    const res = await getThemeConfig(themeName.value)
    if (res.code === 200 && res.data) {
      configData.value = res.data
    } else {
      ElMessage.warning('配置文件为空或不存在')
      configData.value = { files: {} }
    }
  } catch (error) {
    ElMessage.error('加载配置失败：' + (error.message || '未知错误'))
    console.error(error)
    configData.value = { files: {} }
  } finally {
    loading.value = false
  }
}

// Handle save from form
const handleSave = async ({ fileName, config }) => {
  saving.value = true
  try {
    // Call backend API to update config
    const res = await updateThemeConfig(themeName.value, fileName, config)

    if (res.code === 200 || res.success) {
      ElMessage.success('配置保存成功！正在触发配置合并...')

      // Mark form as saved
      if (schemaFormRef.value?.markAsSaved) {
        schemaFormRef.value.markAsSaved()
      }
      if (themeConfigFormRef.value?.markAsSaved) {
        themeConfigFormRef.value.markAsSaved()
      }

      // Trigger config merge
      const mergeRes = await mergeConfig()
      if (mergeRes.code === 200 || mergeRes.success) {
        ElMessage.success('配置合并成功，站点正在重建...')
      } else {
        ElMessage.warning('配置已保存，但合并失败：' + (mergeRes.message || '未知错误'))
      }

      // Reload config to ensure sync
      await loadConfig()
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败：' + (error.message || '未知错误'))
    console.error(error)
  } finally {
    saving.value = false
  }
}

// Handle reset from form
const handleReset = () => {
  loadConfig()
}

// Check for unsaved changes
const checkUnsavedChanges = () => {
  // Check schema form first
  if (schemaFormRef.value?.hasUnsavedChanges?.()) {
    return '您有未保存的修改，确定要离开吗？'
  }
  // Fallback to dynamic form
  if (themeConfigFormRef.value?.hasUnsavedChanges?.()) {
    return '您有未保存的修改，确定要离开吗？'
  }
  return true
}

// Navigation guard for unsaved changes
onBeforeRouteLeave((to, from, next) => {
  const result = checkUnsavedChanges()
  if (result === true) {
    next()
  } else {
    ElMessageBox.confirm(
      result,
      '未保存的修改',
      {
        confirmButtonText: '离开',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      next()
    }).catch(() => {
      next(false)
    })
  }
})

// Load config on mount
onMounted(() => {
  loadConfig()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.theme-config {
  padding: $spacing-6;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: $breakpoint-md) {
    padding: $spacing-4;
  }
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-6;
  margin-bottom: $spacing-6;
  padding-bottom: $spacing-4;
  border-bottom: 1px solid $border-light;

  @media (max-width: $breakpoint-md) {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-4;
  }

  .header-content {
    flex: 1;
  }

  .page-title {
    font-size: $text-2xl;
    font-weight: $font-bold;
    color: $text-primary;
    margin: 0 0 $spacing-2 0;
  }

  .page-subtitle {
    font-size: $text-base;
    color: $text-secondary;
    margin: 0;
    display: flex;
    align-items: center;
    gap: $spacing-2;
  }

  .header-actions {
    display: flex;
    gap: $spacing-3;

    @media (max-width: $breakpoint-md) {
      width: 100%;

      .el-button {
        flex: 1;
      }
    }
  }
}

.page-hints {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  margin-bottom: $spacing-6;
}

.config-card {
  background: $bg-card;
  border: 1px solid $border-light;

  :deep(.el-card__body) {
    padding: $spacing-6;
  }
}

.loading-skeleton {
  padding: $spacing-6;
}
</style>
