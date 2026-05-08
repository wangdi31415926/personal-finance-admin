<script setup lang="ts">
import { ref } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import { simplePieOption } from "@/views/_shared/mockUtils";

defineOptions({ name: "FaultKnowledge" });

const tab = ref<"kb" | "diagBuild" | "manual" | "graph">("kb");

const kbItems = ref(
  Array.from({ length: 18 }, (_, i) => ({
    id: `KB-${1600 + i}`,
    cat: ["链路", "资源", "协议", "同步"][i % 4],
    title: ["出站拥塞", "误码突刺", "CPU 热点", "时钟漂移"][i % 4],
    score: 80 + (i % 15),
    beam: `B-${(i % 6) + 1}`
  }))
);

const diagCases = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `DC-${1700 + i}`,
    symptom: "出站时延 > 120ms 且误码率抬升",
    root: ["波束拥塞", "地面链路抖动", "调制异常"][i % 3],
    status: ["草稿", "已发布", "复核中"][i % 3]
  }))
);

const manuals = ref(
  Array.from({ length: 12 }, (_, i) => ({
    id: `MN-${1800 + i}`,
    name: `北斗短报文-${["应急", "扩容", "主备切换", "观测"][i % 4]}手册`,
    ver: `v${1 + (i % 4)}.${i % 6}`,
    chapter: `${2 + (i % 5)}.${i % 9} 节`
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
            <el-table-column prop="cat" label="分类" width="72" />
            <el-table-column prop="title" label="条目" />
            <el-table-column prop="score" label="匹配分" width="80" />
            <el-table-column prop="beam" label="波束" width="72" />
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
        <el-table-column prop="symptom" label="症状" min-width="200" />
        <el-table-column prop="root" label="根因模板" width="120" />
        <el-table-column prop="status" label="状态" width="88" />
      </PagedTable>
    </div>

    <div v-show="tab === 'manual'" class="pane">
      <PagedTable :data="manuals" :page-size="8" row-key="id">
        <el-table-column prop="name" label="手册" />
        <el-table-column prop="ver" label="版本" width="88" />
        <el-table-column prop="chapter" label="定位章节" width="100" />
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
