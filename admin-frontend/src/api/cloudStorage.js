import request from './axios'

// ========== 配置管理 ==========

// 获取配置列表
export const getCloudStorageConfigs = () => request.get('/cloud-storage/configs')

// 获取单个配置
export const getCloudStorageConfig = (id) => request.get(`/cloud-storage/configs/${id}`)

// 创建配置
export const createCloudStorageConfig = (data) => request.post('/cloud-storage/configs', data)

// 更新配置
export const updateCloudStorageConfig = (id, data) => request.put(`/cloud-storage/configs/${id}`, data)

// 删除配置
export const deleteCloudStorageConfig = (id) => request.delete(`/cloud-storage/configs/${id}`)

// 测试连接
export const testCloudStorageConnection = (id) => request.post(`/cloud-storage/configs/${id}/test`)

// 直接测试连接（不需要保存配置）
export const testCloudStorageConnectionDirect = (data) => request.post('/cloud-storage/test', data)

// ========== 文件上传 ==========

// 上传文件
export const uploadToCloudStorage = (formData, onProgress) => {
  return request.post('/cloud-storage/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent)
      }
    }
  })
}

// 批量上传
export const batchUploadToCloudStorage = (formData, onProgress) => {
  return request.post('/cloud-storage/upload/batch', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent)
      }
    }
  })
}

// ========== 上传历史 ==========

// 获取上传历史
export const getCloudStorageHistory = (params) => request.get('/cloud-storage/history', { params })

// 删除历史记录
export const deleteCloudStorageHistory = (id) => request.delete(`/cloud-storage/history/${id}`)

// 清空历史记录
export const clearCloudStorageHistory = () => request.post('/cloud-storage/history/clear')

// ========== 工具函数 ==========

// 云存储提供商列表
export const STORAGE_PROVIDERS = [
  {
    value: 'aliyun_oss',
    label: '阿里云 OSS',
    icon: 'ali-cloud',
    description: '阿里云对象存储服务'
  },
  {
    value: 'tencent_cos',
    label: '腾讯云 COS',
    icon: 'tencent-cloud',
    description: '腾讯云对象存储服务'
  },
  {
    value: 'qiniu',
    label: '七牛云',
    icon: 'qiniu',
    description: '七牛云对象存储'
  },
  {
    value: 's3',
    label: 'S3 兼容存储',
    icon: 'aws',
    description: '支持 MinIO、Cloudflare R2、AWS S3 等'
  }
]

// 获取提供商信息
export const getProviderInfo = (provider) => {
  return STORAGE_PROVIDERS.find(p => p.value === provider) || {
    value: provider,
    label: provider,
    icon: 'cloud',
    description: ''
  }
}

// 格式化文件大小
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生成链接格式
export const generateLinks = (url, filename) => {
  const alt = filename.replace(/\.[^/.]+$/, '') // 移除扩展名作为 alt
  return {
    url: url,
    markdown: `![${alt}](${url})`,
    html: `<img src="${url}" alt="${alt}" />`,
    bbcode: `[img]${url}[/img]`
  }
}
