<script setup lang="ts">
import { computed, ref } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import { genTimeSeries, simpleLineOption, fmtTime } from "@/views/_shared/mockUtils";

defineOptions({ name: "FaultPredict" });

const tab = ref("trend");

const trend = computed(() => {
  const { ts, values } = genTimeSeries(20, 55, 22, 13);
  return simpleLineOption("故障风险评分（0-100）", ts, values);
});

const devices = ref(
  Array.from({ length: 16 }, (_, i) => ({
    id: `DEV-${2800 + i}`,
    name: `监测接收机-${String.fromCharCode(65 + (i % 6))}${i}`,
    risk: 30 + (i * 7) % 60,
    eta: `${20 + (i % 40)} min`,
    beam: `B-${(i % 5) + 1}`
  }))
);

const identifies = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `ID-${2900 + i}`,
    pattern: ["周期性尖峰", "缓慢漂移", "阶跃异常"][i % 3],
    conf: `${82 + (i % 15)}%`,
    rule: `R-FRC-${440 + i}`,
    time: fmtTime(new Date(Date.now() - i * 480000))
  }))
);
</script>

<template>
  <PageShell title="故障预测分析" subtitle="5.4.2.5 预测 · 单设备预警 · 智能识别">
    <template #tabs>
      <el-tabs v-model="tab" class="shell-tab-bar">
        <el-tab-pane label="预测趋势" name="trend" />
        <el-tab-pane label="单设备智能预警" name="dev" />
        <el-tab-pane label="智能故障识别" name="id" />
      </el-tabs>
    </template>

    <div v-show="tab === 'trend'" class="pane">
      <MiniChart :option="trend" :height="260" />
    </div>

    <div v-show="tab === 'dev'" class="pane">
      <PagedTable :data="devices" :page-size="10" row-key="id">
        <el-table-column prop="name" label="设备" />
        <el-table-column prop="risk" label="风险分" width="88" />
        <el-table-column prop="eta" label="预计触发" width="100" />
        <el-table-column prop="beam" label="波束" width="72" />
      </PagedTable>
    </div>

    <div v-show="tab === 'id'" class="pane">
      <PagedTable :data="identifies" :page-size="8" row-key="id">
        <el-table-column prop="pattern" label="模式" />
        <el-table-column prop="conf" label="置信度" width="88" />
        <el-table-column prop="rule" label="规则" width="120" />
        <el-table-column prop="time" label="时间" width="158" />
      </PagedTable>
    </div>
  </PageShell>
</template>

<style scoped>
.pane {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
