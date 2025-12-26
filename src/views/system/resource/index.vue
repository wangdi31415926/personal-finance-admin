<template>
  <div class="resource-management">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="title">资源管理（ZIR管理）</span>
        </div>
      </template>

      <div class="content-wrapper">
        <!-- 左侧列表 -->
        <div class="left-list">
          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索名称/编码"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #suffix>
                <el-icon
                  v-if="searchKeyword"
                  @click="clearSearch"
                  style="cursor: pointer"
                >
                  <Close />
                </el-icon>
              </template>
            </el-input>
            <el-button
              link
              type="primary"
              size="small"
              @click="showAdvancedSearch = !showAdvancedSearch"
              style="margin-top: 10px"
            >
              高级搜索
              <el-icon
                ><ArrowDown v-if="!showAdvancedSearch" /><ArrowUp v-else
              /></el-icon>
            </el-button>
          </div>

          <!-- 高级搜索面板 -->
          <el-collapse-transition>
            <div v-show="showAdvancedSearch" class="advanced-search-panel">
              <el-form
                :model="advancedSearchForm"
                label-width="100px"
                size="small"
              >
                <el-form-item label="区域">
                  <el-input
                    v-model="advancedSearchForm.zone"
                    placeholder="请输入区域"
                  />
                </el-form-item>
                <el-form-item label="标识">
                  <el-input
                    v-model="advancedSearchForm.identity"
                    placeholder="请输入标识"
                  />
                </el-form-item>
                <el-form-item label="资源类型">
                  <el-select
                    v-model="advancedSearchForm.resourceType"
                    placeholder="请选择资源类型"
                  >
                    <el-option label="服务器" value="server" />
                    <el-option label="网络设备" value="network" />
                    <el-option label="存储设备" value="storage" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleAdvancedSearch"
                    >查询</el-button
                  >
                  <el-button @click="resetAdvancedSearch">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-collapse-transition>

          <!-- 操作栏 -->
          <div class="toolbar">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              添加ZIR资源
            </el-button>
            <el-button @click="handleBatchImport">
              <el-icon><Upload /></el-icon>
              批量导入ZIR资源
            </el-button>
          </div>

          <!-- 资源列表 -->
          <el-table
            :data="filteredResourceList"
            highlight-current-row
            @current-change="handleRowClick"
            style="width: 100%"
            height="calc(100vh - 400px)"
            @sort-change="handleSortChange"
          >
            <el-table-column
              prop="zone"
              label="区域"
              width="120"
              sortable="custom"
            />
            <el-table-column prop="identity" label="标识" width="120" />
            <el-table-column prop="resourceType" label="资源类型" width="120">
              <template #default="{ row }">
                <el-tag
                  :type="getResourceTypeTag(row.resourceType)"
                  size="small"
                >
                  {{ getResourceTypeName(row.resourceType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="code" label="编码" width="150" />
            <el-table-column prop="department" label="归属部门" width="120" />
            <el-table-column
              prop="purchaseDate"
              label="采购日期"
              width="120"
              sortable="custom"
            />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="resourcePage"
            v-model:page-size="resourcePageSize"
            :page-sizes="[10, 20, 50]"
            :total="resourceTotal"
            layout="total, sizes, prev, pager, next, jumper"
            style="margin-top: 15px"
          />
        </div>

        <!-- 右侧详情 -->
        <div class="right-detail">
          <div v-if="selectedResource" class="detail-content">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="核心区域" name="core">
                <div class="detail-header">
                  <h3>{{ selectedResource.code }}</h3>
                  <el-button type="primary" @click="exportResource">
                    <el-icon><Download /></el-icon>
                    导出PDF
                  </el-button>
                </div>
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="区域名称">
                    {{ selectedResource.zone }}
                  </el-descriptions-item>
                  <el-descriptions-item label="标识名称">
                    {{ selectedResource.identity }}
                  </el-descriptions-item>
                  <el-descriptions-item label="资源类型">
                    <el-tag
                      :type="getResourceTypeTag(selectedResource.resourceType)"
                    >
                      {{ getResourceTypeName(selectedResource.resourceType) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="编码">
                    {{ selectedResource.code }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>

              <el-tab-pane label="其他区域" name="other">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="资源供应商">
                    {{ selectedResource.supplier || "无" }}
                  </el-descriptions-item>
                  <el-descriptions-item label="采购日期">
                    {{ selectedResource.purchaseDate }}
                  </el-descriptions-item>
                  <el-descriptions-item label="归属部门">
                    {{ selectedResource.department }}
                  </el-descriptions-item>
                  <el-descriptions-item label="状态">
                    <el-tag :type="getStatusTagType(selectedResource.status)">
                      {{ selectedResource.status }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="备注" :span="2">
                    {{ selectedResource.remark || "无" }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>
            </el-tabs>
          </div>
          <el-empty v-else description="请从左侧选择资源查看详情" />
        </div>
      </div>
    </el-card>

    <!-- 添加ZIR资源弹窗 -->
    <el-dialog v-model="addDialogVisible" title="添加ZIR资源" width="800px">
      <el-steps
        :active="addStep"
        finish-status="success"
        align-center
        style="margin-bottom: 30px"
      >
        <el-step title="Zone" />
        <el-step title="Identity" />
        <el-step title="Resource" />
      </el-steps>

      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="120px"
      >
        <!-- Zone步骤 -->
        <div v-if="addStep === 0">
          <el-form-item label="区域" prop="zone">
            <el-input v-model="addForm.zone" placeholder="请输入区域" />
            <div class="field-tip">
              <el-icon><QuestionFilled /></el-icon>
              <span>区域填写规范：请输入区域名称</span>
            </div>
          </el-form-item>
        </div>

        <!-- Identity步骤 -->
        <div v-if="addStep === 1">
          <el-form-item label="标识" prop="identity">
            <el-input v-model="addForm.identity" placeholder="请输入标识" />
            <div class="field-tip">
              <el-icon><QuestionFilled /></el-icon>
              <span>标识填写规范：请输入标识名称</span>
            </div>
          </el-form-item>
        </div>

        <!-- Resource步骤 -->
        <div v-if="addStep === 2">
          <el-form-item label="资源类型" prop="resourceType">
            <el-select
              v-model="addForm.resourceType"
              placeholder="请选择资源类型"
            >
              <el-option label="服务器" value="server" />
              <el-option label="网络设备" value="network" />
              <el-option label="存储设备" value="storage" />
            </el-select>
          </el-form-item>
          <el-form-item label="编码" prop="code">
            <el-input
              v-model="addForm.code"
              placeholder="请输入编码"
              @blur="checkCodeConflict"
            />
            <div v-if="codeConflict" class="error-tip">该编码已存在</div>
            <div class="field-tip">
              <el-icon><QuestionFilled /></el-icon>
              <span>编码填写规范：请输入唯一编码</span>
            </div>
          </el-form-item>
          <el-form-item label="资源供应商">
            <el-input
              v-model="addForm.supplier"
              placeholder="请输入资源供应商"
            />
          </el-form-item>
          <el-form-item label="采购日期" prop="purchaseDate">
            <el-date-picker
              v-model="addForm.purchaseDate"
              type="date"
              placeholder="请选择采购日期"
              style="width: 100%"
            />
            <div v-if="dateError" class="error-tip">
              采购日期不能晚于当前日期
            </div>
          </el-form-item>
          <el-form-item label="归属部门">
            <el-input
              v-model="addForm.department"
              placeholder="请输入归属部门"
            />
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="addForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
            />
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <el-button v-if="addStep > 0" @click="addStep--">上一步</el-button>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button v-if="addStep < 2" type="primary" @click="addStep++">
          下一步
        </el-button>
        <el-button v-if="addStep === 2" type="primary" @click="submitForm">
          提交
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入ZIR资源"
      width="800px"
    >
      <el-steps :active="importStep" finish-status="success" align-center>
        <el-step title="下载模板" />
        <el-step title="上传文件" />
        <el-step title="校验结果" />
        <el-step title="导入结果" />
      </el-steps>

      <div class="import-content" style="margin-top: 30px">
        <!-- 步骤1：下载模板 -->
        <div v-if="importStep === 0" class="import-step">
          <el-button type="primary" @click="downloadTemplate">
            <el-icon><Download /></el-icon>
            点击下载模板
          </el-button>
          <div class="template-desc" style="margin-top: 20px">
            <h4>模板填写说明：</h4>
            <ul>
              <li>区域：必填</li>
              <li>标识：必填</li>
              <li>资源：必填</li>
              <li>编码：必填，不能重复</li>
            </ul>
          </div>
        </div>

        <!-- 步骤2：上传文件 -->
        <div v-if="importStep === 1" class="import-step">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
            drag
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">只能上传Excel文件，且不超过10MB</div>
            </template>
          </el-upload>
          <div v-if="selectedFile" style="margin-top: 20px">
            <p>已选择文件：{{ selectedFile.name }}</p>
            <el-button type="primary" @click="validateFile"
              >下一步校验</el-button
            >
          </div>
        </div>

        <!-- 步骤3：校验结果 -->
        <div v-if="importStep === 2" class="import-step">
          <div v-if="validating" class="validating">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>校验中...</span>
          </div>
          <div v-else>
            <div class="result-summary">
              <el-alert
                :title="`校验完成：成功 ${importResult.success} 条，失败 ${importResult.fail} 条`"
                :type="importResult.fail > 0 ? 'warning' : 'success'"
                :closable="false"
              />
            </div>
            <el-table
              v-if="importResult.errors.length > 0"
              :data="importResult.errors"
              border
              style="margin-top: 20px"
              max-height="300"
            >
              <el-table-column prop="row" label="行号" width="80" />
              <el-table-column prop="reason" label="失败原因" />
            </el-table>
            <div v-if="importResult.fail > 0" style="margin-top: 20px">
              <el-button @click="downloadErrorReport">下载校验报告</el-button>
            </div>
          </div>
        </div>

        <!-- 步骤4：导入结果 -->
        <div v-if="importStep === 3" class="import-step">
          <div class="result-summary">
            <el-alert
              :title="`导入完成：成功 ${importResult.success} 条，失败 ${importResult.fail} 条`"
              :type="importResult.fail > 0 ? 'warning' : 'success'"
              :closable="false"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <el-button v-if="importStep > 0 && importStep < 3" @click="importStep--"
          >上一步</el-button
        >
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button
          v-if="importStep === 2 && importResult.fail === 0"
          type="primary"
          @click="confirmImport"
        >
          确认导入
        </el-button>
        <el-button
          v-if="importStep === 2 && importResult.fail > 0"
          @click="importStep = 1"
        >
          重新上传
        </el-button>
        <el-button
          v-if="importStep === 3"
          type="primary"
          @click="importDialogVisible = false"
        >
          返回资源列表
        </el-button>
        <el-button v-if="importStep === 3" @click="continueImport">
          继续批量导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  Plus,
  Search,
  ArrowDown,
  ArrowUp,
  Close,
  Upload,
  Download,
  Loading,
  UploadFilled,
  QuestionFilled
} from "@element-plus/icons-vue";

interface Resource {
  id: string;
  zone: string;
  identity: string;
  resourceType: string;
  code: string;
  supplier?: string;
  purchaseDate: string;
  department: string;
  status: string;
  remark?: string;
}

const searchKeyword = ref("");
const showAdvancedSearch = ref(false);
const selectedResource = ref<Resource | null>(null);
const activeTab = ref("core");
const addDialogVisible = ref(false);
const addStep = ref(0);
const codeConflict = ref(false);
const dateError = ref(false);
const importDialogVisible = ref(false);
const importStep = ref(0);
const validating = ref(false);
const selectedFile = ref<any>(null);
const fileList = ref([]);
const uploadRef = ref();
const resourcePage = ref(1);
const resourcePageSize = ref(10);
const resourceTotal = ref(0);
const sortConfig = ref<{ prop?: string; order?: string }>({});

const advancedSearchForm = reactive({
  zone: "",
  identity: "",
  resourceType: ""
});

const addForm = reactive({
  zone: "",
  identity: "",
  resourceType: "",
  code: "",
  supplier: "",
  purchaseDate: "",
  department: "",
  remark: ""
});

const addFormRules = {
  zone: [{ required: true, message: "请输入区域", trigger: "blur" }],
  identity: [{ required: true, message: "请输入标识", trigger: "blur" }],
  resourceType: [
    { required: true, message: "请选择资源类型", trigger: "change" }
  ],
  code: [{ required: true, message: "请输入编码", trigger: "blur" }],
  purchaseDate: [
    { required: true, message: "请选择采购日期", trigger: "change" }
  ]
};

const addFormRef = ref();

const importResult = reactive({
  success: 0,
  fail: 0,
  errors: [] as Array<{ row: number; reason: string }>
});

// 测试数据
const resourceList = ref<Resource[]>([
  {
    id: "1",
    zone: "华东区",
    identity: "ID001",
    resourceType: "server",
    code: "ZIR001",
    supplier: "供应商A",
    purchaseDate: "2024-01-01",
    department: "技术部",
    status: "在用",
    remark: "测试服务器"
  },
  {
    id: "2",
    zone: "华南区",
    identity: "ID002",
    resourceType: "network",
    code: "ZIR002",
    supplier: "供应商B",
    purchaseDate: "2024-01-02",
    department: "技术部",
    status: "在用"
  },
  {
    id: "3",
    zone: "华北区",
    identity: "ID003",
    resourceType: "storage",
    code: "ZIR003",
    supplier: "供应商C",
    purchaseDate: "2024-01-03",
    department: "技术部",
    status: "闲置"
  }
]);

const filteredResourceList = computed(() => {
  let result = resourceList.value;

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(
      r =>
        r.zone.includes(keyword) ||
        r.identity.includes(keyword) ||
        r.code.includes(keyword)
    );
  }

  // 排序
  if (sortConfig.value.prop) {
    result = [...result].sort((a, b) => {
      const aVal = (a as any)[sortConfig.value.prop!];
      const bVal = (b as any)[sortConfig.value.prop!];
      if (sortConfig.value.order === "ascending") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  return result;
});

// 方法
const handleSearch = () => {
  // 搜索逻辑已在computed中实现
};

const clearSearch = () => {
  searchKeyword.value = "";
};

const handleAdvancedSearch = () => {
  ElMessage.info("高级搜索功能");
};

const resetAdvancedSearch = () => {
  Object.assign(advancedSearchForm, {
    zone: "",
    identity: "",
    resourceType: ""
  });
};

const handleSortChange = ({
  prop,
  order
}: {
  prop?: string;
  order?: string;
}) => {
  sortConfig.value = { prop, order };
};

const handleRowClick = (row: Resource) => {
  selectedResource.value = row;
  activeTab.value = "core";
};

const handleAdd = () => {
  addStep.value = 0;
  Object.assign(addForm, {
    zone: "",
    identity: "",
    resourceType: "",
    code: "",
    supplier: "",
    purchaseDate: "",
    department: "",
    remark: ""
  });
  codeConflict.value = false;
  dateError.value = false;
  addDialogVisible.value = true;
};

const checkCodeConflict = () => {
  // 模拟校验
  codeConflict.value = false;
};

const submitForm = () => {
  // 检查采购日期
  if (addForm.purchaseDate) {
    const purchaseDate = new Date(addForm.purchaseDate);
    const today = new Date();
    if (purchaseDate > today) {
      dateError.value = true;
      return;
    }
  }

  addFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success("ZIR资源添加成功");
      addDialogVisible.value = false;
    }
  });
};

const handleBatchImport = () => {
  importDialogVisible.value = true;
  importStep.value = 0;
  fileList.value = [];
  selectedFile.value = null;
  importResult.success = 0;
  importResult.fail = 0;
  importResult.errors = [];
};

const downloadTemplate = () => {
  ElMessage.success("模板下载成功");
};

const handleFileChange = (file: any) => {
  selectedFile.value = file;
};

const validateFile = () => {
  if (!selectedFile.value) {
    ElMessage.warning("请先选择文件");
    return;
  }
  validating.value = true;
  importStep.value = 2;

  // 模拟校验
  setTimeout(() => {
    validating.value = false;
    importResult.success = 8;
    importResult.fail = 2;
    importResult.errors = [
      { row: 3, reason: "编码重复" },
      { row: 5, reason: "采购日期格式错误" }
    ];
  }, 2000);
};

const downloadErrorReport = () => {
  ElMessage.success("校验报告下载成功");
};

const confirmImport = () => {
  importStep.value = 3;
  // 模拟导入
  setTimeout(() => {
    ElMessage.success("批量导入完成");
  }, 1000);
};

const continueImport = () => {
  importStep.value = 0;
  fileList.value = [];
  selectedFile.value = null;
  importResult.success = 0;
  importResult.fail = 0;
  importResult.errors = [];
};

const exportResource = () => {
  ElMessage.success("资源信息PDF导出成功");
};

const getResourceTypeName = (type: string) => {
  const map: Record<string, string> = {
    server: "服务器",
    network: "网络设备",
    storage: "存储设备"
  };
  return map[type] || type;
};

const getResourceTypeTag = (type: string) => {
  const map: Record<string, string> = {
    server: "primary",
    network: "success",
    storage: "warning"
  };
  return map[type] || "";
};

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    在用: "success",
    闲置: "info",
    维修: "warning",
    报废: "danger"
  };
  return map[status] || "";
};

onMounted(() => {
  resourceTotal.value = resourceList.value.length;
});
</script>

<style scoped lang="scss">
.resource-management {
  padding: 20px;
  height: 100%;

  .main-card {
    height: calc(100vh - 100px);

    :deep(.el-card__body) {
      padding: 20px;
      height: calc(100% - 60px);
    }
  }

  .content-wrapper {
    display: flex;
    height: 100%;
    gap: 20px;

    .left-list {
      width: 600px;
      display: flex;
      flex-direction: column;

      .search-bar {
        margin-bottom: 15px;
      }

      .advanced-search-panel {
        margin-bottom: 15px;
        padding: 15px;
        background: #f5f7fa;
        border-radius: 4px;
      }

      .toolbar {
        margin-bottom: 15px;
        display: flex;
        gap: 10px;
      }
    }

    .right-detail {
      flex: 1;
      display: flex;
      flex-direction: column;

      .detail-content {
        flex: 1;
        overflow: auto;

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
      }
    }
  }

  .field-tip {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }

  .error-tip {
    color: #f56c6c;
    font-size: 12px;
    margin-top: 5px;
  }

  .import-content {
    min-height: 300px;

    .import-step {
      text-align: center;
      padding: 20px;

      .template-desc {
        text-align: left;
        max-width: 500px;
        margin: 0 auto;

        ul {
          margin: 10px 0;
          padding-left: 20px;
        }
      }

      .validating {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-size: 16px;
        color: #409eff;
      }
    }

    .result-summary {
      margin-bottom: 20px;
    }
  }
}
</style>
