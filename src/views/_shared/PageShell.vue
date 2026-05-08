<script setup lang="ts">
defineProps<{
  /** 页面标题 */
  title?: string;
  /** 副标题 / 文档对照 */
  subtitle?: string;
  /** 是否禁用内置 padding */
  flat?: boolean;
}>();
</script>

<template>
  <div class="page-shell">
    <header v-if="title || $slots.toolbar" class="shell-header">
      <div class="shell-title-wrap">
        <h2 v-if="title" class="shell-title">{{ title }}</h2>
        <span v-if="subtitle" class="shell-subtitle">{{ subtitle }}</span>
      </div>
      <div v-if="$slots.toolbar" class="shell-toolbar">
        <slot name="toolbar" />
      </div>
    </header>
    <div v-if="$slots.tabs" class="shell-tabs">
      <slot name="tabs" />
    </div>
    <main class="shell-body" :class="{ 'shell-flat': flat }">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.page-shell {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 134px);
  min-height: 540px;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}
.shell-header {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 14px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: linear-gradient(
    135deg,
    var(--el-color-primary-light-9) 0%,
    var(--el-fill-color-light) 100%
  );
}
.shell-title-wrap {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
}
.shell-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
  white-space: nowrap;
}
.shell-subtitle {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.shell-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.shell-tabs {
  flex-shrink: 0;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}
.shell-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
}
.shell-body.shell-flat {
  padding: 0;
}
</style>
