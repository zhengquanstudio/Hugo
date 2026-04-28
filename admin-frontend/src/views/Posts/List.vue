<template>
  <div class="posts-list">
    <!-- 移动端目录抽屉 -->
    <el-drawer
      v-model="showDirectoryDrawer"
      :size="'80%'"
      :direction="'ltr'"
      title="目录结构"
      class="mobile-directory-drawer"
    >
      <div class="drawer-header-actions">
        <el-button size="small" @click="goToSectionMappings">
          <el-icon><Setting /></el-icon>
          配置映射
        </el-button>
      </div>
      <DirectoryTree
        :data="directoryTree"
        :current-path="currentDirectory"
        :draggable="true"
        :section-mappings="sectionMappings"
        :show-menu-mapping="true"
        @select="selectDirectory"
        @refresh="loadDirectories"
      />
    </el-drawer>

    <div class="posts-layout">
      <!-- 左侧目录树（桌面端） -->
      <div class="directory-sidebar desktop-only">
        <div class="sidebar-header">
          <h3>目录结构</h3>
          <el-tooltip content="配置菜单映射" placement="top">
            <el-button text size="small" @click="goToSectionMappings">
              <el-icon><Setting /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
        <DirectoryTree
          :data="directoryTree"
          :current-path="currentDirectory"
          :draggable="true"
          :section-mappings="sectionMappings"
          :show-menu-mapping="true"
          @select="selectDirectory"
          @refresh="loadDirectories"
        />
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <el-card shadow="never">
          <template #header>
            <div class="list-header">
              <div class="header-left">
                <el-button
                  class="mobile-only mobile-directory-btn"
                  @click="showDirectoryDrawer = true"
                >
                  <el-icon><FolderOpened /></el-icon>
                </el-button>
                <span>文章列表</span>
              </div>
              <el-button type="primary" @click="createPost">
                <el-icon><Plus /></el-icon>
                <span class="btn-text">新建文章</span>
              </el-button>
            </div>
          </template>

          <!-- 面包屑导航 -->
          <div v-if="currentDirectory" class="breadcrumb-bar">
            <DirectoryBreadcrumb
              :path="currentDirectory"
              @navigate="navigateToDirectory"
            />
            <el-button
              text
              type="primary"
              size="small"
              @click="clearDirectoryFilter"
              class="clear-filter-btn"
            >
              <el-icon><Close /></el-icon>
              清除过滤
            </el-button>
          </div>

          <div class="filter-bar">
            <el-input
              v-model="searchQuery"
              placeholder="搜索文章标题（按回车搜索）"
              clearable
              style="width: 300px"
              @keyup.enter="loadPosts"
              @clear="loadPosts"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <el-select
              v-model="selectedCategory"
              placeholder="筛选分类"
              clearable
              filterable
              style="width: 200px"
              @change="loadPosts"
            >
              <el-option
                v-for="cat in categories"
                :key="cat"
                :label="cat"
                :value="cat"
              />
            </el-select>

            <el-select
              v-model="selectedTag"
              placeholder="筛选标签"
              clearable
              filterable
              style="width: 200px"
              @change="loadPosts"
            >
              <el-option
                v-for="tag in tags"
                :key="tag"
                :label="tag"
                :value="tag"
              />
            </el-select>
          </div>

          <!-- 文章卡片网格 -->
          <div class="posts-card-grid" v-loading="loading">
            <el-row :gutter="20">
              <el-col
                v-for="post in posts"
                :key="post.path"
                :xs="24"
                :sm="12"
                :md="8"
                :lg="6"
              >
                <div class="post-card">
                  <!-- 头部：# + 标题 + 权重 -->
                  <div class="post-card-header">
                    <div class="post-card-title">
                      <span class="title-prefix">#</span>
                      {{ post.title }}
                    </div>
                    <div class="post-card-weight">
                      <span class="weight-label">权重</span>
                      <span class="weight-value">{{ post.params?.weight ?? '-' }}</span>
                    </div>
                  </div>

                  <!-- 字段行 -->
                  <div class="post-card-row">
                    <span class="row-label">所属目录</span>
                    <el-tag v-if="post.directory" type="info" size="small">
                      {{ post.directory }}
                    </el-tag>
                    <span v-else class="no-value">-</span>
                  </div>

                  <div class="post-card-row">
                    <span class="row-label">分类</span>
                    <el-tag
                      v-for="cat in (post.params?.categories || [])"
                      :key="cat"
                      size="small"
                    >
                      {{ cat }}
                    </el-tag>
                    <span v-if="!post.params?.categories?.length" class="no-value">-</span>
                  </div>

                  <div class="post-card-row">
                    <span class="row-label">标签</span>
                    <div class="tags-container">
                      <el-tag
                        v-for="tag in (post.params?.tags || []).slice(0, 3)"
                        :key="tag"
                        size="small"
                        :type="getTagType(tag)"
                      >
                        {{ tag }}
                      </el-tag>
                      <el-button
                        v-if="post.params?.tags?.length > 3"
                        text
                        size="small"
                        class="more-tags-btn"
                      >
                        更多
                      </el-button>
                    </div>
                  </div>

                  <!-- 底部操作按钮 -->
                  <div class="post-card-actions">
                    <el-button type="primary" size="small" @click="editPost(post)">
                      编辑
                    </el-button>
                    <el-button type="success" size="small" @click="viewPost(post)">
                      查看
                    </el-button>
                    <el-button type="danger" size="small" @click="deletePost(post)">
                      删除
                    </el-button>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadPosts"
        @size-change="loadPosts"
        style="margin-top: 16px; justify-content: flex-end"
      />
        </el-card>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FolderOpened, Close, Setting, Plus, Search } from '@element-plus/icons-vue'
