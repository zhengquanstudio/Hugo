<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>文章总数</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.totalPosts }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><FolderOpened /></el-icon>
              <span>分类数</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.totalCategories }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><PriceTag /></el-icon>
              <span>标签数</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.totalTags }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Reading /></el-icon>
              <span>总字数</span>
            </div>
          </template>
          <div class="stat-value">{{ formatNumber(stats.totalWords) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <span>分类统计</span>
          </template>
          <div ref="categoryChart" style="height: 400px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span>最近文章</span>
          </template>
          <el-scrollbar height="300px">
            <div
              v-for="post in stats.recentPosts"
              :key="post.path"
              class="post-item"
              @click="editPost(post)"
            >
              <div class="post-title">{{ post.title }}</div>
              <div class="post-meta">
                <span>{{ post.date }}</span>
                <span v-if="post.categories">{{ post.categories[0] }}</span>
              </div>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span>标签云</span>
          </template>
          <div ref="tagCloudChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getDashboard } from '@/api/dashboard'
import { registerHugoTeekTheme } from '@/assets/echarts-theme'

const router = useRouter()
const categoryChart = ref(null)
const tagCloudChart = ref(null)

// 使用 shallowRef 存储 echarts 实例，避免深度响应式带来的性能开销
const echartsInstance = shallowRef(null)

// 异步加载 ECharts 库
const loadECharts = async () => {
  if (echartsInstance.value) {
    return echartsInstance.value
  }

  try {
    // 动态导入 echarts 和 echarts-wordcloud
    const [{ default: echarts }, { default: echartsWordcloud }] = await Promise.all([
      import('echarts').catch(() => ({ default: null })),
      import('echarts-wordcloud').catch(() => ({ default: null }))
    ])

    if (!echarts) {
      console.error('ECharts加载失败')
      return null
    }

    // ECharts 验证通过，立即注册 echarts-wordcloud 扩展
    if (echartsWordcloud) {
      echartsWordcloud(echarts)
    }

    // 注册 ECharts 主题
    registerHugoTeekTheme(echarts)

    echartsInstance.value = echarts
    return echarts
  } catch (error) {
    console.error('加载ECharts库时出错:', error)
    return null
  }
}

// 存储 resize 处理函数，用于清理
let categoryChartResizeHandler = null
let tagChartResizeHandler = null

const stats = ref({
  totalPosts: 0,
  totalCategories: 0,
  totalTags: 0,
  totalWords: 0,
  recentPosts: [],
  categoryStats: [],
  tagCloud: []
})

const formatNumber = (num) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

const loadDashboard = async () => {
  try {
    const data = await getDashboard()
    stats.value = data.data

    // 异步加载 ECharts 库
    const echarts = await loadECharts()

    // 如果 ECharts 加载失败，显示用户提示并返回
    if (!echarts) {
      ElMessage.error('图表组件加载失败，请刷新页面重试')
      return
    }

    // 渲染分类图表 (使用主题)
    if (categoryChart.value) {
      const chart = echarts.init(categoryChart.value, 'hugo-teek')
      chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}篇 ({d}%)'
        },
        legend: {
          show: false                  // 隐藏图例，标签已足够
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '65%'],    // 稍微缩小外半径
            center: ['50%', '50%'],    // 居中显示（无图例）
            avoidLabelOverlap: true,   // 防止标签重叠
            itemStyle: {
              borderRadius: 6,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {d}%',
              fontSize: 11,              // 稍微减小字号
              color: '#374151',
              overflow: 'truncate',      // 截断过长文字
              width: 80                  // 限制标签宽度
            },
            labelLine: {
              show: true,
              length: 10,                // 第一段线长度
              length2: 60,               // 第二段线长度
              smooth: 0.2,               // 平滑曲线
              lineStyle: {
                color: '#D1D5DB'
              }
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold'
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
              }
            },
            data: stats.value.categoryStats.map(item => ({
              name: item.name,
              value: item.count
            }))
          }
        ]
      })

      // 响应式调整
      categoryChartResizeHandler = () => chart.resize()
      window.addEventListener('resize', categoryChartResizeHandler)
    }

    // 渲染标签云 (使用主题颜色)
    if (tagCloudChart.value && stats.value.tagCloud) {
      const tagChart = echarts.init(tagCloudChart.value, 'hugo-teek')
      const tagData = stats.value.tagCloud.map(item => ({
        name: item.name,
        value: item.count
      }))

      tagChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}篇'
        },
        series: [{
          type: 'wordCloud',
          shape: 'circle',
          sizeRange: [14, 50],
          rotationRange: [-45, 45],
          rotationStep: 45,
          gridSize: 8,
          drawOutOfBound: false,
          textStyle: {
            fontFamily: 'Fira Sans, sans-serif',
            fontWeight: 'normal',
            color: function() {
              const colors = [
                '#2563EB', '#F97316', '#10B981', '#F59E0B',
                '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'
              ]
              return colors[Math.floor(Math.random() * colors.length)]
            }
          },
          emphasis: {
            focus: 'self',
            textStyle: {
              textShadowBlur: 10,
              textShadowColor: '#333'
            }
          },
          data: tagData
        }]
      })

      // 响应式调整
      tagChartResizeHandler = () => tagChart.resize()
      window.addEventListener('resize', tagChartResizeHandler)
    }
  } catch (error) {
    console.error('加载仪表盘失败:', error)
  }
}

