<template>
  <el-dialog
    v-model="dialogVisible"
    :title="emailData?.subject || '邮件详情'"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="email-detail">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基础信息 -->
        <el-tab-pane label="基础信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="邮件ID">
              {{ emailData?.id || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="发送时间">
              {{ emailData?.sendTime || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="发件人">
              {{ emailData?.sender || "system@example.com" }}
            </el-descriptions-item>
            <el-descriptions-item label="收件人">
              {{ emailData?.recipient || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag
                :type="getStatusType(emailData?.status || '')"
                :effect="'dark'"
              >
                {{ emailData?.status || "-" }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="关联事件">
              <el-link
                v-if="emailData?.eventId"
                type="primary"
                :underline="false"
                @click="handleViewEvent"
              >
                {{ emailData.eventId }}
              </el-link>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item
              v-if="emailData?.errorMessage"
              label="错误信息"
              :span="2"
            >
              <el-alert
                :title="emailData.errorMessage"
                type="error"
                :closable="false"
                show-icon
              />
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 内容预览 -->
        <el-tab-pane label="内容预览" name="content">
          <div class="content-preview">
            <div class="preview-header">
              <div class="preview-info">
                <div>
                  <strong>发件人：</strong
                  >{{ emailData?.sender || "system@example.com" }}
                </div>
                <div>
                  <strong>收件人：</strong>{{ emailData?.recipient || "-" }}
                </div>
                <div>
                  <strong>主题：</strong>{{ emailData?.subject || "-" }}
                </div>
                <div>
                  <strong>时间：</strong>{{ emailData?.sendTime || "-" }}
                </div>
              </div>
            </div>
            <div class="preview-body">
              <div
                class="email-content"
                v-html="emailData?.content || '<p>暂无内容</p>'"
              ></div>
            </div>
            <div class="preview-footer">
              <el-alert
                title="此为系统预览，实际渲染效果可能因邮件客户端而异"
                type="info"
                :closable="false"
                show-icon
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";

interface EmailData {
  id?: string;
  sendTime?: string;
  recipient?: string;
  subject?: string;
  eventId?: string;
  status?: string;
  errorMessage?: string;
  sender?: string;
  content?: string;
}

const props = defineProps<{
  modelValue: boolean;
  emailData?: EmailData | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const dialogVisible = ref(false);
const activeTab = ref("info");

watch(
  () => props.modelValue,
  val => {
    dialogVisible.value = val;
    if (val) {
      activeTab.value = "info";
    }
  }
);

watch(dialogVisible, val => {
  if (!val) {
    emit("update:modelValue", false);
  }
});

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    成功: "success",
    失败: "danger",
    发送中: "info",
    投递中: "info"
  };
  return statusMap[status] || "info";
};

const handleViewEvent = () => {
  if (props.emailData?.eventId) {
    ElMessage.info(`查看事件详情: ${props.emailData.eventId}`);
  }
};

const handleClose = () => {
  dialogVisible.value = false;
};
</script>

<style scoped lang="scss">
.email-detail {
  :deep(.el-tabs__content) {
    padding: 20px;
  }

  .content-preview {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background: #fff;

    .preview-header {
      padding: 15px;
      background: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;

      .preview-info {
        font-size: 13px;
        color: #606266;
        line-height: 1.8;

        div {
          margin-bottom: 5px;

          strong {
            color: #303133;
            margin-right: 5px;
          }
        }
      }
    }

    .preview-body {
      padding: 20px;
      min-height: 200px;

      .email-content {
        line-height: 1.6;
        color: #303133;

        :deep(p) {
          margin: 10px 0;
        }

        :deep(strong) {
          font-weight: 600;
        }
      }
    }

    .preview-footer {
      padding: 15px;
      background: #f5f7fa;
      border-top: 1px solid #e4e7ed;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
