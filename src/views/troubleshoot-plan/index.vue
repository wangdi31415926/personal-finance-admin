<template>
  <div class="troubleshoot-plan">
    <div class="plan-report">
      <!-- 顶部：当前故障摘要 -->
      <header class="report-header">
        <div class="fault-badge">故障 F001</div>
        <div class="fault-summary">
          <span class="summary-label">特征摘要</span>
          <span class="summary-text">丢包率突增、时延抖动</span>
        </div>
        <div class="fault-conclusion">
          <span class="conclusion-label">研判结论</span>
          <span class="conclusion-text">链路拥塞可能性 85%</span>
        </div>
      </header>

      <!-- 参考案例：横向卡片 -->
      <section class="report-section">
        <h3 class="section-title">相似案例（匹配度 ≥90%）</h3>
        <div class="case-cards">
          <div v-for="c in matchCases" :key="c.caseId" class="case-card">
            <span class="case-id">{{ c.caseId }}</span>
            <el-tag type="success" size="small" class="case-score">{{ c.score }}%</el-tag>
            <span class="case-cause">{{ c.rootCause }}</span>
            <span class="case-meta">{{ c.duration }} · {{ c.tools }}</span>
          </div>
        </div>
      </section>

      <!-- 优先级依据：四维权重 -->
      <section class="report-section">
        <h3 class="section-title">优先级评分依据</h3>
        <div class="score-pills">
          <div v-for="d in scoreDimensions" :key="d.dim" class="score-pill">
            <span class="pill-dim">{{ d.dim }}</span>
            <span class="pill-weight">{{ d.weight }}</span>
            <span class="pill-desc">{{ d.desc }}</span>
          </div>
        </div>
      </section>

      <!-- 排障步骤：时间线式主内容 -->
      <section class="report-section steps-section">
        <h3 class="section-title">排障步骤（按优先级执行）</h3>
        <div class="steps-timeline">
          <div v-for="(s, i) in stepList" :key="i" class="step-item">
            <div class="step-num">{{ s.priority }}</div>
            <div class="step-body">
              <div class="step-text">{{ s.step }}</div>
              <el-tag size="small" effect="plain" class="step-tool">{{ s.tool }}</el-tag>
            </div>
          </div>
        </div>
        <div class="plan-extra">
          <span><strong>专用工具</strong> 网管 CLI、限流控制台</span>
          <span><strong>安全规范</strong> 变更前需审批；避开业务高峰</span>
        </div>
      </section>

      <!-- 预期效果：紧凑信息条 -->
      <section class="report-section">
        <h3 class="section-title">预期效果预判</h3>
        <div class="effect-bar">
          <span class="effect-item"><em>预期状态</em> 指标恢复正常</span>
          <span class="effect-item"><em>预计时长</em> 约 15 分钟</span>
          <span class="effect-item"><em>风险等级</em> 低</span>
          <span class="effect-item"><em>回滚方案</em> 撤销限流策略</span>
        </div>
      </section>

      <!-- 处置档案与导出 -->
      <section class="report-section footer-section">
        <h3 class="section-title">处置档案</h3>
        <div class="archive-bar">
          <span>故障 ID F001</span>
          <span>研判结果 链路拥塞</span>
          <span>标注信息 3 个异常点已标注，等级 P1</span>
          <span>方案状态 已生成</span>
        </div>
        <div class="action-row">
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            一键导出
          </el-button>
          <el-button @click="handlePrint">
            <el-icon><Printer /></el-icon>
            打印
          </el-button>
        </div>
        <div class="archive-table-wrap">
          <div class="table-caption">处置档案列表（MongoDB，关联故障 ID）</div>
          <el-table :data="archiveList" size="small" stripe class="archive-table">
            <el-table-column prop="faultId" label="故障ID" width="88" />
            <el-table-column prop="conclusion" label="研判结论" min-width="200" show-overflow-tooltip />
            <el-table-column prop="planTime" label="生成时间" width="158" />
            <el-table-column label="" width="80">
              <template #default>
                <el-button link type="primary" size="small">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Download, Printer } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const matchCases = ref([
  { caseId: "C001", score: 95, rootCause: "链路拥塞", duration: "12min", tools: "网管CLI" },
  { caseId: "C002", score: 92, rootCause: "队列满", duration: "18min", tools: "限流控制台" }
]);

const scoreDimensions = ref([
  { dim: "根因占比", weight: "30%", desc: "与当前研判根因一致度" },
  { dim: "排障耗时", weight: "25%", desc: "历史案例处置时长" },
  { dim: "操作难度", weight: "25%", desc: "步骤复杂度" },
  { dim: "工具通用性", weight: "20%", desc: "工具可复用性" }
]);

const stepList = ref([
  { priority: 1, step: "检查链路利用率，确认是否超 80%", tool: "网管CLI" },
  { priority: 2, step: "执行限流策略或扩容", tool: "限流控制台" },
  { priority: 3, step: "观察 5 分钟指标是否恢复", tool: "监控" }
]);

const archiveList = ref([
  { faultId: "F001", conclusion: "链路拥塞，已生成排障方案", planTime: "2025-03-15 10:30:00" }
]);

function handleExport() {
  ElMessage.success("导出功能（占位）");
}
function handlePrint() {
  ElMessage.success("打印功能（占位）");
}
</script>

<style scoped>
.troubleshoot-plan {
  padding: 0;
}
.plan-report {
  max-width: 820px;
  margin: 0 auto;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
}

.report-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px 24px;
  padding: 18px 24px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-fill-color-light) 100%);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.fault-badge {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-color-primary);
  padding: 6px 14px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-color-primary-light-5);
}
.fault-summary,
.fault-conclusion {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.summary-label,
.conclusion-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}
.summary-text,
.conclusion-text {
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.report-section {
  padding: 20px 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.report-section:last-child {
  border-bottom: none;
}
.footer-section {
  padding-bottom: 24px;
}
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 14px 0;
}

.case-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.case-card {
  flex: 1;
  min-width: 160px;
  max-width: 240px;
  padding: 12px 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.case-id {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.case-score {
  align-self: flex-start;
}
.case-cause {
  font-size: 13px;
  color: var(--el-text-color-primary);
}
.case-meta {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.score-pills {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
@media (max-width: 640px) {
  .score-pills {
    grid-template-columns: repeat(2, 1fr);
  }
}
.score-pill {
  padding: 10px 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  font-size: 12px;
}
.pill-dim {
  display: block;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}
.pill-weight {
  color: var(--el-color-primary);
  font-weight: 600;
  margin-right: 6px;
}
.pill-desc {
  color: var(--el-text-color-secondary);
}

.steps-section {
  background: var(--el-fill-color-lighter);
}
.steps-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.step-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 14px 0;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}
.step-item:last-of-type {
  border-bottom: none;
}
.step-num {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.step-body {
  flex: 1;
  min-width: 0;
}
.step-text {
  font-size: 14px;
  color: var(--el-text-color-primary);
  line-height: 1.5;
  margin-bottom: 6px;
}
.step-tool {
  font-size: 11px;
}
.plan-extra {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.plan-extra strong {
  color: var(--el-text-color-regular);
  margin-right: 6px;
}

.effect-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  font-size: 13px;
  color: var(--el-text-color-primary);
}
.effect-item em {
  font-style: normal;
  color: var(--el-text-color-secondary);
  margin-right: 6px;
}

.archive-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 20px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-bottom: 16px;
}
.action-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.table-caption {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 8px;
}
.archive-table-wrap {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}
.archive-table {
  font-size: 12px;
}
</style>
