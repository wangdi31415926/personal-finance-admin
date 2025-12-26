<template>
  <div class="user-management">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="title">用户管理</span>
        </div>
      </template>

      <div class="content-wrapper">
        <!-- 左侧列表 -->
        <div class="left-list">
          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户名/工号/手机号"
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
                <el-form-item label="用户名">
                  <el-input
                    v-model="advancedSearchForm.name"
                    placeholder="请输入用户名"
                  />
                </el-form-item>
                <el-form-item label="工号">
                  <el-input
                    v-model="advancedSearchForm.workNo"
                    placeholder="请输入工号"
                  />
                </el-form-item>
                <el-form-item label="所属机构">
                  <el-input
                    v-model="advancedSearchForm.org"
                    placeholder="请输入机构名称"
                  />
                </el-form-item>
                <el-form-item label="岗位">
                  <el-input
                    v-model="advancedSearchForm.position"
                    placeholder="请输入岗位"
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

          <!-- 操作栏 -->
          <div class="toolbar">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              添加用户
            </el-button>
          </div>

          <!-- 用户列表 -->
          <el-table
            :data="filteredUserList"
            highlight-current-row
            @current-change="handleRowClick"
            style="width: 100%"
            height="calc(100vh - 400px)"
            @sort-change="handleSortChange"
          >
            <el-table-column
              prop="name"
              label="用户名"
              width="120"
              sortable="custom"
            />
            <el-table-column
              prop="workNo"
              label="工号"
              width="120"
              sortable="custom"
            />
            <el-table-column
              prop="org"
              label="所属机构"
              width="150"
              sortable="custom"
            />
            <el-table-column prop="position" label="岗位" width="120" />
            <el-table-column prop="phone" label="手机号" width="130" />
            <el-table-column
              prop="createTime"
              label="创建时间"
              width="150"
              sortable="custom"
            />
            <el-table-column label="操作" width="100" fixed="right">
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

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="userPage"
            v-model:page-size="userPageSize"
            :page-sizes="[10, 20, 50]"
            :total="userTotal"
            layout="total, sizes, prev, pager, next, jumper"
            style="margin-top: 15px"
          />
        </div>

        <!-- 右侧详情 -->
        <div class="right-detail">
          <div v-if="selectedUser" class="detail-content">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="基础信息" name="basic">
                <div class="detail-header">
                  <h3>{{ selectedUser.name }}</h3>
                  <el-button type="primary" @click="exportUser">
                    <el-icon><Download /></el-icon>
                    导出PDF
                  </el-button>
                </div>
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="用户名">
                    {{ selectedUser.name }}
                  </el-descriptions-item>
                  <el-descriptions-item label="工号">
                    {{ selectedUser.workNo }}
                  </el-descriptions-item>
                  <el-descriptions-item label="手机号">
                    {{ selectedUser.phone }}
                  </el-descriptions-item>
                  <el-descriptions-item label="邮箱">
                    {{ selectedUser.email || "无" }}
                  </el-descriptions-item>
                  <el-descriptions-item label="初始密码" :span="2">
                    {{ selectedUser.initPassword || "无" }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>

              <el-tab-pane label="关联信息" name="relation">
                <el-collapse v-model="activeCollapse">
                  <el-collapse-item title="所属机构" name="org">
                    <div>
                      <p><strong>机构名称：</strong>{{ selectedUser.org }}</p>
                      <p>
                        <strong>层级路径：</strong>{{ selectedUser.orgPath }}
                      </p>
                      <el-button link type="primary" @click="viewOrgDetail"
                        >查看机构详情</el-button
                      >
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="关联岗位" name="position">
                    <div>
                      <p>
                        <strong>岗位名称：</strong>{{ selectedUser.position }}
                      </p>
                      <el-button
                        link
                        type="primary"
                        @click="viewPositionDetail"
                      >
                        查看岗位详情
                      </el-button>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </el-tab-pane>
            </el-tabs>
          </div>
          <el-empty v-else description="请从左侧选择用户查看详情" />
        </div>
      </div>
    </el-card>

    <!-- 添加用户弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      :title="isBatch ? '批量添加用户' : '添加用户'"
      width="700px"
    >
      <div v-if="!isBatch" class="single-add-form">
        <el-form
          ref="addFormRef"
          :model="addForm"
          :rules="addFormRules"
          label-width="120px"
        >
          <el-form-item label="用户姓名" prop="name">
            <el-input v-model="addForm.name" placeholder="请输入用户姓名" />
          </el-form-item>
          <el-form-item label="账号" prop="account">
            <el-input v-model="addForm.account" placeholder="请输入账号" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="addForm.password"
              type="password"
              placeholder="请输入密码（需符合复杂度要求）"
              show-password
            />
            <div class="password-tip">
              密码需包含大小写字母、数字，长度8-20位
            </div>
          </el-form-item>
          <el-form-item label="所属机构" prop="orgId">
            <el-input
              :value="addForm.orgName || ''"
              placeholder="请选择所属机构"
              readonly
              @click="orgSelectorVisible = true"
              style="cursor: pointer"
            >
              <template #suffix>
                <el-icon><ArrowDown /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="addForm.phone" placeholder="请输入联系电话" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="addForm.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="默认权限组">
            <el-checkbox-group v-model="addForm.permissionGroups">
              <el-checkbox label="基础权限组">基础权限组</el-checkbox>
              <el-checkbox label="普通用户组">普通用户组</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
        <div class="form-actions">
          <el-button @click="handleBatchAdd">批量添加</el-button>
        </div>
      </div>

      <div v-else class="batch-add-form">
        <el-steps :active="batchStep" finish-status="success" align-center>
          <el-step title="下载模板" />
          <el-step title="上传文件" />
          <el-step title="校验结果" />
          <el-step title="提交结果" />
        </el-steps>

        <div class="batch-content" style="margin-top: 30px">
          <!-- 步骤1：下载模板 -->
          <div v-if="batchStep === 0" class="batch-step">
            <el-button type="primary" @click="downloadTemplate">
              <el-icon><Download /></el-icon>
              点击下载模板
            </el-button>
            <div class="template-desc" style="margin-top: 20px">
              <h4>模板填写说明：</h4>
              <ul>
                <li>用户姓名：必填</li>
                <li>账号：必填，不能重复</li>
                <li>密码：必填，需符合复杂度要求</li>
                <li>所属机构编码：必填，必须已存在</li>
                <li>联系电话：必填</li>
              </ul>
            </div>
          </div>

          <!-- 步骤2：上传文件 -->
          <div v-if="batchStep === 1" class="batch-step">
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
                <div class="el-upload__tip">
                  只能上传Excel文件，且不超过10MB
                </div>
              </template>
            </el-upload>
            <div v-if="selectedFile" style="margin-top: 20px">
              <p>已选择文件：{{ selectedFile.name }}</p>
              <el-button type="primary" @click="validateFile"
                >批量校验</el-button
              >
            </div>
          </div>

          <!-- 步骤3：校验结果 -->
          <div v-if="batchStep === 2" class="batch-step">
            <div v-if="validating" class="validating">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>校验中...</span>
            </div>
            <div v-else>
              <div class="result-summary">
                <el-alert
                  :title="`校验完成：成功 ${batchResult.success} 条，失败 ${batchResult.fail} 条`"
                  :type="batchResult.fail > 0 ? 'warning' : 'success'"
                  :closable="false"
                />
              </div>
              <el-table
                v-if="batchResult.errors.length > 0"
                :data="batchResult.errors"
                border
                style="margin-top: 20px"
                max-height="300"
              >
                <el-table-column prop="row" label="行号" width="80" />
                <el-table-column prop="reason" label="失败原因" />
              </el-table>
              <div v-if="batchResult.fail > 0" style="margin-top: 20px">
                <el-button @click="downloadErrorReport">导出失败记录</el-button>
              </div>
            </div>
          </div>

          <!-- 步骤4：提交结果 -->
          <div v-if="batchStep === 3" class="batch-step">
            <div v-if="validating" class="validating">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>正在提交...</span>
            </div>
            <div v-else>
              <div class="result-summary">
                <el-alert
                  :title="`批量添加完成：成功 ${batchResult.success} 条，失败 ${batchResult.fail} 条`"
                  :type="batchResult.fail > 0 ? 'warning' : 'success'"
                  :closable="false"
                />
              </div>
              <div v-if="batchResult.fail > 0" style="margin-top: 20px">
                <el-button @click="downloadErrorReport">导出失败记录</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button v-if="batchStep > 0 && batchStep < 3" @click="batchStep--"
          >上一步</el-button
        >
        <el-button @click="closeAddDialog">取消</el-button>
        <el-button v-if="!isBatch" type="primary" @click="submitSingleUser">
          提交
        </el-button>
        <el-button
          v-if="isBatch && batchStep === 1"
          type="primary"
          @click="validateFile"
        >
          下一步校验
        </el-button>
        <el-button
          v-if="isBatch && batchStep === 2 && batchResult.fail === 0"
          type="primary"
          @click="batchSubmit"
        >
          批量提交
        </el-button>
        <el-button
          v-if="isBatch && batchStep === 2 && batchResult.fail > 0"
          @click="batchStep = 1"
        >
          重新上传
        </el-button>
        <el-button
          v-if="isBatch && batchStep === 3"
          type="primary"
          @click="closeAddDialog"
        >
          关闭
        </el-button>
      </template>
    </el-dialog>

    <!-- 组织机构选择弹窗 -->
    <el-dialog v-model="orgSelectorVisible" title="选择组织机构" width="700px">
      <div class="org-selector-wrapper">
        <!-- 常用机构快捷选择 -->
        <div v-if="commonOrgs.length > 0" class="common-orgs">
          <div class="common-orgs-label">常用机构：</div>
          <el-tag
            v-for="org in commonOrgs"
            :key="org.id"
            type="info"
            style="margin-right: 10px; margin-bottom: 10px; cursor: pointer"
            @click="selectCommonOrg(org)"
          >
            {{ org.name }}
          </el-tag>
        </div>

        <!-- 搜索栏 -->
        <div class="org-search-bar">
          <el-input
            v-model="orgSearchKeyword"
            placeholder="搜索机构名称/编码"
            clearable
            @input="handleOrgSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 树形选择 -->
        <div class="org-tree-container">
          <el-tree
            ref="orgTreeRef"
            :data="filteredOrgTreeData"
            :props="{ children: 'children', label: 'name' }"
            @node-click="handleOrgNodeClick"
            highlight-current
            node-key="id"
            :default-expand-all="false"
            :filter-node-method="filterOrgNode"
          >
            <template #default="{ node, data }">
              <span class="tree-node-content">
                <el-icon v-if="data.type === 'company'"
                  ><OfficeBuilding
                /></el-icon>
                <el-icon v-else-if="data.type === 'department'"
                  ><Suitcase
                /></el-icon>
                <el-icon v-else><Folder /></el-icon>
                <span>{{ node.label }}</span>
                <span v-if="data.path" class="org-path">
                  ({{ data.path }})
                </span>
                <el-tag
                  v-if="data.disabled"
                  size="small"
                  type="info"
                  style="margin-left: 8px"
                >
                  {{ data.disabledReason }}
                </el-tag>
              </span>
            </template>
          </el-tree>
        </div>

        <!-- 已选机构显示 -->
        <div v-if="selectedOrgNode" class="selected-org-display">
          <div class="selected-label">已选择：</div>
          <div class="selected-content">
            <el-tag type="primary" size="large">
              {{ selectedOrgNode.name }}
            </el-tag>
            <span v-if="selectedOrgNode.path" class="selected-path">
              {{ selectedOrgNode.path }}
            </span>
            <el-button
              link
              type="primary"
              size="small"
              @click="clearSelectedOrg"
            >
              重新选择
            </el-button>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="orgSelectorVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmOrgSelect">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Search,
  ArrowDown,
  ArrowUp,
  Close,
  Download,
  Loading,
  UploadFilled,
  OfficeBuilding,
  Suitcase,
  Folder
} from "@element-plus/icons-vue";

