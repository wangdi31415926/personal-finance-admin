<template>
  <div class="role-management">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="title">角色管理</span>
        </div>
      </template>

      <div class="content-wrapper">
        <!-- 左侧列表 -->
        <div class="left-list">
          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索角色名称/编码"
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
                <el-form-item label="角色名称">
                  <el-input
                    v-model="advancedSearchForm.name"
                    placeholder="请输入角色名称"
                  />
                </el-form-item>
                <el-form-item label="角色编码">
                  <el-input
                    v-model="advancedSearchForm.code"
                    placeholder="请输入角色编码"
                  />
                </el-form-item>
                <el-form-item label="角色类型">
                  <el-select
                    v-model="advancedSearchForm.type"
                    placeholder="请选择角色类型"
                  >
                    <el-option label="系统角色" value="system" />
                    <el-option label="业务角色" value="business" />
                    <el-option label="自定义角色" value="custom" />
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
              添加角色
            </el-button>
          </div>

          <!-- 角色列表 -->
          <el-table
            :data="filteredRoleList"
            highlight-current-row
            @current-change="handleRowClick"
            style="width: 100%"
            height="calc(100vh - 400px)"
            @sort-change="handleSortChange"
          >
            <el-table-column
              prop="name"
              label="角色名称"
              width="150"
              sortable="custom"
            >
              <template #default="{ row }">
                <span :style="{ color: getTypeColor(row.type) }">{{
                  row.name
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="code"
              label="角色编码"
              width="120"
              sortable="custom"
            />
            <el-table-column
              prop="type"
              label="角色类型"
              width="120"
              sortable="custom"
            >
              <template #default="{ row }">
                <el-tag :type="getTypeTagType(row.type)" size="small">
                  {{ getTypeName(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="createTime"
              label="创建时间"
              width="150"
              sortable="custom"
            />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag
                  :type="row.status === '启用' ? 'success' : 'danger'"
                  size="small"
                >
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="rolePage"
            v-model:page-size="rolePageSize"
            :page-sizes="[10, 20, 50]"
            :total="roleTotal"
            layout="total, sizes, prev, pager, next, jumper"
            style="margin-top: 15px"
          />
        </div>

        <!-- 右侧详情 -->
        <div class="right-detail">
          <div v-if="selectedRole" class="detail-content">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="基础信息" name="basic">
                <div class="detail-header">
                  <h3>{{ selectedRole.name }}</h3>
                  <div>
                    <el-button @click="printRole">
                      <el-icon><Printer /></el-icon>
                      打印详情
                    </el-button>
                    <el-button type="primary" @click="exportRole">
                      <el-icon><Download /></el-icon>
                      导出PDF
                    </el-button>
                  </div>
                </div>
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="角色名称">
                    {{ selectedRole.name }}
                  </el-descriptions-item>
                  <el-descriptions-item label="角色编码">
                    {{ selectedRole.code }}
                  </el-descriptions-item>
                  <el-descriptions-item label="角色类型">
                    <el-tag :type="getTypeTagType(selectedRole.type)">
                      {{ getTypeName(selectedRole.type) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="创建时间">
                    {{ selectedRole.createTime }}
                  </el-descriptions-item>
                  <el-descriptions-item label="角色描述" :span="2">
                    {{ selectedRole.description || "无" }}
                  </el-descriptions-item>
                  <el-descriptions-item label="备注" :span="2">
                    {{ selectedRole.remark || "无" }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>

              <el-tab-pane label="关联用户" name="users">
                <div class="user-list-header">
                  <span
                    >已关联用户列表（{{
                      selectedRole.userList?.length || 0
                    }}）</span
                  >
                  <el-button link type="primary" @click="exportUserList"
                    >导出用户列表</el-button
                  >
                </div>
                <el-table
                  :data="selectedRole.userList"
                  border
                  style="width: 100%"
                >
                  <el-table-column prop="name" label="用户名" />
                  <el-table-column prop="workNo" label="工号" />
                  <el-table-column prop="org" label="所属机构" />
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
                  :total="selectedRole.userList?.length || 0"
                  layout="total, sizes, prev, pager, next, jumper"
                  style="margin-top: 20px"
                />
              </el-tab-pane>
            </el-tabs>
          </div>
          <el-empty v-else description="请从左侧选择角色查看详情" />
        </div>
      </div>
    </el-card>

    <!-- 添加角色弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      :title="isEdit ? '编辑角色' : '添加角色'"
      width="900px"
    >
      <div class="add-role-wrapper">
        <!-- 左侧基础信息 -->
        <div class="left-form">
          <h4>角色基础信息</h4>
          <el-form
            ref="addFormRef"
            :model="addForm"
            :rules="addFormRules"
            label-width="120px"
          >
            <el-form-item label="角色名称" prop="name">
              <el-input
                v-model="addForm.name"
                placeholder="请输入角色名称"
                @blur="checkNameConflict"
              />
              <div v-if="nameConflict" class="error-tip">该角色名称已存在</div>
            </el-form-item>
            <el-form-item label="角色编码" prop="code">
              <el-input
                v-model="addForm.code"
                placeholder="请输入角色编码"
                @blur="checkCodeConflict"
              >
                <template #append>
                  <el-button @click="generateCode">生成</el-button>
                </template>
              </el-input>
              <div v-if="codeConflict" class="error-tip">该角色编码已存在</div>
              <div class="code-tip">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="copyCode"
                  v-if="addForm.code"
                >
                  点击复制
                </el-button>
              </div>
            </el-form-item>
            <el-form-item label="角色类型" prop="type">
              <el-select
                v-model="addForm.type"
                placeholder="请选择角色类型"
                @change="handleTypeChange"
              >
                <el-option label="系统角色" value="system" />
                <el-option label="业务角色" value="business" />
                <el-option label="自定义角色" value="custom" />
              </el-select>
            </el-form-item>
            <el-form-item label="角色描述">
              <el-input
                v-model="addForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入角色描述"
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
          </el-form>
        </div>

        <!-- 右侧权限选择 -->
        <div class="right-permissions">
          <div class="permission-header">
            <el-button @click="selectAll">全选</el-button>
            <el-button @click="unselectAll">取消全选</el-button>
            <el-input
              v-model="permissionSearch"
              placeholder="搜索权限名称"
              clearable
              style="width: 200px; margin-left: 10px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <el-scrollbar height="400px">
            <el-collapse v-model="activePermissionGroups">
              <el-collapse-item
                v-for="group in filteredPermissionGroups"
                :key="group.name"
                :name="group.name"
                :title="group.title"
              >
                <el-checkbox-group v-model="selectedPermissions">
                  <div
                    v-for="perm in group.permissions"
                    :key="perm.id"
                    class="permission-item"
                  >
                    <el-checkbox :label="perm.id">
                      {{ perm.name }}
                      <el-icon
                        class="info-icon"
                        @click.stop="showPermissionTip(perm)"
                        style="margin-left: 5px; cursor: pointer"
                      >
                        <QuestionFilled />
                      </el-icon>
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
              </el-collapse-item>
            </el-collapse>
          </el-scrollbar>
        </div>
      </div>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
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
  Download,
  Printer,
  QuestionFilled
} from "@element-plus/icons-vue";

interface Role {
  id: string;
  name: string;
  code: string;
  type: string;
  description?: string;
  remark?: string;
  createTime: string;
  status: string;
  userList?: Array<{
    id: string;
    name: string;
    workNo: string;
    org: string;
  }>;
}

interface Permission {
  id: string;
  name: string;
  description?: string;
}

interface PermissionGroup {
  name: string;
  title: string;
  permissions: Permission[];
}

const searchKeyword = ref("");
const showAdvancedSearch = ref(false);
const selectedRole = ref<Role | null>(null);
const activeTab = ref("basic");
const addDialogVisible = ref(false);
const isEdit = ref(false);
const nameConflict = ref(false);
const codeConflict = ref(false);
const permissionSearch = ref("");
const activePermissionGroups = ref(["system", "business", "data"]);
const selectedPermissions = ref<string[]>([]);
const rolePage = ref(1);
const rolePageSize = ref(10);
const roleTotal = ref(0);
const userPage = ref(1);
const userPageSize = ref(10);
const sortConfig = ref<{ prop?: string; order?: string }>({});

const advancedSearchForm = reactive({
  name: "",
  code: "",
  type: ""
});

const addForm = reactive({
  name: "",
  code: "",
  type: "",
  description: "",
  remark: ""
});

const addFormRules = {
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入角色编码", trigger: "blur" }],
  type: [{ required: true, message: "请选择角色类型", trigger: "change" }]
};

const addFormRef = ref();

// 权限数据
const permissionGroups = ref<PermissionGroup[]>([
  {
    name: "system",
    title: "系统权限",
    permissions: [
      { id: "sys:user:add", name: "用户添加", description: "允许添加新用户" },
      {
        id: "sys:user:edit",
        name: "用户编辑",
        description: "允许编辑用户信息"
      },
      { id: "sys:user:delete", name: "用户删除", description: "允许删除用户" },
      { id: "sys:role:add", name: "角色添加", description: "允许添加新角色" }
    ]
  },
  {
    name: "business",
    title: "业务权限",
    permissions: [
      {
        id: "biz:order:view",
        name: "订单查看",
        description: "允许查看订单信息"
      },
      { id: "biz:order:create", name: "订单创建", description: "允许创建订单" },
      { id: "biz:order:edit", name: "订单编辑", description: "允许编辑订单" }
    ]
  },
  {
    name: "data",
    title: "数据权限",
    permissions: [
      { id: "data:export", name: "数据导出", description: "允许导出数据" },
      { id: "data:import", name: "数据导入", description: "允许导入数据" }
    ]
  }
]);

// 测试数据
const roleList = ref<Role[]>([
  {
    id: "1",
    name: "系统管理员",
    code: "ROLE001",
    type: "system",
    description: "拥有系统所有权限",
    createTime: "2024-01-01 10:00:00",
    status: "启用",
    userList: [
      { id: "1", name: "张三", workNo: "U001", org: "技术部" },
      { id: "2", name: "李四", workNo: "U002", org: "技术部" }
    ]
  },
  {
    id: "2",
    name: "业务管理员",
    code: "ROLE002",
    type: "business",
    description: "拥有业务相关权限",
    createTime: "2024-01-01 11:00:00",
    status: "启用",
    userList: [{ id: "3", name: "王五", workNo: "U003", org: "市场部" }]
  },
  {
    id: "3",
    name: "普通用户",
    code: "ROLE003",
    type: "custom",
    description: "普通用户权限",
    createTime: "2024-01-02 10:00:00",
    status: "启用",
    userList: []
  }
]);

const filteredRoleList = computed(() => {
  let result = roleList.value;

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(
      r => r.name.includes(keyword) || r.code.includes(keyword)
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

const filteredPermissionGroups = computed(() => {
  if (!permissionSearch.value) return permissionGroups.value;

  const keyword = permissionSearch.value.toLowerCase();
  return permissionGroups.value
    .map(group => ({
      ...group,
      permissions: group.permissions.filter(p =>
        p.name.toLowerCase().includes(keyword)
      )
    }))
    .filter(group => group.permissions.length > 0);
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

const handleSortChange = ({
  prop,
  order
}: {
  prop?: string;
  order?: string;
}) => {
  sortConfig.value = { prop, order };
};

const handleRowClick = (row: Role) => {
  selectedRole.value = row;
  activeTab.value = "basic";
};

const handleAdd = () => {
  isEdit.value = false;
  Object.assign(addForm, {
    name: "",
    code: "",
    type: "",
    description: "",
    remark: ""
  });
  selectedPermissions.value = [];
  nameConflict.value = false;
  codeConflict.value = false;
  addDialogVisible.value = true;
};

const handleTypeChange = () => {
  if (addForm.type === "system") {
    ElMessageBox.alert("系统角色仅允许编辑基础名称与编码", "提示", {
      confirmButtonText: "确定"
    });
  }
};

const checkNameConflict = () => {
  // 模拟校验
  nameConflict.value = false;
};

const checkCodeConflict = () => {
  // 模拟校验
  codeConflict.value = false;
};

const generateCode = () => {
  addForm.code = `ROLE${Date.now().toString().slice(-6)}`;
};

const copyCode = () => {
  navigator.clipboard.writeText(addForm.code);
  ElMessage.success("编码已复制");
};

const selectAll = () => {
  const allIds: string[] = [];
  permissionGroups.value.forEach(group => {
    group.permissions.forEach(perm => {
      allIds.push(perm.id);
    });
  });
  selectedPermissions.value = allIds;
};

const unselectAll = () => {
  selectedPermissions.value = [];
};

const showPermissionTip = (perm: Permission) => {
  ElMessageBox.alert(perm.description || "暂无描述", `权限说明：${perm.name}`, {
    confirmButtonText: "确定"
  });
};

const resetForm = () => {
  addFormRef.value?.resetFields();
  selectedPermissions.value = [];
};

const submitForm = () => {
  addFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success("角色添加成功");
      addDialogVisible.value = false;
    }
  });
};

const printRole = () => {
  ElMessage.info("打印功能");
};

const exportRole = () => {
  ElMessage.success("角色信息PDF导出成功");
};

const exportUserList = () => {
  ElMessage.success("用户列表导出成功");
};

const viewUserDetail = (user: any) => {
  ElMessage.info(`查看用户：${user.name}`);
};

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    system: "系统角色",
    business: "业务角色",
    custom: "自定义角色"
  };
  return map[type] || type;
};

const getTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    system: "primary",
    business: "success",
    custom: "info"
  };
  return map[type] || "";
};

const getTypeColor = (type: string) => {
  const map: Record<string, string> = {
    system: "#409eff",
    business: "#67c23a",
    custom: "#909399"
  };
  return map[type] || "#606266";
};

onMounted(() => {
  roleTotal.value = roleList.value.length;
});
</script>

<style scoped lang="scss">
.role-management {
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

        .user-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
      }
    }
  }

  .add-role-wrapper {
    display: flex;
    gap: 20px;
    height: 500px;

    .left-form {
      width: 400px;
      border-right: 1px solid #dcdfe6;
      padding-right: 20px;

      h4 {
        margin-top: 0;
        margin-bottom: 20px;
      }

      .error-tip {
        color: #f56c6c;
        font-size: 12px;
        margin-top: 5px;
      }

      .code-tip {
        margin-top: 5px;
      }
    }

    .right-permissions {
      flex: 1;

      .permission-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
      }

      .permission-item {
        margin: 10px 0;

        .info-icon {
          color: #909399;
        }
      }
    }
  }
}
</style>
