<template>
  <el-dialog
    v-model="dialogVisible"
    title="AI任务编辑"
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
          placeholder="请输入任务名称"
          style="width: 500px"
          :disabled="!canEdit"
        />
      </el-form-item>

      <el-form-item label="关联事件">
        <el-input :value="formData.alertTitle" disabled style="width: 500px" />
      </el-form-item>

      <el-form-item label="使用话术" prop="scriptId">
        <el-select
          v-model="formData.scriptId"
          placeholder="请选择话术模板"
          filterable
          style="width: 500px"
          :disabled="!canEdit"
        >
          <el-option
            v-for="script in scriptOptions"
            :key="script.id"
            :label="script.name"
            :value="script.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="目标联系人" prop="contacts">
        <div style="width: 500px">
          <el-button
            v-if="canEdit"
            type="primary"
            size="small"
            @click="handleSelectContacts"
            style="margin-bottom: 10px"
          >
            <el-icon><Plus /></el-icon>
            添加联系人
          </el-button>
          <el-table :data="formData.contacts" border style="width: 100%">
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="phone" label="手机号" width="150" />
            <el-table-column prop="department" label="部门" />
            <el-table-column label="操作" width="100">
              <template #default="{ $index }">
                <el-button
                  v-if="canEdit"
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
        <el-radio-group v-model="formData.callStrategy" :disabled="!canEdit">
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
          :disabled="!canEdit"
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
              :disabled="!canEdit"
            />
          </el-col>
          <el-col :span="8">
            <el-input-number
              v-model="formData.retryInterval"
              :min="1"
              :max="60"
              label="重试间隔（分钟）"
              style="width: 100%"
              :disabled="!canEdit"
            />
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="任务状态">
        <el-tag :type="getStatusType(formData.status)">
          {{ getStatusText(formData.status) }}
        </el-tag>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
          style="width: 500px"
          :disabled="!canEdit"
        />
      </el-form-item>

      <!-- 审计日志 -->
      <el-form-item label="修改记录" v-if="auditLogs.length > 0">
        <el-timeline style="width: 500px">
          <el-timeline-item
            v-for="log in auditLogs"
            :key="log.id"
            :timestamp="log.time"
            placement="top"
          >
            <div>
              <div style="font-weight: 500">
                {{ log.operator }} 修改了 {{ log.field }}
              </div>
              <div style="font-size: 12px; color: #909399; margin-top: 5px">
                从 "{{ log.oldValue }}" 改为 "{{ log.newValue }}"
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        v-if="canEdit"
        type="primary"
        @click="handleSubmit"
        :loading="submitting"
      >
        保存修改
      </el-button>
      <el-button
        v-if="formData.status === 'calling'"
        type="danger"
        @click="handleTerminate"
      >
        终止呼叫
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
import { ref, reactive, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Search } from "@element-plus/icons-vue";

interface Contact {
  id: string;
  name: string;
  phone: string;
  department: string;
  position: string;
}

interface Script {
  id: string;
  name: string;
}

interface AuditLog {
  id: string;
  operator: string;
  time: string;
  field: string;
  oldValue: string;
  newValue: string;
}

const props = defineProps<{
  modelValue: boolean;
  taskId: string;
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
  alertTitle: "",
  scriptId: "",
  contacts: [] as Contact[],
  callStrategy: "immediate",
  customTimeRange: [] as string[],
  retryCount: 3,
  retryInterval: 5,
  remark: "",
  status: "pending" as "pending" | "calling" | "completed" | "failed"
});

const auditLogs = ref<AuditLog[]>([]);

const canEdit = computed(() => {
  return formData.status === "pending" || formData.status === "calling";
});

const rules = {
  taskName: [{ required: true, message: "请输入任务名称", trigger: "blur" }],
  scriptId: [{ required: true, message: "请选择话术模板", trigger: "change" }],
  contacts: [
    { required: true, message: "请至少选择一个联系人", trigger: "change" }
  ]
};

// 测试数据
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

// 加载任务数据
const loadTaskData = async () => {
  if (!props.taskId) return;

  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 500));

  // 模拟数据
  const taskData = {
    taskName: "告警-【核心路由器宕机】-2024-01-15 14:30",
    alertId: "ALERT-2024-001",
    alertTitle: "核心路由器宕机",
    scriptId: "SCRIPT-001",
    contacts: [
      {
        id: "1",
        name: "张三",
        phone: "13800138000",
        department: "运维部",
        position: "高级工程师"
      }
    ],
    callStrategy: "immediate",
    customTimeRange: [],
    retryCount: 3,
    retryInterval: 5,
    remark: "紧急故障，需要立即处理",
    status: "calling" as const
  };

  Object.assign(formData, taskData);

  // 模拟审计日志
  auditLogs.value = [
    {
      id: "1",
      operator: "管理员",
      time: "2024-01-15 14:35:20",
      field: "重试次数",
      oldValue: "2",
      newValue: "3"
    },
    {
      id: "2",
      operator: "系统",
      time: "2024-01-15 14:30:25",
      field: "任务状态",
      oldValue: "待呼叫",
      newValue: "呼叫中"
    }
  ];
};

watch(
  () => props.modelValue,
  val => {
    if (val && props.taskId) {
      loadTaskData();
    }
  }
);

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "info",
    calling: "warning",
    completed: "success",
    failed: "danger"
  };
  return statusMap[status] || "info";
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "待呼叫",
    calling: "呼叫中",
    completed: "已完成",
    failed: "已失败"
  };
  return statusMap[status] || status;
};

const handleSelectContacts = () => {
  contactDialogVisible.value = true;
  selectedContacts.value = [];
};

const handleContactSelectionChange = (selection: Contact[]) => {
  selectedContacts.value = selection;
};

const handleConfirmContacts = () => {
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

    ElMessage.success("任务修改成功");
    emit("success");
    handleClose();
  } catch (error) {
    console.error("表单验证失败", error);
  } finally {
    submitting.value = false;
  }
};

const handleTerminate = () => {
  ElMessageBox.confirm("确定要终止当前呼叫吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      ElMessage.success("呼叫已终止");
      formData.status = "failed";
      emit("success");
    })
    .catch(() => {});
};

const handleClose = () => {
  dialogVisible.value = false;
};
</script>

<style scoped lang="scss">
.task-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}
</style>