interface OrgNode {
  id: string;
  name: string;
  code?: string;
  path?: string;
  type?: string;
  disabled?: boolean;
  disabledReason?: string;
  children?: OrgNode[];
}

interface User {
  id: string;
  name: string;
  workNo: string;
  org: string;
  orgPath?: string;
  position?: string;
  phone: string;
  email?: string;
  initPassword?: string;
  createTime: string;
}

const searchKeyword = ref("");
const showAdvancedSearch = ref(false);
const selectedUser = ref<User | null>(null);
const activeTab = ref("basic");
const activeCollapse = ref(["org", "position"]);
const addDialogVisible = ref(false);
const isBatch = ref(false);
const batchStep = ref(0);
const validating = ref(false);
const selectedFile = ref<any>(null);
const fileList = ref([]);
const uploadRef = ref();
const orgSelectorVisible = ref(false);
const selectedOrgNode = ref<OrgNode | null>(null);
const orgSearchKeyword = ref("");
const orgTreeRef = ref();
const userPage = ref(1);
const userPageSize = ref(10);
const userTotal = ref(0);
const sortConfig = ref<{ prop?: string; order?: string }>({});

// 常用机构（最近3次选择）
const commonOrgs = ref<OrgNode[]>([]);

const orgTreeData = ref<OrgNode[]>([
  {
    id: "1",
    name: "总公司",
    code: "ORG001",
    path: "总公司",
    type: "company",
    children: [
      {
        id: "2",
        name: "技术部",
        code: "ORG002",
        path: "总公司/技术部",
        type: "department",
        children: [
          {
            id: "3",
            name: "前端组",
            code: "ORG003",
            path: "总公司/技术部/前端组",
            type: "group"
          },
          {
            id: "4",
            name: "后端组",
            code: "ORG004",
            path: "总公司/技术部/后端组",
            type: "group"
          }
        ]
      },
      {
        id: "5",
        name: "市场部",
        code: "ORG005",
        path: "总公司/市场部",
        type: "department"
      }
    ]
  }
]);

