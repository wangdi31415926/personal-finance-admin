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
    beam: `B-${(i % 5) + 1}`,
    site: ["主站", "备站"][i % 2],
    rulScore: `${72 + (i % 22)}%`,
    vibrationRms: (0.12 + (i % 8) * 0.03).toFixed(3),
    tempC: 38 + (i % 12),
    mtbfH: 4200 + (i % 200) * 15,
    action: ["加强巡检", "预约备件", "观察"][i % 3]
  }))
);

const identifies = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `ID-${2900 + i}`,
    pattern: ["周期性尖峰", "缓慢漂移", "阶跃异常"][i % 3],
    conf: `${82 + (i % 15)}%`,
    rule: `R-FRC-${440 + i}`,
    time: fmtTime(new Date(Date.now() - i * 480000)),
    beam: `B-${(i % 6) + 1}`,
    metric: ["C/N0", "BER", "PLL余量"][i % 3],
    window: ["1h", "24h", "7d"][i % 3],
    impact: ["MO劣化", "双向受限", "出站抖动"][i % 3],
    owner: `预测-${(i % 3) + 1}`
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
        <el-table-column prop="id" label="设备ID" width="112" />
        <el-table-column prop="name" label="设备名称" min-width="130" />
        <el-table-column prop="site" label="站点" width="72" />
        <el-table-column prop="beam" label="服务波束" width="96" />
        <el-table-column prop="risk" label="风险分" width="88" />
        <el-table-column prop="rulScore" label="RUL置信" width="96" />
        <el-table-column prop="vibrationRms" label="振动RMS" width="96" />
        <el-table-column prop="tempC" label="温度℃" width="88" />
        <el-table-column prop="mtbfH" label="MTBF小时" width="104" />
        <el-table-column prop="eta" label="预计触发" width="100" />
        <el-table-column prop="action" label="建议动作" width="100" />
      </PagedTable>
    </div>

    <div v-show="tab === 'id'" class="pane">
      <PagedTable :data="identifies" :page-size="8" row-key="id">
        <el-table-column prop="id" label="识别ID" width="108" />
        <el-table-column prop="pattern" label="异常模式" min-width="110" />
        <el-table-column prop="beam" label="波束" width="72" />
        <el-table-column prop="metric" label="主指标" width="96" />
        <el-table-column prop="window" label="分析窗口" width="96" />
        <el-table-column prop="impact" label="影响面" width="108" />
        <el-table-column prop="conf" label="置信度" width="88" />
        <el-table-column prop="rule" label="触发规则" width="120" />
        <el-table-column prop="owner" label="跟进人" width="88" />
        <el-table-column prop="time" label="检出时间" width="158" />
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
