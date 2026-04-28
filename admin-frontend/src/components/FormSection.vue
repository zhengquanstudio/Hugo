<template>
  <div :class="['form-section', { 'is-collapsible': collapsible, 'is-collapsed': isCollapsed }]">
    <div class="section-header" @click="toggleCollapse">
      <div class="header-content">
        <el-icon v-if="icon" class="section-icon" :style="{ color: iconColor }">
          <component :is="icon" />
        </el-icon>
        <div class="header-text">
          <h3 class="section-title">{{ title }}</h3>
          <p v-if="description" class="section-description">{{ description }}</p>
        </div>
      </div>
      <el-icon v-if="collapsible" class="collapse-icon">
        <ArrowDown />
      </el-icon>
    </div>

    <el-collapse-transition>
      <div v-show="!isCollapsed" class="section-body">
        <slot />
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: [String, Object],
    default: null
  },
  iconColor: {
    type: String,
    default: ''
  },
  collapsible: {
    type: Boolean,
    default: false
  },
  defaultCollapsed: {
    type: Boolean,
    default: false
  }
})

const isCollapsed = ref(props.defaultCollapsed)

const toggleCollapse = () => {
  if (props.collapsible) {
    isCollapsed.value = !isCollapsed.value
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/form-system.scss' as *;

.form-section {
  background: $form-section-bg;
  border: 1px solid $form-section-border;
  border-radius: $form-section-radius;
  padding: $form-section-padding;
  margin-bottom: $form-section-spacing;
  transition: all 150ms ease-out;

  &:hover {
    border-color: color.adjust($form-section-border, $lightness: -5%);
  }

  &.is-collapsible {
    .section-header {
      cursor: pointer;
      user-select: none;

      &:hover {
        .section-title {
          color: $primary;
        }
      }
    }
  }

  &.is-collapsed {
    .collapse-icon {
      transform: rotate(-90deg);
    }
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid $border-light;

  .header-content {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    flex: 1;
  }

  .section-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    color: $primary;
    margin-top: 2px;
  }

  .header-text {
    flex: 1;
  }

  .section-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: $text-primary;
    line-height: 1.4;
    transition: color 150ms ease-out;
  }

  .section-description {
    margin: 4px 0 0;
    font-size: 14px;
    color: $text-secondary;
    line-height: 1.5;
  }

  .collapse-icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    color: $text-muted;
    transition: transform 200ms ease-out;
  }
}

.section-body {
  // Remove extra padding since it's already in form-section
}

// Collapsed state
.is-collapsed {
  .section-header {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
}

// Mobile optimization
@media (max-width: 768px) {
  .form-section {
    padding: 1rem;
  }

  .section-header {
    .section-title {
      font-size: 16px;
    }

    .section-description {
      font-size: 13px;
    }
  }
}
</style>