// 递归过滤树数据
const filterTreeData = (data: OrgNode[], keyword: string): OrgNode[] => {
  const result: OrgNode[] = [];
  const lowerKeyword = keyword.toLowerCase();

  data.forEach(node => {
    const match =
      node.name.toLowerCase().includes(lowerKeyword) ||
      (node.code && node.code.toLowerCase().includes(lowerKeyword));

    const children = node.children
      ? filterTreeData(node.children, keyword)
      : [];

    if (match || children.length > 0) {
      result.push({
        ...node,
        children: children.length > 0 ? children : node.children
      });
    }
  });

  return result;
};

// 过滤后的组织树数据
const filteredOrgTreeData = computed(() => {
  if (!orgSearchKeyword.value) return orgTreeData.value;
  return filterTreeData(orgTreeData.value, orgSearchKeyword.value);
});

const advancedSearchForm = reactive({
  name: "",
  workNo: "",
  org: "",
  position: ""
});

const addForm = reactive({
  name: "",
  account: "",
  password: "",
  orgId: "",
  orgName: "",
  phone: "",
  email: "",
  permissionGroups: []
});

const addFormRules = {
  name: [{ required: true, message: "请输入用户姓名", trigger: "blur" }],
  account: [{ required: true, message: "请输入账号", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/,
      message: "密码需包含大小写字母、数字，长度8-20位",
      trigger: "blur"
    }
  ],
  orgId: [{ required: true, message: "请选择所属机构", trigger: "change" }],
  phone: [{ required: true, message: "请输入联系电话", trigger: "blur" }]
};

