<template>
  <div class="email-management">
    <!-- 顶部统计区 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">总发送数</div>
            <div class="stat-value">{{ statistics.total }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">发送成功率</div>
            <div class="stat-value success">{{ statistics.successRate }}%</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">失败数</div>
            <div class="stat-value danger">{{ statistics.failed }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">今日发送量</div>
            <div class="stat-value">{{ statistics.today }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="filterForm" inline class="filter-form">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 380px"
          />
          <el-button-group style="margin-left: 10px">
            <el-button size="small" @click="setQuickDate('today')"
              >今天</el-button
            >
            <el-button size="small" @click="setQuickDate('week')"
              >最近7天</el-button
            >
            <el-button size="small" @click="setQuickDate('month')"
              >最近30天</el-button
            >
          </el-button-group>
        </el-form-item>
        <el-form-item label="收件人邮箱">
          <el-input
            v-model="filterForm.recipient"
            placeholder="支持模糊搜索"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="邮件主题">
          <el-input
            v-model="filterForm.subject"
            placeholder="关键词"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="发送状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部"
            clearable
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option label="成功" value="成功" />
            <el-option label="失败" value="失败" />
            <el-option label="投递中" value="投递中" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联事件ID">
          <el-input
            v-model="filterForm.eventId"
            placeholder="事件ID"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格工具栏 -->
    <div class="table-toolbar">
      <el-button-group>
        <el-button
          @click="handleExportSelected"
          :disabled="selectedRows.length === 0"
        >
          <el-icon><Download /></el-icon>
          导出选中
        </el-button>
        <el-button @click="handleExportPage">
          <el-icon><Download /></el-icon>
          导出本页
        </el-button>
      </el-button-group>
    </div>

    <!-- 邮件记录表格 -->
    <el-table
      :data="filteredEmailList"
      style="width: 100%"
      v-loading="loading"
      stripe
      border
      @selection-change="handleSelectionChange"
      :default-sort="{ prop: 'sendTime', order: 'descending' }"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="sendTime" label="发送时间" width="180" sortable />
      <el-table-column prop="recipient" label="收件人" width="200" />
      <el-table-column
        prop="subject"
        label="主题"
        min-width="250"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <el-tooltip :content="row.subject" placement="top">
            <span>{{ row.subject }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="eventId" label="关联事件" width="180">
        <template #default="{ row }">
          <el-link
            type="primary"
            :underline="false"
            @click="handleViewEvent(row.eventId)"
          >
            {{ row.eventId }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tooltip
            v-if="row.status === '失败' && row.errorMessage"
            :content="row.errorMessage"
            placement="top"
          >
            <el-tag :type="getStatusType(row.status)" :effect="'dark'">
              <el-icon v-if="row.status === '投递中'" class="is-loading">
                <Loading />
              </el-icon>
              {{ row.status }}
            </el-tag>
          </el-tooltip>
          <el-tag v-else :type="getStatusType(row.status)" :effect="'dark'">
            <el-icon v-if="row.status === '投递中'" class="is-loading">
              <Loading />
            </el-icon>
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
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
          <el-button
            v-if="row.status === '失败'"
            link
            type="warning"
            size="small"
            @click="handleResend(row)"
            title="重新发送"
          >
            <el-icon><RefreshRight /></el-icon>
            重新发送
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 邮件详情弹窗 -->
    <EmailDetail v-model="detailVisible" :email-data="currentEmailData" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Refresh,
  Download,
  View,
  RefreshRight,
  Loading
} from "@element-plus/icons-vue";
import EmailDetail from "./EmailDetail.vue";
import dayjs from "dayjs";

interface EmailRecord {
  id: string;
  sendTime: string;
  recipient: string;
  subject: string;
  eventId: string;
  status: "成功" | "失败" | "投递中";
  errorMessage?: string;
  sender?: string;
  content?: string;
}

interface FilterForm {
  dateRange: string[];
  recipient: string;
  subject: string;
  status: string;
  eventId: string;
}

const loading = ref(false);
const detailVisible = ref(false);
const currentEmailData = ref<EmailRecord | null>(null);
const selectedRows = ref<EmailRecord[]>([]);

const filterForm = reactive<FilterForm>({
  dateRange: [],
  recipient: "",
  subject: "",
  status: "",
  eventId: ""
});

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
});

// 测试数据
const emailList = ref<EmailRecord[]>([
  {
    id: "1",
    sendTime: "2024-01-15 14:30:25",
    recipient: "zhangsan@example.com",
    subject: "【紧急告警】服务器CPU使用率超过90%",
    eventId: "ALERT-2024-001",
    status: "成功",
    sender: "system@example.com",
    content:
      "<p>尊敬的用户，</p><p>您的服务器 <strong>server-001</strong> 在 2024-01-15 14:30:00 检测到CPU使用率达到 95%，超过阈值 90%。</p><p>请及时处理。</p>"
  },
  {
    id: "2",
    sendTime: "2024-01-15 14:30:26",
    recipient: "lisi@example.com",
    subject: "【紧急告警】服务器CPU使用率超过90%",
    eventId: "ALERT-2024-001",
    status: "成功",
    sender: "system@example.com",
    content:
      "<p>尊敬的用户，</p><p>您的服务器 <strong>server-001</strong> 在 2024-01-15 14:30:00 检测到CPU使用率达到 95%，超过阈值 90%。</p><p>请及时处理。</p>"
  },
  {
    id: "3",
    sendTime: "2024-01-15 14:30:27",
    recipient: "wangwu@example.com",
    subject: "【紧急告警】服务器CPU使用率超过90%",
    eventId: "ALERT-2024-001",
    status: "投递中",
    sender: "system@example.com",
    content:
      "<p>尊敬的用户，</p><p>您的服务器 <strong>server-001</strong> 在 2024-01-15 14:30:00 检测到CPU使用率达到 95%，超过阈值 90%。</p><p>请及时处理。</p>"
  },
  {
    id: "4",
    sendTime: "2024-01-15 14:25:10",
    recipient: "zhaoliu@example.com",
    subject: "【警告】磁盘空间使用率超过80%",
    eventId: "ALERT-2024-002",
    status: "失败",
    errorMessage: "对方邮箱不存在",
    sender: "system@example.com",
    content:
      "<p>尊敬的用户，</p><p>您的服务器 <strong>server-002</strong> 磁盘空间使用率达到 85%。</p>"
  },
  {
    id: "5",
    sendTime: "2024-01-15 14:20:15",
    recipient: "sunqi@example.com",
    subject: "【信息】系统巡检报告",
    eventId: "INSPECT-2024-001",
    status: "成功",
    sender: "system@example.com",
    content: "<p>系统巡检已完成，所有指标正常。</p>"
  },
  {
    id: "6",
    sendTime: "2024-01-15 13:15:30",
    recipient: "zhouba@example.com",
    subject: "【警告】内存使用率超过85%",
    eventId: "ALERT-2024-003",
    status: "失败",
    errorMessage: "SMTP服务器拒绝",
    sender: "system@example.com",
    content: "<p>服务器内存使用率已达到 87%。</p>"
  },
  {
    id: "7",
    sendTime: "2024-01-15 12:00:00",
    recipient: "wujiu@example.com",
    subject: "【紧急告警】数据库连接数异常",
    eventId: "ALERT-2024-004",
    status: "成功",
    sender: "system@example.com",
    content: "<p>数据库连接数已达到上限。</p>"
  },
  {
    id: "8",
    sendTime: "2024-01-15 11:30:45",
    recipient: "zhengshi@example.com",
    subject: "【信息】定时任务执行完成",
    eventId: "TASK-2024-001",
    status: "成功",
    sender: "system@example.com",
    content: "<p>定时备份任务已成功执行。</p>"
  },
  {
    id: "9",
    sendTime: "2024-01-15 10:20:10",
    recipient: "wangshiyi@example.com",
    subject: "【警告】网络延迟异常",
    eventId: "ALERT-2024-005",
    status: "投递中",
    sender: "system@example.com",
    content: "<p>网络延迟超过阈值。</p>"
  },
  {
    id: "10",
    sendTime: "2024-01-15 09:15:20",
    recipient: "lisher@example.com",
    subject: "【紧急告警】服务异常重启",
    eventId: "ALERT-2024-006",
    status: "成功",
    sender: "system@example.com",
    content: "<p>服务已自动重启。</p>"
  },
  {
    id: "11",
    sendTime: "2024-01-15 08:45:30",
    recipient: "chenshisan@example.com",
    subject: "【警告】应用响应时间过长",
    eventId: "ALERT-2024-007",
    status: "成功",
    sender: "system@example.com",
    content: "<p>应用响应时间已达到 3.5 秒，超过阈值 2 秒。</p>"
  },
  {
    id: "12",
    sendTime: "2024-01-15 08:20:15",
    recipient: "lushisi@example.com",
    subject: "【信息】系统备份完成通知",
    eventId: "BACKUP-2024-001",
    status: "成功",
    sender: "system@example.com",
    content: "<p>系统备份任务已完成，备份文件大小：2.5GB。</p>"
  },
  {
    id: "13",
    sendTime: "2024-01-15 07:55:40",
    recipient: "zhoushiwu@example.com",
    subject: "【紧急告警】数据库主从同步延迟",
    eventId: "ALERT-2024-008",
    status: "失败",
    errorMessage: "网络连接超时",
    sender: "system@example.com",
    content: "<p>数据库主从同步延迟已达到 10 秒。</p>"
  },
  {
    id: "14",
    sendTime: "2024-01-15 07:30:25",
    recipient: "wushiliu@example.com",
    subject: "【警告】日志文件占用空间过大",
    eventId: "ALERT-2024-009",
    status: "成功",
    sender: "system@example.com",
    content: "<p>日志文件占用空间已达到 50GB，建议清理。</p>"
  },
  {
    id: "15",
    sendTime: "2024-01-15 07:10:10",
    recipient: "zhengshiqi@example.com",
    subject: "【信息】系统健康检查报告",
    eventId: "HEALTH-2024-001",
    status: "成功",
    sender: "system@example.com",
    content: "<p>系统健康检查完成，所有服务运行正常。</p>"
  },
  {
    id: "16",
    sendTime: "2024-01-15 06:45:50",
    recipient: "wangshiba@example.com",
    subject: "【紧急告警】Redis连接池耗尽",
    eventId: "ALERT-2024-010",
    status: "投递中",
    sender: "system@example.com",
    content: "<p>Redis连接池使用率已达到 100%。</p>"
  },
  {
    id: "17",
    sendTime: "2024-01-15 06:20:35",
    recipient: "fengshijiu@example.com",
    subject: "【警告】Nginx错误率上升",
    eventId: "ALERT-2024-011",
    status: "成功",
    sender: "system@example.com",
    content: "<p>Nginx错误率已达到 5%，超过阈值 3%。</p>"
  },
  {
    id: "18",
    sendTime: "2024-01-15 05:55:20",
    recipient: "chenershi@example.com",
    subject: "【信息】定时清理任务执行完成",
    eventId: "TASK-2024-002",
    status: "成功",
    sender: "system@example.com",
    content: "<p>定时清理任务已成功执行，清理了 500MB 临时文件。</p>"
  },
  {
    id: "19",
    sendTime: "2024-01-15 05:30:05",
    recipient: "luer@example.com",
    subject: "【紧急告警】Kafka消息积压",
    eventId: "ALERT-2024-012",
    status: "失败",
    errorMessage: "收件人邮箱已满",
    sender: "system@example.com",
    content: "<p>Kafka消息积压数量已达到 10000 条。</p>"
  },
  {
    id: "20",
    sendTime: "2024-01-15 05:10:40",
    recipient: "zhanger@example.com",
    subject: "【警告】Elasticsearch索引异常",
    eventId: "ALERT-2024-013",
    status: "成功",
    sender: "system@example.com",
    content: "<p>Elasticsearch索引状态异常，请检查。</p>"
  },
  {
    id: "21",
    sendTime: "2024-01-14 23:45:30",
    recipient: "wanger@example.com",
    subject: "【信息】每日统计报告",
    eventId: "REPORT-2024-001",
    status: "成功",
    sender: "system@example.com",
    content:
      "<p>今日系统运行统计：总请求数 100万，平均响应时间 200ms，错误率 0.1%。</p>"
  },
  {
    id: "22",
    sendTime: "2024-01-14 23:20:15",
    recipient: "lisan@example.com",
    subject: "【紧急告警】MongoDB副本集状态异常",
    eventId: "ALERT-2024-014",
    status: "成功",
    sender: "system@example.com",
    content: "<p>MongoDB副本集中有节点状态异常。</p>"
  },
  {
    id: "23",
    sendTime: "2024-01-14 22:55:50",
    recipient: "zhangsan@example.com",
    subject: "【警告】RabbitMQ队列堆积",
    eventId: "ALERT-2024-015",
    status: "投递中",
    sender: "system@example.com",
    content: "<p>RabbitMQ队列消息堆积数量已达到 5000 条。</p>"
  },
  {
    id: "24",
    sendTime: "2024-01-14 22:30:25",
    recipient: "lisi@example.com",
    subject: "【信息】系统升级完成通知",
    eventId: "UPGRADE-2024-001",
    status: "成功",
    sender: "system@example.com",
    content: "<p>系统已成功升级到 v2.1.0 版本。</p>"
  },
  {
    id: "25",
    sendTime: "2024-01-14 22:05:10",
    recipient: "wangwu@example.com",
    subject: "【紧急告警】Zookeeper连接失败",
    eventId: "ALERT-2024-016",
    status: "失败",
    errorMessage: "SMTP服务器连接失败",
    sender: "system@example.com",
    content: "<p>Zookeeper连接失败，请检查网络和配置。</p>"
  },
  {
    id: "26",
    sendTime: "2024-01-14 21:40:45",
    recipient: "zhaoliu@example.com",
    subject: "【警告】API接口响应时间异常",
    eventId: "ALERT-2024-017",
    status: "成功",
    sender: "system@example.com",
    content: "<p>API接口 /api/users 响应时间已达到 5 秒。</p>"
  },
  {
    id: "27",
    sendTime: "2024-01-14 21:15:30",
    recipient: "sunqi@example.com",
    subject: "【信息】安全扫描完成",
    eventId: "SCAN-2024-001",
    status: "成功",
    sender: "system@example.com",
    content: "<p>系统安全扫描已完成，未发现高危漏洞。</p>"
  },
  {
    id: "28",
    sendTime: "2024-01-14 20:50:15",
    recipient: "zhouba@example.com",
    subject: "【紧急告警】负载均衡器故障",
    eventId: "ALERT-2024-018",
    status: "成功",
    sender: "system@example.com",
    content: "<p>负载均衡器节点出现故障，已自动切换备用节点。</p>"
  },
  {
    id: "29",
    sendTime: "2024-01-14 20:25:00",
    recipient: "wujiu@example.com",
    subject: "【警告】缓存命中率下降",
    eventId: "ALERT-2024-019",
    status: "投递中",
    sender: "system@example.com",
    content: "<p>缓存命中率已降至 60%，低于阈值 80%。</p>"
  },
  {
    id: "30",
    sendTime: "2024-01-14 20:00:40",
    recipient: "zhengshi@example.com",
    subject: "【信息】数据同步任务完成",
    eventId: "SYNC-2024-001",
    status: "成功",
    sender: "system@example.com",
    content: "<p>数据同步任务已完成，同步了 10000 条记录。</p>"
  },
  {
    id: "31",
    sendTime: "2024-01-14 19:35:25",
    recipient: "wangshiyi@example.com",
    subject: "【紧急告警】消息队列服务异常",
    eventId: "ALERT-2024-020",
    status: "失败",
    errorMessage: "收件人邮箱地址格式错误",
    sender: "system@example.com",
    content: "<p>消息队列服务出现异常，部分消息处理失败。</p>"
  },
  {
    id: "32",
    sendTime: "2024-01-14 19:10:10",
    recipient: "lisher@example.com",
    subject: "【警告】数据库慢查询告警",
    eventId: "ALERT-2024-021",
    status: "成功",
    sender: "system@example.com",
    content: "<p>检测到慢查询，执行时间超过 5 秒。</p>"
  },
  {
    id: "33",
    sendTime: "2024-01-14 18:45:50",
    recipient: "chenshisan@example.com",
    subject: "【信息】系统性能优化建议",
    eventId: "OPTIMIZE-2024-001",
    status: "成功",
    sender: "system@example.com",
    content: "<p>系统性能分析完成，建议优化数据库索引和缓存策略。</p>"
  },
  {
    id: "34",
    sendTime: "2024-01-14 18:20:35",
    recipient: "lushisi@example.com",
    subject: "【紧急告警】容器资源使用率过高",
    eventId: "ALERT-2024-022",
    status: "成功",
    sender: "system@example.com",
    content: "<p>容器资源使用率已达到 95%，建议扩容。</p>"
  },
  {
    id: "35",
    sendTime: "2024-01-14 17:55:20",
    recipient: "zhoushiwu@example.com",
    subject: "【警告】SSL证书即将过期",
    eventId: "ALERT-2024-023",
    status: "成功",
    sender: "system@example.com",
    content: "<p>SSL证书将在 30 天后过期，请及时更新。</p>"
  },
  {
    id: "36",
    sendTime: "2024-01-14 17:30:05",
    recipient: "wushiliu@example.com",
    subject: "【信息】系统维护窗口通知",
    eventId: "MAINTENANCE-2024-001",
    status: "成功",
    sender: "system@example.com",
    content:
      "<p>系统将在 2024-01-20 02:00-04:00 进行维护，期间服务可能中断。</p>"
  },
  {
    id: "37",
    sendTime: "2024-01-14 17:05:40",
    recipient: "zhengshiqi@example.com",
    subject: "【紧急告警】API网关限流触发",
    eventId: "ALERT-2024-024",
    status: "投递中",
    sender: "system@example.com",
    content: "<p>API网关限流规则已触发，部分请求被限流。</p>"
  },
  {
    id: "38",
    sendTime: "2024-01-14 16:40:25",
    recipient: "wangshiba@example.com",
    subject: "【警告】文件系统空间不足",
    eventId: "ALERT-2024-025",
    status: "成功",
    sender: "system@example.com",
    content: "<p>文件系统使用率已达到 90%，建议清理或扩容。</p>"
  },
  {
    id: "39",
    sendTime: "2024-01-14 16:15:10",
    recipient: "fengshijiu@example.com",
    subject: "【信息】用户登录异常检测",
    eventId: "SECURITY-2024-001",
    status: "成功",
    sender: "system@example.com",
    content: "<p>检测到异常登录行为，已自动锁定账户。</p>"
  },
  {
    id: "40",
    sendTime: "2024-01-14 15:50:50",
    recipient: "chenershi@example.com",
    subject: "【紧急告警】服务降级触发",
    eventId: "ALERT-2024-026",
    status: "失败",
    errorMessage: "邮件服务器连接超时",
    sender: "system@example.com",
    content: "<p>服务降级策略已触发，部分功能暂时不可用。</p>"
  }
]);

// 统计数据
const statistics = computed(() => {
  const total = emailList.value.length;
  const success = emailList.value.filter(e => e.status === "成功").length;
  const failed = emailList.value.filter(e => e.status === "失败").length;
  const today = emailList.value.filter(e => {
    return dayjs(e.sendTime).isSame(dayjs(), "day");
  }).length;
  const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

  return {
    total,
    successRate,
    failed,
    today
  };
});

// 过滤后的邮件列表
const filteredEmailList = computed(() => {
  let result = [...emailList.value];

  // 时间范围过滤
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    result = result.filter(email => {
      const sendTime = dayjs(email.sendTime);
      return (
        sendTime.isAfter(dayjs(filterForm.dateRange[0])) &&
        sendTime.isBefore(dayjs(filterForm.dateRange[1]))
      );
    });
  }

  // 收件人过滤
  if (filterForm.recipient) {
    result = result.filter(email =>
      email.recipient.toLowerCase().includes(filterForm.recipient.toLowerCase())
    );
  }

  // 主题过滤
  if (filterForm.subject) {
    result = result.filter(email => email.subject.includes(filterForm.subject));
  }

  // 状态过滤
  if (filterForm.status) {
    result = result.filter(email => email.status === filterForm.status);
  }

  // 事件ID过滤
  if (filterForm.eventId) {
    result = result.filter(email =>
      email.eventId.toLowerCase().includes(filterForm.eventId.toLowerCase())
    );
  }

  // 分页
  pagination.total = result.length;
  const start = (pagination.page - 1) * pagination.size;
  const end = start + pagination.size;
  return result.slice(start, end);
});

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    成功: "success",
    失败: "danger",
    投递中: "info"
  };
  return statusMap[status] || "info";
};

