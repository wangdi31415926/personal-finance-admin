<template>
  <div class="recall-test">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="测试效果" name="effect">
        <el-card shadow="never">
          <div class="test-results">
            <div class="metrics">
              <el-card class="metric-card">
                <div class="metric-label">召回率</div>
                <div
                  class="metric-value"
                  :class="getMetricClass(metrics.recallRate)"
                >
                  {{ metrics.recallRate }}%
                </div>
                <div class="metric-tip">符合条件的知识中被成功召回的比例</div>
              </el-card>
              <el-card class="metric-card">
                <div class="metric-label">精确率</div>
                <div
                  class="metric-value"
                  :class="getMetricClass(metrics.precision)"
                >
                  {{ metrics.precision }}%
                </div>
                <div class="metric-tip">召回知识中符合实际需求的比例</div>
              </el-card>
              <el-card class="metric-card">
                <div class="metric-label">TOP10匹配度均值</div>
                <div
                  class="metric-value"
                  :class="getMetricClass(metrics.top10Avg)"
                >
                  {{ metrics.top10Avg }}分
                </div>
                <div class="metric-tip">前10条结果的匹配度平均值</div>
              </el-card>
            </div>

            <div class="problem-analysis">
              <el-alert
                v-if="problems.length > 0"
                title="问题分析与建议"
                type="warning"
                :closable="false"
              >
                <div class="problem-list">
                  <div
                    v-for="(problem, index) in problems"
                    :key="index"
                    class="problem-item"
                  >
                    <el-icon><Warning /></el-icon>
                    <span>{{ problem }}</span>
                    <el-button
                      type="text"
                      size="small"
                      @click="handleQuickOptimize(index)"
                    >
                      快速优化
                    </el-button>
                  </div>
                </div>
              </el-alert>
            </div>

            <div class="comparison">
              <div class="comparison-title">与默认规则对比</div>
              <div class="comparison-chart">
                <div class="chart-item">
                  <div class="chart-label">召回率</div>
                  <div class="chart-bar">
                    <div
                      class="bar current"
                      :style="{ width: metrics.recallRate + '%' }"
                    >
                      {{ metrics.recallRate }}%
                    </div>
                    <div
                      class="bar default"
                      :style="{ width: defaultMetrics.recallRate + '%' }"
                    >
                      {{ defaultMetrics.recallRate }}%
                    </div>
                  </div>
                </div>
                <div class="chart-item">
                  <div class="chart-label">精确率</div>
                  <div class="chart-bar">
                    <div
                      class="bar current"
                      :style="{ width: metrics.precision + '%' }"
                    >
                      {{ metrics.precision }}%
                    </div>
                    <div
                      class="bar default"
                      :style="{ width: defaultMetrics.precision + '%' }"
                    >
                      {{ defaultMetrics.precision }}%
                    </div>
                  </div>
                </div>
              </div>
              <div class="comparison-summary">
                较默认规则精确率提升{{
                  metrics.precision - defaultMetrics.precision
                }}%， 召回率{{
                  metrics.recallRate > defaultMetrics.recallRate
                    ? "提升"
                    : "下降"
                }}{{
                  Math.abs(metrics.recallRate - defaultMetrics.recallRate)
                }}%
              </div>
            </div>

            <div class="test-actions">
              <el-button type="primary" @click="handleRetest"
                >重新测试</el-button
              >
              <el-button type="success" @click="handleApply"
                >应用规则</el-button
              >
              <el-button @click="handleBack">返回修改</el-button>
            </div>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="召回预览" name="preview">
        <el-card shadow="never">
          <div class="preview-header">
            <el-input
              v-model="testKeyword"
              placeholder="输入测试关键词"
              style="width: 300px"
            />
            <el-button type="primary" @click="handleTestSearch"
              >测试搜索</el-button
            >
            <el-button @click="handleAdjustRule">临时调整规则</el-button>
          </div>

          <div class="preview-list">
            <el-card
              v-for="item in previewList"
              :key="item.id"
              class="preview-card"
              shadow="hover"
            >
              <div class="card-header">
                <span class="knowledge-name">{{ item.name }}</span>
                <el-tag :type="getFeedbackType(item.feedback)" size="small">
                  {{ getFeedbackText(item.feedback) }}
                </el-tag>
              </div>
              <div class="card-description">{{ item.description }}</div>
              <div class="card-actions">
                <el-button
                  link
                  type="primary"
                  @click="handleMarkFeedback(item, 'good')"
                >
                  符合预期
                </el-button>
                <el-button
                  link
                  type="warning"
                  @click="handleMarkFeedback(item, 'optimize')"
                >
                  需优化
                </el-button>
                <el-button
                  link
                  type="danger"
                  @click="handleMarkFeedback(item, 'irrelevant')"
                >
                  无关内容
                </el-button>
                <el-button link type="primary" @click="handleBoost(item)">
                  提升权重
                </el-button>
                <el-button link type="info" @click="handleShield(item)">
                  屏蔽
                </el-button>
              </div>
            </el-card>
          </div>

          <div class="preview-feedback">
            <el-input
              v-model="feedbackSuggestion"
              type="textarea"
              :rows="3"
              placeholder="输入优化建议（如：希望相关知识优先）"
            />
            <el-button
              type="primary"
              style="margin-top: 10px"
              @click="handleSubmitFeedback"
            >
              提交反馈
            </el-button>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { Warning } from "@element-plus/icons-vue";

