<script setup lang="ts">
import { computed, ref } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import DetailDrawer from "@/views/_shared/DetailDrawer.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import {
  genTimeSeries,
  simpleLineOption,
  simplePieOption,
  fmtTime,
  tagTypeOf
} from "@/views/_shared/mockUtils";

defineOptions({ name: "DpGovernance" });

const mainTab = ref<"regularize" | "storage" | "extract">("regularize");
const stepActive = ref(4);
const cleanTab = ref<"outlier" | "missing" | "dup" | "unstruct">("outlier");

const pipelineMetrics = computed(() => {
  const { ts, values } = genTimeSeries(14, 88, 25, 11);
  return simpleLineOption("规整链路吞吐（千条/小时）", ts, values);
});

const heatPie = computed(() =>
  simplePieOption("热温冷占比（分层存储）", [
    { name: "热数据 SSD", value: 38 },
    { name: "温数据 SAS", value: 35 },
    { name: "冷数据 磁带", value: 27 }
  ])
);

const backupTasks = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `BK-${400 + i}`,
    type: ["全量", "增量", "差异"][i % 3],
    scope: ["核心故障表", "规整日志", "镜像索引", "出站指标"][i % 4],
    site: i % 2 === 0 ? "本地机房" : "异地灾备",
    policyId: `POL-BKP-${240 + (i % 8)}`,
    durationMin: 20 + (i % 90),
    sizeGb: (12 + (i % 40) * 3.2).toFixed(1),
    owner: `备份-${(i % 3) + 1}`,
    nextRun: fmtTime(new Date(Date.now() + i * 86400000)),
    lastResult: ["成功", "成功", "校验警告", "失败"][i % 4],
    status: ["已完成", "调度中", "失败"][i % 3]
  }))
);

const lifecycleRules = ref(
  Array.from({ length: 10 }, (_, i) => ({
    id: `LC-${500 + i}`,
    datasetCode: `DS-${["ODS", "DWD", "ARCH"][i % 3]}-${420 + i}`,
    category: ["核心业务", "普通业务", "归档镜像"][i % 3],
    retain: `${1 + (i % 3)} 年`,
    action: ["迁移至温层", "归档冷存储", "到期销毁"][i % 3],
    effectiveFrom: fmtTime(new Date(Date.now() - i * 86400000 * 30)),
    reviewCycle: ["季度", "半年", "年度"][i % 3],
    owner: `数据治理-${(i % 2) + 1}`,
    compliance: ["等保三级", "内部规范", "军队档案"][i % 3]
  }))
);

const entities = ref({
  device: Array.from({ length: 6 }, (_, i) => ({
    id: `DEV-${600 + i}`,
    name: `监测接收机-${i + 1}`,
    type: "设备实体",
    site: ["主站", "备站"][i % 2],
    vendor: ["国产A", "国产B", "合资C"][i % 3],
    healthScore: 72 + (i * 11) % 25,
    firmware: `RX-${2 + (i % 4)}.${i % 12}`,
    lastHeartbeat: fmtTime(new Date(Date.now() - i * 120000))
  })),
  fault: Array.from({ length: 6 }, (_, i) => ({
    id: `FLT-${610 + i}`,
    name: `出站链路抖动 #${i + 1}`,
    type: "故障实体",
    level: ["P0", "P1", "P2"][i % 3],
    beam: `B-${(i % 6) + 1}`,
    occurrences30d: 1 + (i % 8),
    mttrMin: 18 + (i % 45),
    status: ["已归档", "跟踪中", "待复盘"][i % 3]
  })),
  task: Array.from({ length: 5 }, (_, i) => ({
    id: `TK-${620 + i}`,
    name: `巡检任务-${i + 1}`,
    type: "运维任务实体",
    owner: `运维-${(i % 4) + 1}`,
    priority: ["P0", "P1", "P2"][i % 3],
    nextRun: fmtTime(new Date(Date.now() + i * 43200000)),
    slaMin: 25 + (i % 20),
    state: ["待执行", "执行中", "已闭环"][i % 3]
  })),
  user: Array.from({ length: 5 }, (_, i) => ({
    id: `USR-${630 + i}`,
    name: `值班员-${i + 1}`,
    type: "用户实体",
    role: ["值班", "审核", "主管"][i % 3],
    shiftGroup: ["甲班", "乙班", "机动"][i % 3],
    phoneMasked: `138****${1000 + i}`,
    lastLogin: fmtTime(new Date(Date.now() - i * 3600000))
  })),
  doc: Array.from({ length: 5 }, (_, i) => ({
    id: `DOC-${640 + i}`,
    name: `手册-${["扩容", "切换", "应急", "回滚", "观测"][i]}`,
    type: "运维文档实体",
    ver: `v${1 + (i % 3)}`,
    classification: ["内部", "受限", "公开"][i % 3],
    approvedBy: `审批-${(i % 3) + 1}`,
    updatedAt: fmtTime(new Date(Date.now() - i * 86400000 * (i % 5 + 1)))
  }))
});

