<template>
  <div class="email-server-list">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建邮件服务器
      </el-button>
    </div>

    <!-- 邮件服务器列表表格 -->
    <el-table
      :data="serverList"
      style="width: 100%"
      v-loading="loading"
      stripe
      border
    >
      <el-table-column prop="name" label="服务器名称" width="180" />
      <el-table-column prop="smtpHost" label="SMTP地址" width="200" />
      <el-table-column prop="senderEmail" label="发件人邮箱" width="200" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === '正常' ? 'success' : 'danger'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastCheckTime" label="最近检测时间" width="180" />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            size="small"
            @click="handleEdit(row)"
            title="编辑"
          >
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button
            link
            type="success"
            size="small"
            @click="handleTestConnection(row)"
            title="测试连接"
          >
            <el-icon><Connection /></el-icon>
            测试连接
          </el-button>
          <el-button
            link
            type="danger"
            size="small"
            @click="handleDelete(row)"
            title="删除"
          >
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑表单弹窗 -->
    <EmailServerForm
      v-model="formVisible"
      :form-data="currentFormData"
      :is-edit="isEdit"
      @refresh="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Edit, Delete, Connection } from "@element-plus/icons-vue";
import EmailServerForm from "./EmailServerForm.vue";

interface EmailServer {
  id: string;
  name: string;
  smtpHost: string;
  senderEmail: string;
  status: "正常" | "异常";
  lastCheckTime: string;
}

const loading = ref(false);
const formVisible = ref(false);
const isEdit = ref(false);
const currentFormData = ref<Partial<EmailServer>>({});

// 测试数据
const serverList = ref<EmailServer[]>([
  {
    id: "1",
    name: "主邮件服务器",
    smtpHost: "smtp.qq.com",
    senderEmail: "system@example.com",
    status: "正常",
    lastCheckTime: "2024-01-15 10:30:25"
  },
  {
    id: "2",
    name: "备用邮件服务器",
    smtpHost: "smtp.163.com",
    senderEmail: "backup@example.com",
    status: "正常",
    lastCheckTime: "2024-01-15 09:15:10"
  },
  {
    id: "3",
    name: "测试邮件服务器",
    smtpHost: "smtp.gmail.com",
    senderEmail: "test@example.com",
    status: "异常",
    lastCheckTime: "2024-01-14 16:45:30"
  }
]);

const handleCreate = () => {
  isEdit.value = false;
  currentFormData.value = {};
  formVisible.value = true;
};

const handleEdit = (row: EmailServer) => {
  isEdit.value = true;
  currentFormData.value = { ...row };
  formVisible.value = true;
};

const handleTestConnection = async (row: EmailServer) => {
  loading.value = true;
  // 模拟测试连接
  await new Promise(resolve => setTimeout(resolve, 1500));
  loading.value = false;

  if (row.status === "正常") {
    ElMessage.success(`服务器 "${row.name}" 连接测试成功`);
  } else {
    ElMessage.error(`服务器 "${row.name}" 连接测试失败`);
  }
};

const handleDelete = (row: EmailServer) => {
  ElMessageBox.confirm(`确定要删除邮件服务器 "${row.name}" 吗？`, "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      const index = serverList.value.findIndex(item => item.id === row.id);
      if (index > -1) {
        serverList.value.splice(index, 1);
        ElMessage.success("删除成功");
      }
    })
    .catch(() => {
      // 用户取消
    });
};

const handleRefresh = () => {
  // 刷新列表数据
  ElMessage.success("操作成功");
};

onMounted(() => {
  // 初始化数据
});
</script>

<style scoped lang="scss">
.email-server-list {
  .toolbar {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-start;
  }

  :deep(.el-table) {
    .status-danger {
      color: #f56c6c;
    }
  }
}
</style>
