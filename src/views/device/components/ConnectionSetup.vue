<template>
  <div class="connection-setup">
    <el-row :gutter="20" class="setup-container">
      <!-- 左侧：设备列表区 -->
      <el-col :span="6" class="device-list-panel">
        <el-card shadow="never">
          <template #header>
            <div class="panel-header">
              <span>设备列表</span>
              <el-button size="small" type="primary" @click="handleAddDevice">
                <el-icon><Plus /></el-icon>
                添加设备
              </el-button>
            </div>
          </template>

          <!-- 搜索框 -->
          <el-input
            v-model="searchKeyword"
            placeholder="输入设备IP/名称搜索"
            clearable
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <!-- 设备树 -->
          <el-tree
            ref="deviceTreeRef"
            :data="deviceTreeData"
            :props="treeProps"
            :filter-node-method="filterNode"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
            class="device-tree"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <span class="node-label">{{ node.label }}</span>
                <el-tag
                  :type="getStatusType(data.status)"
                  size="small"
                  class="status-tag"
                >
                  {{ getStatusText(data.status) }}
                </el-tag>
              </div>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 中间：参数配置区 -->
      <el-col :span="10" class="config-panel">
        <el-card shadow="never">
          <template #header>
            <span>参数配置</span>
          </template>

          <el-form
            ref="configFormRef"
            :model="configForm"
            :rules="configRules"
            label-width="120px"
            class="config-form"
          >
            <!-- 基础信息 -->
            <el-divider content-position="left">基础信息</el-divider>
            <el-form-item label="设备型号" prop="deviceModel">
              <el-select
                v-model="configForm.deviceModel"
                placeholder="请选择设备型号"
                style="width: 100%"
                @change="handleModelChange"
              >
                <el-option
                  v-for="model in deviceModels"
                  :key="model.value"
                  :label="model.label"
                  :value="model.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="设备IP" prop="deviceIp">
              <el-input
                v-model="configForm.deviceIp"
                placeholder="支持批量粘贴，多个IP用逗号分隔"
                @blur="validateIp"
              />
            </el-form-item>

            <el-form-item label="所属区域" prop="region">
              <el-select
                v-model="configForm.region"
                placeholder="请选择区域"
                style="width: 100%"
              >
                <el-option
                  v-for="region in regions"
                  :key="region.value"
                  :label="region.label"
                  :value="region.value"
                />
              </el-select>
            </el-form-item>

            <!-- 协议配置 -->
            <el-divider content-position="left">协议配置</el-divider>
            <el-form-item label="协议类型" prop="protocolType">
              <el-select
                v-model="configForm.protocolType"
                placeholder="请选择协议类型"
                style="width: 100%"
                @change="handleProtocolChange"
              >
                <el-option
                  v-for="protocol in protocolTypes"
                  :key="protocol.value"
                  :label="protocol.label"
                  :value="protocol.value"
                />
              </el-select>
            </el-form-item>

            <!-- 动态协议参数 -->
            <template v-if="configForm.protocolType === 'SNMPv3'">
              <el-form-item label="共同体名" prop="community">
                <el-input v-model="configForm.community" />
              </el-form-item>
              <el-form-item label="认证密码" prop="authPassword">
                <el-input
                  v-model="configForm.authPassword"
                  type="password"
                  show-password
                />
              </el-form-item>
            </template>

            <template v-if="configForm.protocolType === 'SSH2.0'">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="configForm.username" />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="configForm.password"
                  type="password"
                  show-password
                />
              </el-form-item>
              <el-form-item label="端口" prop="port">
                <el-input-number
                  v-model="configForm.port"
                  :min="1"
                  :max="65535"
                />
              </el-form-item>
            </template>

            <!-- 模板选择 -->
            <el-divider content-position="left">模板选择</el-divider>
            <el-form-item label="复用模板" prop="template">
              <el-select
                v-model="configForm.template"
                placeholder="选择模板后自动填充参数"
                style="width: 100%"
                @change="handleTemplateChange"
              >
                <el-option
                  v-for="template in templates"
                  :key="template.value"
                  :label="template.label"
                  :value="template.value"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：测试与结果区 -->
      <el-col :span="8" class="test-panel">
        <el-card shadow="never">
          <template #header>
            <span>测试与结果</span>
          </template>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button type="primary" @click="handleTest" :loading="testing">
              <el-icon><Connection /></el-icon>
              测试对接
            </el-button>
            <el-button
              type="success"
              :disabled="!testPassed"
              @click="handleSave"
            >
              <el-icon><Check /></el-icon>
              保存配置
            </el-button>
            <el-button @click="handleReset">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
          </div>

          <!-- 测试结果 -->
          <el-divider content-position="left">测试结果</el-divider>
          <div class="test-results">
            <div v-for="test in testResults" :key="test.name" class="test-item">
              <div class="test-header">
                <span class="test-name">{{ test.name }}</span>
                <el-icon
                  :class="test.passed ? 'success-icon' : 'fail-icon'"
                  :size="20"
                >
                  <component :is="test.passed ? 'Check' : 'Close'" />
                </el-icon>
              </div>
              <div v-if="!test.passed && test.message" class="test-message">
                {{ test.message }}
              </div>
            </div>
          </div>

          <!-- 历史记录 -->
          <el-divider content-position="left">历史记录</el-divider>
          <div class="history-list">
            <div
              v-for="(record, index) in historyRecords"
              :key="index"
              class="history-item"
            >
              <div class="history-time">{{ record.time }}</div>
              <div class="history-result">
                <el-tag
                  :type="record.passed ? 'success' : 'danger'"
                  size="small"
                >
                  {{ record.passed ? "通过" : "失败" }}
                </el-tag>
                <span class="history-operator">{{ record.operator }}</span>
              </div>
              <el-button
                type="text"
                size="small"
                @click="viewHistoryDetail(record)"
              >
                查看详情
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 配置进度 -->
    <el-card class="progress-card" shadow="never">
      <div class="progress-info">
        <span>配置进度：</span>
        <el-progress
          :percentage="progressPercentage"
          :format="() => `${completedSteps}/${totalSteps}步完成`"
        />
      </div>
    </el-card>

    <!-- 历史记录详情弹窗 -->
    <el-dialog v-model="historyDetailVisible" title="测试详情" width="600px">
      <div v-if="currentHistoryRecord">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="测试时间">
            {{ currentHistoryRecord.time }}
          </el-descriptions-item>
          <el-descriptions-item label="测试结果">
            <el-tag :type="currentHistoryRecord.passed ? 'success' : 'danger'">
              {{ currentHistoryRecord.passed ? "通过" : "失败" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作人">
            {{ currentHistoryRecord.operator }}
          </el-descriptions-item>
          <el-descriptions-item label="设备IP">
            {{ currentHistoryRecord.deviceIp }}
          </el-descriptions-item>
          <el-descriptions-item label="详细信息" :span="2">
            {{ currentHistoryRecord.detail }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Search,
  Connection,
  Check,
  Close,
  RefreshLeft
} from "@element-plus/icons-vue";

// 搜索关键词
const searchKeyword = ref("");
const deviceTreeRef = ref();

// 设备树数据
const deviceTreeData = ref([
  {
    id: 1,
    label: "路由器",
    children: [
      {
        id: 11,
        label: "核心机房",
        children: [
          {
            id: 111,
            label: "192.168.1.1 - 核心路由器-01",
            status: "connected"
          },
          {
            id: 112,
            label: "192.168.1.2 - 核心路由器-02",
            status: "connecting"
          },
          { id: 113, label: "192.168.1.3 - 核心路由器-03", status: "failed" }
        ]
      },
      {
        id: 12,
        label: "边缘节点",
        children: [
          {
            id: 121,
            label: "192.168.2.1 - 边缘路由器-01",
            status: "connected"
          },
          {
            id: 122,
            label: "192.168.2.2 - 边缘路由器-02",
            status: "not_connected"
          }
        ]
      }
    ]
  },
  {
    id: 2,
    label: "交换机",
    children: [
      {
        id: 21,
        label: "核心机房",
        children: [
          {
            id: 211,
            label: "192.168.3.1 - 核心交换机-01",
            status: "connected"
          },
          {
            id: 212,
            label: "192.168.3.2 - 核心交换机-02",
            status: "not_connected"
          }
        ]
      }
    ]
  },
  {
    id: 3,
    label: "服务器",
    children: [
      {
        id: 31,
        label: "核心机房",
        children: [
          {
            id: 311,
            label: "192.168.4.1 - 应用服务器-01",
            status: "connected"
          },
          {
            id: 312,
            label: "192.168.4.2 - 数据库服务器-01",
            status: "connecting"
          }
        ]
      }
    ]
  }
]);

const treeProps = {
  children: "children",
  label: "label"
};

// 配置表单
const configForm = reactive({
  deviceModel: "",
  deviceIp: "",
  region: "",
  protocolType: "",
  community: "",
  authPassword: "",
  username: "",
  password: "",
  port: 22,
  template: ""
});

const configFormRef = ref();

// 表单验证规则
const configRules = {
  deviceModel: [
    { required: true, message: "请选择设备型号", trigger: "change" }
  ],
  deviceIp: [
    { required: true, message: "请输入设备IP", trigger: "blur" },
    {
      pattern: /^(\d{1,3}\.){3}\d{1,3}(,\s*(\d{1,3}\.){3}\d{1,3})*$/,
      message: "IP格式错误，多个IP用逗号分隔",
      trigger: "blur"
    }
  ],
  region: [{ required: true, message: "请选择所属区域", trigger: "change" }],
  protocolType: [
    { required: true, message: "请选择协议类型", trigger: "change" }
  ]
};

// 选项数据
const deviceModels = [
  { label: "华为AR6500", value: "AR6500" },
  { label: "思科ASR1000", value: "ASR1000" },
  { label: "H3C MSR3600", value: "MSR3600" }
];

const regions = [
  { label: "核心机房", value: "core" },
  { label: "边缘节点", value: "edge" },
  { label: "分支机构", value: "branch" }
];

const protocolTypes = [
  { label: "SNMPv3", value: "SNMPv3" },
  { label: "SSH2.0", value: "SSH2.0" },
  { label: "Telnet", value: "Telnet" }
];

const templates = [
  { label: "默认模板", value: "default" },
  { label: "核心设备模板", value: "core" },
  { label: "边缘设备模板", value: "edge" }
];

// 测试相关
const testing = ref(false);
const testPassed = ref(false);
const testResults = ref([
  { name: "连通性", passed: false, message: "" },
  { name: "协议握手", passed: false, message: "" },
  { name: "数据采集", passed: false, message: "" }
]);

// 历史记录
const historyRecords = ref([
  {
    time: "2025-11-25 10:30:00",
    passed: true,
    operator: "张三",
    deviceIp: "192.168.1.1",
    detail: "所有测试通过，设备对接成功"
  },
  {
    time: "2025-11-25 09:15:00",
    passed: false,
    operator: "李四",
    deviceIp: "192.168.1.2",
    detail: "协议握手失败：认证密码错误"
  },
  {
    time: "2025-11-24 16:45:00",
    passed: true,
    operator: "王五",
    deviceIp: "192.168.1.3",
    detail: "所有测试通过，设备对接成功"
  },
  {
    time: "2025-11-24 14:20:00",
    passed: false,
    operator: "赵六",
    deviceIp: "192.168.2.1",
    detail: "连通性测试失败：网络超时"
  },
  {
    time: "2025-11-24 11:00:00",
    passed: true,
    operator: "张三",
    deviceIp: "192.168.3.1",
    detail: "所有测试通过，设备对接成功"
  }
]);

const historyDetailVisible = ref(false);
const currentHistoryRecord = ref(null);

// 配置进度
const completedSteps = ref(0);
const totalSteps = ref(5);
const progressPercentage = computed(() => {
  return Math.round((completedSteps.value / totalSteps.value) * 100);
});

// 方法
const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return data.label.includes(value);
};

watch(searchKeyword, val => {
  deviceTreeRef.value?.filter(val);
});

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    connected: "success",
    connecting: "warning",
    failed: "danger",
    not_connected: "info"
  };
  return statusMap[status] || "info";
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    connected: "已对接",
    connecting: "对接中",
    failed: "对接失败",
    not_connected: "未对接"
  };
  return statusMap[status] || "未知";
};

