<template>
  <div class="ai-task-detail">
    <el-row :gutter="20">
      <!-- 左侧摘要面板 -->
      <el-col :span="6">
        <el-card class="summary-card">
          <template #header>
            <div class="card-header">
              <span>任务信息</span>
            </div>
          </template>

          <div class="summary-content">
            <div class="summary-item">
              <div class="label">任务名称</div>
              <div class="value">{{ taskData.taskName }}</div>
            </div>

            <div class="summary-item">
              <div class="label">任务状态</div>
              <div class="value">
                <el-tag
                  :type="getStatusType(taskData.status)"
                  size="large"
                  :effect="'dark'"
                >
                  {{ getStatusText(taskData.status) }}
                </el-tag>
              </div>
            </div>

            <div class="summary-item">
              <div class="label">创建时间</div>
              <div class="value">{{ taskData.createTime }}</div>
            </div>

            <div class="summary-item">
              <div class="label">创建来源</div>
              <div class="value">{{ taskData.createSource }}</div>
            </div>

            <div class="summary-item">
              <div class="label">关联告警</div>
              <div class="value">
                <el-link
                  type="primary"
                  :underline="false"
                  @click="handleViewAlert"
                >
                  {{ taskData.alertId }}
                </el-link>
              </div>
            </div>

            <div class="summary-item">
              <div class="label">使用话术</div>
              <div class="value">{{ taskData.scriptName }}</div>
            </div>

            <div class="summary-item">
              <div class="label">目标联系人</div>
              <div class="value">
                <div
                  v-for="contact in taskData.contacts"
                  :key="contact.id"
                  style="margin-bottom: 5px"
                >
                  {{ contact.name }} ({{ contact.phone }})
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <el-button
              v-if="taskData.status === 'pending'"
              type="primary"
              @click="handleEdit"
              style="width: 100%; margin-bottom: 10px"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              v-if="
                taskData.status === 'failed' || taskData.status === 'no_answer'
              "
              type="warning"
              @click="handleRetry"
              style="width: 100%; margin-bottom: 10px"
            >
              <el-icon><Phone /></el-icon>
              重呼
            </el-button>
            <el-button type="default" @click="handleExport" style="width: 100%">
              <el-icon><Download /></el-icon>
              导出详情
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧主内容区 -->
      <el-col :span="18">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>任务详情</span>
            </div>
          </template>

          <!-- 时间线 -->
          <div class="timeline-section">
            <h3>任务时间线</h3>
            <el-timeline>
              <el-timeline-item
                v-for="event in timelineEvents"
                :key="event.id"
                :timestamp="event.time"
                :type="event.type"
                placement="top"
              >
                <div class="timeline-content">
                  <div class="timeline-title">{{ event.title }}</div>
                  <div v-if="event.description" class="timeline-desc">
                    {{ event.description }}
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>

          <!-- 呼叫记录明细 -->
          <div class="call-records-section">
            <h3>呼叫记录</h3>
            <el-table :data="callRecords" border style="width: 100%">
              <el-table-column
                prop="targetPhone"
                label="被叫号码"
                width="150"
              />
              <el-table-column prop="contactName" label="联系人" width="120" />
              <el-table-column prop="callTime" label="呼叫时间" width="180" />
              <el-table-column prop="duration" label="通话时长" width="120">
                <template #default="{ row }">
                  {{ row.duration ? `${row.duration}秒` : "-" }}
                </template>
              </el-table-column>
              <el-table-column prop="result" label="呼叫结果" width="120">
                <template #default="{ row }">
                  <el-tag :type="getResultType(row.result)" size="small">
                    {{ getResultText(row.result) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button
                    link
                    type="primary"
                    size="small"
                    @click="handleViewCallDetail(row)"
                  >
                    查看详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 通话内容转写（展开区域） -->
          <div v-if="selectedCallRecord" class="call-transcript-section">
            <h3>通话内容转写</h3>
            <el-card shadow="never">
              <div class="transcript-header">
                <span>被叫号码：{{ selectedCallRecord.targetPhone }}</span>
                <span>通话时间：{{ selectedCallRecord.callTime }}</span>
                <span>通话时长：{{ selectedCallRecord.duration }}秒</span>
              </div>
              <div class="transcript-content">
                <div
                  v-for="(item, index) in selectedCallRecord.transcript"
                  :key="index"
                  class="transcript-item"
                  :class="item.speaker === 'AI' ? 'ai-speaker' : 'user-speaker'"
                >
                  <div class="speaker-label">
                    {{ item.speaker === "AI" ? "AI" : "用户" }}
                  </div>
                  <div class="speaker-content">{{ item.content }}</div>
                  <div class="speaker-time">{{ item.time }}</div>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 关联事件信息 -->
          <div class="related-event-section">
            <h3>关联事件</h3>
            <el-card shadow="never">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="事件ID">
                  <el-link
                    type="primary"
                    :underline="false"
                    @click="handleViewAlert"
                  >
                    {{ alertInfo.id }}
                  </el-link>
                </el-descriptions-item>
                <el-descriptions-item label="告警标题">{{
                  alertInfo.title
                }}</el-descriptions-item>
                <el-descriptions-item label="告警级别">
                  <el-tag
                    :type="getAlertLevelType(alertInfo.level)"
                    size="small"
                  >
                    {{ alertInfo.level }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="发生时间">{{
                  alertInfo.occurTime
                }}</el-descriptions-item>
                <el-descriptions-item label="受影响设备" :span="2">
                  {{ alertInfo.affectedDevice }}
                </el-descriptions-item>
                <el-descriptions-item label="事件描述" :span="2">
                  {{ alertInfo.description }}
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { Edit, Phone, Download } from "@element-plus/icons-vue";

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface CallRecord {
  id: string;
  targetPhone: string;
  contactName: string;
  callTime: string;
  duration: number;
  result: "success" | "no_answer" | "busy" | "failed" | "rejected";
  transcript?: Array<{
    speaker: "AI" | "user";
    content: string;
    time: string;
  }>;
}

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description?: string;
  type: "primary" | "success" | "warning" | "danger" | "info";
}

const router = useRouter();
const route = useRoute();
const taskId = computed(() => route.params.id as string);

const selectedCallRecord = ref<CallRecord | null>(null);

// 任务数据
const taskData = ref({
  id: "",
  taskName: "",
  status: "pending" as
    | "pending"
    | "calling"
    | "completed"
    | "failed"
    | "no_answer",
  createTime: "",
  createSource: "",
  alertId: "",
  scriptName: "",
  contacts: [] as Contact[]
});

// 时间线事件
const timelineEvents = ref<TimelineEvent[]>([]);

// 呼叫记录
const callRecords = ref<CallRecord[]>([]);

// 关联告警信息
const alertInfo = reactive({
  id: "",
  title: "",
  level: "",
  occurTime: "",
  affectedDevice: "",
  description: ""
});

// 加载任务详情
onMounted(() => {
  // 验证路由参数
  if (!taskId.value || taskId.value === "undefined") {
    ElMessage.error("缺少任务ID参数");
    router.push("/call/ai-task");
    return;
  }

  // 模拟从API加载数据
  setTimeout(() => {
    taskData.value = {
      id: taskId.value,
      taskName: "告警-【核心路由器宕机】-2024-01-15 14:30",
      status: "completed",
      createTime: "2024-01-15 14:30:25",
      createSource: '由告警规则"核心路由器宕机"自动创建',
      alertId: "ALERT-2024-001",
      scriptName: "紧急故障通知话术",
      contacts: [{ id: "1", name: "张三", phone: "13800138000" }]
    };

    timelineEvents.value = [
      {
        id: "1",
        time: "2024-01-15 14:30:25",
        title: "任务创建",
        description: "由告警规则自动创建",
        type: "primary"
      },
      {
        id: "2",
        time: "2024-01-15 14:30:30",
        title: "开始呼叫",
        description: "开始呼叫 13800138000",
        type: "info"
      },
      {
        id: "3",
        time: "2024-01-15 14:31:15",
        title: "呼叫成功",
        description: "用户已接听，通话时长45秒",
        type: "success"
      },
      {
        id: "4",
        time: "2024-01-15 14:31:20",
        title: "任务完成",
        description: "所有呼叫已完成",
        type: "success"
      }
    ];

    callRecords.value = [
      {
        id: "1",
        targetPhone: "13800138000",
        contactName: "张三",
        callTime: "2024-01-15 14:30:30",
        duration: 45,
        result: "success",
        transcript: [
          {
            speaker: "AI",
            content:
              "您好，这里是运维告警系统。检测到您的核心路由器出现故障，请及时处理。",
            time: "14:30:32"
          },
          {
            speaker: "user",
            content: "好的，我收到了，马上处理。",
            time: "14:30:38"
          },
          {
            speaker: "AI",
            content: "感谢您的确认，系统将持续监控。如有需要，请随时联系我们。",
            time: "14:30:45"
          }
        ]
      }
    ];

    alertInfo.id = "ALERT-2024-001";
    alertInfo.title = "核心路由器宕机";
    alertInfo.level = "P0";
    alertInfo.occurTime = "2024-01-15 14:30:00";
    alertInfo.affectedDevice = "核心路由器-001 (192.168.1.1)";
    alertInfo.description =
      "核心路由器在14:30:00检测到宕机，导致网络中断，影响范围：所有业务系统。";
  }, 300);
});

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "待呼叫",
    calling: "呼叫中",
    completed: "已完成",
    failed: "已失败",
    no_answer: "未接听"
  };
  return statusMap[status] || status;
};

