<template>
  <div class="alert-filter">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>筛选条件</span>
          <el-button-group>
            <el-button type="primary" @click="handleFilter">执行筛选</el-button>
            <el-button @click="handleReset">重置条件</el-button>
            <el-button @click="handleSaveTemplate">保存模板</el-button>
          </el-button-group>
        </div>
      </template>

      <el-collapse v-model="activeCollapse">
        <el-collapse-item title="设备维度" name="device">
          <el-form :inline="true">
            <el-form-item label="设备IP">
              <el-input v-model="filterForm.deviceIp" />
            </el-form-item>
            <el-form-item label="设备类型">
              <el-select v-model="filterForm.deviceType">
                <el-option label="路由器" value="router" />
                <el-option label="交换机" value="switch" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item title="告警属性" name="alert">
          <el-form :inline="true">
            <el-form-item label="告警级别">
              <el-select v-model="filterForm.level" multiple>
                <el-option label="P0" value="p0" />
                <el-option label="P1" value="p1" />
                <el-option label="P2" value="p2" />
                <el-option label="P3" value="p3" />
              </el-select>
            </el-form-item>
            <el-form-item label="告警类型">
              <el-input v-model="filterForm.type" />
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>

      <div v-if="filterStatus" class="filter-status">
        {{ filterStatus }}
      </div>
    </el-card>

    <el-card shadow="never" style="margin-top: 20px">
      <template #header>
        <span>筛选结果</span>
      </template>
      <div
        v-for="level in alertLevels"
        :key="level.value"
        class="level-section"
      >
        <div class="level-header">
          <el-tag :type="level.type">{{ level.label }}</el-tag>
          <span
            >告警总数: {{ getLevelCount(level.value) }} | 未处置:
            {{ getUnhandledCount(level.value) }}</span
          >
        </div>
        <el-table :data="getLevelAlerts(level.value)" style="width: 100%">
          <el-table-column prop="id" label="告警ID" width="120" />
          <el-table-column prop="deviceIp" label="设备IP" width="120" />
          <el-table-column prop="type" label="告警类型" />
          <el-table-column prop="time" label="产生时间" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="text" size="small" @click="handleHandle(row)"
                >处置</el-button
              >
              <el-button type="text" size="small" @click="handleViewDetail(row)"
                >查看详情</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";

const activeCollapse = ref(["device", "alert"]);
const filterStatus = ref("");

const filterForm = reactive({
  deviceIp: "",
  deviceType: "",
  level: [],
  type: ""
});

const alertLevels = [
  { label: "P0级", value: "p0", type: "danger" },
  { label: "P1级", value: "p1", type: "warning" },
  { label: "P2级", value: "p2", type: "info" },
  { label: "P3级", value: "p3", type: "" }
];

const alerts = ref([
  {
    id: "A001",
    level: "p0",
    deviceIp: "192.168.1.1",
    type: "设备宕机",
    time: "2025-11-25 10:00:00",
    status: "未处置"
  },
  {
    id: "A002",
    level: "p1",
    deviceIp: "192.168.2.1",
    type: "性能异常",
    time: "2025-11-25 09:30:00",
    status: "处置中"
  },
  {
    id: "A003",
    level: "p2",
    deviceIp: "192.168.3.1",
    type: "配置变更",
    time: "2025-11-25 09:00:00",
    status: "已解决"
  }
]);

const getLevelAlerts = (level: string) => {
  return alerts.value.filter(a => a.level === level);
};

const getLevelCount = (level: string) => {
  return alerts.value.filter(a => a.level === level).length;
};

const getUnhandledCount = (level: string) => {
  return alerts.value.filter(a => a.level === level && a.status === "未处置")
    .length;
};

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    未处置: "danger",
    处置中: "warning",
    已解决: "success",
    误报: "info"
  };
  return map[status] || "info";
};

const handleFilter = () => {
  filterStatus.value =
    "筛选完成，共找到235条结果（P0级10条、P1级35条、P2级90条、P3级100条）";
  ElMessage.success("筛选完成");
};

const handleReset = () => {
  Object.keys(filterForm).forEach(key => {
    if (Array.isArray(filterForm[key])) {
      filterForm[key] = [];
    } else {
      filterForm[key] = "";
    }
  });
  filterStatus.value = "";
};

const handleSaveTemplate = () => {
  ElMessage.success("模板已保存");
};

const handleHandle = (row: any) => {
  ElMessage.info(`处置告警: ${row.id}`);
};

const handleViewDetail = (row: any) => {
  ElMessage.info(`查看详情: ${row.id}`);
};
</script>

<style scoped lang="scss">
.alert-filter {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .filter-status {
    margin-top: 15px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;
  }

  .level-section {
    margin-bottom: 30px;

    .level-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #ebeef5;
    }
  }
}
</style>
