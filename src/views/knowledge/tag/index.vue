<template>
  <div class="tag-management">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>标签管理</span>
          <el-button type="primary" @click="handleCreateTagGroup">
            新建标签组
          </el-button>
        </div>
      </template>

      <!-- 标签组列表 -->
      <div class="tag-group-list">
        <el-card
          v-for="group in tagGroups"
          :key="group.id"
          class="tag-group-card"
          shadow="hover"
        >
          <div class="group-header">
            <div class="group-info">
              <span class="group-name">{{ group.name }}</span>
              <el-tag size="small" type="info">
                {{ group.tagCount }}个标签
              </el-tag>
              <el-tag size="small" type="success">
                关联{{ group.knowledgeCount }}条知识
              </el-tag>
            </div>
            <div class="group-actions">
              <el-button link type="primary" @click="handleViewTags(group)">
                查看标签
              </el-button>
              <el-button link type="primary" @click="handleEdit(group)">
                编辑
              </el-button>
              <el-button link type="danger" @click="handleDelete(group)">
                删除
              </el-button>
            </div>
          </div>
          <div class="group-description">{{ group.description }}</div>
          <div class="group-scenes">
            <span class="label">关联场景：</span>
            <el-tag
              v-for="scene in group.scenes"
              :key="scene"
              size="small"
              class="scene-tag"
            >
              {{ scene }}
            </el-tag>
          </div>
          <div class="group-footer">
            <span>创建时间：{{ group.createTime }}</span>
            <span>可见范围：{{ getVisibilityText(group.visibility) }}</span>
          </div>
        </el-card>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="tagGroups.length === 0"
        description="暂无标签组，点击新建标签组开始使用"
      />
    </el-card>

    <!-- 新建标签组弹窗 -->
    <el-dialog v-model="showCreateDialog" title="新建标签组" width="600px">
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="120px"
      >
        <el-form-item label="标签组名称" prop="name">
          <el-input
            v-model="createForm.name"
            placeholder="请输入标签组名称（2-20字）"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="组描述">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入组描述（限100字）"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="关联场景标签">
          <el-select
            v-model="createForm.scenes"
            multiple
            filterable
            placeholder="请选择关联场景"
            style="width: 100%"
          >
            <el-option
              v-for="scene in sceneOptions"
              :key="scene.value"
              :label="scene.label"
              :value="scene.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="可见范围">
          <el-radio-group v-model="createForm.visibility">
            <el-radio label="only_me">仅自己可见</el-radio>
            <el-radio label="specified">指定同事可见</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="createForm.visibility === 'specified'"
          label="选择同事"
        >
          <el-select
            v-model="createForm.colleagues"
            multiple
            placeholder="请选择同事（最多5人）"
            style="width: 100%"
          >
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="创建方式">
          <el-radio-group v-model="createForm.createType">
            <el-radio label="blank">空白创建</el-radio>
            <el-radio label="template">模板导入</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="createForm.createType === 'template'"
          label="选择模板"
        >
          <el-select
            v-model="createForm.template"
            placeholder="请选择模板"
            style="width: 100%"
          >
            <el-option
              v-for="template in templateOptions"
              :key="template.value"
              :label="template.label"
              :value="template.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCreate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

const showCreateDialog = ref(false);
const createFormRef = ref();

const createForm = reactive({
  name: "",
  description: "",
  scenes: [],
  visibility: "only_me",
  colleagues: [],
  createType: "blank",
  template: ""
});

const createRules = {
  name: [
    { required: true, message: "请输入标签组名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ]
};

const sceneOptions = [
  { label: "核心网运维", value: "core" },
  { label: "路由器配置", value: "router" },
  { label: "Linux系统", value: "linux" }
];

const userList = [
  { id: "1", name: "张三" },
  { id: "2", name: "李四" },
  { id: "3", name: "王五" }
];

const templateOptions = [
  { label: "故障处理场景", value: "fault" },
  { label: "设备配置场景", value: "config" },
  { label: "命令集场景", value: "command" }
];

// 测试数据
const tagGroups = ref([
  {
    id: "1",
    name: "故障处理场景",
    description: "用于分类各种故障处理相关的知识",
    tagCount: 8,
    knowledgeCount: 23,
    scenes: ["核心网运维", "路由器配置"],
    createTime: "2025-11-20",
    visibility: "only_me"
  },
  {
    id: "2",
    name: "设备配置场景",
    description: "各类网络设备的配置文档分类",
    tagCount: 12,
    knowledgeCount: 45,
    scenes: ["路由器配置", "Linux系统"],
    createTime: "2025-11-18",
    visibility: "specified"
  }
]);

const getVisibilityText = (visibility: string) => {
  const map: Record<string, string> = {
    only_me: "仅自己可见",
    specified: "指定同事可见"
  };
  return map[visibility] || "";
};

const handleCreateTagGroup = () => {
  showCreateDialog.value = true;
};

const handleSubmitCreate = async () => {
  await createFormRef.value?.validate();
  ElMessage.success("标签组创建成功");
  showCreateDialog.value = false;
  // 重置表单
  Object.assign(createForm, {
    name: "",
    description: "",
    scenes: [],
    visibility: "only_me",
    colleagues: [],
    createType: "blank",
    template: ""
  });
};

const handleViewTags = (group: any) => {
  ElMessage.info(`查看 ${group.name} 的标签`);
};

const handleEdit = (group: any) => {
  ElMessage.info(`编辑 ${group.name}`);
};

const handleDelete = (group: any) => {
  ElMessageBox.confirm(
    `确定要删除标签组"${group.name}"吗？删除将同步移除组内标签与知识的关联。`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  ).then(() => {
    ElMessage.success("删除成功");
  });
};
</script>

<style scoped lang="scss">
.tag-management {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tag-group-list {
    .tag-group-card {
      margin-bottom: 15px;

      .group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        .group-info {
          display: flex;
          align-items: center;
          gap: 10px;

          .group-name {
            font-size: 16px;
            font-weight: bold;
          }
        }

        .group-actions {
          display: flex;
          gap: 10px;
        }
      }

      .group-description {
        color: #606266;
        font-size: 14px;
        margin-bottom: 10px;
      }

      .group-scenes {
        margin-bottom: 10px;

        .label {
          font-size: 14px;
          color: #909399;
          margin-right: 10px;
        }

        .scene-tag {
          margin-right: 5px;
        }
      }

      .group-footer {
        font-size: 12px;
        color: #909399;
        display: flex;
        gap: 20px;
      }
    }
  }
}
</style>
