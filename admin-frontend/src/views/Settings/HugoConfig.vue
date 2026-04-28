<template>
  <div class="hugo-config-page">
    <div class="config-layout">
      <!-- Left: Form Area -->
      <div class="config-form-area">
        <el-form
          :model="form"
          label-width="140px"
          v-loading="loading"
          class="config-form"
        >
          <!-- Basic Information Section -->
          <FormSection
            title="基础信息"
            icon="Document"
            icon-color="#60A5FA"
            description="配置站点的基本信息和标识"
          >
            <div class="form-grid">
              <el-form-item label="站点标题" class="full-width">
                <el-input
                  v-model="form.title"
                  placeholder="请输入站点标题"
                  maxlength="60"
                  show-word-limit
                />
                <FormHint
                  type="info"
                  text="显示在浏览器标签页和搜索结果中"
                  tooltip="建议使用简洁的站点名称，不超过60个字符，有助于SEO优化"
                />
              </el-form-item>

              <el-form-item label="站点副标题">
                <el-input
                  v-model="form.subtitle"
                  placeholder="请输入站点副标题"
                />
                <FormHint
                  type="tip"
                  text="显示在站点标题下方，可选"
                />
              </el-form-item>

              <el-form-item label="站点描述" class="full-width">
                <el-input
                  v-model="form.description"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入站点描述"
                  maxlength="160"
                  show-word-limit
                />
                <FormHint
                  type="info"
                  text="SEO 描述，建议 120-160 字符"
                  tooltip="搜索引擎会在搜索结果中显示此描述，清晰的描述能提高点击率"
                />
              </el-form-item>
            </div>
          </FormSection>

          <!-- Visual Identity Section -->
          <FormSection
            title="视觉标识"
            icon="Picture"
            icon-color="#34D399"
            description="上传和管理站点品牌资源"
          >
            <div class="form-grid">
              <el-form-item label="Logo">
                <div class="image-field-wrapper">
                  <ImageSelector
                    v-model="form.logo"
                    placeholder="选择或上传 Logo 图片"
                  />
                  <img
                    v-if="form.logo"
                    :src="form.logo"
                    class="image-preview-thumb"
                    alt="Logo preview"
                  />
                </div>
                <FormHint
                  type="info"
                  text="站点 Logo，建议宽度 200-400px"
                  tooltip="支持 PNG、JPG、SVG 格式，透明背景 PNG 效果最佳"
                />
              </el-form-item>

              <el-form-item label="Favicon">
                <div class="image-field-wrapper">
                  <ImageSelector
                    v-model="form.favicon"
                    placeholder="选择或上传 Favicon"
                  />
                  <img
                    v-if="form.favicon"
                    :src="form.favicon"
                    class="image-preview-thumb"
                    alt="Favicon preview"
                  />
                </div>
                <FormHint
                  type="info"
                  text="浏览器标签页图标，建议 32x32 或 64x64"
                  tooltip="Favicon 会显示在浏览器标签页、书签栏等位置"
                />
              </el-form-item>
            </div>
          </FormSection>

          <!-- URLs & SEO Section -->
          <FormSection
            title="URLs & SEO"
            icon="Link"
            icon-color="#8B5CF6"
            description="配置站点 URL 和搜索引擎优化设置"
          >
            <el-form-item label="站点 URL">
              <el-input
                v-model="form.baseURL"
                placeholder="https://example.com"
              />
              <FormHint
                type="warning"
                text="必须是完整的 URL（包含 https://），不能以斜杠结尾"
                tooltip="此 URL 用于生成站点地图、RSS 和绝对链接"
              />
            </el-form-item>
          </FormSection>

          <!-- Action Buttons -->
          <el-form-item class="form-actions">
            <el-button
              type="primary"
              size="large"
              @click="saveSettings"
              :loading="saving"
            >
              <el-icon><Select /></el-icon>
              保存配置
            </el-button>
            <el-button size="large" @click="resetForm">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- Right: Preview Sidebar -->
      <div class="config-preview-sidebar">
        <div class="preview-sticky">
          <PreviewCard
            title="配置预览"
            :url="previewData.baseURL || 'https://example.com'"
          >
            <div class="site-preview">
              <!-- Logo Section -->
              <div v-if="previewData.logo" class="site-preview__logo">
                <img :src="previewData.logo" alt="Site Logo" />
              </div>

              <!-- Title Section -->
              <div class="site-preview__header">
                <h1 class="site-preview__title">
                  {{ previewData.title || '站点标题' }}
                </h1>
                <p v-if="previewData.subtitle" class="site-preview__subtitle">
                  {{ previewData.subtitle }}
                </p>
              </div>

              <!-- Description Section -->
              <div class="site-preview__description">
                <h3>站点描述</h3>
                <p>{{ previewData.description || '站点描述将显示在这里...' }}</p>
              </div>

              <!-- URL Section -->
              <div class="site-preview__url">
                <h3>站点地址</h3>
                <div class="url-display">
                  <el-icon><Link /></el-icon>
                  <span>{{ previewData.baseURL || 'https://example.com' }}</span>
                </div>
              </div>

              <!-- Info Tip -->
              <div class="site-preview__tip">
                <el-icon><InfoFilled /></el-icon>
                <span>左侧表单的修改会实时显示在此预览</span>
              </div>
            </div>
          </PreviewCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  Picture,
  Link,
  Select,
  RefreshLeft,
  InfoFilled
} from '@element-plus/icons-vue'
import { getHugoConfig, updateHugoConfig } from '@/api/config'
import ImageSelector from '@/components/ImageSelector.vue'
import FormSection from '@/components/FormSection.vue'
import FormHint from '@/components/FormHint.vue'
import PreviewCard from '@/components/PreviewCard.vue'

