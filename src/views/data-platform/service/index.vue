<script setup lang="ts">
import { computed, ref } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import { genTimeSeries, simpleLineOption, fmtTime } from "@/views/_shared/mockUtils";

defineOptions({ name: "DpService" });

function radarScores(): Record<string, unknown> {
  return {
    tooltip: {},
    radar: {
      indicator: [
        { name: "完整性", max: 100 },
        { name: "一致性", max: 100 },
        { name: "及时性", max: 100 },
        { name: "规范性", max: 100 },
        { name: "准确性", max: 100 }
      ],
      radius: "62%"
    },
    series: [
      {
        type: "radar",
        data: [{ value: [92, 88, 90, 85, 91], name: "本周质量" }]
      }
    ]
  };
}

const tab = ref<
  "quality" | "algo" | "schedule" | "catalog" | "spec" | "api"
>("quality");

const qualityTrend = computed(() => {
  const { ts, values } = genTimeSeries(16, 86, 12, 2);
  return simpleLineOption("质量评分趋势（百分制）", ts, values);
});

const radarOpt = computed(() => radarScores());

const failRows = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `QF-${800 + i}`,
    dim: ["完整性", "一致性", "及时性", "规范性", "准确性"][i % 5],
    rule: `RULE-${(i % 6) + 1}`,
    cnt: 3 + (i % 8),
    beam: `B-${(i % 5) + 1}`
  }))
);

const algos = ref(
  Array.from({ length: 16 }, (_, i) => ({
    id: `AL-${900 + i}`,
    name: ["波束拥塞预测", "出站时延聚类", "载噪比漂移", "误码突刺"][i % 4],
    ver: `v${1 + (i % 3)}.${i % 9}`,
    stage: ["注册", "灰度", "全量", "退役归档"][i % 4],
    owner: `算法-${(i % 3) + 1}`
  }))
);

const jobs = ref(
  Array.from({ length: 18 }, (_, i) => ({
    id: `JOB-${1000 + i}`,
    cron: `0 */${2 + (i % 5)} * * *`,
    name: ["规整批任务", "备份校验", "容量采样", "报表汇总"][i % 4],
    last: fmtTime(new Date(Date.now() - i * 7200000)),
    ok: i % 9 !== 0
  }))
);

const services = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `SRV-${1100 + i}`,
    name: ["metrics.query", "fault.push", "beam.capacity", "user.profile"][i % 4],
    subs: 2 + (i % 7),
    calls: 1200 + i * 133,
    sla: `${99.9 - (i % 3) * 0.05}%`
  }))
);

const specs = ref(
  Array.from({ length: 12 }, (_, i) => ({
    id: `SP-${1200 + i}`,
    code: `SPEC-${2024 + (i % 4)}-${i}`,
    title: ["数据命名规范", "接口字段映射", "出站指标口径", "备份留存"][i % 4],
    ver: `Rev.${i % 5}`,
    diff: i % 4 === 0 ? "与上一版差异 12 处" : "无结构性变更"
  }))
);

const apis = ref(
  Array.from({ length: 16 }, (_, i) => ({
    id: `EP-${1300 + i}`,
    path: `/api/v${1 + (i % 3)}/ops/${["query", "exec", "stream"][i % 3]}`,
    lifecycle: ["草案", "稳定", "弃用"][i % 3],
    consumer: 5 + (i % 10),
    changed: fmtTime(new Date(Date.now() - (i * 86400000) / 2))
  }))
);
</script>

<template>
  <PageShell title="数据综合服务" subtitle="5.4.1.3 质量 · 算法 · 调度 · 目录 · 规范 · API">
    <template #tabs>
      <el-tabs v-model="tab" class="shell-tab-bar">
        <el-tab-pane label="质量分析与监视" name="quality" />
        <el-tab-pane label="分析算法管理" name="algo" />
        <el-tab-pane label="任务调度管控" name="schedule" />
        <el-tab-pane label="综合数据服务" name="catalog" />
        <el-tab-pane label="中台规范管理" name="spec" />
        <el-tab-pane label="统一访问 API 与版本" name="api" />
      </el-tabs>
    </template>

    <div v-show="tab === 'quality'" class="pane">
      <el-row :gutter="12">
        <el-col :span="14">
          <MiniChart :option="qualityTrend" :height="220" />
        </el-col>
        <el-col :span="10">
          <MiniChart :option="radarOpt" :height="220" />
        </el-col>
      </el-row>
      <div class="cap">不合格明细（规则命中）</div>
      <PagedTable :data="failRows" :page-size="8" row-key="id">
        <el-table-column prop="dim" label="维度" width="88" />
        <el-table-column prop="rule" label="规则" width="100" />
        <el-table-column prop="cnt" label="条数" width="72" />
        <el-table-column prop="beam" label="波束" width="72" />
      </PagedTable>
    </div>

    <div v-show="tab === 'algo'" class="pane">
      <PagedTable :data="algos" :page-size="10" row-key="id">
        <el-table-column prop="name" label="算法" min-width="140" />
        <el-table-column prop="ver" label="版本" width="88" />
        <el-table-column prop="stage" label="阶段" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.stage }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="负责人" width="88" />
      </PagedTable>
    </div>

    <div v-show="tab === 'schedule'" class="pane">
      <PagedTable :data="jobs" :page-size="10" row-key="id">
        <el-table-column prop="name" label="任务" />
        <el-table-column prop="cron" label="Cron" width="120" />
        <el-table-column prop="last" label="上次运行" width="158" />
        <el-table-column prop="ok" label="结果" width="88">
          <template #default="{ row }">
            <el-tag :type="row.ok ? 'success' : 'danger'" size="small">{{
              row.ok ? "成功" : "失败"
            }}</el-tag>
          </template>
        </el-table-column>
      </PagedTable>
    </div>

    <div v-show="tab === 'catalog'" class="pane">
      <PagedTable :data="services" :page-size="8" row-key="id">
        <el-table-column prop="name" label="服务标识" min-width="140" />
        <el-table-column prop="subs" label="订阅方" width="88" />
        <el-table-column prop="calls" label="调用量/日" width="110" />
        <el-table-column prop="sla" label="SLA" width="88" />
      </PagedTable>
    </div>

    <div v-show="tab === 'spec'" class="pane">
      <PagedTable :data="specs" :page-size="8" row-key="id">
        <el-table-column prop="code" label="编号" width="120" />
        <el-table-column prop="title" label="标题" min-width="140" />
        <el-table-column prop="ver" label="版本" width="72" />
        <el-table-column prop="diff" label="变更摘要" min-width="160" />
      </PagedTable>
    </div>

    <div v-show="tab === 'api'" class="pane">
      <PagedTable :data="apis" :page-size="10" row-key="id">
        <el-table-column prop="path" label="路径" min-width="200" />
        <el-table-column prop="lifecycle" label="生命周期" width="88" />
        <el-table-column prop="consumer" label="消费者数" width="96" />
        <el-table-column prop="changed" label="最近变更" width="158" />
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
  gap: 8px;
  overflow: hidden;
}
.cap {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
