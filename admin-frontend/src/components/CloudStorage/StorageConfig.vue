<template>
  <div class="storage-config">
    <!-- 配置列表 -->
    <div class="config-header">
      <h3>云存储配置</h3>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>
        添加配置
      </el-button>
    </div>

    <!-- 配置卡片列表 -->
    <div v-if="configs.length > 0" class="config-grid">
      <div
        v-for="config in configs"
        :key="config.id"
        class="config-card"
        :class="{ 'is-default': config.isDefault, 'is-disabled': !config.enabled }"
      >
        <div class="card-header">
          <div class="provider-info">
            <el-icon :size="24" class="provider-icon" :style="{ color: getProviderColor(config.provider) }">
              <component :is="getProviderIcon(config.provider)" />
            </el-icon>
            <div class="provider-text">
              <span class="config-name">{{ config.name }}</span>
              <span class="provider-name">{{ getProviderLabel(config.provider) }}</span>
            </div>
          </div>
          <div class="card-badges">
            <el-tag v-if="config.isDefault" type="success" size="small">默认</el-tag>
            <el-tag v-if="!config.enabled" type="info" size="small">已禁用</el-tag>
          </div>
        </div>

        <div class="card-body">
          <div class="config-info">
            <template v-if="config.provider === 'aliyun_oss' && config.aliyunOss">
              <p><span class="label">Bucket:</span> {{ config.aliyunOss.bucket }}</p>
              <p><span class="label">Region:</span> {{ config.aliyunOss.region }}</p>
              <p v-if="config.aliyunOss.customDomain">
                <span class="label">自定义域名:</span> {{ config.aliyunOss.customDomain }}
              </p>
            </template>
            <template v-else-if="config.provider === 'tencent_cos' && config.tencentCos">
              <p><span class="label">Bucket:</span> {{ config.tencentCos.bucket }}</p>
              <p><span class="label">Region:</span> {{ config.tencentCos.region }}</p>
            </template>
            <template v-else-if="config.provider === 'qiniu' && config.qiniu">
              <p><span class="label">Bucket:</span> {{ config.qiniu.bucket }}</p>
              <p><span class="label">域名:</span> {{ config.qiniu.domain }}</p>
            </template>
            <template v-else-if="config.provider === 's3' && config.s3">
              <p><span class="label">Bucket:</span> {{ config.s3.bucket }}</p>
              <p><span class="label">Endpoint:</span> {{ config.s3.endpoint }}</p>
            </template>
          </div>
        </div>

        <div class="card-footer">
          <el-button text type="primary" size="small" @click="testConnection(config)">
            <el-icon><Connection /></el-icon>
            测试连接
          </el-button>
          <el-button text type="primary" size="small" @click="editConfig(config)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button text type="danger" size="small" @click="deleteConfig(config)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-else description="暂无云存储配置">
      <el-button type="primary" @click="showAddDialog">添加配置</el-button>
    </el-empty>

    <!-- 配置对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑配置' : '添加配置'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：我的 OSS 图床" />
        </el-form-item>

        <el-form-item label="存储服务商" prop="provider">
          <el-select v-model="form.provider" placeholder="选择云存储服务商" style="width: 100%">
            <el-option
              v-for="p in providers"
              :key="p.value"
              :label="p.label"
              :value="p.value"
            >
              <div class="provider-option">
                <span>{{ p.label }}</span>
                <span class="provider-desc">{{ p.description }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="设为默认" prop="isDefault">
          <el-switch v-model="form.isDefault" />
          <span class="form-hint">上传时默认使用此配置</span>
        </el-form-item>

        <el-form-item label="启用配置" prop="enabled">
          <el-switch v-model="form.enabled" />
        </el-form-item>

        <el-divider />

        <!-- 阿里云 OSS 配置 -->
        <template v-if="form.provider === 'aliyun_oss'">
          <el-form-item label="Access Key ID" prop="aliyunOss.accessKeyId">
            <el-input v-model="form.aliyunOss.accessKeyId" placeholder="输入 AccessKey ID" />
          </el-form-item>
          <el-form-item label="Access Key Secret" prop="aliyunOss.accessKeySecret">
            <el-input
              v-model="form.aliyunOss.accessKeySecret"
              type="password"
              show-password
              placeholder="输入 AccessKey Secret"
            />
          </el-form-item>
          <el-form-item label="Bucket" prop="aliyunOss.bucket">
            <el-input v-model="form.aliyunOss.bucket" placeholder="输入 Bucket 名称" />
          </el-form-item>
          <el-form-item label="Region" prop="aliyunOss.region">
            <el-input v-model="form.aliyunOss.region" placeholder="例如：oss-cn-hangzhou" />
          </el-form-item>
          <el-form-item label="自定义域名">
            <el-input v-model="form.aliyunOss.customDomain" placeholder="可选，例如：cdn.example.com" />
          </el-form-item>
          <el-form-item label="路径前缀">
            <el-input v-model="form.aliyunOss.pathPrefix" placeholder="可选，例如：images" />
          </el-form-item>
        </template>

        <!-- 腾讯云 COS 配置 -->
        <template v-else-if="form.provider === 'tencent_cos'">
          <el-form-item label="Secret ID" prop="tencentCos.secretId">
            <el-input v-model="form.tencentCos.secretId" placeholder="输入 SecretId" />
          </el-form-item>
          <el-form-item label="Secret Key" prop="tencentCos.secretKey">
            <el-input
              v-model="form.tencentCos.secretKey"
              type="password"
              show-password
              placeholder="输入 SecretKey"
            />
          </el-form-item>
          <el-form-item label="Bucket" prop="tencentCos.bucket">
            <el-input v-model="form.tencentCos.bucket" placeholder="例如：bucket-1234567890" />
          </el-form-item>
          <el-form-item label="Region" prop="tencentCos.region">
            <el-input v-model="form.tencentCos.region" placeholder="例如：ap-guangzhou" />
          </el-form-item>
          <el-form-item label="自定义域名">
            <el-input v-model="form.tencentCos.customDomain" placeholder="可选" />
          </el-form-item>
          <el-form-item label="路径前缀">
            <el-input v-model="form.tencentCos.pathPrefix" placeholder="可选" />
          </el-form-item>
        </template>

        <!-- 七牛云配置 -->
        <template v-else-if="form.provider === 'qiniu'">
          <el-form-item label="Access Key" prop="qiniu.accessKey">
            <el-input v-model="form.qiniu.accessKey" placeholder="输入 AccessKey" />
          </el-form-item>
          <el-form-item label="Secret Key" prop="qiniu.secretKey">
            <el-input
              v-model="form.qiniu.secretKey"
              type="password"
              show-password
              placeholder="输入 SecretKey"
            />
          </el-form-item>
          <el-form-item label="Bucket" prop="qiniu.bucket">
            <el-input v-model="form.qiniu.bucket" placeholder="输入 Bucket 名称" />
          </el-form-item>
          <el-form-item label="访问域名" prop="qiniu.domain">
            <el-input v-model="form.qiniu.domain" placeholder="必填，例如：cdn.example.com" />
          </el-form-item>
          <el-form-item label="存储区域">
            <el-select v-model="form.qiniu.region" placeholder="选择存储区域" style="width: 100%">
              <el-option label="华东" value="z0" />
              <el-option label="华北" value="z1" />
              <el-option label="华南" value="z2" />
              <el-option label="北美" value="na0" />
              <el-option label="东南亚" value="as0" />
            </el-select>
          </el-form-item>
          <el-form-item label="使用 HTTPS">
            <el-switch v-model="form.qiniu.useHttps" />
          </el-form-item>
          <el-form-item label="路径前缀">
            <el-input v-model="form.qiniu.pathPrefix" placeholder="可选" />
          </el-form-item>
        </template>

        <!-- S3 兼容存储配置 -->
        <template v-else-if="form.provider === 's3'">
          <el-form-item label="Access Key ID" prop="s3.accessKeyId">
            <el-input v-model="form.s3.accessKeyId" placeholder="输入 Access Key ID" />
          </el-form-item>
          <el-form-item label="Secret Access Key" prop="s3.secretAccessKey">
            <el-input
              v-model="form.s3.secretAccessKey"
              type="password"
              show-password
              placeholder="输入 Secret Access Key"
            />
          </el-form-item>
          <el-form-item label="Bucket" prop="s3.bucket">
            <el-input v-model="form.s3.bucket" placeholder="输入 Bucket 名称" />
          </el-form-item>
          <el-form-item label="Region" prop="s3.region">
            <el-input v-model="form.s3.region" placeholder="例如：us-east-1" />
          </el-form-item>
          <el-form-item label="Endpoint" prop="s3.endpoint">
            <el-input v-model="form.s3.endpoint" placeholder="例如：https://s3.amazonaws.com" />
          </el-form-item>
          <el-form-item label="自定义域名">
            <el-input v-model="form.s3.customDomain" placeholder="可选" />
          </el-form-item>
          <el-form-item label="路径前缀">
            <el-input v-model="form.s3.pathPrefix" placeholder="可选" />
          </el-form-item>
          <el-form-item label="Path Style">
            <el-switch v-model="form.s3.forcePathStyle" />
            <span class="form-hint">MinIO 等需要开启此选项</span>
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="info" :loading="testing" @click="testConnectionBeforeSave">
          <el-icon v-if="!testing"><Connection /></el-icon>
          测试连接
        </el-button>
        <el-button type="primary" :loading="saving" @click="saveConfig">
          {{ isEdit ? '保存' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Connection, Cloudy } from '@element-plus/icons-vue'
import {
  getCloudStorageConfigs,
  getCloudStorageConfig,
  createCloudStorageConfig,
  updateCloudStorageConfig,
  deleteCloudStorageConfig,
  testCloudStorageConnection,
  testCloudStorageConnectionDirect,
  STORAGE_PROVIDERS
} from '@/api/cloudStorage'

const emit = defineEmits(['update'])

// 数据
const configs = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const testing = ref(false)
const formRef = ref(null)

const providers = STORAGE_PROVIDERS

// 表单
const getDefaultForm = () => ({
  name: '',
  provider: 'aliyun_oss',
  isDefault: false,
  enabled: true,
  aliyunOss: {
    accessKeyId: '',
    accessKeySecret: '',
    bucket: '',
    region: '',
    customDomain: '',
    pathPrefix: '',
    hasSecret: false
  },
  tencentCos: {
    secretId: '',
    secretKey: '',
    bucket: '',
    region: '',
    customDomain: '',
    pathPrefix: '',
    hasSecret: false
  },
  qiniu: {
    accessKey: '',
    secretKey: '',
    bucket: '',
    domain: '',
    region: 'z0',
    pathPrefix: '',
    useHttps: true,
    hasSecret: false
  },
  s3: {
    accessKeyId: '',
    secretAccessKey: '',
    bucket: '',
    region: '',
    endpoint: '',
    customDomain: '',
    pathPrefix: '',
    forcePathStyle: false,
    hasSecret: false
  }
})

const form = reactive(getDefaultForm())

// 验证规则
const rules = {
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  provider: [{ required: true, message: '请选择存储服务商', trigger: 'change' }],
  'aliyunOss.accessKeyId': [{ required: true, message: '请输入 Access Key ID', trigger: 'blur' }],
  'aliyunOss.bucket': [{ required: true, message: '请输入 Bucket', trigger: 'blur' }],
  'aliyunOss.region': [{ required: true, message: '请输入 Region', trigger: 'blur' }],
  'tencentCos.secretId': [{ required: true, message: '请输入 Secret ID', trigger: 'blur' }],
  'tencentCos.bucket': [{ required: true, message: '请输入 Bucket', trigger: 'blur' }],
  'tencentCos.region': [{ required: true, message: '请输入 Region', trigger: 'blur' }],
  'qiniu.accessKey': [{ required: true, message: '请输入 Access Key', trigger: 'blur' }],
  'qiniu.bucket': [{ required: true, message: '请输入 Bucket', trigger: 'blur' }],
  'qiniu.domain': [{ required: true, message: '请输入访问域名', trigger: 'blur' }],
  's3.accessKeyId': [{ required: true, message: '请输入 Access Key ID', trigger: 'blur' }],
  's3.bucket': [{ required: true, message: '请输入 Bucket', trigger: 'blur' }],
  's3.region': [{ required: true, message: '请输入 Region', trigger: 'blur' }],
  's3.endpoint': [{ required: true, message: '请输入 Endpoint', trigger: 'blur' }]
}

// 获取配置列表
const fetchConfigs = async () => {
  loading.value = true
  try {
    const res = await getCloudStorageConfigs()
    if (res.success) {
      configs.value = res.data || []
      emit('update', configs.value)
    }
  } finally {
    loading.value = false
  }
}

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false
  Object.assign(form, getDefaultForm())
  dialogVisible.value = true
}

// 编辑配置
const editConfig = async (config) => {
  isEdit.value = true
  const defaultForm = getDefaultForm()

  // 调用 API 获取包含完整密钥的配置
  try {
    const res = await getCloudStorageConfig(config.id)
    if (!res.success) {
      ElMessage.error('获取配置详情失败')
      return
    }
    const fullConfig = res.data

    Object.assign(form, {
      ...defaultForm,
      id: fullConfig.id,
      name: fullConfig.name,
      provider: fullConfig.provider,
      isDefault: fullConfig.isDefault,
      enabled: fullConfig.enabled
    })

    // 根据提供商复制配置（包含真实密钥）
    if (fullConfig.aliyunOss) {
      Object.assign(form.aliyunOss, fullConfig.aliyunOss)
    }
    if (fullConfig.tencentCos) {
      Object.assign(form.tencentCos, fullConfig.tencentCos)
    }
    if (fullConfig.qiniu) {
      Object.assign(form.qiniu, fullConfig.qiniu)
    }
    if (fullConfig.s3) {
      Object.assign(form.s3, fullConfig.s3)
    }

    dialogVisible.value = true
  } catch (err) {
    ElMessage.error('获取配置详情失败')
  }
}

// 保存配置
const saveConfig = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  saving.value = true
  try {
    const data = {
      name: form.name,
      provider: form.provider,
      isDefault: form.isDefault,
      enabled: form.enabled
    }

    // 根据提供商添加配置
    switch (form.provider) {
      case 'aliyun_oss':
        data.aliyunOss = { ...form.aliyunOss }
        break
      case 'tencent_cos':
        data.tencentCos = { ...form.tencentCos }
        break
      case 'qiniu':
        data.qiniu = { ...form.qiniu }
        break
      case 's3':
        data.s3 = { ...form.s3 }
        break
    }

    let res
    if (isEdit.value) {
      res = await updateCloudStorageConfig(form.id, data)
    } else {
      res = await createCloudStorageConfig(data)
    }

    if (res.success) {
      ElMessage.success(isEdit.value ? '配置更新成功' : '配置创建成功')
      dialogVisible.value = false
      fetchConfigs()
    } else {
      ElMessage.error(res.error || '操作失败')
    }
  } finally {
    saving.value = false
  }
}