const handleNodeClick = (data: any) => {
  if (data.children) return;
  // 加载设备配置
  console.log("选择设备:", data);
};

const handleAddDevice = () => {
  ElMessage.info("添加设备功能");
};

const handleModelChange = (value: string) => {
  // 根据设备型号自动填充部分参数
  console.log("选择设备型号:", value);
  completedSteps.value = Math.min(completedSteps.value + 1, totalSteps.value);
};

const handleProtocolChange = (value: string) => {
  // 清空协议相关字段
  configForm.community = "";
  configForm.authPassword = "";
  configForm.username = "";
  configForm.password = "";
  configForm.port = 22;
};

const handleTemplateChange = (value: string) => {
  // 根据模板自动填充参数
  if (value === "default") {
    configForm.community = "public";
    configForm.port = 161;
  } else if (value === "core") {
    configForm.community = "core_community";
    configForm.port = 161;
  }
  ElMessage.success("模板参数已加载，可进行微调");
};

const validateIp = () => {
  configFormRef.value?.validateField("deviceIp");
};

const handleTest = async () => {
  if (!configFormRef.value) return;
  await configFormRef.value.validate((valid: boolean) => {
    if (!valid) {
      ElMessage.warning("请先完善配置信息");
      return;
    }
  });

  testing.value = true;
  testPassed.value = false;
  testResults.value = [
    { name: "连通性", passed: false, message: "" },
    { name: "协议握手", passed: false, message: "" },
    { name: "数据采集", passed: false, message: "" }
  ];

  // 模拟测试过程
  setTimeout(() => {
    testResults.value[0] = { name: "连通性", passed: true, message: "" };
  }, 1000);

  setTimeout(() => {
    testResults.value[1] = { name: "协议握手", passed: true, message: "" };
  }, 2000);

  setTimeout(() => {
    const dataPassed = Math.random() > 0.3; // 70%概率通过
    testResults.value[2] = {
      name: "数据采集",
      passed: dataPassed,
      message: dataPassed ? "" : "数据采集超时，请检查设备配置"
    };
    testPassed.value = testResults.value.every(t => t.passed);
    testing.value = false;

    if (testPassed.value) {
      ElMessage.success("所有测试通过！");
    } else {
      ElMessage.error("部分测试失败，请检查配置");
    }
  }, 3000);
};

