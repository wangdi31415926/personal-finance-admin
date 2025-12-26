<template>
  <div class="personal-knowledge-create">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>新建个人知识库</span>
          <el-steps :active="currentStep" finish-status="success" align-center>
            <el-step title="基本信息" />
            <el-step title="安全设置" />
            <el-step title="其他配置" />
          </el-steps>
        </div>
      </template>

      <!-- 基本信息 -->
      <div v-show="currentStep === 0" class="step-content">
        <el-form
          ref="basicFormRef"
          :model="basicForm"
          :rules="basicRules"
          label-width="120px"
        >
          <el-divider content-position="left">必填信息</el-divider>
          <el-form-item label="知识库名称" prop="name">
            <el-input
              v-model="basicForm.name"
              placeholder="请输入知识库名称（2-30字）"
              maxlength="30"
              show-word-limit
              style="width: 500px"
            />
          </el-form-item>

          <el-form-item label="知识类型" prop="type">
            <el-select
              v-model="basicForm.type"
              placeholder="请选择知识类型"
              filterable
              style="width: 500px"
            >
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-divider content-position="left">选填信息</el-divider>
          <el-form-item label="知识描述">
            <el-input
              v-model="basicForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入知识描述（限300字）"
              maxlength="300"
              show-word-limit
              style="width: 500px"
            />
          </el-form-item>

          <el-form-item label="关联场景">
            <el-input
              v-model="basicForm.scene"
              placeholder="如：Linux系统"
              style="width: 500px"
            />
          </el-form-item>

          <el-form-item label="知识来源">
            <el-radio-group v-model="basicForm.source">
              <el-radio label="original">个人原创</el-radio>
              <el-radio label="shared">共享库摘录</el-radio>
              <el-radio label="expert">专家指导</el-radio>
              <el-radio label="network">网络搜集</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="默认排序">
            <el-radio-group v-model="basicForm.sortType">
              <el-radio label="update">更新时间</el-radio>
              <el-radio label="create">添加时间</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-divider content-position="left">快速导入</el-divider>
          <el-form-item label="本地导入">
            <el-upload
              :file-list="fileList"
              :auto-upload="false"
              :on-change="handleFileChange"
              accept=".txt,.doc,.docx,.xls,.xlsx"
              drag
              multiple
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">支持 TXT、Word、Excel 格式</div>
              </template>
            </el-upload>
          </el-form-item>

          <el-form-item label="从共享库同步">
            <el-select
              v-model="basicForm.sharedLibrary"
              placeholder="请选择共享知识库"
              filterable
              style="width: 500px"
            >
              <el-option
                v-for="item in sharedLibraries"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 安全设置 -->
      <div v-show="currentStep === 1" class="step-content">
        <el-form
          ref="securityFormRef"
          :model="securityForm"
          label-width="150px"
        >
          <el-row :gutter="40">
            <el-col :span="12">
              <el-divider content-position="left">可见范围配置</el-divider>
              <el-form-item label="可见范围">
                <el-radio-group v-model="securityForm.visibility">
                  <el-radio label="only_me">仅自己可见</el-radio>
                  <el-radio label="specified">指定人员可见</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item
                v-if="securityForm.visibility === 'specified'"
                label="选择人员"
              >
                <el-select
                  v-model="securityForm.selectedUsers"
                  multiple
                  placeholder="请选择人员（最多10人）"
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

              <el-divider content-position="left">个人操作安全保护</el-divider>
              <el-form-item label="知识库加密">
                <el-switch v-model="securityForm.encrypted" />
                <div class="form-tip">开启后访问需二次验证账号密码</div>
              </el-form-item>

              <el-form-item label="误删保护">
                <el-switch v-model="securityForm.deleteProtection" />
                <div class="form-tip">
                  开启后删除时触发二次确认，内容移入回收站
                </div>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-divider content-position="left">共享权限管控</el-divider>
              <el-form-item label="共享范围">
                <el-select
                  v-model="securityForm.shareScope"
                  placeholder="请选择共享范围"
                  style="width: 100%"
                >
                  <el-option label="仅本部门可见" value="dept" />
                  <el-option label="指定部门可见" value="specified" />
                </el-select>
              </el-form-item>

              <el-form-item label="共享操作权限">
                <el-radio-group v-model="securityForm.sharePermission">
                  <el-radio label="read">仅阅读</el-radio>
                  <el-radio label="edit">可编辑</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-divider content-position="left">效果预览</el-divider>
              <div class="preview-area">
                <div class="preview-content">
                  <div v-if="securityForm.encrypted" class="encrypt-tip">
                    <el-icon><Lock /></el-icon>
                    <span>已开启加密保护</span>
                  </div>
                  <div class="preview-text">
                    这是个人知识库内容预览区域。
                    <span v-if="securityForm.visibility === 'only_me'">
                      当前设置为仅自己可见。
                    </span>
                    <span v-else> 当前设置为指定人员可见。 </span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 其他配置 -->
      <div v-show="currentStep === 2" class="step-content">
        <el-form ref="otherFormRef" :model="otherForm" label-width="150px">
          <el-form-item label="知识库状态">
            <el-select v-model="otherForm.status" style="width: 300px">
              <el-option label="草稿" value="draft" />
              <el-option label="已归档" value="archived" />
              <el-option label="待优化" value="optimize" />
            </el-select>
          </el-form-item>

          <el-form-item label="个性化标签">
            <el-select
              v-model="otherForm.tags"
              multiple
              filterable
              allow-create
              placeholder="请选择或创建标签"
              style="width: 500px"
            >
              <el-option
                v-for="tag in tagOptions"
                :key="tag.value"
                :label="tag.label"
                :value="tag.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="个性化提醒">
            <el-switch v-model="otherForm.reminder" />
            <div v-if="otherForm.reminder" style="margin-top: 10px">
              <el-radio-group v-model="otherForm.reminderType">
                <el-radio label="regular">定期复盘提醒</el-radio>
                <el-radio label="update">更新提醒</el-radio>
              </el-radio-group>
              <el-date-picker
                v-if="otherForm.reminderType === 'regular'"
                v-model="otherForm.reminderDate"
                type="date"
                placeholder="选择提醒日期"
                style="margin-left: 10px; width: 200px"
              />
              <el-input-number
                v-if="otherForm.reminderType === 'update'"
                v-model="otherForm.updateDays"
                :min="1"
                :max="12"
                placeholder="月数"
                style="margin-left: 10px; width: 200px"
              />
              <span
                v-if="otherForm.reminderType === 'update'"
                style="margin-left: 5px"
              >
                个月未更新时提醒
              </span>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 底部操作按钮 -->
      <div class="step-actions">
        <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
        <el-button v-if="currentStep < 2" type="primary" @click="nextStep">
          下一步
        </el-button>
        <el-button
          v-if="currentStep === 2"
          type="primary"
          @click="handleSubmit"
        >
          保存
        </el-button>
        <el-button
          v-if="currentStep === 2"
          type="primary"
          @click="handleSaveAndAdd"
        >
          保存并添加知识
        </el-button>
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  UploadFilled,
  Lock,
  CircleCheck,
  CircleClose
} from "@element-plus/icons-vue";

