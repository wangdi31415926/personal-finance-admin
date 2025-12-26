<template>
  <div class="storage-management">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="容量监控" name="capacity">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card>
              <div class="capacity-card hot">
                <div class="capacity-header">
                  <span>热数据层</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="handleExpand('hot')"
                    >扩容</el-button
                  >
                </div>
                <div class="capacity-info">
                  <div>已用: 600GB / 总: 1TB</div>
                  <el-progress :percentage="60" :color="getProgressColor(60)" />
                  <div class="capacity-detail">使用率: 60% | 剩余: 400GB</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card>
              <div class="capacity-card warm">
                <div class="capacity-header">
                  <span>温数据层</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="handleExpand('warm')"
                    >扩容</el-button
                  >
                </div>
                <div class="capacity-info">
                  <div>已用: 7TB / 总: 10TB</div>
                  <el-progress :percentage="70" :color="getProgressColor(70)" />
                  <div class="capacity-detail">使用率: 70% | 剩余: 3TB</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card>
              <div class="capacity-card cold">
                <div class="capacity-header">
                  <span>冷数据层</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="handleExpand('cold')"
                    >扩容</el-button
                  >
                </div>
                <div class="capacity-info">
                  <div>已用: 30TB / 总: 100TB</div>
                  <el-progress :percentage="30" :color="getProgressColor(30)" />
                  <div class="capacity-detail">使用率: 30% | 剩余: 70TB</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-card style="margin-top: 20px">
          <div ref="capacityTrendRef" style="height: 300px"></div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="备份管理" name="backup">
        <el-table :data="backupTasks" style="width: 100%">
          <el-table-column prop="id" label="任务ID" width="100" />
          <el-table-column prop="type" label="备份类型" width="100" />
          <el-table-column prop="range" label="备份范围" />
          <el-table-column prop="time" label="备份时间" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '成功' ? 'success' : 'danger'">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="text" size="small">查看报告</el-button>
              <el-button v-if="row.status === '失败'" type="text" size="small"
                >重试备份</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="权限控制" name="permission">
        <el-table :data="roles" style="width: 100%">
          <el-table-column prop="name" label="角色名称" />
          <el-table-column prop="description" label="权限描述" />
          <el-table-column prop="userCount" label="关联用户数" width="120" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="text" size="small">编辑权限</el-button>
              <el-button type="text" size="small">添加用户</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import * as echarts from "echarts";

const activeTab = ref("capacity");
const capacityTrendRef = ref();

const backupTasks = ref([
  {
    id: "B001",
    type: "增量",
    range: "热数据",
    time: "2025-11-25 10:00:00",
    status: "成功"
  },
  {
    id: "B002",
    type: "全量",
    range: "全量",
    time: "2025-11-24 20:00:00",
    status: "成功"
  },
  {
    id: "B003",
    type: "增量",
    range: "温数据",
    time: "2025-11-24 14:00:00",
    status: "失败"
  }
]);

const roles = ref([
  { name: "管理员", description: "全部权限", userCount: 5 },
  { name: "操作员", description: "查看和操作权限", userCount: 12 },
  { name: "查看者", description: "仅查看权限", userCount: 20 }
]);

const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return "#f56c6c";
  if (percentage >= 60) return "#e6a23c";
  return "#67c23a";
};

const handleExpand = (type: string) => {
  ElMessage.info(`扩容${type}数据层`);
};

const initChart = () => {
  nextTick(() => {
    if (capacityTrendRef.value) {
      const chart = echarts.init(capacityTrendRef.value);
      chart.setOption({
        tooltip: { trigger: "axis" },
        legend: { data: ["热数据", "温数据", "冷数据"] },
        xAxis: {
          type: "category",
          data: Array.from({ length: 30 }, (_, i) => `第${i + 1}天`)
        },
        yAxis: { type: "value", name: "容量(GB)" },
        series: [
          {
            name: "热数据",
            type: "line",
            data: Array.from({ length: 30 }, () => Math.random() * 200 + 500)
          },
          {
            name: "温数据",
            type: "line",
            data: Array.from({ length: 30 }, () => Math.random() * 1000 + 6000)
          },
          {
            name: "冷数据",
            type: "line",
            data: Array.from({ length: 30 }, () => Math.random() * 5000 + 25000)
          }
        ]
      });
    }
  });
};

onMounted(() => {
  initChart();
});
</script>

<style scoped lang="scss">
.storage-management {
  padding: 20px;

  .capacity-card {
    padding: 15px;

    .capacity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      font-weight: bold;
    }

    .capacity-info {
      .capacity-detail {
        margin-top: 10px;
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
