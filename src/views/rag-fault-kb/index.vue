<template>
  <div class="rag-fault-kb">
    <div class="kb-workspace">
      <!-- 左侧：检索主区 + 结果 -->
      <div class="main-panel">
        <div class="panel-header">
          <span class="panel-title">RAG 故障知识库</span>
        </div>

        <!-- 统一检索与故障入口 -->
        <div class="search-bar">
          <div class="search-row">
            <el-radio-group v-model="searchForm.mode" size="default" class="mode-group">
              <el-radio-button value="keyword">关键词</el-radio-button>
              <el-radio-button value="vector">向量语义</el-radio-button>
              <el-radio-button value="hybrid">混合检索</el-radio-button>
            </el-radio-group>
            <el-input
              v-model="searchForm.keyword"
              placeholder="输入故障关键词或描述"
              clearable
              class="keyword-input"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button type="primary" @click="handleSearch">检索</el-button>
              </template>
            </el-input>
          </div>
          <div class="search-row filters">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始"
              end-placeholder="结束"
              value-format="YYYY-MM-DD"
              size="small"
              class="date-picker"
            />
            <el-select v-model="searchForm.source" placeholder="数据来源" clearable size="small" class="source-select">
              <el-option label="MySQL" value="mysql" />
              <el-option label="MongoDB" value="mongo" />
            </el-select>
            <span class="fault-id-label">故障 ID</span>
            <el-input v-model="relationFaultId" placeholder="查关联/回溯" size="small" clearable class="fault-id-input" />
            <el-button size="small" @click="handleRelationQuery">关联</el-button>
            <el-button size="small" @click="handleReuseQuery">回溯与复用</el-button>
          </div>
        </div>

        <!-- 五大维度标签：融入筛选 -->
        <div class="tag-strip">
          <span class="tag-label">维度筛选</span>
          <div class="tag-group">
            <span class="dim-label">网络专业</span>
            <el-tag v-for="t in tags.network" :key="t" size="small" class="dim-tag" effect="plain">{{ t }}</el-tag>
          </div>
          <div class="tag-group">
            <span class="dim-label">故障场景</span>
            <el-tag v-for="t in tags.scene" :key="t" size="small" type="warning" class="dim-tag" effect="plain">{{ t }}</el-tag>
          </div>
          <div class="tag-group">
            <span class="dim-label">数据来源</span>
            <el-tag v-for="t in tags.source" :key="t" size="small" type="info" class="dim-tag" effect="plain">{{ t }}</el-tag>
          </div>
          <div class="tag-group">
            <span class="dim-label">等级</span>
            <el-tag v-for="t in tags.level" :key="t" size="small" :type="t === 'P0' ? 'danger' : t === 'P1' ? 'warning' : 'success'" class="dim-tag" effect="plain">{{ t }}</el-tag>
          </div>
          <div class="tag-group">
            <span class="dim-label">类型</span>
            <el-tag v-for="t in tags.type" :key="t" size="small" type="success" class="dim-tag" effect="plain">{{ t }}</el-tag>
          </div>
        </div>

        <!-- 检索结果 -->
        <div class="results-area">
          <div class="results-header">
            <span class="results-title">检索结果</span>
            <el-button text size="small">管理标签</el-button>
          </div>
          <el-table :data="searchResults" stripe class="results-table" max-height="320">
            <el-table-column prop="id" label="知识ID" width="88" />
            <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="source" label="来源" width="80" />
            <el-table-column prop="score" label="相关度" width="80">
              <template #default="{ row }">
                <el-tag type="success" size="small">{{ row.score }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="158" />
          </el-table>
        </div>
      </div>

      <!-- 右侧：当前故障上下文（关联 + 标注 + 复用） -->
      <div class="side-panel">
        <div class="side-header">
          <span class="side-title">当前故障上下文</span>
          <span class="side-fault-id">{{ relationFaultId || '—' }}</span>
        </div>

        <div class="side-block">
          <div class="side-label">跨域关联知识与案例</div>
          <ul class="relation-list">
            <li v-for="r in relationList" :key="r.kbId" class="relation-item">
              <span class="rel-id">{{ r.kbId }}</span>
              <span class="rel-type">{{ r.relationType }}</span>
              <span class="rel-summary">{{ r.summary }}</span>
            </li>
          </ul>
        </div>

        <div class="side-block">
          <div class="side-label">异常标注与知识沉淀</div>
          <p class="storage-note">结构化存 MySQL，非结构化存 MongoDB，绑定故障 ID</p>
          <ul class="annotation-list">
            <li v-for="a in annotationList" :key="a.faultId + a.annotation" class="annotation-item">
              <span class="ann-storage">{{ a.storage }}</span>
              <span class="ann-text">{{ a.annotation }}</span>
            </li>
          </ul>
        </div>

        <div class="side-block">
          <div class="side-label">可复用案例</div>
          <ul class="reuse-list">
            <li v-for="c in reuseList" :key="c.caseId" class="reuse-item">
              <span class="reuse-case">{{ c.caseId }}</span>
              <span class="reuse-summary">{{ c.summary }}</span>
              <el-button link type="primary" size="small">复用</el-button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

const searchForm = reactive({
  mode: "keyword",
  keyword: "",
  dateRange: null as [string, string] | null,
  source: ""
});

const tags = {
  network: ["传输", "接入", "核心网"],
  scene: ["丢包", "时延抖动", "中断"],
  source: ["网管", "探针", "日志"],
  level: ["P0", "P1", "P2"],
  type: ["案例", "规则", "指标"]
};

const searchResults = ref([
  { id: "K001", title: "丢包率异常根因分析案例", source: "MySQL", score: "0.95", updateTime: "2025-03-15 10:00:00" },
  { id: "K002", title: "时延抖动阈值判定规则", source: "MongoDB", score: "0.88", updateTime: "2025-03-14 18:00:00" }
]);

const relationFaultId = ref("F001");
const relationList = ref([
  { kbId: "K001", relationType: "相似案例", summary: "同类型丢包根因与处置步骤" },
  { kbId: "R002", relationType: "规则", summary: "阈值与偏差比例规则" }
]);

const annotationList = ref([
  { faultId: "F001", annotation: "指标 A 超过动态阈值 2σ，判定为异常", storage: "MySQL", createTime: "2025-03-15 09:30:00" },
  { faultId: "F001", annotation: "非结构化案例描述与处置过程", storage: "MongoDB", createTime: "2025-03-15 09:35:00" }
]);

const reuseList = ref([
  { caseId: "C001", faultId: "F001", summary: "丢包根因：链路拥塞，处置：扩容与限流" }
]);

function handleSearch() {}
function handleRelationQuery() {}
function handleReuseQuery() {}
</script>

<style scoped>
.rag-fault-kb {
  padding: 0;
}
.kb-workspace {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 0;
  min-height: 520px;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
}
@media (max-width: 960px) {
  .kb-workspace {
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
.search-bar {
  flex-shrink: 0;
  margin-bottom: 14px;
}
.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.search-row.filters {
  flex-wrap: wrap;
  gap: 8px;
}
.mode-group {
  flex-shrink: 0;
}
.keyword-input {
  flex: 1;
  min-width: 200px;
}
.keyword-input :deep(.el-input-group__append) {
  padding: 0;
  border: none;
  background: transparent;
}
.keyword-input :deep(.el-input-group__append .el-button) {
  border-radius: 0 4px 4px 0;
  margin: 0;
}
.date-picker {
  width: 220px;
}
.source-select {
  width: 110px;
}
.fault-id-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: 8px;
}
.fault-id-input {
  width: 120px;
}

.tag-strip {
  flex-shrink: 0;
  padding: 12px 0;
  border-top: 1px solid var(--el-border-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
}
.tag-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  margin-right: 4px;
}
.tag-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.dim-label {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  min-width: 56px;
}
.dim-tag {
  margin: 0;
}

.results-area {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.results-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.results-table {
  flex: 1;
  min-height: 200px;
}

.side-panel {
  overflow-y: auto;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.side-header {
  flex-shrink: 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.side-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: block;
}
.side-fault-id {
  font-size: 12px;
  color: var(--el-color-primary);
  margin-top: 4px;
  display: block;
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
.storage-note {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  margin: 0 0 8px 0;
  line-height: 1.4;
}
.relation-list,
.annotation-list,
.reuse-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.relation-item,
.annotation-item,
.reuse-item {
  padding: 8px 10px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  margin-bottom: 6px;
  font-size: 12px;
}
.relation-item:last-child,
.annotation-item:last-child,
.reuse-item:last-child {
  margin-bottom: 0;
}
.rel-id {
  font-weight: 500;
  color: var(--el-color-primary);
  margin-right: 8px;
}
.rel-type {
  color: var(--el-text-color-secondary);
  margin-right: 8px;
}
.rel-summary {
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  max-width: 140px;
  vertical-align: bottom;
}
.ann-storage {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  margin-right: 8px;
}
.ann-text {
  color: var(--el-text-color-primary);
  display: block;
  margin-top: 2px;
  line-height: 1.4;
}
.reuse-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.reuse-case {
  font-weight: 500;
  min-width: 50px;
  color: var(--el-text-color-primary);
}
.reuse-summary {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-regular);
}
</style>
