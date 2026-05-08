<template>
  <div class="profile-page">
    <el-card shadow="never" class="overview-card">
      <template #header>
        <span>画像概览</span>
      </template>
      <el-row :gutter="16">
        <el-col :span="6">
          <el-select v-model="userFilter" placeholder="用户/团队" size="small" style="width: 100%">
            <el-option label="全部用户" value="" />
            <el-option label="按团队" value="team" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="tagFilter" placeholder="画像标签" size="small" clearable style="width: 100%">
            <el-option label="运维人员" value="ops" />
            <el-option label="高频用户" value="high" />
            <el-option label="偏好周报" value="weekly" />
          </el-select>
        </el-col>
      </el-row>
    </el-card>
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>用户画像</span>
          </template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="常用模板">核心设备巡检、端口流量分析</el-descriptions-item>
            <el-descriptions-item label="偏好图表">折线图、仪表盘</el-descriptions-item>
            <el-descriptions-item label="查询区域">北京、上海</el-descriptions-item>
            <el-descriptions-item label="时间模式">周度、月度</el-descriptions-item>
          </el-descriptions>
          <div class="tags-block">
            <span class="label">画像标签：</span>
            <el-tag size="small">运维人员</el-tag>
            <el-tag size="small" type="success">高频用户</el-tag>
            <el-tag size="small" type="info">偏好周报</el-tag>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>反馈统计</span>
            <el-select v-model="feedbackTypeFilter" placeholder="反馈类型" size="small" clearable style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="显式" value="explicit" />
              <el-option label="隐式" value="implicit" />
            </el-select>
          </template>
          <el-table :data="paginatedFeedbackStats" stripe size="small">
            <el-table-column prop="type" label="反馈类型" width="120" />
            <el-table-column prop="count" label="数量" width="90" />
            <el-table-column prop="usage" label="用途" />
          </el-table>
          <el-pagination
            v-model:current-page="feedbackPage"
            :page-size="10"
            :total="filteredFeedbackStats.length"
            layout="total, prev, pager, next"
            small
            class="pagination"
          />
          <div ref="chartRef" class="feedback-chart" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import * as echarts from "echarts";

const userFilter = ref("");
const tagFilter = ref("");
const feedbackTypeFilter = ref("");
const feedbackPage = ref(1);
const chartRef = ref<HTMLElement | null>(null);

const feedbackStats = ref([
  { type: "显式评分", count: "1.2k", usage: "优化模板推荐" },
  { type: "下载行为", count: "3.5k", usage: "隐式偏好" },
  { type: "重新生成", count: "280", usage: "改进生成策略" },
  { type: "修改意见", count: "156", usage: "优化 AI 总结" },
  { type: "报告停留时长", count: "5.2k", usage: "隐式偏好" },
  { type: "模板收藏", count: "420", usage: "个性化推荐" },
  { type: "章节跳过", count: "89", usage: "改进章节设计" },
  { type: "分享行为", count: "67", usage: "热门报告分析" },
  { type: "导出格式选择", count: "2.1k", usage: "默认格式优化" },
  { type: "对话补全采纳", count: "312", usage: "补全策略优化" },
  { type: "模板克隆", count: "198", usage: "模板流行度" },
  { type: "低分反馈", count: "45", usage: "问题定位" }
]);

const filteredFeedbackStats = computed(() => {
  let list = feedbackStats.value;
  if (feedbackTypeFilter.value === "explicit") {
    list = list.filter(item => ["显式评分", "修改意见", "低分反馈"].includes(item.type));
  } else if (feedbackTypeFilter.value === "implicit") {
    list = list.filter(item => ["下载行为", "报告停留时长", "分享行为", "导出格式选择"].includes(item.type));
  }
  return list;
});

const paginatedFeedbackStats = computed(() => {
  const list = filteredFeedbackStats.value;
  const start = (feedbackPage.value - 1) * 10;
  return list.slice(start, start + 10);
});

onMounted(() => {
  if (!chartRef.value) return;
  const chart = echarts.init(chartRef.value);
  chart.setOption({
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: ["3/8", "3/9", "3/10", "3/11", "3/12", "3/13", "3/14"] },
    yAxis: { type: "value" },
    series: [{ name: "反馈量", type: "bar", data: [120, 132, 98, 156, 108, 142, 168] }]
  });
});
</script>

<style scoped lang="scss">
.profile-page {
  .overview-card {
    margin-bottom: 16px;
  }

  .tags-block {
    margin-top: 12px;
    font-size: 13px;

    .label {
      margin-right: 8px;
      color: #606266;
    }

    .el-tag {
      margin-right: 6px;
    }
  }

  .el-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .feedback-chart {
    height: 200px;
    margin-top: 16px;
  }

  .pagination {
    margin-top: 12px;
  }
}
</style>
