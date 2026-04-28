<template>
  <div class="preview-card">
    <div class="preview-header">
      <div class="header-left">
        <h3 class="preview-title">{{ title }}</h3>
        <div v-if="url" class="preview-url">
          <el-icon><Link /></el-icon>
          <span>{{ url }}</span>
        </div>
      </div>
      <div class="header-actions">
        <el-button-group class="device-switcher">
          <el-button
            :type="currentDevice === 'mobile' ? 'primary' : 'default'"
            size="small"
            @click="switchDevice('mobile')"
          >
            <el-icon><Iphone /></el-icon>
          </el-button>
          <el-button
            :type="currentDevice === 'tablet' ? 'primary' : 'default'"
            size="small"
            @click="switchDevice('tablet')"
          >
            <el-icon><Monitor /></el-icon>
          </el-button>
          <el-button
            :type="currentDevice === 'desktop' ? 'primary' : 'default'"
            size="small"
            @click="switchDevice('desktop')"
          >
            <el-icon><Monitor /></el-icon>
          </el-button>
        </el-button-group>
        <el-button size="small" @click="$emit('refresh')" :icon="Refresh">
          刷新
        </el-button>
      </div>
    </div>

    <div :class="['preview-browser', `device-${currentDevice}`]">
      <div class="browser-chrome">
        <div class="chrome-dots">
          <span class="dot dot-close"></span>
          <span class="dot dot-minimize"></span>
          <span class="dot dot-maximize"></span>
        </div>
        <div class="chrome-address-bar">
          <el-icon class="address-icon"><Lock /></el-icon>
          <span class="address-text">{{ url || 'localhost:8090' }}</span>
        </div>
        <div class="chrome-actions">
          <el-icon><Refresh /></el-icon>
        </div>
      </div>

      <div v-loading="loading" class="preview-viewport">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Link, Iphone, Monitor, Refresh, Lock } from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    default: '预览'
  },
  device: {
    type: String,
    default: 'desktop',
    validator: (value) => ['desktop', 'mobile', 'tablet'].includes(value)
  },
  url: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh', 'device-change'])

const currentDevice = ref(props.device)

const switchDevice = (device) => {
  currentDevice.value = device
  emit('device-change', device)
}
</script>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/assets/styles/variables.scss' as *;

.preview-card {
  background: $bg-secondary;
  border: 1px solid $border-light;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;

  .header-left {
    flex: 1;
  }

  .preview-title {
    margin: 0 0 0.5rem;
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }

  .preview-url {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 13px;
    color: $text-secondary;

    .el-icon {
      font-size: 14px;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .device-switcher {
    .el-button {
      padding: 8px 12px;
    }
  }
}

.preview-browser {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 300ms ease-out;

  // Device sizes
  &.device-mobile {
    max-width: 375px;
    margin: 0 auto;
  }

  &.device-tablet {
    max-width: 768px;
    margin: 0 auto;
  }

  &.device-desktop {
    max-width: 100%;
  }
}

.browser-chrome {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 10px 12px;
  background: #F5F5F5;
  border-bottom: 1px solid #E0E0E0;

  .chrome-dots {
    display: flex;
    gap: 6px;

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;

      &.dot-close {
        background: #FF5F56;
      }

      &.dot-minimize {
        background: #FFBD2E;
      }

      &.dot-maximize {
        background: #27C93F;
      }
    }
  }

  .chrome-address-bar {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: white;
    border-radius: 6px;
    border: 1px solid #E0E0E0;

    .address-icon {
      font-size: 14px;
      color: $success;
    }

    .address-text {
      font-size: 13px;
      color: $text-secondary;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .chrome-actions {
    display: flex;
    align-items: center;
    color: $text-muted;
    cursor: pointer;

    &:hover {
      color: $primary;
    }
  }
}

.preview-viewport {
  min-height: 400px;
  padding: 2rem;
  background: white;
  overflow: auto;

  // Scrollbar styling
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: $bg-secondary;
  }

  &::-webkit-scrollbar-thumb {
    background: $border-default;
    border-radius: 4px;

    &:hover {
      background: color.adjust($border-default, $lightness: -10%);
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .preview-header {
    flex-direction: column;
    align-items: flex-start;

    .header-actions {
      width: 100%;
      justify-content: space-between;
    }

    .device-switcher {
      flex: 1;

      .el-button {
        flex: 1;
      }
    }
  }

  .preview-browser {
    &.device-mobile,
    &.device-tablet {
      max-width: 100%;
    }
  }

  .browser-chrome {
    .chrome-address-bar {
      .address-text {
        font-size: 11px;
      }
    }
  }

  .preview-viewport {
    padding: 1rem;
    min-height: 300px;
  }
}
</style>
