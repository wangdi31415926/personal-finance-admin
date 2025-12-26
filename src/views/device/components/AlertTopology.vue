<template>
  <div class="alert-topology">
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
              :type="viewMode === 'topology' ? 'primary' : ''"
              @click="viewMode = 'topology'"
              >拓扑关联显示</el-button
            >
          </el-button-group>
          <div class="header-actions">
            <el-select v-model="timeRange" style="width: 120px">
              <el-option label="近1小时" value="1h" />
              <el-option label="近6小时" value="6h" />
              <el-option label="近24小时" value="24h" />
            </el-select>
            <el-button @click="handleRefresh">刷新</el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="16">
          <el-card shadow="never">
            <div
              ref="topologyRef"
              style="
                height: 500px;
                background: #f5f7fa;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
              "
            >
              <div style="text-align: center; color: #909399">
                <div style="font-size: 48px; margin-bottom: 10px">📊</div>
                <div>拓扑图展示区域</div>
                <div style="font-size: 12px; margin-top: 10px">
                  设备图标标注设备名称+IP，告警设备按级别标色
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card shadow="never">
            <template #header>
              <span>关联信息</span>
            </template>
            <div v-if="selectedDevice" class="device-info">
              <div class="info-item">
                <strong>设备名称:</strong> {{ selectedDevice.name }}
              </div>
              <div class="info-item">
                <strong>设备IP:</strong> {{ selectedDevice.ip }}
              </div>
              <div class="info-item">
                <strong>当前告警级别:</strong>
                <el-tag :type="getLevelType(selectedDevice.level)" size="small">
                  {{ selectedDevice.level }}
                </el-tag>
              </div>
              <el-divider />
              <div class="affected-business">
                <strong>受影响业务:</strong>
                <el-table
                  :data="affectedBusiness"
                  style="width: 100%; margin-top: 10px"
                  size="small"
                >
                  <el-table-column prop="name" label="业务名称" />
                  <el-table-column prop="priority" label="优先级" width="80" />
                  <el-table-column label="操作" width="100">
                    <template #default="{ row }">
                      <el-button type="text" size="small">通知</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <el-empty v-else description="请选择设备查看详情" />
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";

const viewMode = ref("topology");
const timeRange = ref("1h");
const topologyRef = ref();

const selectedDevice = ref({
  name: "核心路由器-01",
  ip: "192.168.1.1",
  level: "P0"
});

const affectedBusiness = ref([
  { name: "语音业务", priority: "高" },
  { name: "数据业务", priority: "中" }
]);

const getLevelType = (level: string) => {
  const map: Record<string, string> = {
    P0: "danger",
    P1: "warning",
    P2: "info",
    P3: ""
  };
  return map[level] || "info";
};

const handleRefresh = () => {
  ElMessage.success("数据已刷新");
};
</script>

<style scoped lang="scss">
.alert-topology {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .device-info {
    .info-item {
      margin-bottom: 15px;
    }

    .affected-business {
      margin-top: 20px;
    }
  }
}
</style>