// 步骤控制
const currentStep = ref(0);

// 基本信息表单
const basicFormRef = ref();
const basicForm = reactive({
  name: "",
  type: "",
  description: "",
  scene: "",
  source: "original",
  sortType: "update",
  sharedLibrary: ""
});

const basicRules = {
  name: [
    { required: true, message: "请输入知识库名称", trigger: "blur" },
    { min: 2, max: 30, message: "长度在 2 到 30 个字符", trigger: "blur" }
  ],
  type: [{ required: true, message: "请选择知识类型", trigger: "change" }]
};

// 安全设置表单
const securityFormRef = ref();
const securityForm = reactive({
  visibility: "only_me",
  selectedUsers: [],
  encrypted: false,
  deleteProtection: true,
  shareScope: "",
  sharePermission: "read"
});

// 其他配置表单
const otherFormRef = ref();
const otherForm = reactive({
  status: "draft",
  tags: [],
  reminder: false,
  reminderType: "regular",
  reminderDate: "",
  updateDays: 3
});

const typeOptions = [
  { label: "故障处理笔记", value: "fault" },
  { label: "命令手册", value: "command" },
  { label: "培训记录", value: "training" },
  { label: "配置草稿", value: "config" },
  { label: "经验总结", value: "experience" }
];

const fileList = ref([]);
const sharedLibraries = ref([
  { id: "1", name: "DNS解析失败故障处理手册" },
  { id: "2", name: "路由器OSPF协议配置指南" }
]);

const userList = [
  { id: "1", name: "张三" },
  { id: "2", name: "李四" },
  { id: "3", name: "王五" }
];

const tagOptions = [
  { label: "故障处理", value: "fault" },
  { label: "配置管理", value: "config" },
  { label: "命令手册", value: "command" }
];

const handleFileChange = (file: any) => {
  fileList.value.push(file);
};

// 步骤控制
const nextStep = async () => {
  if (currentStep.value === 0) {
    await basicFormRef.value?.validate();
  } else if (currentStep.value === 1) {
    await securityFormRef.value?.validate();
  }
  if (currentStep.value < 2) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const handleSubmit = async () => {
  await otherFormRef.value?.validate();
  ElMessage.success("个人知识库创建成功");
};

const handleSaveAndAdd = async () => {
  await otherFormRef.value?.validate();
  ElMessage.success("保存成功，正在跳转到添加知识页面");
};

const handleSaveDraft = () => {
  ElMessage.success("草稿已保存");
};

const handleCancel = () => {
  ElMessageBox.confirm("确定要取消吗？未保存的内容将丢失。", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  });
};
</script>

<style scoped lang="scss">
.personal-knowledge-create {
  .card-header {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .step-content {
    min-height: 400px;
    padding: 20px 0;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }

  .preview-area {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 20px;
    min-height: 200px;
    position: relative;

    .preview-content {
      position: relative;

      .encrypt-tip {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #409eff;
        margin-bottom: 10px;
      }

      .preview-text {
        color: #606266;
        line-height: 1.8;
      }
    }
  }

  .step-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
  }
}
</style>
