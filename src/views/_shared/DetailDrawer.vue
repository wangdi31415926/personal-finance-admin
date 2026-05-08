<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  title?: string;
  size?: string | number;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
}>();
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    :size="size || 520"
    :title="title || '详情'"
    direction="rtl"
    :destroy-on-close="false"
    :append-to-body="true"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>

    <div class="detail-drawer-body">
      <slot />
    </div>

    <template v-if="$slots.footer" #footer>
      <div class="detail-drawer-footer">
        <slot name="footer" />
      </div>
    </template>
  </el-drawer>
</template>

<style scoped>
.detail-drawer-body {
  padding: 4px 4px 16px;
}
.detail-drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