const activeTab = ref("effect");

const metrics = reactive({
  recallRate: 85,
  precision: 78,
  top10Avg: 82
});

const defaultMetrics = reactive({
  recallRate: 75,
  precision: 65
});

const problems = ref([
  "条件过于严格导致召回率偏低，建议减少'关联场景'多选数量",
  "权重设置不合理导致优质知识靠后，建议提升'收藏状态'权重至10分"
]);

const testKeyword = ref("");
const feedbackSuggestion = ref("");

// 测试数据
const previewList = ref([
  {
    id: "1",
    name: "DNS解析失败故障处理",
    description: "详细介绍了DNS解析失败的排查步骤和处理方法",
    feedback: "good"
  },
  {
    id: "2",
    name: "Linux端口占用排查",
    description: "使用netstat、lsof等命令进行端口占用排查",
    feedback: ""
  },
  {
    id: "3",
    name: "路由器OSPF配置",
    description: "OSPF协议的详细配置步骤和参数说明",
    feedback: "optimize"
  }
]);

const getMetricClass = (value: number) => {
  if (value >= 80) return "success";
  if (value >= 60) return "warning";
  return "danger";
};

const handleQuickOptimize = (index: number) => {
  ElMessage.info("跳转到规则配置页面");
};

const handleRetest = () => {
  ElMessage.info("重新测试");
};

const handleApply = () => {
  ElMessage.success("规则已应用");
};

const handleBack = () => {
  ElMessage.info("返回规则配置页面");
};

const handleTestSearch = () => {
  ElMessage.info("测试搜索");
};

const handleAdjustRule = () => {
  ElMessage.info("临时调整规则");
};

const getFeedbackType = (feedback: string) => {
  const map: Record<string, string> = {
    good: "success",
    optimize: "warning",
    irrelevant: "danger"
  };
  return map[feedback] || "";
};

const getFeedbackText = (feedback: string) => {
  const map: Record<string, string> = {
    good: "符合预期",
    optimize: "需优化",
    irrelevant: "无关"
  };
  return map[feedback] || "";
};

const handleMarkFeedback = (item: any, type: string) => {
  item.feedback = type;
  ElMessage.success("反馈已记录");
};

const handleBoost = (item: any) => {
  ElMessage.success(`已提升 ${item.name} 的权重`);
};

const handleShield = (item: any) => {
  ElMessage.success(`已屏蔽 ${item.name}`);
};

const handleSubmitFeedback = () => {
  ElMessage.success("反馈已提交");
};
</script>

<style scoped lang="scss">
.recall-test {
  .test-results {
    .metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;

      .metric-card {
        text-align: center;

        .metric-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 10px;
        }

        .metric-value {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 10px;

          &.success {
            color: #67c23a;
          }

          &.warning {
            color: #e6a23c;
          }

          &.danger {
            color: #f56c6c;
          }
        }

        .metric-tip {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .problem-analysis {
      margin-bottom: 30px;

      .problem-list {
        .problem-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
        }
      }
    }

    .comparison {
      margin-bottom: 30px;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 4px;

      .comparison-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 20px;
      }

      .comparison-chart {
        .chart-item {
          margin-bottom: 20px;

          .chart-label {
            font-size: 14px;
            color: #606266;
            margin-bottom: 10px;
          }

          .chart-bar {
            position: relative;
            height: 30px;
            background: #e4e7ed;
            border-radius: 4px;
            overflow: hidden;

            .bar {
              position: absolute;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              font-weight: bold;

              &.current {
                background: #409eff;
                z-index: 2;
              }

              &.default {
                background: #909399;
                z-index: 1;
              }
            }
          }
        }
      }

      .comparison-summary {
        margin-top: 15px;
        font-size: 14px;
        color: #606266;
      }
    }

    .test-actions {
      display: flex;
      justify-content: center;
      gap: 10px;
    }
  }

  .preview-header {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .preview-list {
    .preview-card {
      margin-bottom: 15px;

      .card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;

        .knowledge-name {
          font-size: 16px;
          font-weight: bold;
        }
      }

      .card-description {
        color: #606266;
        font-size: 14px;
        margin-bottom: 10px;
      }

      .card-actions {
        display: flex;
        gap: 10px;
      }
    }
  }

  .preview-feedback {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
  }
}
</style>
