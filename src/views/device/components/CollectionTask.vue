<template>
  <div class="collection-task">
    <el-row :gutter="20">
      <!-- 左栏：任务列表区 -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>任务列表</span>
              <el-button type="primary" size="small" @click="handleCreateTask">
                <el-icon><Plus /></el-icon>
                创建任务
              </el-button>
            </div>
          </template>

          <!-- 筛选栏 -->
          <div class="filter-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="任务名称搜索"
              clearable
              size="small"
              style="margin-bottom: 10px"
            />
            <el-row :gutter="10">
              <el-col :span="12">
                <el-select
                  v-model="statusFilter"
                  placeholder="状态"
                  size="small"
                  clearable
                >
                  <el-option label="全部" value="" />
                  <el-option label="等待" value="waiting" />
                  <el-option label="执行" value="running" />
                  <el-option label="失败" value="failed" />
                </el-select>
              </el-col>
              <el-col :span="12">
                <el-select
                  v-model="priorityFilter"
                  placeholder="优先级"
                  size="small"
                  clearable
                >
                  <el-option label="高" value="high" />
                  <el-option label="中" value="medium" />
                  <el-option label="低" value="low" />
                </el-select>
              </el-col>
            </el-row>
          </div>

          <!-- 任务表格 -->
          <el-table
            :data="filteredTasks"
            style="width: 100%"
            height="400px"
            @row-click="handleRowClick"
          >
            <el-table-column prop="id" label="任务ID" width="80" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button
                  type="text"
                  size="small"
                  @click.stop="handleEdit(row)"
                >
                  修改
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click.stop="handleCopy(row)"
                >
                  复制
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click.stop="handleDelete(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 中栏：配置表单区 -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span>配置表单</span>
          </template>
          <el-form :model="taskForm" label-width="100px">
            <el-form-item label="任务名称">
              <el-input v-model="taskForm.name" />
            </el-form-item>
            <el-form-item label="任务类型">
              <el-radio-group v-model="taskForm.type">
                <el-radio label="device">按设备组</el-radio>
                <el-radio label="log">按日志类型</el-radio>
                <el-radio label="period">按周期</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="优先级">
              <el-select v-model="taskForm.priority" style="width: 100%">
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSubmit">提交</el-button>
              <el-button @click="handlePreview">预览</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右栏：调度监控区 -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span>调度监控</span>
          </template>
          <div
            ref="loadChartRef"
            style="height: 200px; margin-bottom: 20px"
          ></div>
          <div ref="trendChartRef" style="height: 200px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import * as echarts from "echarts";

const searchKeyword = ref("");
const statusFilter = ref("");
const priorityFilter = ref("");
const loadChartRef = ref();
const trendChartRef = ref();

const taskForm = ref({
  name: "",
  type: "device",
  priority: "medium"
});

const tasks = ref([
  { id: "T001", name: "核心设备日志采集", status: "running", priority: "high" },
  { id: "T002", name: "边缘节点监控", status: "waiting", priority: "medium" },
  { id: "T003", name: "数据库日志采集", status: "failed", priority: "low" }
]);

const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    const matchKeyword =
      !searchKeyword.value || task.name.includes(searchKeyword.value);
    const matchStatus =
      !statusFilter.value || task.status === statusFilter.value;
    const matchPriority =
      !priorityFilter.value || task.priority === priorityFilter.value;
    return matchKeyword && matchStatus && matchPriority;
  });
});

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    running: "success",
    waiting: "warning",
    failed: "danger"
  };
  return map[status] || "info";
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    running: "执行中",
    waiting: "等待",
    failed: "失败"
  };
  return map[status] || "未知";
};

const handleCreateTask = () => {
  taskForm.value = { name: "", type: "device", priority: "medium" };
};

const handleRowClick = (row: any) => {
  taskForm.value = { ...row };
};

const handleEdit = (row: any) => {
  taskForm.value = { ...row };
};

const handleCopy = (row: any) => {
  ElMessage.success("任务已复制");
};

const handleDelete = (row: any) => {
  ElMessage.success("任务已删除");
};

const handleSubmit = () => {
  ElMessage.success("任务已提交");
};

const handlePreview = () => {
  ElMessage.info("预览功能");
};

const initCharts = () => {
  nextTick(() => {
    if (loadChartRef.value) {
      const chart = echarts.init(loadChartRef.value);
      chart.setOption({
        title: {
          text: "节点负载",
          left: "center",
          textStyle: { fontSize: 14 }
        },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: ["节点1", "节点2", "节点3"] },
        yAxis: { type: "value", max: 100 },
        series: [
          {
            type: "bar",
            data: [40, 35, 25],
            markLine: { data: [{ yAxis: 70, name: "负载阈值" }] }
          }
        ]
      });
    }

    if (trendChartRef.value) {
      const chart = echarts.init(trendChartRef.value);
      chart.setOption({
        title: {
          text: "任务执行趋势",
          left: "center",
          textStyle: { fontSize: 14 }
        },
        tooltip: { trigger: "axis" },
        legend: { data: ["成功", "失败"] },
        xAxis: {
          type: "category",
          data: Array.from({ length: 24 }, (_, i) => `${i}:00`)
        },
        yAxis: { type: "value" },
        series: [
          {
            name: "成功",
            type: "line",
            data: Array.from(
              { length: 24 },
              () => Math.floor(Math.random() * 50) + 20
            ),
            itemStyle: { color: "#409EFF" }
          },
          {
            name: "失败",
            type: "line",
            data: Array.from({ length: 24 }, () =>
              Math.floor(Math.random() * 10)
            ),
            itemStyle: { color: "#F56C6C" }
          }
        ]
      });
    }
  });
};

onMounted(() => {
  initCharts();
});
</script>

<style scoped lang="scss">
.collection-task {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .filter-bar {
    margin-bottom: 15px;
  }
}
</style>
