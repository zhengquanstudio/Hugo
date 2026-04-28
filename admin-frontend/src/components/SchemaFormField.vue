<template>
  <div :class="['schema-field', `field-${field.type}`, { 'is-inline': isInlineField }]">
    <!-- Field Label -->
    <div v-if="showLabel" class="field-label">
      <span class="label-text">{{ field.label }}</span>
      <span v-if="field.required" class="label-required">*</span>
      <el-tooltip v-if="field.hint" :content="field.hint" placement="top">
        <el-icon class="label-hint-icon"><QuestionFilled /></el-icon>
      </el-tooltip>
    </div>

    <!-- Field Input -->
    <div class="field-input">
      <!-- Input: Single line text -->
      <el-input
        v-if="field.type === 'input'"
        v-model="localValue"
        clearable
        :placeholder="field.placeholder || `请输入${field.label}`"
        @change="handleChange"
      />

      <!-- Textarea: Multi-line text -->
      <el-input
        v-else-if="field.type === 'textarea'"
        v-model="localValue"
        type="textarea"
        :rows="field.rows || 4"
        :placeholder="field.placeholder || `请输入${field.label}`"
        @change="handleChange"
      />

      <!-- Number: Number input -->
      <el-input-number
        v-else-if="field.type === 'number'"
        v-model="localValue"
        :min="field.min"
        :max="field.max"
        :step="field.step || 1"
        controls-position="right"
        @change="handleChange"
      />

      <!-- Switch: Boolean toggle -->
      <el-switch
        v-else-if="field.type === 'switch'"
        v-model="localValue"
        @change="handleChange"
      />

      <!-- Select: Dropdown -->
      <el-select
        v-else-if="field.type === 'select'"
        v-model="localValue"
        :placeholder="`请选择${field.label}`"
        @change="handleChange"
      >
        <el-option
          v-for="opt in field.options"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <!-- Color: Color picker -->
      <div v-else-if="field.type === 'color'" class="color-field">
        <el-color-picker v-model="localValue" @change="handleChange" />
        <el-input
          v-model="localValue"
          placeholder="#FFFFFF"
          class="color-value-input"
          @change="handleChange"
        />
      </div>

      <!-- Array: Multiple values -->
      <div v-else-if="field.type === 'array'" class="array-field">
        <!-- Simple text array -->
        <template v-if="field.itemType === 'text'">
          <div class="array-items">
            <el-tag
              v-for="(item, index) in localValue"
              :key="index"
              closable
              @close="removeArrayItem(index)"
              class="array-tag"
            >
              {{ item }}
            </el-tag>
          </div>
          <div class="array-add">
            <el-input
              v-if="inputVisible"
              ref="inputRef"
              v-model="inputValue"
              size="small"
              class="array-input"
              placeholder="输入后按回车添加"
              @blur="handleInputConfirm"
              @keyup.enter="handleInputConfirm"
            />
            <el-button v-else size="small" @click="showInput">
              <el-icon><Plus /></el-icon>
              添加
            </el-button>
          </div>
        </template>

        <!-- Object array (social links, etc.) -->
        <template v-else-if="field.itemFields">
          <div class="array-objects">
            <div
              v-for="(item, index) in localValue"
              :key="index"
              class="array-object-item"
            >
              <div class="object-item-header">
                <span class="item-index">#{{ index + 1 }}</span>
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  circle
                  @click="removeArrayItem(index)"
                />
              </div>
              <div class="object-item-fields">
                <div
                  v-for="subField in field.itemFields"
                  :key="subField.key"
                  class="sub-field"
                >
                  <span class="sub-field-label">{{ subField.label }}</span>
                  <el-input
                    v-model="item[subField.key]"
                    :placeholder="subField.placeholder"
                    size="small"
                    @change="handleChange"
                  />
                </div>
              </div>
            </div>
          </div>
          <el-button
            type="primary"
            size="small"
            class="add-item-btn"
            @click="addArrayItem"
          >
            <el-icon><Plus /></el-icon>
            添加项目
          </el-button>
        </template>
      </div>

      <!-- Image: URL with preview -->
      <div v-else-if="field.type === 'image'" class="image-field">
        <el-input
          v-model="localValue"
          placeholder="图片URL地址"
          @change="handleChange"
        >
          <template #prepend>URL</template>
        </el-input>
        <div v-if="localValue" class="image-preview">
          <img :src="localValue" alt="预览" @error="handleImageError" />
          <el-button
            type="danger"
            size="small"
            :icon="Delete"
            circle
            class="preview-clear"
            @click="localValue = ''; handleChange()"
          />
        </div>
      </div>

      <!-- Object: Key-value pairs -->
      <div v-else-if="field.type === 'object'" class="object-field">
        <div class="key-value-list">
          <div
            v-for="(value, key) in localValue"
            :key="key"
            class="key-value-item"
          >
            <el-input
              v-model="localValue[key]"
              :placeholder="`${key} 的值`"
              @change="handleChange"
            />
            <el-button
              type="danger"
              :icon="Delete"
              circle
              size="small"
              @click="removeObjectKey(key)"
            />
          </div>
        </div>
        <div class="object-add">
          <el-input
            v-model="newObjectKey"
            placeholder="新键名"
            size="small"
            class="new-key-input"
          />
          <el-button size="small" @click="addObjectKey">添加</el-button>
        </div>
      </div>

      <!-- Fallback: Unknown type -->
      <el-input
        v-else
        v-model="localValue"
        placeholder="未支持的字段类型"
        @change="handleChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { QuestionFilled, Delete, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  field: {
    type: Object,
    required: true
  },
  modelValue: {
    type: [String, Number, Boolean, Array, Object],
    default: undefined
  },
  showLabel: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

