<template>
  <div class="ai-task-create">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">AI任务创建</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="140px"
        class="task-form"
      >
        <el-form-item label="任务名称" prop="taskName">
          <el-input
            v-model="formData.taskName"
            placeholder="请输入任务名称，如：告警-【告警标题】-【时间】"
            style="width: 500px"
          />
        </el-form-item>

        <el-form-item label="关联事件" prop="alertId">
          <el-select
            v-model="formData.alertId"
            placeholder="请选择关联的告警事件"
            filterable
            style="width: 500px"
            @change="handleAlertChange"
          >
            <el-option
              v-for="alert in alertOptions"
              :key="alert.id"
              :label="`${alert.title} (${alert.id})`"
              :value="alert.id"
            />
          </el-select>
          <el-button
            type="primary"
            link
            style="margin-left: 10px"
            @click="handleViewAlert"
          >
            查看告警详情
          </el-button>
        </el-form-item>

        <el-form-item label="使用话术" prop="scriptId">
          <el-select
            v-model="formData.scriptId"
            placeholder="请选择话术模板"
            filterable
            style="width: 500px"
          >
            <el-option
              v-for="script in scriptOptions"
              :key="script.id"
              :label="script.name"
              :value="script.id"
            />
          </el-select>
          <el-button
            type="primary"
            link
            style="margin-left: 10px"
            @click="handlePreviewScript"
          >
            预览话术
          </el-button>
        </el-form-item>

        <el-form-item label="目标联系人" prop="contacts">
          <div style="width: 500px">
            <el-button
              type="primary"
              size="small"
              @click="handleSelectContacts"
              style="margin-bottom: 10px"
            >
              <el-icon><Plus /></el-icon>
              选择联系人
            </el-button>
            <el-table :data="formData.contacts" border style="width: 100%">
              <el-table-column prop="name" label="姓名" width="120" />
              <el-table-column prop="phone" label="手机号" width="150" />
              <el-table-column prop="department" label="部门" />
              <el-table-column label="操作" width="100">
                <template #default="{ $index }">
                  <el-button
                    link
                    type="danger"
                    size="small"
                    @click="handleRemoveContact($index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>

        <el-form-item label="呼叫策略">
          <el-card shadow="never" style="width: 500px">
            <el-form-item label="重呼策略" prop="retryStrategy">
              <el-radio-group v-model="formData.retryStrategy">
                <el-radio label="default">使用系统默认</el-radio>
                <el-radio label="custom">自定义</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="formData.retryStrategy === 'custom'"
              label="重试次数"
              prop="retryCount"
            >
              <el-input-number
                v-model="formData.retryCount"
                :min="1"
                :max="5"
                style="width: 150px"
              />
              <span style="margin-left: 10px; color: #909399">次</span>
            </el-form-item>
            <el-form-item
              v-if="formData.retryStrategy === 'custom'"
              label="重试间隔"
              prop="retryInterval"
            >
              <el-input-number
                v-model="formData.retryInterval"
                :min="1"
                :max="60"
                style="width: 150px"
              />
              <span style="margin-left: 10px; color: #909399">分钟</span>
            </el-form-item>
            <el-form-item label="呼叫时间窗口">
              <el-radio-group v-model="formData.callTimeWindow">
                <el-radio label="immediate">立即呼叫</el-radio>
                <el-radio label="workday">仅工作日 9:00-18:00</el-radio>
                <el-radio label="custom">自定义</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="formData.callTimeWindow === 'custom'"
              label="时间范围"
            >
              <el-time-picker
                v-model="formData.customTimeRange"
                is-range
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="HH:mm"
                value-format="HH:mm"
              />
            </el-form-item>
          </el-card>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（可选）"
            style="width: 500px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            创建任务
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 选择联系人弹窗 -->
    <el-dialog v-model="contactDialogVisible" title="选择联系人" width="800px">
      <div class="contact-selector">
        <el-input
          v-model="contactSearchKeyword"
          placeholder="搜索姓名、手机号或部门"
          style="margin-bottom: 15px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-table
          :data="filteredContactList"
          border
          @selection-change="handleContactSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="phone" label="手机号" width="150" />
          <el-table-column prop="department" label="部门" />
          <el-table-column prop="position" label="职位" />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="contactDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmContacts"
          >确定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Plus, Search } from "@element-plus/icons-vue";

interface Contact {
  id: string;
  name: string;
  phone: string;
  department: string;
  position?: string;
}

interface AlertOption {
  id: string;
  title: string;
  level: string;
}

interface ScriptOption {
  id: string;
  name: string;
}

