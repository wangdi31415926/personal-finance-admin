<script setup lang="ts">
import { ref } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import DetailDrawer from "@/views/_shared/DetailDrawer.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import { simpleBarOption, fmtTime } from "@/views/_shared/mockUtils";

defineOptions({ name: "FaultModel" });

const elements = ref(
  Array.from({ length: 16 }, (_, i) => ({
    id: `EL-${1400 + i}`,
    name: ["出站时延", "误码率", "CPU", "内存水位", "队列深度"][i % 5],
    weight: 10 + (i % 8),
    faultType: ["链路", "资源", "协议", "同步"][i % 4],
    linked: `FLT-${420 + i}`,
    kpiCode: `KPI-LNK-${(i % 6) + 1}`,
    beam: `B-${(i % 6) + 1}`,
    sampleWindow: ["15m", "1h", "24h"][i % 3],
    thresholdHint: `>${60 + (i % 20)}ms`,
    confidence: `${82 + (i % 15)}%`,
    updatedAt: fmtTime(new Date(Date.now() - i * 7200000))
  }))
);

const versions = ref(
  Array.from({ length: 12 }, (_, i) => ({
    id: `MV-${1500 + i}`,
    ver: `M-${2026}.${i % 9}.${i % 4}`,
    editor: `建模-${(i % 3) + 1}`,
    reviewer: `复核-${(i % 2) + 1}`,
    nodesChanged: 2 + (i % 6),
    edgesChanged: i % 5,
    coverage: `${88 + (i % 10)}%`,
    baseline: `BL-${20260501 + (i % 5)}`,
    time: fmtTime(new Date(Date.now() - i * 86400000)),
    delta: i % 3 === 0 ? "新增 3 条关联边" : "权重微调"
  }))
);

const barOpt = () =>
  simpleBarOption(
    "要素权重 Top6",
    ["出站时延", "误码率", "CPU", "队列", "同步偏差", "频点漂移"],
    [22, 18, 16, 14, 12, 10]
  );

const drawer = ref(false);
const current = ref<(typeof elements.value)[0] | null>(null);

function onRow(row: (typeof elements.value)[0]) {
  current.value = row;
  drawer.value = true;
}
</script>

<template>
  <PageShell title="系统故障模型构建" subtitle="5.4.2.1 要素 · 关联 · 版本">
    <template #toolbar>
      <el-button size="small">比对版本</el-button>
      <el-button type="primary" size="small">保存模型草稿</el-button>
    </template>
    <div class="layout">
      <div class="chart-wrap">
        <MiniChart :option="barOpt()" :height="200" />
      </div>
      <div class="table-wrap">
        <div class="cap">故障要素与关联（点击行）</div>
        <PagedTable
          :data="elements"
          :page-size="8"
          row-key="id"
          row-clickable
          @row-click="onRow"
        >
          <el-table-column prop="id" label="要素ID" width="108" />
          <el-table-column prop="name" label="监测要素" min-width="100" />
          <el-table-column prop="kpiCode" label="指标编码" width="108" />
          <el-table-column prop="faultType" label="故障域" width="88" />
          <el-table-column prop="beam" label="波束" width="72" />
          <el-table-column prop="weight" label="权重" width="72" />
          <el-table-column prop="sampleWindow" label="采样窗口" width="96" />
          <el-table-column prop="thresholdHint" label="阈值提示" width="108" />
          <el-table-column prop="confidence" label="置信度" width="88" />
          <el-table-column prop="linked" label="关联样例" width="112" />
          <el-table-column prop="updatedAt" label="更新时间" width="158" />
        </PagedTable>
      </div>
      <div class="table-wrap">
        <div class="cap">模型版本</div>
        <PagedTable :data="versions" :page-size="8" row-key="id">
          <el-table-column prop="id" label="记录ID" width="108" />
          <el-table-column prop="ver" label="版本" width="108" />
          <el-table-column prop="editor" label="编辑人" width="88" />
          <el-table-column prop="reviewer" label="复核人" width="88" />
          <el-table-column prop="nodesChanged" label="节点变更" width="96" />
          <el-table-column prop="edgesChanged" label="边变更" width="88" />
          <el-table-column prop="coverage" label="覆盖率" width="88" />
          <el-table-column prop="baseline" label="对照基线" width="120" />
          <el-table-column prop="time" label="提交时间" width="158" />
          <el-table-column prop="delta" label="变更说明" min-width="120" show-overflow-tooltip />
        </PagedTable>
      </div>
    </div>

    <DetailDrawer v-model="drawer" title="要素详情">
      <template v-if="current">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="要素">{{ current.name }}</el-descriptions-item>
          <el-descriptions-item label="权重">{{ current.weight }}</el-descriptions-item>
          <el-descriptions-item label="关联故障类型">{{ current.faultType }}</el-descriptions-item>
        </el-descriptions>
        <el-button class="mt" type="warning" size="small">回滚至上一版本（mock）</el-button>
      </template>
    </DetailDrawer>
  </PageShell>
</template>

<style scoped>
.layout {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}
.chart-wrap {
  flex-shrink: 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}
.table-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.cap {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}
.mt {
  margin-top: 12px;
}
</style>