const setQuickDate = (type: string) => {
  const now = dayjs();
  let start: dayjs.Dayjs;
  let end = now;

  switch (type) {
    case "today":
      start = now.startOf("day");
      break;
    case "week":
      start = now.subtract(7, "day").startOf("day");
      break;
    case "month":
      start = now.subtract(30, "day").startOf("day");
      break;
    default:
      start = now.startOf("day");
  }

  filterForm.dateRange = [
    start.format("YYYY-MM-DD HH:mm:ss"),
    end.format("YYYY-MM-DD HH:mm:ss")
  ];
};

const handleSearch = () => {
  pagination.page = 1;
  ElMessage.success("查询完成");
};

const handleReset = () => {
  filterForm.dateRange = [];
  filterForm.recipient = "";
  filterForm.subject = "";
  filterForm.status = "";
  filterForm.eventId = "";
  pagination.page = 1;
};

const handleSelectionChange = (selection: EmailRecord[]) => {
  selectedRows.value = selection;
};

const handleExportSelected = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请先选择要导出的记录");
    return;
  }
  ElMessage.success(`已导出 ${selectedRows.value.length} 条记录`);
};

const handleExportPage = () => {
  ElMessage.success(`已导出当前页 ${filteredEmailList.value.length} 条记录`);
};

