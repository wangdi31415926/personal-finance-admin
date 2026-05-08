<script setup lang="ts">
import { computed, ref } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import { genTimeSeries, simpleLineOption, fmtTime } from "@/views/_shared/mockUtils";

defineOptions({ name: "MonSystem" });

const tab = ref("t1");

function radarHealth(): Record<string, unknown> {
  return {
    tooltip: {},
    radar: {
      indicator: [
        { name: "可用性", max: 100 },
        { name: "性能", max: 100 },
        { name: "容量", max: 100 },
        { name: "安全", max: 100 },
        { name: "协同", max: 100 }
      ]
    },
    series: [{ type: "radar", data: [{ value: [96, 91, 88, 94, 90], name: "健康度" }] }]
  };
}

const patrol = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `PT-${3100 + i}`,
    name: `巡检-${["出站链路", "主备心跳", "磁盘", "队列"][i % 4]}`,
    site: ["主站", "备站"][i % 2],
    time: fmtTime(new Date(Date.now() - i * 86400000)),
    ok: i % 6 !== 0
  }))
);

const trend = computed(() => {
  const { ts, values } = genTimeSeries(18, 92, 6, 8);
  return simpleLineOption("系统可用性 %", ts, values);
});
</script>

<template>
  <PageShell title="系统综合监控" subtitle="5.4.3.2 状态 · 主备 · 巡检 · 全维度 · 健康度">
    <template #tabs>
      <el-tabs v-model="tab" class="shell-tab-bar">
        <el-tab-pane label="系统状态综合" name="t1" />
        <el-tab-pane label="主备站协同" name="t2" />
        <el-tab-pane label="自动巡检与报告" name="t3" />
        <el-tab-pane label="全维度监控" name="t4" />
        <el-tab-pane label="健康度评估" name="t5" />
      </el-tabs>
    </template>

    <div class="pane">
      <el-row v-if="tab === 't1' || tab === 't4'" :gutter="12">
        <el-col :span="14">
          <MiniChart :option="trend" :height="220" />
        </el-col>
        <el-col :span="10">
          <MiniChart :option="radarHealth()" :height="220" />
        </el-col>
      </el-row>

      <div v-if="tab === 't2'" class="pair">
        <el-card shadow="never">
          <template #header>主站</template>
          <p>出站 P99 62ms · 队列深度 38%</p>
        </el-card>
        <el-card shadow="never">
          <template #header>备站</template>
          <p>出站 P99 64ms · 队列深度 41%</p>
        </el-card>
      </div>

      <PagedTable v-if="tab === 't3'" :data="patrol" :page-size="8" row-key="id">
        <el-table-column prop="name" label="任务" />
        <el-table-column prop="site" label="站点" width="72" />
        <el-table-column prop="time" label="时间" width="158" />
        <el-table-column prop="ok" label="结果" width="88">
          <template #default="{ row }">
            <el-tag :type="row.ok ? 'success' : 'danger'" size="small">{{
              row.ok ? "通过" : "异常"
            }}</el-tag>
          </template>
        </el-table-column>
      </PagedTable>

      <MiniChart v-if="tab === 't5'" :option="radarHealth()" :height="280" />
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
  gap: 10px;
}
.pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
</style>
