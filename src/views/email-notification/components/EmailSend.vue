<template>
  <div class="email-send">
    <div class="panel-header">
      <h3>邮件通知记录</h3>
      <p class="subtitle">预警事件：设备监控异常告警 #ALERT-2024-001</p>
    </div>

    <el-table
      :data="emailRecords"
      style="width: 100%"
      v-loading="loading"
      stripe
      border
      :default-sort="{ prop: 'sendTime', order: 'descending' }"
    >
      <el-table-column prop="sendTime" label="发送时间" width="180" sortable />
      <el-table-column prop="recipient" label="接收人" width="200">
        <template #default="{ row }">
          <div>
            <div>{{ row.recipientName }}</div>
            <div class="email-address">{{ row.recipient }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="subject"
        label="邮件主题"
        min-width="250"
        show-overflow-tooltip
      />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" :effect="'dark'">
            <el-icon v-if="row.status === '发送中'" class="is-loading">
              <Loading />
            </el-icon>
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            size="small"
            @click="handleViewDetail(row)"
            title="查看详情"
          >
            <el-icon><View /></el-icon>
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 邮件详情弹窗 -->
    <EmailDetail v-model="detailVisible" :email-data="currentEmailData" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Loading, View } from "@element-plus/icons-vue";
import EmailDetail from "./EmailDetail.vue";

interface EmailRecord {
  id: string;
  sendTime: string;
  recipient: string;
  recipientName: string;
  subject: string;
  status: "成功" | "失败" | "发送中";
  content?: string;
  errorMessage?: string;
}

const loading = ref(false);
const detailVisible = ref(false);
const currentEmailData = ref<EmailRecord | null>(null);

// 测试数据
const emailRecords = ref<EmailRecord[]>([
  {
    id: "1",
    sendTime: "2024-01-15 14:30:25",
    recipient: "zhangsan@example.com",
    recipientName: "张三",
    subject: "【紧急告警】服务器CPU使用率超过90%",
    status: "成功",
    content:
      "<p>尊敬的用户，</p><p>您的服务器 <strong>server-001</strong> 在 2024-01-15 14:30:00 检测到CPU使用率达到 95%，超过阈值 90%。</p><p>请及时处理。</p>"
  },
  {
    id: "2",
    sendTime: "2024-01-15 14:30:26",
    recipient: "lisi@example.com",
    recipientName: "李四",
    subject: "【紧急告警】服务器CPU使用率超过90%",
    status: "成功",
    content:
      "<p>尊敬的用户，</p><p>您的服务器 <strong>server-001</strong> 在 2024-01-15 14:30:00 检测到CPU使用率达到 95%，超过阈值 90%。</p><p>请及时处理。</p>"
  },
  {
    id: "3",
    sendTime: "2024-01-15 14:30:27",
    recipient: "wangwu@example.com",
    recipientName: "王五",
    subject: "【紧急告警】服务器CPU使用率超过90%",
    status: "发送中",
    content:
      "<p>尊敬的用户，</p><p>您的服务器 <strong>server-001</strong> 在 2024-01-15 14:30:00 检测到CPU使用率达到 95%，超过阈值 90%。</p><p>请及时处理。</p>"
  },
  {
    id: "4",
    sendTime: "2024-01-15 14:25:10",
    recipient: "zhaoliu@example.com",
    recipientName: "赵六",
    subject: "【警告】磁盘空间使用率超过80%",
    status: "失败",
    errorMessage: "对方邮箱不存在",
    content:
      "<p>尊敬的用户，</p><p>您的服务器 <strong>server-002</strong> 磁盘空间使用率达到 85%。</p>"
  },
  {
    id: "5",
    sendTime: "2024-01-15 14:20:15",
    recipient: "sunqi@example.com",
    recipientName: "孙七",
    subject: "【信息】系统巡检报告",
    status: "成功",
    content: "<p>系统巡检已完成，所有指标正常。</p>"
  }
]);

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    成功: "success",
    失败: "danger",
    发送中: "info"
  };
  return statusMap[status] || "info";
};

const handleViewDetail = (row: EmailRecord) => {
  currentEmailData.value = row;
  detailVisible.value = true;
};

onMounted(() => {
  // 模拟实时更新发送中状态
  const interval = setInterval(() => {
    const sendingRecord = emailRecords.value.find(r => r.status === "发送中");
    if (sendingRecord && Math.random() > 0.7) {
      sendingRecord.status = Math.random() > 0.2 ? "成功" : "失败";
      if (sendingRecord.status === "失败") {
        sendingRecord.errorMessage = "SMTP服务器响应超时";
      }
    }
  }, 3000);

  // 清理定时器
  setTimeout(() => {
    clearInterval(interval);
  }, 30000);
});
</script>

<style scoped lang="scss">
.email-send {
  .panel-header {
    margin-bottom: 20px;

    h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    .subtitle {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }

  .email-address {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  :deep(.el-tag) {
    .el-icon {
      margin-right: 4px;
    }
  }
}
</style>