// Local value for v-model
const localValue = ref(props.modelValue)

// Array input for text arrays
const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref()

// Object new key
const newObjectKey = ref('')

// Check if field should be inline (switch, number)
const isInlineField = computed(() => {
  return ['switch', 'number', 'color'].includes(props.field.type)
})

// Watch for external value changes
watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal
})

// Handle value change
const handleChange = () => {
  emit('update:modelValue', localValue.value)
}

// Array operations
const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleInputConfirm = () => {
  if (!inputValue.value.trim()) {
    inputVisible.value = false
    inputValue.value = ''
    return
  }

  const current = Array.isArray(localValue.value) ? [...localValue.value] : []
  current.push(inputValue.value.trim())
  localValue.value = current

  inputVisible.value = false
  inputValue.value = ''
  handleChange()
}

const removeArrayItem = (index) => {
  const current = Array.isArray(localValue.value) ? [...localValue.value] : []
  current.splice(index, 1)
  localValue.value = current
  handleChange()
}

const addArrayItem = () => {
  const current = Array.isArray(localValue.value) ? [...localValue.value] : []
  // Create empty object based on itemFields
  const newItem = {}
  if (props.field.itemFields) {
    props.field.itemFields.forEach(f => {
      newItem[f.key] = ''
    })
  }
  current.push(newItem)
  localValue.value = current
  handleChange()
}

// Object operations
const addObjectKey = () => {
  if (!newObjectKey.value.trim()) return
  const current = localValue.value || {}
  localValue.value = { ...current, [newObjectKey.value.trim()]: '' }
  newObjectKey.value = ''
  handleChange()
}

const removeObjectKey = (key) => {
  const current = { ...localValue.value }
  delete current[key]
  localValue.value = current
  handleChange()
}

// Image error handler
const handleImageError = () => {
  // Keep the URL but don't show broken image
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/form-system.scss' as *;

.schema-field {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  padding: $spacing-3;
  border-radius: $radius-md;
  transition: $transition-all;

  &:hover {
    background: rgba($primary, 0.02);
  }

  // Inline fields (switch, number)
  &.is-inline {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-3 $spacing-4;
    background: $bg-secondary;
    border-radius: $radius-lg;
    border: 1px solid $border-light;

    .field-label {
      margin-bottom: 0;
    }

    .field-input {
      flex: 0 0 auto;
    }
  }

  // Array/object fields
  &.field-array,
  &.field-object {
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

  .label-text {
    font-size: $text-sm;
    font-weight: $form-label-font-weight;
    color: $text-primary;
  }

  .label-required {
    color: $error;
    font-weight: $font-bold;
  }

  .label-hint-icon {
    font-size: 14px;
    color: $text-muted;
    cursor: help;
    transition: $transition-all;

    &:hover {
      color: $primary;
      transform: scale(1.1);
    }
  }
}

.field-input {
  flex: 1;

  // Style inputs consistently
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
    width: 180px;
  }

  :deep(.el-select) {
    width: 100%;
  }

  :deep(.el-textarea__inner) {
    border-radius: $radius-md;
    min-height: 80px;
  }
}

// Color field
.color-field {
  display: flex;
  align-items: center;
  gap: $spacing-3;

  .color-value-input {
    width: 120px;
  }
}

// Array field
.array-field {
  .array-items {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-2;
    margin-bottom: $spacing-3;

    .array-tag {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .array-add {
    display: flex;
    gap: $spacing-2;

    .array-input {
      width: 180px;
    }
  }

  // Object array
  .array-objects {
    display: flex;
    flex-direction: column;
    gap: $spacing-3;
    margin-bottom: $spacing-3;

    .array-object-item {
      padding: $spacing-4;
      background: $bg-card;
      border-radius: $radius-lg;
      border: 1px solid $border-light;

      .object-item-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: $spacing-3;
        padding-bottom: $spacing-2;
        border-bottom: 1px dashed $border-light;

        .item-index {
          font-size: $text-sm;
          font-weight: $font-semibold;
          color: $primary;
        }
      }

      .object-item-fields {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: $spacing-3;

        .sub-field {
          display: flex;
          flex-direction: column;
          gap: $spacing-1;

          .sub-field-label {
            font-size: $text-xs;
            color: $text-secondary;
          }
        }
      }
    }
  }

  .add-item-btn {
    width: 100%;
  }
}

// Image field
.image-field {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;

  .image-preview {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: $radius-md;
    overflow: hidden;
    border: 1px solid $border-light;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-clear {
      position: absolute;
      top: 4px;
      right: 4px;
    }
  }
}

// Object field
.object-field {
  .key-value-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-2;
    margin-bottom: $spacing-3;

    .key-value-item {
      display: flex;
      gap: $spacing-2;
      align-items: center;

      .el-input {
        flex: 1;
      }
    }
  }

  .object-add {
    display: flex;
    gap: $spacing-2;

    .new-key-input {
      width: 150px;
    }
  }
}
</style>