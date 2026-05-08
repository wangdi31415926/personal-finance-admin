<template>
  <div class="data-page">
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <span class="stat-value">8</span>
          <span class="stat-label">数据源总数</span>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <span class="stat-value">156</span>
          <span class="stat-label">今日成功任务</span>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <span class="stat-value">3</span>
          <span class="stat-label">今日失败任务</span>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <span class="stat-value">2</span>
          <span class="stat-label">进行中</span>
        </el-card>
      </el-col>
    </el-row>
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>数据源与任务</span>
          <el-button type="primary" size="small">添加数据源</el-button>
        </div>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="数据源列表" name="sources">
          <el-table :data="paginatedDataSources" stripe size="small">
            <el-table-column prop="name" label="数据源名称" min-width="140" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="status" label="连接状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '正常' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="mode" label="模式" width="80">
              <template #default="{ row }">
                <el-tag :type="row.mode === '同步' ? 'success' : 'warning'" size="small">{{ row.mode }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastSync" label="最后同步" width="160" />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small">测试连接</el-button>
                <el-button link type="primary" size="small">配置</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-model:current-page="dataSourcePage"
            :page-size="10"
            :total="dataSources.length"
            layout="total, prev, pager, next"
            small
            class="pagination"
          />
        </el-tab-pane>
        <el-tab-pane label="任务列表" name="tasks">
          <el-table :data="paginatedTaskList" stripe size="small">
            <el-table-column prop="name" label="任务名称" min-width="160" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="mode" label="同步/异步" width="90">
              <template #default="{ row }">
                <el-tag size="small">{{ row.mode }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === '成功' ? 'success' : row.status === '失败' ? 'danger' : 'warning'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="nextRun" label="下次执行" width="160" />
            <el-table-column label="操作" width="160" fixed="right">
              <template #default>
                <el-button link type="primary" size="small">立即执行</el-button>
                <el-button link type="primary" size="small">查看日志</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-model:current-page="taskPage"
            :page-size="10"
            :total="taskList.length"
            layout="total, prev, pager, next"
            small
            class="pagination"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref("sources");
const dataSourcePage = ref(1);
const taskPage = ref(1);

const dataSources = ref([
  { name: "网络流量指标", type: "时序数据库", status: "正常", mode: "同步", lastSync: "2025-03-14 10:30:00" },
  { name: "设备告警", type: "RESTful API", status: "正常", mode: "异步", lastSync: "2025-03-14 10:28:00" },
  { name: "模板元数据", type: "Elasticsearch", status: "正常", mode: "同步", lastSync: "2025-03-14 09:00:00" },
  { name: "设备资产信息", type: "关系型数据库", status: "正常", mode: "同步", lastSync: "2025-03-14 08:00:00" },
  { name: "拓扑关系", type: "图数据库", status: "正常", mode: "同步", lastSync: "2025-03-14 07:45:00" },
  { name: "配置快照", type: "对象存储", status: "正常", mode: "异步", lastSync: "2025-03-14 06:00:00" },
  { name: "日志采集", type: "RESTful API", status: "正常", mode: "异步", lastSync: "2025-03-14 05:30:00" },
  { name: "性能基线", type: "时序数据库", status: "正常", mode: "同步", lastSync: "2025-03-13 23:00:00" },
  { name: "用户权限", type: "关系型数据库", status: "正常", mode: "同步", lastSync: "2025-03-14 09:15:00" },
  { name: "知识库索引", type: "Elasticsearch", status: "正常", mode: "异步", lastSync: "2025-03-14 04:00:00" }
]);

const taskList = ref([
  { name: "流量指标查询", type: "数据获取", mode: "同步", status: "成功", nextRun: "-" },
  { name: "告警数据拉取", type: "数据获取", mode: "异步", status: "进行中", nextRun: "-" },
  { name: "日报汇总", type: "定时任务", mode: "异步", status: "成功", nextRun: "2025-03-15 00:00:00" },
  { name: "周报汇总", type: "定时任务", mode: "异步", status: "成功", nextRun: "2025-03-18 00:00:00" },
  { name: "设备健康度计算", type: "分析任务", mode: "异步", status: "成功", nextRun: "2025-03-14 12:00:00" },
  { name: "拓扑同步", type: "数据获取", mode: "异步", status: "成功", nextRun: "2025-03-14 11:00:00" },
  { name: "配置备份", type: "定时任务", mode: "异步", status: "失败", nextRun: "2025-03-14 14:00:00" },
  { name: "日志归档", type: "定时任务", mode: "异步", status: "成功", nextRun: "2025-03-15 02:00:00" },
  { name: "指标聚合", type: "数据获取", mode: "同步", status: "成功", nextRun: "-" },
  { name: "索引重建", type: "维护任务", mode: "异步", status: "成功", nextRun: "2025-03-20 03:00:00" },
  { name: "缓存预热", type: "数据获取", mode: "同步", status: "成功", nextRun: "-" }
]);

const paginatedDataSources = computed(() => {
  const start = (dataSourcePage.value - 1) * 10;
  return dataSources.value.slice(start, start + 10);
});

const paginatedTaskList = computed(() => {
  const start = (taskPage.value - 1) * 10;
  return taskList.value.slice(start, start + 10);
});
</script>

<style scoped lang="scss">
.data-page {
  .stat-row {
    margin-bottom: 16px;
  }

  .stat-card {
    text-align: center;
    padding: 16px;

    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .stat-label {
      font-size: 13px;
      color: #909399;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination {
    margin-top: 12px;
  }
}
</style>
