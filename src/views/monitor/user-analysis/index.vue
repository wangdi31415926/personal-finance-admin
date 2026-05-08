<script setup lang="ts">
import { computed, ref } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import { genTimeSeries, simpleLineOption, simplePieOption } from "@/views/_shared/mockUtils";

defineOptions({ name: "MonUserAnalysis" });

const tab = ref("u1");

const rows = computed(() =>
  Array.from({ length: 18 }, (_, i) => ({
    id: `UA-${3400 + i}-${tab.value}`,
    uid: `USR-${8800 + i}`,
    grp: ["集团A", "集团B", "大众"][i % 3],
    metric: `${120 + (i * 17) % 500} 条/日`,
    risk: ["低", "中", "高"][i % 3],
    beam: `B-${(i % 6) + 1}`
  }))
);

const trend = computed(() => {
  const { ts, values } = genTimeSeries(16, 220, 80, 11);
  return simpleLineOption("出入站资源占用趋势", ts, values);
});

const pie = () =>
  simplePieOption("用户分布", [
    { name: "华北", value: 28 },
    { name: "华东", value: 32 },
    { name: "华南", value: 22 },
    { name: "西部", value: 18 }
  ]);
</script>

<template>
  <PageShell title="系统用户使用情况分析" subtitle="5.4.3.4 全用户 · 分布行为 · 集团 · 出站 · 异常 · 预估">
    <template #tabs>
      <el-tabs v-model="tab" class="shell-tab-bar">
        <el-tab-pane label="全用户监视" name="u1" />
        <el-tab-pane label="分布/行为/异常" name="u2" />
        <el-tab-pane label="集团用户预分配" name="u3" />
        <el-tab-pane label="出站资源占用" name="u4" />
        <el-tab-pane label="异常用户识别" name="u5" />
        <el-tab-pane label="出入站影响预估" name="u6" />
      </el-tabs>
    </template>

    <div class="pane">
      <el-row v-if="tab === 'u1' || tab === 'u4'" :gutter="12">
        <el-col :span="14">
          <MiniChart :option="trend" :height="210" />
        </el-col>
        <el-col :span="10">
          <MiniChart :option="pie()" :height="210" />
        </el-col>
      </el-row>
      <MiniChart v-else-if="tab === 'u2'" :option="trend" :height="200" />

      <PagedTable :data="rows" :page-size="10" row-key="id">
        <el-table-column prop="uid" label="用户/终端" width="120" />
        <el-table-column prop="grp" label="集团/类型" width="100" />
        <el-table-column prop="metric" label="业务量" width="120" />
        <el-table-column prop="risk" label="风险" width="72" />
        <el-table-column prop="beam" label="波束" width="72" />
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
  gap: 8px;
}
</style>
