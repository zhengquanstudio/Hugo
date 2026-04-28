<template>
  <div :class="['toml-field', `field-${fieldType}`, { 'is-required': required }]">
    <!-- Field Label -->
    <div v-if="showLabel" class="field-label">
      <span class="label-text">{{ label }}</span>
      <el-tooltip v-if="hint" :content="hint" placement="top">
        <el-icon class="label-hint-icon"><QuestionFilled /></el-icon>
      </el-tooltip>
    </div>

    <!-- Field Input -->
    <div class="field-input">
      <!-- Boolean: Switch -->
      <el-switch
        v-if="fieldType === 'boolean'"
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
      />

      <!-- Number: InputNumber -->
      <el-input-number
        v-else-if="fieldType === 'number'"
        :model-value="modelValue"
        :step="1"
        controls-position="right"
        @update:model-value="$emit('update:modelValue', $event)"
      />

      <!-- String (multiline): Textarea -->
      <el-input
        v-else-if="fieldType === 'textarea'"
        :model-value="modelValue"
        type="textarea"
        :rows="rows || 3"
        @update:model-value="$emit('update:modelValue', $event)"
      />

      <!-- String (normal): Input -->
      <el-input
        v-else-if="fieldType === 'string'"
        :model-value="modelValue"
        clearable
        @update:model-value="$emit('update:modelValue', $event)"
      />

      <!-- Array of primitives: Tag editor -->
      <div v-else-if="fieldType === 'array-primitive'" class="array-primitive-field">
        <el-tag
          v-for="(item, index) in (Array.isArray(modelValue) ? modelValue : [])"
          :key="index"
          closable
          @close="removeArrayItem(index)"
          class="array-tag"
        >
          {{ item }}
        </el-tag>
        <el-input
          v-if="inputVisible"
          ref="inputRef"
          v-model="inputValue"
          size="small"
          class="array-input"
          @blur="handleInputConfirm"
          @keyup.enter="handleInputConfirm"
        />
        <el-button
          v-else
          size="small"
          @click="showInput"
          :icon="Plus"
        >
          + 添加
        </el-button>
      </div>

      <!-- Array of objects: Dynamic form -->
      <div v-else-if="fieldType === 'array-object'" class="array-object-field">
        <div
          v-for="(item, index) in (Array.isArray(modelValue) ? modelValue : [])"
          :key="index"
          class="array-object-item"
        >
          <div class="array-item-header">
            <span class="array-item-index">#{{ index + 1 }}</span>
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              circle
              @click="removeArrayItem(index)"
            />
          </div>
          <div class="array-item-fields">
            <!-- Render nested fields dynamically -->
            <TomlFormField
              v-for="(subValue, subKey) in item"
              :key="subKey"
              :label="subKey"
              :model-value="subValue"
              :field-path="`${fieldPath}.${index}.${subKey}`"
              :show-label="true"
              @update:model-value="updateArrayItem(index, subKey, $event)"
            />
          </div>
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

      <!-- Object: Nested key-value editor -->
      <div v-else-if="fieldType === 'object'" class="object-field">
        <div
          v-for="(value, key) in (modelValue || {})"
          :key="key"
          class="object-item"
        >
          <span class="object-key">{{ key }}</span>
          <!-- Render nested value dynamically -->
          <TomlFormField
            :model-value="value"
            :field-path="`${fieldPath}.${key}`"
            :show-label="false"
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

      <!-- Unknown type: Show as JSON -->
      <el-input
        v-else
        :model-value="JSON.stringify(modelValue, null, 2)"
        type="textarea"
        :rows="3"
        readonly
        placeholder="Unsupported type"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import { QuestionFilled, Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Array, Object],
    default: undefined
  },
  label: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  fieldPath: {
    type: String,
    default: ''
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  required: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['update:modelValue'])

// Array primitive input
const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref()

// Detect field type based on value
const fieldType = computed(() => {
  const value = props.modelValue

  if (value === undefined || value === null) {
    return 'string'
  }

  const type = typeof value

  if (type === 'boolean') {
    return 'boolean'
  }

  if (type === 'number') {
    return 'number'
  }

  if (type === 'string') {
    // Check if it's a multiline string (contains newlines)
    if (value.includes('\n') || value.length > 100) {
      return 'textarea'
    }
    return 'string'
  }

  if (Array.isArray(value)) {
    // Check if array of primitives or objects
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      return 'array-object'
    }
    return 'array-primitive'
  }

  if (type === 'object') {
    return 'object'
  }

  return 'string'
})

// Array primitive operations
const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value && !inputValue.value.trim()) {
    inputVisible.value = false
    inputValue.value = ''
    return
  }

  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  if (inputValue.value) {
    current.push(inputValue.value.trim())
    emit('update:modelValue', current)
  }

  inputVisible.value = false
  inputValue.value = ''
}

const removeArrayItem = (index) => {
  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  current.splice(index, 1)
  emit('update:modelValue', current)
}

// Array object operations
const addArrayItem = () => {
  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []

  // Try to infer structure from existing items
  if (current.length > 0 && typeof current[0] === 'object') {
    const newItem = {}
    for (const key in current[0]) {
      const val = current[0][key]
      if (typeof val === 'boolean') newItem[key] = false
      else if (typeof val === 'number') newItem[key] = 0
      else if (Array.isArray(val)) newItem[key] = []
      else if (typeof val === 'object' && val !== null) newItem[key] = {}
      else newItem[key] = ''
    }
    current.push(newItem)
  } else {
    current.push({})
  }

  emit('update:modelValue', current)
}

const updateArrayItem = (index, key, value) => {
  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  current[index] = {
    ...current[index],
    [key]: value
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

.toml-field {
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

  &.field-boolean {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-4 $spacing-3;
    background: $bg-secondary;
    border-radius: $radius-md;
    border: 1px solid $border-light;

    .field-label {
      margin-bottom: 0;
    }
  }

  &.field-object,
  &.field-array-object {
    padding: $spacing-4;
    background: $bg-secondary;
    border-radius: $radius-lg;
    border: 1px solid $border-light;
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

  :deep(.el-input-number) {
    width: 100%;
  }
}

// Array primitive field
.array-primitive-field {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  align-items: center;

  .array-tag {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .array-input {
    width: 120px;
  }
}

// Array object field
.array-object-field {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;

  .array-object-item {
    padding: $spacing-4;
    background: $bg-card;
    border-radius: $radius-lg;
    border: 1px solid $border-light;

    .array-item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: $spacing-3;
      padding-bottom: $spacing-2;
      border-bottom: 1px dashed $border-light;

      .array-item-index {
        font-size: $text-sm;
        font-weight: $font-semibold;
        color: $primary;
      }
    }

    .array-item-fields {
      display: flex;
      flex-direction: column;
      gap: $spacing-3;
    }
  }

  .add-array-item-btn {
    width: 100%;
    border-radius: $radius-md;
    font-weight: $font-medium;
  }
}

// Object field
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
      font-size: $text-sm;
      font-weight: $font-medium;
      color: $text-secondary;
      min-width: 100px;
      padding: $spacing-1 $spacing-2;
      background: $bg-secondary;
      border-radius: $radius-sm;
    }

    :deep(.toml-field) {
      flex: 1;
      padding: $spacing-2;
    }
  }

  .add-object-item-btn {
    width: 100%;
    border-radius: $radius-md;
    font-weight: $font-medium;
  }
}
</style>
