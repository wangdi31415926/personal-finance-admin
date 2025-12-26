<template>
  <div class="organization-management">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="title">组织机构管理</span>
        </div>
      </template>

      <div class="content-wrapper">
        <!-- 左侧架构树 -->
        <div class="left-tree" :class="{ collapsed: treeCollapsed }">
          <div class="tree-toolbar">
            <el-button-group>
              <el-button size="small" @click="expandAll">
                <el-icon><Plus /></el-icon>
                全部展开
              </el-button>
              <el-button size="small" @click="collapseAll">
                <el-icon><Minus /></el-icon>
                全部折叠
              </el-button>
              <el-button size="small" @click="refreshTree">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </el-button-group>
            <el-button size="small" @click="treeCollapsed = !treeCollapsed">
              <el-icon
                ><DArrowLeft v-if="!treeCollapsed" /><DArrowRight v-else
              /></el-icon>
            </el-button>
          </div>

          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索机构名称/编码"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button
              link
              type="primary"
              size="small"
              @click="showAdvancedSearch = !showAdvancedSearch"
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
                <el-form-item label="机构名称">
                  <el-input
                    v-model="advancedSearchForm.name"
                    placeholder="请输入机构名称"
                  />
                </el-form-item>
                <el-form-item label="机构编码">
                  <el-input
                    v-model="advancedSearchForm.code"
                    placeholder="请输入机构编码"
                  />
                </el-form-item>
                <el-form-item label="负责人">
                  <el-input
                    v-model="advancedSearchForm.manager"
                    placeholder="请输入负责人"
                  />
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

          <!-- 组织架构树 -->
          <el-tree
            ref="treeRef"
            :data="treeData"
            :props="treeProps"
            :default-expand-all="false"
            :highlight-current="true"
            node-key="id"
            @node-click="handleNodeClick"
            class="org-tree"
          >
            <template #default="{ node, data }">
              <span
                class="tree-node"
                :class="{ 'is-highlight': data.isSearchMatch }"
                @mouseenter="showNodeTooltip(data)"
              >
                <el-icon v-if="data.type === 'company'"
                  ><OfficeBuilding
                /></el-icon>
                <el-icon v-else-if="data.type === 'department'"
                  ><Suitcase
                /></el-icon>
                <el-icon v-else><Folder /></el-icon>
                <span>{{ node.label }}</span>
                <el-tag
                  v-if="data.userCount"
                  size="small"
                  type="info"
                  style="margin-left: 8px"
                >
                  {{ data.userCount }}人
                </el-tag>
              </span>
            </template>
          </el-tree>
        </div>

        <!-- 右侧内容区 -->
        <div class="right-content">
          <!-- 顶部操作栏 -->
          <div class="toolbar">
            <div class="path-display" v-if="selectedNode">
              <span>当前路径：</span>
              <el-breadcrumb separator="/">
                <el-breadcrumb-item
                  v-for="(item, index) in selectedPath"
                  :key="index"
                  @click="handleBreadcrumbClick(item)"
                >
                  {{ item.name }}
                </el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <div class="actions">
              <el-button type="primary" @click="handleAdd">
                <el-icon><Plus /></el-icon>
                添加子机构
              </el-button>
              <el-button @click="handleBatchImport">
                <el-icon><Upload /></el-icon>
                批量导入
              </el-button>
            </div>
          </div>

          <!-- 详情面板 -->
          <div class="detail-panel" v-if="selectedNode">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="基础信息" name="basic">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="机构名称">
                    {{ selectedNode.name }}
                  </el-descriptions-item>
                  <el-descriptions-item label="机构编码">
                    {{ selectedNode.code }}
                  </el-descriptions-item>
                  <el-descriptions-item label="负责人">
                    {{ selectedNode.manager }}
                  </el-descriptions-item>
                  <el-descriptions-item label="机构类型">
                    <el-tag :type="getTypeTagType(selectedNode.type)">
                      {{ getTypeName(selectedNode.type) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="上级机构">
                    {{ selectedNode.parentName || "无" }}
                  </el-descriptions-item>
                  <el-descriptions-item label="创建时间">
                    {{ selectedNode.createTime }}
                  </el-descriptions-item>
                  <el-descriptions-item label="审批状态">
                    <el-tag
                      :type="getStatusTagType(selectedNode.approvalStatus)"
                    >
                      {{ selectedNode.approvalStatus }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="用户数量">
                    {{ selectedNode.userCount || 0 }}人
                  </el-descriptions-item>
                </el-descriptions>

                <!-- 审批流程轨迹 -->
                <div class="approval-flow" v-if="selectedNode.approvalRecords">
                  <h4>审批流程轨迹</h4>
                  <el-timeline>
                    <el-timeline-item
                      v-for="(record, index) in selectedNode.approvalRecords"
                      :key="index"
                      :timestamp="record.time"
                    >
                      <p>{{ record.approver }}：{{ record.comment }}</p>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </el-tab-pane>

              <el-tab-pane label="用户列表" name="users">
                <el-table :data="userList" border style="width: 100%">
                  <el-table-column prop="name" label="姓名" width="120" />
                  <el-table-column prop="position" label="职位" width="150" />
                  <el-table-column prop="phone" label="联系方式" width="150" />
                  <el-table-column label="操作" width="120">
                    <template #default="{ row }">
                      <el-button
                        link
                        type="primary"
                        size="small"
                        @click="viewUserDetail(row)"
                      >
                        查看详情
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-pagination
                  v-model:current-page="userPage"
                  v-model:page-size="userPageSize"
                  :page-sizes="[10, 20, 50]"
                  :total="userTotal"
                  layout="total, sizes, prev, pager, next, jumper"
                  style="margin-top: 20px"
                />
              </el-tab-pane>
            </el-tabs>
          </div>

          <!-- 空状态 -->
          <el-empty v-else description="请从左侧选择机构查看详情" />
        </div>
      </div>
    </el-card>

    <!-- 添加机构弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      :title="isEdit ? '编辑机构' : '添加子机构'"
      width="600px"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="120px"
      >
        <el-form-item label="上级机构" prop="parentName">
          <el-input v-model="addForm.parentName" disabled />
        </el-form-item>
        <el-form-item label="机构名称" prop="name">
          <el-input
            v-model="addForm.name"
            placeholder="请输入机构名称"
            @blur="checkNameConflict"
          />
          <div v-if="nameConflict" class="error-tip">该机构名称已存在</div>
        </el-form-item>
        <el-form-item label="机构编码" prop="code">
          <el-input
            v-model="addForm.code"
            placeholder="请输入机构编码"
            @blur="checkCodeConflict"
          />
          <div v-if="codeConflict" class="error-tip">该机构编码已存在</div>
        </el-form-item>
        <el-form-item label="负责人" prop="manager">
          <el-input v-model="addForm.manager" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="机构类型" prop="type">
          <el-select v-model="addForm.type" placeholder="请选择机构类型">
            <el-option label="公司" value="company" />
            <el-option label="部门" value="department" />
            <el-option label="小组" value="group" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="addForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button @click="saveDraft">保存草稿</el-button>
        <el-button type="primary" @click="submitApproval">提交审批</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog v-model="importDialogVisible" title="批量导入机构" width="800px">
      <el-steps :active="importStep" finish-status="success" align-center>
        <el-step title="下载模板" />
        <el-step title="上传文件" />
        <el-step title="查看结果" />
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
              <li>机构名称：必填，不能为空</li>
              <li>机构编码：必填，不能重复</li>
              <li>上级机构编码：必填，必须已存在</li>
              <li>负责人：必填</li>
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

        <!-- 步骤3：查看结果 -->
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
      </div>

      <template #footer>
        <el-button v-if="importStep > 0" @click="importStep--"
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
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Minus,
  Refresh,
  Search,
  ArrowDown,
  ArrowUp,
  Upload,
  Download,
  DArrowLeft,
  DArrowRight,
  OfficeBuilding,
  Suitcase,
  Folder,
  Loading,
  UploadFilled
} from "@element-plus/icons-vue";

interface TreeNode {
  id: string;
  name: string;
  code: string;
  type: string;
  manager?: string;
  parentName?: string;
  createTime?: string;
  approvalStatus?: string;
  userCount?: number;
  approvalRecords?: Array<{
    approver: string;
    comment: string;
    time: string;
  }>;
  children?: TreeNode[];
  isSearchMatch?: boolean;
}

const treeRef = ref();
const treeCollapsed = ref(false);
const searchKeyword = ref("");
const showAdvancedSearch = ref(false);
const selectedNode = ref<TreeNode | null>(null);
const selectedPath = ref<Array<{ id: string; name: string }>>([]);
const activeTab = ref("basic");
const addDialogVisible = ref(false);
const isEdit = ref(false);
const nameConflict = ref(false);
const codeConflict = ref(false);
const importDialogVisible = ref(false);
const importStep = ref(0);
const validating = ref(false);
const selectedFile = ref<any>(null);
const fileList = ref([]);
const uploadRef = ref();

const userPage = ref(1);
const userPageSize = ref(10);
const userTotal = ref(0);

const treeProps = {
  children: "children",
  label: "name"
};

// 测试数据
const treeData = ref<TreeNode[]>([
  {
    id: "1",
    name: "总公司",
    code: "ORG001",
    type: "company",
    manager: "张总",
    createTime: "2024-01-01 10:00:00",
    approvalStatus: "已审批",
    userCount: 150,
    approvalRecords: [
      { approver: "李总", comment: "同意", time: "2024-01-01 11:00:00" }
    ],
    children: [
      {
        id: "2",
        name: "技术部",
        code: "ORG002",
        type: "department",
        manager: "王经理",
        parentName: "总公司",
        createTime: "2024-01-02 10:00:00",
        approvalStatus: "已审批",
        userCount: 50,
        children: [
          {
            id: "3",
            name: "前端组",
            code: "ORG003",
            type: "group",
            manager: "赵组长",
            parentName: "技术部",
            createTime: "2024-01-03 10:00:00",
            approvalStatus: "已审批",
            userCount: 15
          },
          {
            id: "4",
            name: "后端组",
            code: "ORG004",
            type: "group",
            manager: "钱组长",
            parentName: "技术部",
            createTime: "2024-01-03 11:00:00",
            approvalStatus: "已审批",
            userCount: 20
          }
        ]
      },
      {
        id: "5",
        name: "市场部",
        code: "ORG005",
        type: "department",
        manager: "孙经理",
        parentName: "总公司",
        createTime: "2024-01-02 14:00:00",
        approvalStatus: "已审批",
        userCount: 30
      }
    ]
  }
]);

const userList = ref([
  { name: "张三", position: "前端工程师", phone: "13800138000" },
  { name: "李四", position: "后端工程师", phone: "13800138001" },
  { name: "王五", position: "产品经理", phone: "13800138002" }
]);

const advancedSearchForm = reactive({
  name: "",
  code: "",
  manager: ""
});

const addForm = reactive({
  parentId: "",
  parentName: "",
  name: "",
  code: "",
  manager: "",
  type: "",
  remark: ""
});

const addFormRules = {
  name: [{ required: true, message: "请输入机构名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入机构编码", trigger: "blur" }],
  manager: [{ required: true, message: "请输入负责人", trigger: "blur" }],
  type: [{ required: true, message: "请选择机构类型", trigger: "change" }]
};

const addFormRef = ref();

const importResult = reactive({
  success: 0,
  fail: 0,
  errors: [] as Array<{ row: number; reason: string }>
});

// 方法
const expandAll = () => {
  const nodes = treeRef.value?.store.nodesMap;
  if (nodes) {
    Object.keys(nodes).forEach(key => {
      nodes[key].expand();
    });
  }
};

const collapseAll = () => {
  const nodes = treeRef.value?.store.nodesMap;
  if (nodes) {
    Object.keys(nodes).forEach(key => {
      nodes[key].collapse();
    });
  }
};

const refreshTree = () => {
  ElMessage.success("刷新成功");
};

const handleNodeClick = (data: TreeNode) => {
  selectedNode.value = data;
  buildPath(data);
  loadUserList(data.id);
};

const buildPath = (node: TreeNode) => {
  const path: Array<{ id: string; name: string }> = [];
  const findPath = (
    nodes: TreeNode[],
    targetId: string,
    currentPath: Array<{ id: string; name: string }>
  ) => {
    for (const n of nodes) {
      const newPath = [...currentPath, { id: n.id, name: n.name }];
      if (n.id === targetId) {
        path.push(...newPath);
        return true;
      }
      if (n.children && findPath(n.children, targetId, newPath)) {
        return true;
      }
    }
    return false;
  };
  findPath(treeData.value, node.id, []);
  selectedPath.value = path;
};

const handleBreadcrumbClick = (item: { id: string; name: string }) => {
  const findNode = (nodes: TreeNode[]): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === item.id) return node;
      if (node.children) {
        const found = findNode(node.children);
        if (found) return found;
      }
    }
    return null;
  };
  const node = findNode(treeData.value);
  if (node) {
    handleNodeClick(node);
    treeRef.value?.setCurrentKey(node.id);
  }
};

