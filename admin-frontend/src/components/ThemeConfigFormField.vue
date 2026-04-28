<template>
  <div :class="['form-field', `field-${field.type}`, { 'is-required': field.required }, fieldClass]">
    <!-- Field Label -->
    <div v-if="fieldLabel" class="field-label">
      <span class="label-text">{{ fieldLabel }}</span>
      <el-tooltip v-if="field.hint" :content="field.hint" placement="top">
        <el-icon class="label-hint-icon"><QuestionFilled /></el-icon>
      </el-tooltip>
    </div>

    <!-- Field Input -->
    <div class="field-input">
      <!-- Text Input -->
      <el-input
        v-if="field.type === 'input'"
        :model-value="modelValue"
        :placeholder="field.placeholder"
        clearable
        :class="{ 'is-error': validationState === 'error' }"
        @update:model-value="$emit('update:modelValue', $event)"
        @blur="handleFieldBlur"
      />

      <!-- Textarea -->
      <el-input
        v-else-if="field.type === 'textarea'"
        :model-value="modelValue"
        type="textarea"
        :rows="field.rows || 3"
        :placeholder="field.placeholder"
        :class="{ 'is-error': validationState === 'error' }"
        @update:model-value="$emit('update:modelValue', $event)"
        @blur="handleFieldBlur"
      />

      <!-- Number Input -->
      <el-input-number
        v-else-if="field.type === 'number'"
        :model-value="modelValue"
        :min="field.min"
        :max="field.max"
        :step="field.step || 1"
        controls-position="right"
        :class="{ 'is-error': validationState === 'error' }"
        @update:model-value="$emit('update:modelValue', $event)"
        @blur="handleFieldBlur"
      />

      <!-- Switch -->
      <el-switch
        v-else-if="field.type === 'switch'"
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
      />

      <!-- Select -->
      <el-select
        v-else-if="field.type === 'select'"
        :model-value="modelValue ?? field.default"
        :placeholder="field.placeholder || '请选择'"
        @update:model-value="$emit('update:modelValue', $event)"
      >
        <el-option
          v-for="option in field.options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>

      <!-- Color Picker -->
      <el-color-picker
        v-else-if="field.type === 'color'"
        :model-value="modelValue"
        show-alpha
        @update:model-value="$emit('update:modelValue', $event)"
      />

      <!-- Image URL Input with Preview -->
      <div v-else-if="field.type === 'image'" class="image-url-input">
        <el-input
          :model-value="modelValue"
          placeholder="请输入图片URL"
          clearable
          @update:model-value="$emit('update:modelValue', $event)"
        >
          <template #append>
            <el-button :icon="Picture" @click="showImagePreview = true">预览</el-button>
          </template>
        </el-input>
        <el-image
          v-if="modelValue && isValidImageUrl(modelValue)"
          :src="modelValue"
          fit="cover"
          class="image-thumbnail"
          :preview-src-list="[modelValue]"
          :initial-index="0"
        />
      </div>

      <!-- Array Field (for social links, etc.) -->
      <div v-else-if="field.type === 'array'" class="array-field">
        <div
          v-for="(item, index) in (Array.isArray(modelValue) ? modelValue : [])"
          :key="index"
          class="array-item"
        >
          <div class="array-item-header">
            <span class="array-item-index">{{ index + 1 }}</span>
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              circle
              @click="removeArrayItem(index)"
            />
          </div>

          <!-- Structured array item (object) -->
          <div v-if="field.itemFields" class="array-item-fields">
            <div
              v-for="subField in field.itemFields"
              :key="subField.key"
              class="array-item-field"
            >
              <span class="sub-field-label">{{ subField.label }}</span>
              <el-input
                :model-value="item?.[subField.key]"
                :placeholder="subField.placeholder"
                @update:model-value="updateArrayItem(index, subField.key, $event)"
              />
            </div>
          </div>

          <!-- Simple text array item -->
          <el-input
            v-else
            :model-value="item"
            placeholder="请输入内容"
            @update:model-value="updateArrayItem(index, null, $event)"
          />
        </div>

        <el-button
          type="primary"
          :icon="Plus"
          class="add-array-item-btn"
          @click="addArrayItem"
        >
          添加项目
        </el-button>
      </div>

      <!-- Object Field (key-value pairs) -->
      <div v-else-if="field.type === 'object'" class="object-field">
        <div
          v-for="(value, key) in (modelValue || {})"
          :key="key"
          class="object-item"
        >
          <el-input
            :model-value="key"
            placeholder="键名"
            class="object-key"
            disabled
          />
          <el-input
            :model-value="value"
            placeholder="值"
            @update:model-value="updateObjectValue(key, $event)"
          />
          <el-button
            type="danger"
            :icon="Delete"
            circle
            size="small"
            @click="removeObjectKey(key)"
          />
        </div>
        <el-button
          type="primary"
          :icon="Plus"
          class="add-object-item-btn"
          @click="addObjectItem"
        >
          添加配置项
        </el-button>
      </div>
    </div>

    <!-- Field Hint -->
    <div v-if="field.hint" class="field-hint">
      <FormHint type="info" :text="field.hint" />
    </div>

    <!-- Validation Error -->
    <div v-if="validationState === 'error' && error" class="field-error">
      <el-icon class="error-icon"><CircleCloseFilled /></el-icon>
      <span class="error-text">{{ error }}</span>
    </div>

    <!-- Validation Success -->
    <div v-else-if="validationState === 'success'" class="field-success">
      <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
      <span class="success-text">格式正确</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { QuestionFilled, Picture, Delete, Plus, CircleCloseFilled, CircleCheckFilled } from '@element-plus/icons-vue'
