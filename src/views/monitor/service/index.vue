<script setup lang="ts">
import { computed, ref } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import { genTimeSeries, simpleLineOption, simpleBarOption, fmtTime } from "@/views/_shared/mockUtils";

defineOptions({ name: "MonService" });

const tab = ref("s1");

function mk(n: number, label: string) {
  return Array.from({ length: n }, (_, i) => ({
    id: `SV-${3200 + i}-${label}`,
    col1: `${label}-${i + 1}`,
    col2: `${60 + (i * 7) % 35}%`,
    col3: `B-${(i % 6) + 1}`,
    col4: ["正常", "预警", "观察"][i % 3]
  }));
}

const tableData = computed(() => {
  const map: Record<string, ReturnType<typeof mk>> = {
    s1: mk(16, "综合分析"),
    s2: mk(14, "状态可视化"),
    s3: mk(12, "报表任务"),
    s4: mk(18, "波束容量"),
    s5: mk(14, "阈值规则"),
    s6: mk(16, "容量工单"),
    s7: mk(14, "位置态势"),
    s8: mk(15, "入站报表"),
    s9: mk(18, "小时统计"),
    s10: mk(14, "多维趋势")
  };
  return map[tab.value] || mk(12, "默认");
});

const chartOpt = computed(() => {
  const { ts, values } = genTimeSeries(16, 70, 25, 6);
  if (tab.value === "s4" || tab.value === "s9") {
    return simpleBarOption("波束负载对比", ["B1", "B2", "B3", "B4", "B5", "B6"], [62, 58, 71, 49, 66, 53]);
  }
  return simpleLineOption("服务性指标趋势", ts, values);
});

const mapPreview = ref(
  Array.from({ length: 12 }, (_, i) => ({
    id: `MP-${3300 + i}`,
    lat: `${39 + (i % 5)}.${i}`,
    lon: `${116 + (i % 7)}.${i}`,
    users: 80 + (i * 13) % 400,
    beam: `B-${(i % 6) + 1}`
  }))
);
</script>

<template>
  <PageShell title="系统服务性监视" subtitle="5.4.3.3 综合分析 … 多维趋势（10 子项）">
    <template #tabs>
      <el-tabs v-model="tab" class="shell-tab-bar tiny">
        <el-tab-pane label="综合分析" name="s1" />
        <el-tab-pane label="运行/服务可视化" name="s2" />
        <el-tab-pane label="报表生成" name="s3" />
        <el-tab-pane label="特色指标与波束容量" name="s4" />
        <el-tab-pane label="阈值与规则配置" name="s5" />
        <el-tab-pane label="容量预警与工单" name="s6" />
        <el-tab-pane label="波束用户位置态势" name="s7" />
        <el-tab-pane label="入站指标报表" name="s8" />
        <el-tab-pane label="小时粒度统计" name="s9" />
        <el-tab-pane label="多维趋势分析" name="s10" />
      </el-tabs>
    </template>

    <div class="pane">
      <MiniChart v-if="tab !== 's7'" :option="chartOpt" :height="200" />
      <div v-else class="map-panel">
        <div class="map-title">态势网格（mock）：经纬聚合热力</div>
        <PagedTable :data="mapPreview" :page-size="8" row-key="id">
          <el-table-column prop="lat" label="纬度" width="88" />
          <el-table-column prop="lon" label="经度" width="88" />
          <el-table-column prop="users" label="在线终端" width="100" />
          <el-table-column prop="beam" label="波束" width="72" />
        </PagedTable>
      </div>

      <PagedTable v-if="tab !== 's7'" :data="tableData" :page-size="10" row-key="id">
        <el-table-column prop="col1" label="对象/任务" min-width="140" />
        <el-table-column prop="col2" label="指标值" width="100" />
        <el-table-column prop="col3" label="波束" width="72" />
        <el-table-column prop="col4" label="状态" width="88" />
      </PagedTable>

      <p v-if="tab === 's3'" class="hint">定时报表 {{ fmtTime(new Date()) }} 已投递至对象存储（mock）</p>
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
  gap: 8px;
}
.tiny :deep(.el-tabs__item) {
  padding: 0 10px;
  font-size: 12px;
}
.map-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.map-title {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}
.hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