const handleSearch = () => {
  if (!searchKeyword.value) {
    resetSearchHighlight();
    return;
  }
  highlightSearchResults(searchKeyword.value);
};

const highlightSearchResults = (keyword: string) => {
  const search = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      node.isSearchMatch =
        node.name.includes(keyword) || node.code.includes(keyword);
      if (node.children) {
        search(node.children);
      }
    });
  };
  search(treeData.value);
};

const resetSearchHighlight = () => {
  const reset = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      node.isSearchMatch = false;
      if (node.children) {
        reset(node.children);
      }
    });
  };
  reset(treeData.value);
};

const handleAdvancedSearch = () => {
  ElMessage.info("高级搜索功能");
};

const resetAdvancedSearch = () => {
  Object.assign(advancedSearchForm, { name: "", code: "", manager: "" });
};

const handleAdd = () => {
  if (!selectedNode.value) {
    ElMessage.warning("请先选择上级机构");
    return;
  }
  isEdit.value = false;
  addForm.parentId = selectedNode.value.id;
  addForm.parentName = selectedNode.value.name;
  addForm.name = "";
  addForm.code = "";
  addForm.manager = "";
  addForm.type = "";
  addForm.remark = "";
  nameConflict.value = false;
  codeConflict.value = false;
  addDialogVisible.value = true;
};

