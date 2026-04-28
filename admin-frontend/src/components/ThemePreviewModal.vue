<template>
  <el-dialog
    v-model="visible"
    :title="`预览主题: ${theme?.displayName || ''}`"
    width="90%"
    top="5vh"
    :fullscreen="isFullscreen"
    :close-on-click-modal="false"
    class="theme-preview-modal"
  >
    <template #header>
      <div class="modal-header">
        <div class="header-left">
          <h3 class="modal-title">
            预览主题: {{ theme?.displayName || '' }}
          </h3>
          <el-tag v-if="theme?.version" type="info" size="small">
            v{{ theme.version }}
          </el-tag>
        </div>
        <div class="header-actions">
          <el-button
            :icon="isFullscreen ? FullScreen : FullScreen"
            circle
            @click="toggleFullscreen"
          />
        </div>
      </div>
    </template>

    <div class="preview-content" v-loading="loading">
      <PreviewCard
        title="主题预览"
        :url="previewUrl"
        @refresh="handleRefresh"
      >
        <div class="theme-preview-placeholder">
          <div class="placeholder-content">
            <el-icon :size="64" class="placeholder-icon">
              <View />
            </el-icon>
            <h3>主题预览功能</h3>
            <p>此功能需要后端支持临时主题预览端点</p>
            <p class="preview-info">
              主题: <strong>{{ theme?.displayName }}</strong>
            </p>
            <div v-if="theme?.features" class="feature-list">
              <span
                v-for="feature in theme.features"
                :key="feature"
                class="feature-badge"
              >
                {{ feature }}
              </span>
            </div>
          </div>
        </div>
      </PreviewCard>
    </div>

    <template #footer>
      <div class="modal-footer">
        <div class="footer-left">
          <el-button
            v-if="theme && !theme.active"
            type="primary"
            :icon="Switch"
            @click="handleSwitch"
          >
            切换到此主题
          </el-button>
          <el-button
            :icon="Setting"
            @click="handleConfigure"
          >
            配置主题
          </el-button>
        </div>
        <div class="footer-right">
          <el-button @click="handleClose">关闭</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { View, FullScreen, Switch, Setting } from '@element-plus/icons-vue'
import PreviewCard from './PreviewCard.vue'

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

interface Props {
  modelValue: boolean
  theme: Theme | null
  previewUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  previewUrl: 'http://localhost:8090'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'switch', theme: Theme): void
  (e: 'configure', theme: Theme): void
  (e: 'refresh'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const isFullscreen = ref(false)

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const handleRefresh = () => {
  loading.value = true
  emit('refresh')
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const handleSwitch = () => {
  if (props.theme) {
    emit('switch', props.theme)
  }
}

const handleConfigure = () => {
  if (props.theme) {
    emit('configure', props.theme)
  }
}

const handleClose = () => {
  visible.value = false
}

// Watch theme changes
watch(
  () => props.theme,
  (newTheme) => {
    if (newTheme && visible.value) {
      // Load theme preview
      loading.value = true
      setTimeout(() => {
        loading.value = false
      }, 500)
    }
  }
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/theme-system.scss' as *;

:deep(.theme-preview-modal) {
  .el-dialog__header {
    padding: $spacing-6;
    border-bottom: 1px solid $border-light;
    margin-bottom: 0;
  }

  .el-dialog__body {
    padding: $spacing-6;
    max-height: calc(90vh - 200px);
    overflow-y: auto;
  }

  .el-dialog__footer {
    padding: $spacing-6;
    border-top: 1px solid $border-light;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-4;

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    flex: 1;
  }

  .modal-title {
    margin: 0;
    font-size: $text-xl;
    font-weight: $font-semibold;
    color: $text-primary;
  }

  .header-actions {
    display: flex;
    gap: $spacing-2;
  }
}

.preview-content {
  min-height: 400px;
  position: relative;
}

.theme-preview-placeholder {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-8;

  .placeholder-content {
    text-align: center;
    max-width: 500px;

    .placeholder-icon {
      color: $text-muted;
      margin-bottom: $spacing-4;
    }

    h3 {
      font-size: $text-xl;
      font-weight: $font-semibold;
      color: $text-primary;
      margin: 0 0 $spacing-3 0;
    }

    p {
      font-size: $text-base;
      color: $text-secondary;
      line-height: $leading-relaxed;
      margin: 0 0 $spacing-2 0;
    }

    .preview-info {
      margin-top: $spacing-4;
      padding: $spacing-3 $spacing-4;
      background: $bg-secondary;
      border-radius: $radius-md;
      font-size: $text-sm;

      strong {
        color: $primary;
      }
    }

    .feature-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: $spacing-2;
      margin-top: $spacing-4;
    }

    .feature-badge {
      display: inline-flex;
      align-items: center;
      padding: $spacing-1 $spacing-3;
      font-size: $text-xs;
      font-weight: $font-medium;
      color: $primary;
      background: rgba($primary, 0.1);
      border-radius: $radius-full;
    }
  }
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-4;

  .footer-left,
  .footer-right {
    display: flex;
    gap: $spacing-3;
  }

  @media (max-width: $breakpoint-sm) {
    flex-direction: column;

    .footer-left,
    .footer-right {
      width: 100%;

      .el-button {
        flex: 1;
      }
    }
  }
}
</style>
