<template>
  <div class="log-search">
    <!-- 检索条件区 -->
    <el-card class="search-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>检索条件</span>
          <el-button-group>
            <el-button type="primary" @click="handleSearch">开始检索</el-button>
            <el-button @click="handleReset">重置条件</el-button>
            <el-button @click="handleSaveTemplate">保存模板</el-button>
          </el-button-group>
        </div>
      </template>

      <el-collapse v-model="activeCollapse">
        <el-collapse-item title="设备维度" name="device">
          <el-form :inline="true">
            <el-form-item label="设备名称">
              <el-input
                v-model="searchForm.deviceName"
                placeholder="设备名称"
              />
            </el-form-item>
            <el-form-item label="设备IP">
              <el-input v-model="searchForm.deviceIp" placeholder="设备IP" />
            </el-form-item>
            <el-form-item label="设备类型">
              <el-select v-model="searchForm.deviceType" placeholder="设备类型">
                <el-option label="路由器" value="router" />
                <el-option label="交换机" value="switch" />
                <el-option label="服务器" value="server" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item title="日志维度" name="log">
          <el-form :inline="true">
            <el-form-item label="日志类型">
              <el-select v-model="searchForm.logType" placeholder="日志类型">
                <el-option label="系统日志" value="system" />
                <el-option label="错误日志" value="error" />
                <el-option label="访问日志" value="access" />
              </el-select>
            </el-form-item>
            <el-form-item label="日志级别">
              <el-select v-model="searchForm.logLevel" placeholder="日志级别">
                <el-option label="Info" value="info" />
                <el-option label="Warn" value="warn" />
                <el-option label="Error" value="error" />
                <el-option label="Critical" value="critical" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item title="时间维度" name="time">
          <el-form :inline="true">
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="searchForm.timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>

      <div v-if="searchStatus" class="search-status">
        {{ searchStatus }}
      </div>
    </el-card>

    <!-- 筛选工具栏 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-toolbar">
        <el-select
          v-model="quickFilter.deviceType"
          placeholder="设备类型"
          multiple
          clearable
        >
          <el-option label="路由器" value="router" />
          <el-option label="交换机" value="switch" />
        </el-select>
        <el-select
          v-model="quickFilter.logLevel"
          placeholder="日志级别"
          multiple
          clearable
        >
          <el-option label="Error及以上" value="error+" />
        </el-select>
        <el-select v-model="quickFilter.timeRange" placeholder="时间范围">
          <el-option label="近1小时" value="1h" />
          <el-option label="近6小时" value="6h" />
          <el-option label="近24小时" value="24h" />
        </el-select>
        <el-select v-model="sortOption" placeholder="排序">
          <el-option label="时间降序" value="time-desc" />
          <el-option label="时间升序" value="time-asc" />
        </el-select>
        <el-button type="success" @click="handleExport">导出当前结果</el-button>
      </div>
    </el-card>

    <!-- 结果展示区 -->
    <el-card class="result-card" shadow="never">
      <el-table :data="logResults" style="width: 100%" height="400px">
        <el-table-column prop="time" label="日志时间" width="180" />
        <el-table-column prop="deviceName" label="设备名称" width="150" />
        <el-table-column prop="deviceIp" label="设备IP" width="120" />
        <el-table-column prop="logType" label="日志类型" width="100" />
        <el-table-column prop="logLevel" label="日志级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.logLevel)" size="small">
              {{ row.logLevel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="content"
          label="日志内容"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="viewDetail(row)"
              >查看详情</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";

const activeCollapse = ref(["device", "log", "time"]);
const searchStatus = ref("");
const sortOption = ref("time-desc");
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(1234);

const searchForm = reactive({
  deviceName: "",
  deviceIp: "",
  deviceType: "",
  logType: "",
  logLevel: "",
  timeRange: null
});

const quickFilter = reactive({
  deviceType: [],
  logLevel: [],
  timeRange: ""
});

const logResults = ref([
  {
    time: "2025-11-25 10:30:15",
    deviceName: "核心路由器-01",
    deviceIp: "192.168.1.1",
    logType: "系统日志",
    logLevel: "Error",
    content: "端口1连接异常，丢包率12%"
  },
  {
    time: "2025-11-25 10:29:45",
    deviceName: "边缘路由器-01",
    deviceIp: "192.168.2.1",
    logType: "错误日志",
    logLevel: "Warn",
    content: "CPU使用率超过80%"
  }
]);

const getLevelType = (level: string) => {
  const map: Record<string, string> = {
    Info: "",
    Warn: "warning",
    Error: "danger",
    Critical: "danger"
  };
  return map[level] || "";
};

const handleSearch = () => {
  searchStatus.value = "检索中...";
  setTimeout(() => {
    searchStatus.value = "检索完成，共找到1234条结果";
    ElMessage.success("检索完成");
  }, 1000);
};

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    if (Array.isArray(searchForm[key])) {
      searchForm[key] = [];
    } else {
      searchForm[key] = "";
    }
  });
  searchStatus.value = "";
};

const handleSaveTemplate = () => {
  ElMessage.success("模板已保存");
};

const handleExport = () => {
  ElMessage.info("导出功能");
};

const viewDetail = (row: any) => {
  ElMessage.info(`查看详情: ${row.deviceName}`);
};
</script>

<style scoped lang="scss">
.log-search {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .search-status {
      margin-top: 15px;
      padding: 10px;
      background: #f5f7fa;
      border-radius: 4px;
      color: #606266;
    }
  }

  .filter-card {
    margin-bottom: 20px;

    .filter-toolbar {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
  }
}
</style>