const entityTab = ref<keyof typeof entities.value>("device");

const graphOption = computed(() => ({
  tooltip: {},
  series: [
    {
      type: "graph",
      layout: "force",
      roam: true,
      draggable: true,
      symbolSize: 52,
      edgeSymbol: ["circle", "arrow"],
      edgeSymbolSize: [4, 10],
      label: { show: true, fontSize: 10 },
      force: { repulsion: 220, edgeLength: [80, 140] },
      data: [
        { name: "DEV-601", category: 0 },
        { name: "FLT-611", category: 1 },
        { name: "TK-620", category: 2 },
        { name: "USR-630", category: 3 },
        { name: "DOC-640", category: 4 }
      ],
      links: [
        { source: "DEV-601", target: "FLT-611" },
        { source: "FLT-611", target: "TK-620" },
        { source: "TK-620", target: "USR-630" },
        { source: "FLT-611", target: "DOC-640" }
      ],
      categories: [
        { name: "设备" },
        { name: "故障" },
        { name: "任务" },
        { name: "用户" },
        { name: "文档" }
      ],
      lineStyle: { color: "source", curveness: 0.18 }
    }
  ]
}));

const ruleVersions = ref(
  Array.from({ length: 12 }, (_, i) => ({
    id: `RV-${700 + i}`,
    ver: `v${2 + (i % 4)}.${i % 5}`,
    editor: `运维-${(i % 3) + 1}`,
    changeSet: `${3 + (i % 5)} 文件`,
    tested: i % 4 !== 0,
    rollbackVer: `v${1 + (i % 3)}.${(i + 2) % 5}`,
    deployEnv: ["灰度", "生产", "演练"][i % 3],
    time: fmtTime(new Date(Date.now() - i * 86400000)),
    note: ["阈值收紧", "编码补齐", "新增波束字段", "关系模板"][i % 4]
  }))
);

const outlierRows = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `OV-${i}`,
    field: ["rssi_dbm", "latency_ms", "cpu_pct"][i % 3],
    rawValue: `${80 + i}.${i % 10}`,
    unit: ["dBm", "ms", "%"][i % 3],
    ruleId: `CLN-R-${440 + i}`,
    severity: ["高", "中", "低"][i % 3],
    action: ["剔除", "修正", "标记保留"][i % 3],
    beamId: `B-${(i % 6) + 1}`,
    batchId: `BT-${20260509}-${String(i).padStart(3, "0")}`,
    detectedAt: fmtTime(new Date(Date.now() - i * 180000))
  }))
);

const missingRows = ref(
  Array.from({ length: 12 }, (_, i) => ({
    id: `MV-${i}`,
    field: ["beam_id", "carrier_freq", "remark_txt"][i % 3],
    missingRate: `${(0.3 + (i % 7) * 0.4).toFixed(1)}%`,
    fillStrategy: ["关联推导", "业务默认值", "时段均值"][i % 3],
    confidence: `${70 + (i % 25)}%`,
    sourceTable: ["ods_terminal_evt", "dwd_link_metric", "ods_alarm_raw"][i % 3],
    reviewer: `质检-${(i % 3) + 1}`,
    beamId: `B-${(i % 5) + 2}`,
    batchId: `MV-${20260509}-${i}`
  }))
);

const dupRows = ref(
  Array.from({ length: 10 }, (_, i) => ({
    id: `RD-${i}`,
    dedupeKey: `device_id+ts_${i % 4}`,
    collisionWindow: `${30 + (i % 5) * 10}s`,
    removedCount: 2 + (i % 4),
    retainedKey: `first_seen_${420 + i}`,
    rule: ["最晚采集优先", "最早优先", "权重最高"][i % 3],
    beamId: `B-${(i % 6) + 1}`,
    status: ["已清理", "复审中"][i % 2],
    operator: `批任务-${(i % 2) + 1}`
  }))
);

