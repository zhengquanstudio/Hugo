<template>
  <div class="coming-soon-enhanced">
    <el-card shadow="never" class="coming-soon-card">
      <div class="coming-soon-content">
        <!-- Animated SVG Illustration -->
        <div class="illustration">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              class="pulse-circle"
              cx="100"
              cy="100"
              r="80"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              opacity="0.2"
            />
            <circle
              class="pulse-circle pulse-delay-1"
              cx="100"
              cy="100"
              r="60"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              opacity="0.3"
            />
            <circle
              class="pulse-circle pulse-delay-2"
              cx="100"
              cy="100"
              r="40"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              opacity="0.5"
            />
            <g class="icon-group">
              <component :is="illustrationIcon" />
            </g>
          </svg>
        </div>

        <!-- Title and Status -->
        <h2 class="title">{{ title }}</h2>
        <p class="description">{{ description }}</p>

        <!-- Progress Indicator -->
        <div v-if="progress" class="progress-section">
          <el-progress
            :percentage="progress"
            :color="progressColor"
            :stroke-width="8"
            :show-text="false"
          />
          <div class="progress-text">
            <span class="progress-value">{{ progress }}% 完成</span>
            <span class="progress-status">{{ progressStatus }}</span>
          </div>
        </div>

        <!-- Status Badge -->
        <el-tag
          :type="statusType"
          size="large"
          effect="dark"
          class="status-badge"
        >
          <el-icon><Clock /></el-icon>
          {{ statusText }}
        </el-tag>

        <!-- Timeline Roadmap -->
        <div v-if="roadmap.length" class="roadmap-section">
          <h3 class="roadmap-title">开发路线图</h3>
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in roadmap"
              :key="index"
              :timestamp="item.date"
              :type="item.type || 'primary'"
              :icon="item.icon"
              placement="top"
            >
              <div class="roadmap-item">
                <div class="item-header">
                  <span class="item-title">{{ item.title }}</span>
                  <el-tag
                    v-if="item.status"
                    :type="getStatusTagType(item.status)"
                    size="small"
                  >
                    {{ item.status }}
                  </el-tag>
                </div>
                <p v-if="item.description" class="item-description">
                  {{ item.description }}
                </p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- Planned Features -->
        <div v-if="features.length" class="features-section">
          <h3 class="features-title">
            <el-icon><List /></el-icon>
            计划功能
          </h3>
          <div class="features-grid">
            <div
              v-for="(feature, index) in features"
              :key="index"
              class="feature-card"
            >
              <el-icon class="feature-icon">
                <component :is="feature.icon || 'Check'" />
              </el-icon>
              <div class="feature-content">
                <h4 class="feature-title">{{ feature.title || feature }}</h4>
                <p v-if="feature.description" class="feature-description">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions">
          <el-button
            v-if="showNotifyButton"
            type="primary"
            size="large"
            @click="handleNotify"
          >
            <el-icon><Bell /></el-icon>
            通知我上线
          </el-button>
          <el-button
            v-if="relatedResources.length"
            size="large"
            @click="showResources = !showResources"
          >
            <el-icon><Document /></el-icon>
            相关资源
          </el-button>
        </div>

        <!-- Related Resources -->
        <el-collapse-transition>
          <div v-show="showResources" class="resources-section">
            <h3 class="resources-title">相关文档和资源</h3>
            <ul class="resources-list">
              <li
                v-for="(resource, index) in relatedResources"
                :key="index"
                class="resource-item"
              >
                <el-icon><Link /></el-icon>
                <a :href="resource.url" target="_blank" rel="noopener">
                  {{ resource.title }}
                </a>
              </li>
            </ul>
          </div>
        </el-collapse-transition>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Clock,
  Bell,
  Document,
  Link,
  List,
  Check,
  Tools,
  Setting,
  Box,
  ShoppingCart
} from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    default: '功能开发中'
  },
  description: {
    type: String,
    default: '该功能正在紧张开发中，敬请期待...'
  },
  illustrationIcon: {
    type: Object,
    default: () => Tools
  },
  features: {
    type: Array,
    default: () => []
  },
  roadmap: {
    type: Array,
    default: () => []
  },
  relatedResources: {
    type: Array,
    default: () => []
  },
  progress: {
    type: Number,
    default: 0
  },
  progressStatus: {
    type: String,
    default: '积极开发中'
  },
  statusText: {
    type: String,
    default: '开发中'
  },
  statusType: {
    type: String,
    default: 'warning'
  },
  showNotifyButton: {
    type: Boolean,
    default: true
  }
})