import { getPostsList, deletePostApi } from '@/api/posts'
import { getDirectories } from '@/api/directory'
import { getSectionMappings } from '@/api/sections'
import { useTaxonomy } from '@/composables/useTaxonomy'
import DirectoryTree from '@/components/DirectoryTree.vue'
import DirectoryBreadcrumb from '@/components/DirectoryBreadcrumb.vue'

const router = useRouter()
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedTag = ref('')

// 使用全局分类标签管理
const { categories, tags } = useTaxonomy()

// 目录相关状态
const showDirectoryDrawer = ref(false)
const directoryTree = ref([])
const currentDirectory = ref('')
const sectionMappings = ref([])

const posts = ref([])
const pagination = ref({
  page: 1,
  size: 20,
  total: 0
})

// 标签颜色映射
const tagColors = ['', 'success', 'warning', 'danger', 'info']
const getTagType = (tag) => {
  const hash = tag.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  return tagColors[hash % tagColors.length]
}

const loadPosts = async () => {
  loading.value = true
  try {
    // 如果使用了搜索、分类或标签筛选，则不限制目录（全局搜索）
    const hasFilter = searchQuery.value || selectedCategory.value || selectedTag.value

    const params = {
      page: pagination.value.page,
      size: pagination.value.size,
      search: searchQuery.value,
      category: selectedCategory.value,
      tag: selectedTag.value,
      directory: hasFilter ? '' : currentDirectory.value // 有筛选条件时全局搜索
    }
    console.log('📄 加载文章列表，参数:', params)

    const data = await getPostsList(params)

    posts.value = data.data.items || []
    pagination.value.total = data.data.total || 0

    console.log(`✅ 已加载 ${posts.value.length} 篇文章（共 ${pagination.value.total} 篇）`)
  } catch (error) {
    ElMessage.error('加载文章列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const createPost = () => {
  router.push({ name: 'PostCreate' })
}

const editPost = (post) => {
  router.push({
    name: 'PostEdit',
    query: { path: post.path }
  })
}

// 在新标签页查看文章
const viewPost = (post) => {
  // 从路径中提取 permalink，假设格式为 content/xxx/yyy/filename.md
  // 如果 post 有 permalink 字段则直接使用
  if (post.permalink) {
    window.open(post.permalink, '_blank')
    return
  }
  // 否则尝试从路径构造
  const path = post.path.replace(/^content\//, '/').replace(/\.md$/, '/')
  window.open(path, '_blank')
}

const deletePost = async (post) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文章"${post.title}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deletePostApi(post.path)
    ElMessage.success('删除成功')
    loadPosts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 加载目录树
const loadDirectories = async () => {
  try {
    const response = await getDirectories()
    console.log('📁 目录树 API 响应:', response)
    if (response.success && response.data?.tree) {
      directoryTree.value = response.data.tree
      console.log('✅ 目录树数据已加载，节点数:', response.data.tree.length)
    } else {
      console.warn('⚠️ 目录树数据格式错误或为空')
    }
  } catch (error) {
    console.error('❌ 加载目录树失败:', error)
  }
}

// 加载菜单映射
const loadSectionMappings = async () => {
  try {
    const response = await getSectionMappings()
    if (response.success && response.data?.items) {
      sectionMappings.value = response.data.items
      console.log('✅ 菜单映射数据已加载，数量:', response.data.items.length)
    }
  } catch (error) {
    console.error('❌ 加载菜单映射失败:', error)
  }
}

// 跳转到菜单映射配置页面
const goToSectionMappings = () => {
  router.push({ name: 'AppearanceSections' })
}

// 选择目录
const selectDirectory = (node) => {
  console.log('🎯 点击目录节点:', node)
  console.log('   - 目录路径:', node.path)
  console.log('   - 目录标题:', node.title)
  currentDirectory.value = node.path
  showDirectoryDrawer.value = false // 关闭移动端抽屉
  loadPosts() // 重新加载文章列表
}

// 面包屑导航
const navigateToDirectory = (path) => {
  currentDirectory.value = path
  loadPosts()
}

// 清除目录过滤
const clearDirectoryFilter = () => {
  currentDirectory.value = ''
  loadPosts()
}

onMounted(() => {
  loadDirectories()
  loadSectionMappings()
  loadPosts()
})
</script>


<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

// ============================================
// 主布局容器
// ============================================

.posts-list {
  height: 100%;
}

.posts-layout {
  display: flex;
  gap: $spacing-6;
  height: 100%;
}

// ============================================
// 左侧目录树 (Soft UI 风格)
// ============================================

.directory-sidebar {
  width: 250px;
  flex-shrink: 0;
  background: $bg-card;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: $spacing-5;
  border-bottom: 1px solid $border-light;
  background: $bg-secondary;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: $text-lg;
    font-weight: $font-semibold;
    color: $text-primary;
  }
}

.drawer-header-actions {
  padding: $spacing-3 $spacing-4;
  border-bottom: 1px solid $border-light;
  margin-bottom: $spacing-3;
}

.directory-sidebar :deep(.directory-tree) {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-3;

  @include scrollbar(6px, $border-default, transparent);
}

// ============================================
// 右侧内容区域
// ============================================

.content-area {
  flex: 1;
  min-width: 0;
  overflow: auto;
}

// ============================================
// 列表头部
// ============================================

.list-header {
  @include flex-between;
}

.header-left {
  @include flex-start;
  gap: $spacing-4;

  span {
    font-size: $text-lg;
    font-weight: $font-semibold;
    color: $text-primary;
  }
}

.mobile-directory-btn {
  display: none;
}

// ============================================
// 面包屑导航栏
// ============================================

.breadcrumb-bar {
  @include flex-between;
  margin-bottom: $spacing-4;
  padding-bottom: $spacing-3;
  border-bottom: 1px solid $border-light;
}

.clear-filter-btn {
  flex-shrink: 0;
  margin-left: $spacing-3;
}

// ============================================
// 筛选栏 (现代化)
// ============================================

.filter-bar {
  display: flex;
  gap: $spacing-4;
  margin-bottom: $spacing-4;
  flex-wrap: wrap;

  :deep(.el-input),
  :deep(.el-select) {
    transition: $transition-all;

    &:focus-within {
      transform: translateY(-2px);
    }
  }
}

// ============================================
// 文章卡片网格
// ============================================

// 卡片进入动画
@keyframes slideUpFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.posts-card-grid {
  .el-col {
    margin-bottom: 20px;
    animation: slideUpFadeIn 0.5s ease-out forwards;

    // 错开动画 - 每行4个卡片
    @for $i from 1 through 20 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 60}ms;
      }
    }
  }

  .post-card {
    border: 2px dashed var(--el-border-color);
    border-radius: 12px;
    padding: 16px;
    background: var(--el-bg-color);
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;

    &:hover {
      border-style: solid;
      border-color: var(--el-color-primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .post-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .post-card-title {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.5;
    flex: 1;
    margin-right: 12px;
    word-break: break-word;

    .title-prefix {
      color: var(--el-color-primary);
      margin-right: 4px;
    }
  }

  .post-card-weight {
    text-align: right;
    font-size: 12px;
    flex-shrink: 0;

    .weight-label {
      color: var(--el-text-color-secondary);
      display: block;
    }
    .weight-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--el-color-warning);
    }
  }

  .post-card-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    font-size: 13px;

    .row-label {
      color: var(--el-text-color-secondary);
      min-width: 56px;
      flex-shrink: 0;
    }
    .no-value {
      color: var(--el-text-color-placeholder);
    }
    .el-tag {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  .more-tags-btn {
    font-size: 12px;
    padding: 0 4px;
  }

  .post-card-actions {
    display: flex;
    gap: 8px;
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

// ============================================
// 响应式设计 (Mobile-First)
// ============================================

.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

// 平板和移动端
@media screen and (max-width: 768px) {
  .posts-layout {
    flex-direction: column;
    gap: 0;
  }

  // 隐藏桌面目录树
  .desktop-only {
    display: none;
  }

  // 显示移动端元素
  .mobile-only {
    display: block;
  }

  .mobile-directory-btn {
    display: inline-flex;
  }

  .filter-bar {
    flex-direction: column;

    :deep(.el-input),
    :deep(.el-select) {
      width: 100%;
    }
  }

  .btn-text {
    display: none;
  }

  .list-header span {
    font-size: $text-base;
  }
}

// 手机竖屏
@media screen and (max-width: 480px) {
  .posts-card-grid {
    .post-card {
      padding: $spacing-4;
    }

    .post-card-title {
      font-size: 14px;
    }

    .post-card-row .el-tag {
      max-width: 120px;
    }
  }
}
</style>
