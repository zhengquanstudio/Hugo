<template>
  <div class="form-group">
    <div v-if="title" class="form-group__title">
      {{ title }}
    </div>
    <div class="form-group__content">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.form-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
  padding: $spacing-5;
  background: linear-gradient(135deg, $bg-card 0%, $bg-secondary 100%);
  border-radius: $radius-lg;
  border: 1px solid $border-light;
  transition: $transition-all;

  &:hover {
    border-color: $border-default;
    box-shadow: $shadow-sm;
  }

  &__title {
    font-size: $text-sm;
    font-weight: $font-semibold;
    color: $text-primary;
    padding-bottom: $spacing-2;
    border-bottom: 1px solid $border-light;
    margin-bottom: $spacing-2;
    display: flex;
    align-items: center;
    gap: $spacing-2;

    &::before {
      content: '';
      width: 3px;
      height: 14px;
      background: $primary;
      border-radius: 2px;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $spacing-4;
  }
}
</style>