const unstructRows = ref(
  Array.from({ length: 12 }, (_, i) => ({
    id: `US-${i}`,
    src: ["故障报告.pdf", "语音日志.wav", "站台照片.jpg"][i % 3],
    mimeType: ["application/pdf", "audio/wav", "image/jpeg"][i % 3],
    extractedField: ["设备编号", "故障码", "拍摄时间"][i % 3],
    confidence: `${65 + (i % 30)}%`,
    engine: ["OCR-v3", "ASR-北斗专版", "CV-站点"][i % 3],
    durationMs: 800 + i * 120,
    ok: i % 6 !== 0,
    reviewer: `结构化-${(i % 3) + 1}`
  }))
);

const drawer = ref(false);
const drawerTitle = ref("");
const drawerText = ref("");

function openRule(row: { ver: string }) {
  drawerTitle.value = `规则版本 ${row.ver}`;
  drawerText.value =
    "可视化规则配置：校验 / 清洗 / 标准化 / 归一化。此处为 mock，展示回溯与回滚入口。";
  drawer.value = true;
}
</script>

<template>
  <PageShell title="数据综合治理" subtitle="5.4.1.2 规整 · 存储备份 · 实体关系抽取">
    <template #toolbar>
      <el-button size="small">导出规整报告</el-button>
      <el-button type="primary" size="small">触发批量规整</el-button>
    </template>
    <template #tabs>
      <el-tabs v-model="mainTab" class="shell-tab-bar">
        <el-tab-pane label="数据规整处理" name="regularize" />
        <el-tab-pane label="存储备份与生命周期" name="storage" />
        <el-tab-pane label="实体/属性/关系抽取" name="extract" />
      </el-tabs>
    </template>

    <div v-show="mainTab === 'regularize'" class="pane">
      <el-steps :active="stepActive" align-center finish-status="success" class="steps-bar">
        <el-step title="接入" description="实时/批量" />
        <el-step title="校验分类" />
        <el-step title="深度清洗" />
        <el-step title="标准化" />
        <el-step title="归一化" />
        <el-step title="结果校验" />
        <el-step title="输出" />
      </el-steps>
      <div class="metric-strip">
        <el-tag>接入量 12.4k</el-tag>
        <el-tag type="success">清洗通过率 96.2%</el-tag>
        <el-tag type="warning">标准化通过率 93.1%</el-tag>
        <el-tag type="info">校验合格率 91.0%</el-tag>
      </div>
      <MiniChart :option="pipelineMetrics" :height="200" />

      <el-tabs v-model="cleanTab" type="border-card" class="inner-tabs">
        <el-tab-pane label="异常值处理" name="outlier">
          <PagedTable :data="outlierRows" :page-size="7" row-key="id">
            <el-table-column prop="field" label="字段" width="120" />
            <el-table-column prop="rawValue" label="原始值" width="88" />
            <el-table-column prop="unit" label="单位" width="72" />
            <el-table-column prop="ruleId" label="规则ID" width="108" />
            <el-table-column prop="severity" label="严重度" width="80" />
            <el-table-column prop="beamId" label="波束" width="72" />
            <el-table-column prop="action" label="处置动作" width="100" />
            <el-table-column prop="batchId" label="批次" width="128" show-overflow-tooltip />
            <el-table-column prop="detectedAt" label="检出时间" width="158" />
          </PagedTable>
        </el-tab-pane>
        <el-tab-pane label="缺失值处理" name="missing">
          <PagedTable :data="missingRows" :page-size="6" row-key="id">
            <el-table-column prop="field" label="字段" width="140" />
            <el-table-column prop="missingRate" label="缺失率" width="88" />
            <el-table-column prop="fillStrategy" label="填充策略" min-width="100" />
            <el-table-column prop="confidence" label="置信度" width="88" />
            <el-table-column prop="sourceTable" label="来源表" min-width="140" show-overflow-tooltip />
            <el-table-column prop="beamId" label="波束" width="72" />
            <el-table-column prop="reviewer" label="复核人" width="88" />
            <el-table-column prop="batchId" label="批次" width="120" />
          </PagedTable>
        </el-tab-pane>
        <el-tab-pane label="冗余数据" name="dup">
          <PagedTable :data="dupRows" :page-size="5" row-key="id">
            <el-table-column prop="dedupeKey" label="去重键定义" min-width="120" />
            <el-table-column prop="collisionWindow" label="碰撞窗口" width="100" />
            <el-table-column prop="removedCount" label="删除条数" width="96" />
            <el-table-column prop="retainedKey" label="保留记录" width="120" show-overflow-tooltip />
            <el-table-column prop="rule" label="保留策略" width="108" />
            <el-table-column prop="beamId" label="波束" width="72" />
            <el-table-column prop="status" label="状态" width="88" />
            <el-table-column prop="operator" label="执行体" width="96" />
          </PagedTable>
        </el-tab-pane>
        <el-tab-pane label="非结构化结构化" name="unstruct">
          <PagedTable :data="unstructRows" :page-size="6" row-key="id">
            <el-table-column prop="src" label="来源文件" min-width="120" />
            <el-table-column prop="mimeType" label="MIME" width="120" show-overflow-tooltip />
            <el-table-column prop="extractedField" label="抽取字段" width="100" />
            <el-table-column prop="confidence" label="置信度" width="88" />
            <el-table-column prop="engine" label="引擎" width="120" />
            <el-table-column prop="durationMs" label="耗时ms" width="88" />
            <el-table-column prop="reviewer" label="复核" width="88" />
            <el-table-column prop="ok" label="结果" width="88">
              <template #default="{ row }">
                <el-tag :type="row.ok ? 'success' : 'danger'" size="small">{{
                  row.ok ? "成功" : "待复核"
                }}</el-tag>
              </template>
            </el-table-column>
          </PagedTable>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div v-show="mainTab === 'storage'" class="pane">
      <el-row :gutter="12">
        <el-col :span="8">
          <MiniChart :option="heatPie" :height="240" />
        </el-col>
        <el-col :span="16">
          <div class="table-caption">备份任务（本地 + 异地）</div>
          <PagedTable :data="backupTasks" :page-size="7" row-key="id">
            <el-table-column prop="id" label="任务ID" width="100" />
            <el-table-column prop="type" label="类型" width="72" />
            <el-table-column prop="scope" label="范围" min-width="120" show-overflow-tooltip />
            <el-table-column prop="site" label="站点" width="100" />
            <el-table-column prop="policyId" label="策略" width="108" />
            <el-table-column prop="durationMin" label="预计分钟" width="96" />
            <el-table-column prop="sizeGb" label="体量GB" width="88" />
            <el-table-column prop="owner" label="责任人" width="88" />
            <el-table-column prop="nextRun" label="下次执行" width="158" />
            <el-table-column prop="lastResult" label="上次结果" width="96" />
            <el-table-column prop="status" label="状态" width="88">
              <template #default="{ row }">
                <el-tag :type="tagTypeOf(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </PagedTable>
        </el-col>
      </el-row>
      <div class="table-caption mt">生命周期策略</div>
      <PagedTable :data="lifecycleRules" :page-size="8" row-key="id">
        <el-table-column prop="id" label="规则ID" width="100" />
        <el-table-column prop="datasetCode" label="数据集" min-width="120" />
        <el-table-column prop="category" label="数据类别" width="100" />
        <el-table-column prop="retain" label="留存周期" width="96" />
        <el-table-column prop="action" label="到期动作" width="108" />
        <el-table-column prop="effectiveFrom" label="生效时间" width="158" />
        <el-table-column prop="reviewCycle" label="复核周期" width="96" />
        <el-table-column prop="owner" label="责任人" width="96" />
        <el-table-column prop="compliance" label="合规标签" width="100" />
      </PagedTable>
      <el-alert
        title="恢复向导（mock）：单文件 / 局部块 / 整库 — 已在运维控制台接入备份索引。"
        type="info"
        :closable="false"
        show-icon
        class="mt"
      />
    </div>

    <div v-show="mainTab === 'extract'" class="pane extract-pane">
      <el-tabs v-model="entityTab" type="card" class="entity-tabs">
        <el-tab-pane label="设备实体" name="device" />
        <el-tab-pane label="故障实体" name="fault" />
        <el-tab-pane label="运维任务实体" name="task" />
        <el-tab-pane label="用户实体" name="user" />
        <el-tab-pane label="运维文档实体" name="doc" />
      </el-tabs>
      <div class="extract-split">
        <div class="graph-cell">
          <MiniChart :option="graphOption" :height="280" />
        </div>
        <div class="table-cell">
          <PagedTable :data="entities[entityTab]" row-key="id" :page-size="8">
            <el-table-column prop="id" label="实体ID" width="100" />
            <el-table-column prop="name" label="名称" min-width="120" />
            <el-table-column prop="type" label="类型" width="110" />
            <el-table-column v-if="entityTab === 'device'" prop="site" label="站点" width="72" />
            <el-table-column v-if="entityTab === 'device'" prop="vendor" label="厂商" width="88" />
            <el-table-column v-if="entityTab === 'device'" prop="healthScore" label="健康分" width="88" />
            <el-table-column v-if="entityTab === 'device'" prop="firmware" label="固件" width="100" />
            <el-table-column v-if="entityTab === 'device'" prop="lastHeartbeat" label="最近心跳" width="158" />
            <el-table-column v-if="entityTab === 'fault'" prop="level" label="级别" width="72" />
            <el-table-column v-if="entityTab === 'fault'" prop="beam" label="波束" width="72" />
            <el-table-column v-if="entityTab === 'fault'" prop="occurrences30d" label="30日次数" width="100" />
            <el-table-column v-if="entityTab === 'fault'" prop="mttrMin" label="MTTR分" width="88" />
            <el-table-column v-if="entityTab === 'fault'" prop="status" label="状态" width="88" />
            <el-table-column v-if="entityTab === 'task'" prop="owner" label="责任人" width="88" />
            <el-table-column v-if="entityTab === 'task'" prop="priority" label="优先级" width="88" />
            <el-table-column v-if="entityTab === 'task'" prop="nextRun" label="下次执行" width="158" />
            <el-table-column v-if="entityTab === 'task'" prop="slaMin" label="SLA分" width="80" />
            <el-table-column v-if="entityTab === 'task'" prop="state" label="状态" width="88" />
            <el-table-column v-if="entityTab === 'user'" prop="role" label="角色" width="88" />
            <el-table-column v-if="entityTab === 'user'" prop="shiftGroup" label="班组" width="88" />
            <el-table-column v-if="entityTab === 'user'" prop="phoneMasked" label="联系方式" width="120" />
            <el-table-column v-if="entityTab === 'user'" prop="lastLogin" label="最近登录" width="158" />
            <el-table-column v-if="entityTab === 'doc'" prop="ver" label="版本" width="80" />
            <el-table-column v-if="entityTab === 'doc'" prop="classification" label="密级" width="88" />
            <el-table-column v-if="entityTab === 'doc'" prop="approvedBy" label="审批人" width="88" />
            <el-table-column v-if="entityTab === 'doc'" prop="updatedAt" label="更新时间" width="158" />
          </PagedTable>
        </div>
      </div>
      <div class="table-caption">抽取规则版本</div>
      <PagedTable :data="ruleVersions" :page-size="8" row-key="id" row-clickable @row-click="openRule">
        <el-table-column prop="id" label="记录ID" width="100" />
        <el-table-column prop="ver" label="版本" width="88" />
        <el-table-column prop="editor" label="修改人" width="88" />
        <el-table-column prop="changeSet" label="变更范围" width="96" />
        <el-table-column prop="tested" label="回归测" width="88">
          <template #default="{ row }">
            <el-tag :type="row.tested ? 'success' : 'warning'" size="small">{{
              row.tested ? "通过" : "未测"
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rollbackVer" label="可回滚至" width="100" />
        <el-table-column prop="deployEnv" label="发布环境" width="96" />
        <el-table-column prop="time" label="提交时间" width="158" />
        <el-table-column prop="note" label="摘要" min-width="120" show-overflow-tooltip />
      </PagedTable>
    </div>

    <DetailDrawer v-model="drawer" :title="drawerTitle">
      <p>{{ drawerText }}</p>
      <el-button type="primary" size="small">回滚至上一版本</el-button>
    </DetailDrawer>
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
.steps-bar {
  flex-shrink: 0;
}
.metric-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.inner-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.inner-tabs :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.inner-tabs :deep(.el-tab-pane) {
  height: 100%;
}
.table-caption {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.mt {
  margin-top: 8px;
}
.extract-pane {
  overflow: hidden;
}
.extract-split {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 12px;
  min-height: 280px;
}
@media (max-width: 960px) {
  .extract-split {
    grid-template-columns: 1fr;
  }
}
.graph-cell {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}
.table-cell {
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.entity-tabs {
  flex-shrink: 0;
}
</style>
