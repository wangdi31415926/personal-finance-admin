<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑邮件服务器' : '新建邮件服务器'"
    width="1200px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="form-container">
      <!-- 左侧表单区域 -->
      <div class="form-section">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="140px"
          label-position="right"
        >
          <el-form-item label="服务器名称" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="请输入服务器名称"
              clearable
            />
          </el-form-item>

          <el-form-item label="SMTP服务器地址" prop="smtpHost">
            <el-input
              v-model="formData.smtpHost"
              placeholder="例如：smtp.qq.com"
              clearable
            />
          </el-form-item>

          <el-form-item label="端口" prop="port">
            <el-input-number
              v-model="formData.port"
              :min="1"
              :max="65535"
              placeholder="端口号"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="加密方式" prop="encryption">
            <el-radio-group v-model="formData.encryption">
              <el-radio label="none">无</el-radio>
              <el-radio label="tls">TLS</el-radio>
              <el-radio label="ssl">SSL</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="认证方式" prop="authType">
            <el-radio-group v-model="formData.authType">
              <el-radio label="password">用户名密码</el-radio>
              <el-radio label="oauth2" disabled>OAuth 2.0（暂不支持）</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="用户名/邮箱" prop="username">
            <el-input
              v-model="formData.username"
              placeholder="请输入邮箱地址"
              clearable
            />
          </el-form-item>

          <el-form-item label="密码/授权码" prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码或授权码"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item label="发件人别名" prop="senderAlias">
            <el-input
              v-model="formData.senderAlias"
              placeholder="例如：翼金科技智能运维平台"
              clearable
            />
          </el-form-item>

          <!-- 高级选项 -->
          <el-collapse v-model="activeCollapse" class="advanced-options">
            <el-collapse-item title="高级选项" name="advanced">
              <el-form-item label="并发连接数" prop="maxConnections">
                <el-input-number
                  v-model="formData.maxConnections"
                  :min="1"
                  :max="100"
                  placeholder="最大并发连接数"
                  style="width: 100%"
                />
                <div class="form-tip">限制单台邮件服务器的最大并发连接数</div>
              </el-form-item>

              <el-form-item label="发送速率限制">
                <el-row :gutter="10">
                  <el-col :span="12">
                    <el-form-item prop="rateLimitPerMinute">
                      <el-input-number
                        v-model="formData.rateLimitPerMinute"
                        :min="1"
                        placeholder="每分钟"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item prop="rateLimitPerHour">
                      <el-input-number
                        v-model="formData.rateLimitPerHour"
                        :min="1"
                        placeholder="每小时"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <div class="form-tip">设置每分钟/每小时的最大发送量</div>
              </el-form-item>

              <el-form-item label="重试机制">
                <el-row :gutter="10">
                  <el-col :span="12">
                    <el-form-item prop="maxRetries">
                      <el-input-number
                        v-model="formData.maxRetries"
                        :min="0"
                        :max="10"
                        placeholder="最大重试次数"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item prop="retryInterval">
                      <el-input-number
                        v-model="formData.retryInterval"
                        :min="1"
                        placeholder="重试间隔(秒)"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <div class="form-tip">针对临时性发送失败自动进行重试</div>
              </el-form-item>
            </el-collapse-item>
          </el-collapse>
        </el-form>
      </div>

      <!-- 右侧测试面板 -->
      <div class="test-panel">
        <div class="test-panel-header">
          <h3>连接测试</h3>
        </div>
        <div class="test-panel-content">
          <el-button
            type="primary"
            size="large"
            :loading="testing"
            @click="handleTestConnection"
            style="width: 100%; margin-bottom: 20px"
          >
            <el-icon><Connection /></el-icon>
            测试连接
          </el-button>

          <div class="test-log">
            <div
              v-for="(log, index) in testLogs"
              :key="index"
              :class="['log-item', log.type]"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
            <div v-if="testLogs.length === 0" class="log-empty">
              点击"测试连接"按钮开始测试
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存并启用
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Connection } from "@element-plus/icons-vue";

interface EmailServerFormData {
  name?: string;
  smtpHost?: string;
  port?: number;
  encryption?: "none" | "tls" | "ssl";
  authType?: "password" | "oauth2";
  username?: string;
  password?: string;
  senderAlias?: string;
  maxConnections?: number;
  rateLimitPerMinute?: number;
  rateLimitPerHour?: number;
  maxRetries?: number;
  retryInterval?: number;
}

interface TestLog {
  time: string;
  message: string;
  type: "info" | "success" | "error";
}

const props = defineProps<{
  modelValue: boolean;
  formData?: Partial<EmailServerFormData>;
  isEdit?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  refresh: [];
}>();

const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const testing = ref(false);
const saving = ref(false);
const activeCollapse = ref<string[]>([]);
const testLogs = ref<TestLog[]>([]);

const formData = reactive<EmailServerFormData>({
  name: "",
  smtpHost: "",
  port: 587,
  encryption: "tls",
  authType: "password",
  username: "",
  password: "",
  senderAlias: "翼金科技智能运维平台",
  maxConnections: 10,
  rateLimitPerMinute: 60,
  rateLimitPerHour: 1000,
  maxRetries: 3,
  retryInterval: 5
});

