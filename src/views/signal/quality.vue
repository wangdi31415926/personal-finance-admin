<script setup lang="ts">
import { computed } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import { genTimeSeries, simpleLineOption } from "@/views/_shared/mockUtils";

defineOptions({ name: "SigQuality" });

const rows = Array.from({ length: 16 }, (_, i) => ({
  id: `SQ-${4000 + i}`,
  beam: `B-${(i % 6) + 1}`,
  freq: `${1610 + (i % 5) * 2} MHz`,
  evm: `${2 + (i % 5)}.${i % 10}%`,
  cnr: `${11 + (i % 6)}.${i % 10} dBHz`
}));

const o1 = computed(() => {
  const { ts, values } = genTimeSeries(18, 78, 15, 21);
  return simpleLineOption("信号质量综合得分", ts, values);
});
const o2 = computed(() => {
  const { ts, values } = genTimeSeries(18, 62, 12, 22);
  return simpleLineOption("EVM / 相位噪声联动", ts, values);
});
</script>

<template>
  <PageShell title="信号质量监测分析" subtitle="5.4.4.1">
    <div class="pane">
      <el-row :gutter="12">
        <el-col :span="12">
          <MiniChart :option="o1" :height="240" />
        </el-col>
        <el-col :span="12">
          <MiniChart :option="o2" :height="240" />
        </el-col>
      </el-row>
      <PagedTable :data="rows" :page-size="10" row-key="id">
        <el-table-column prop="beam" label="波束" width="72" />
        <el-table-column prop="freq" label="频点" width="120" />
        <el-table-column prop="evm" label="EVM" width="88" />
        <el-table-column prop="cnr" label="C/N0" width="88" />
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
