<template>
  <div
    class="theme-card"
    :class="{ 'theme-card--active': theme.active }"
    @click="handleCardClick"
  >
    <!-- Active Badge -->
    <div v-if="theme.active" class="theme-card__active-badge">
      <el-icon><Select /></el-icon>
      <span>当前使用</span>
    </div>

    <!-- Preview Image -->
    <div class="theme-card__preview">
      <img
        v-if="theme.screenshot && !imageError"
        :src="theme.screenshot"
        :alt="`${theme.displayName} 预览图`"
        class="theme-card__preview-img"
        @error="handleImageError"
      />
      <div
        v-else
        class="theme-card__preview-placeholder"
        :style="{ background: getPlaceholderGradient(theme.name) }"
      >
        <el-icon :size="48" class="theme-card__preview-icon">
          <Picture />
        </el-icon>
      </div>
    </div>

    <!-- Content -->
    <div class="theme-card__content">
      <!-- Header -->
      <div class="theme-card__header">
        <h3 class="theme-card__title">{{ theme.displayName }}</h3>
        <span class="theme-card__version">v{{ theme.version }}</span>
      </div>

      <!-- Description -->
      <p class="theme-card__description">{{ theme.description }}</p>

      <!-- Author -->
      <div class="theme-card__meta">
        <el-icon :size="14"><User /></el-icon>
        <span>{{ theme.author }}</span>
      </div>

      <!-- Features -->
      <div class="theme-card__features">
        <span
          v-for="feature in theme.features"
          :key="feature"
          class="theme-card__feature-badge"
          :class="`theme-card__feature-badge--${getFeatureType(feature)}`"
        >
          {{ feature }}
        </span>
      </div>

      <!-- Actions -->
      <div class="theme-card__actions">
        <el-button
          size="small"
          @click.stop="$emit('preview', theme)"
          :icon="View"
        >
          预览
        </el-button>
        <el-button
          size="small"
          @click.stop="$emit('configure', theme)"
          :icon="Setting"
        >
          配置
        </el-button>
        <el-button
          v-if="!theme.active"
          type="primary"
          size="small"
          @click.stop="$emit('switch', theme)"
          :icon="Switch"
        >
          切换
        </el-button>
        <el-button
          v-else
          type="info"
          size="small"
          disabled
          :icon="Select"
        >
          使用中
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Picture, User, View, Setting, Switch, Select } from '@element-plus/icons-vue'

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
  theme: Theme
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'switch', theme: Theme): void
  (e: 'configure', theme: Theme): void
  (e: 'preview', theme: Theme): void
}>()

const imageError = ref(false)

const handleImageError = () => {
  imageError.value = true
}

const handleCardClick = () => {
  // Card click could trigger preview or nothing
  // Main actions are via buttons
}

const getPlaceholderGradient = (themeName: string): string => {
  const gradients: Record<string, string> = {
    'hugo-teek': 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
    'hugo-simple': 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
    'hugo-doc': 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
  }
  return gradients[themeName] || 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)'
}

const getFeatureType = (feature: string): string => {
  const typeMap: Record<string, string> = {
    '搜索': 'search',
    '评论': 'comment',
    '文档': 'docs',
    '分析': 'analytics',
    '轻量': 'lightweight',
    '快速': 'fast',
    '简洁': 'simple',
    '响应式': 'responsive',
    '深色模式': 'dark'
  }
  return typeMap[feature] || 'default'
}
</script>

<style scoped lang="scss">
@use 'sass:color';
@use '@/assets/styles/theme-system.scss' as *;

