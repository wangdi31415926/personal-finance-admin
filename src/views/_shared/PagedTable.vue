<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, ref, watch } from "vue";
import { paginate } from "./mockUtils";

const props = withDefaults(
  defineProps<{
    data: T[];
    pageSize?: number;
    rowKey?: string;
    height?: string | number;
    emptyText?: string;
    rowClickable?: boolean;
    /** 是否显示斑马纹 */
    stripe?: boolean;
    /** 强制每行高度（固定 dense 表格时） */
    size?: "small" | "default" | "large";
  }>(),
  {
    pageSize: 10,
    rowKey: "id",
    emptyText: "暂无数据",
    rowClickable: false,
    stripe: true,
    size: "small"
  }
);

const emit = defineEmits<{
  "row-click": [row: T];
}>();

const page = ref(1);
const search = computed(() => ({ page: page.value, pageSize: props.pageSize }));

const pageData = computed(() =>
  paginate<T>(props.data, page.value, props.pageSize)
);

watch(
  () => props.data.length,
  () => {
    if ((page.value - 1) * props.pageSize >= props.data.length) {
      page.value = 1;
    }
  }
);

function onRowClick(row: T) {
  if (props.rowClickable) emit("row-click", row);
}

defineExpose({ resetPage: () => (page.value = 1), search });
</script>

<template>
  <div class="paged-table">
    <div class="paged-table-body">
      <el-table
        :data="pageData.list"
        :row-key="rowKey"
        :stripe="stripe"
        :size="size"
        :empty-text="emptyText"
        :row-class-name="rowClickable ? 'clickable-row' : ''"
        height="100%"
        @row-click="onRowClick"
      >
        <slot />
      </el-table>
    </div>
    <div class="paged-table-footer">
      <span class="paged-table-meta">
        共 {{ pageData.total }} 条 · 第 {{ pageData.page }} /
        {{ Math.max(1, Math.ceil(pageData.total / pageData.pageSize)) }} 页
      </span>
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="pageData.total"
        layout="prev, pager, next, jumper"
        background
        small
      />
    </div>
  </div>
</template>

<style scoped>
.paged-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.paged-table-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}
.paged-table-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 8px;
}
.paged-table-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
:deep(.clickable-row) {
  cursor: pointer;
}
:deep(.clickable-row:hover) {
  background: var(--el-fill-color-lighter);
}
</style>
