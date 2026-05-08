<script setup lang="ts">
import { computed } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import { genTimeSeries, simpleLineOption } from "@/views/_shared/mockUtils";

defineOptions({ name: "SigProfile" });

const rows = Array.from({ length: 16 }, (_, i) => ({
  id: `PF-${4300 + i}`,
  uid: `U-${88000 + i}`,
  tags: ["高清图像偏好", "夜高峰", "远洋场景"][i % 3],
  cnr: `${10 + (i % 7)}.${i % 10}`,
  beam: `B-${(i % 6) + 1}`
}));

const line = computed(() => {
  const { ts, values } = genTimeSeries(16, 11, 3, 31);
  return simpleLineOption("载噪比 C/N0 轨迹", ts, values);
});

// simpleRadarOption - not in mockUtils - remove and inline
function radar(): Record<string, unknown> {
  return {
    tooltip: {},
    radar: {
      indicator: [
        { name: "活跃度", max: 100 },
        { name: "业务帧长", max: 100 },
        { name: "地理分散", max: 100 },
        { name: "干扰暴露", max: 100 }
      ]
    },
    series: [{ type: "radar", data: [{ value: [82, 74, 66, 58], name: "画像" }] }]
  };
}

const r = computed(() => radar());
</script>

<template>
  <PageShell title="用户画像与载噪比分析" subtitle="5.4.4.4">
    <div class="pane">
      <el-row :gutter="12">
        <el-col :span="14">
          <MiniChart :option="line" :height="240" />
        </el-col>
        <el-col :span="10">
          <MiniChart :option="r" :height="240" />
        </el-col>
      </el-row>
      <PagedTable :data="rows" :page-size="10" row-key="id">
        <el-table-column prop="uid" label="用户终端" width="120" />
        <el-table-column prop="tags" label="画像标签" min-width="140" />
        <el-table-column prop="cnr" label="C/N0 dBHz" width="100" />
        <el-table-column prop="beam" label="主波束" width="72" />
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
