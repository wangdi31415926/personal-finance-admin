<template>
  <div class="knowledge-base-create">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>新建知识库</span>
          <el-steps :active="currentStep" finish-status="success" align-center>
            <el-step title="基本信息" />
            <el-step title="安全设置" />
            <el-step title="审核流程" />
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
          <el-divider content-position="left">核心信息</el-divider>
          <el-form-item label="知识库名称" prop="name">
            <el-input
              v-model="basicForm.name"
              placeholder="请输入知识库名称（2-50字）"
              maxlength="50"
              show-word-limit
              style="width: 500px"
            />
            <div class="form-tip">支持2-50字，禁止特殊符号</div>
          </el-form-item>

          <el-form-item label="知识领域" prop="domain">
            <el-select
              v-model="basicForm.domain"
              placeholder="请选择知识领域"
              filterable
              style="width: 500px"
            >
              <el-option
                v-for="item in domainOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-button
              type="text"
              style="margin-left: 10px"
              @click="showCustomDomain = true"
            >
              自定义
            </el-button>
          </el-form-item>

          <el-form-item label="知识类型" prop="type">
            <el-radio-group v-model="basicForm.type">
              <el-radio label="故障处理">故障处理</el-radio>
              <el-radio label="配置手册">配置手册</el-radio>
              <el-radio label="操作指南">操作指南</el-radio>
              <el-radio label="经验总结">经验总结</el-radio>
              <el-radio label="政策规范">政策规范</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="负责人" prop="owner">
            <el-select
              v-model="basicForm.owner"
              placeholder="请选择负责人"
              filterable
              style="width: 500px"
            >
              <el-option
                v-for="user in userList"
                :key="user.id"
                :label="user.name"
                :value="user.id"
              />
            </el-select>
          </el-form-item>

          <el-divider content-position="left">扩展信息</el-divider>
          <el-form-item label="知识描述">
            <el-input
              v-model="basicForm.description"
              type="textarea"
              :rows="4"
              placeholder="请输入知识描述（限500字）"
              maxlength="500"
              show-word-limit
              style="width: 500px"
            />
          </el-form-item>

          <el-form-item label="关联业务系统">
            <el-select
              v-model="basicForm.businessSystems"
              multiple
              placeholder="请选择关联业务系统"
              style="width: 500px"
            >
              <el-option
                v-for="system in businessSystemOptions"
                :key="system.value"
                :label="system.label"
                :value="system.value"
              />
            </el-select>
          </el-form-item>

          <el-divider content-position="left">初始知识导入</el-divider>
          <el-form-item label="知识文档">
            <el-upload
              ref="uploadRef"
              :file-list="fileList"
              :auto-upload="false"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
              drag
              multiple
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 PDF、Word、Excel、TXT 格式，单个文件不超过100MB
                </div>
              </template>
            </el-upload>
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
                  <el-radio label="all">全员可见</el-radio>
                  <el-radio label="specified">指定部门/人员可见</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item
                v-if="securityForm.visibility === 'specified'"
                label="选择部门/人员"
              >
                <el-tree
                  ref="orgTreeRef"
                  :data="orgTreeData"
                  show-checkbox
                  node-key="id"
                  :props="{ children: 'children', label: 'name' }"
                  @check="handleOrgCheck"
                />
              </el-form-item>

              <el-divider content-position="left">角色权限分配</el-divider>
              <el-form-item label="管理员">
                <el-select
                  v-model="securityForm.admins"
                  multiple
                  placeholder="请选择管理员"
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

              <el-form-item label="贡献者">
                <el-select
                  v-model="securityForm.contributors"
                  multiple
                  placeholder="请选择贡献者"
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

              <el-form-item label="阅读者">
                <el-select
                  v-model="securityForm.readers"
                  multiple
                  placeholder="请选择阅读者"
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
            </el-col>

            <el-col :span="12">
              <el-divider content-position="left">高级防泄密设置</el-divider>
              <el-form-item label="防复制/下载">
                <el-switch v-model="securityForm.preventCopy" />
                <div class="form-tip">
                  开启后禁用文本选择、右键菜单及复制快捷键
                </div>
              </el-form-item>

              <el-form-item label="动态水印">
                <el-switch v-model="securityForm.watermark" />
                <div class="form-tip">
                  开启后文档预览区域将覆盖半透明水印，包含访问者信息
                </div>
              </el-form-item>

              <el-divider content-position="left">效果预览</el-divider>
              <div class="preview-area">
                <div class="preview-content">
                  <div v-if="securityForm.watermark" class="watermark">
                    张三 | 工号001 | 2025-11-24 15:30:25
                  </div>
                  <div class="preview-text">
                    这是知识库内容预览区域。当开启防复制功能时，此区域将禁用文本选择。
                    当开启动态水印时，将显示访问者信息水印。
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 审核流程配置 -->
      <div v-show="currentStep === 2" class="step-content">
        <el-form ref="reviewFormRef" :model="reviewForm" label-width="150px">
          <el-form-item label="审核流程模板">
            <el-select
              v-model="reviewForm.templateId"
              placeholder="请选择审核流程模板"
              filterable
              style="width: 500px"
            >
              <el-option
                v-for="template in reviewTemplates"
                :key="template.id"
                :label="template.name"
                :value="template.id"
              />
            </el-select>
            <el-button
              type="text"
              style="margin-left: 10px"
              @click="showTemplateDesigner = true"
            >
              设计新模板
            </el-button>
          </el-form-item>

          <el-form-item v-if="reviewForm.templateId" label="流程预览">
            <div class="flow-preview">
              <div class="flow-node start">开始</div>
              <div class="flow-arrow">→</div>
              <div class="flow-node review">审核节点1</div>
              <div class="flow-arrow">→</div>
              <div class="flow-node review">审核节点2</div>
              <div class="flow-arrow">→</div>
              <div class="flow-node end">结束</div>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 其他配置 -->
      <div v-show="currentStep === 3" class="step-content">
        <el-form ref="otherFormRef" :model="otherForm" label-width="150px">
          <el-form-item label="知识库状态">
            <el-select v-model="otherForm.status" style="width: 300px">
              <el-option label="草稿" value="draft" />
              <el-option label="待启用" value="pending" />
              <el-option label="已启用" value="active" />
            </el-select>
          </el-form-item>

          <el-form-item label="关联标签">
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

          <el-form-item label="更新提醒">
            <el-switch v-model="otherForm.updateReminder" />
            <div v-if="otherForm.updateReminder" style="margin-top: 10px">
              <el-radio-group v-model="otherForm.reminderType">
                <el-radio label="regular">定期更新提醒</el-radio>
                <el-radio label="access">基于访问量提醒</el-radio>
              </el-radio-group>
              <el-date-picker
                v-if="otherForm.reminderType === 'regular'"
                v-model="otherForm.reminderDate"
                type="date"
                placeholder="选择提醒日期"
                style="margin-left: 10px; width: 200px"
              />
              <el-input-number
                v-if="otherForm.reminderType === 'access'"
                v-model="otherForm.accessThreshold"
                :min="1"
                placeholder="访问量阈值"
                style="margin-left: 10px; width: 200px"
              />
            </div>
          </el-form-item>

          <el-divider content-position="left">配置清单</el-divider>
          <div class="checklist">
            <div
              v-for="item in checklist"
              :key="item.key"
              class="checklist-item"
              :class="{ incomplete: !item.completed }"
            >
              <el-icon v-if="item.completed" class="check-icon">
                <CircleCheck />
              </el-icon>
              <el-icon v-else class="check-icon error">
                <CircleClose />
              </el-icon>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </el-form>
      </div>

      <!-- 底部操作按钮 -->
      <div class="step-actions">
        <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
        <el-button v-if="currentStep < 3" type="primary" @click="nextStep">
          下一步
        </el-button>
        <el-button
          v-if="currentStep === 3"
          type="primary"
          @click="handleSubmit"
        >
          完成初始化
        </el-button>
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </el-card>

    <!-- 自定义知识领域弹窗 -->
    <el-dialog v-model="showCustomDomain" title="自定义知识领域" width="400px">
      <el-input v-model="customDomainName" placeholder="请输入知识领域名称" />
      <template #footer>
        <el-button @click="showCustomDomain = false">取消</el-button>
        <el-button type="primary" @click="handleAddCustomDomain"
          >确定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  UploadFilled,
  CircleCheck,
  CircleClose
} from "@element-plus/icons-vue";

