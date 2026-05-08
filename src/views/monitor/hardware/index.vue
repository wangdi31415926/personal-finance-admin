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
    status: ["正常", "预警", "满载"][i % 3],
    zone: ["主站-A栋", "主站-B栋", "备站"][i % 3],
    rack: `R-${(i % 12) + 1}-U${10 + (i % 20)}`,
    assetNo: `AST-${2024 + (i % 8)}-${420 + i}`,
    alertLevel: ["—", "L2", "L3"][i % 3],
    powerKw: (2.2 + (i % 8) * 0.35).toFixed(2),
    maintDue: `${5 + (i % 20)}日内维保`
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
        <el-table-column prop="id" label="对象ID" width="112" />
        <el-table-column prop="name" label="对象名称" min-width="130" />
        <el-table-column prop="zone" label="机房/区域" width="108" />
        <el-table-column prop="rack" label="机柜位" width="108" />
        <el-table-column prop="assetNo" label="资产编号" width="128" show-overflow-tooltip />
        <el-table-column prop="beam" label="关联波束" width="96" />
        <el-table-column prop="usage" label="利用率%" width="96" />
        <el-table-column prop="powerKw" label="功耗kW" width="88" />
        <el-table-column prop="alertLevel" label="告警等级" width="96" />
        <el-table-column prop="maintDue" label="维保" width="108" />
        <el-table-column prop="status" label="运行状态" width="96" />
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