const addFormRef = ref();

const batchResult = reactive({
  success: 0,
  fail: 0,
  errors: [] as Array<{ row: number; reason: string }>
});

// 测试数据
const userList = ref<User[]>([
  {
    id: "1",
    name: "张三",
    workNo: "U001",
    org: "技术部",
    orgPath: "总公司/技术部",
    position: "前端工程师",
    phone: "13800138000",
    email: "zhangsan@example.com",
    initPassword: "Init123456",
    createTime: "2024-01-01 10:00:00"
  },
  {
    id: "2",
    name: "李四",
    workNo: "U002",
    org: "技术部",
    orgPath: "总公司/技术部",
    position: "后端工程师",
    phone: "13800138001",
    email: "lisi@example.com",
    initPassword: "Init123456",
    createTime: "2024-01-01 11:00:00"
  },
  {
    id: "3",
    name: "王五",
    workNo: "U003",
    org: "市场部",
    orgPath: "总公司/市场部",
    position: "产品经理",
    phone: "13800138002",
    email: "wangwu@example.com",
    initPassword: "Init123456",
    createTime: "2024-01-02 10:00:00"
  },
  {
    id: "4",
    name: "赵六",
    workNo: "U004",
    org: "前端组",
    orgPath: "总公司/技术部/前端组",
    position: "前端工程师",
    phone: "13800138003",
    email: "zhaoliu@example.com",
    initPassword: "Init123456",
    createTime: "2024-01-03 10:00:00"
  }
]);

