<script setup lang="ts">
import { computed, ref } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import { genTimeSeries, simpleLineOption, fmtTime } from "@/views/_shared/mockUtils";

defineOptions({ name: "FaultDiagnose" });

const tab = ref("t1");
const timeLine = [
  { t: "T+0s", a: "拉取波束/出站指标", ok: true },
  { t: "T+8s", a: "匹配候选根因", ok: true },
  { t: "T+15s", a: "算法置信融合", ok: true },
  { t: "T+22s", a: "生成处置建议", ok: false }
];

const algoList = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `FA-${1900 + i}`,
    name: ["卡尔曼残差", "关联传播", "阈值森林", "序列对齐"][i % 4],
    ver: `v${i % 5}.${i % 7}`,
    latencyMs: 120 + i * 33,
    cover: `${85 + (i % 10)}%`
  }))
);

const knownFaults = ref(
  Array.from({ length: 16 }, (_, i) => ({
    id: `KF-${2000 + i}`,
    code: `K-${4200 + i}`,
    title: ["出站队列满", "监测接收机失锁", "调制模板漂移"][i % 3],
    beam: `B-${(i % 6) + 1}`,
    hit: i % 5 === 0 ? "待复核" : "已确认"
  }))
);

const importJobs = ref(
  Array.from({ length: 12 }, (_, i) => ({
    id: `IJ-${2100 + i}`,
    file: `diag-pack-${i + 1}.zip`,
    status: ["校验中", "已入库", "失败"][i % 3],
    time: fmtTime(new Date(Date.now() - i * 3600000))
  }))
);

const sceneRuns = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `SC-${2200 + i}`,
    scene: ["全天场景", "峰值窗口", "应急演练", "割接窗口"][i % 4],
    result: i % 7 === 0 ? "疑似环境噪声" : "定位成功",
    dur: `${12 + (i % 8)}s`
  }))
);

const vizTrend = computed(() => {
  const { ts, values } = genTimeSeries(18, 72, 18, 9);
  return simpleLineOption("诊断流水线置信度", ts, values);
});

const relateRows = ref(
  Array.from({ length: 15 }, (_, i) => ({
    id: `RL-${2300 + i}`,
    dim: ["指标", "日志", "拓扑", "变更"][i % 4],
    key: ["latency_p99", "sync_offset", "beam_cap"][i % 3],
    link: `→ FLT-${430 + i}`
  }))
);

const labels = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `LB-${2400 + i}`,
    diagId: `DG-${560 + i}`,
    tag: ["误报", "待观察", "确认故障"][i % 3],
    user: `标注员-${(i % 4) + 1}`
  }))
);
</script>

<template>
  <PageShell title="故障诊断分析工作台" subtitle="5.4.2.3 算法 · 诊断 · 已知 · 导入 · 场景 · 可视化 · 关联 · 标注">
    <template #tabs>
      <el-tabs v-model="tab" class="shell-tab-bar narrow-tabs">
        <el-tab-pane label="故障定位算法管理" name="t1" />
        <el-tab-pane label="故障诊断分析" name="t2" />
        <el-tab-pane label="已知故障定位" name="t3" />
        <el-tab-pane label="算法导入与自动化" name="t4" />
        <el-tab-pane label="全场景诊断" name="t5" />
        <el-tab-pane label="诊断可视化" name="t6" />
        <el-tab-pane label="多维数据关联" name="t7" />
        <el-tab-pane label="诊断结果标注" name="t8" />
      </el-tabs>
    </template>

    <div v-show="tab === 't1'" class="pane">
      <PagedTable :data="algoList" :page-size="8" row-key="id">
        <el-table-column prop="name" label="算法" />
        <el-table-column prop="ver" label="版本" width="88" />
        <el-table-column prop="latencyMs" label="时延ms" width="96" />
        <el-table-column prop="cover" label="覆盖" width="80" />
      </PagedTable>
    </div>

    <div v-show="tab === 't2'" class="pane split">
      <div class="left">
        <div class="cap">诊断流水线</div>
        <el-timeline>
          <el-timeline-item
            v-for="(e, i) in timeLine"
            :key="i"
            :type="e.ok ? 'success' : 'warning'"
            :timestamp="e.t"
          >
            {{ e.a }}
          </el-timeline-item>
        </el-timeline>
      </div>
      <div class="right">
        <MiniChart :option="vizTrend" :height="240" />
      </div>
    </div>

    <div v-show="tab === 't3'" class="pane">
      <PagedTable :data="knownFaults" :page-size="10" row-key="id">
        <el-table-column prop="code" label="编码" width="100" />
        <el-table-column prop="title" label="故障" />
        <el-table-column prop="beam" label="波束" width="72" />
        <el-table-column prop="hit" label="确认" width="88" />
      </PagedTable>
    </div>

    <div v-show="tab === 't4'" class="pane">
      <PagedTable :data="importJobs" :page-size="8" row-key="id">
        <el-table-column prop="file" label="包" />
        <el-table-column prop="status" label="状态" width="88" />
        <el-table-column prop="time" label="时间" width="158" />
      </PagedTable>
    </div>

    <div v-show="tab === 't5'" class="pane">
      <PagedTable :data="sceneRuns" :page-size="8" row-key="id">
        <el-table-column prop="scene" label="场景" width="120" />
        <el-table-column prop="result" label="结果" />
        <el-table-column prop="dur" label="耗时" width="72" />
      </PagedTable>
    </div>

    <div v-show="tab === 't6'" class="pane">
      <MiniChart :option="vizTrend" :height="280" />
    </div>

    <div v-show="tab === 't7'" class="pane">
      <PagedTable :data="relateRows" :page-size="10" row-key="id">
        <el-table-column prop="dim" label="维度" width="72" />
        <el-table-column prop="key" label="键" width="120" />
        <el-table-column prop="link" label="关联" />
      </PagedTable>
    </div>

    <div v-show="tab === 't8'" class="pane">
      <PagedTable :data="labels" :page-size="10" row-key="id">
        <el-table-column prop="diagId" label="诊断ID" width="120" />
        <el-table-column prop="tag" label="标注" width="88" />
        <el-table-column prop="user" label="人员" width="88" />
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
.split {
  flex-direction: row;
  gap: 16px;
}
.left {
  width: 280px;
  flex-shrink: 0;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 12px;
}
.right {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}
.cap {
  font-size: 12px;
  margin-bottom: 8px;
  color: var(--el-text-color-secondary);
}
.narrow-tabs :deep(.el-tabs__item) {
  padding: 0 12px;
  font-size: 12px;
}
</style>