import FormHint from './FormHint.vue'

const props = defineProps({
  field: {
    type: Object,
    required: true
  },
  modelValue: {
    type: [String, Number, Boolean, Array, Object],
    default: undefined
  },
  error: {
    type: String,
    default: ''
  },
  showValidation: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'validate', 'blur'])

const showImagePreview = ref(false)
const fieldTouched = ref(false)

// Validation state
const validationState = computed(() => {
  if (!props.showValidation || !fieldTouched.value) return ''
  if (props.error) return 'error'
  if (props.modelValue !== undefined && props.modelValue !== null && props.modelValue !== '') return 'success'
  return ''
})

// Field class based on validation state
const fieldClass = computed(() => {
  return {
    'is-touched': fieldTouched.value,
    'is-error': validationState.value === 'error',
    'is-success': validationState.value === 'success'
  }
})

// Handle field blur
const handleFieldBlur = () => {
  fieldTouched.value = true
  emit('blur')
  emit('validate', props.field.key, props.modelValue)
}

// Computed field label
const fieldLabel = computed(() => {
  // For nested fields, the label might be in the field object
  // For top-level fields, extract from key
  if (props.field.label) {
    return props.field.label
  }
  // Extract label from key (e.g., 'homepage.paginatePCSize' -> 'PC端每页数量')
  return props.field.key?.split('.').pop()
})

// Check if URL is valid image
const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  try {
    const urlObj = new URL(url)
    return /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i.test(urlObj.pathname)
  } catch {
    return false
  }
}

// Array operations
const addArrayItem = () => {
  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []

  if (props.field.itemFields) {
    // Structured array item
    const newItem = {}
    props.field.itemFields.forEach(f => {
      newItem[f.key] = f.default || ''
    })
    current.push(newItem)
  } else {
    // Simple text array item
    current.push('')
  }

  emit('update:modelValue', current)
}

const removeArrayItem = (index) => {
  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  current.splice(index, 1)
  emit('update:modelValue', current)
}

const updateArrayItem = (index, subKey, value) => {
  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []

  if (subKey) {
    // Update nested property in object array item
    current[index] = {
      ...current[index],
      [subKey]: value
    }
  } else {
    // Update simple text array item
    current[index] = value
  }

  emit('update:modelValue', current)
}

