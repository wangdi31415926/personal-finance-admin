<script setup lang="ts">
import { ref } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import DetailDrawer from "@/views/_shared/DetailDrawer.vue";
import { fmtTime, tagTypeOf } from "@/views/_shared/mockUtils";

defineOptions({ name: "FaultAlarm" });

const tab = ref("list");
const soundOn = ref(true);
const flashOn = ref(true);

const alarms = ref(
  Array.from({ length: 18 }, (_, i) => ({
    id: `ALM-${2500 + i}`,
    level: ["紧急", "重要", "一般"][i % 3],
    title: ["出站丢包突增", "主备心跳超时", "磁盘水位偏高"][i % 3],
    beam: `B-${(i % 6) + 1}`,
    time: fmtTime(new Date(Date.now() - i * 600000)),
    state: ["待受理", "处置中", "已闭环"][i % 3]
  }))
);

const plans = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `PL-${2600 + i}`,
    name: ["拥塞限流", "切换备链路", "扩容队列", "降级图像"][i % 4],
    step: 3 + (i % 5),
    fresh: i % 4 === 0
  }))
);

const traces = ref(
  Array.from({ length: 16 }, (_, i) => ({
    id: `TR-${2700 + i}`,
    op: ["受理", "执行脚本", "人工复核", "关闭"][i % 4],
    who: `值班-${(i % 4) + 1}`,
    time: fmtTime(new Date(Date.now() - i * 300000))
  }))
);

const drawer = ref(false);
const cur = ref<(typeof alarms.value)[0] | null>(null);

function open(row: (typeof alarms.value)[0]) {
  cur.value = row;
  drawer.value = true;
}
</script>

<template>
  <PageShell title="故障告警与处置闭环" subtitle="5.4.2.4 告警 · 声光 · 预案 · 推荐 · 协同 · 溯源">
    <template #toolbar>
      <el-tag :type="flashOn ? 'danger' : 'info'" effect="dark">声光 mock</el-tag>
    </template>
    <template #tabs>
      <el-tabs v-model="tab" class="shell-tab-bar">
        <el-tab-pane label="告警列表" name="list" />
        <el-tab-pane label="声光提示" name="sound" />
        <el-tab-pane label="处置预案" name="plan" />
        <el-tab-pane label="预案推荐" name="reco" />
        <el-tab-pane label="协同处置" name="flow" />
        <el-tab-pane label="溯源查询" name="trace" />
      </el-tabs>
    </template>

    <div v-show="tab === 'list'" class="pane">
      <PagedTable :data="alarms" :page-size="10" row-key="id" row-clickable @row-click="open">
        <el-table-column prop="level" label="级别" width="72">
          <template #default="{ row }">
            <el-tag :type="tagTypeOf(row.level)" size="small">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="摘要" />
        <el-table-column prop="beam" label="波束" width="72" />
        <el-table-column prop="time" label="时间" width="158" />
        <el-table-column prop="state" label="状态" width="88">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.state }}</el-tag>
          </template>
        </el-table-column>
      </PagedTable>
    </div>

    <div v-show="tab === 'sound'" class="pane center-pane">
      <el-switch v-model="soundOn" active-text="告警音" inactive-text="静音" />
      <el-switch v-model="flashOn" active-text="标题栏闪烁" inactive-text="关闭" />
      <p class="hint">前端模拟：静音后不再触发浏览器提示（占位）。</p>
    </div>

    <div v-show="tab === 'plan'" class="pane">
      <PagedTable :data="plans" :page-size="8" row-key="id">
        <el-table-column prop="name" label="预案" />
        <el-table-column prop="step" label="步骤数" width="88" />
        <el-table-column prop="fresh" label="最新校验" width="96">
          <template #default="{ row }">
            <el-tag :type="row.fresh ? 'success' : 'warning'" size="small">{{
              row.fresh ? "有效" : "待更新"
            }}</el-tag>
          </template>
        </el-table-column>
      </PagedTable>
      <el-button type="primary" size="small" class="mt">新建预案（mock）</el-button>
    </div>

    <div v-show="tab === 'reco'" class="pane">
      <el-card v-for="i in 3" :key="i" shadow="never" class="reco-card">
        <div class="reco-title">推荐 #{{ i }} · 拥塞限流（命中规则 R-{{ 420 + i }}）</div>
        <div class="reco-body">相似案例 C00{{ i }}，预计 15min 恢复；需审批后执行。</div>
        <el-button size="small" type="primary">采纳</el-button>
      </el-card>
    </div>

    <div v-show="tab === 'flow'" class="pane">
      <el-steps :active="2" align-center>
        <el-step title="待受理" />
        <el-step title="处置中" />
        <el-step title="复核" />
        <el-step title="闭环" />
      </el-steps>
      <el-alert class="mt" type="success" :closable="false" show-icon title="自动化脚本已下发限流策略（mock）" />
    </div>

    <div v-show="tab === 'trace'" class="pane">
      <PagedTable :data="traces" :page-size="10" row-key="id">
        <el-table-column prop="op" label="动作" width="100" />
        <el-table-column prop="who" label="人员" width="88" />
        <el-table-column prop="time" label="时间" width="158" />
      </PagedTable>
    </div>

    <DetailDrawer v-model="drawer" title="告警详情时间线">
      <template v-if="cur">
        <el-timeline>
          <el-timeline-item timestamp="首发" placement="top">{{ cur.title }} · {{ cur.beam }}</el-timeline-item>
          <el-timeline-item timestamp="聚合">关联指标出站 P99、误码率</el-timeline-item>
          <el-timeline-item timestamp="当前">{{ cur.state }}</el-timeline-item>
        </el-timeline>
      </template>
    </DetailDrawer>
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
.center-pane {
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
}
.hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.mt {
  margin-top: 10px;
}
.reco-card {
  margin-bottom: 10px;
  border-radius: 8px;
}
.reco-title {
  font-weight: 600;
  margin-bottom: 6px;
}
.reco-body {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}
</style>
