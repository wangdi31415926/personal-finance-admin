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
    cover: `${85 + (i % 10)}%`,
    trainSet: `train_${["beam", "fault", "cn0"][i % 3]}_${202605 + i}`,
    runtime: ["在线", "离线批"][i % 2],
    gpuMemGb: i % 4 === 0 ? 16 : 0,
    owner: `算法-${(i % 3) + 1}`,
    lastEval: fmtTime(new Date(Date.now() - i * 86400000))
  }))
);

const knownFaults = ref(
  Array.from({ length: 16 }, (_, i) => ({
    id: `KF-${2000 + i}`,
    code: `K-${4200 + i}`,
    title: ["出站队列满", "监测接收机失锁", "调制模板漂移"][i % 3],
    beam: `B-${(i % 6) + 1}`,
    hit: i % 5 === 0 ? "待复核" : "已确认",
    satellite: `IGSO-${(i % 3) + 1}`,
    mttrMin: 22 + (i % 40),
    recurrence: `${(0.5 + (i % 5) * 0.3).toFixed(1)}次/月`,
    owner: `知识-${(i % 3) + 1}`,
    updatedAt: fmtTime(new Date(Date.now() - i * 7200000))
  }))
);

const importJobs = ref(
  Array.from({ length: 12 }, (_, i) => ({
    id: `IJ-${2100 + i}`,
    file: `diag-pack-${i + 1}.zip`,
    status: ["校验中", "已入库", "失败"][i % 3],
    time: fmtTime(new Date(Date.now() - i * 3600000)),
    sizeMb: (8 + (i % 15) * 3.2).toFixed(1),
    sha256: `${String(i).repeat(4)}ab…${(i + 9).toString(16)}`,
    operator: `导入-${(i % 3) + 1}`,
    records: 1200 + i * 210,
    env: ["灰度", "生产"][i % 2]
  }))
);

const sceneRuns = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `SC-${2200 + i}`,
    scene: ["全天场景", "峰值窗口", "应急演练", "割接窗口"][i % 4],
    result: i % 7 === 0 ? "疑似环境噪声" : "定位成功",
    dur: `${12 + (i % 8)}s`,
    traceId: `SCN-${20260509}-${String(i).padStart(4, "0")}`,
    beam: `B-${(i % 6) + 1}`,
    moMt: ["MO 偏重", "均衡", "MT 偏重"][i % 3],
    peakLoad: `${55 + (i % 35)}%`,
    reviewer: `演练-${(i % 4) + 1}`,
    startedAt: fmtTime(new Date(Date.now() - i * 5400000))
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
    link: `→ FLT-${430 + i}`,
    weight: (0.15 + (i % 10) * 0.07).toFixed(2),
    timeAlign: ["±2s", "±30s", "±5min"][i % 3],
    evidenceLevel: ["强", "中", "弱"][i % 3],
    sourceSys: ["信服", "网关", "CMDB"][i % 3],
    capturedAt: fmtTime(new Date(Date.now() - i * 600000))
  }))
);

