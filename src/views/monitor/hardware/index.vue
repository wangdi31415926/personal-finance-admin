<script setup lang="ts">
import { computed, ref } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import { genTimeSeries, simpleLineOption, simpleBarOption } from "@/views/_shared/mockUtils";

defineOptions({ name: "MonHardware" });

const tab = ref("t1");

const mkRows = (prefix: string, n = 16) =>
  Array.from({ length: n }, (_, i) => ({
    id: `${prefix}-${3000 + i}`,
    name: `池-${(i % 4) + 1}-${["网关", "计算", "存储"][i % 3]}`,
    usage: 40 + (i * 11) % 55,
    beam: `B-${(i % 6) + 1}`,
    status: ["正常", "预警", "满载"][i % 3]
  }));

const rows = {
  t1: mkRows("POOL"),
  t2: mkRows("HW"),
  t3: mkRows("SPU"),
  t4: mkRows("RX"),
  t5: mkRows("POD")
};

const line = computed(() => {
  const { ts, values } = genTimeSeries(16, 62, 20, 4);
  return simpleLineOption("资源池利用率 %", ts, values);
});

const bar = () =>
  simpleBarOption("信处单元容量占用 Top6", ["U1", "U2", "U3", "U4", "U5", "U6"], [72, 68, 65, 61, 58, 52]);
</script>

<template>
  <PageShell title="硬件资源组合监控" subtitle="5.4.3.1 池化 · 完好性 · 信处 · 接收机 · 容器链路">
    <template #tabs>
      <el-tabs v-model="tab" class="shell-tab-bar">
        <el-tab-pane label="资源池化监管" name="t1" />
        <el-tab-pane label="硬件/容器完好性" name="t2" />
        <el-tab-pane label="信处单元集群容量" name="t3" />
        <el-tab-pane label="监测接收机" name="t4" />
        <el-tab-pane label="业务容器与外部链路" name="t5" />
      </el-tabs>
    </template>

    <div class="pane">
      <MiniChart v-if="tab === 't1' || tab === 't2'" :option="line" :height="200" />
      <MiniChart v-if="tab === 't3'" :option="bar()" :height="200" />
      <MiniChart v-if="tab === 't4' || tab === 't5'" :option="line" :height="180" />

      <PagedTable :data="rows[tab as keyof typeof rows]" :page-size="8" row-key="id">
        <el-table-column prop="name" label="对象" min-width="140" />
        <el-table-column prop="usage" label="利用率%" width="96" />
        <el-table-column prop="beam" label="波束" width="72" />
        <el-table-column prop="status" label="状态" width="88" />
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
  gap: 8px;
  overflow: hidden;
}
</style>