// Object operations
const addObjectItem = () => {
  const current = { ...props.modelValue }
  const newKey = `newKey_${Object.keys(current).length + 1}`
  current[newKey] = ''
  emit('update:modelValue', current)
}

const removeObjectKey = (key) => {
  const current = { ...props.modelValue }
  delete current[key]
  emit('update:modelValue', current)
}

const updateObjectValue = (key, value) => {
  const current = { ...props.modelValue }
  current[key] = value
  emit('update:modelValue', current)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/form-system.scss' as *;

.form-field {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  padding: $spacing-3;
  border-radius: $radius-md;
  transition: $transition-all;

  &:hover {
    background: rgba($primary, 0.02);
  }

  &.is-required {
    .label-text::after {
      content: ' *';
      color: $error;
    }
  }

  &.field-switch {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-4 $spacing-3;
    background: $bg-secondary;
    border-radius: $radius-md;
    border: 1px solid $border-light;

    &:hover {
      border-color: $primary-light;
      background: rgba($primary, 0.03);
    }

    .field-label {
      margin-bottom: 0;
    }

    .field-input {
      margin-bottom: 0;
    }

    :deep(.el-switch) {
      --el-switch-on-color: #{$primary};

      .el-switch__core {
        height: 22px;
        min-width: 44px;
        border-radius: 22px;
      }

      .el-switch__action {
        height: 18px;
        width: 18px;
      }
    }
  }

  &.field-color {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-4 $spacing-3;

    .field-label {
      margin-bottom: 0;
    }
  }

  &.field-array,
  &.field-object {
    padding: $spacing-4;
    background: $bg-secondary;
    border-radius: $radius-lg;
    border: 1px solid $border-light;

    &:hover {
      border-color: $border-default;
    }
  }
}

.field-label {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  margin-bottom: $spacing-1;

  .label-text {
    font-size: $text-sm;
    font-weight: $form-label-font-weight;
    color: $form-label-color;
  }

  .label-hint-icon {
    font-size: 14px;
    color: $text-muted;
    cursor: help;
    transition: $transition-all;

    &:hover {
      color: $primary;
      transform: scale(1.15);
    }
  }
}

.field-input {
  :deep(.el-input__wrapper) {
    min-height: $form-field-min-height;
    border-radius: $radius-md;
    box-shadow: 0 0 0 1px $border-light inset;
    transition: $transition-all;

    &:hover {
      box-shadow: 0 0 0 1px $border-default inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 2px $primary-light inset;
    }
  }

  :deep(.el-textarea__inner) {
    min-height: $form-field-min-height;
    border-radius: $radius-md;
    border-color: $border-light;
    transition: $transition-all;

    &:hover {
      border-color: $border-default;
    }

    &:focus {
      border-color: $primary;
      box-shadow: 0 0 0 3px rgba($primary, 0.08);
    }
  }

  :deep(.el-select) {
    width: 100%;

    .el-input__wrapper {
      min-height: $form-field-min-height;
    }
  }

  :deep(.el-input-number) {
    width: 100%;

    .el-input__wrapper {
      border-radius: $radius-md;
    }

    .el-input-number__decrease,
    .el-input-number__increase {
      background: $bg-secondary;
      border-radius: $radius-sm;

      &:hover {
        color: $primary;
      }
    }
  }

  :deep(.el-color-picker) {
    height: 40px;

    .el-color-picker__trigger {
      height: 40px;
      border-radius: $radius-md;
      border-color: $border-light;
      transition: $transition-all;

      &:hover {
        border-color: $primary;
      }
    }
  }

  :deep(.el-select-dropdown) {
    border-radius: $radius-lg;
    box-shadow: $shadow-lg;
  }
}

.field-hint {
  margin-top: $spacing-1;
}

// Image URL Input
.image-url-input {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;

  .image-thumbnail {
    width: $image-preview-size;
    height: $image-preview-size;
    border-radius: $image-preview-radius;
    overflow: hidden;
    border: 2px solid $border-light;
    cursor: pointer;
    transition: $transition-all;

    &:hover {
      border-color: $primary;
      transform: scale(1.05);
      box-shadow: $shadow-md;
    }
  }

  :deep(.el-input-group__append) {
    background: $bg-secondary;
    border-radius: 0 $radius-md $radius-md 0;

    .el-button {
      font-size: $text-sm;
      color: $primary;

      &:hover {
        background: rgba($primary, 0.1);
      }
    }
  }
}

// Array Field
.array-field {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;

  .array-item {
    padding: $spacing-4;
    background: $bg-card;
    border-radius: $radius-lg;
    border: 1px solid $border-light;
    transition: $transition-all;

    &:hover {
      border-color: $border-default;
      box-shadow: $shadow-sm;
    }

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: $spacing-3;
      padding-bottom: $spacing-2;
      border-bottom: 1px dashed $border-light;
    }

    &-index {
      font-size: $text-sm;
      font-weight: $font-semibold;
      color: $primary;
      display: flex;
      align-items: center;
      gap: $spacing-1;

      &::before {
        content: '#';
        opacity: 0.5;
      }
    }

    &-fields {
      display: flex;
      flex-direction: column;
      gap: $spacing-3;
    }

    &-field {
      display: flex;
      flex-direction: column;
      gap: $spacing-1;

      .sub-field-label {
        font-size: $text-xs;
        font-weight: $font-medium;
        color: $text-secondary;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }
  }

  .add-array-item-btn {
    width: 100%;
    border-radius: $radius-md;
    font-weight: $font-medium;

    &:hover {
      transform: translateY(-1px);
      box-shadow: $shadow-sm;
    }
  }
}

// Object Field
.object-field {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;

  .object-item {
    display: flex;
    gap: $spacing-2;
    align-items: center;
    padding: $spacing-2;
    background: $bg-card;
    border-radius: $radius-md;
    border: 1px solid $border-light;

    .object-key {
      flex: 1;
      max-width: 200px;

      :deep(.el-input__wrapper) {
        background: $bg-secondary;
      }
    }

    :deep(.el-input:not(.object-key)) {
      flex: 2;
    }
  }

  .add-object-item-btn {
    width: 100%;
    border-radius: $radius-md;
    font-weight: $font-medium;

    &:hover {
      transform: translateY(-1px);
      box-shadow: $shadow-sm;
    }
  }
}

// Validation states
:deep(.el-form-item.is-error) {
  .el-input__wrapper,
  .el-textarea__inner {
    border-color: $error;
    box-shadow: 0 0 0 2px rgba($error, 0.1);
  }
}

:deep(.el-form-item.is-success) {
  .el-input__wrapper,
  .el-textarea__inner {
    border-color: $success;
  }
}

// Field validation states
.form-field {
  &.is-error {
    :deep(.el-input__wrapper),
    :deep(.el-textarea__inner) {
      border-color: $error;
      box-shadow: 0 0 0 2px rgba($error, 0.1);
    }

    :deep(.el-input-number) .el-input__wrapper {
      border-color: $error;
      box-shadow: 0 0 0 2px rgba($error, 0.1);
    }
  }

  &.is-success {
    :deep(.el-input__wrapper),
    :deep(.el-textarea__inner) {
      border-color: $success;
    }

    :deep(.el-input-number) .el-input__wrapper {
      border-color: $success;
    }
  }
}

// Validation messages
.field-error,
.field-success {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  margin-top: $spacing-1;
  font-size: $text-xs;
  padding: 4px 8px;
  border-radius: $radius-sm;
  animation: slideInDown 0.2s ease-out;
}

.field-error {
  color: $error;
  background: rgba($error, 0.08);

  .error-icon {
    font-size: 14px;
  }
}

.field-success {
  color: $success;
  background: rgba($success, 0.08);

  .success-icon {
    font-size: 14px;
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
