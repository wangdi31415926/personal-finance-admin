<template>
  <el-dialog
    v-model="dialogVisible"
    title="AI任务创建"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
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
        <el-radio-group v-model="formData.callStrategy">
          <el-radio label="immediate">立即呼叫</el-radio>
          <el-radio label="workday">仅工作日 9:00-18:00</el-radio>
          <el-radio label="custom">自定义时间窗口</el-radio>
        </el-radio-group>
        <el-time-picker
          v-if="formData.callStrategy === 'custom'"
          v-model="formData.customTimeRange"
          is-range
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="HH:mm"
          value-format="HH:mm"
          style="margin-left: 10px; width: 300px"
        />
      </el-form-item>

      <el-form-item label="重呼策略">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input-number
              v-model="formData.retryCount"
              :min="0"
              :max="5"
              label="重试次数"
              style="width: 100%"
            />
            <div style="font-size: 12px; color: #909399; margin-top: 5px">
              最多重试次数
            </div>
          </el-col>
          <el-col :span="8">
            <el-input-number
              v-model="formData.retryInterval"
              :min="1"
              :max="60"
              label="重试间隔（分钟）"
              style="width: 100%"
            />
            <div style="font-size: 12px; color: #909399; margin-top: 5px">
              两次重试之间的间隔
            </div>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
          style="width: 500px"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        创建任务
      </el-button>
    </template>

    <!-- 选择联系人弹窗 -->
    <el-dialog
      v-model="contactDialogVisible"
      title="选择联系人"
      width="600px"
      append-to-body
    >
      <el-input
        v-model="contactSearchKeyword"
        placeholder="搜索联系人"
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
      <template #footer>
        <el-button @click="contactDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmContacts"
          >确定</el-button
        >
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import { Plus, Search } from "@element-plus/icons-vue";

interface Contact {
  id: string;
  name: string;
  phone: string;
  department: string;
  position: string;
}

interface Alert {
  id: string;
  title: string;
}

interface Script {
  id: string;
  name: string;
}

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: val => emit("update:modelValue", val)
});

const formRef = ref();
const submitting = ref(false);
const contactDialogVisible = ref(false);
const contactSearchKeyword = ref("");
const selectedContacts = ref<Contact[]>([]);

const formData = reactive({
  taskName: "",
  alertId: "",
  scriptId: "",
  contacts: [] as Contact[],
  callStrategy: "immediate",
  customTimeRange: [] as string[],
  retryCount: 3,
  retryInterval: 5,
  remark: ""
});

const rules = {
  taskName: [{ required: true, message: "请输入任务名称", trigger: "blur" }],
  alertId: [{ required: true, message: "请选择关联事件", trigger: "change" }],
  scriptId: [{ required: true, message: "请选择话术模板", trigger: "change" }],
  contacts: [
    { required: true, message: "请至少选择一个联系人", trigger: "change" },
    {
      validator: (rule: any, value: Contact[], callback: Function) => {
        if (!value || value.length === 0) {
          callback(new Error("请至少选择一个联系人"));
        } else {
          callback();
        }
      },
      trigger: "change"
    }
  ]
};

// 测试数据
const alertOptions: Alert[] = [
  { id: "ALERT-2024-001", title: "核心路由器宕机" },
  { id: "ALERT-2024-002", title: "服务器CPU使用率超过90%" },
  { id: "ALERT-2024-003", title: "数据库连接池耗尽" },
  { id: "ALERT-2024-004", title: "网络延迟异常" },
  { id: "ALERT-2024-005", title: "存储空间不足" }
];

const scriptOptions: Script[] = [
  { id: "SCRIPT-001", name: "紧急故障通知话术" },
  { id: "SCRIPT-002", name: "性能告警通知话术" },
  { id: "SCRIPT-003", name: "系统告警通知话术" },
  { id: "SCRIPT-004", name: "网络告警通知话术" },
  { id: "SCRIPT-005", name: "存储告警通知话术" }
];

const contactList: Contact[] = [
  {
    id: "1",
    name: "张三",
    phone: "13800138000",
    department: "运维部",
    position: "高级工程师"
  },
  {
    id: "2",
    name: "李四",
    phone: "13900139000",
    department: "运维部",
    position: "工程师"
  },
  {
    id: "3",
    name: "王五",
    phone: "13700137000",
    department: "开发部",
    position: "架构师"
  },
  {
    id: "4",
    name: "赵六",
    phone: "13600136000",
    department: "运维部",
    position: "主管"
  },
  {
    id: "5",
    name: "孙七",
    phone: "13500135000",
    department: "安全部",
    position: "安全专家"
  },
  {
    id: "6",
    name: "周八",
    phone: "13400134000",
    department: "运维部",
    position: "工程师"
  },
  {
    id: "7",
    name: "吴九",
    phone: "13300133000",
    department: "开发部",
    position: "高级工程师"
  },
  {
    id: "8",
    name: "郑十",
    phone: "13200132000",
    department: "运维部",
    position: "工程师"
  }
];

const filteredContactList = computed(() => {
  if (!contactSearchKeyword.value) {
    return contactList;
  }
  const keyword = contactSearchKeyword.value.toLowerCase();
  return contactList.filter(
    contact =>
      contact.name.toLowerCase().includes(keyword) ||
      contact.phone.includes(keyword) ||
      contact.department.toLowerCase().includes(keyword)
  );
});

const handleAlertChange = (alertId: string) => {
  const alert = alertOptions.find(a => a.id === alertId);
  if (alert && !formData.taskName) {
    formData.taskName = `告警-【${alert.title}】-${new Date().toLocaleString("zh-CN")}`;
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
  ElMessage.info("预览话术功能");
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
  contactSearchKeyword.value = "";
};

const handleRemoveContact = (index: number) => {
  formData.contacts.splice(index, 1);
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    ElMessage.success("任务创建成功");
    emit("success");
    handleClose();
  } catch (error) {
    console.error("表单验证失败", error);
  } finally {
    submitting.value = false;
  }
};

const handleClose = () => {
  dialogVisible.value = false;
  // 重置表单
  formRef.value?.resetFields();
  formData.taskName = "";
  formData.alertId = "";
  formData.scriptId = "";
  formData.contacts = [];
  formData.callStrategy = "immediate";
  formData.customTimeRange = [];
  formData.retryCount = 3;
  formData.retryInterval = 5;
  formData.remark = "";
};
</script>

<style scoped lang="scss">
.task-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}
</style>
