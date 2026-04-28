<template>
  <div :class="['form-hint-enhanced', `hint-${type}`]">
    <el-icon v-if="showIcon" class="hint-icon">
      <component :is="iconComponent" />
    </el-icon>
    <div class="hint-content">
      <span class="hint-text">{{ text }}</span>
      <el-tooltip v-if="tooltip" placement="top" :content="tooltip">
        <el-icon class="hint-tooltip-icon">
          <QuestionFilled />
        </el-icon>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  InfoFilled,
  WarningFilled,
  CircleCheckFilled,
  ReadingLamp,
  QuestionFilled
} from '@element-plus/icons-vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'warning', 'success', 'tip'].includes(value)
  },
  text: {
    type: String,
    required: true
  },
  tooltip: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  showIcon: {
    type: Boolean,
    default: true
  }
})

const iconComponent = computed(() => {
  if (props.icon) return props.icon

  const iconMap = {
    info: InfoFilled,
    warning: WarningFilled,
    success: CircleCheckFilled,
    tip: ReadingLamp
  }

  return iconMap[props.type] || InfoFilled
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/form-system.scss' as *;

.form-hint-enhanced {
  display: flex;
  align-items: flex-start;
  gap: $hint-gap;
  margin-top: $hint-gap;
  font-size: $hint-text-size;
  line-height: $hint-line-height;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 150ms ease-out;

  .hint-icon {
    flex-shrink: 0;
    width: $hint-icon-size;
    height: $hint-icon-size;
    margin-top: 2px;
  }

  .hint-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }

  .hint-text {
    color: $text-secondary;
    flex: 1;
  }

  .hint-tooltip-icon {
    cursor: help;
    color: $text-muted;
    transition: color 150ms ease-out;

    &:hover {
      color: $primary;
    }
  }
}

// Type variants
.hint-info {
  background: $hint-color-info-bg;
  border-left: 3px solid $hint-color-info;

  .hint-icon {
    color: $hint-color-info;
  }
}

.hint-warning {
  background: $hint-color-warning-bg;
  border-left: 3px solid $hint-color-warning;

  .hint-icon {
    color: $hint-color-warning;
  }
}

.hint-success {
  background: $hint-color-success-bg;
  border-left: 3px solid $hint-color-success;

  .hint-icon {
    color: $hint-color-success;
  }
}

.hint-tip {
  background: $hint-color-tip-bg;
  border-left: 3px solid $hint-color-tip;

  .hint-icon {
    color: $hint-color-tip;
  }
}
</style>