const loading = ref(false)
const saving = ref(false)

const form = reactive({
  title: '',
  subtitle: '',
  baseURL: '',
  logo: '',
  favicon: '',
  description: ''
})

const originalForm = ref({})

// Preview data (reactive to form changes)
const previewData = reactive({
  title: '',
  subtitle: '',
  baseURL: '',
  logo: '',
  description: ''
})

// Watch form changes and update preview
watch(
  () => form,
  (newForm) => {
    previewData.title = newForm.title
    previewData.subtitle = newForm.subtitle
    previewData.baseURL = newForm.baseURL
    previewData.logo = newForm.logo
    previewData.description = newForm.description
  },
  { deep: true }
)

const loadSettings = async () => {
  loading.value = true
  try {
    const data = await getHugoConfig()
    const config = data.data || {}

    form.title = config.title || ''
    form.subtitle = config.subtitle || ''
    form.baseURL = config.baseURL || ''
    form.logo = config.logo || ''
    form.favicon = config.favicon || ''
    form.description = config.description || ''

    // Initialize preview data
    previewData.title = form.title
    previewData.subtitle = form.subtitle
    previewData.baseURL = form.baseURL
    previewData.logo = form.logo
    previewData.description = form.description

    // Store original values for reset
    originalForm.value = { ...form }
  } catch (error) {
    ElMessage.error('加载设置失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  // Basic validation
  if (!form.title.trim()) {
    ElMessage.warning('请输入站点标题')
    return
  }

  if (!form.baseURL.trim()) {
    ElMessage.warning('请输入站点 URL')
    return
  }

  // URL validation
  try {
    const url = new URL(form.baseURL)
    if (!['http:', 'https:'].includes(url.protocol)) {
      ElMessage.warning('站点 URL 必须以 http:// 或 https:// 开头')
      return
    }
    if (form.baseURL.endsWith('/')) {
      ElMessage.warning('站点 URL 不能以斜杠结尾')
      return
    }
  } catch (error) {
    ElMessage.warning('请输入有效的站点 URL')
    return
  }

  saving.value = true
  try {
    await updateHugoConfig(form)
    ElMessage.success('保存成功')
    originalForm.value = { ...form }
  } catch (error) {
    ElMessage.error('保存失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  Object.assign(form, originalForm.value)
  ElMessage.info('已重置为上次保存的值')
}

onMounted(() => {
  loadSettings()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;
@use '@/assets/styles/form-system.scss' as *;
@use '@/assets/styles/theme-system.scss' as *;

.hugo-config-page {
  max-width: 1600px;
  margin: 0 auto;
  padding: $spacing-6;

  @media (max-width: $breakpoint-md) {
    padding: $spacing-4;
  }
}

// Split Layout
.config-layout {
  @include preview-split-layout;
}

// Form Area (Left Side)
.config-form-area {
  min-width: 0; // Prevent flex overflow
}

.config-form {
  .form-grid {
    @include form-grid;

    .full-width {
      grid-column: 1 / -1;
    }
  }

  .form-actions {
    margin-top: $spacing-8;
    padding-top: $spacing-6;
    border-top: 1px solid $border-light;

    :deep(.el-form-item__content) {
      display: flex;
      gap: $spacing-4;
    }

    .el-button {
      min-height: $form-field-min-height;

      .el-icon {
        margin-right: 6px;
      }
    }
  }
}

// Image field with preview
.image-field-wrapper {
  display: flex;
  align-items: center;
  gap: $spacing-4;

  .image-preview-thumb {
    @include image-preview-thumb;
    flex-shrink: 0;
  }
}

// Preview Sidebar (Right Side)
.config-preview-sidebar {
  @media (min-width: $breakpoint-lg + 1) {
    position: relative;
  }
}

.preview-sticky {
  @media (min-width: $breakpoint-lg + 1) {
    position: sticky;
    top: $spacing-6;
  }

  @media (max-width: $breakpoint-lg) {
    margin-bottom: $spacing-6;
  }
}

// Site Preview Content
.site-preview {
  display: flex;
  flex-direction: column;
  gap: $spacing-6;
  font-family: $font-sans;

  &__logo {
    text-align: center;
    padding: $spacing-4 0;
    border-bottom: 1px solid $border-light;

    img {
      max-width: 200px;
      max-height: 60px;
      object-fit: contain;
    }
  }

  &__header {
    text-align: center;
    padding: $spacing-4 0;
  }

  &__title {
    font-size: $text-2xl;
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

  &__description {
    h3 {
      font-size: $text-sm;
      font-weight: $font-semibold;
      color: $text-muted;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 $spacing-2 0;
    }

    p {
      font-size: $text-base;
      color: $text-primary;
      line-height: $leading-relaxed;
      margin: 0;
    }
  }

  &__url {
    h3 {
      font-size: $text-sm;
      font-weight: $font-semibold;
      color: $text-muted;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 $spacing-2 0;
    }

    .url-display {
      display: flex;
      align-items: center;
      gap: $spacing-2;
      padding: $spacing-3 $spacing-4;
      background: $bg-secondary;
      border-radius: $radius-md;
      font-size: $text-sm;
      color: $primary;
      font-family: $font-mono;
      word-break: break-all;

      .el-icon {
        flex-shrink: 0;
      }
    }
  }

  &__tip {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    padding: $spacing-3 $spacing-4;
    background: rgba($info, 0.1);
    border-radius: $radius-md;
    font-size: $text-xs;
    color: $info;
    line-height: $leading-relaxed;

    .el-icon {
      flex-shrink: 0;
      font-size: $text-base;
    }
  }
}

// Mobile Responsive
@media (max-width: $breakpoint-md) {
  .config-form {
    :deep(.el-form-item__label) {
      min-width: 100px;
    }

    .form-actions {
      :deep(.el-form-item__content) {
        flex-direction: column;

        .el-button {
          width: 100%;
        }
      }
    }
  }

  .image-field-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .site-preview {
    &__logo img {
      max-width: 150px;
      max-height: 50px;
    }

    &__title {
      font-size: $text-xl;
    }
  }
}
</style>