.theme-card {
  @include theme-card-base;
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;

  &:hover {
    @include theme-card-hover;
  }

  &--active {
    @include theme-card-active;
  }

  // Active Badge
  &__active-badge {
    position: absolute;
    top: $spacing-4;
    right: $spacing-4;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-3;
    background: $primary;
    color: white;
    font-size: $text-xs;
    font-weight: $font-semibold;
    border-radius: $radius-full;
    box-shadow: $shadow-md;
  }

  // Preview Section
  &__preview {
    width: 100%;
    height: $theme-card-preview-height;
    overflow: hidden;
    border-radius: $radius-lg;
    background: $bg-secondary;
    margin-bottom: $spacing-4;
  }

  &__preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform $transition-base $ease-out;

    .theme-card:hover & {
      transform: scale(1.05);
    }
  }

  &__preview-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  &__preview-icon {
    opacity: 0.6;
  }

  // Content Section
  &__content {
    display: flex;
    flex-direction: column;
    gap: $spacing-3;
    flex: 1;
  }

  // Header
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-3;
  }

  &__title {
    font-size: $text-xl;
    font-weight: $font-semibold;
    color: $text-primary;
    margin: 0;
    line-height: $leading-tight;
  }

  &__version {
    font-size: $text-sm;
    color: $text-muted;
    font-weight: $font-medium;
    padding: $spacing-1 $spacing-2;
    background: $bg-secondary;
    border-radius: $radius-sm;
  }

  // Description
  &__description {
    font-size: $text-sm;
    color: $text-secondary;
    line-height: $leading-relaxed;
    margin: 0;
  }

  // Meta
  &__meta {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    font-size: $text-sm;
    color: $text-muted;
  }

  // Features
  &__features {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-2;
    margin-top: $spacing-1;
  }

  &__feature-badge {
    display: inline-flex;
    align-items: center;
    padding: $spacing-1 $spacing-3;
    font-size: $text-xs;
    font-weight: $font-medium;
    border-radius: $radius-full;
    transition: $transition-colors;

    // Feature type colors
    &--search {
      color: $theme-badge-search;
      background: rgba($theme-badge-search, 0.1);
      &:hover { background: rgba($theme-badge-search, 0.15); }
    }

    &--comment {
      color: $theme-badge-comment;
      background: rgba($theme-badge-comment, 0.1);
      &:hover { background: rgba($theme-badge-comment, 0.15); }
    }

    &--docs {
      color: $theme-badge-docs;
      background: rgba($theme-badge-docs, 0.1);
      &:hover { background: rgba($theme-badge-docs, 0.15); }
    }

    &--analytics {
      color: $theme-badge-analytics;
      background: rgba($theme-badge-analytics, 0.1);
      &:hover { background: rgba($theme-badge-analytics, 0.15); }
    }

    &--lightweight {
      color: $theme-badge-lightweight;
      background: rgba($theme-badge-lightweight, 0.1);
      &:hover { background: rgba($theme-badge-lightweight, 0.15); }
    }

    &--fast {
      color: $theme-badge-fast;
      background: rgba($theme-badge-fast, 0.1);
      &:hover { background: rgba($theme-badge-fast, 0.15); }
    }

    &--simple {
      color: $theme-badge-simple;
      background: rgba($theme-badge-simple, 0.1);
      &:hover { background: rgba($theme-badge-simple, 0.15); }
    }

    &--responsive {
      color: $theme-badge-responsive;
      background: rgba($theme-badge-responsive, 0.1);
      &:hover { background: rgba($theme-badge-responsive, 0.15); }
    }

    &--dark {
      color: $theme-badge-dark;
      background: rgba($theme-badge-dark, 0.1);
      &:hover { background: rgba($theme-badge-dark, 0.15); }
    }

    &--default {
      color: $text-secondary;
      background: $bg-secondary;
      &:hover { background: color.adjust($bg-secondary, $lightness: -5%); }
    }
  }

  // Actions
  &__actions {
    display: flex;
    gap: $spacing-2;
    margin-top: auto;
    padding-top: $spacing-4;
    border-top: 1px solid $border-light;

    .el-button {
      flex: 1;
    }
  }
}

// Responsive
@media (max-width: $breakpoint-sm) {
  .theme-card {
    &__actions {
      flex-direction: column;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