// 删除配置
const deleteConfig = async (config) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除配置「${config.name}」吗？`,
      '删除确认',
      { type: 'warning' }
    )

    const res = await deleteCloudStorageConfig(config.id)
    if (res.success) {
      ElMessage.success('配置删除成功')
      fetchConfigs()
    } else {
      ElMessage.error(res.error || '删除失败')
    }
  } catch {
    // 用户取消
  }
}

// 测试连接（已保存的配置）
const testConnection = async (config) => {
  const loading = ElMessage({
    message: '正在测试连接...',
    type: 'info',
    duration: 0
  })

  try {
    const res = await testCloudStorageConnection(config.id)
    loading.close()

    if (res.success && res.data) {
      const result = res.data
      if (result.success) {
        ElMessage.success(`连接成功 (${result.latency}ms)`)
      } else {
        ElMessage.error(`连接失败: ${result.message}`)
      }
    }
  } catch (err) {
    loading.close()
    ElMessage.error('测试请求失败')
  }
}

// 测试连接（保存前，使用表单数据）
const testConnectionBeforeSave = async () => {
  // 先验证必填字段
  try {
    await formRef.value.validate()
  } catch {
    ElMessage.warning('请先填写完整配置信息')
    return
  }

  testing.value = true
  const loadingMsg = ElMessage({
    message: '正在测试连接...',
    type: 'info',
    duration: 0
  })

  try {
    const data = {
      name: form.name,
      provider: form.provider
    }

    // 根据提供商添加配置
    switch (form.provider) {
      case 'aliyun_oss':
        data.aliyunOss = { ...form.aliyunOss }
        break
      case 'tencent_cos':
        data.tencentCos = { ...form.tencentCos }
        break
      case 'qiniu':
        data.qiniu = { ...form.qiniu }
        break
      case 's3':
        data.s3 = { ...form.s3 }
        break
    }

    const res = await testCloudStorageConnectionDirect(data)
    loadingMsg.close()

    if (res.success && res.data) {
      const result = res.data
      if (result.success) {
        ElMessage.success(`连接成功 (${result.latency}ms)`)
      } else {
        ElMessage.error(`连接失败: ${result.message}`)
      }
    } else {
      ElMessage.error(res.error || '测试失败')
    }
  } catch (err) {
    loadingMsg.close()
    ElMessage.error('测试请求失败')
  } finally {
    testing.value = false
  }
}

// 获取提供商图标
const getProviderIcon = (provider) => {
  // 统一使用 Cloudy 图标
  return Cloudy
}

// 获取提供商颜色
const getProviderColor = (provider) => {
  const colors = {
    'aliyun_oss': '#FF6A00',   // 阿里橙
    'tencent_cos': '#00A4FF',  // 腾讯蓝
    'qiniu': '#07BEB8',        // 七牛绿
    's3': '#FF9900'            // AWS 橙
  }
  return colors[provider] || '#409eff'
}

// 获取提供商标签
const getProviderLabel = (provider) => {
  const p = STORAGE_PROVIDERS.find(item => item.value === provider)
  return p ? p.label : provider
}

// 初始化
fetchConfigs()

// 暴露方法供父组件调用
defineExpose({
  fetchConfigs
})
</script>

<style scoped lang="scss">
.storage-config {
  padding: 16px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.config-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.is-default {
    border-color: #67c23a;
  }

  &.is-disabled {
    opacity: 0.6;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.provider-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.provider-icon {
  // 颜色由 JS 动态设置
}

.provider-text {
  display: flex;
  flex-direction: column;
}

.config-name {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.provider-name {
  font-size: 12px;
  color: #909399;
}

.card-badges {
  display: flex;
  gap: 4px;
}

.card-body {
  padding: 16px;
}

.config-info p {
  margin: 0 0 8px;
  font-size: 13px;
  color: #606266;

  &:last-child {
    margin-bottom: 0;
  }

  .label {
    color: #909399;
    margin-right: 8px;
  }
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
}

.provider-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .provider-desc {
    font-size: 12px;
    color: #909399;
  }
}

.form-hint {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
