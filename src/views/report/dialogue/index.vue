<template>
  <div class="dialogue-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>对话管理</span>
          <div class="header-actions">
            <el-select v-model="statusFilter" placeholder="状态" size="small" clearable style="width: 110px">
              <el-option label="进行中" value="active" />
              <el-option label="已完成" value="done" />
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="-"
              start-placeholder="开始"
              end-placeholder="结束"
              size="small"
              style="width: 240px"
            />
          </div>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="session-list">
            <div
              v-for="s in paginatedSessions"
              :key="s.id"
              class="session-item"
              :class="{ active: currentSession?.id === s.id }"
              @click="currentSession = s"
            >
              <div class="session-id">{{ s.id }}</div>
              <div class="session-meta">{{ s.time }} · {{ s.status }}</div>
              <div class="session-summary">{{ s.summary }}</div>
            </div>
          </div>
          <el-pagination
            v-model:current-page="sessionPage"
            :page-size="10"
            :total="sessionList.length"
            layout="total, prev, pager, next"
            small
            class="pagination"
          />
        </el-col>
        <el-col :span="16">
          <template v-if="currentSession">
            <div class="chat-area">
              <div class="msg user"><span>生成核心交换机报告</span></div>
              <div class="msg system"><span>请选择报告类型：巡检报告、故障分析报告 或 运行报告？</span></div>
              <div class="msg user"><span>巡检报告</span></div>
              <div class="msg system"><span>请指定区域范围（如：北京区域、上海区域）</span></div>
              <div class="msg user"><span>北京区域</span></div>
              <div class="msg system success"><span>已确认：核心交换机 + 北京区域 + 巡检报告，正在生成…</span></div>
            </div>
            <el-card shadow="never" class="state-card">
              <template #header>
                <span>当前会话状态</span>
              </template>
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="会话ID">{{ currentSession.id }}</el-descriptions-item>
                <el-descriptions-item label="阶段">参数补全</el-descriptions-item>
                <el-descriptions-item label="已收集">报告类型、区域</el-descriptions-item>
                <el-descriptions-item label="待确认">时间范围（可选）</el-descriptions-item>
              </el-descriptions>
            </el-card>
          </template>
          <el-empty v-else description="从左侧选择会话查看对话内容" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const statusFilter = ref("");
const dateRange = ref<[Date, Date] | null>(null);
const sessionPage = ref(1);
const sessionList = ref([
  { id: "sess_8f3a2b1c", time: "2025-03-14 10:32", status: "进行中", summary: "核心交换机 + 北京 + 巡检报告" },
  { id: "sess_7e2c9a0d", time: "2025-03-14 09:15", status: "已完成", summary: "端口流量分析报告" },
  { id: "sess_6d1b8e3f", time: "2025-03-13 16:20", status: "已完成", summary: "骨干链路故障分析" },
  { id: "sess_5c0a7d2e", time: "2025-03-13 14:10", status: "已完成", summary: "设备健康度月度报告" },
  { id: "sess_4b9e6c1d", time: "2025-03-13 11:05", status: "已完成", summary: "告警统计与处理汇总" },
  { id: "sess_3a8d5b0c", time: "2025-03-12 17:30", status: "已完成", summary: "上海区域核心设备巡检" },
  { id: "sess_2b7c4a9e", time: "2025-03-12 15:20", status: "已完成", summary: "故障根因分析报告" },
  { id: "sess_1a6b3e8d", time: "2025-03-12 10:00", status: "已完成", summary: "端口利用率趋势分析" },
  { id: "sess_0e5d2c7b", time: "2025-03-11 16:45", status: "已完成", summary: "骨干链路质量周报" },
  { id: "sess_9f4e1b6a", time: "2025-03-11 09:30", status: "已完成", summary: "运维值班日报" },
  { id: "sess_8e3d0a5c", time: "2025-03-10 14:15", status: "已完成", summary: "网络拓扑与连通性报告" }
]);
const paginatedSessions = computed(() => {
  const start = (sessionPage.value - 1) * 10;
  return sessionList.value.slice(start, start + 10);
});
const currentSession = ref(sessionList.value[0]);
</script>

<style scoped lang="scss">
.dialogue-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .session-list {
    max-height: 420px;
    overflow-y: auto;
  }

  .pagination {
    margin-top: 12px;
  }

  .session-item {
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 8px;
    cursor: pointer;
    border: 1px solid transparent;

    &:hover,
    &.active {
      background: #ecf5ff;
      border-color: #d9ecff;
    }

    .session-id {
      font-size: 12px;
      color: #909399;
      margin-bottom: 4px;
    }

    .session-meta {
      font-size: 12px;
      color: #606266;
      margin-bottom: 4px;
    }

    .session-summary {
      font-size: 13px;
      color: #303133;
    }
  }

  .chat-area {
    min-height: 260px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  .msg {
    max-width: 85%;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;

    &.user {
      align-self: flex-end;
      background: #ecf5ff;
      border: 1px solid #d9ecff;
    }

    &.system {
      align-self: flex-start;
      background: #f4f4f5;
      border: 1px solid #e9e9eb;
    }

    &.success {
      background: #f0f9eb;
      border-color: #e1f3d8;
    }
  }

  .state-card {
    margin-top: 0;
  }
}
</style>