const editPost = (post) => {
  router.push({
    name: 'PostEdit',
    query: { path: post.path }
  })
}

onMounted(() => {
  loadDashboard()
})

onBeforeUnmount(() => {
  // 清理 resize 事件监听器
  if (categoryChartResizeHandler) {
    window.removeEventListener('resize', categoryChartResizeHandler)
  }
  if (tagChartResizeHandler) {
    window.removeEventListener('resize', tagChartResizeHandler)
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.dashboard {
  padding: 0;
}

// ============================================
// 卡片进入动画
// ============================================

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

// 为所有 el-col 添加动画
:deep(.el-col) {
  animation: slideUpFadeIn 0.5s ease-out forwards;
}

// 第一行统计卡片 - 错开动画
:deep(.el-row:nth-child(1) .el-col:nth-child(1)) {
  animation-delay: 0ms;
}
:deep(.el-row:nth-child(1) .el-col:nth-child(2)) {
  animation-delay: 80ms;
}
:deep(.el-row:nth-child(1) .el-col:nth-child(3)) {
  animation-delay: 160ms;
}
:deep(.el-row:nth-child(1) .el-col:nth-child(4)) {
  animation-delay: 240ms;
}

// 第二行图表和最近文章
:deep(.el-row:nth-child(2) .el-col:nth-child(1)) {
  animation-delay: 320ms;
}
:deep(.el-row:nth-child(2) .el-col:nth-child(2)) {
  animation-delay: 400ms;
}

// 第三行标签云
:deep(.el-row:nth-child(3) .el-col:nth-child(1)) {
  animation-delay: 480ms;
}

// ============================================
// 统计卡片 (简化风格)
// ============================================

:deep(.el-card) {
  @include card-soft;
  transition: all 150ms ease-out;
  cursor: pointer;

  &:hover {
    box-shadow: $shadow-lg;        // 仅阴影变化
    // ❌ 移除 transform: translateY(-4px)
  }
}

.card-header {
  @include flex-start;
  gap: $spacing-3;
  font-weight: $font-semibold;
  font-size: $text-base;
  color: $text-primary;

  .el-icon {
    @include flex-center;
    width: 48px;
    height: 48px;
    border-radius: $radius-lg;     // 8px
    background: $primary;          // ✅ 纯色替代渐变
    color: white;
    font-size: $text-2xl;
    // ❌ 移除 box-shadow
  }
}

// 为不同卡片设置不同纯色 (无渐变)
:deep(.el-col:nth-child(1)) .card-header .el-icon {
  background: $primary;            // 浅蓝
}

:deep(.el-col:nth-child(2)) .card-header .el-icon {
  background: $accent;             // 薄荷绿
}

:deep(.el-col:nth-child(3)) .card-header .el-icon {
  background: #A78BFA;             // 浅紫 (纯色)
}

:deep(.el-col:nth-child(4)) .card-header .el-icon {
  background: #FBBF24;             // 浅黄 (纯色)
}

.stat-value {
  font-family: $font-mono;
  font-size: $text-4xl;
  font-weight: $font-bold;
  color: $primary;
  text-align: center;
  padding: $spacing-6 0;
  letter-spacing: -1px;
  line-height: 1;
}

// ============================================
// 最近文章列表 (简化风格)
// ============================================

.post-item {
  padding: $spacing-4;
  border-radius: $radius-md;
  margin-bottom: $spacing-3;
  cursor: pointer;
  transition: all 150ms ease-out;
  border: 1px solid transparent;

  &:hover {
    background: rgba($primary, 0.04);
    border-color: rgba($primary, 0.12);
    // ❌ 移除 transform: translateX(4px)
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.post-title {
  font-weight: $font-medium;
  font-size: $text-base;
  margin-bottom: $spacing-2;
  color: $text-primary;
  @include line-clamp(2);
}

.post-meta {
  font-size: $text-sm;
  color: $text-muted;
  @include flex-start;
  gap: $spacing-4;

  span {
    @include flex-center;
    gap: $spacing-1;

    &:not(:last-child)::after {
      content: '•';
      margin-left: $spacing-4;
      color: $border-default;
    }
  }
}

// ============================================
// 图表容器响应式
// ============================================

:deep(.el-card__body) {
  > div[ref] {
    min-height: 300px;
  }
}

// 分类统计图表容器需要更多空间
:deep(.el-col:nth-child(1) .el-card__body > div[ref="categoryChart"]) {
  min-height: 400px;
}

// 移动端适配
@media screen and (max-width: 768px) {
  .stat-value {
    font-size: $text-3xl;
    padding: $spacing-4 0;
  }

  .card-header {
    font-size: $text-sm;

    .el-icon {
      width: 40px;
      height: 40px;
      font-size: $text-xl;
    }
  }

  :deep(.el-card__body) {
    > div[ref] {
      min-height: 250px;
    }
  }
}
</style>
