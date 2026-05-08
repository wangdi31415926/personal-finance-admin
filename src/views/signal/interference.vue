<script setup lang="ts">
import { computed } from "vue";
import { fmtTime } from "@/views/_shared/mockUtils";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";

defineOptions({ name: "SigInterference" });

/** 简易热力矩阵 mock（自定义 render） */
function heatOption(): Record<string, unknown> {
  const hours = Array.from({ length: 12 }, (_, i) => `${i * 2}h`);
  const freqs = ["1610", "1612", "1614", "1616", "1618"];
  const data: number[][] = [];
  for (let i = 0; i < freqs.length; i++) {
    for (let j = 0; j < hours.length; j++) {
      data.push([j, i, Math.round(Math.random() * 100)]);
    }
  }
  return {
    tooltip: { position: "top" },
    grid: { height: "58%", top: "12%" },
    xAxis: { type: "category", data: hours, splitArea: { show: true } },
    yAxis: { type: "category", data: freqs, splitArea: { show: true } },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: "4%"
    },
    series: [
      {
        name: "干扰强度",
        type: "heatmap",
        data,
        label: { show: false },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.5)" }
        }
      }
    ]
  };
}

const rows = Array.from({ length: 14 }, (_, i) => ({
  id: `IF-${4200 + i}`,
  src: ["邻频发射", "地面雷达", "工业干扰", "多径"][i % 4],
  beam: `B-${(i % 6) + 1}`,
  bw: `${200 + (i % 5) * 50} kHz`,
  conf: `${70 + (i % 25)}%`,
  centerMHz: (1610.76 + (i % 6) * 0.12).toFixed(3),
  dutyPct: `${15 + (i % 40)}%`,
  impactMo: ["轻微", "显著", "业务中断"][i % 3],
  suggestAction: ["规避频点", "功率协调", "压制滤波"][i % 3],
  ticketId: `RFCase-${20260509}-${420 + i}`,
  firstSeen: fmtTime(new Date(Date.now() - i * 7200000)),
  lastSeen: fmtTime(new Date(Date.now() - i * 180000))
}));

const heat = computed(() => heatOption());
</script>

<template>
  <PageShell title="干扰信息分析" subtitle="5.4.4.3（热力 mock）">
    <div class="pane">
      <MiniChart :option="heat" :height="320" />
      <PagedTable :data="rows" :page-size="8" row-key="id">
        <el-table-column prop="id" label="记录ID" width="108" />
        <el-table-column prop="src" label="干扰类型" min-width="100" />
        <el-table-column prop="beam" label="波束" width="72" />
        <el-table-column prop="centerMHz" label="中心MHz" width="104" />
        <el-table-column prop="bw" label="带宽" width="100" />
        <el-table-column prop="dutyPct" label="占空比" width="88" />
        <el-table-column prop="impactMo" label="业务影响" width="100" />
        <el-table-column prop="suggestAction" label="处置建议" width="108" />
        <el-table-column prop="conf" label="置信度" width="88" />
        <el-table-column prop="ticketId" label="协调单" width="128" />
        <el-table-column prop="firstSeen" label="首次" width="158" />
        <el-table-column prop="lastSeen" label="最近" width="158" />
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