const labels = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `LB-${2400 + i}`,
    diagId: `DG-${560 + i}`,
    tag: ["误报", "待观察", "确认故障"][i % 3],
    user: `标注员-${(i % 4) + 1}`,
    confidenceBefore: `${70 + (i % 20)}%`,
    confidenceAfter: `${75 + (i % 20)}%`,
    remark: ["补充链路日志", "排除终端因素", "建议复核阈值"][i % 3],
    beam: `B-${(i % 6) + 1}`,
    labeledAt: fmtTime(new Date(Date.now() - i * 900000))
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
        <el-table-column prop="id" label="算法ID" width="108" />
        <el-table-column prop="name" label="算法名称" min-width="110" />
        <el-table-column prop="ver" label="版本" width="88" />
        <el-table-column prop="trainSet" label="训练集" min-width="130" show-overflow-tooltip />
        <el-table-column prop="runtime" label="运行形态" width="96" />
        <el-table-column prop="latencyMs" label="时延ms" width="96" />
        <el-table-column prop="cover" label="覆盖率" width="88" />
        <el-table-column prop="gpuMemGb" label="GPU GB" width="88" />
        <el-table-column prop="owner" label="负责人" width="88" />
        <el-table-column prop="lastEval" label="最近评估" width="158" />
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
        <el-table-column prop="id" label="记录ID" width="108" />
        <el-table-column prop="code" label="故障编码" width="108" />
        <el-table-column prop="title" label="故障名称" min-width="130" />
        <el-table-column prop="beam" label="波束" width="72" />
        <el-table-column prop="satellite" label="卫星/星座元" width="108" />
        <el-table-column prop="mttrMin" label="MTTR分" width="88" />
        <el-table-column prop="recurrence" label="复发频度" width="100" />
        <el-table-column prop="hit" label="确认状态" width="96" />
        <el-table-column prop="owner" label="维护人" width="88" />
        <el-table-column prop="updatedAt" label="更新时间" width="158" />
      </PagedTable>
    </div>

    <div v-show="tab === 't4'" class="pane">
      <PagedTable :data="importJobs" :page-size="8" row-key="id">
        <el-table-column prop="id" label="任务ID" width="108" />
        <el-table-column prop="file" label="导入包" min-width="140" show-overflow-tooltip />
        <el-table-column prop="sizeMb" label="大小MB" width="88" />
        <el-table-column prop="sha256" label="SHA256(简)" width="120" show-overflow-tooltip />
        <el-table-column prop="records" label="记录数" width="96" />
        <el-table-column prop="env" label="目标环境" width="96" />
        <el-table-column prop="status" label="状态" width="88" />
        <el-table-column prop="operator" label="操作人" width="88" />
        <el-table-column prop="time" label="提交时间" width="158" />
      </PagedTable>
    </div>

    <div v-show="tab === 't5'" class="pane">
      <PagedTable :data="sceneRuns" :page-size="8" row-key="id">
        <el-table-column prop="id" label="运行ID" width="108" />
        <el-table-column prop="scene" label="场景" width="120" />
        <el-table-column prop="traceId" label="TraceId" width="128" show-overflow-tooltip />
        <el-table-column prop="beam" label="波束" width="72" />
        <el-table-column prop="moMt" label="业务侧重" width="100" />
        <el-table-column prop="peakLoad" label="峰值负载" width="96" />
        <el-table-column prop="result" label="诊断结论" min-width="120" />
        <el-table-column prop="dur" label="耗时" width="72" />
        <el-table-column prop="reviewer" label="复盘人" width="88" />
        <el-table-column prop="startedAt" label="开始时间" width="158" />
      </PagedTable>
    </div>

    <div v-show="tab === 't6'" class="pane">
      <MiniChart :option="vizTrend" :height="280" />
    </div>

    <div v-show="tab === 't7'" class="pane">
      <PagedTable :data="relateRows" :page-size="10" row-key="id">
        <el-table-column prop="id" label="证据ID" width="108" />
        <el-table-column prop="dim" label="维度" width="72" />
        <el-table-column prop="key" label="特征键" width="120" />
        <el-table-column prop="link" label="关联对象" min-width="110" />
        <el-table-column prop="weight" label="权重" width="72" />
        <el-table-column prop="timeAlign" label="时间对齐" width="96" />
        <el-table-column prop="evidenceLevel" label="证据等级" width="96" />
        <el-table-column prop="sourceSys" label="来源系统" width="96" />
        <el-table-column prop="capturedAt" label="采集时间" width="158" />
      </PagedTable>
    </div>

    <div v-show="tab === 't8'" class="pane">
      <PagedTable :data="labels" :page-size="10" row-key="id">
        <el-table-column prop="id" label="标注ID" width="108" />
        <el-table-column prop="diagId" label="诊断ID" width="120" />
        <el-table-column prop="beam" label="波束" width="72" />
        <el-table-column prop="tag" label="标注结论" width="100" />
        <el-table-column prop="confidenceBefore" label="标注前置信" width="112" />
        <el-table-column prop="confidenceAfter" label="标注后置信" width="112" />
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
        <el-table-column prop="user" label="标注人" width="88" />
        <el-table-column prop="labeledAt" label="标注时间" width="158" />
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
