---
author: 余温Gueen
categories:
    - 前端
coverImg: https://img.xxdevops.cn/blog/svgs/web.svg
date: "2025-10-17T11:00:00+08:00"
description: 全面介绍 Vue 3 Composition API 的使用方法和最佳实践
draft: false
tags:
    - Vue3
    - Composition API
    - 响应式
    - 前端框架
title: Vue 3 组合式 API 完全指南
url: /frontend/hgjfp
---
## 为什么使用组合式 API？

Vue 3 引入的组合式 API (Composition API) 提供了更灵活的代码组织方式。

### 传统选项式 API 的局限

```javascript
export default {
  data() {
    return {
      count: 0,
      message: 'Hello'
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    }
  }
}
```

### 组合式 API 的优势

```javascript
import { ref, computed } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const message = ref('Hello')

    const increment = () => {
      count.value++
    }

    const doubleCount = computed(() => count.value * 2)

    return {
      count,
      message,
      increment,
      doubleCount
    }
  }
}
```

## 核心概念

### ref 和 reactive

```javascript
import { ref, reactive } from 'vue'

// ref - 用于基本类型
const count = ref(0)
count.value++ // 需要 .value 访问

// reactive - 用于对象
const state = reactive({
  count: 0,
  message: 'Hello'
})
state.count++ // 直接访问
```

### computed 计算属性

```javascript
import { ref, computed } from 'vue'

const firstName = ref('Zhang')
const lastName = ref('San')

const fullName = computed({
  get() {
    return firstName.value + ' ' + lastName.value
  },
  set(newValue) {
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})
```

### watch 侦听器

```javascript
import { ref, watch } from 'vue'

const count = ref(0)

// 侦听单个数据源
watch(count, (newValue, oldValue) => {
  console.log(`count changed from ${oldValue} to ${newValue}`)
})

// 侦听多个数据源
watch([count, message], ([newCount, newMessage], [oldCount, oldMessage]) => {
  console.log('Multiple values changed')
})
```

## 生命周期钩子

```javascript
import { onMounted, onUpdated, onUnmounted } from 'vue'

export default {
  setup() {
    onMounted(() => {
      console.log('Component mounted')
    })

    onUpdated(() => {
      console.log('Component updated')
    })

    onUnmounted(() => {
      console.log('Component unmounted')
    })
  }
}
```

## 组合函数 (Composables)

```javascript
// useCounter.js
import { ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue

  return {
    count,
    increment,
    decrement,
    reset
  }
}

// 使用
import { useCounter } from './useCounter'

export default {
  setup() {
    const { count, increment, decrement, reset } = useCounter(10)

    return {
      count,
      increment,
      decrement,
      reset
    }
  }
}
```

## 最佳实践

1. **逻辑复用** - 将可复用逻辑提取为组合函数
2. **TypeScript 支持** - 充分利用类型推导
3. **性能优化** - 合理使用 ref 和 reactive
4. **代码组织** - 按功能而非选项组织代码

## 总结

组合式 API 为 Vue 3 带来了更强大的逻辑复用和代码组织能力，是构建大型应用的理想选择。
