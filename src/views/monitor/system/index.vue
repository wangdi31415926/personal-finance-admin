<script setup lang="ts">
import { computed, ref } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import { genTimeSeries, simpleLineOption, fmtTime } from "@/views/_shared/mockUtils";

defineOptions({ name: "MonSystem" });

function radarHealth(): Record<string, unknown> {
  return {
    tooltip: {},
    radar: {
      indicator: [
        { name: "可用性", max: 100 },
        { name: "性能", max: 100 },
        { name: "容量", max: 100 },
        { name: "安全", max: 100 },
        { name: "协同", max: 100 }
      ],
      radius: "58%"
    },
    series: [{ type: "radar", data: [{ value: [96, 91, 88, 94, 90], name: "健康度" }] }]
  };
}

const patrol = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `PT-${3100 + i}`,
    name: `巡检-${["出站链路", "主备心跳", "磁盘", "队列"][i % 4]}`,
    site: ["主站", "备站"][i % 2],
    time: fmtTime(new Date(Date.now() - i * 86400000)),
    ok: i % 6 !== 0,
    durationSec: 45 + (i % 180),
    itemsChecked: 48 + (i % 20),
    failedCase: i % 6 === 0 ? "磁盘阈值偏高" : "—",
    owner: `巡检-${(i % 3) + 1}`,
    schedule: ["每日02:00", "每周日", "按需"][i % 3],
    reportPath: `/reports/patrol/${202605 + i}.pdf`
  }))
);

const trend = computed(() => {
  const { ts, values } = genTimeSeries(18, 92, 6, 8);
  return simpleLineOption("系统可用性 %（状态综合 / 全维度）", ts, values);
});

/** 与雷达维度一致的摘要，便于单页扫读 */
const healthKpis = [
  { label: "可用性", val: "96", unit: "分" },
  { label: "性能", val: "91", unit: "分" },
  { label: "容量裕量", val: "88", unit: "分" }
];

const chartH = 156;
</script>

<template>
  <PageShell title="系统综合监控" subtitle="5.4.3.2 状态 · 主备 · 巡检 · 全维度 · 健康度">
    <div class="sys-monitor">
      <section class="sys-monitor__charts" aria-label="状态与全维度">
        <div class="chart-box">
          <MiniChart :option="trend" :height="chartH" />
        </div>
        <div class="chart-box">
          <MiniChart :option="radarHealth()" :height="chartH" />
        </div>
      </section>

      <section class="sys-monitor__mid" aria-label="主备与健康度">
        <el-card shadow="never" class="mid-card">
          <template #header>
            <span class="mid-card__title">主站运行态</span>
          </template>
          <ul class="mid-card__list">
            <li>出站 P99 <strong>62</strong> ms</li>
            <li>队列深度 <strong>38</strong> %</li>
            <li>同步偏差 &lt; <strong>120</strong> μs</li>
          </ul>
        </el-card>
        <el-card shadow="never" class="mid-card">
          <template #header>
            <span class="mid-card__title">备站运行态</span>
          </template>
          <ul class="mid-card__list">
            <li>出站 P99 <strong>64</strong> ms</li>
            <li>队列深度 <strong>41</strong> %</li>
            <li>数据复制延迟 <strong>18</strong> ms</li>
          </ul>
        </el-card>
        <div class="kpi-panel">
          <div class="kpi-panel__hd">健康度评估摘要</div>
          <div class="kpi-panel__grid">
            <div v-for="k in healthKpis" :key="k.label" class="kpi-cell">
              <span class="kpi-cell__v">{{ k.val }}<small>{{ k.unit }}</small></span>
              <span class="kpi-cell__l">{{ k.label }}</span>
            </div>
          </div>
          <p class="kpi-panel__hint">与右侧雷达同一口径 · mock</p>
        </div>
      </section>

      <section class="sys-monitor__patrol" aria-label="自动巡检与报告">
        <div class="patrol-cap">自动巡检与报告</div>
        <PagedTable :data="patrol" :page-size="6" row-key="id" class="patrol-table">
          <el-table-column prop="id" label="任务ID" width="108" />
          <el-table-column prop="name" label="巡检项" min-width="110" show-overflow-tooltip />
          <el-table-column prop="site" label="站点" width="68" />
          <el-table-column prop="schedule" label="计划" width="92" />
          <el-table-column prop="itemsChecked" label="检查点" width="84" />
          <el-table-column prop="durationSec" label="耗时秒" width="80" />
          <el-table-column prop="failedCase" label="异常摘要" width="108" show-overflow-tooltip />
          <el-table-column prop="owner" label="执行人" width="80" />
          <el-table-column prop="reportPath" label="报告路径" min-width="120" show-overflow-tooltip />
          <el-table-column prop="time" label="完成时间" width="152" />
          <el-table-column prop="ok" label="结果" width="76">
            <template #default="{ row }">
              <el-tag :type="row.ok ? 'success' : 'danger'" size="small">{{
                row.ok ? "通过" : "异常"
              }}</el-tag>
            </template>
          </el-table-column>
        </PagedTable>
      </section>
    </div>
  </PageShell>
</template>

<style scoped>
.sys-monitor {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

.sys-monitor__charts {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 12px;
  align-items: stretch;
}

.chart-box {
  min-height: 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color);
}

.sys-monitor__mid {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  align-items: stretch;
}

.mid-card {
  border-radius: 8px;
}
.mid-card__title {
  font-size: 13px;
  font-weight: 600;
}
.mid-card__list {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  line-height: 1.65;
}
.mid-card__list strong {
  color: var(--el-color-primary);
}

.kpi-panel {
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}
.kpi-panel__hd {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.kpi-panel__grid {
  display: flex;
  gap: 12px;
  justify-content: space-between;
}
.kpi-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.kpi-cell__v {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-color-primary);
  line-height: 1.2;
}
.kpi-cell__v small {
  font-size: 11px;
  font-weight: 500;
  margin-left: 2px;
}
.kpi-cell__l {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.kpi-panel__hint {
  margin: 0;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.sys-monitor__patrol {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.patrol-cap {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}

.patrol-table {
  min-height: 0;
}

@media (max-width: 1100px) {
  .sys-monitor__charts {
    grid-template-columns: 1fr;
  }
  .sys-monitor__mid {
    grid-template-columns: 1fr;
  }
}
</style>