const handleViewEvent = (eventId: string) => {
  ElMessage.info(`查看事件详情: ${eventId}`);
};

const handleViewDetail = (row: EmailRecord) => {
  currentEmailData.value = row;
  detailVisible.value = true;
};

const handleResend = (row: EmailRecord) => {
  ElMessageBox.confirm(
    `确定要重新发送邮件到 "${row.recipient}" 吗？`,
    "重新发送确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(() => {
      // 模拟重新发送
      loading.value = true;
      setTimeout(() => {
        loading.value = false;
        row.status = "投递中";
        ElMessage.success("邮件已重新发送");
      }, 1000);
    })
    .catch(() => {
      // 用户取消
    });
};

const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.page = 1;
};

const handlePageChange = (page: number) => {
  pagination.page = page;
};

onMounted(() => {
  // 初始化今日时间范围
  setQuickDate("today");
  pagination.total = emailList.value.length;

  // 模拟实时更新投递中状态
  const interval = setInterval(() => {
    const sendingRecords = emailList.value.filter(r => r.status === "投递中");
    sendingRecords.forEach(record => {
      if (Math.random() > 0.7) {
        record.status = Math.random() > 0.2 ? "成功" : "失败";
        if (record.status === "失败") {
          record.errorMessage = "SMTP服务器响应超时";
        }
      }
    });
  }, 3000);

  // 清理定时器
  setTimeout(() => {
    clearInterval(interval);
  }, 60000);
});
</script>

<style scoped lang="scss">
.email-management {
  .statistics-row {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        text-align: center;

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 10px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;

          &.success {
            color: #67c23a;
          }

          &.danger {
            color: #f56c6c;
          }
        }
      }
    }
  }

  .filter-card {
    margin-bottom: 20px;

    .filter-form {
      :deep(.el-form-item) {
        margin-bottom: 10px;
      }
    }
  }

  .table-toolbar {
    margin-bottom: 10px;
    display: flex;
    justify-content: flex-end;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  :deep(.el-tag) {
    .el-icon {
      margin-right: 4px;
    }
  }
}
</style>
