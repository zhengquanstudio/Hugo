<template>
  <el-drawer
    v-model="visible"
    direction="btt"
    size="auto"
    :show-close="false"
    class="quick-settings-drawer"
  >
    <template #header>
      <div class="drawer-header">
        <span>文章设置</span>
        <el-button text @click="$emit('close')">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </template>

    <div class="settings-content">
      <!-- 保存目录 -->
      <div v-if="showDirectorySelector" class="setting-item">
        <div class="setting-label">保存目录</div>
        <el-input
          :model-value="localDirectoryPath || '点击选择目录'"
          readonly
          placeholder="点击选择目录"
          @click="showDirectoryDrawer = true"
        >
          <template #prefix>
            <el-icon><Folder /></el-icon>
          </template>
          <template #suffix>
            <el-icon><ArrowDown /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 文件名 -->
      <div v-if="showFilenameInput" class="setting-item">
        <div class="setting-label">文件名</div>
        <el-input
          v-model="localFilename"
          placeholder="留空则使用标题作为文件名"
          @input="handleFilenameChange"
        />
        <div class="field-hint">支持前缀如: 01.kubernetes.md</div>
      </div>

      <!-- 发布状态 -->
      <div class="setting-item">
        <div class="setting-label">发布状态</div>
        <el-switch
          v-model="localDraft"
          active-text="草稿"
          inactive-text="发布"
          inline-prompt
          @change="handleDraftChange"
        />
      </div>

      <!-- 分类选择 -->
      <div class="setting-item">
        <div class="setting-label">分类</div>
        <el-select
          v-model="localCategories"
          multiple
          filterable
          allow-create
          placeholder="选择或输入分类"
          style="width: 100%"
          @change="handleCategoriesChange"
        >
          <el-option
            v-for="cat in categoryOptions"
            :key="cat"
            :label="cat"
            :value="cat"
          />
        </el-select>
      </div>

      <!-- 标签输入 -->
      <div class="setting-item">
        <div class="setting-label">标签</div>
        <el-select
          v-model="localTags"
          multiple
          filterable
          allow-create
          placeholder="选择或输入标签"
          style="width: 100%"
          @change="handleTagsChange"
        >
          <el-option
            v-for="tag in tagOptions"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </div>

      <!-- 摘要 -->
      <div class="setting-item">
        <div class="setting-label">摘要</div>
        <el-input
          v-model="localDescription"
          type="textarea"
          :rows="2"
          placeholder="文章摘要（可选）"
          @change="handleDescriptionChange"
        />
      </div>
    </div>

    <div class="drawer-footer">
      <el-button @click="$emit('close')">关闭</el-button>
    </div>
  </el-drawer>

  <!-- 目录选择抽屉 -->
  <el-drawer
    v-model="showDirectoryDrawer"
    direction="btt"
    size="70%"
    :show-close="false"
    class="directory-drawer"
  >
    <template #header>
      <div class="drawer-header">
        <span>选择目录</span>
        <el-button text @click="showDirectoryDrawer = false">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </template>

    <div class="directory-content">
      <!-- 搜索框 -->
      <el-input
        v-model="directorySearchText"
        placeholder="搜索目录..."
        clearable
        class="directory-search"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <!-- 目录树 -->
      <div class="directory-tree-container">
        <div v-if="directoryLoading" class="loading-state">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        <template v-else>
          <div
            v-for="node in filteredDirectoryTree"
            :key="node.path"
            class="directory-node"
          >
            <DirectoryTreeNode
              :node="node"
              :selected-path="selectedDirectoryPath"
              @select="handleDirectorySelect"
            />
          </div>
          <el-empty
            v-if="filteredDirectoryTree.length === 0"
            description="未找到匹配的目录"
            :image-size="60"
          />
        </template>
      </div>
    </div>

    <div class="drawer-footer">
      <el-button @click="showDirectoryDrawer = false">取消</el-button>
      <el-button type="primary" @click="confirmDirectorySelect">确定</el-button>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch, onMounted, h } from 'vue'
import { Folder, ArrowDown, Search, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getDirectories } from '@/api/directory'

