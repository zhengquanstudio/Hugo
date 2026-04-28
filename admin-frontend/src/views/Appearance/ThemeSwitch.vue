<template>
  <div class="theme-switch-page">
    <!-- Hero Section -->
    <div class="page-hero">
      <div class="page-hero__content">
        <h1 class="page-hero__title">主题管理</h1>
        <p class="page-hero__subtitle">
          选择最适合您网站的主题风格，一键切换即可生效
        </p>
      </div>
      <div class="page-hero__actions">
        <el-button
          :icon="Refresh"
          @click="loadThemes"
          :loading="loading"
        >
          刷新
        </el-button>
        <el-button
          type="primary"
          :icon="Search"
          disabled
        >
          浏览主题市场 (即将推出)
        </el-button>
      </div>
    </div>

    <!-- User Hints -->
    <div class="page-hints">
      <FormHint
        type="tip"
        text="切换主题后会自动重启 Hugo 服务，配置将在 3-5 秒内生效"
      />
      <FormHint
        type="info"
        text="点击「预览」可以在切换前查看主题效果"
        tooltip="预览功能会在模态框中打开主题演示"
      />
    </div>

    <!-- Theme Grid -->
    <div v-loading="loading" class="theme-grid-container">
      <div class="theme-grid">
        <ThemeCard
          v-for="theme in themes"
          :key="theme.name"
          :theme="theme"
          @switch="switchTheme"
          @configure="configureTheme"
          @preview="handlePreview"
        />
      </div>

      <!-- Empty State -->
      <el-empty
        v-if="!loading && themes.length === 0"
        description="暂无可用主题"
      />
    </div>

    <!-- Preview Modal -->
    <ThemePreviewModal
      v-model="previewModalVisible"
      :theme="previewTheme"
      @switch="switchTheme"
      @configure="configureTheme"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getThemes, switchThemeApi } from '@/api/theme'
import ThemeCard from '@/components/ThemeCard.vue'
import FormHint from '@/components/FormHint.vue'
import ThemePreviewModal from '@/components/ThemePreviewModal.vue'

interface Theme {
  name: string
  displayName: string
  description: string
  version: string
  author: string
  screenshot: string
  features: string[]
  active: boolean
}

const router = useRouter()
const loading = ref(false)
const themes = ref<Theme[]>([])
const previewModalVisible = ref(false)
const previewTheme = ref<Theme | null>(null)

const loadThemes = async () => {
  loading.value = true
  try {
    const data = await getThemes()
    themes.value = data.data || []
  } catch (error) {
    ElMessage.error('加载主题列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const switchTheme = async (theme: Theme) => {
  if (theme.active) {
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要切换到"${theme.displayName}"主题吗？切换后 Hugo 服务将自动重启。`,
      '确认切换',
      {
        confirmButtonText: '确定切换',
        cancelButtonText: '取消',
        type: 'info',
        distinguishCancelAndClose: true
      }
    )

    loading.value = true
    await switchThemeApi(theme.name)
    ElMessage.success({
      message: '主题切换成功，Hugo 服务正在重启...',
      duration: 5000
    })

    // Reload themes to update active state
    await loadThemes()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('主题切换失败')
      console.error(error)
    }
  } finally {
    loading.value = false
  }
}

const configureTheme = (theme: Theme) => {
  // Navigate to theme configuration page
  router.push({
    name: 'AppearanceThemeConfig',
    query: { theme: theme.name }
  })
}

const handlePreview = (theme: Theme) => {
  previewTheme.value = theme
  previewModalVisible.value = true
}

onMounted(() => {
  loadThemes()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/theme-system.scss' as *;

.theme-switch-page {
  padding: $spacing-6;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: $breakpoint-md) {
    padding: $spacing-4;
  }
}

// Hero Section
.page-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-6;
  margin-bottom: $spacing-8;
  padding-bottom: $spacing-6;
  border-bottom: 1px solid $border-light;

  @media (max-width: $breakpoint-md) {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-4;
  }

  &__content {
    flex: 1;
  }

  &__title {
    font-size: $text-3xl;
    font-weight: $font-bold;
    color: $text-primary;
    margin: 0 0 $spacing-2 0;
    line-height: $leading-tight;
  }

  &__subtitle {
    font-size: $text-base;
    color: $text-secondary;
    margin: 0;
    line-height: $leading-relaxed;
  }

  &__actions {
    display: flex;
    gap: $spacing-3;

    @media (max-width: $breakpoint-sm) {
      width: 100%;
      flex-direction: column;

      .el-button {
        width: 100%;
      }
    }
  }
}

// Hints Section
.page-hints {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  margin-bottom: $spacing-6;
}

// Theme Grid Container
.theme-grid-container {
  min-height: 400px;
  position: relative;
}

.theme-grid {
  @include theme-grid;
}

// Empty State
:deep(.el-empty) {
  padding: $spacing-12 0;
}
</style>
