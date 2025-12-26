<template>
  <div class="position-management">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="title">岗位管理</span>
        </div>
      </template>

      <div class="content-wrapper">
        <!-- 左侧列表 -->
        <div class="left-list">
          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索岗位名称/编码"
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
                <el-form-item label="岗位名称">
                  <el-input
                    v-model="advancedSearchForm.name"
                    placeholder="请输入岗位名称"
                  />
                </el-form-item>
                <el-form-item label="岗位编码">
                  <el-input
                    v-model="advancedSearchForm.code"
                    placeholder="请输入岗位编码"
                  />
                </el-form-item>
                <el-form-item label="岗位类型">
                  <el-select
                    v-model="advancedSearchForm.type"
                    placeholder="请选择岗位类型"
                  >
                    <el-option label="管理岗" value="management" />
                    <el-option label="技术岗" value="technical" />
                    <el-option label="业务岗" value="business" />
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
              添加岗位
            </el-button>
            <el-button @click="handleOrgSelect">
              <el-icon><Connection /></el-icon>
              组织机构选择
            </el-button>
          </div>

          <!-- 岗位列表 -->
          <el-table
            :data="filteredPositionList"
            highlight-current-row
            @current-change="handleRowClick"
            style="width: 100%"
            height="calc(100vh - 400px)"
          >
            <el-table-column prop="name" label="岗位名称" width="150">
              <template #default="{ row }">
                <span :style="{ color: getTypeColor(row.type) }">{{
                  row.name
                }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="code" label="岗位编码" width="120" />
            <el-table-column prop="type" label="岗位类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getTypeTagType(row.type)" size="small">
                  {{ getTypeName(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="150" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag
                  :type="row.status === '正常' ? 'success' : 'danger'"
                  size="small"
                >
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 右侧详情 -->
        <div class="right-detail">
          <div v-if="selectedPosition" class="detail-content">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="基础信息" name="basic">
                <div class="detail-header">
                  <h3>{{ selectedPosition.name }}</h3>
                  <el-button type="primary" @click="exportPosition">
                    <el-icon><Download /></el-icon>
                    导出
                  </el-button>
                </div>
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="岗位编码">
                    {{ selectedPosition.code }}
                  </el-descriptions-item>
                  <el-descriptions-item label="岗位类型">
                    <el-tag :type="getTypeTagType(selectedPosition.type)">
                      {{ getTypeName(selectedPosition.type) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="岗位等级">
                    {{ selectedPosition.level }}
                  </el-descriptions-item>
                  <el-descriptions-item label="编制数量">
                    {{ selectedPosition.quota }}
                  </el-descriptions-item>
                  <el-descriptions-item label="创建时间" :span="2">
                    {{ selectedPosition.createTime }}
                  </el-descriptions-item>
                  <el-descriptions-item label="岗位职责" :span="2">
                    <div style="white-space: pre-wrap">
                      {{ selectedPosition.responsibility }}
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item label="备注" :span="2">
                    {{ selectedPosition.remark || "无" }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>

              <el-tab-pane label="关联组织" name="organizations">
                <div class="org-list-header">
                  <span
                    >已关联机构列表（{{
                      selectedPosition.orgList?.length || 0
                    }}）</span
                  >
                  <el-button link type="primary" @click="viewAllOrgs"
                    >查看全部</el-button
                  >
                </div>
                <el-table
                  :data="selectedPosition.orgList"
                  border
                  style="width: 100%"
                >
                  <el-table-column prop="name" label="机构名称" />
                  <el-table-column prop="path" label="层级路径" />
                  <el-table-column label="操作" width="120">
                    <template #default="{ row }">
                      <el-button
                        link
                        type="primary"
                        size="small"
                        @click="viewOrgDetail(row)"
                      >
                        查看详情
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-pagination
                  v-model:current-page="orgPage"
                  v-model:page-size="orgPageSize"
                  :page-sizes="[10, 20, 50]"
                  :total="selectedPosition.orgList?.length || 0"
                  layout="total, sizes, prev, pager, next, jumper"
                  style="margin-top: 20px"
                />
                <div style="margin-top: 20px">
                  <p>
                    当前在岗人数：{{ selectedPosition.currentCount || 0 }}人
                  </p>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
          <el-empty v-else description="请从左侧选择岗位查看详情" />
        </div>
      </div>
    </el-card>

    <!-- 添加岗位弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      :title="isEdit ? '编辑岗位' : '添加岗位'"
      width="700px"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="120px"
      >
        <el-form-item label="岗位名称" prop="name">
          <el-input
            v-model="addForm.name"
            placeholder="请输入岗位名称"
            @blur="checkNameConflict"
          />
          <div v-if="nameConflict" class="error-tip">该岗位名称已存在</div>
        </el-form-item>
        <el-form-item label="岗位编码" prop="code">
          <el-input
            v-model="addForm.code"
            placeholder="请输入岗位编码"
            @blur="checkCodeConflict"
          />
          <div v-if="codeConflict" class="error-tip">该岗位编码已存在</div>
        </el-form-item>
        <el-form-item label="岗位类型" prop="type">
          <el-select
            v-model="addForm.type"
            placeholder="请选择岗位类型"
            @change="handleTypeChange"
          >
            <el-option label="管理岗" value="management" />
            <el-option label="技术岗" value="technical" />
            <el-option label="业务岗" value="business" />
          </el-select>
        </el-form-item>
        <el-form-item label="岗位等级" prop="level">
          <el-select v-model="addForm.level" placeholder="请选择岗位等级">
            <el-option
              v-for="level in availableLevels"
              :key="level"
              :label="level"
              :value="level"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="岗位职责" prop="responsibility">
          <el-input
            v-model="addForm.responsibility"
            type="textarea"
            :rows="4"
            placeholder="请输入岗位职责"
          />
        </el-form-item>
        <el-form-item label="编制数量">
          <el-input-number v-model="addForm.quota" :min="1" />
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
        <el-button type="primary" @click="submitForm">提交</el-button>
      </template>
    </el-dialog>

    <!-- 组织机构选择弹窗 -->
    <el-dialog
      v-model="orgSelectDialogVisible"
      title="组织机构选择"
      width="900px"
    >
      <div class="org-select-wrapper">
        <!-- 岗位信息 -->
        <div class="position-info">
          <div class="info-display">
            <span>当前岗位：</span>
            <el-tag type="primary" size="large">{{
              currentPosition?.name || "未选择"
            }}</el-tag>
            <el-tag type="info" size="large" style="margin-left: 10px">
              {{
                currentPosition?.type ? getTypeName(currentPosition.type) : ""
              }}
            </el-tag>
          </div>
          <el-button link type="primary" @click="changePosition"
            >更换岗位</el-button
          >
        </div>

        <el-divider />

        <!-- 机构选择区 -->
        <div class="org-select-content">
          <!-- 左侧树形选择 -->
          <div class="left-tree">
            <div class="tree-search">
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
            <el-tree
              ref="orgTreeRef"
              :data="orgTreeData"
              :props="orgTreeProps"
              show-checkbox
              node-key="id"
              :default-expand-all="false"
              @check="handleOrgCheck"
              class="org-select-tree"
            >
              <template #default="{ node, data }">
                <span class="tree-node">
                  <el-icon v-if="data.type === 'company'"
                    ><OfficeBuilding
                  /></el-icon>
                  <el-icon v-else-if="data.type === 'department'"
                    ><Suitcase
                  /></el-icon>
                  <el-icon v-else><Folder /></el-icon>
                  <span>{{ node.label }}</span>
                  <el-tag
                    v-if="data.disabled"
                    size="small"
                    type="info"
                    style="margin-left: 8px"
                  >
                    不适配
                  </el-tag>
                </span>
              </template>
            </el-tree>
            <div class="selected-count">已选机构：{{ selectedOrgCount }}个</div>
          </div>

          <!-- 右侧已选列表 -->
          <div class="right-selected">
            <h4>已关联机构列表</h4>
            <div class="selected-orgs">
              <el-tag
                v-for="org in selectedOrgs"
                :key="org.id"
                closable
                @close="removeOrg(org)"
                style="margin: 5px"
              >
                {{ org.name }} ({{ org.code }})
              </el-tag>
            </div>
            <el-empty
              v-if="selectedOrgs.length === 0"
              description="暂未选择机构"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="orgSelectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmOrgSelect">确认</el-button>
      </template>
    </el-dialog>

    <!-- 选择岗位弹窗 -->
    <el-dialog
      v-model="positionSelectDialogVisible"
      title="选择岗位"
      width="600px"
    >
      <el-table
        :data="positionList"
        highlight-current-row
        @current-change="handlePositionSelect"
        style="width: 100%"
      >
        <el-table-column prop="name" label="岗位名称" />
        <el-table-column prop="code" label="岗位编码" />
        <el-table-column prop="type" label="岗位类型">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="positionSelectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPositionSelect"
          >确认</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Search,
  ArrowDown,
  ArrowUp,
  Close,
  Connection,
  Download,
  OfficeBuilding,
  Suitcase,
  Folder
} from "@element-plus/icons-vue";

interface Position {
  id: string;
  name: string;
  code: string;
  type: string;
  level?: string;
  quota?: number;
  responsibility?: string;
  remark?: string;
  createTime: string;
  status: string;
  orgList?: Array<{
    id: string;
    name: string;
    code: string;
    path: string;
  }>;
  currentCount?: number;
}

interface OrgNode {
  id: string;
  name: string;
  code: string;
  type: string;
  disabled?: boolean;
  children?: OrgNode[];
}

const searchKeyword = ref("");
const showAdvancedSearch = ref(false);
const selectedPosition = ref<Position | null>(null);
const activeTab = ref("basic");
const addDialogVisible = ref(false);
const isEdit = ref(false);
const nameConflict = ref(false);
const codeConflict = ref(false);
const orgSelectDialogVisible = ref(false);
const positionSelectDialogVisible = ref(false);
const currentPosition = ref<Position | null>(null);
const orgSearchKeyword = ref("");
const orgTreeRef = ref();
const selectedOrgs = ref<Array<{ id: string; name: string; code: string }>>([]);
const orgPage = ref(1);
const orgPageSize = ref(10);

const advancedSearchForm = reactive({
  name: "",
  code: "",
  type: ""
});

const addForm = reactive({
  name: "",
  code: "",
  type: "",
  level: "",
  responsibility: "",
  quota: 1,
  remark: ""
});

const addFormRules = {
  name: [{ required: true, message: "请输入岗位名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入岗位编码", trigger: "blur" }],
  type: [{ required: true, message: "请选择岗位类型", trigger: "change" }],
  level: [{ required: true, message: "请选择岗位等级", trigger: "change" }],
  responsibility: [
    { required: true, message: "请输入岗位职责", trigger: "blur" }
  ]
};

const addFormRef = ref();

const availableLevels = ref<string[]>([]);

// 测试数据
const positionList = ref<Position[]>([
  {
    id: "1",
    name: "前端工程师",
    code: "POS001",
    type: "technical",
    level: "P5",
    quota: 10,
    responsibility: "负责前端页面开发\n负责前端性能优化\n负责前端技术选型",
    createTime: "2024-01-01 10:00:00",
    status: "正常",
    orgList: [
      { id: "1", name: "技术部", code: "ORG002", path: "总公司/技术部" },
      { id: "2", name: "前端组", code: "ORG003", path: "总公司/技术部/前端组" }
    ],
    currentCount: 8
  },
  {
    id: "2",
    name: "后端工程师",
    code: "POS002",
    type: "technical",
    level: "P5",
    quota: 15,
    responsibility: "负责后端接口开发\n负责数据库设计\n负责系统架构设计",
    createTime: "2024-01-01 11:00:00",
    status: "正常",
    orgList: [
      { id: "1", name: "技术部", code: "ORG002", path: "总公司/技术部" },
      { id: "2", name: "后端组", code: "ORG004", path: "总公司/技术部/后端组" }
    ],
    currentCount: 12
  },
  {
    id: "3",
    name: "产品经理",
    code: "POS003",
    type: "business",
    level: "P6",
    quota: 5,
    responsibility: "负责产品规划\n负责需求分析\n负责项目管理",
    createTime: "2024-01-02 10:00:00",
    status: "正常",
    orgList: [
      { id: "3", name: "市场部", code: "ORG005", path: "总公司/市场部" }
    ],
    currentCount: 3
  },
  {
    id: "4",
    name: "部门经理",
    code: "POS004",
    type: "management",
    level: "M3",
    quota: 8,
    responsibility: "负责部门管理\n负责团队建设\n负责业务规划",
    createTime: "2024-01-02 14:00:00",
    status: "正常",
    orgList: [
      { id: "1", name: "技术部", code: "ORG002", path: "总公司/技术部" },
      { id: "3", name: "市场部", code: "ORG005", path: "总公司/市场部" }
    ],
    currentCount: 6
  }
]);

const orgTreeData = ref<OrgNode[]>([
  {
    id: "1",
    name: "总公司",
    code: "ORG001",
    type: "company",
    children: [
      {
        id: "2",
        name: "技术部",
        code: "ORG002",
        type: "department",
        children: [
          {
            id: "3",
            name: "前端组",
            code: "ORG003",
            type: "group"
          },
          {
            id: "4",
            name: "后端组",
            code: "ORG004",
            type: "group"
          }
        ]
      },
      {
        id: "5",
        name: "市场部",
        code: "ORG005",
        type: "department"
      }
    ]
  }
]);

const orgTreeProps = {
  children: "children",
  label: "name"
};

const filteredPositionList = computed(() => {
  if (!searchKeyword.value) return positionList.value;
  const keyword = searchKeyword.value.toLowerCase();
  return positionList.value.filter(
    p => p.name.includes(keyword) || p.code.includes(keyword)
  );
});

const selectedOrgCount = computed(() => {
  return selectedOrgs.value.length;
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
  Object.assign(advancedSearchForm, { name: "", code: "", type: "" });
};

const handleRowClick = (row: Position) => {
  selectedPosition.value = row;
  activeTab.value = "basic";
};

const handleAdd = () => {
  isEdit.value = false;
  Object.assign(addForm, {
    name: "",
    code: "",
    type: "",
    level: "",
    responsibility: "",
    quota: 1,
    remark: ""
  });
  nameConflict.value = false;
  codeConflict.value = false;
  addDialogVisible.value = true;
};

const handleTypeChange = () => {
  // 根据岗位类型过滤可用等级
  if (addForm.type === "management") {
    availableLevels.value = ["M1", "M2", "M3", "M4"];
  } else if (addForm.type === "technical") {
    availableLevels.value = ["P3", "P4", "P5", "P6", "P7"];
  } else {
    availableLevels.value = ["P3", "P4", "P5", "P6"];
  }
  addForm.level = "";
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

const submitForm = () => {
  addFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      // 检查关键词提示
      if (addForm.name.includes("核心") || addForm.name.includes("安全")) {
        ElMessageBox.alert(
          "该岗位涉及核心或安全职能，请确保权限配置正确",
          "提示",
          {
            confirmButtonText: "确定"
          }
        );
      }
      ElMessage.success("岗位添加成功");
      ElMessageBox.confirm("是否前往组织关联页面配置适配组织？", "提示", {
        confirmButtonText: "去关联",
        cancelButtonText: "返回列表",
        type: "info"
      })
        .then(() => {
          handleOrgSelect();
        })
        .catch(() => {
          addDialogVisible.value = false;
        });
    }
  });
};

const handleOrgSelect = () => {
  if (!selectedPosition.value) {
    ElMessage.warning("请先选择岗位");
    return;
  }
  currentPosition.value = selectedPosition.value;
  selectedOrgs.value =
    selectedPosition.value.orgList?.map(org => ({
      id: org.id,
      name: org.name,
      code: org.code
    })) || [];
  orgSelectDialogVisible.value = true;
};

const changePosition = () => {
  positionSelectDialogVisible.value = true;
};

const handlePositionSelect = (row: Position) => {
  currentPosition.value = row;
};

const confirmPositionSelect = () => {
  if (!currentPosition.value) {
    ElMessage.warning("请选择岗位");
    return;
  }
  positionSelectDialogVisible.value = false;
  selectedOrgs.value =
    currentPosition.value.orgList?.map(org => ({
      id: org.id,
      name: org.name,
      code: org.code
    })) || [];
};

const handleOrgSearch = () => {
  // 搜索逻辑
};

const handleOrgCheck = (data: OrgNode, checked: any) => {
  const checkedKeys = checked.checkedKeys || [];
  const halfCheckedKeys = checked.halfCheckedKeys || [];

  // 检查重复关联
  const existingOrg = selectedOrgs.value.find(org => org.id === data.id);
  if (existingOrg && !checkedKeys.includes(data.id)) {
    ElMessage.warning("该机构已关联，请勿重复选择");
    return;
  }

  // 更新已选列表
  if (checkedKeys.includes(data.id)) {
    if (!existingOrg) {
      selectedOrgs.value.push({
        id: data.id,
        name: data.name,
        code: data.code
      });
    }
  } else {
    const index = selectedOrgs.value.findIndex(org => org.id === data.id);
    if (index > -1) {
      selectedOrgs.value.splice(index, 1);
    }
  }
};

const removeOrg = (org: { id: string; name: string; code: string }) => {
  const index = selectedOrgs.value.findIndex(o => o.id === org.id);
  if (index > -1) {
    selectedOrgs.value.splice(index, 1);
    // 取消树中的选中状态
    orgTreeRef.value?.setChecked(org.id, false);
  }
};

const confirmOrgSelect = () => {
  if (!currentPosition.value) {
    ElMessage.warning("请先选择岗位");
    return;
  }
  ElMessage.success("机构关联成功");
  orgSelectDialogVisible.value = false;
  // 更新岗位的机构列表
  if (selectedPosition.value) {
    selectedPosition.value.orgList = selectedOrgs.value.map(org => ({
      id: org.id,
      name: org.name,
      code: org.code,
      path: `${org.name}`
    }));
  }
};

const viewAllOrgs = () => {
  handleOrgSelect();
};

const viewOrgDetail = (org: any) => {
  ElMessage.info(`查看机构：${org.name}`);
};

const exportPosition = () => {
  ElMessage.success("岗位说明书导出成功");
};

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    management: "管理岗",
    technical: "技术岗",
    business: "业务岗"
  };
  return map[type] || type;
};

const getTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    management: "primary",
    technical: "success",
    business: "warning"
  };
  return map[type] || "";
};

const getTypeColor = (type: string) => {
  const map: Record<string, string> = {
    management: "#409eff",
    technical: "#67c23a",
    business: "#e6a23c"
  };
  return map[type] || "#606266";
};

onMounted(() => {
  // 初始化
});
</script>

<style scoped lang="scss">
.position-management {
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
      width: 500px;
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

        .org-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
      }
    }
  }

  .error-tip {
    color: #f56c6c;
    font-size: 12px;
    margin-top: 5px;
  }

  .org-select-wrapper {
    .position-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #f5f7fa;
      border-radius: 4px;

      .info-display {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }

    .org-select-content {
      display: flex;
      gap: 20px;
      margin-top: 20px;
      height: 500px;

      .left-tree {
        width: 400px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        padding: 15px;
        display: flex;
        flex-direction: column;

        .tree-search {
          margin-bottom: 15px;
        }

        .org-select-tree {
          flex: 1;
          overflow: auto;

          .tree-node {
            display: flex;
            align-items: center;
            gap: 5px;
          }
        }

        .selected-count {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #dcdfe6;
          text-align: center;
          color: #409eff;
          font-weight: bold;
        }
      }

      .right-selected {
        flex: 1;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        padding: 15px;
        overflow: auto;

        h4 {
          margin-top: 0;
          margin-bottom: 15px;
        }

        .selected-orgs {
          min-height: 200px;
        }
      }
    }
  }
}
</style>