// 步骤控制
const currentStep = ref(0);

// 基本信息表单
const basicFormRef = ref();
const basicForm = reactive({
  name: "",
  domain: "",
  type: "故障处理",
  owner: "",
  description: "",
  businessSystems: []
});

const basicRules = {
  name: [
    { required: true, message: "请输入知识库名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" }
  ],
  domain: [{ required: true, message: "请选择知识领域", trigger: "change" }],
  type: [{ required: true, message: "请选择知识类型", trigger: "change" }],
  owner: [{ required: true, message: "请选择负责人", trigger: "change" }]
};

const domainOptions = [
  { label: "网络设备", value: "network" },
  { label: "服务器运维", value: "server" },
  { label: "应用部署", value: "deployment" },
  { label: "安全防护", value: "security" }
];

const businessSystemOptions = [
  { label: "核心路由器", value: "router" },
  { label: "CRM系统", value: "crm" },
  { label: "数据库系统", value: "database" }
];

const userList = [
  { id: "1", name: "张三" },
  { id: "2", name: "李四" },
  { id: "3", name: "王五" }
];

const fileList = ref([]);
const showCustomDomain = ref(false);
const customDomainName = ref("");

// 安全设置表单
const securityFormRef = ref();
const securityForm = reactive({
  visibility: "all",
  selectedOrgs: [],
  admins: [],
  contributors: [],
  readers: [],
  preventCopy: false,
  watermark: false
});