const filteredUserList = computed(() => {
  let result = userList.value;

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(
      u =>
        u.name.includes(keyword) ||
        u.workNo.includes(keyword) ||
        u.phone.includes(keyword)
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

const handleOrgNodeClick = (data: OrgNode) => {
  // 检查是否禁用
  if (data.disabled) {
    ElMessage.warning(data.disabledReason || "该机构不可选");
    return;
  }

  // 检查是否已绑定机构（唯一性校验）
  if (addForm.orgId && addForm.orgId !== data.id) {
    ElMessageBox.confirm(
      "该用户已绑定机构，选择新机构将替换原有绑定，是否继续？",
      "确认重新绑定",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    )
      .then(() => {
        selectedOrgNode.value = data;
        ElMessage.success("机构已重新选择");
      })
      .catch(() => {
        // 用户取消
      });
  } else {
    selectedOrgNode.value = data;
  }
};

const confirmOrgSelect = () => {
  if (!selectedOrgNode.value) {
    ElMessage.warning("请选择机构");
    return;
  }

  addForm.orgId = selectedOrgNode.value.id;
  addForm.orgName = selectedOrgNode.value.path || selectedOrgNode.value.name;

  // 保存到常用机构（最多3个）
  const existingIndex = commonOrgs.value.findIndex(
    org => org.id === selectedOrgNode.value!.id
  );
  if (existingIndex > -1) {
    commonOrgs.value.splice(existingIndex, 1);
  }
  commonOrgs.value.unshift({ ...selectedOrgNode.value });
  if (commonOrgs.value.length > 3) {
    commonOrgs.value = commonOrgs.value.slice(0, 3);
  }

  orgSelectorVisible.value = false;
  ElMessage.success("机构选择成功");
};

const selectCommonOrg = (org: OrgNode) => {
  selectedOrgNode.value = org;
  // 高亮树中的节点
  nextTick(() => {
    orgTreeRef.value?.setCurrentKey(org.id);
  });
};

const clearSelectedOrg = () => {
  selectedOrgNode.value = null;
  addForm.orgId = "";
  addForm.orgName = "";
  orgTreeRef.value?.setCurrentKey(null);
};

const handleOrgSearch = () => {
  if (orgTreeRef.value) {
    orgTreeRef.value.filter(orgSearchKeyword.value);
  }
};

const filterOrgNode = (value: string, data: OrgNode) => {
  if (!value) return true;
  const keyword = value.toLowerCase();
  return (
    data.name.toLowerCase().includes(keyword) ||
    (data.code && data.code.toLowerCase().includes(keyword))
  );
};

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
    name: "",
    workNo: "",
    org: "",
    position: ""
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

const handleRowClick = (row: User) => {
  selectedUser.value = row;
  activeTab.value = "basic";
};

const handleAdd = () => {
  isBatch.value = false;
  batchStep.value = 0;
  Object.assign(addForm, {
    name: "",
    account: "",
    password: "",
    orgId: "",
    orgName: "",
    phone: "",
    email: "",
    permissionGroups: []
  });
  addDialogVisible.value = true;
};

const handleBatchAdd = () => {
  isBatch.value = true;
  batchStep.value = 0;
  fileList.value = [];
  selectedFile.value = null;
  batchResult.success = 0;
  batchResult.fail = 0;
  batchResult.errors = [];
  // 重置表单
  Object.assign(addForm, {
    name: "",
    account: "",
    password: "",
    orgId: "",
    orgName: "",
    phone: "",
    email: "",
    permissionGroups: []
  });
};

const submitSingleUser = () => {
  addFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success("用户添加成功");
      addDialogVisible.value = false;
    }
  });
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
  batchStep.value = 2;

  // 模拟校验
  setTimeout(() => {
    validating.value = false;
    batchResult.success = 8;
    batchResult.fail = 2;
    batchResult.errors = [
      { row: 3, reason: "账号重复" },
      { row: 5, reason: "所属机构编码不存在" }
    ];
    ElMessage.info("文件校验完成");
  }, 2000);
};

