<template>
  <el-dialog
    v-model="dialogVisible"
    title="AI任务详情"
    width="1200px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="task-detail">
      <el-row :gutter="20">
        <!-- 左侧摘要信息 -->
        <el-col :span="8">
          <el-card shadow="never" class="summary-card">
            <template #header>
              <div class="card-header">任务概览</div>
            </template>
            <div class="summary-content">
              <div class="summary-item">
                <div class="label">任务名称</div>
                <div class="value">{{ taskData.taskName }}</div>
              </div>
              <div class="summary-item">
                <div class="label">任务状态</div>
                <div class="value">
                  <el-tag :type="getStatusType(taskData.status)">
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
                <div class="label">使用话术</div>
                <div class="value">{{ taskData.scriptName }}</div>
              </div>
              <div class="summary-item">
                <div class="label">关联告警</div>
                <div class="value">
                  <el-link type="primary" @click="handleViewAlert">
                    {{ taskData.alertTitle }}
                  </el-link>
                </div>
              </div>
            </div>

            <!-- 快捷操作 -->
            <div class="action-buttons">
              <el-button
                v-if="
                  taskData.status === 'pending' || taskData.status === 'calling'
                "
                type="primary"
                @click="handleEdit"
              >
                编辑任务
              </el-button>
              <el-button
                v-if="
                  taskData.status === 'failed' ||
                  taskData.status === 'no_answer'
                "
                type="warning"
                @click="handleRetry"
              >
                重新呼叫
              </el-button>
            </div>

            <!-- 生命周期时间线 -->
            <div class="timeline-section">
              <div class="section-title">任务生命周期</div>
              <el-timeline>
                <el-timeline-item
                  v-for="event in lifecycleEvents"
                  :key="event.id"
                  :timestamp="event.time"
                  :type="event.type"
                >
                  {{ event.description }}
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧详细内容 -->
        <el-col :span="16">
          <el-tabs v-model="activeTab">
            <!-- 呼叫记录明细 -->
            <el-tab-pane label="呼叫记录" name="calls">
              <el-table :data="callRecords" border stripe>
                <el-table-column prop="phone" label="被叫号码" width="150" />
                <el-table-column
                  prop="contactName"
                  label="联系人"
                  width="120"
                />
                <el-table-column prop="callTime" label="呼叫时间" width="180" />
                <el-table-column prop="result" label="呼叫结果" width="120">
                  <template #default="{ row }">
                    <el-tag :type="getResultType(row.result)">
                      {{ row.result }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="duration" label="通话时长" width="120">
                  <template #default="{ row }">
                    {{ row.duration ? `${row.duration}秒` : "-" }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
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
            </el-tab-pane>

            <!-- 关联上下文 -->
            <el-tab-pane label="关联上下文" name="context">
              <el-card shadow="never">
                <div class="context-content">
                  <div class="context-item">
                    <div class="label">告警标题</div>
                    <div class="value">{{ taskData.alertTitle }}</div>
                  </div>
                  <div class="context-item">
                    <div class="label">告警级别</div>
                    <div class="value">
                      <el-tag type="danger">P0</el-tag>
                    </div>
                  </div>
                  <div class="context-item">
                    <div class="label">发生时间</div>
                    <div class="value">{{ taskData.alertTime }}</div>
                  </div>
                  <div class="context-item">
                    <div class="label">受影响设备</div>
                    <div class="value">核心路由器-192.168.1.1</div>
                  </div>
                  <div class="context-item">
                    <div class="label">告警描述</div>
                    <div class="value">
                      核心路由器在14:30:25发生宕机，导致网络中断，影响范围包括所有业务系统。
                      需要立即进行故障排查和恢复。
                    </div>
                  </div>
                </div>
              </el-card>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>

    <!-- 呼叫详情弹窗 -->
    <el-dialog
      v-model="callDetailVisible"
      title="呼叫详情"
      width="800px"
      append-to-body
    >
      <div v-if="currentCallDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="被叫号码">
            {{ currentCallDetail.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="联系人">
            {{ currentCallDetail.contactName }}
          </el-descriptions-item>
          <el-descriptions-item label="呼叫时间">
            {{ currentCallDetail.callTime }}
          </el-descriptions-item>
          <el-descriptions-item label="呼叫结果">
            <el-tag :type="getResultType(currentCallDetail.result)">
              {{ currentCallDetail.result }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="通话时长">
            {{
              currentCallDetail.duration
                ? `${currentCallDetail.duration}秒`
                : "-"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="振铃时长">
            {{
              currentCallDetail.ringDuration
                ? `${currentCallDetail.ringDuration}秒`
                : "-"
            }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentCallDetail.transcript" class="transcript-section">
          <div class="section-title">通话内容转写</div>
          <div class="transcript-content">
            <div
              v-for="(item, index) in currentCallDetail.transcript"
              :key="index"
              class="transcript-item"
            >
              <div class="speaker">{{ item.speaker }}：</div>
              <div class="content">{{ item.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { ElMessage } from "element-plus";

interface CallRecord {
  id: string;
  phone: string;
  contactName: string;
  callTime: string;
  result: string;
  duration?: number;
  ringDuration?: number;
  transcript?: Array<{ speaker: string; content: string }>;
}

interface LifecycleEvent {
  id: string;
  time: string;
  description: string;
  type?: string;
}

const props = defineProps<{
  modelValue: boolean;
  taskId: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: val => emit("update:modelValue", val)
});

const activeTab = ref("calls");
const callDetailVisible = ref(false);
const currentCallDetail = ref<CallRecord | null>(null);

const taskData = reactive({
  taskName: "",
  status: "calling" as
    | "pending"
    | "calling"
    | "completed"
    | "failed"
    | "no_answer",
  createTime: "",
  createSource: "自动创建",
  scriptName: "",
  alertTitle: "",
  alertTime: ""
});

const callRecords = ref<CallRecord[]>([]);
const lifecycleEvents = ref<LifecycleEvent[]>([]);

// 加载任务详情
const loadTaskDetail = async () => {
  if (!props.taskId) return;

  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 500));

  // 模拟数据
  Object.assign(taskData, {
    taskName: "告警-【核心路由器宕机】-2024-01-15 14:30",
    status: "calling",
    createTime: "2024-01-15 14:30:25",
    createSource: "自动创建",
    scriptName: "紧急故障通知话术",
    alertTitle: "核心路由器宕机",
    alertTime: "2024-01-15 14:30:20"
  });

  callRecords.value = [
    {
      id: "1",
      phone: "13800138000",
      contactName: "张三",
      callTime: "2024-01-15 14:31:00",
      result: "成功接听",
      duration: 120,
      ringDuration: 5,
      transcript: [
        {
          speaker: "AI",
          content:
            "您好，这里是运维告警系统，检测到核心路由器发生故障，需要您立即处理。"
        },
        { speaker: "用户", content: "好的，我收到了，马上处理。" },
        { speaker: "AI", content: "感谢您的确认，系统已记录您的响应。" }
      ]
    },
    {
      id: "2",
      phone: "13900139000",
      contactName: "李四",
      callTime: "2024-01-15 14:32:00",
      result: "无人接听",
      ringDuration: 30
    },
    {
      id: "3",
      phone: "13700137000",
      contactName: "王五",
      callTime: "2024-01-15 14:33:00",
      result: "忙线",
      ringDuration: 0
    }
  ];

  lifecycleEvents.value = [
    {
      id: "1",
      time: "2024-01-15 14:30:25",
      description: "任务创建",
      type: "primary"
    },
    {
      id: "2",
      time: "2024-01-15 14:31:00",
      description: "开始呼叫",
      type: "success"
    },
    {
      id: "3",
      time: "2024-01-15 14:31:05",
      description: "首次呼叫成功",
      type: "success"
    }
  ];
};

watch(
  () => props.modelValue,
  val => {
    if (val && props.taskId) {
      loadTaskDetail();
    }
  }
);

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "info",
    calling: "warning",
    completed: "success",
    failed: "danger",
    no_answer: "warning"
  };
  return statusMap[status] || "info";
};

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

const getResultType = (result: string) => {
  const resultMap: Record<string, string> = {
    成功接听: "success",
    无人接听: "warning",
    忙线: "info",
    号码无效: "danger",
    系统挂机: "info"
  };
  return resultMap[result] || "info";
};

const handleViewAlert = () => {
  ElMessage.info(`查看告警详情: ${taskData.alertTitle}`);
};

const handleEdit = () => {
  ElMessage.info("跳转到编辑页面");
};

const handleRetry = () => {
  ElMessage.info("重新呼叫");
};

const handleViewCallDetail = (row: CallRecord) => {
  currentCallDetail.value = row;
  callDetailVisible.value = true;
};

const handleClose = () => {
  dialogVisible.value = false;
};
</script>

<style scoped lang="scss">
.task-detail {
  .summary-card {
    .card-header {
      font-weight: 500;
      font-size: 16px;
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
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;

      .el-button {
        width: 100%;
        margin-bottom: 10px;
      }
    }

    .timeline-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;

      .section-title {
        font-weight: 500;
        margin-bottom: 15px;
        color: #303133;
      }
    }
  }

  .context-content {
    .context-item {
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

  .transcript-section {
    margin-top: 20px;

    .section-title {
      font-weight: 500;
      margin-bottom: 15px;
      color: #303133;
    }

    .transcript-content {
      border: 1px solid #ebeef5;
      border-radius: 4px;
      padding: 15px;
      max-height: 400px;
      overflow-y: auto;

      .transcript-item {
        margin-bottom: 15px;

        .speaker {
          font-weight: 500;
          color: #409eff;
          margin-bottom: 5px;
        }

        .content {
          color: #606266;
          line-height: 1.6;
        }
      }
    }
  }
}
</style>