const handleSave = () => {
  ElMessageBox.confirm("确定要保存配置吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      ElMessage.success("配置保存成功");
      testPassed.value = false;
      completedSteps.value = totalSteps.value;
    })
    .catch(() => {});
};

const handleReset = () => {
  configFormRef.value?.resetFields();
  testPassed.value = false;
  testResults.value = [
    { name: "连通性", passed: false, message: "" },
    { name: "协议握手", passed: false, message: "" },
    { name: "数据采集", passed: false, message: "" }
  ];
  completedSteps.value = 0;
  ElMessage.info("已重置");
};

const viewHistoryDetail = (record: any) => {
  currentHistoryRecord.value = record;
  historyDetailVisible.value = true;
};
</script>

<style scoped lang="scss">
.connection-setup {
  padding: 20px;

  .setup-container {
    height: calc(100vh - 250px);
  }

  .device-list-panel,
  .config-panel,
  .test-panel {
    height: 100%;

    :deep(.el-card) {
      height: 100%;
      display: flex;
      flex-direction: column;

      .el-card__body {
        flex: 1;
        overflow: auto;
      }
    }
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-input {
    margin-bottom: 15px;
  }

  .device-tree {
    flex: 1;
    overflow: auto;

    .tree-node {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;

      .node-label {
        flex: 1;
      }

      .status-tag {
        margin-left: 10px;
      }
    }
  }

  .config-form {
    .el-divider {
      margin: 20px 0;
    }
  }

  .action-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .test-results {
    .test-item {
      margin-bottom: 15px;
      padding: 10px;
      background: #f5f7fa;
      border-radius: 4px;

      .test-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;

        .test-name {
          font-weight: 500;
        }

        .success-icon {
          color: #67c23a;
        }

        .fail-icon {
          color: #f56c6c;
        }
      }

      .test-message {
        font-size: 12px;
        color: #f56c6c;
        margin-top: 5px;
      }
    }
  }

  .history-list {
    max-height: 200px;
    overflow-y: auto;

    .history-item {
      padding: 10px 0;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      .history-time {
        font-size: 12px;
        color: #909399;
        margin-bottom: 5px;
      }

      .history-result {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 5px;

        .history-operator {
          font-size: 12px;
          color: #606266;
        }
      }
    }
  }

  .progress-card {
    margin-top: 20px;

    .progress-info {
      display: flex;
      align-items: center;
      gap: 15px;

      :deep(.el-progress) {
        flex: 1;
      }
    }
  }
}
</style>
