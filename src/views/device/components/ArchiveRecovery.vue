<template>
  <div class="archive-recovery">
    <!-- 归档任务监控区 -->
    <el-card class="monitor-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>归档任务监控</span>
          <el-button type="primary" @click="handleManualArchive"
            >手动归档</el-button
          >
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="never" class="stat-card">
            <div class="stat-title">累计归档包数</div>
            <div class="stat-value">1200</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never" class="stat-card">
            <div class="stat-title">已释放存储空间</div>
            <div class="stat-value">500 TB</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never" class="stat-card">
            <div class="stat-title">归档成功率</div>
            <div class="stat-value">99.8%</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never" class="stat-card">
            <div class="stat-title">待清理归档包数</div>
            <div class="stat-value">15</div>
          </el-card>
        </el-col>
      </el-row>

      <el-divider />
      <div class="recent-tasks">
        <div class="task-item" v-for="task in recentTasks" :key="task.id">
          <span>{{ task.id }}</span>
          <span>{{ task.time }}</span>
          <el-tag :type="task.status === '成功' ? 'success' : 'danger'">{{
            task.status
          }}</el-tag>
          <el-button type="text" size="small">查看报告</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 索引检索区 -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span>索引检索</span>
          </template>
          <el-form label-width="100px">
            <el-form-item label="年份月份">
              <el-date-picker
                v-model="searchForm.month"
                type="month"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="设备类型">
              <el-select
                v-model="searchForm.deviceType"
                multiple
                style="width: 100%"
              >
                <el-option label="路由器" value="router" />
                <el-option label="交换机" value="switch" />
              </el-select>
            </el-form-item>
            <el-form-item label="日志类型">
              <el-select
                v-model="searchForm.logType"
                multiple
                style="width: 100%"
              >
                <el-option label="故障日志" value="error" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">检索</el-button>
            </el-form-item>
          </el-form>

          <el-table
            :data="archivePackages"
            style="width: 100%; margin-top: 20px"
            max-height="400"
          >
            <el-table-column prop="id" label="归档包ID" width="120" />
            <el-table-column prop="deviceType" label="设备类型" width="100" />
            <el-table-column prop="timeRange" label="时间范围" />
            <el-table-column prop="size" label="存储大小" width="100" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="handlePreview(row)"
                  >预览</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 恢复操作区 -->
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <span>恢复操作</span>
          </template>
          <el-form :model="recoveryForm" label-width="120px">
            <el-form-item label="恢复模式">
              <el-radio-group v-model="recoveryForm.mode">
                <el-radio label="full">全量恢复</el-radio>
                <el-radio label="partial">部分恢复</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="recoveryForm.mode === 'partial'"
              label="目标设备IP"
            >
              <el-input v-model="recoveryForm.deviceIp" />
            </el-form-item>
            <el-form-item label="恢复目标">
              <el-select v-model="recoveryForm.target" style="width: 100%">
                <el-option label="温数据层" value="warm" />
                <el-option label="热数据层" value="hot" />
              </el-select>
            </el-form-item>
            <el-form-item label="保留时长">
              <el-select v-model="recoveryForm.duration" style="width: 100%">
                <el-option label="7天" value="7" />
                <el-option label="15天" value="15" />
                <el-option label="30天" value="30" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleRecovery"
                >提交恢复</el-button
              >
            </el-form-item>
          </el-form>

          <el-divider />
          <div v-if="recoveryProgress" class="recovery-progress">
            <el-progress :percentage="recoveryProgress" />
            <div class="progress-info">恢复中... 预计剩余时间: 5分钟</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";

const recentTasks = ref([
  { id: "A001", time: "2025-11-25 10:00:00", status: "成功" },
  { id: "A002", time: "2025-11-24 20:00:00", status: "成功" },
  { id: "A003", time: "2025-11-24 14:00:00", status: "失败" }
]);

const searchForm = reactive({
  month: null,
  deviceType: [],
  logType: []
});

const archivePackages = ref([
  {
    id: "P001",
    deviceType: "路由器",
    timeRange: "2025-08-01 00:00 - 23:59",
    size: "50GB"
  },
  {
    id: "P002",
    deviceType: "交换机",
    timeRange: "2025-08-02 00:00 - 23:59",
    size: "30GB"
  }
]);

const recoveryForm = reactive({
  mode: "full",
  deviceIp: "",
  target: "warm",
  duration: "7"
});

const recoveryProgress = ref(0);

const handleManualArchive = () => {
  ElMessage.info("手动归档功能");
};

const handleSearch = () => {
  ElMessage.success("检索完成");
};

const handlePreview = (row: any) => {
  ElMessage.info(`预览归档包: ${row.id}`);
};

const handleRecovery = () => {
  recoveryProgress.value = 0;
  const timer = setInterval(() => {
    recoveryProgress.value += 10;
    if (recoveryProgress.value >= 100) {
      clearInterval(timer);
      ElMessage.success("恢复完成");
    }
  }, 500);
};
</script>

<style scoped lang="scss">
.archive-recovery {
  padding: 20px;

  .monitor-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .recent-tasks {
      display: flex;
      gap: 20px;
      overflow-x: auto;

      .task-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 15px;
        background: #f5f7fa;
        border-radius: 4px;
        min-width: 150px;
      }
    }
  }

  .recovery-progress {
    margin-top: 20px;

    .progress-info {
      margin-top: 10px;
      text-align: center;
      color: #606266;
    }
  }

  .stat-card {
    text-align: center;

    .stat-title {
      font-size: 14px;
      color: #909399;
      margin-bottom: 10px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #409eff;
    }
  }
}
</style>
