/**
 * 主题配置 Schema 定义
 * 定义各主题的配置结构，用于表单化配置编辑器
 */

import {
  HomeFilled,
  UserFilled,
  Coin,
  ChatDotRound,
  Lock,
  FolderOpened,
  DocumentCopy,
  Bottom,
  Picture,
  Setting,
  Search,
  Trophy,
  Link,
  Promotion,
  Share,
  Guide,
  Notification,
  DataAnalysis,
  ChatLineSquare,
  Loading
} from '@element-plus/icons-vue'

// ============================================
// 通用字段类型定义
// ============================================

const fieldTypes = {
  input: 'input',           // 单行文本输入
  textarea: 'textarea',     // 多行文本输入
  number: 'number',         // 数字输入
  switch: 'switch',         // 开关
  select: 'select',         // 下拉选择
  color: 'color',           // 颜色选择器
  array: 'array',           // 数组（社交链接等）
  object: 'object',         // 嵌套对象
  image: 'image'            // 图片URL输入（带预览）
}

// ============================================
// Hugo Teek 主题配置 Schema
// ============================================

export const hugoTeekSchema = {
  // params.toml 配置
  params: {
    fileName: 'params.toml',
    label: '主题参数',
    description: '主题的核心UI配置（布局、首页、博主卡片、打赏、微信等）',
    sections: [
      // 首页配置
      {
        id: 'homepage',
        title: '首页配置',
        icon: HomeFilled,
        description: '控制首页文章列表的分页和显示设置',
        fields: [
          {
            key: 'layoutMode',
            label: '布局模式',
            type: fieldTypes.select,
            options: [
              { label: '双栏宽度可调', value: 'bothWidthAdjustable' },
              { label: '固定宽度', value: 'fixed' },
              { label: '全宽', value: 'full' }
            ],
            default: 'bothWidthAdjustable',
            hint: '选择首页布局模式'
          },
          {
            key: 'homepage.paginatePCSize',
            label: 'PC端每页文章数',
            type: fieldTypes.number,
            default: 15,
            min: 5,
            max: 50,
            hint: 'PC端首页每页显示的文章数量（性能优化建议15-20）'
          },
          {
            key: 'homepage.mobileInitialShow',
            label: '移动端初始显示数',
            type: fieldTypes.number,
            default: 5,
            min: 3,
            max: 20,
            hint: '移动端首次加载显示的文章数量'
          },
          {
            key: 'homepage.mobileLoadMoreStep',
            label: '移动端每次加载数',
            type: fieldTypes.number,
            default: 10,
            min: 5,
            max: 30,
            hint: '移动端点击"加载更多"时增加的文章数量'
          }
        ]
      },

      // 博主卡片配置
      {
        id: 'blogger',
        title: '博主卡片',
        icon: UserFilled,
        description: '侧边栏博主信息卡片的配置',
        fields: [
          {
            key: 'blogger.avatar',
            label: '头像URL',
            type: fieldTypes.image,
            hint: '博主头像图片地址，建议使用正方形图片'
          },
          {
            key: 'blogger.backgroundImage',
            label: '背景图片',
            type: fieldTypes.image,
            hint: '博主卡片的背景图片（可选）'
          },
          {
            key: 'blogger.circleBgImg',
            label: '圆形背景图',
            type: fieldTypes.image,
            hint: '头像周围的圆形背景图片'
          },
          {
            key: 'blogger.circleBgMask',
            label: '圆形背景遮罩',
            type: fieldTypes.switch,
            default: false,
            hint: '是否启用圆形背景遮罩效果'
          },
          {
            key: 'blogger.name',
            label: '博主名称',
            type: fieldTypes.input,
            hint: '显示在博主卡片中的名称'
          },
          {
            key: 'blogger.shape',
            label: '头像形状',
            type: fieldTypes.select,
            options: [
              { label: '圆形旋转', value: 'circle-rotate' },
              { label: '圆形', value: 'circle' },
              { label: '方形', value: 'square' }
            ],
            default: 'circle-rotate',
            hint: '头像显示的形状样式'
          },
          {
            key: 'blogger.slogan',
            label: '个性签名',
            type: fieldTypes.input,
            hint: '显示在名称下方的个性签名'
          },
          {
            key: 'blogger.status.icon',
            label: '状态图标',
            type: fieldTypes.input,
            default: '😪',
            hint: '状态表情图标'
          },
          {
            key: 'blogger.status.size',
            label: '状态图标大小',
            type: fieldTypes.number,
            default: 18,
            min: 12,
            max: 32,
            hint: '状态图标的大小（像素）'
          },
          {
            key: 'blogger.status.title',
            label: '状态文字',
            type: fieldTypes.input,
            default: '困',
            hint: '状态显示的文字'
          },
          {
            key: 'blogger.social',
            label: '社交链接',
            type: fieldTypes.array,
            itemFields: [
              { key: 'name', label: '名称', type: fieldTypes.input, placeholder: 'GitHub' },
              { key: 'icon', label: '图标', type: fieldTypes.input, placeholder: 'github' },
              { key: 'url', label: '链接', type: fieldTypes.input, placeholder: 'https://github.com/xxx' }
            ],
            hint: '显示在博主卡片中的社交链接'
          }
        ]
      },

      // 打赏配置
      {
        id: 'appreciation',
        title: '打赏配置',
        icon: Coin,
        description: '文章打赏功能的二维码设置',
        fields: [
          {
            key: 'appreciation.enabled',
            label: '启用打赏',
            type: fieldTypes.switch,
            default: true,
            hint: '是否在文章页面显示打赏按钮'
          },
          {
            key: 'appreciation.alipayQR',
            label: '支付宝收款码',
            type: fieldTypes.image,
            hint: '支付宝收款码图片URL'
          },
          {
            key: 'appreciation.wechatQR',
            label: '微信收款码',
            type: fieldTypes.image,
            hint: '微信收款码图片URL'
          }
        ]
      },

      // 微信公众号配置
      {
        id: 'wechatOfficial',
        title: '微信公众号',
        icon: ChatDotRound,
        description: '侧边栏公众号卡片配置',
        fields: [
          {
            key: 'wechatOfficial.enabled',
            label: '启用公众号卡片',
            type: fieldTypes.switch,
            default: true,
            hint: '是否在侧边栏显示公众号卡片'
          },
          {
            key: 'wechatOfficial.name',
            label: '公众号名称',
            type: fieldTypes.input,
            hint: '微信公众号名称'
          },
          {
            key: 'wechatOfficial.description',
            label: '公众号描述',
            type: fieldTypes.input,
            hint: '公众号简介描述'
          },
          {
            key: 'wechatOfficial.qrcodeImage',
            label: '二维码图片',
            type: fieldTypes.image,
            hint: '公众号二维码图片URL'
          },
          {
            key: 'wechatOfficial.qrcodeUrl',
            label: '扫码关注链接',
            type: fieldTypes.input,
            hint: '点击"扫码关注"按钮跳转的URL'
          }
        ]
      },

      // 公众号解锁配置
      {
        id: 'wechatUnlock',
        title: '公众号解锁',
        icon: Lock,
        description: '通过公众号解锁隐藏内容的功能配置',
        fields: [
          {
            key: 'wechatUnlock.enabled',
            label: '启用解锁功能',
            type: fieldTypes.switch,
            default: true,
            hint: '是否启用公众号解锁文章内容功能'
          },
          {
            key: 'wechatUnlock.salt',
            label: '解锁盐值',
            type: fieldTypes.input,
            default: 'hugo-teek-unlock-2025',
            hint: '解锁码生成的盐值（请修改为自己的随机字符串）'
          },
          {
            key: 'wechatUnlock.defaultQRCode',
            label: '默认二维码',
            type: fieldTypes.image,
            hint: '默认显示的公众号二维码'
          },
          {
            key: 'wechatUnlock.defaultKeyword',
            label: '默认关键字',
            type: fieldTypes.input,
            default: '解锁',
            hint: '获取解锁码的关键字提示'
          },
          {
            key: 'wechatUnlock.maxAttempts',
            label: '最大尝试次数',
            type: fieldTypes.number,
            default: 5,
            min: 3,
            max: 10,
            hint: '验证失败后锁定的最大尝试次数'
          },
          {
            key: 'wechatUnlock.lockTime',
            label: '锁定时间（秒）',
            type: fieldTypes.number,
            default: 3600,
            min: 300,
            max: 86400,
            hint: '验证失败达到上限后的锁定时间（秒）'
          },
          {
            key: 'wechatUnlock.verifyDelay',
            label: '验证延迟（毫秒）',
            type: fieldTypes.number,
            default: 500,
            min: 100,
            max: 2000,
            hint: '验证请求的延迟时间，防止暴力破解'
          }
        ]
      },

      // 分类配置
      {
        id: 'category',
        title: '分类配置',
        icon: FolderOpened,
        description: '分类页面的显示设置',
        fields: [
          {
            key: 'category.enabled',
            label: '启用分类',
            type: fieldTypes.switch,
            default: true
          },
          {
            key: 'category.autoPage',
            label: '自动分页',
            type: fieldTypes.switch,
            default: false
          },
          {
            key: 'category.limit',
            label: '每页数量',
            type: fieldTypes.number,
            default: 8,
            min: 5,
            max: 50
          },
          {
            key: 'category.pageSpeed',
            label: '翻页速度（毫秒）',
            type: fieldTypes.number,
            default: 4000,
            min: 1000,
            max: 10000
          }
        ]
      },

      // 代码块配置
      {
        id: 'codeBlock',
        title: '代码块',
        icon: DocumentCopy,
        description: '文章代码块的显示设置',
        fields: [
          {
            key: 'codeBlock.autoCollapse',
            label: '自动折叠',
            type: fieldTypes.switch,
            default: true,
            hint: '代码块是否默认折叠'
          },
          {
            key: 'codeBlock.collapseHeight',
            label: '折叠高度（像素）',
            type: fieldTypes.number,
            default: 400,
            min: 200,
            max: 800,
            hint: '超过此高度时自动折叠'
          },
          {
            key: 'codeBlock.copyButton',
            label: '显示复制按钮',
            type: fieldTypes.switch,
            default: true
          }
        ]
      },

      // 页脚配置
      {
        id: 'footer',
        title: '页脚配置',
        icon: Bottom,
        description: '页脚显示内容控制',
        fields: [
          {
            key: 'footer.show_services',
            label: '显示服务信息',
            type: fieldTypes.switch,
            default: true,
            hint: '是否在页脚显示服务信息'
          },
          {
            key: 'footer.show_theme_info',
            label: '显示主题信息',
            type: fieldTypes.switch,
            default: true,
            hint: '是否在页脚显示主题信息'
          }
        ]
      },

      // 首页背景配置
      {
        id: 'heroBg',
        title: '首页背景',
        icon: Picture,
        description: '首页顶部背景图片的轮播设置',
        fields: [
          {
            key: 'heroBg.enabled',
            label: '启用动态背景',
            type: fieldTypes.switch,
            default: true
          },
          {
            key: 'heroBg.autoPlay',
            label: '自动轮播',
            type: fieldTypes.switch,
            default: true
          },
          {
            key: 'heroBg.interval',
            label: '轮播间隔（毫秒）',
            type: fieldTypes.number,
            default: 8000,
            min: 3000,
            max: 30000,
            hint: '背景图片切换的时间间隔（建议8000-12000毫秒）'
          },
          {
            key: 'heroBg.mode',
            label: '背景模式',
            type: fieldTypes.select,
            options: [
              { label: '混合模式（静态+API）', value: 'hybrid' },
              { label: '仅静态', value: 'static' },
              { label: '仅API', value: 'api' }
            ],
            default: 'static'
          },
          {
            key: 'heroBg.useStaticFirst',
            label: '优先使用静态列表',
            type: fieldTypes.switch,
            default: true,
            hint: '性能优化选项，优先使用静态图片列表'
          },
          {
            key: 'heroBg.apiUrl',
            label: '图片API地址',
            type: fieldTypes.input,
            default: 'https://imgapi.xxdevops.cn/api/images',
            hint: '动态获取图片的API地址'
          },
          {
            key: 'heroBg.apiEnabled',
            label: '启用API获取',
            type: fieldTypes.switch,
            default: false,
            hint: '是否启用API动态获取图片'
          },
          {
            key: 'heroBg.apiCacheDuration',
            label: 'API缓存时长（秒）',
            type: fieldTypes.number,
            default: 3600,
            min: 600,
            max: 86400,
            hint: 'API返回结果的缓存时间'
          }
        ]
      },

      // 副标题动画配置
      {
        id: 'heroSubtitle',
        title: '副标题动画',
        icon: Notification,
        description: '首页副标题打字机动画效果设置',
        fields: [
          {
            key: 'heroSubtitle.typeSpeed',
            label: '打字速度（毫秒）',
            type: fieldTypes.number,
            default: 90,
            min: 30,
            max: 300
          },
          {
            key: 'heroSubtitle.deleteSpeed',
            label: '删除速度（毫秒）',
            type: fieldTypes.number,
            default: 45,
            min: 20,
            max: 200
          },
          {
            key: 'heroSubtitle.hold',
            label: '停留时间（毫秒）',
            type: fieldTypes.number,
            default: 1800,
            min: 500,
            max: 5000
          },
          {
            key: 'heroSubtitle.nextDelay',
            label: '下一个延迟（毫秒）',
            type: fieldTypes.number,
            default: 600,
            min: 200,
            max: 2000
          },
          {
            key: 'heroSubtitle.shuffle',
            label: '随机顺序',
            type: fieldTypes.switch,
            default: false
          }
        ]
      },

      // 图片配置
      {
        id: 'image',
        title: '图片配置',
        icon: Picture,
        description: '图片加载和缩略图设置',
        fields: [
          {
            key: 'image.lazyLoading',
            label: '启用懒加载',
            type: fieldTypes.switch,
            default: true,
            hint: '图片进入视口时才加载，提升首屏性能'
          },
          {
            key: 'imageThumbnail.enabled',
            label: '启用缩略图',
            type: fieldTypes.switch,
            default: true,
            hint: '使用CDN参数生成缩略图'
          },
          {
            key: 'imageThumbnail.articleCard.width',
            label: '卡片缩略图宽度',
            type: fieldTypes.number,
            default: 1200,
            min: 600,
            max: 2000
          },
          {
            key: 'imageThumbnail.articleCard.height',
            label: '卡片缩略图高度',
            type: fieldTypes.number,
            default: 690,
            min: 400,
            max: 1200
          },
          {
            key: 'imageThumbnail.articleCard.quality',
            label: '图片质量',
            type: fieldTypes.number,
            default: 80,
            min: 50,
            max: 100
          },
          {
            key: 'imageThumbnail.articleCard.format',
            label: '图片格式',
            type: fieldTypes.select,
            options: [
              { label: 'WebP', value: 'webp' },
              { label: 'JPEG', value: 'jpg' },
              { label: 'PNG', value: 'png' }
            ],
            default: 'webp'
          }
        ]
      },

      // 布局宽度配置
      {
        id: 'layoutWidths',
        title: '布局宽度',
        icon: Setting,
        description: '不同页面类型的容器宽度设置',
        fields: [
          {
            key: 'layoutWidths.doc',
            label: '文档页面宽度',
            type: fieldTypes.input,
            default: '960px',
            hint: '文档类型页面的最大宽度'
          },
          {
            key: 'layoutWidths.full',
            label: '全宽页面宽度',
            type: fieldTypes.input,
            default: '1440px',
            hint: '全宽页面的最大宽度'
          },
          {
            key: 'layoutWidths.page',
            label: '普通页面宽度',
            type: fieldTypes.input,
            default: '1280px',
            hint: '普通页面的最大宽度'
          }
        ]
      },

      // 滚动进度条
      {
        id: 'scrollProgress',
        title: '滚动进度条',
        icon: Guide,
        fields: [
          {
            key: 'scrollProgress.enabled',
            label: '启用滚动进度条',
            type: fieldTypes.switch,
            default: true,
            hint: '在页面顶部显示阅读进度条'
          }
        ]
      },

      // 搜索配置
      {
        id: 'search',
        title: '搜索配置',
        icon: Search,
        fields: [
          {
            key: 'search.enabled',
            label: '启用搜索',
            type: fieldTypes.switch,
            default: true
          },
          {
            key: 'search.provider',
            label: '搜索提供商',
            type: fieldTypes.select,
            options: [
              { label: 'FlexSearch', value: 'flexsearch' },
              { label: 'Algolia', value: 'algolia' }
            ],
            default: 'flexsearch'
          }
        ]
      },

      // 赞助商配置
      {
        id: 'sponsors',
        title: '赞助商',
        icon: Trophy,
        fields: [
          {
            key: 'sponsors.enabled',
            label: '启用赞助商卡片',
            type: fieldTypes.switch,
            default: true
          },
          {
            key: 'sponsors.limit',
            label: '显示数量',
            type: fieldTypes.number,
            default: 5,
            min: 1,
            max: 20
          },
          {
            key: 'sponsors.interval',
            label: '轮播间隔（毫秒）',
            type: fieldTypes.number,
            default: 5000,
            min: 2000,
            max: 10000
          }
        ]
      },

      // 友链配置
      {
        id: 'friendLink',
        title: '友链配置',
        icon: Link,
        description: '首页友链卡片的显示设置',
        fields: [
          {
            key: 'friendLink.limit',
            label: '显示数量',
            type: fieldTypes.number,
            default: 5,
            min: 3,
            max: 20
          },
          {
            key: 'friendLink.interval',
            label: '轮播间隔（毫秒）',
            type: fieldTypes.number,
            default: 5000,
            min: 2000,
            max: 10000
          },
          {
            key: 'friendLink.groups',
            label: '显示分组',
            type: fieldTypes.array,
            itemType: 'text',
            hint: '指定显示哪些分组的友链，留空表示显示所有'
          }
        ]
      },

      // 友链独立页配置
      {
        id: 'friendPage',
        title: '友链独立页',
        icon: Link,
        fields: [
          {
            key: 'friendPage.smallTitle',
            label: '副标题',
            type: fieldTypes.input,
            default: '与各位博主一起成长进步'
          },
          {
            key: 'friendPage.bannerButtonGroup',
            label: '显示按钮组',
            type: fieldTypes.switch,
            default: true
          }
        ]
      },

      // 社交链接配置
      {
        id: 'socialLinks',
        title: '社交链接',
        icon: Share,
        description: '页脚显示的社交媒体链接',
        fields: [
          {
            key: 'socialLinks',
            label: '链接列表',
            type: fieldTypes.array,
            itemFields: [
              { key: 'icon', label: '图标', type: fieldTypes.input, placeholder: 'github' },
              { key: 'link', label: '链接', type: fieldTypes.input, placeholder: 'https://...' },
              { key: 'title', label: '标题', type: fieldTypes.input, placeholder: 'GitHub' }
            ],
            hint: '在页脚显示的社交媒体链接'
          }
        ]
      },

      // 标题切换配置
      {
        id: 'titleChange',
        title: '标题切换',
        icon: Notification,
        fields: [
          {
            key: 'titleChange.enabled',
            label: '启用标题切换',
            type: fieldTypes.switch,
            default: true,
            hint: '页面失去焦点时改变标题'
          },
          {
            key: 'titleChange.hidden',
            label: '隐藏时标题',
            type: fieldTypes.input,
            default: 'w(ﾟДﾟ)w 不要走！再看看嘛！'
          },
          {
            key: 'titleChange.return',
            label: '返回时标题',
            type: fieldTypes.input,
            default: '♪(^∇^*)欢迎回来！'
          },
          {
            key: 'titleChange.resetDelay',
            label: '重置延迟（毫秒）',
            type: fieldTypes.number,
            default: 2000,
            min: 500,
            max: 5000
          }
        ]
      },

      // 页面加载动画
      {
        id: 'pageLoading',
        title: '页面加载动画',
        icon: Loading,
        fields: [
          {
            key: 'pageLoading.enabled',
            label: '启用加载动画',
            type: fieldTypes.switch,
            default: false
          },
          {
            key: 'pageLoading.text',
            label: '加载文字',
            type: fieldTypes.input,
            default: 'hugo-teek is loading...'
          }
        ]
      },

      // TeekTools 微信解锁配置
      {
        id: 'teekToolsWechatUnlock',
        title: 'TeekTools 微信解锁',
        icon: Lock,
        fields: [
          {
            key: 'teekTools.wechatUnlock.enabled',
            label: '启用内容分离',
            type: fieldTypes.switch,
            default: true
          },
          {
            key: 'teekTools.wechatUnlock.outputFilename',
            label: '输出文件名',
            type: fieldTypes.input,
            default: 'content.json'
          },
          {
            key: 'teekTools.wechatUnlock.removeLockedContent',
            label: '移除锁定内容',
            type: fieldTypes.switch,
            default: true,
            hint: '构建时是否从原始内容中移除被锁定的部分'
          }
        ]
      }
    ]
  },

  // services.toml 配置
  services: {
    fileName: 'services.toml',
    label: '外部服务',
    description: '外部服务配置（统计分析、评论系统等）',
    sections: [
      // 统计分析
      {
        id: 'analytics',
        title: '统计分析',
        icon: DataAnalysis,
        description: '网站访问统计和分析服务配置',
        fields: [
          // 不蒜子
          {
            key: 'analytics.busuanzi.enabled',
            label: '启用不蒜子统计',
            type: fieldTypes.switch,
            default: true
          },
          {
            key: 'analytics.busuanzi.url',
            label: '不蒜子脚本URL',
            type: fieldTypes.input,
            default: 'https://busuanzi-eo.xxdevops.cn/busuanzi.eo.js'
          },
          {
            key: 'analytics.busuanzi.prefix',
            label: '前缀',
            type: fieldTypes.input,
            default: 'busuanzi'
          },
          {
            key: 'analytics.busuanzi.style',
            label: '数字格式',
            type: fieldTypes.select,
            options: [
              { label: '千分位（1,234）', value: 'comma' },
              { label: '纯数字（1234）', value: 'none' }
            ],
            default: 'comma'
          },
          {
            key: 'analytics.busuanzi.page_pv',
            label: '显示页面浏览量',
            type: fieldTypes.switch,
            default: true
          },
          {
            key: 'analytics.busuanzi.site_pv',
            label: '显示站点总浏览量',
            type: fieldTypes.switch,
            default: true
          },
          {
            key: 'analytics.busuanzi.site_uv',
            label: '显示独立访客数',
            type: fieldTypes.switch,
            default: true
          },
          {
            key: 'analytics.busuanzi.api',
            label: 'API地址',
            type: fieldTypes.input,
            default: 'https://busuanzi-eo.xxdevops.cn/api/count'
          },
          // Umami
          {
            key: 'analytics.umami.enabled',
            label: '启用Umami分析',
            type: fieldTypes.switch,
            default: true
          },
          {
            key: 'analytics.umami.url',
            label: 'Umami服务器地址',
            type: fieldTypes.input,
            default: 'https://umami.xxdevops.cn'
          },
          {
            key: 'analytics.umami.websiteId',
            label: '网站ID',
            type: fieldTypes.input,
            default: 'a50c01fa-f866-488d-a328-3ac73aa639f7'
          }
        ]
      },

      // 评论系统
      {
        id: 'comment',
        title: '评论系统',
        icon: ChatLineSquare,
        description: '文章评论功能配置',
        fields: [
          {
            key: 'comment.enabled',
            label: '启用评论系统',
            type: fieldTypes.switch,
            default: true
          },
          {
            key: 'comment.provider',
            label: '评论提供商',
            type: fieldTypes.select,
            options: [
              { label: 'Twikoo', value: 'twikoo' },
              { label: 'Waline', value: 'waline' },
              { label: 'Giscus', value: 'giscus' }
            ],
            default: 'twikoo'
          },
          {
            key: 'comment.envId',
            label: '环境ID/服务器地址',
            type: fieldTypes.input,
            default: 'https://twikoo.xxdevops.cn/'
          },
          {
            key: 'comment.version',
            label: '版本号',
            type: fieldTypes.input,
            default: '1.6.41'
          },
          {
            key: 'comment.hideAdmin',
            label: '隐藏管理员标识',
            type: fieldTypes.switch,
            default: false
          }
        ]
      },

      // 页脚统计组件
      {
        id: 'footerAnalytics',
        title: '页脚统计',
        icon: DataAnalysis,
        description: '页脚统计组件配置',
        fields: [
          {
            key: 'footer.analytics.la_widget_enabled',
            label: '启用51.LA统计',
            type: fieldTypes.switch,
            default: true
          },
          {
            key: 'footer.analytics.la_widget_id',
            label: 'LA Widget ID',
            type: fieldTypes.input,
            default: '3LmZHLhDZIDpMaT0'
          },
          {
            key: 'footer.analytics.la_widget_theme',
            label: '主题颜色',
            type: fieldTypes.input,
            default: '#1690FF,#333333,#999999,#007BFF,#FFFFFF,#1690FF,12'
          }
        ]
      }
    ]
  },

  // homepage.toml 配置
  homepage: {
    fileName: 'homepage.toml',
    label: '首页卡片',
    description: '首页侧边栏卡片配置（公告、日历、热门标签、友链等）',
    sections: [
      {
        id: 'homeSidebar',
        title: '首页侧边栏',
        icon: Setting,
        description: '控制首页侧边栏各个卡片的显示',
        fields: [
          {
            key: 'homeSidebar.announcement.enabled',
            label: '显示公告卡片',
            type: fieldTypes.switch,
            default: true,
            hint: '显示站点公告信息'
          },
          {
            key: 'homeSidebar.calendar.enabled',
            label: '显示日历卡片',
            type: fieldTypes.switch,
            default: true,
            hint: '显示文章发布日历热力图'
          },
          {
            key: 'homeSidebar.timeProgress.enabled',
            label: '显示时间进度卡片',
            type: fieldTypes.switch,
            default: true,
            hint: '显示年/月/周/日进度条'
          },
          {
            key: 'homeSidebar.recentComments.enabled',
            label: '显示最近评论卡片',
            type: fieldTypes.switch,
            default: true,
            hint: '显示最新评论列表（依赖评论系统）'
          },
          {
            key: 'homeSidebar.recentComments.pageSize',
            label: '评论每页数量',
            type: fieldTypes.number,
            default: 5,
            min: 3,
            max: 20
          },
          {
            key: 'homeSidebar.recentComments.totalSize',
            label: '评论总获取数量',
            type: fieldTypes.number,
            default: 50,
            min: 20,
            max: 200
          },
          {
            key: 'homeSidebar.featuredPosts.enabled',
            label: '显示精选文章卡片',
            type: fieldTypes.switch,
            default: true,
            hint: '显示标记为精选的文章'
          },
          {
            key: 'homeSidebar.categories.enabled',
            label: '显示分类卡片',
            type: fieldTypes.switch,
            default: true,
            hint: '显示文章分类统计'
          },
          {
            key: 'homeSidebar.hotTags.enabled',
            label: '显示热门标签卡片',
            type: fieldTypes.switch,
            default: true,
            hint: '显示热门标签云'
          },
          {
            key: 'homeSidebar.friendLinks.enabled',
            label: '显示友链卡片',
            type: fieldTypes.switch,
            default: true,
            hint: '显示友情链接'
          },
          {
            key: 'homeSidebar.siteInfo.enabled',
            label: '显示站点统计卡片',
            type: fieldTypes.switch,
            default: true,
            hint: '显示站点统计信息'
          }
        ]
      }
    ]
  },

  // sections.toml 配置
  sections: {
    fileName: 'sections.toml',
    label: 'URL 映射',
    description: 'Section URL 映射配置（中文目录名 → SEO URL）',
    sections: [
      {
        id: 'sectionsMapping',
        title: '目录映射配置',
        icon: FolderOpened,
        description: '配置中文目录名到SEO友好URL的映射',
        fields: [
          {
            key: 'sections',
            label: '映射规则',
            type: fieldTypes.object,
            hint: '定义目录名到URL的映射关系，例如：{"前端开发": "frontend", "后端开发": "backend"}',
            valueType: 'key-value'
          }
        ]
      }
    ]
  },

  // teektools.toml 配置
  teektools: {
    fileName: 'teektools.toml',
    label: '构建工具',
    description: '主题特定的构建工具配置',
    sections: [
      {
        id: 'buildTools',
        title: '构建工具配置',
        icon: Setting,
        description: 'hugo-teek-tools 构建工具的相关设置',
        fields: [
          {
            key: 'build.steps',
            label: '构建步骤',
            type: fieldTypes.array,
            itemType: 'text',
            hint: '定义构建流程的步骤顺序'
          }
        ]
      }
    ]
  }
}