// 递归目录树节点组件
const DirectoryTreeNode = {
  name: 'DirectoryTreeNode',
  props: {
    node: { type: Object, required: true },
    selectedPath: { type: String, default: '' },
    level: { type: Number, default: 0 }
  },
  emits: ['select'],
  setup(props, { emit }) {
    const expanded = ref(props.level < 1) // 默认展开第一层

    const isSelected = computed(() => props.selectedPath === props.node.path)
    const hasChildren = computed(() => props.node.children && props.node.children.length > 0)

    function toggleExpand() {
      if (hasChildren.value) {
        expanded.value = !expanded.value
      }
    }

    function selectNode() {
      emit('select', props.node.path)
    }

    return () => {
      const children = []

      // 当前节点
      children.push(
        h('div', {
          class: ['tree-node-item', { 'is-selected': isSelected.value }],
          style: { paddingLeft: `${props.level * 16 + 8}px` },
          onClick: selectNode
        }, [
          // 展开/折叠图标
          hasChildren.value
            ? h('span', {
                class: ['expand-icon', { 'is-expanded': expanded.value }],
                onClick: (e) => { e.stopPropagation(); toggleExpand() }
              }, '▶')
            : h('span', { class: 'expand-icon placeholder' }),
          // 文件夹图标
          h('span', { class: 'folder-icon' }, '📁'),
          // 标题
          h('span', { class: 'node-title' }, props.node.title),
          // 文件数量
          props.node.fileCount !== undefined
            ? h('span', { class: 'node-count' }, `(${props.node.fileCount})`)
            : null
        ])
      )

      // 子节点
      if (hasChildren.value && expanded.value) {
        children.push(
          h('div', { class: 'tree-children' },
            props.node.children.map(child =>
              h(DirectoryTreeNode, {
                key: child.path,
                node: child,
                selectedPath: props.selectedPath,
                level: props.level + 1,
                onSelect: (path) => emit('select', path)
              })
            )
          )
        )
      }

      return h('div', { class: 'tree-node' }, children)
    }
  }
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  draft: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  tags: {
    type: Array,
    default: () => []
  },
  description: {
    type: String,
    default: ''
  },
  categoryOptions: {
    type: Array,
    default: () => []
  },
  tagOptions: {
    type: Array,
    default: () => []
  },
  directoryPath: {
    type: String,
    default: ''
  },
  showDirectorySelector: {
    type: Boolean,
    default: false
  },
  filename: {
    type: String,
    default: ''
  },
  showFilenameInput: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:modelValue',
  'update:draft',
  'update:categories',
  'update:tags',
  'update:description',
  'update:directoryPath',
  'update:filename',
  'close'
])

const visible = ref(props.modelValue)
const localDraft = ref(props.draft)
const localCategories = ref([...props.categories])
const localTags = ref([...props.tags])
const localDescription = ref(props.description)
const localDirectoryPath = ref(props.directoryPath)
const localFilename = ref(props.filename)

// 目录选择相关
const showDirectoryDrawer = ref(false)
const directorySearchText = ref('')
const directoryTree = ref([])
const directoryLoading = ref(false)
const selectedDirectoryPath = ref('')

// 过滤后的目录树
const filteredDirectoryTree = computed(() => {
  if (!directorySearchText.value) return directoryTree.value
  return filterTree(directoryTree.value, directorySearchText.value.toLowerCase())
})

// 递归过滤树
function filterTree(nodes, keyword) {
  const result = []
  for (const node of nodes) {
    const titleMatch = node.title.toLowerCase().includes(keyword)
    const pathMatch = node.path.toLowerCase().includes(keyword)

    let filteredChildren = []
    if (node.children) {
      filteredChildren = filterTree(node.children, keyword)
    }

    if (titleMatch || pathMatch || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children
      })
    }
  }
  return result
}

// 加载目录树
async function loadDirectories() {
  if (directoryTree.value.length > 0) return // 已加载过

  directoryLoading.value = true
  try {
    const response = await getDirectories()
    if (response.success && response.data?.tree) {
      directoryTree.value = response.data.tree
    }
  } catch (error) {
    console.error('加载目录树失败:', error)
    ElMessage.error('加载目录树失败')
  } finally {
    directoryLoading.value = false
  }
}

