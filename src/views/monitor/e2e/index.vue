<script setup lang="ts">
import { computed, ref } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import { genTimeSeries, simpleLineOption, fmtTime } from "@/views/_shared/mockUtils";

defineOptions({ name: "MonE2e" });

const tab = ref("e1");

const rxScore = ref(
  Array.from({ length: 16 }, (_, i) => ({
    id: `E2E-${3800 + i}`,
    rx: `RX-${["A", "B", "C"][i % 3]}-${i}`,
    snr: `${12 + (i % 8)}.${i % 10} dB`,
    ber: `1e-${5 + (i % 3)}`,
    pass: i % 9 !== 0,
    beam: `B-${(i % 6) + 1}`,
    chipTempC: 41 + (i % 9),
    pllLockMs: 180 + (i % 120),
    moLatencyMs: 620 + (i % 220),
    gatewayHop: ["信服", "网关A", "网关B"][i % 3],
    traceSample: `${512 + (i % 64)} pkt`
  }))
);

const trend = computed(() => {
  const { ts, values } = genTimeSeries(18, 88, 10, 14);
  return simpleLineOption("端到端质量得分", ts, values);
});

const alerts = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `TH-${3900 + i}`,
    rule: `TH-${440 + i}`,
    metric: ["SNR", "BER", "锁定时长"][i % 3],
    beam: `B-${(i % 6) + 1}`,
    fired: i % 6 === 0,
    threshold: i % 3 === 0 ? ">15dBHz" : "<1e-5",
    window: ["5m", "15m", "1h"][i % 3],
    severity: ["P1", "P2", "P3"][i % 3],
    notifyCh: ["短信+邮件", "仅大屏", "一线值班"][i % 3],
    lastEval: fmtTime(new Date(Date.now() - i * 900000))
  }))
);
</script>

<template>
  <PageShell title="质量端到端场景" subtitle="5.4.3.6 接收机评估 · 多维趋势 · 阈值报表">
    <template #tabs>
      <el-tabs v-model="tab" class="shell-tab-bar">
        <el-tab-pane label="接收机端到端评估" name="e1" />
        <el-tab-pane label="多维质量汇总与趋势" name="e2" />
        <el-tab-pane label="阈值预警与评估报表" name="e3" />
      </el-tabs>
    </template>

    <div class="pane">
      <MiniChart v-if="tab === 'e2'" :option="trend" :height="220" />

      <PagedTable v-if="tab === 'e1'" :data="rxScore" :page-size="10" row-key="id">
        <el-table-column prop="id" label="评估ID" width="112" />
        <el-table-column prop="rx" label="接收机" width="120" />
        <el-table-column prop="beam" label="波束" width="72" />
        <el-table-column prop="snr" label="载噪/SNR" width="108" />
        <el-table-column prop="ber" label="误码" width="88" />
        <el-table-column prop="chipTempC" label="芯片℃" width="88" />
        <el-table-column prop="pllLockMs" label="PLL锁定ms" width="112" />
        <el-table-column prop="moLatencyMs" label="MO段时延ms" width="120" />
        <el-table-column prop="gatewayHop" label="网关路径" width="100" />
        <el-table-column prop="traceSample" label="采样" width="100" />
        <el-table-column prop="pass" label="评估" width="88">
          <template #default="{ row }">
            <el-tag :type="row.pass ? 'success' : 'danger'" size="small">{{
              row.pass ? "达标" : "不达标"
            }}</el-tag>
          </template>
        </el-table-column>
      </PagedTable>

      <PagedTable v-if="tab === 'e3'" :data="alerts" :page-size="8" row-key="id">
        <el-table-column prop="id" label="规则实例" width="112" />
        <el-table-column prop="rule" label="阈值规则" width="120" />
        <el-table-column prop="metric" label="指标" width="96" />
        <el-table-column prop="beam" label="波束" width="72" />
        <el-table-column prop="threshold" label="条件" width="108" />
        <el-table-column prop="window" label="窗口" width="72" />
        <el-table-column prop="severity" label="严重度" width="88" />
        <el-table-column prop="notifyCh" label="通知通道" width="108" />
        <el-table-column prop="lastEval" label="最近评估" width="158" />
        <el-table-column prop="fired" label="触发" width="88">
          <template #default="{ row }">
            <el-tag :type="row.fired ? 'danger' : 'success'" size="small">{{
              row.fired ? "触发" : "正常"
            }}</el-tag>
          </template>
        </el-table-column>
      </PagedTable>

      <MiniChart v-if="tab === 'e1'" :option="trend" :height="200" />
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
  gap: 8px;
}
</style>
