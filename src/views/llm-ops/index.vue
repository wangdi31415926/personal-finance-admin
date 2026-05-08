<template>
  <div class="llm-ops">
    <div class="ops-workspace">
      <!-- 左侧：对话主区 -->
      <div class="main-panel">
        <div class="panel-header">
          <span class="panel-title">运维助手</span>
          <div class="header-meta">
            <span class="session-pill">
              <el-icon class="meta-icon"><Connection /></el-icon>
              {{ sessionId || "新会话" }}
            </span>
            <span class="redis-pill">
              <span class="dot"></span>
              Redis 已持久化
            </span>
          </div>
        </div>

        <div class="chat-panel">
          <div class="message-list" ref="messageListRef">
            <!-- 解析结果以“系统消息”形式插入对话流 -->
            <template v-if="parseResult">
              <div class="msg-row msg-parse">
                <div class="msg-avatar parse-avatar">解析</div>
                <div class="msg-body parse-body">
                  <el-descriptions :column="2" size="small" border class="parse-desc">
                    <el-descriptions-item label="意图">{{ parseResult.intent }}</el-descriptions-item>
                    <el-descriptions-item label="实体">{{ parseResult.entity }}</el-descriptions-item>
                    <el-descriptions-item label="时间">{{ parseResult.timeRange }}</el-descriptions-item>
                    <el-descriptions-item label="指标">{{ parseResult.metricType }}</el-descriptions-item>
                    <el-descriptions-item label="参数" :span="2">
                      <el-tag v-for="p in parseResult.params" :key="p" size="small" class="param-tag">{{ p }}</el-tag>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>
            </template>
            <div
              v-for="msg in chatMessages"
              :key="msg.id"
              :class="['msg-row', msg.role === 'user' ? 'msg-user' : 'msg-assistant']"
            >
              <div v-if="msg.role === 'assistant'" class="msg-avatar assistant-avatar">助</div>
              <div class="msg-body" :class="msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'">
                {{ msg.content }}
              </div>
              <div v-if="msg.role === 'user'" class="msg-avatar user-avatar">我</div>
            </div>
          </div>

          <div class="input-bar">
            <el-input
              v-model="commandText"
              type="textarea"
              :rows="2"
              placeholder="输入自然语言指令后点击「解析」查看意图与参数，或「发送」直接执行并加入对话"
              class="input-textarea"
              resize="none"
              @keydown.ctrl.enter="handleSendFromCommand"
            />
            <div class="input-buttons">
              <el-button type="primary" @click="handleParse">
                <el-icon><Search /></el-icon>
                解析
              </el-button>
              <el-button type="primary" @click="handleSendFromCommand">
                <el-icon><Promotion /></el-icon>
                发送
              </el-button>
              <span class="input-hint">Ctrl+Enter 发送</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：执行链路 + 工具 + 调用 -->
      <div class="side-panel">
        <div class="side-block">
          <div class="side-title">执行链路</div>
          <div class="pipeline">
            <template v-for="(node, i) in workflowNodes" :key="node.name">
              <div class="pipeline-node" :class="{ active: true }">
                <span class="node-name">{{ node.name }}</span>
                <span class="node-meta">{{ node.timeout }}s / {{ node.retry }}次</span>
              </div>
              <div v-if="i < workflowNodes.length - 1" class="pipeline-arrow">→</div>
            </template>
          </div>
        </div>

        <div class="side-block">
          <div class="side-title">已注册工具</div>
          <div class="tool-cards">
            <div v-for="t in toolsList" :key="t.name" class="tool-card">
              <span class="tool-dot"></span>
              <span class="tool-name">{{ t.name }}</span>
              <span class="tool-desc">{{ t.desc }}</span>
            </div>
          </div>
        </div>

        <div class="side-block">
          <div class="side-title">最近调用</div>
          <ul class="call-list">
            <li v-for="(r, i) in toolCallRecords" :key="i" class="call-item">
              <span class="call-tool">{{ r.tool }}</span>
              <span class="call-params">{{ r.params }}</span>
              <el-tag type="success" size="small" class="call-result">{{ r.result }}</el-tag>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 会话 ID 编辑（可放在设置或顶部） -->
    <div class="session-edit">
      <el-input v-model="sessionId" placeholder="会话 ID" size="small" clearable class="session-input" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Search, Promotion, Connection } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const messageListRef = ref<HTMLElement | null>(null);
const sessionId = ref("session-001");
const commandText = ref("");
const parseResult = ref<{
  intent: string;
  entity: string;
  timeRange: string;
  metricType: string;
  params: string[];
} | null>(null);

