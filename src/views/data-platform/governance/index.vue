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
    nextRun: fmtTime(new Date(Date.now() + i * 86400000)),
    status: ["已完成", "调度中", "失败"][i % 3]
  }))
);

const lifecycleRules = ref(
  Array.from({ length: 10 }, (_, i) => ({
    id: `LC-${500 + i}`,
    category: ["核心业务", "普通业务", "归档镜像"][i % 3],
    retain: `${1 + (i % 3)} 年`,
    action: ["迁移至温层", "归档冷存储", "到期销毁"][i % 3]
  }))
);

const entities = ref({
  device: Array.from({ length: 6 }, (_, i) => ({
    id: `DEV-${600 + i}`,
    name: `监测接收机-${i + 1}`,
    type: "设备实体",
    site: ["主站", "备站"][i % 2]
  })),
  fault: Array.from({ length: 6 }, (_, i) => ({
    id: `FLT-${610 + i}`,
    name: `出站链路抖动 #${i + 1}`,
    type: "故障实体",
    level: ["P0", "P1", "P2"][i % 3]
  })),
  task: Array.from({ length: 5 }, (_, i) => ({
    id: `TK-${620 + i}`,
    name: `巡检任务-${i + 1}`,
    type: "运维任务实体",
    owner: `运维-${(i % 4) + 1}`
  })),
  user: Array.from({ length: 5 }, (_, i) => ({
    id: `USR-${630 + i}`,
    name: `值班员-${i + 1}`,
    type: "用户实体",
    role: ["值班", "审核", "主管"][i % 3]
  })),
  doc: Array.from({ length: 5 }, (_, i) => ({
    id: `DOC-${640 + i}`,
    name: `手册-${["扩容", "切换", "应急", "回滚", "观测"][i]}`,
    type: "运维文档实体",
    ver: `v${1 + (i % 3)}`
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
    time: fmtTime(new Date(Date.now() - i * 86400000)),
    note: ["阈值收紧", "编码补齐", "新增波束字段", "关系模板"][i % 4]
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
          <PagedTable
            :data="
              Array.from({ length: 14 }, (_, i) => ({
                id: `OV-${i}`,
                field: ['rssi', 'latency', 'cpu'][i % 3],
                raw: `${80 + i}.${i}`,
                action: ['剔除', '修正', '标记'][i % 3]
              }))
            "
            :page-size="7"
            row-key="id"
          >
            <el-table-column prop="field" label="字段" />
            <el-table-column prop="raw" label="原始值" />
            <el-table-column prop="action" label="处置" />
          </PagedTable>
        </el-tab-pane>
        <el-tab-pane label="缺失值处理" name="missing">
          <PagedTable
            :data="
              Array.from({ length: 12 }, (_, i) => ({
                id: `MV-${i}`,
                field: ['beam_id', 'freq', 'remark'][i % 3],
                fill: ['关联推导', '默认值', '均值填充'][i % 3]
              }))
            "
            :page-size="6"
            row-key="id"
          >
            <el-table-column prop="field" label="字段" />
            <el-table-column prop="fill" label="填充策略" />
          </PagedTable>
        </el-tab-pane>
        <el-tab-pane label="冗余数据" name="dup">
          <PagedTable
            :data="
              Array.from({ length: 10 }, (_, i) => ({
                id: `RD-${i}`,
                key: `设备+时间戳`,
                removed: 2 + (i % 4),
                rule: ['最晚采集优先', '最早优先'][i % 2]
              }))
            "
            :page-size="5"
            row-key="id"
          >
            <el-table-column prop="key" label="去重键" />
            <el-table-column prop="removed" label="删除条数" width="100" />
            <el-table-column prop="rule" label="保留策略" />
          </PagedTable>
        </el-tab-pane>
        <el-tab-pane label="非结构化结构化" name="unstruct">
          <PagedTable
            :data="
              Array.from({ length: 12 }, (_, i) => ({
                id: `US-${i}`,
                src: ['故障报告.pdf', '语音日志.wav', '站台照片.jpg'][i % 3],
                extracted: ['设备编号', '故障码', '拍摄时间'][i % 3],
                ok: i % 6 !== 0
              }))
            "
            :page-size="6"
            row-key="id"
          >
            <el-table-column prop="src" label="来源" />
            <el-table-column prop="extracted" label="抽取字段" />
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
            <el-table-column prop="type" label="类型" width="72" />
            <el-table-column prop="scope" label="范围" />
            <el-table-column prop="site" label="站点" width="100" />
            <el-table-column prop="nextRun" label="下次执行" width="158" />
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
        <el-table-column prop="category" label="数据类别" />
        <el-table-column prop="retain" label="留存" width="88" />
        <el-table-column prop="action" label="到期动作" />
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
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column label="属性" min-width="100">
              <template #default="{ row }">
                <span v-if="entityTab === 'device'">{{ (row as any).site }}</span>
                <span v-else-if="entityTab === 'fault'">{{ (row as any).level }}</span>
                <span v-else-if="entityTab === 'task'">{{ (row as any).owner }}</span>
                <span v-else-if="entityTab === 'user'">{{ (row as any).role }}</span>
                <span v-else>{{ (row as any).ver }}</span>
              </template>
            </el-table-column>
          </PagedTable>
        </div>
      </div>
      <div class="table-caption">抽取规则版本</div>
      <PagedTable :data="ruleVersions" :page-size="8" row-key="id" row-clickable @row-click="openRule">
        <el-table-column prop="ver" label="版本" width="88" />
        <el-table-column prop="editor" label="修改人" width="88" />
        <el-table-column prop="time" label="时间" width="158" />
        <el-table-column prop="note" label="摘要" />
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
