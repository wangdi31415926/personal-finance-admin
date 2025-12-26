<template>
  <div class="log-visualization">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <el-button-group>
            <el-button
              :type="viewMode === 'list' ? 'primary' : ''"
              @click="viewMode = 'list'"
              >列表显示</el-button
            >
            <el-button
              :type="viewMode === 'dashboard' ? 'primary' : ''"
              @click="viewMode = 'dashboard'"
              >仪表盘显示</el-button
            >
            <el-button
              :type="viewMode === 'detail' ? 'primary' : ''"
              @click="viewMode = 'detail'"
              >详情显示</el-button
            >
          </el-button-group>
          <div class="header-actions">
            <el-select v-model="dataLevel" style="width: 120px">
              <el-option label="热数据" value="hot" />
              <el-option label="温数据" value="warm" />
              <el-option label="冷数据" value="cold" />
            </el-select>
            <el-button @click="handleRefresh">刷新</el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="never">
            <div ref="levelTrendRef" style="height: 300px"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never">
            <div ref="deviceDistRef" style="height: 300px"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="12">
          <el-card shadow="never">
            <div ref="heatmapRef" style="height: 300px"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never">
            <div class="stat-cards">
              <div class="stat-card">
                <div class="stat-label">总日志数</div>
                <div class="stat-value">12345</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Critical级日志</div>
                <div class="stat-value danger">45</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import * as echarts from "echarts";

const viewMode = ref("dashboard");
const dataLevel = ref("hot");
const levelTrendRef = ref();
const deviceDistRef = ref();
const heatmapRef = ref();

const initCharts = () => {
  nextTick(() => {
    if (levelTrendRef.value) {
      const chart = echarts.init(levelTrendRef.value);
      chart.setOption({
        title: { text: "日志级别趋势", left: "center" },
        tooltip: { trigger: "axis" },
        legend: { data: ["Info", "Warn", "Error", "Critical"] },
        xAxis: {
          type: "category",
          data: Array.from({ length: 24 }, (_, i) => `${i}:00`)
        },
        yAxis: { type: "value" },
        series: [
          {
            name: "Info",
            type: "line",
            data: Array.from({ length: 24 }, () =>
              Math.floor(Math.random() * 100)
            )
          },
          {
            name: "Warn",
            type: "line",
            data: Array.from({ length: 24 }, () =>
              Math.floor(Math.random() * 50)
            )
          },
          {
            name: "Error",
            type: "line",
            data: Array.from({ length: 24 }, () =>
              Math.floor(Math.random() * 20)
            )
          },
          {
            name: "Critical",
            type: "line",
            data: Array.from({ length: 24 }, () =>
              Math.floor(Math.random() * 10)
            )
          }
        ]
      });
    }

    if (deviceDistRef.value) {
      const chart = echarts.init(deviceDistRef.value);
      chart.setOption({
        title: { text: "设备类型分布", left: "center" },
        tooltip: { trigger: "item" },
        series: [
          {
            type: "pie",
            radius: "60%",
            data: [
              { value: 45, name: "路由器" },
              { value: 30, name: "交换机" },
              { value: 25, name: "服务器" }
            ]
          }
        ]
      });
    }

    if (heatmapRef.value) {
      const chart = echarts.init(heatmapRef.value);
      chart.setOption({
        title: { text: "区域日志热力图", left: "center" },
        tooltip: { position: "top" },
        xAxis: { type: "category", data: ["核心机房", "边缘节点", "分支机构"] },
        yAxis: {
          type: "category",
          data: ["00:00", "06:00", "12:00", "18:00", "24:00"]
        },
        visualMap: {
          min: 0,
          max: 100,
          calculable: true,
          orient: "horizontal",
          left: "center",
          bottom: "15%"
        },
        series: [
          {
            type: "heatmap",
            data: Array.from({ length: 15 }, () => [
              Math.floor(Math.random() * 3),
              Math.floor(Math.random() * 5),
              Math.floor(Math.random() * 100)
            ])
          }
        ]
      });
    }
  });
};

const handleRefresh = () => {
  ElMessage.success("数据已刷新");
  initCharts();
};

onMounted(() => {
  initCharts();
});
</script>

<style scoped lang="scss">
.log-visualization {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-cards {
    display: flex;
    gap: 20px;
    height: 300px;
    align-items: center;
    justify-content: center;

    .stat-card {
      text-align: center;
      padding: 30px;
      background: #f5f7fa;
      border-radius: 8px;
      min-width: 150px;

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 10px;
      }

      .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: #409eff;

        &.danger {
          color: #f56c6c;
        }
      }
    }
  }
}
</style>