// 目录选择
function handleDirectorySelect(path) {
  selectedDirectoryPath.value = path
}

// 确认目录选择
function confirmDirectorySelect() {
  if (!selectedDirectoryPath.value) {
    ElMessage.warning('请选择一个目录')
    return
  }
  localDirectoryPath.value = selectedDirectoryPath.value
  emit('update:directoryPath', selectedDirectoryPath.value)
  showDirectoryDrawer.value = false
}

// 同步外部值
watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

watch(() => props.draft, (val) => {
  localDraft.value = val
})

watch(() => props.categories, (val) => {
  localCategories.value = [...val]
})

watch(() => props.tags, (val) => {
  localTags.value = [...val]
})

watch(() => props.description, (val) => {
  localDescription.value = val
})

watch(() => props.directoryPath, (val) => {
  localDirectoryPath.value = val
})

watch(() => props.filename, (val) => {
  localFilename.value = val
})

// 目录抽屉打开时加载数据
watch(showDirectoryDrawer, (val) => {
  if (val) {
    loadDirectories()
    selectedDirectoryPath.value = localDirectoryPath.value
    directorySearchText.value = ''
  }
})

// 事件处理
function handleDraftChange(val) {
  emit('update:draft', val)
}

function handleCategoriesChange(val) {
  emit('update:categories', val)
}

function handleTagsChange(val) {
  emit('update:tags', val)
}

function handleDescriptionChange(val) {
  emit('update:description', val)
}

function handleFilenameChange(val) {
  emit('update:filename', val)
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: $text-lg;
  font-weight: $font-semibold;
}

.settings-content {
  padding: $spacing-4;
}

.setting-item {
  margin-bottom: $spacing-5;

  &:last-child {
    margin-bottom: 0;
  }
}

.setting-label {
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $text-secondary;
  margin-bottom: $spacing-2;
}

.field-hint {
  font-size: $text-xs;
  color: $text-muted;
  margin-top: $spacing-1;
}

.drawer-footer {
  padding: $spacing-4;
  border-top: 1px solid $border-light;
  display: flex;
  justify-content: center;
  gap: $spacing-3;
}

:deep(.quick-settings-drawer) {
  .el-drawer__header {
    padding: $spacing-4;
    margin-bottom: 0;
    border-bottom: 1px solid $border-light;
  }

  .el-drawer__body {
    padding: 0;
  }
}

// 目录选择抽屉样式
:deep(.directory-drawer) {
  .el-drawer__header {
    padding: $spacing-4;
    margin-bottom: 0;
    border-bottom: 1px solid $border-light;
  }

  .el-drawer__body {
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.directory-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: $spacing-4;
  overflow: hidden;
}

.directory-search {
  margin-bottom: $spacing-3;
  flex-shrink: 0;
}

.directory-tree-container {
  flex: 1;
  overflow-y: auto;
  border: 1px solid $border-light;
  border-radius: $radius-md;
  padding: $spacing-2;
  background: $bg-secondary;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-8;
  color: $text-secondary;

  .is-loading {
    animation: rotating 2s linear infinite;
  }
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 目录树节点样式
.tree-node-item {
  display: flex;
  align-items: center;
  padding: $spacing-2 $spacing-3;
  border-radius: $radius-md;
  cursor: pointer;
  transition: background-color $transition-fast;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  &.is-selected {
    background: rgba($primary, 0.1);
    color: $primary;
  }
}

.expand-icon {
  width: 16px;
  font-size: 10px;
  color: $text-secondary;
  transition: transform $transition-fast;
  flex-shrink: 0;

  &.is-expanded {
    transform: rotate(90deg);
  }

  &.placeholder {
    visibility: hidden;
  }
}

.folder-icon {
  margin-right: $spacing-2;
  flex-shrink: 0;
}

.node-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: $text-sm;
}

.node-count {
  margin-left: $spacing-2;
  font-size: $text-xs;
  color: $text-muted;
  flex-shrink: 0;
}

.tree-children {
  // 子节点默认不需要额外缩进，由 padding-left 控制
}
</style>
