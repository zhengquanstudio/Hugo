<template>
  <div class="mobile-post-edit">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <button class="back-btn" @click="goBack">
        <el-icon :size="20"><ArrowLeft /></el-icon>
      </button>

      <div class="top-actions">
        <button class="action-btn" @click="showSettings = true">
          <el-icon :size="18"><Setting /></el-icon>
        </button>
        <button class="action-btn save-btn" :disabled="saving" @click="savePost">
          {{ saving ? '保存中...' : '保存' }}
        </button>
        <button
          class="action-btn publish-btn"
          :disabled="saving"
          @click="publishPost"
        >
          发布
        </button>
      </div>
    </div>

    <!-- 编辑器 -->
    <div class="editor-wrapper">
      <MobileEditor
        ref="editorRef"
        v-model:title="form.title"
        v-model:content="form.content"
        :is-preview="isPreview"
        @auto-save="handleAutoSave"
        @open-image-upload="openImageUpload"
      />
    </div>

    <!-- 底部工具栏 -->
    <BottomToolbar
      :is-preview="isPreview"
      @insert="handleInsert"
      @toggle-preview="isPreview = !isPreview"
    />

    <!-- 快捷设置抽屉 -->
    <QuickSettings
      v-model="showSettings"
      v-model:draft="form.draft"
      v-model:categories="form.categories"
      v-model:tags="form.tags"
      v-model:description="form.description"
      v-model:directory-path="form.directoryPath"
      v-model:filename="form.filename"
      :category-options="categoryOptions"
      :tag-options="tagOptions"
      :show-directory-selector="isCreate"
      :show-filename-input="isCreate"
      @close="showSettings = false"
    />

    <!-- 图片上传面板 -->
    <el-drawer
      v-model="showImageUpload"
      direction="btt"
      size="auto"
      title="插入图片"
    >
      <div class="image-upload-content">
        <el-input
          v-model="imageUrl"
          placeholder="输入图片URL"
          @keyup.enter="insertImage"
        />
        <el-button type="primary" @click="insertImage" style="margin-top: 12px; width: 100%">
          插入图片
        </el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import MobileEditor from '@/components/Mobile/MobileEditor.vue'
import BottomToolbar from '@/components/Mobile/BottomToolbar.vue'
import QuickSettings from '@/components/Mobile/QuickSettings.vue'
import { getPostDetail, createPost, updatePost } from '@/api/posts'
import { useTaxonomy } from '@/composables/useTaxonomy'

const router = useRouter()
const route = useRoute()

const editorRef = ref(null)
const loading = ref(false)
const saving = ref(false)
const isPreview = ref(false)
const showSettings = ref(false)
const showImageUpload = ref(false)
const imageUrl = ref('')
const postPath = ref('')

// 表单数据
const form = reactive({
  title: '',
  content: '',
  draft: false,
  categories: [],
  tags: [],
  description: '',
  directoryPath: '',
  filename: ''
})

// 使用全局分类标签管理
const { categories: categoryOptions, tags: tagOptions, addCategories, addTags } = useTaxonomy()

// 是否为新建
const isCreate = computed(() => route.name === 'MobilePostCreate')

// 返回列表
function goBack() {
  router.push({ name: 'MobilePostList' })
}

// 加载文章
async function loadPost() {
  const path = route.query.path
  if (!path) {
    if (!isCreate.value) {
      ElMessage.error('缺少文章路径')
      goBack()
    }
    return
  }

  loading.value = true
  try {
    const data = await getPostDetail(path)
    const post = data.data

    if (!post || !post.frontMatter) {
      throw new Error('文章数据格式错误')
    }

    postPath.value = post.path
    form.title = post.frontMatter.title || ''
    form.content = post.content || ''
    form.draft = post.frontMatter.draft || false
    form.categories = post.frontMatter.categories || []
    form.tags = post.frontMatter.tags || []
    form.description = post.frontMatter.description || ''

    // 从 path 解析目录路径
    if (post.path) {
      const pathParts = post.path.split('/')
      pathParts.pop() // 移除文件名
      form.directoryPath = pathParts.join('/')
    }
  } catch (error) {
    ElMessage.error('加载文章失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 保存文章
async function savePost() {
  if (!form.title) {
    ElMessage.warning('请输入文章标题')
    return
  }

  saving.value = true
  try {
    const data = {
      title: form.title,
      content: form.content,
      metadata: {
        date: new Date().toISOString(),
        draft: form.draft,
        categories: form.categories,
        tags: form.tags,
        description: form.description
      }
    }

    if (isCreate.value) {
      data.category = form.categories[0] || '未分类'
      // 传递目录路径
      if (form.directoryPath) {
        data.directoryPath = form.directoryPath
      }
      // 传递文件名（留空则后端使用标题生成）
      if (form.filename) {
        data.filename = form.filename
      }
      await createPost(data)
      ElMessage.success('创建成功')
    } else {
      data.path = postPath.value
      await updatePost(postPath.value, data)
      ElMessage.success('保存成功')
    }

    // 保存成功后，将新的分类和标签添加到缓存
    addCategories(form.categories)
    addTags(form.tags)

    goBack()
  } catch (error) {
    ElMessage.error(isCreate.value ? '创建失败' : '保存失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}

// 发布文章
async function publishPost() {
  form.draft = false
  await savePost()
}

// 自动保存
function handleAutoSave() {
  // 可以在这里实现自动保存到草稿
  console.log('Auto save triggered')
}

// 处理工具栏插入
function handleInsert(data) {
  if (data.action === 'image') {
    showImageUpload.value = true
    return
  }
  editorRef.value?.insertText(data)
}

// 打开图片上传
function openImageUpload() {
  showImageUpload.value = true
}

// 插入图片
function insertImage() {
  if (!imageUrl.value) {
    ElMessage.warning('请输入图片URL')
    return
  }
  editorRef.value?.insertImageUrl(imageUrl.value)
  imageUrl.value = ''
  showImageUpload.value = false
}

onMounted(() => {
  loadPost()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.mobile-post-edit {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $bg-card;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-2 $spacing-3;
  background: $bg-card;
  border-bottom: 1px solid $border-light;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: $radius-lg;
  color: $text-primary;
  cursor: pointer;

  &:active {
    background: $bg-secondary;
  }
}

.top-actions {
  display: flex;
  align-items: center;
  gap: $spacing-2;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 $spacing-3;
  border: none;
  border-radius: $radius-lg;
  font-size: $text-sm;
  font-weight: $font-medium;
  cursor: pointer;
  transition: all $transition-fast $ease-out;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.save-btn {
  background: $bg-secondary;
  color: $text-primary;

  &:active:not(:disabled) {
    background: $border-light;
  }
}

.publish-btn {
  background: $primary;
  color: white;

  &:active:not(:disabled) {
    background: $primary-dark;
  }
}

.editor-wrapper {
  flex: 1;
  overflow: hidden;
  padding-bottom: 56px; // 底部工具栏高度
}

.image-upload-content {
  padding: $spacing-4;
}
</style>
