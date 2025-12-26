<template>
  <div class="alert-config">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="告警分级配置" name="level">
        <el-table :data="alertLevels" style="width: 100%">
          <el-table-column prop="level" label="级别" width="100" />
          <el-table-column prop="definition" label="定义" />
          <el-table-column prop="scenario" label="典型场景" />
          <el-table-column prop="channel" label="通知渠道" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="text" size="small" @click="handleEditLevel(row)"
                >编辑</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="责任人管理" name="owner">
        <el-table :data="owners" style="width: 100%">
          <el-table-column prop="deviceGroup" label="设备组" />
          <el-table-column prop="mainOwner" label="主责任人" />
          <el-table-column prop="backupOwner" label="备份责任人" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="text" size="small" @click="handleEditOwner(row)"
                >编辑</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="模板设计" name="template">
        <el-table :data="templates" style="width: 100%">
          <el-table-column prop="name" label="模板名称" />
          <el-table-column prop="level" label="告警级别" width="120" />
          <el-table-column prop="channel" label="渠道" width="120" />
          <el-table-column prop="useCount" label="使用次数" width="100" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button
                type="text"
                size="small"
                @click="handleEditTemplate(row)"
                >编辑</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="通知监控" name="monitor">
        <el-table :data="notifications" style="width: 100%">
          <el-table-column prop="alertId" label="告警ID" width="120" />
          <el-table-column prop="level" label="级别" width="100" />
          <el-table-column prop="deviceIp" label="设备IP" width="120" />
          <el-table-column prop="channel" label="通知渠道" width="120" />
          <el-table-column prop="receiver" label="接收人" width="120" />
          <el-table-column prop="sendTime" label="发送时间" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";

const activeTab = ref("level");

const alertLevels = ref([
  {
    level: "P0",
    definition: "紧急",
    scenario: "设备宕机",
    channel: "智能外呼+短信"
  },
  {
    level: "P1",
    definition: "重要",
    scenario: "性能异常",
    channel: "短信+系统消息"
  },
  {
    level: "P2",
    definition: "一般",
    scenario: "配置变更",
    channel: "系统消息"
  },
  { level: "P3", definition: "提示", scenario: "信息提示", channel: "系统消息" }
]);

const owners = ref([
  { deviceGroup: "核心机房", mainOwner: "张三", backupOwner: "李四" },
  { deviceGroup: "边缘节点", mainOwner: "王五", backupOwner: "赵六" }
]);

const templates = ref([
  { name: "P0-智能外呼模板", level: "P0", channel: "智能外呼", useCount: 120 },
  { name: "P1-短信模板", level: "P1", channel: "短信", useCount: 350 }
]);

const notifications = ref([
  {
    alertId: "A001",
    level: "P0",
    deviceIp: "192.168.1.1",
    channel: "智能外呼",
    receiver: "张三",
    sendTime: "2025-11-25 10:00:00",
    status: "已确认"
  },
  {
    alertId: "A002",
    level: "P1",
    deviceIp: "192.168.2.1",
    channel: "短信",
    receiver: "李四",
    sendTime: "2025-11-25 09:30:00",
    status: "已发送"
  }
]);

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    已发送: "primary",
    已确认: "success",
    已升级: "warning"
  };
  return map[status] || "info";
};

const handleEditLevel = (row: any) => {
  ElMessage.info(`编辑级别: ${row.level}`);
};

const handleEditOwner = (row: any) => {
  ElMessage.info(`编辑责任人: ${row.deviceGroup}`);
};

const handleEditTemplate = (row: any) => {
  ElMessage.info(`编辑模板: ${row.name}`);
};
</script>

<style scoped lang="scss">
.alert-config {
  padding: 20px;
}
</style>