// ============================================
// Hugo Simple 主题配置 Schema
// ============================================

export const hugoSimpleSchema = {
  params: {
    fileName: 'params.toml',
    label: '主题参数',
    description: 'Hugo Simple 主题的核心配置',
    sections: [
      {
        id: 'basic',
        title: '基础配置',
        icon: Setting,
        fields: [
          {
            key: 'author',
            label: '作者',
            type: fieldTypes.input,
            hint: '网站作者名称'
          },
          {
            key: 'description',
            label: '网站描述',
            type: fieldTypes.textarea,
            hint: '网站的简短描述'
          }
        ]
      }
    ]
  }
}

// ============================================
// Schema 导出
// ============================================

export const themeSchemas = {
  'hugo-teek': hugoTeekSchema,
  'hugo-simple': hugoSimpleSchema
}

// 获取主题的 schema
export function getThemeSchema(themeName) {
  return themeSchemas[themeName] || null
}

// 获取主题支持的配置文件列表
export function getThemeConfigFiles(themeName) {
  const schema = getThemeSchema(themeName)
  if (!schema) return []

  return Object.entries(schema).map(([key, config]) => ({
    name: config.fileName,
    key,
    label: config.label,
    description: config.description
  }))
}

// 获取指定配置文件的 sections
export function getConfigSections(themeName, configKey) {
  const schema = getThemeSchema(themeName)
  if (!schema || !schema[configKey]) return []

  return schema[configKey].sections || []
}

// 默认导出
export default themeSchemas