const workflowNodes = [
  { name: "数据回溯", timeout: 30, retry: 3, circuitBreak: true, rule: "异常节点自动跳过，支持人工兜底" },
  { name: "特征提取", timeout: 60, retry: 2, circuitBreak: true, rule: "LCEL 异步节点" },
  { name: "根因推理", timeout: 120, retry: 2, circuitBreak: true, rule: "对接大模型" },
  { name: "报告生成", timeout: 45, retry: 2, circuitBreak: false, rule: "独立超时与重试" },
  { name: "方案输出", timeout: 30, retry: 1, circuitBreak: false, rule: "流程闭环" }
];

const toolsList = [
  { name: "data_pull", desc: "数据拉取", inputParams: "time_range, metric_ids", status: "可用" },
  { name: "anomaly_mark", desc: "异常标注", inputParams: "fault_id, threshold", status: "可用" },
  { name: "report_export", desc: "报告导出", inputParams: "report_id, format", status: "可用" }
];

const toolCallRecords = [
  { time: "2025-03-15 10:00:00", tool: "data_pull", params: "最近1小时", result: "成功" },
  { time: "2025-03-15 10:01:00", tool: "anomaly_mark", params: "F001", result: "已标注" }
];

const chatMessages = ref([
  { id: 1, role: "user", content: "帮我查一下最近一小时的丢包率" },
  { id: 2, role: "assistant", content: "已拉取数据，发现 3 个异常点，已关联故障 ID：F001。" }
]);

function handleParse() {
  if (!commandText.value.trim()) {
    ElMessage.warning("请输入指令");
    return;
  }
  parseResult.value = {
    intent: "数据查询",
    entity: "丢包率、异常数据",
    timeRange: "最近1小时",
    metricType: "网络指标",
    params: ["time_range=1h", "metric=packet_loss"]
  };
  ElMessage.success("解析完成");
}

function handleSendFromCommand() {
  if (!commandText.value.trim()) return;
  chatMessages.value.push(
    { id: Date.now(), role: "user", content: commandText.value },
    {
      id: Date.now() + 1,
      role: "assistant",
      content: "已根据指令执行，上下文已关联当前会话。"
    }
  );
  commandText.value = "";
}
</script>

<style scoped>
.llm-ops {
  padding: 0;
  min-height: 0;
}
.ops-workspace {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 0;
  min-height: 560px;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
}
@media (max-width: 900px) {
  .ops-workspace {
    grid-template-columns: 1fr;
  }
}

/* 左侧主区 */
.main-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-right: 1px solid var(--el-border-color-lighter);
}
.panel-header {
  padding: 14px 20px;
  background: linear-gradient(180deg, var(--el-fill-color-light) 0%, var(--el-bg-color) 100%);
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}
.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: block;
}
.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}
.session-pill {
  font-size: 12px;
  color: var(--el-text-color-regular);
  padding: 4px 10px;
  background: var(--el-fill-color);
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.meta-icon {
  font-size: 12px;
  color: var(--el-color-primary);
}
.redis-pill {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-color-success);
  flex-shrink: 0;
}

.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 16px;
}
.message-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
  min-height: 200px;
}
.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.msg-user {
  flex-direction: row-reverse;
}
.msg-avatar {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
}
.parse-avatar {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
}
.assistant-avatar {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
.user-avatar {
  background: var(--el-fill-color-dark);
  color: var(--el-text-color-primary);
}
.msg-body {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.55;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.user-bubble {
  background: var(--el-color-primary);
  color: #fff;
}
.assistant-bubble {
  background: var(--el-fill-color);
  color: var(--el-text-color-primary);
}
.msg-parse .msg-body {
  max-width: 100%;
  padding: 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
}
.parse-desc :deep(.el-descriptions__body) {
  background: var(--el-bg-color);
}
.param-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}

.input-bar {
  flex-shrink: 0;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.input-textarea :deep(.el-textarea__inner) {
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
}
.input-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}
.input-hint {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  margin-left: 4px;
}

/* 右侧边栏 */
.side-panel {
  overflow-y: auto;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.side-block {
  flex-shrink: 0;
}
.side-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}
.pipeline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}
.pipeline-node {
  padding: 6px 10px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  text-align: center;
}
.pipeline-node.active {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}
.node-name {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.node-meta {
  display: block;
  font-size: 10px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}
.pipeline-arrow {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  padding: 0 2px;
}
.tool-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tool-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  font-size: 12px;
}
.tool-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-color-success);
  flex-shrink: 0;
}
.tool-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  min-width: 90px;
}
.tool-desc {
  color: var(--el-text-color-secondary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.call-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.call-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--el-bg-color);
  border-radius: 6px;
  font-size: 12px;
  border: 1px solid var(--el-border-color-lighter);
}
.call-tool {
  font-weight: 500;
  min-width: 80px;
  color: var(--el-text-color-primary);
}
.call-params {
  flex: 1;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.call-result {
  flex-shrink: 0;
}
.session-edit {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
.session-input {
  width: 180px;
}
</style>
