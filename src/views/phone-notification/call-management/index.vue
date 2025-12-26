<template>
  <div class="call-management">
    <!-- 顶部统计区 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">今日任务数</div>
            <div class="stat-value">{{ statistics.today }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">成功率</div>
            <div class="stat-value success">{{ statistics.successRate }}%</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">进行中</div>
            <div class="stat-value info">{{ statistics.inProgress }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">待呼叫</div>
            <div class="stat-value warning">{{ statistics.pending }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="filterForm" inline class="filter-form">
        <el-form-item label="任务状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部"
            clearable
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option label="待呼叫" value="pending" />
            <el-option label="呼叫中" value="calling" />
            <el-option label="已完成" value="completed" />
            <el-option label="已失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
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
        <el-form-item label="告警标题">
          <el-input
            v-model="filterForm.alertTitle"
            placeholder="关键词搜索"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="任务名称">
          <el-input
            v-model="filterForm.taskName"
            placeholder="任务名称"
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
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        创建任务
      </el-button>
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

    <!-- 任务列表表格 -->
    <el-table
      :data="filteredTaskList"
      style="width: 100%"
      v-loading="loading"
      stripe
      border
      @selection-change="handleSelectionChange"
      :row-class-name="getRowClassName"
      :default-sort="{ prop: 'createTime', order: 'descending' }"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        prop="taskName"
        label="任务名称"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column prop="alertTitle" label="关联告警" width="200">
        <template #default="{ row }">
          <el-link
            type="primary"
            :underline="false"
            @click="handleViewAlert(row.alertId)"
          >
            {{ row.alertTitle }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="targetContact" label="目标联系人/号码" width="180">
        <template #default="{ row }">
          <div>{{ row.targetContact }}</div>
          <div style="color: #909399; font-size: 12px">
            {{ row.targetPhone }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="scriptName" label="使用话术" width="150" />
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="180"
        sortable
      />
      <el-table-column prop="status" label="最新状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" :effect="'dark'">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
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
            v-if="row.status === 'pending' || row.status === 'calling'"
            link
            type="primary"
            size="small"
            @click="handleEdit(row)"
            title="编辑"
          >
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button
            v-if="row.status === 'failed' || row.status === 'no_answer'"
            link
            type="warning"
            size="small"
            @click="handleRetry(row)"
            title="重呼"
          >
            <el-icon><Phone /></el-icon>
            重呼
          </el-button>
          <el-button
            v-if="row.status === 'pending' || row.status === 'calling'"
            link
            type="danger"
            size="small"
            @click="handleCancel(row)"
            title="取消任务"
          >
            <el-icon><Close /></el-icon>
            取消
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

    <!-- AI任务创建弹窗 -->
    <CreateTaskDialog
      v-model="createDialogVisible"
      @success="handleCreateSuccess"
    />

    <!-- AI任务编辑弹窗 -->
    <EditTaskDialog
      v-model="editDialogVisible"
      :task-id="currentEditTaskId"
      @success="handleEditSuccess"
    />

    <!-- 重呼确认弹窗 -->
    <el-dialog v-model="retryVisible" title="确认重呼" width="500px">
      <div class="retry-dialog-content">
        <p>您即将对以下联系人发起重新呼叫：</p>
        <el-table :data="retryContacts" border style="margin-top: 15px">
          <el-table-column prop="name" label="联系人" />
          <el-table-column prop="phone" label="号码" />
        </el-table>
        <el-checkbox v-model="useOriginalScript" style="margin-top: 15px">
          使用原话术模板
        </el-checkbox>
      </div>
      <template #footer>
        <el-button @click="retryVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRetry">确认重呼</el-button>
      </template>
    </el-dialog>

    <!-- 导出任务数据弹窗 -->
    <el-dialog v-model="exportVisible" title="导出任务数据" width="600px">
      <div class="export-dialog-content">
        <!-- 导出范围 -->
        <div class="export-section">
          <div class="section-title">导出范围</div>
          <el-radio-group v-model="exportForm.range">
            <el-radio label="current">
              导出当前搜索结果（共{{ filteredTaskListTotal }}条）
            </el-radio>
            <el-radio label="selected" :disabled="selectedRows.length === 0">
              导出选中项（已选{{ selectedRows.length }}条）
            </el-radio>
          </el-radio-group>
        </div>

        <!-- 导出字段 -->
        <div class="export-section">
          <div class="section-title">导出字段</div>
          <div class="field-list">
            <el-checkbox
              v-model="exportForm.selectAll"
              :indeterminate="exportForm.indeterminate"
              @change="handleSelectAllFields"
              style="margin-bottom: 10px"
            >
              全选
            </el-checkbox>
            <el-checkbox-group
              v-model="exportForm.selectedFields"
              @change="handleFieldChange"
            >
              <div class="field-grid">
                <div
                  v-for="field in exportFields"
                  :key="field.key"
                  class="field-item"
                >
                  <el-checkbox :label="field.key">
                    <div class="field-info">
                      <div class="field-name">{{ field.name }}</div>
                      <div class="field-desc">{{ field.description }}</div>
                    </div>
                  </el-checkbox>
                </div>
              </div>
            </el-checkbox-group>
          </div>
        </div>

        <!-- 导出格式 -->
        <div class="export-section">
          <div class="section-title">导出格式</div>
          <el-select
            v-model="exportForm.format"
            placeholder="请选择导出格式"
            style="width: 100%"
          >
            <el-option label="CSV (.csv)" value="csv" />
            <el-option label="Excel (.xlsx)" value="xlsx" />
          </el-select>
        </div>

        <!-- 导出中提示 -->
        <div v-if="exporting" class="export-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span style="margin-left: 10px">正在生成文件，请稍候...</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleCancelExport" :disabled="exporting"
          >取消</el-button
        >
        <el-button
          type="primary"
          @click="handleConfirmExport"
          :loading="exporting"
        >
          确认导出
        </el-button>
      </template>
    </el-dialog>

    <!-- 任务详情弹窗 -->
    <TaskDetailDialog
      v-model="detailDialogVisible"
      :task-id="currentDetailTaskId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Refresh,
  Download,
  View,
  Edit,
  Phone,
  Close,
  Plus,
  Loading
} from "@element-plus/icons-vue";
import dayjs from "dayjs";
import CreateTaskDialog from "./components/CreateTaskDialog.vue";
import EditTaskDialog from "./components/EditTaskDialog.vue";
import TaskDetailDialog from "./components/TaskDetailDialog.vue";

interface TaskRecord {
  id: string;
  taskName: string;
  alertId: string;
  alertTitle: string;
  targetContact: string;
  targetPhone: string;
  scriptName: string;
  createTime: string;
  status: "pending" | "calling" | "completed" | "failed" | "no_answer" | "busy";
}

interface FilterForm {
  status: string;
  dateRange: string[];
  alertTitle: string;
  taskName: string;
}

const router = useRouter();
const loading = ref(false);
const retryVisible = ref(false);
const useOriginalScript = ref(true);
const retryContacts = ref<Array<{ name: string; phone: string }>>([]);
const currentRetryTask = ref<TaskRecord | null>(null);
const selectedRows = ref<TaskRecord[]>([]);

// 弹窗状态
const createDialogVisible = ref(false);
const editDialogVisible = ref(false);
const currentEditTaskId = ref<string>("");
const detailDialogVisible = ref(false);
const currentDetailTaskId = ref<string>("");

// 导出相关状态
const exportVisible = ref(false);
const exporting = ref(false);
const exportForm = reactive({
  range: "current" as "current" | "selected",
  selectedFields: [] as string[],
  selectAll: false,
  indeterminate: false,
  format: "xlsx" as "csv" | "xlsx"
});

// 导出字段配置
const exportFields = [
  { key: "taskId", name: "任务ID", description: "任务的唯一标识符" },
  { key: "taskName", name: "任务名称", description: "任务的名称" },
  { key: "alertId", name: "关联告警ID", description: "关联的告警事件ID" },
  {
    key: "alertTitle",
    name: "关联告警标题",
    description: "关联的告警事件标题"
  },
  {
    key: "targetContact",
    name: "目标联系人",
    description: "被呼叫的联系人姓名"
  },
  { key: "targetPhone", name: "目标号码", description: "被呼叫的手机号码" },
  { key: "scriptName", name: "使用话术", description: "使用的话术模板名称" },
  { key: "createTime", name: "创建时间", description: "任务创建的时间" },
  { key: "status", name: "任务状态", description: "任务的当前状态" },
  { key: "callTime", name: "呼叫时间", description: "实际呼叫的时间" },
  {
    key: "callDuration",
    name: "通话时长",
    description: "通话持续的时间（秒）"
  },
  {
    key: "callResult",
    name: "呼叫结果",
    description: "呼叫的结果（成功/失败等）"
  }
];

// 计算当前搜索结果总数（不包含分页）
const filteredTaskListTotal = computed(() => {
  let result = [...taskList.value];

  if (filterForm.status) {
    result = result.filter(task => task.status === filterForm.status);
  }

  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    result = result.filter(task => {
      const createTime = dayjs(task.createTime);
      return (
        createTime.isAfter(dayjs(filterForm.dateRange[0])) &&
        createTime.isBefore(dayjs(filterForm.dateRange[1]))
      );
    });
  }

  if (filterForm.alertTitle) {
    result = result.filter(task =>
      task.alertTitle.includes(filterForm.alertTitle)
    );
  }

  if (filterForm.taskName) {
    result = result.filter(task => task.taskName.includes(filterForm.taskName));
  }

  return result.length;
});

// 获取所有过滤后的任务（用于导出）
const getAllFilteredTasks = computed(() => {
  let result = [...taskList.value];

  if (filterForm.status) {
    result = result.filter(task => task.status === filterForm.status);
  }

  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    result = result.filter(task => {
      const createTime = dayjs(task.createTime);
      return (
        createTime.isAfter(dayjs(filterForm.dateRange[0])) &&
        createTime.isBefore(dayjs(filterForm.dateRange[1]))
      );
    });
  }

  if (filterForm.alertTitle) {
    result = result.filter(task =>
      task.alertTitle.includes(filterForm.alertTitle)
    );
  }

  if (filterForm.taskName) {
    result = result.filter(task => task.taskName.includes(filterForm.taskName));
  }

  return result;
});

const filterForm = reactive<FilterForm>({
  status: "",
  dateRange: [],
  alertTitle: "",
  taskName: ""
});

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
});