const checkNameConflict = () => {
  // 模拟校验
  nameConflict.value = false;
};

const checkCodeConflict = () => {
  // 模拟校验
  codeConflict.value = false;
};

const saveDraft = () => {
  addFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success("草稿保存成功");
      addDialogVisible.value = false;
    }
  });
};

const submitApproval = () => {
  addFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success("提交审批成功");
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
      { row: 3, reason: "机构编码重复" },
      { row: 5, reason: "上级机构编码不存在" }
    ];
  }, 2000);
};

const downloadErrorReport = () => {
  ElMessage.success("校验报告下载成功");
};

const confirmImport = () => {
  ElMessage.success("批量导入成功");
  importDialogVisible.value = false;
};

const loadUserList = (orgId: string) => {
  // 模拟加载用户列表
  userTotal.value = userList.value.length;
};

const viewUserDetail = (user: any) => {
  ElMessage.info(`查看用户：${user.name}`);
};

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    company: "公司",
    department: "部门",
    group: "小组"
  };
  return map[type] || type;
};

const getTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    company: "primary",
    department: "success",
    group: "info"
  };
  return map[type] || "";
};

const getStatusTagType = (status?: string) => {
  if (status === "已审批") return "success";
  if (status === "待审批") return "warning";
  return "info";
};

