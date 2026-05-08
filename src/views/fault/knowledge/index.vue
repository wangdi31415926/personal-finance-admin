<script setup lang="ts">
import { ref } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import { simplePieOption, fmtTime } from "@/views/_shared/mockUtils";

defineOptions({ name: "FaultKnowledge" });

const tab = ref<"kb" | "diagBuild" | "manual" | "graph">("kb");

const kbItems = ref(
  Array.from({ length: 18 }, (_, i) => ({
    id: `KB-${1600 + i}`,
    cat: ["链路", "资源", "协议", "同步"][i % 4],
    title: ["出站拥塞", "误码突刺", "CPU 热点", "时钟漂移"][i % 4],
    score: 80 + (i % 15),
    beam: `B-${(i % 6) + 1}`,
    source: ["工单沉淀", "演练复盘", "厂商通告"][i % 3],
    hits30d: 5 + (i % 42),
    owner: `知识-${(i % 3) + 1}`,
    updatedAt: fmtTime(new Date(Date.now() - i * 86400000)),
    classification: ["受限", "内部", "公开"][i % 3]
  }))
);

const diagCases = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `DC-${1700 + i}`,
    symptom: "出站时延 > 120ms 且误码率抬升",
    root: ["波束拥塞", "地面链路抖动", "调制异常"][i % 3],
    status: ["草稿", "已发布", "复核中"][i % 3],
    confidence: `${76 + (i % 20)}%`,
    beam: `B-${(i % 6) + 1}`,
    relatedAlarm: `ALM-${2480 + i}`,
    editor: `诊断-${(i % 4) + 1}`,
    updatedAt: fmtTime(new Date(Date.now() - i * 43200000)),
    ver: `D-${1 + (i % 3)}.${i % 8}`
  }))
);

const manuals = ref(
  Array.from({ length: 12 }, (_, i) => ({
    id: `MN-${1800 + i}`,
    name: `北斗短报文-${["应急", "扩容", "主备切换", "观测"][i % 4]}手册`,
    ver: `v${1 + (i % 4)}.${i % 6}`,
    chapter: `${2 + (i % 5)}.${i % 9} 节`,
    pages: 40 + (i % 80),
    author: `编制-${(i % 3) + 1}`,
    approvedBy: `批准-${(i % 2) + 1}`,
    effectiveAt: fmtTime(new Date(Date.now() - i * 86400000 * 20)),
    nextReview: fmtTime(new Date(Date.now() + i * 86400000 * 60))
  }))
);

const pie = () =>
  simplePieOption("知识库分类占比", [
    { name: "链路", value: 32 },
    { name: "资源", value: 28 },
    { name: "协议", value: 22 },
    { name: "同步", value: 18 }
  ]);

const graphOpt = {
  tooltip: {},
  series: [
    {
      type: "graph",
      layout: "force",
      roam: true,
      draggable: true,
      symbolSize: 46,
      label: { show: true, fontSize: 10 },
      force: { repulsion: 200 },
      data: [
        { name: "DEV-RX01", category: 0 },
        { name: "FLT-OUT-09", category: 1 },
        { name: "MN-应急", category: 2 },
        { name: "TK-PAT-03", category: 3 }
      ],
      links: [
        { source: "DEV-RX01", target: "FLT-OUT-09" },
        { source: "FLT-OUT-09", target: "MN-应急" },
        { source: "FLT-OUT-09", target: "TK-PAT-03" }
      ],
      categories: [
        { name: "设备" },
        { name: "故障" },
        { name: "手册" },
        { name: "任务" }
      ],
      lineStyle: { curveness: 0.15 }
    }
  ]
};
</script>

<template>
  <PageShell title="知识库管理" subtitle="5.4.2.2 知识库 · 诊断库 · 手册 · 关联视图">
    <template #tabs>
      <el-tabs v-model="tab" class="shell-tab-bar">
        <el-tab-pane label="知识库检索" name="kb" />
        <el-tab-pane label="诊断知识库构建" name="diagBuild" />
        <el-tab-pane label="手册库" name="manual" />
        <el-tab-pane label="设备运维关联图谱" name="graph" />
      </el-tabs>
    </template>

    <div v-show="tab === 'kb'" class="pane">
      <el-row :gutter="12">
        <el-col :span="10">
          <MiniChart :option="pie()" :height="220" />
        </el-col>
        <el-col :span="14">
          <PagedTable :data="kbItems" :page-size="8" row-key="id">
            <el-table-column prop="id" label="条目ID" width="108" />
            <el-table-column prop="cat" label="分类" width="72" />
            <el-table-column prop="title" label="标题" min-width="100" />
            <el-table-column prop="beam" label="波束" width="72" />
            <el-table-column prop="score" label="匹配分" width="80" />
            <el-table-column prop="source" label="来源" width="100" />
            <el-table-column prop="hits30d" label="30日命中" width="96" />
            <el-table-column prop="owner" label="维护人" width="88" />
            <el-table-column prop="classification" label="密级" width="80" />
            <el-table-column prop="updatedAt" label="更新时间" width="158" />
          </PagedTable>
        </el-col>
      </el-row>
    </div>

    <div v-show="tab === 'diagBuild'" class="pane">
      <el-steps :active="2" finish-status="success" align-center class="mb">
        <el-step title="症状结构化" />
        <el-step title="根因候选" />
        <el-step title="校验发布" />
      </el-steps>
      <PagedTable :data="diagCases" :page-size="8" row-key="id">
        <el-table-column prop="id" label="案例ID" width="108" />
        <el-table-column prop="symptom" label="症状描述" min-width="180" show-overflow-tooltip />
        <el-table-column prop="root" label="根因模板" width="120" />
        <el-table-column prop="beam" label="波束" width="72" />
        <el-table-column prop="confidence" label="置信度" width="88" />
        <el-table-column prop="relatedAlarm" label="关联告警" width="112" />
        <el-table-column prop="status" label="状态" width="88" />
        <el-table-column prop="ver" label="版本" width="88" />
        <el-table-column prop="editor" label="编辑人" width="88" />
        <el-table-column prop="updatedAt" label="更新时间" width="158" />
      </PagedTable>
    </div>

    <div v-show="tab === 'manual'" class="pane">
      <PagedTable :data="manuals" :page-size="8" row-key="id">
        <el-table-column prop="id" label="手册ID" width="108" />
        <el-table-column prop="name" label="名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="ver" label="版本" width="88" />
        <el-table-column prop="chapter" label="锚点章节" width="100" />
        <el-table-column prop="pages" label="页数" width="72" />
        <el-table-column prop="author" label="编制" width="88" />
        <el-table-column prop="approvedBy" label="批准" width="88" />
        <el-table-column prop="effectiveAt" label="生效日期" width="158" />
        <el-table-column prop="nextReview" label="复审计划" width="158" />
      </PagedTable>
      <el-alert
        class="mt"
        type="info"
        :closable="false"
        title="在线预览：左侧目录树 + 右侧 Markdown 渲染（mock）"
        show-icon
      />
    </div>

    <div v-show="tab === 'graph'" class="pane">
      <MiniChart :option="graphOpt" :height="360" />
    </div>
  </PageShell>
</template>

<style scoped>
.pane {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.mb {
  margin-bottom: 10px;
}
.mt {
  margin-top: 10px;
}
</style>
