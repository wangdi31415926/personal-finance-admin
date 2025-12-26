<template>
  <div class="device-management">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="title">设备监控管理系统</span>
          <div class="header-actions">
            <el-button-group>
              <el-button
                :type="refreshMode === 'auto' ? 'primary' : ''"
                @click="toggleAutoRefresh"
              >
                <el-icon><Refresh /></el-icon>
                {{ refreshMode === "auto" ? "自动刷新中" : "手动刷新" }}
              </el-button>
              <el-button @click="handleRefresh">
                <el-icon><RefreshRight /></el-icon>
                刷新
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <el-tabs
        v-model="activeTab"
        type="border-card"
        @tab-change="handleTabChange"
      >
        <!-- 对接设置 -->
        <el-tab-pane label="对接设置" name="connection">
          <ConnectionSetup />
        </el-tab-pane>

        <!-- 对接管理 -->
        <el-tab-pane label="对接管理" name="management">
          <ConnectionManagement />
        </el-tab-pane>

        <!-- 采集任务管理 -->
        <el-tab-pane label="采集任务管理" name="collection">
          <CollectionTask />
        </el-tab-pane>

        <!-- 数据存储管理 -->
        <el-tab-pane label="数据存储管理" name="storage">
          <StorageManagement />
        </el-tab-pane>

        <!-- 日志检索 -->
        <el-tab-pane label="日志检索" name="log-search">
          <LogSearch />
        </el-tab-pane>

        <!-- 日志导出 -->
        <el-tab-pane label="日志导出" name="log-export">
          <LogExport />
        </el-tab-pane>

        <!-- 归档与恢复 -->
        <el-tab-pane label="归档与恢复" name="archive">
          <ArchiveRecovery />
        </el-tab-pane>

        <!-- 日志可视化 -->
        <el-tab-pane label="日志可视化" name="visualization">
          <LogVisualization />
        </el-tab-pane>

        <!-- 告警通知配置 -->
        <el-tab-pane label="告警通知配置" name="alert-config">
          <AlertConfig />
        </el-tab-pane>

        <!-- 告警缓存与触发 -->
        <el-tab-pane label="告警缓存与触发" name="alert-cache">
          <AlertCache />
        </el-tab-pane>

        <!-- 告警筛选 -->
        <el-tab-pane label="告警筛选" name="alert-filter">
          <AlertFilter />
        </el-tab-pane>

        <!-- 告警拓扑关联 -->
        <el-tab-pane label="告警拓扑关联" name="alert-topology">
          <AlertTopology />
        </el-tab-pane>

        <!-- 告警与错误处理 -->
        <el-tab-pane label="告警与错误处理" name="alert-handle">
          <AlertHandle />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import { Refresh, RefreshRight } from "@element-plus/icons-vue";
import ConnectionSetup from "./components/ConnectionSetup.vue";
import ConnectionManagement from "./components/ConnectionManagement.vue";
import CollectionTask from "./components/CollectionTask.vue";
import StorageManagement from "./components/StorageManagement.vue";
import LogSearch from "./components/LogSearch.vue";
import LogExport from "./components/LogExport.vue";
import ArchiveRecovery from "./components/ArchiveRecovery.vue";
import LogVisualization from "./components/LogVisualization.vue";
import AlertConfig from "./components/AlertConfig.vue";
import AlertCache from "./components/AlertCache.vue";
import AlertFilter from "./components/AlertFilter.vue";
import AlertTopology from "./components/AlertTopology.vue";
import AlertHandle from "./components/AlertHandle.vue";

const activeTab = ref("connection");
const refreshMode = ref<"auto" | "manual">("manual");
let refreshTimer: NodeJS.Timeout | null = null;

const handleTabChange = (tabName: string) => {
  console.log("切换到标签页:", tabName);
};

const toggleAutoRefresh = () => {
  if (refreshMode.value === "auto") {
    refreshMode.value = "manual";
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
    ElMessage.info("已关闭自动刷新");
  } else {
    refreshMode.value = "auto";
    refreshTimer = setInterval(() => {
      handleRefresh();
    }, 30000); // 30秒刷新一次
    ElMessage.success("已开启自动刷新（30秒）");
  }
};

const handleRefresh = () => {
  ElMessage.success("数据已刷新");
  // 这里可以触发子组件的刷新
};

onMounted(() => {
  // 初始化
});

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
});
</script>

<style scoped lang="scss">
.device-management {
  padding: 20px;
  height: 100%;

  .main-card {
    height: calc(100vh - 100px);

    :deep(.el-card__body) {
      height: calc(100% - 60px);
      padding: 0;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      font-weight: bold;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  :deep(.el-tabs) {
    height: 100%;

    .el-tabs__content {
      height: calc(100% - 55px);
      overflow: auto;
    }

    .el-tab-pane {
      height: 100%;
    }
  }
}
</style>
