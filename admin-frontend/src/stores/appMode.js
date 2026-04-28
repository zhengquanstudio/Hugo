import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 应用模式状态管理
 * 用于在简化模式和完整模式之间切换
 */
export const useAppModeStore = defineStore('appMode', () => {
  // 模式类型: 'full' | 'simple'
  const mode = ref(localStorage.getItem('app-mode') || 'full')

  // 是否为简化模式
  const isSimpleMode = computed(() => mode.value === 'simple')

  // 是否为完整模式
  const isFullMode = computed(() => mode.value === 'full')

  /**
   * 切换到简化模式
   */
  function setSimpleMode() {
    mode.value = 'simple'
    localStorage.setItem('app-mode', 'simple')
  }

  /**
   * 切换到完整模式
   */
  function setFullMode() {
    mode.value = 'full'
    localStorage.setItem('app-mode', 'full')
  }

  /**
   * 切换模式
   */
  function toggleMode() {
    if (isSimpleMode.value) {
      setFullMode()
    } else {
      setSimpleMode()
    }
  }

  return {
    mode,
    isSimpleMode,
    isFullMode,
    setSimpleMode,
    setFullMode,
    toggleMode
  }
})