const downloadErrorReport = () => {
  ElMessage.success("失败记录导出成功");
};

const batchSubmit = () => {
  batchStep.value = 3;
  validating.value = true;

  // 模拟提交
  setTimeout(() => {
    validating.value = false;
    // 更新结果（模拟实际提交后的结果）
    const actualSuccess = batchResult.success;
    const actualFail = batchResult.fail;
    batchResult.success = actualSuccess;
    batchResult.fail = actualFail;

    ElMessage.success(
      `批量添加完成：成功 ${actualSuccess} 条，失败 ${actualFail} 条`
    );
  }, 1500);
};

const closeAddDialog = () => {
  addDialogVisible.value = false;
  isBatch.value = false;
  batchStep.value = 0;
  // 重置状态
  selectedFile.value = null;
  fileList.value = [];
  orgSearchKeyword.value = "";
  selectedOrgNode.value = null;
  // 重置表单
  Object.assign(addForm, {
    name: "",
    account: "",
    password: "",
    orgId: "",
    orgName: "",
    phone: "",
    email: "",
    permissionGroups: []
  });
};

const viewUserDetail = (user: User) => {
  selectedUser.value = user;
};

const viewOrgDetail = () => {
  ElMessage.info("查看机构详情");
};

const viewPositionDetail = () => {
  ElMessage.info("查看岗位详情");
};

const exportUser = () => {
  ElMessage.success("用户信息PDF导出成功");
};

onMounted(() => {
  userTotal.value = userList.value.length;
});
</script>

<style scoped lang="scss">
.user-management {
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

  .single-add-form {
    .password-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 5px;
    }

    .form-actions {
      margin-top: 20px;
      text-align: right;
    }
  }

  .batch-add-form {
    .batch-content {
      min-height: 300px;

      .batch-step {
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

  .org-selector-wrapper {
    .common-orgs {
      margin-bottom: 15px;
      padding: 15px;
      background: #f5f7fa;
      border-radius: 4px;

      .common-orgs-label {
        font-size: 14px;
        color: #606266;
        margin-bottom: 10px;
        font-weight: 500;
      }
    }

    .org-search-bar {
      margin-bottom: 15px;
    }

    .org-tree-container {
      max-height: 400px;
      overflow: auto;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      padding: 10px;

      .tree-node-content {
        display: flex;
        align-items: center;
        gap: 5px;
        flex: 1;

        .org-path {
          color: #909399;
          font-size: 12px;
          margin-left: 10px;
        }
      }
    }

    .selected-org-display {
      margin-top: 15px;
      padding: 15px;
      background: #ecf5ff;
      border: 1px solid #b3d8ff;
      border-radius: 4px;

      .selected-label {
        font-size: 14px;
        color: #606266;
        margin-bottom: 10px;
        font-weight: 500;
      }

      .selected-content {
        display: flex;
        align-items: center;
        gap: 10px;

        .selected-path {
          color: #606266;
          font-size: 14px;
        }
      }
    }
  }
}
</style>