const router = useRouter();
const formRef = ref<FormInstance>();
const submitting = ref(false);
const contactDialogVisible = ref(false);
const contactSearchKeyword = ref("");
const selectedContacts = ref<Contact[]>([]);

const formData = reactive({
  taskName: "",
  alertId: "",
  scriptId: "",
  contacts: [] as Contact[],
  retryStrategy: "default",
  retryCount: 3,
  retryInterval: 5,
  callTimeWindow: "immediate",
  customTimeRange: null as [string, string] | null,
  remark: ""
});

const rules: FormRules = {
  taskName: [{ required: true, message: "请输入任务名称", trigger: "blur" }],
  alertId: [{ required: true, message: "请选择关联事件", trigger: "change" }],
  scriptId: [{ required: true, message: "请选择话术模板", trigger: "change" }],
  contacts: [
    {
      required: true,
      type: "array",
      min: 1,
      message: "请至少选择一个联系人",
      trigger: "change"
    }
  ]
};

// 测试数据
const alertOptions = ref<AlertOption[]>([
  { id: "ALERT-2024-001", title: "核心路由器宕机", level: "P0" },
  { id: "ALERT-2024-002", title: "服务器CPU使用率超过90%", level: "P1" },
  { id: "ALERT-2024-003", title: "数据库连接池耗尽", level: "P1" }
]);

const scriptOptions = ref<ScriptOption[]>([
  { id: "1", name: "紧急故障通知话术" },
  { id: "2", name: "性能告警通知话术" },
  { id: "3", name: "系统告警通知话术" },
  { id: "4", name: "网络告警通知话术" }
]);

const contactList = ref<Contact[]>([
  {
    id: "1",
    name: "张三",
    phone: "13800138000",
    department: "运维部",
    position: "运维工程师"
  },
  {
    id: "2",
    name: "李四",
    phone: "13900139000",
    department: "开发部",
    position: "高级开发"
  },
  {
    id: "3",
    name: "王五",
    phone: "13700137000",
    department: "运维部",
    position: "运维经理"
  },
  {
    id: "4",
    name: "赵六",
    phone: "13600136000",
    department: "测试部",
    position: "测试工程师"
  }
]);

const filteredContactList = computed(() => {
  if (!contactSearchKeyword.value) {
    return contactList.value;
  }
  const keyword = contactSearchKeyword.value.toLowerCase();
  return contactList.value.filter(
    contact =>
      contact.name.toLowerCase().includes(keyword) ||
      contact.phone.includes(keyword) ||
      contact.department.toLowerCase().includes(keyword)
  );
});

const handleAlertChange = (alertId: string) => {
  const alert = alertOptions.value.find(a => a.id === alertId);
  if (alert && !formData.taskName) {
    // 自动生成任务名称
    const now = new Date();
    formData.taskName = `告警-【${alert.title}】-${now.toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}`;
  }
};

const handleViewAlert = () => {
  if (!formData.alertId) {
    ElMessage.warning("请先选择关联事件");
    return;
  }
  ElMessage.info(`查看告警详情: ${formData.alertId}`);
};

const handlePreviewScript = () => {
  if (!formData.scriptId) {
    ElMessage.warning("请先选择话术模板");
    return;
  }
  ElMessage.info("预览话术功能开发中");
};

const handleSelectContacts = () => {
  contactDialogVisible.value = true;
  selectedContacts.value = [];
};

const handleContactSelectionChange = (selection: Contact[]) => {
  selectedContacts.value = selection;
};

const handleConfirmContacts = () => {
  // 合并已选择的联系人，避免重复
  const existingIds = new Set(formData.contacts.map(c => c.id));
  const newContacts = selectedContacts.value.filter(
    c => !existingIds.has(c.id)
  );
  formData.contacts.push(...newContacts);
  contactDialogVisible.value = false;
  ElMessage.success(`已添加 ${newContacts.length} 个联系人`);
};

const handleRemoveContact = (index: number) => {
  formData.contacts.splice(index, 1);
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(valid => {
    if (valid) {
      submitting.value = true;
      // 模拟API调用
      setTimeout(() => {
        submitting.value = false;
        ElMessage.success("任务创建成功");
        router.push("/call/ai-task");
      }, 1000);
    }
  });
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.ai-task-create {
  padding: 20px;
  height: 100%;

  .card-header {
    .title {
      font-size: 18px;
      font-weight: bold;
    }
  }

  .task-form {
    max-width: 800px;

    :deep(.el-form-item__label) {
      font-weight: 500;
    }
  }

  .contact-selector {
    max-height: 400px;
    overflow-y: auto;
  }
}
</style>