// 测试数据
const taskList = ref<TaskRecord[]>([
  {
    id: "1",
    taskName: "告警-【核心路由器宕机】-2024-01-15 14:30",
    alertId: "ALERT-2024-001",
    alertTitle: "核心路由器宕机",
    targetContact: "张三",
    targetPhone: "13800138000",
    scriptName: "紧急故障通知话术",
    createTime: "2024-01-15 14:30:25",
    status: "completed"
  },
  {
    id: "2",
    taskName: "告警-【服务器CPU使用率超过90%】-2024-01-15 14:25",
    alertId: "ALERT-2024-002",
    alertTitle: "服务器CPU使用率超过90%",
    targetContact: "李四",
    targetPhone: "13900139000",
    scriptName: "性能告警通知话术",
    createTime: "2024-01-15 14:25:10",
    status: "calling"
  },
  {
    id: "3",
    taskName: "告警-【数据库连接池耗尽】-2024-01-15 14:20",
    alertId: "ALERT-2024-003",
    alertTitle: "数据库连接池耗尽",
    targetContact: "王五",
    targetPhone: "13700137000",
    scriptName: "系统告警通知话术",
    createTime: "2024-01-15 14:20:05",
    status: "failed"
  },
  {
    id: "4",
    taskName: "告警-【网络延迟异常】-2024-01-15 14:15",
    alertId: "ALERT-2024-004",
    alertTitle: "网络延迟异常",
    targetContact: "赵六",
    targetPhone: "13600136000",
    scriptName: "网络告警通知话术",
    createTime: "2024-01-15 14:15:00",
    status: "pending"
  },
  {
    id: "5",
    taskName: "告警-【存储空间不足】-2024-01-15 14:10",
    alertId: "ALERT-2024-005",
    alertTitle: "存储空间不足",
    targetContact: "孙七",
    targetPhone: "13500135000",
    scriptName: "存储告警通知话术",
    createTime: "2024-01-15 14:10:30",
    status: "no_answer"
  },
  {
    id: "6",
    taskName: "告警-【应用服务异常】-2024-01-15 13:50",
    alertId: "ALERT-2024-006",
    alertTitle: "应用服务异常",
    targetContact: "周八",
    targetPhone: "13400134000",
    scriptName: "应用告警通知话术",
    createTime: "2024-01-15 13:50:15",
    status: "completed"
  },
  {
    id: "7",
    taskName: "告警-【安全漏洞检测】-2024-01-15 13:30",
    alertId: "ALERT-2024-007",
    alertTitle: "安全漏洞检测",
    targetContact: "吴九",
    targetPhone: "13300133000",
    scriptName: "安全告警通知话术",
    createTime: "2024-01-15 13:30:20",
    status: "calling"
  },
  {
    id: "8",
    taskName: "告警-【备份任务失败】-2024-01-15 13:10",
    alertId: "ALERT-2024-008",
    alertTitle: "备份任务失败",
    targetContact: "郑十",
    targetPhone: "13200132000",
    scriptName: "备份告警通知话术",
    createTime: "2024-01-15 13:10:45",
    status: "pending"
  }
]);