const getStatusType = (status: string) => {
  const statusMap: Record<string, "success" | "info" | "warning" | "danger"> = {
    pending: "info",
    calling: "warning",
    completed: "success",
    failed: "danger",
    no_answer: "warning"
  };
  return statusMap[status] || "info";
};

const getResultText = (result: string) => {
  const resultMap: Record<string, string> = {
    success: "成功接听",
    no_answer: "无人接听",
    busy: "忙线",
    failed: "呼叫失败",
    rejected: "拒接"
  };
  return resultMap[result] || result;
};

const getResultType = (result: string) => {
  const resultMap: Record<string, "success" | "info" | "warning" | "danger"> = {
    success: "success",
    no_answer: "warning",
    busy: "warning",
    failed: "danger",
    rejected: "danger"
  };
  return resultMap[result] || "info";
};

const getAlertLevelType = (level: string) => {
  const levelMap: Record<string, "success" | "info" | "warning" | "danger"> = {
    P0: "danger",
    P1: "warning",
    P2: "info",
    P3: "success"
  };
  return levelMap[level] || "info";
};

const handleEdit = () => {
  router.push(`/call/ai-task/edit/${taskId.value}`);
};

const handleRetry = () => {
  ElMessage.info("重呼功能");
};

const handleExport = () => {
  ElMessage.success("导出功能开发中");
};

