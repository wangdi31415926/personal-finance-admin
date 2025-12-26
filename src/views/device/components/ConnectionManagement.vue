<template>
  <div class="connection-management">
    <!-- 顶部仪表盘视图 -->
    <el-card class="dashboard-card" shadow="never">
      <template #header>
        <span>仪表盘视图</span>
      </template>

      <el-row :gutter="20">
        <!-- 核心指标卡片 -->
        <el-col :span="8">
          <el-card class="metric-card success">
            <div class="metric-content">
              <div class="metric-label">整体对接率</div>
              <div class="metric-value">99.8%</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="metric-card danger">
            <div class="metric-content">
              <div class="metric-label">异常设备数</div>
              <div class="metric-value">2台</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="metric-card info">
            <div class="metric-content">
              <div class="metric-label">平均传输延迟</div>
              <div class="metric-value">0.3秒</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <!-- 设备类型对接率环形图 -->
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>设备类型对接率</span>
            </template>
            <div ref="pieChartRef" style="height: 300px"></div>
          </el-card>
        </el-col>

        <!-- 链路指标折线图 -->
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>链路指标（近24小时）</span>
            </template>
            <div ref="lineChartRef" style="height: 300px"></div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 底部异常处置视图 -->
    <el-card class="exception-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>异常处置视图</span>
          <div class="header-actions">
            <el-select
              v-model="refreshFrequency"
              size="small"
              style="width: 120px"
            >
              <el-option label="10秒" value="10" />
              <el-option label="30秒" value="30" />
              <el-option label="1分钟" value="60" />
            </el-select>
            <el-button size="small" @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20">
        <!-- 异常设备列表 -->
        <el-col :span="16">
          <div class="filter-bar">
            <el-select
              v-model="exceptionLevelFilter"
              placeholder="按级别筛选"
              clearable
              style="width: 150px"
            >
              <el-option label="一级异常" value="level1" />
              <el-option label="二级异常" value="level2" />
              <el-option label="三级异常" value="level3" />
            </el-select>
          </div>

          <el-table :data="exceptionDevices" style="width: 100%">
            <el-table-column prop="ip" label="IP" width="120" />
            <el-table-column prop="name" label="名称" width="150" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="level" label="异常级别" width="100">
              <template #default="{ row }">
                <el-tag :type="getLevelType(row.level)" size="small">
                  {{ getLevelText(row.level) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="异常时长" width="120" />
            <el-table-column prop="reason" label="原因" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.level === 'level2'"
                  type="success"
                  size="small"
                  @click="handleRecover(row)"
                >
                  一键恢复
                </el-button>
                <el-button
                  v-if="row.level === 'level3'"
                  type="danger"
                  size="small"
                  @click="handleStartPlan(row)"
                >
                  启动预案
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>

        <!-- 处置日志区 -->
        <el-col :span="8">
          <el-card shadow="never">
            <template #header>
              <span>处置日志</span>
            </template>
            <div v-if="selectedDevice" class="log-content">
              <div class="device-info">
                <strong>{{ selectedDevice.name }}</strong>
                <el-tag :type="getLevelType(selectedDevice.level)" size="small">
                  {{ getLevelText(selectedDevice.level) }}
                </el-tag>
              </div>

              <div class="log-list">
                <div
                  v-for="(log, index) in deviceLogs"
                  :key="index"
                  class="log-item"
                >
                  <div class="log-time">{{ log.time }}</div>
                  <div class="log-content-text">{{ log.content }}</div>
                  <div class="log-operator">{{ log.operator }}</div>
                </div>
              </div>

              <el-divider />
              <el-input
                v-model="newLogNote"
                type="textarea"
                :rows="3"
                placeholder="添加处置备注"
              />
              <el-button
                type="primary"
                size="small"
                style="margin-top: 10px"
                @click="addLogNote"
              >
                添加备注
              </el-button>
            </div>
            <el-empty v-else description="请选择异常设备查看日志" />
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import * as echarts from "echarts";

const pieChartRef = ref();
const lineChartRef = ref();
let pieChart: echarts.ECharts | null = null;
let lineChart: echarts.ECharts | null = null;

const refreshFrequency = ref("30");
const exceptionLevelFilter = ref("");
const selectedDevice = ref<any>(null);
const newLogNote = ref("");

// 异常设备数据
const exceptionDevices = ref([
  {
    ip: "192.168.1.1",
    name: "核心路由器-01",
    type: "路由器",
    level: "level2",
    duration: "2小时30分",
    reason: "连接超时"
  },
  {
    ip: "192.168.2.1",
    name: "边缘路由器-01",
    type: "路由器",
    level: "level3",
    duration: "5小时15分",
    reason: "设备宕机"
  }
]);

// 设备日志
const deviceLogs = ref([
  {
    time: "2025-11-25 10:00:00",
    content: "重试对接，失败",
    operator: "张三"
  },
  {
    time: "2025-11-25 09:30:00",
    content: "检查网络连接，正常",
    operator: "李四"
  },
  {
    time: "2025-11-25 09:00:00",
    content: "异常告警产生",
    operator: "系统"
  }
]);

const getLevelType = (level: string) => {
  const map: Record<string, string> = {
    level1: "info",
    level2: "warning",
    level3: "danger"
  };
  return map[level] || "info";
};

const getLevelText = (level: string) => {
  const map: Record<string, string> = {
    level1: "一级异常",
    level2: "二级异常",
    level3: "三级异常"
  };
  return map[level] || "未知";
};

const handleRefresh = () => {
  ElMessage.success("数据已刷新");
};

const handleRecover = (row: any) => {
  ElMessageBox.confirm("确定要一键恢复该设备吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      ElMessage.success("恢复操作已执行");
    })
    .catch(() => {});
};

const handleStartPlan = (row: any) => {
  ElMessageBox.confirm("确定要启动应急预案吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      ElMessage.success("应急预案已启动");
    })
    .catch(() => {});
};