const showResources = ref(false)

const progressColor = computed(() => {
  if (props.progress >= 80) return '#34D399'
  if (props.progress >= 50) return '#60A5FA'
  if (props.progress >= 30) return '#FBBF24'
  return '#909399'
})

const getStatusTagType = (status) => {
  const statusMap = {
    '已完成': 'success',
    '进行中': 'primary',
    '计划中': 'info',
    '待定': 'info'
  }
  return statusMap[status] || 'info'
}

const handleNotify = () => {
  ElMessage.success('感谢关注！功能上线后会通知您')
}
</script>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/assets/styles/variables.scss' as *;

.coming-soon-enhanced {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 600px;
  padding: 2rem 1rem;
}

.coming-soon-card {
  max-width: 900px;
  width: 100%;

  :deep(.el-card__body) {
    padding: 3rem;
  }
}

.coming-soon-content {
  text-align: center;
}

// Animated Illustration
.illustration {
  margin-bottom: 2rem;
  color: $primary;

  svg {
    display: inline-block;
    animation: float 3s ease-in-out infinite;
  }

  .pulse-circle {
    animation: pulse 2s ease-out infinite;
  }

  .pulse-delay-1 {
    animation-delay: 0.3s;
  }

  .pulse-delay-2 {
    animation-delay: 0.6s;
  }

  .icon-group {
    transform-origin: center;
    animation: rotate 20s linear infinite;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.5;
    transform: scale(0.95);
  }
  50% {
    opacity: 0.3;
    transform: scale(1);
  }
  100% {
    opacity: 0.5;
    transform: scale(0.95);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Title and Description
.title {
  margin: 0 0 1rem;
  font-size: 32px;
  font-weight: 700;
  color: $text-primary;
  background: linear-gradient(135deg, $primary 0%, $accent 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.description {
  font-size: 16px;
  color: $text-secondary;
  margin-bottom: 2rem;
  line-height: 1.6;
}

// Progress Section
.progress-section {
  max-width: 400px;
  margin: 2rem auto;

  .progress-text {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    font-size: 13px;

    .progress-value {
      font-weight: 600;
      color: $text-primary;
    }

    .progress-status {
      color: $text-secondary;
    }
  }
}

// Status Badge
.status-badge {
  margin: 1rem 0 2rem;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;

  .el-icon {
    margin-right: 6px;
  }
}

// Roadmap Section
.roadmap-section {
  margin: 3rem 0;
  text-align: left;

  .roadmap-title {
    font-size: 20px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .roadmap-item {
    .item-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .item-title {
      font-weight: 500;
      color: $text-primary;
    }

    .item-description {
      margin: 0;
      color: $text-secondary;
      font-size: 14px;
      line-height: 1.5;
    }
  }
}

// Features Section
.features-section {
  margin: 3rem 0;
  text-align: left;

  .features-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 20px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 1.5rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .feature-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    background: $bg-secondary;
    border-radius: 8px;
    transition: all 150ms ease-out;

    &:hover {
      background: color.adjust($bg-secondary, $lightness: -3%);
      transform: translateY(-2px);
    }

    .feature-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      color: $primary;
      margin-top: 2px;
    }

    .feature-content {
      flex: 1;
    }

    .feature-title {
      margin: 0 0 0.25rem;
      font-size: 15px;
      font-weight: 500;
      color: $text-primary;
    }

    .feature-description {
      margin: 0;
      font-size: 13px;
      color: $text-secondary;
      line-height: 1.5;
    }
  }
}

// Actions
.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;

  .el-button {
    .el-icon {
      margin-right: 6px;
    }
  }
}

// Resources Section
.resources-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: $bg-secondary;
  border-radius: 8px;
  text-align: left;

  .resources-title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    margin: 0 0 1rem;
  }

  .resources-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .resource-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;

    .el-icon {
      color: $primary;
      font-size: 16px;
    }

    a {
      color: $primary;
      text-decoration: none;
      transition: color 150ms ease-out;

      &:hover {
        color: $primary-dark;
        text-decoration: underline;
      }
    }
  }
}

// Mobile Responsive
@media (max-width: 768px) {
  .coming-soon-card {
    :deep(.el-card__body) {
      padding: 2rem 1.5rem;
    }
  }

  .illustration svg {
    width: 150px;
    height: 150px;
  }

  .title {
    font-size: 24px;
  }

  .description {
    font-size: 14px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }

  .roadmap-section,
  .features-section {
    margin: 2rem 0;
  }
}
</style>
