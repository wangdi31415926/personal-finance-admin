<template>
  <div class="flow-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>流程编排</span>
          <div class="header-actions">
            <el-select v-model="currentFlow" placeholder="选择流程" size="small" style="width: 200px">
              <el-option label="核心交换机巡检报告流水线" value="1" />
              <el-option label="故障分析报告流水线" value="2" />
            </el-select>
            <el-button size="small">保存</el-button>
            <el-button size="small">发布</el-button>
            <el-button type="primary" size="small">模拟测试</el-button>
          </div>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :span="4">
          <div class="node-library">
            <div class="lib-title">节点库</div>
            <div
              v-for="node in nodeTypes"
              :key="node.type"
              class="node-item"
              :class="{ active: selectedNodeType === node.type }"
              @click="selectedNodeType = node.type"
            >
              <el-icon><component :is="node.icon" /></el-icon>
              <span>{{ node.label }}</span>
            </div>
          </div>
        </el-col>
        <el-col :span="14">
          <div class="dag-canvas">
            <div class="dag-nodes">
              <div class="dag-node start">语义解析</div>
              <div class="dag-node">模板匹配</div>
              <div class="parallel-row">
                <div class="dag-node">数据获取</div>
                <div class="dag-node">数据获取</div>
              </div>
              <div class="dag-node">数据聚合</div>
              <div class="parallel-row">
                <div class="dag-node">图表生成</div>
                <div class="dag-node">AI总结</div>
              </div>
              <div class="dag-node end">报告组装</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="property-panel">
            <div class="panel-title">节点属性</div>
            <template v-if="selectedNode">
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="节点名称">{{ selectedNode.name }}</el-descriptions-item>
                <el-descriptions-item label="节点类型">{{ selectedNode.type }}</el-descriptions-item>
                <el-descriptions-item label="重试策略">指数退避，最多 3 次</el-descriptions-item>
                <el-descriptions-item label="超时">30s</el-descriptions-item>
              </el-descriptions>
              <el-button type="primary" size="small" class="mt-2">编辑配置</el-button>
            </template>
            <el-empty v-else description="点击画布节点查看属性" :image-size="60" />
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { DataLine, Connection, PieChart, ChatDotRound, Document } from "@element-plus/icons-vue";

const currentFlow = ref("1");
const selectedNodeType = ref("");
const selectedNode = ref<{ name: string; type: string } | null>({ name: "数据聚合", type: "处理节点" });

const nodeTypes = [
  { type: "data", label: "数据获取", icon: DataLine },
  { type: "process", label: "处理", icon: Connection },
  { type: "chart", label: "图表生成", icon: PieChart },
  { type: "ai", label: "AI 总结", icon: ChatDotRound },
  { type: "report", label: "报告组装", icon: Document }
];
</script>

<style scoped lang="scss">
.flow-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .node-library {
    padding: 12px;
    background: #f5f7fa;
    border-radius: 6px;

    .lib-title {
      font-weight: 600;
      margin-bottom: 12px;
      font-size: 14px;
    }

    .node-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      margin-bottom: 6px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;

      &:hover,
      &.active {
        background: #ecf5ff;
        color: #409eff;
      }
    }
  }

  .dag-canvas {
    padding: 20px;
    background: linear-gradient(180deg, #fafbfc 0%, #f0f2f5 100%);
    border-radius: 8px;
    min-height: 380px;
  }

  .dag-nodes {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .dag-node {
    padding: 10px 24px;
    background: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    font-size: 13px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &.start {
      border-color: #67c23a;
      background: #f0f9eb;
    }

    &.end {
      border-color: #409eff;
      background: #ecf5ff;
    }
  }

  .parallel-row {
    display: flex;
    gap: 24px;
    justify-content: center;
  }

  .property-panel {
    padding: 16px;
    background: #fafafa;
    border-radius: 6px;
    min-height: 320px;

    .panel-title {
      font-weight: 600;
      margin-bottom: 12px;
      font-size: 14px;
    }

    .mt-2 {
      margin-top: 12px;
    }
  }
}
</style>