// 统计数据
const statistics = computed(() => {
  const today = taskList.value.filter(task => {
    return dayjs(task.createTime).isSame(dayjs(), "day");
  }).length;

  const completed = taskList.value.filter(
    task => task.status === "completed"
  ).length;
  const total = taskList.value.length;
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const inProgress = taskList.value.filter(
    task => task.status === "calling" || task.status === "pending"
  ).length;

  const pending = taskList.value.filter(
    task => task.status === "pending"
  ).length;

  return {
    today,
    successRate,
    inProgress,
    pending
  };
});

// 过滤后的任务列表
const filteredTaskList = computed(() => {
  let result = [...taskList.value];

  // 状态过滤
  if (filterForm.status) {
    result = result.filter(task => task.status === filterForm.status);
  }

  // 时间范围过滤
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    result = result.filter(task => {
      const createTime = dayjs(task.createTime);
      return (
        createTime.isAfter(dayjs(filterForm.dateRange[0])) &&
        createTime.isBefore(dayjs(filterForm.dateRange[1]))
      );
    });
  }

  // 告警标题过滤
  if (filterForm.alertTitle) {
    result = result.filter(task =>
      task.alertTitle.includes(filterForm.alertTitle)
    );
  }

  // 任务名称过滤
  if (filterForm.taskName) {
    result = result.filter(task => task.taskName.includes(filterForm.taskName));
  }

  // 分页
  pagination.total = result.length;
  const start = (pagination.page - 1) * pagination.size;
  const end = start + pagination.size;
  return result.slice(start, end);
});

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "info",
    calling: "warning",
    completed: "success",
    failed: "danger",
    no_answer: "warning",
    busy: "warning"
  };
  return statusMap[status] || "info";
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "待呼叫",
    calling: "呼叫中",
    completed: "已完成",
    failed: "已失败",
    no_answer: "未接听",
    busy: "忙线"
  };
  return statusMap[status] || status;
};

