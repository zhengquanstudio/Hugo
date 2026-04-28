<template>
  <div class="mobile-post-list">
    <!-- 顶部标题栏 -->
    <div class="top-header">
      <h1 class="page-title">文章</h1>
      <el-tooltip content="切换到完整模式" placement="bottom">
        <button class="mode-btn" @click="switchToFullMode">
          <el-icon :size="18"><Monitor /></el-icon>
        </button>
      </el-tooltip>
    </div>

    <!-- 顶部搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索文章..."
        clearable
        @keyup.enter="loadPosts"
        @clear="loadPosts"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 文章列表 -->
    <div class="post-list" v-loading="loading">
      <div
        v-for="post in posts"
        :key="post.path"
        class="post-card"
        @click="editPost(post)"
      >
        <div class="post-header">
          <h3 class="post-title">{{ post.title }}</h3>
          <el-tag v-if="post.params?.draft" type="info" size="small">草稿</el-tag>
        </div>

        <p class="post-excerpt" v-if="post.params?.description">
          {{ post.params.description }}
        </p>

        <div class="post-meta">
          <span class="post-date">{{ formatDate(post.date) }}</span>
          <span class="post-category" v-if="post.params?.categories?.length">
            {{ post.params.categories[0] }}
          </span>
        </div>

        <div class="post-tags" v-if="post.params?.tags?.length">
          <el-tag
            v-for="tag in post.params.tags.slice(0, 3)"
            :key="tag"
            size="small"
            type="info"
          >
            {{ tag }}
          </el-tag>
          <span v-if="post.params.tags.length > 3" class="more-tags">
            +{{ post.params.tags.length - 3 }}
          </span>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && posts.length === 0" class="empty-state">
        <el-icon :size="48" color="#c0c4cc"><Document /></el-icon>
        <p>暂无文章</p>
        <p class="empty-hint">点击右下角按钮创建新文章</p>
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="load-more">
      <el-button
        :loading="loadingMore"
        @click="loadMore"
      >
        加载更多
      </el-button>
    </div>

    <!-- 悬浮新建按钮 -->
    <button class="fab-button" @click="createPost">
      <el-icon :size="24"><Plus /></el-icon>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPostsList } from '@/api/posts'
import { useAppModeStore } from '@/stores/appMode'

const router = useRouter()
const appModeStore = useAppModeStore()

const loading = ref(false)
const loadingMore = ref(false)
const searchQuery = ref('')
const posts = ref([])
const pagination = ref({
  page: 1,
  size: 20,
  total: 0
})

// 是否还有更多
const hasMore = computed(() => {
  return posts.value.length < pagination.value.total
})

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 加载文章列表
async function loadPosts() {
  loading.value = true
  pagination.value.page = 1
  try {
    const data = await getPostsList({
      page: pagination.value.page,
      size: pagination.value.size,
      search: searchQuery.value
    })
    posts.value = data.data.items || []
    pagination.value.total = data.data.total || 0
  } catch (error) {
    ElMessage.error('加载文章失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 加载更多
async function loadMore() {
  loadingMore.value = true
  pagination.value.page++
  try {
    const data = await getPostsList({
      page: pagination.value.page,
      size: pagination.value.size,
      search: searchQuery.value
    })
    posts.value.push(...(data.data.items || []))
    pagination.value.total = data.data.total || 0
  } catch (error) {
    ElMessage.error('加载更多失败')
    pagination.value.page--
    console.error(error)
  } finally {
    loadingMore.value = false
  }
}

// 新建文章
function createPost() {
  router.push({ name: 'MobilePostCreate' })
}

// 编辑文章
function editPost(post) {
  router.push({
    name: 'MobilePostEdit',
    query: { path: post.path }
  })
}

// 切换到完整模式
function switchToFullMode() {
  appModeStore.setFullMode()
  router.push({ name: 'Dashboard' })
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.mobile-post-list {
  min-height: 100vh;
  background: $bg-primary;
  padding-bottom: 80px;
}

.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-4;
  background: $bg-card;
  border-bottom: 1px solid $border-light;
}

.page-title {
  margin: 0;
  font-size: $text-xl;
  font-weight: $font-semibold;
  color: $text-primary;
}

.mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: $bg-secondary;
  border-radius: $radius-lg;
  color: $text-secondary;
  cursor: pointer;
  transition: all $transition-fast $ease-out;

  &:active {
    background: $border-light;
    color: $primary;
  }
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: $spacing-3;
  background: $bg-card;
  border-bottom: 1px solid $border-light;

  :deep(.el-input__wrapper) {
    border-radius: $radius-full;
    background: $bg-secondary;
    box-shadow: none;
  }
}

.post-list {
  padding: $spacing-3;
}

.post-card {
  background: $bg-card;
  border-radius: $radius-xl;
  padding: $spacing-4;
  margin-bottom: $spacing-3;
  box-shadow: $shadow-sm;
  cursor: pointer;
  transition: all $transition-fast $ease-out;

  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-md;
  }
}

.post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $spacing-2;
  margin-bottom: $spacing-2;
}

.post-title {
  margin: 0;
  font-size: $text-base;
  font-weight: $font-semibold;
  color: $text-primary;
  line-height: 1.4;
  flex: 1;
}

.post-excerpt {
  margin: 0 0 $spacing-2 0;
  font-size: $text-sm;
  color: $text-secondary;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  font-size: $text-xs;
  color: $text-muted;
  margin-bottom: $spacing-2;
}

.post-category {
  padding: 2px 8px;
  background: rgba($primary, 0.1);
  color: $primary;
  border-radius: $radius-full;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-1;
  align-items: center;

  .el-tag {
    margin-right: 0;
  }

  .more-tags {
    font-size: $text-xs;
    color: $text-muted;
    margin-left: $spacing-1;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-16 $spacing-4;
  color: $text-muted;

  p {
    margin: $spacing-2 0 0 0;
    font-size: $text-base;
  }

  .empty-hint {
    font-size: $text-sm;
  }
}

.load-more {
  display: flex;
  justify-content: center;
  padding: $spacing-4;
}

.fab-button {
  position: fixed;
  right: $spacing-4;
  bottom: $spacing-6;
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background: $primary;
  color: white;
  box-shadow: $shadow-lg;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-fast $ease-out;
  z-index: $z-fixed;

  &:active {
    transform: scale(0.95);
    box-shadow: $shadow-md;
  }
}
</style>
