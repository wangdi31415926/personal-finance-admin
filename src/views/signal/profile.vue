<script setup lang="ts">
import { computed } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import { genTimeSeries, simpleLineOption, fmtTime } from "@/views/_shared/mockUtils";

defineOptions({ name: "SigProfile" });

const rows = Array.from({ length: 16 }, (_, i) => ({
  id: `PF-${4300 + i}`,
  uid: `U-${88000 + i}`,
  tags: ["高清图像偏好", "夜高峰", "远洋场景"][i % 3],
  cnr: `${10 + (i % 7)}.${i % 10}`,
  beam: `B-${(i % 6) + 1}`,
  imeiTail: `${420000 + i}`,
  svcPlan: ["行业尊享", "大众基础", "应急保底"][i % 3],
  moSucc: `${98.2 - (i % 5) * 0.15}%`,
  reportPeriod: ["15s", "30s", "60s"][i % 3],
  weakSigPct: `${(2 + (i % 8) * 0.7).toFixed(1)}%`,
  lastCity: ["秦皇岛", "舟山", "喀什"][i % 3],
  firmware: `T-${2 + (i % 4)}.${i % 20}`,
  diagHint: ["提示上调功率", "建议换波束", "终端自检"][i % 3],
  profileAt: fmtTime(new Date(Date.now() - i * 420000))
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
        <el-table-column prop="id" label="画像ID" width="108" />
        <el-table-column prop="uid" label="用户终端" width="120" />
        <el-table-column prop="imeiTail" label="IMEI尾号" width="100" />
        <el-table-column prop="beam" label="主波束" width="88" />
        <el-table-column prop="svcPlan" label="业务套餐" width="100" />
        <el-table-column prop="cnr" label="C/N0 dBHz" width="104" />
        <el-table-column prop="moSucc" label="MO成功率" width="108" />
        <el-table-column prop="weakSigPct" label="弱信号占比" width="104" />
        <el-table-column prop="reportPeriod" label="上报周期" width="100" />
        <el-table-column prop="tags" label="画像标签" min-width="120" show-overflow-tooltip />
        <el-table-column prop="lastCity" label="最近地域" width="96" />
        <el-table-column prop="firmware" label="固件" width="100" />
        <el-table-column prop="diagHint" label="远程诊断" min-width="110" show-overflow-tooltip />
        <el-table-column prop="profileAt" label="画像时间" width="158" />
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