const orgTreeData = [
  {
    id: "1",
    name: "技术部",
    children: [
      { id: "1-1", name: "网络组" },
      { id: "1-2", name: "系统组" }
    ]
  },
  {
    id: "2",
    name: "运维部",
    children: [
      { id: "2-1", name: "监控组" },
      { id: "2-2", name: "维护组" }
    ]
  }
];

// 审核流程表单
const reviewFormRef = ref();
const reviewForm = reactive({
  templateId: ""
});

const reviewTemplates = [
  { id: "1", name: "核心业务库审核模板" },
  { id: "2", name: "公共知识审核模板" },
  { id: "3", name: "标准审核流程" }
];

const showTemplateDesigner = ref(false);

// 其他配置表单
const otherFormRef = ref();
const otherForm = reactive({
  status: "draft",
  tags: [],
  updateReminder: false,
  reminderType: "regular",
  reminderDate: "",
  accessThreshold: 100
});

const tagOptions = [
  { label: "故障处理", value: "fault" },
  { label: "配置管理", value: "config" },
  { label: "命令手册", value: "command" }
];

// 配置清单
const checklist = computed(() => {
  return [
    {
      key: "name",
      label: "知识库名称",
      completed: !!basicForm.name
    },
    {
      key: "domain",
      label: "知识领域",
      completed: !!basicForm.domain
    },
    {
      key: "type",
      label: "知识类型",
      completed: !!basicForm.type
    },
    {
      key: "owner",
      label: "负责人",
      completed: !!basicForm.owner
    },
    {
      key: "security",
      label: "安全设置",
      completed: securityForm.visibility !== ""
    }
  ];
});

// 文件处理
const handleFileChange = (file: any) => {
  fileList.value.push(file);
};

const handleFileRemove = (file: any) => {
  const index = fileList.value.findIndex((f: any) => f.uid === file.uid);
  if (index > -1) {
    fileList.value.splice(index, 1);
  }
};

// 组织架构选择
const handleOrgCheck = (data: any, checked: any) => {
  securityForm.selectedOrgs = checked.checkedKeys;
};

// 自定义知识领域
const handleAddCustomDomain = () => {
  if (customDomainName.value) {
    domainOptions.push({
      label: customDomainName.value,
      value: customDomainName.value.toLowerCase()
    });
    basicForm.domain = customDomainName.value.toLowerCase();
    showCustomDomain.value = false;
    customDomainName.value = "";
    ElMessage.success("自定义知识领域已添加");
  }
};

// 步骤控制
const nextStep = async () => {
  if (currentStep.value === 0) {
    await basicFormRef.value?.validate();
  } else if (currentStep.value === 1) {
    await securityFormRef.value?.validate();
  } else if (currentStep.value === 2) {
    await reviewFormRef.value?.validate();
  }
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

// 提交
const handleSubmit = async () => {
  const incomplete = checklist.value.filter(item => !item.completed);
  if (incomplete.length > 0) {
    ElMessage.warning("请完成所有必填项");
    return;
  }

  try {
    // 这里应该是API调用，现在只是模拟
    ElMessage.success("知识库创建成功");
    // 跳转到知识库列表
  } catch (error) {
    ElMessage.error("创建失败");
  }
};

const handleSaveDraft = () => {
  ElMessage.success("草稿已保存");
};

const handleCancel = () => {
  ElMessageBox.confirm("确定要取消吗？未保存的内容将丢失。", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    // 返回列表页
  });
};
</script>

<style scoped lang="scss">
.knowledge-base-create {
  .card-header {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .step-content {
    min-height: 500px;
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

      .watermark {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        color: rgba(0, 0, 0, 0.1);
        font-size: 24px;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(-45deg);
      }

      .preview-text {
        color: #606266;
        line-height: 1.8;
      }
    }
  }

  .flow-preview {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;

    .flow-node {
      padding: 10px 20px;
      background: #409eff;
      color: white;
      border-radius: 4px;
      min-width: 100px;
      text-align: center;

      &.start {
        background: #67c23a;
      }

      &.end {
        background: #909399;
      }
    }

    .flow-arrow {
      color: #409eff;
      font-size: 20px;
    }
  }

  .checklist {
    .checklist-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      font-size: 14px;

      .check-icon {
        font-size: 18px;
        color: #67c23a;

        &.error {
          color: #f56c6c;
        }
      }

      &.incomplete {
        color: #f56c6c;
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
