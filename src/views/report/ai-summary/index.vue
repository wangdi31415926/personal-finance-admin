<template>
  <div class="ai-summary-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>AI 总结配置</span>
          <div class="header-actions">
            <el-select v-model="modelSelect" placeholder="模型" size="small" style="width: 140px">
              <el-option label="默认模型" value="default" />
              <el-option label="增强版" value="plus" />
            </el-select>
            <el-button type="primary" size="small" @click="handleRegenerate">重新生成</el-button>
          </div>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :span="12">
          <div class="section-title">Prompt 模板</div>
          <el-input
            v-model="promptTemplate"
            type="textarea"
            :rows="8"
            placeholder="预设 prompt：数据归纳、异常识别、趋势分析、建议生成"
          />
          <div class="section-title mt">总结任务</div>
          <el-checkbox-group v-model="summaryTasks" class="task-group">
            <el-checkbox label="执行摘要" />
            <el-checkbox label="关键指标解读" />
            <el-checkbox label="异常分析" />
            <el-checkbox label="行动建议" />
          </el-checkbox-group>
        </el-col>
        <el-col :span="12">
          <div class="section-title">示例输出</div>
          <el-collapse v-model="activeOutput">
            <el-collapse-item name="1">
              <template #title>
                <strong>执行摘要</strong>
              </template>
              <p>本周北京区域核心交换机整体运行平稳，端口利用率均值 62%，未发现严重告警。</p>
            </el-collapse-item>
            <el-collapse-item name="2">
              <template #title>
                <strong>异常分析</strong>
              </template>
              <p>设备 SW-03 在 3 月 12 日 14:00–15:00 端口入向流量较前日同期上升约 40%，建议关注业务侧变更。</p>
            </el-collapse-item>
            <el-collapse-item name="3">
              <template #title>
                <strong>行动建议</strong>
              </template>
              <p>建议对 SW-03 增加短期监控粒度；其余设备保持当前巡检策略。</p>
            </el-collapse-item>
          </el-collapse>
          <el-text type="info" size="small" class="block mt-2">支持多轮优化与反馈学习</el-text>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";

const modelSelect = ref("default");
const promptTemplate = ref(
  "基于以下报告数据与图表结论，生成：1）执行摘要 2）关键指标解读 3）异常分析 4）运维行动建议。"
);
const summaryTasks = ref(["执行摘要", "关键指标解读", "异常分析", "行动建议"]);
const activeOutput = ref(["1", "2", "3"]);

function handleRegenerate() {
  ElMessage.success("已触发重新生成");
}
</script>

<style scoped lang="scss">
.ai-summary-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-title {
    font-weight: 600;
    margin-bottom: 10px;
    font-size: 14px;
  }

  .mt {
    margin-top: 20px;
  }

  .task-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .block.mt-2 {
    display: block;
    margin-top: 12px;
  }

  .el-collapse-item__content p {
    margin: 0;
    font-size: 13px;
    color: #606266;
    line-height: 1.6;
  }
}
</style>
