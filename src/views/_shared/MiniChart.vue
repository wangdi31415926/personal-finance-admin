<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, shallowRef } from "vue";
import * as echarts from "echarts";

/** 简单图表：全量 echarts，避免按需注册的导出与类型问题 */
const props = withDefaults(
  defineProps<{
    option: Record<string, unknown>;
    height?: string | number;
    autoresize?: boolean;
  }>(),
  { autoresize: true }
);

const root = ref<HTMLDivElement>();
const chart = shallowRef<echarts.ECharts | null>(null);
let ro: ResizeObserver | null = null;

function init() {
  if (!root.value) return;
  chart.value = echarts.init(root.value);
  chart.value.setOption(props.option as any, true);
}

watch(
  () => props.option,
  val => {
    if (chart.value && val) chart.value.setOption(val as any, true);
  },
  { deep: true }
);

onMounted(() => {
  init();
  if (props.autoresize !== false && root.value) {
    ro = new ResizeObserver(() => chart.value?.resize());
    ro.observe(root.value);
  }
});

onBeforeUnmount(() => {
  ro?.disconnect();
  chart.value?.dispose();
  chart.value = null;
});
</script>

<template>
  <div
    ref="root"
    class="mini-chart"
    :style="{
      height: typeof height === 'number' ? `${height}px` : height || '100%',
      width: '100%'
    }"
  />
</template>

<style scoped>
.mini-chart {
  min-height: 120px;
}
</style>
