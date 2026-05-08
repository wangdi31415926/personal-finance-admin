<script setup lang="ts">
import { computed } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import { simpleBarOption, fmtTime } from "@/views/_shared/mockUtils";

defineOptions({ name: "SigOverflow" });

const rows = Array.from({ length: 18 }, (_, i) => ({
  id: `OF-${4100 + i}`,
  beam: `B-${(i % 6) + 1}`,
  overflowCnt: 5 + (i % 12),
  levelDb: `-${42 + (i % 8)}`,
  feature: ["突发用户", "长业务帧", "并发握手"][i % 3],
  adcClipPct: `${(0.2 + (i % 8) * 0.15).toFixed(2)}%`,
  agcGainDb: `${18 + (i % 12)}.${i % 10}`,
  slotIdx: (i % 16) + 1,
  burstLenB: 120 + (i % 80) * 8,
  terminalCat: ["行业", "大众", "应急"][i % 3],
  rxSite: ["RF-A", "RF-B"][i % 2],
  windowStart: fmtTime(new Date(Date.now() - i * 3600000))
}));

const bar = computed(() =>
  simpleBarOption("溢出次数 Top 波束", ["B1", "B2", "B3", "B4", "B5", "B6"], [28, 22, 18, 14, 11, 9])
);
</script>

<template>
  <PageShell title="溢出数量 / 电平 / 用户特征" subtitle="5.4.4.2">
    <div class="pane">
      <MiniChart :option="bar" :height="220" />
      <PagedTable :data="rows" :page-size="10" row-key="id">
        <el-table-column prop="id" label="事件ID" width="108" />
        <el-table-column prop="beam" label="波束" width="72" />
        <el-table-column prop="overflowCnt" label="溢出次数" width="96" />
        <el-table-column prop="adcClipPct" label="ADC削顶%" width="104" />
        <el-table-column prop="levelDb" label="参考电平dBm" width="112" />
        <el-table-column prop="agcGainDb" label="AGC增益" width="96" />
        <el-table-column prop="slotIdx" label="时隙idx" width="88" />
        <el-table-column prop="burstLenB" label="突发字节" width="96" />
        <el-table-column prop="terminalCat" label="终端类别" width="96" />
        <el-table-column prop="feature" label="业务特征" min-width="100" />
        <el-table-column prop="rxSite" label="射频单元" width="88" />
        <el-table-column prop="windowStart" label="窗口起点" width="158" />
      </PagedTable>
    </div>
  </PageShell>
</template>

<style scoped>
.pane {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}
</style>