const getRowClassName = ({ row }: { row: TaskRecord }) => {
  if (row.status === "calling" || row.status === "pending") {
    return "row-calling";
  }
  return "";
};

const setQuickDate = (type: string) => {
  const now = dayjs();
  let start: dayjs.Dayjs;

  switch (type) {
    case "today":
      start = now.startOf("day");
      break;
    case "week":
      start = now.subtract(7, "day");
      break;
    case "month":
      start = now.subtract(30, "day");
      break;
    default:
      start = now.startOf("day");
  }

  filterForm.dateRange = [
    start.format("YYYY-MM-DD HH:mm:ss"),
    now.format("YYYY-MM-DD HH:mm:ss")
  ];
};

const handleSearch = () => {
  pagination.page = 1;
  ElMessage.success("查询成功");
};

const handleReset = () => {
  filterForm.status = "";
  filterForm.dateRange = [];
  filterForm.alertTitle = "";
  filterForm.taskName = "";
  pagination.page = 1;
};

const handleCreate = () => {
  createDialogVisible.value = true;
};

const handleCreateSuccess = () => {
  ElMessage.success("任务创建成功");
  // 刷新列表
  handleSearch();
};

const handleEdit = (row: TaskRecord) => {
  currentEditTaskId.value = row.id;
  editDialogVisible.value = true;
};

const handleEditSuccess = () => {
  ElMessage.success("任务编辑成功");
  handleSearch();
};

const handleViewDetail = (row: TaskRecord) => {
  currentDetailTaskId.value = row.id;
  detailDialogVisible.value = true;
};

const handleViewAlert = (alertId: string) => {
  ElMessage.info(`查看告警: ${alertId}`);
};

const handleRetry = (row: TaskRecord) => {
  currentRetryTask.value = row;
  retryContacts.value = [
    {
      name: row.targetContact,
      phone: row.targetPhone
    }
  ];
  retryVisible.value = true;
};

const confirmRetry = () => {
  if (currentRetryTask.value) {
    ElMessage.success("重呼任务已创建");
    retryVisible.value = false;
  }
};

const handleCancel = (row: TaskRecord) => {
  ElMessageBox.confirm("确定要取消此任务吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      ElMessage.success("任务已取消");
    })
    .catch(() => {});
};