const addLogNote = () => {
  if (!newLogNote.value.trim()) {
    ElMessage.warning("请输入备注内容");
    return;
  }
  deviceLogs.value.unshift({
    time: new Date().toLocaleString("zh-CN"),
    content: newLogNote.value,
    operator: "当前用户"
  });
  newLogNote.value = "";
  ElMessage.success("备注已添加");
};

const initCharts = () => {
  nextTick(() => {
    // 环形图
    if (pieChartRef.value) {
      pieChart = echarts.init(pieChartRef.value);
      pieChart.setOption({
        tooltip: {
          trigger: "item"
        },
        legend: {
          orient: "vertical",
          left: "left"
        },
        series: [
          {
            name: "对接率",
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 2
            },
            label: {
              show: false,
              position: "center"
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: "bold"
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 45, name: "路由器" },
              { value: 30, name: "交换机" },
              { value: 25, name: "服务器" }
            ]
          }
        ]
      });
    }

    // 折线图
    if (lineChartRef.value) {
      lineChart = echarts.init(lineChartRef.value);
      const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      lineChart.setOption({
        tooltip: {
          trigger: "axis"
        },
        legend: {
          data: ["传输延迟", "丢包率"]
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: hours
        },
        yAxis: [
          {
            type: "value",
            name: "延迟(秒)",
            position: "left"
          },
          {
            type: "value",
            name: "丢包率(%)",
            position: "right"
          }
        ],
        series: [
          {
            name: "传输延迟",
            type: "line",
            data: Array.from({ length: 24 }, () => Math.random() * 0.5 + 0.1),
            itemStyle: { color: "#409EFF" },
            markLine: {
              data: [{ yAxis: 1, name: "阈值" }]
            }
          },
          {
            name: "丢包率",
            type: "line",
            yAxisIndex: 1,
            data: Array.from({ length: 24 }, () => Math.random() * 0.3),
            itemStyle: { color: "#E6A23C" },
            markLine: {
              data: [{ yAxis: 0.5, name: "阈值" }]
            }
          }
        ]
      });
    }
  });
};

onMounted(() => {
  initCharts();
  if (exceptionDevices.value.length > 0) {
    selectedDevice.value = exceptionDevices.value[0];
  }
});

onUnmounted(() => {
  pieChart?.dispose();
  lineChart?.dispose();
});
</script>

<style scoped lang="scss">
.connection-management {
  padding: 20px;

  .dashboard-card {
    .metric-card {
      text-align: center;

      &.success {
        border-left: 4px solid #67c23a;
      }

      &.danger {
        border-left: 4px solid #f56c6c;
      }

      &.info {
        border-left: 4px solid #409eff;
      }

      .metric-content {
        padding: 20px;

        .metric-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 10px;
        }

        .metric-value {
          font-size: 32px;
          font-weight: bold;
        }
      }
    }
  }

  .exception-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .filter-bar {
      margin-bottom: 15px;
    }

    .log-content {
      .device-info {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid #ebeef5;
      }

      .log-list {
        max-height: 300px;
        overflow-y: auto;
        margin-bottom: 15px;

        .log-item {
          padding: 10px;
          background: #f5f7fa;
          border-radius: 4px;
          margin-bottom: 10px;

          .log-time {
            font-size: 12px;
            color: #909399;
            margin-bottom: 5px;
          }

          .log-content-text {
            font-size: 14px;
            color: #606266;
            margin-bottom: 5px;
          }

          .log-operator {
            font-size: 12px;
            color: #909399;
            text-align: right;
          }
        }
      }
    }
  }
}
</style>