const showNodeTooltip = (data: TreeNode) => {
  // 可以显示tooltip
};

onMounted(() => {
  // 初始化
});
</script>

<style scoped lang="scss">
.organization-management {
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

    .left-tree {
      width: 350px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      padding: 15px;
      transition: width 0.3s;
      overflow: auto;

      &.collapsed {
        width: 0;
        padding: 0;
        border: none;
        overflow: hidden;
      }

      .tree-toolbar {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
      }

      .search-bar {
        margin-bottom: 15px;

        .el-button {
          margin-top: 10px;
        }
      }

      .advanced-search-panel {
        margin-bottom: 15px;
        padding: 15px;
        background: #f5f7fa;
        border-radius: 4px;
      }

      .org-tree {
        .tree-node {
          display: flex;
          align-items: center;
          flex: 1;
          font-size: 14px;
          padding-right: 8px;

          &.is-highlight {
            background-color: #fff7e6;
            border: 1px solid #ffa940;
            border-radius: 4px;
            padding: 2px 4px;
          }
        }
      }
    }

    .right-content {
      flex: 1;
      display: flex;
      flex-direction: column;

      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #dcdfe6;

        .path-display {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .actions {
          display: flex;
          gap: 10px;
        }
      }

      .detail-panel {
        flex: 1;
        overflow: auto;

        .approval-flow {
          margin-top: 20px;
          padding: 20px;
          background: #f5f7fa;
          border-radius: 4px;
        }
      }
    }
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