const rules: FormRules = {
  name: [{ required: true, message: "请输入服务器名称", trigger: "blur" }],
  smtpHost: [
    { required: true, message: "请输入SMTP服务器地址", trigger: "blur" }
  ],
  port: [{ required: true, message: "请输入端口号", trigger: "blur" }],
  encryption: [
    { required: true, message: "请选择加密方式", trigger: "change" }
  ],
  authType: [{ required: true, message: "请选择认证方式", trigger: "change" }],
  username: [{ required: true, message: "请输入用户名/邮箱", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码/授权码", trigger: "blur" }]
};

// 监听弹窗显示状态
watch(
  () => props.modelValue,
  val => {
    dialogVisible.value = val;
    if (val && props.formData) {
      Object.assign(formData, {
        port: 587,
        encryption: "tls",
        authType: "password",
        senderAlias: "翼金科技智能运维平台",
        maxConnections: 10,
        rateLimitPerMinute: 60,
        rateLimitPerHour: 1000,
        maxRetries: 3,
        retryInterval: 5,
        ...props.formData
      });
      testLogs.value = [];
    }
  }
);

watch(dialogVisible, val => {
  if (!val) {
    emit("update:modelValue", false);
  }
});

const addTestLog = (
  message: string,
  type: "info" | "success" | "error" = "info"
) => {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
  testLogs.value.push({ time, message, type });
};

const handleTestConnection = async () => {
  // 验证表单
  if (!formRef.value) return;
  await formRef.value.validateField(
    ["smtpHost", "port", "username", "password"],
    valid => {
      if (!valid) {
        ElMessage.warning("请先填写必填项");
        return;
      }
    }
  );

  testing.value = true;
  testLogs.value = [];

  // 模拟测试连接过程
  addTestLog("开始连接测试...", "info");

  await new Promise(resolve => setTimeout(resolve, 500));
  addTestLog(`正在连接服务器 ${formData.smtpHost}:${formData.port}...`, "info");

  await new Promise(resolve => setTimeout(resolve, 800));
  addTestLog("服务器连接成功", "success");

  await new Promise(resolve => setTimeout(resolve, 500));
  addTestLog("正在验证加密方式...", "info");

  await new Promise(resolve => setTimeout(resolve, 600));
  if (formData.encryption === "none") {
    addTestLog("警告：未启用加密，建议使用TLS或SSL", "error");
  } else {
    addTestLog(
      `加密方式 ${formData.encryption?.toUpperCase()} 验证成功`,
      "success"
    );
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  addTestLog("正在验证用户名和密码...", "info");

  await new Promise(resolve => setTimeout(resolve, 800));

  // 模拟测试结果（90%成功率）
  const testSuccess = Math.random() > 0.1;
  if (testSuccess) {
    addTestLog("认证成功！", "success");
    await new Promise(resolve => setTimeout(resolve, 300));
    addTestLog("连接测试通过。", "success");
    ElMessage.success("连接测试成功");
  } else {
    addTestLog("认证失败：用户名或密码错误", "error");
    ElMessage.error("连接测试失败：用户名或密码错误");
  }

  testing.value = false;
};

const handleSave = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(valid => {
    if (valid) {
      saving.value = true;
      // 模拟保存
      setTimeout(() => {
        saving.value = false;
        ElMessage.success(props.isEdit ? "更新成功" : "创建成功");
        emit("refresh");
        handleClose();
      }, 1000);
    }
  });
};

const handleClose = () => {
  dialogVisible.value = false;
  if (formRef.value) {
    formRef.value.resetFields();
  }
  testLogs.value = [];
  Object.assign(formData, {
    name: "",
    smtpHost: "",
    port: 587,
    encryption: "tls",
    authType: "password",
    username: "",
    password: "",
    senderAlias: "翼金科技智能运维平台",
    maxConnections: 10,
    rateLimitPerMinute: 60,
    rateLimitPerHour: 1000,
    maxRetries: 3,
    retryInterval: 5
  });
};
</script>

<style scoped lang="scss">
.form-container {
  display: flex;
  gap: 20px;
  min-height: 500px;
}

.form-section {
  flex: 1;
  padding-right: 20px;
  border-right: 1px solid #e4e7ed;

  .advanced-options {
    margin-top: 10px;

    :deep(.el-collapse-item__header) {
      font-weight: 500;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }
}

.test-panel {
  width: 350px;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  border-radius: 4px;
  padding: 20px;

  .test-panel-header {
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .test-panel-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .test-log {
    flex: 1;
    background: #fff;
    border-radius: 4px;
    padding: 15px;
    max-height: 400px;
    overflow-y: auto;
    font-family: "Courier New", monospace;
    font-size: 13px;

    .log-item {
      display: flex;
      gap: 10px;
      margin-bottom: 8px;
      line-height: 1.6;

      &.info {
        color: #606266;
      }

      &.success {
        color: #67c23a;
      }

      &.error {
        color: #f56c6c;
      }

      .log-time {
        color: #909399;
        min-width: 70px;
      }

      .log-message {
        flex: 1;
      }
    }

    .log-empty {
      color: #c0c4cc;
      text-align: center;
      padding: 40px 0;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}
</style>