const handleSelectionChange = (selection: TaskRecord[]) => {
  selectedRows.value = selection;
};

// 导出相关方法
const handleExportSelected = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请先选择要导出的任务");
    return;
  }
  exportForm.range = "selected";
  exportForm.selectedFields = exportFields.map(f => f.key);
  exportForm.selectAll = true;
  exportForm.indeterminate = false;
  exportVisible.value = true;
};

const handleExportPage = () => {
  exportForm.range = "current";
  exportForm.selectedFields = exportFields.map(f => f.key);
  exportForm.selectAll = true;
  exportForm.indeterminate = false;
  exportVisible.value = true;
};

const handleSelectAllFields = (val: boolean) => {
  if (val) {
    exportForm.selectedFields = exportFields.map(f => f.key);
    exportForm.indeterminate = false;
  } else {
    exportForm.selectedFields = [];
    exportForm.indeterminate = false;
  }
};

const handleFieldChange = (val: string[]) => {
  const checkedCount = val.length;
  exportForm.selectAll = checkedCount === exportFields.length;
  exportForm.indeterminate =
    checkedCount > 0 && checkedCount < exportFields.length;
};

const handleCancelExport = () => {
  exportVisible.value = false;
  exporting.value = false;
  exportForm.selectedFields = [];
  exportForm.selectAll = false;
  exportForm.indeterminate = false;
};

const handleConfirmExport = async () => {
  if (exportForm.selectedFields.length === 0) {
    ElMessage.warning("请至少选择一个导出字段");
    return;
  }

  exporting.value = true;

  try {
    // 获取要导出的数据
    const exportData =
      exportForm.range === "selected"
        ? selectedRows.value
        : getAllFilteredTasks.value;

    // 构建导出数据
    const dataToExport = exportData.map(task => {
      const row: Record<string, any> = {};
      exportForm.selectedFields.forEach(fieldKey => {
        const field = exportFields.find(f => f.key === fieldKey);
        if (field) {
          switch (fieldKey) {
            case "taskId":
              row[field.name] = task.id;
              break;
            case "taskName":
              row[field.name] = task.taskName;
              break;
            case "alertId":
              row[field.name] = task.alertId;
              break;
            case "alertTitle":
              row[field.name] = task.alertTitle;
              break;
            case "targetContact":
              row[field.name] = task.targetContact;
              break;
            case "targetPhone":
              row[field.name] = task.targetPhone;
              break;
            case "scriptName":
              row[field.name] = task.scriptName;
              break;
            case "createTime":
              row[field.name] = task.createTime;
              break;
            case "status":
              row[field.name] = getStatusText(task.status);
              break;
            default:
              row[field.name] = "";
          }
        }
      });
      return row;
    });

    // 模拟导出过程
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 生成文件
    const headers = exportForm.selectedFields.map(key => {
      const field = exportFields.find(f => f.key === key);
      return field?.name || key;
    });
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(row =>
        headers.map(header => `"${row[header] || ""}"`).join(",")
      )
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type:
        exportForm.format === "csv"
          ? "text/csv;charset=utf-8;"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `任务数据_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.${exportForm.format}`;
    link.click();

    ElMessage.success(`成功导出 ${exportData.length} 条任务数据`);
    exportVisible.value = false;
    exporting.value = false;
  } catch (error) {
    ElMessage.error("导出失败，请重试");
    exporting.value = false;
  }
};

const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.page = 1;
};

const handlePageChange = (page: number) => {
  pagination.page = page;
};
</script>

<style scoped lang="scss">
.call-management {
  padding: 20px;
  height: 100%;

  .statistics-row {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
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

          &.info {
            color: #409eff;
          }

          &.warning {
            color: #e6a23c;
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
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  :deep(.el-table) {
    .row-calling {
      background-color: #ecf5ff;
    }
  }

  .retry-dialog-content {
    p {
      margin: 0 0 10px 0;
      color: #606266;
    }
  }

  .export-dialog-content {
    .export-section {
      margin-bottom: 25px;

      .section-title {
        font-weight: 500;
        margin-bottom: 15px;
        color: #303133;
        font-size: 14px;
      }
    }

    .field-list {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      padding: 15px;

      .field-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;

        .field-item {
          .field-info {
            margin-left: 8px;

            .field-name {
              font-weight: 500;
              color: #303133;
              margin-bottom: 4px;
            }

            .field-desc {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }
    }

    .export-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: #409eff;
      font-size: 14px;
    }
  }
}
</style>
