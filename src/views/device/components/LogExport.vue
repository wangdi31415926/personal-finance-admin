<template>
  <div class="log-export">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <el-tabs v-model="activeTab" @tab-change="handleTabChange">
                <el-tab-pane label="我的任务" name="my" />
                <el-tab-pane label="所有任务" name="all" />
                <el-tab-pane label="定时任务" name="scheduled" />
                <el-tab-pane label="已完成" name="completed" />
                <el-tab-pane label="已失败" name="failed" />
              </el-tabs>
              <el-button type="primary" @click="handleCreateTask"
                >创建任务</el-button
              >
            </div>
          </template>

          <el-table :data="exportTasks" style="width: 100%">
            <el-table-column prop="id" label="任务ID" width="100" />
            <el-table-column prop="name" label="任务名称" />
            <el-table-column prop="format" label="导出格式" width="100" />
            <el-table-column prop="count" label="日志数量" width="100" />
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button type="text" size="small">查看进度</el-button>
                <el-button
                  v-if="row.status === '已完成'"
                  type="text"
                  size="small"
                  >下载文件</el-button
                >
                <el-button type="text" size="small">取消任务</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span>导出日志查询</span>
          </template>
          <el-form label-width="80px">
            <el-form-item label="导出人">
              <el-select v-model="queryForm.operator" style="width: 100%">
                <el-option label="当前用户" value="current" />
              </el-select>
            </el-form-item>
            <el-form-item label="导出时间">
              <el-date-picker
                v-model="queryForm.timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="任务ID">
              <el-input v-model="queryForm.taskId" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery">查询</el-button>
            </el-form-item>
          </el-form>

          <el-table
            :data="queryResults"
            style="width: 100%; margin-top: 20px"
            max-height="300"
          >
            <el-table-column prop="operator" label="导出人" width="100" />
            <el-table-column prop="time" label="导出时间" width="150" />
            <el-table-column prop="format" label="格式" width="80" />
            <el-table-column prop="count" label="数量" width="80" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="text" size="small">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 创建任务弹窗 -->
    <el-dialog v-model="createDialogVisible" title="创建导出任务" width="600px">
      <el-form :model="taskForm" label-width="120px">
        <el-form-item label="任务名称">
          <el-input v-model="taskForm.name" />
        </el-form-item>
        <el-form-item label="导出范围">
          <el-radio-group v-model="taskForm.range">
            <el-radio label="current">当前检索结果</el-radio>
            <el-radio label="custom">自定义检索条件</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="导出格式">
          <el-radio-group v-model="taskForm.format">
            <el-radio label="excel">Excel</el-radio>
            <el-radio label="csv">CSV</el-radio>
            <el-radio label="pdf">PDF</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmitTask"
            >提交任务</el-button
          >
          <el-button @click="createDialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";

const activeTab = ref("my");
const createDialogVisible = ref(false);

const exportTasks = ref([
  {
    id: "E001",
    name: "日志导出-20251125",
    format: "Excel",
    count: 5000,
    createTime: "2025-11-25 10:00:00",
    status: "处理中"
  },
  {
    id: "E002",
    name: "日志导出-20251124",
    format: "CSV",
    count: 3000,
    createTime: "2025-11-24 15:00:00",
    status: "已完成"
  },
  {
    id: "E003",
    name: "日志导出-20251123",
    format: "PDF",
    count: 2000,
    createTime: "2025-11-23 09:00:00",
    status: "已失败"
  }
]);

const queryForm = reactive({
  operator: "current",
  timeRange: null,
  taskId: ""
});

const queryResults = ref([
  { operator: "张三", time: "2025-11-25 10:00", format: "Excel", count: 5000 },
  { operator: "李四", time: "2025-11-24 15:00", format: "CSV", count: 3000 }
]);

const taskForm = reactive({
  name: "",
  range: "current",
  format: "excel"
});

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    处理中: "primary",
    已完成: "success",
    已失败: "danger",
    已暂停: "info"
  };
  return map[status] || "info";
};

const handleTabChange = (tab: string) => {
  console.log("切换标签:", tab);
};

const handleCreateTask = () => {
  createDialogVisible.value = true;
};

const handleSubmitTask = () => {
  ElMessage.success("任务已创建");
  createDialogVisible.value = false;
};

const handleQuery = () => {
  ElMessage.success("查询完成");
};
</script>

<style scoped lang="scss">
.log-export {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
