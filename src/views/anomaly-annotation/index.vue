<template>
  <div class="anomaly-annotation">
    <div class="anno-workspace">
      <!-- 左侧：模式配置 + 结果 -->
      <div class="main-panel">
        <div class="panel-header">
          <span class="panel-title">异常点智能标注</span>
          <div class="mode-toggle">
            <el-radio-group v-model="annotationMode" size="default">
              <el-radio-button value="auto">动态阈值自动标注</el-radio-button>
              <el-radio-button value="manual">人工自定义标注</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <!-- 自动标注：Prophet 配置 + 动态阈值 -->
        <div v-show="annotationMode === 'auto'" class="config-block">
          <div class="config-strip">
            <el-input-number v-model="prophetForm.days" :min="30" :max="365" size="small" controls-position="right" />
            <span class="config-label">天以上正常数据训练</span>
            <el-tag type="success" size="small">训练已完成</el-tag>
            <el-tag type="info" size="small">Redis 阈值已连接</el-tag>
            <span class="config-hint">阈值实时更新，自适应业务波动</span>
          </div>
          <div class="block-label">动态阈值列表</div>
          <el-table :data="thresholdList" stripe size="small" class="data-table" max-height="220">
            <el-table-column prop="metric" label="指标" width="100" />
            <el-table-column prop="upper" label="上界" width="80" />
            <el-table-column prop="lower" label="下界" width="80" />
            <el-table-column prop="updateTime" label="更新时间" width="158" />
          </el-table>
        </div>

        <!-- 人工标注：FastAPI 配置 + 标记结果 -->
        <div v-show="annotationMode === 'manual'" class="config-block">
          <div class="config-strip manual-strip">
            <el-form :model="manualForm" inline size="small">
              <el-form-item label="阈值">
                <el-input v-model="manualForm.threshold" placeholder="如 0.05" style="width: 100px" />
              </el-form-item>
              <el-form-item label="偏差比例(%)">
                <el-input-number v-model="manualForm.deviation" :min="0" :max="100" style="width: 100px" controls-position="right" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleManualValidate">校验并标记</el-button>
                <el-button>从 MySQL 读取</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div class="block-label">标记结果</div>
          <el-table :data="manualResults" stripe size="small" class="data-table" max-height="200">
            <el-table-column prop="dataId" label="数据ID" width="88" />
            <el-table-column prop="value" label="数值" width="80" />
            <el-table-column prop="marked" label="是否异常" width="90">
              <template #default="{ row }">
                <el-tag :type="row.marked ? 'danger' : 'success'" size="small">{{ row.marked ? "异常" : "正常" }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 右侧：等级分类 + 复核 + 操作记录 -->
      <div class="side-panel">
        <div class="side-block">
          <div class="side-label">异常等级分类（与故障数据关联）</div>
          <ul class="level-list">
            <li v-for="l in levelList" :key="l.level" class="level-item">
              <el-tag :type="l.tagType" size="small" class="level-tag">{{ l.level }}</el-tag>
              <span class="level-desc">{{ l.desc }}</span>
              <span class="level-count">关联 {{ l.faultCount }}</span>
            </li>
          </ul>
        </div>

        <div class="side-block">
          <div class="side-label">待复核</div>
          <ul class="review-list">
            <li v-for="r in reviewList" :key="r.id" class="review-item">
              <span class="review-id">{{ r.id }}</span>
              <span class="review-content">{{ r.content }}</span>
              <div class="review-actions">
                <el-button link type="primary" size="small">通过</el-button>
                <el-button link type="danger" size="small">驳回</el-button>
                <el-button link type="warning" size="small">修正</el-button>
              </div>
            </li>
          </ul>
        </div>

        <div class="side-block">
          <div class="side-label">操作记录（可追溯可核查）</div>
          <ul class="audit-list">
            <li v-for="(log, i) in auditLogs" :key="i" class="audit-item">
              <span class="audit-time">{{ log.time }}</span>
              <span class="audit-action">{{ log.action }}</span>
              <span class="audit-detail">{{ log.detail }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

const annotationMode = ref<"auto" | "manual">("auto");

const prophetForm = reactive({ days: 30 });
const thresholdList = ref([
  { metric: "丢包率", upper: "0.02", lower: "0", updateTime: "2025-03-15 10:00:00" },
  { metric: "时延", upper: "100", lower: "10", updateTime: "2025-03-15 10:00:00" }
]);

const manualForm = reactive({ threshold: "0.05", deviation: 15 });
const manualResults = ref([
  { dataId: "D001", value: "0.08", marked: true },
  { dataId: "D002", value: "0.02", marked: false }
]);

const levelList = ref([
  { level: "P0", desc: "严重，立即处置", tagType: "danger", faultCount: 2 },
  { level: "P1", desc: "重要，优先处置", tagType: "warning", faultCount: 5 },
  { level: "P2", desc: "一般", tagType: "success", faultCount: 10 }
]);

const reviewList = ref([
  { id: "A001", faultId: "F001", content: "指标超阈值 2σ", status: "待复核" }
]);

const auditLogs = ref([
  { time: "2025-03-15 09:00:00", action: "自动标注", detail: "F001 异常点已标记" },
  { time: "2025-03-15 09:05:00", action: "复核通过", detail: "A001 通过" }
]);

function handleManualValidate() {}
</script>

<style scoped>
.anomaly-annotation {
  padding: 0;
}
.anno-workspace {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 0;
  min-height: 480px;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
}
@media (max-width: 900px) {
  .anno-workspace {
    grid-template-columns: 1fr;
  }
}

.main-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 16px;
  border-right: 1px solid var(--el-border-color-lighter);
}
.panel-header {
  margin-bottom: 16px;
  flex-shrink: 0;
}
.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: block;
}
.mode-toggle {
  margin-top: 12px;
}

.config-block {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.config-strip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 16px;
  padding: 12px 0;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.config-strip.manual-strip {
  border-bottom: none;
  padding-bottom: 8px;
}
.config-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
}
.config-hint {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-left: 4px;
}
.block-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}
.data-table {
  flex: 1;
  min-height: 120px;
}

.side-panel {
  overflow-y: auto;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.side-block {
  flex-shrink: 0;
}
.side-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
  display: block;
}
.level-list,
.review-list,
.audit-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.level-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  margin-bottom: 6px;
  font-size: 12px;
}
.level-item:last-child {
  margin-bottom: 0;
}
.level-tag {
  flex-shrink: 0;
  width: 36px;
  justify-content: center;
}
.level-desc {
  flex: 1;
  color: var(--el-text-color-primary);
}
.level-count {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.review-item {
  padding: 8px 10px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  margin-bottom: 6px;
  font-size: 12px;
}
.review-item:last-child {
  margin-bottom: 0;
}
.review-id {
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-right: 8px;
}
.review-content {
  color: var(--el-text-color-regular);
  display: block;
  margin-top: 4px;
  margin-bottom: 6px;
}
.review-actions {
  display: flex;
  gap: 4px;
}
.audit-item {
  padding: 6px 10px;
  background: var(--el-bg-color);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
  margin-bottom: 6px;
  font-size: 11px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.audit-item:last-child {
  margin-bottom: 0;
}
.audit-time {
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}
.audit-action {
  font-weight: 500;
  color: var(--el-text-color-primary);
  min-width: 56px;
}
.audit-detail {
  color: var(--el-text-color-secondary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