const handleViewAlert = () => {
  ElMessage.info(`查看告警详情: ${alertInfo.id}`);
};

const handleViewCallDetail = (record: CallRecord) => {
  if (selectedCallRecord.value?.id === record.id) {
    selectedCallRecord.value = null;
  } else {
    selectedCallRecord.value = record;
  }
};
</script>

<style scoped lang="scss">
.ai-task-detail {
  padding: 20px;
  height: 100%;

  .summary-card {
    .card-header {
      font-weight: bold;
    }

    .summary-content {
      .summary-item {
        margin-bottom: 20px;

        .label {
          font-size: 12px;
          color: #909399;
          margin-bottom: 5px;
        }

        .value {
          font-size: 14px;
          color: #303133;
          word-break: break-all;
        }
      }
    }

    .action-buttons {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;
    }
  }

  .timeline-section {
    margin-bottom: 30px;

    h3 {
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: bold;
    }

    .timeline-content {
      .timeline-title {
        font-weight: 500;
        margin-bottom: 5px;
      }

      .timeline-desc {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .call-records-section {
    margin-bottom: 30px;

    h3 {
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: bold;
    }
  }

  .call-transcript-section {
    margin-bottom: 30px;

    h3 {
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: bold;
    }

    .transcript-header {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #ebeef5;
      font-size: 14px;
      color: #606266;
    }

    .transcript-content {
      .transcript-item {
        display: flex;
        margin-bottom: 15px;
        padding: 10px;
        border-radius: 4px;

        &.ai-speaker {
          background-color: #ecf5ff;
        }

        &.user-speaker {
          background-color: #f0f9ff;
        }

        .speaker-label {
          min-width: 50px;
          font-weight: bold;
          color: #409eff;
        }

        .speaker-content {
          flex: 1;
          margin: 0 10px;
        }

        .speaker-time {
          min-width: 80px;
          font-size: 12px;
          color: #909399;
          text-align: right;
        }
      }
    }
  }

  .related-event-section {
    h3 {
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: bold;
    }
  }
}
</style>
