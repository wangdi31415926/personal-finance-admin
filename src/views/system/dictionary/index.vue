<template>
  <div class="dictionary-management">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="title">字典管理</span>
        </div>
      </template>

      <div class="content-wrapper">
        <!-- 左侧分类列表 -->
        <div class="left-list">
          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索字典分类/字典项名称/编码"
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
                <el-form-item label="字典分类">
                  <el-select
                    v-model="advancedSearchForm.category"
                    placeholder="请选择字典分类"
                    filterable
                  >
                    <el-option
                      v-for="cat in categoryList"
                      :key="cat.id"
                      :label="cat.name"
                      :value="cat.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="字典项状态">
                  <el-select
                    v-model="advancedSearchForm.status"
                    placeholder="请选择状态"
                  >
                    <el-option label="启用" value="enabled" />
                    <el-option label="禁用" value="disabled" />
                  </el-select>
                </el-form-item>
                <el-form-item label="排序号范围">
                  <el-input-number
                    v-model="advancedSearchForm.sortMin"
                    :min="0"
                  />
                  <span style="margin: 0 10px">-</span>
                  <el-input-number
                    v-model="advancedSearchForm.sortMax"
                    :min="0"
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

          <!-- 字典分类列表 -->
          <div class="category-list">
            <div
              v-for="category in filteredCategoryList"
              :key="category.id"
              class="category-item"
              :class="{ active: selectedCategory?.id === category.id }"
              @click="selectCategory(category)"
            >
              <div class="category-header">
                <span
                  class="category-name"
                  :class="{ highlight: category.isSearchMatch }"
                >
                  {{ category.name }}
                </span>
                <el-tag
                  :type="category.status === '正常' ? 'success' : 'info'"
                  size="small"
                >
                  {{ category.status }}
                </el-tag>
              </div>
              <div class="category-info">
                <span>编码：{{ category.code }}</span>
                <span>项数：{{ category.itemCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧字典项列表和详情 -->
        <div class="right-content">
          <div v-if="selectedCategory" class="dictionary-content">
            <!-- 字典项列表 -->
            <div class="item-list-section">
              <div class="section-header">
                <h3>字典项列表</h3>
                <el-button type="primary" @click="handleAddItem">
                  <el-icon><Plus /></el-icon>
                  添加字典项
                </el-button>
              </div>
              <el-table
                :data="filteredItemList"
                highlight-current-row
                @current-change="handleItemClick"
                style="width: 100%"
                @sort-change="handleSortChange"
              >
                <el-table-column
                  prop="name"
                  label="字典项名称"
                  width="150"
                  sortable="custom"
                />
                <el-table-column prop="code" label="编码" width="120" />
                <el-table-column
                  prop="sortNo"
                  label="排序号"
                  width="100"
                  sortable="custom"
                />
                <el-table-column
                  prop="status"
                  label="状态"
                  width="100"
                  sortable="custom"
                >
                  <template #default="{ row }">
                    <el-tag
                      :type="row.status === '启用' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" />
              </el-table>
            </div>

            <!-- 选中项详情 -->
            <div v-if="selectedItem" class="item-detail-section">
              <div class="section-header">
                <h3>字典项详情</h3>
                <el-button @click="printDetail">
                  <el-icon><Printer /></el-icon>
                  打印详情
                </el-button>
              </div>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="字典项名称">
                  {{ selectedItem.name }}
                </el-descriptions-item>
                <el-descriptions-item label="编码">
                  {{ selectedItem.code }}
                </el-descriptions-item>
                <el-descriptions-item label="排序号">
                  {{ selectedItem.sortNo }}
                </el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag
                    :type="
                      selectedItem.status === '启用' ? 'success' : 'danger'
                    "
                  >
                    {{ selectedItem.status }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">
                  {{ selectedItem.createTime }}
                </el-descriptions-item>
                <el-descriptions-item label="最后修改时间">
                  {{ selectedItem.updateTime }}
                </el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">
                  {{ selectedItem.remark || "无" }}
                </el-descriptions-item>
                <el-descriptions-item
                  label="引用业务模块"
                  :span="2"
                  v-if="selectedItem.modules"
                >
                  <el-tag
                    v-for="module in selectedItem.modules"
                    :key="module"
                    style="margin-right: 5px"
                  >
                    {{ module }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
          <el-empty v-else description="请从左侧选择字典分类" />
        </div>
      </div>
    </el-card>

    <!-- 添加字典分类弹窗 -->
    <el-dialog
      v-model="categoryDialogVisible"
      title="添加字典分类"
      width="600px"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryFormRules"
        label-width="120px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="categoryForm.code" placeholder="请输入分类编码">
            <template #append>
              <el-button @click="generateCategoryCode">生成</el-button>
            </template>
          </el-input>
          <div class="code-tip">
            <el-button
              link
              type="primary"
              size="small"
              @click="copyCategoryCode"
              v-if="categoryForm.code"
            >
              点击复制
            </el-button>
          </div>
          <div class="field-tip">
            <el-icon><QuestionFilled /></el-icon>
            <span>编码格式规范：字母数字组合，3-20位</span>
          </div>
        </el-form-item>
        <el-form-item label="分类描述">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">保存分类</el-button>
      </template>
    </el-dialog>

    <!-- 添加字典项弹窗 -->
    <el-dialog v-model="itemDialogVisible" title="添加字典项" width="600px">
      <el-form
        ref="itemFormRef"
        :model="itemForm"
        :rules="itemFormRules"
        label-width="120px"
      >
        <el-form-item label="字典分类">
          <el-input :value="selectedCategory?.name" disabled />
        </el-form-item>
        <el-form-item label="字典项名称" prop="name">
          <el-input
            v-model="itemForm.name"
            placeholder="请输入字典项名称"
            @blur="checkItemNameConflict"
          />
          <div v-if="itemNameConflict" class="error-tip">
            该字典项名称已存在
          </div>
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input
            v-model="itemForm.code"
            placeholder="请输入编码"
            @blur="checkItemCodeConflict"
          />
          <div v-if="itemCodeConflict" class="error-tip">该编码已存在</div>
        </el-form-item>
        <el-form-item label="排序号" prop="sortNo">
          <el-input-number v-model="itemForm.sortNo" :min="1" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="itemForm.status">
            <el-radio label="启用">启用</el-radio>
            <el-radio label="禁用">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="itemForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button @click="resetItemForm">重置</el-button>
        <el-button type="primary" @click="saveItem">添加字典项</el-button>
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
  Printer,
  QuestionFilled
} from "@element-plus/icons-vue";

interface DictionaryCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  itemCount: number;
  status: string;
  createTime: string;
  isSearchMatch?: boolean;
}

interface DictionaryItem {
  id: string;
  name: string;
  code: string;
  sortNo: number;
  status: string;
  remark?: string;
  createTime: string;
  updateTime?: string;
  modules?: string[];
}

const searchKeyword = ref("");
const showAdvancedSearch = ref(false);
const selectedCategory = ref<DictionaryCategory | null>(null);
const selectedItem = ref<DictionaryItem | null>(null);
const categoryDialogVisible = ref(false);
const itemDialogVisible = ref(false);
const itemNameConflict = ref(false);
const itemCodeConflict = ref(false);

const advancedSearchForm = reactive({
  category: "",
  status: "",
  sortMin: 0,
  sortMax: 1000
});

const categoryForm = reactive({
  name: "",
  code: "",
  description: ""
});

const categoryFormRules = {
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
  code: [
    { required: true, message: "请输入分类编码", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9]{3,20}$/,
      message: "编码格式不正确",
      trigger: "blur"
    }
  ]
};

const itemForm = reactive({
  name: "",
  code: "",
  sortNo: 1,
  status: "启用",
  remark: ""
});

const itemFormRules = {
  name: [{ required: true, message: "请输入字典项名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入编码", trigger: "blur" }],
  sortNo: [{ required: true, message: "请输入排序号", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }]
};

const categoryFormRef = ref();
const itemFormRef = ref();

// 测试数据
const categoryList = ref<DictionaryCategory[]>([
  {
    id: "1",
    name: "用户状态",
    code: "USER_STATUS",
    description: "用户状态字典",
    itemCount: 3,
    status: "正常",
    createTime: "2024-01-01 10:00:00"
  },
  {
    id: "2",
    name: "订单状态",
    code: "ORDER_STATUS",
    description: "订单状态字典",
    itemCount: 5,
    status: "正常",
    createTime: "2024-01-01 11:00:00"
  },
  {
    id: "3",
    name: "资源状态",
    code: "RESOURCE_STATUS",
    description: "资源状态字典",
    itemCount: 0,
    status: "待启用",
    createTime: "2024-01-02 10:00:00"
  }
]);

const itemList = ref<DictionaryItem[]>([
  {
    id: "1",
    name: "正常",
    code: "NORMAL",
    sortNo: 1,
    status: "启用",
    createTime: "2024-01-01 10:00:00",
    updateTime: "2024-01-01 10:00:00",
    modules: ["用户管理", "订单管理"]
  },
  {
    id: "2",
    name: "禁用",
    code: "DISABLED",
    sortNo: 2,
    status: "启用",
    createTime: "2024-01-01 10:00:00",
    updateTime: "2024-01-01 10:00:00"
  },
  {
    id: "3",
    name: "锁定",
    code: "LOCKED",
    sortNo: 3,
    status: "启用",
    createTime: "2024-01-01 10:00:00",
    updateTime: "2024-01-01 10:00:00"
  }
]);

const filteredCategoryList = computed(() => {
  if (!searchKeyword.value) return categoryList.value;
  const keyword = searchKeyword.value.toLowerCase();
  return categoryList.value.map(cat => ({
    ...cat,
    isSearchMatch:
      cat.name.toLowerCase().includes(keyword) ||
      cat.code.toLowerCase().includes(keyword)
  }));
});

const filteredItemList = computed(() => {
  if (!selectedCategory.value) return [];
  let result = itemList.value.filter(item =>
    item.id.startsWith(selectedCategory.value!.id)
  );

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(
      item =>
        item.name.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword)
    );
  }

  // 排序
  return result.sort((a, b) => a.sortNo - b.sortNo);
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
    category: "",
    status: "",
    sortMin: 0,
    sortMax: 1000
  });
};

const selectCategory = (category: DictionaryCategory) => {
  selectedCategory.value = category;
  selectedItem.value = null;
};

const handleItemClick = (row: DictionaryItem) => {
  selectedItem.value = row;
};

const handleSortChange = ({
  prop,
  order
}: {
  prop?: string;
  order?: string;
}) => {
  // 排序逻辑
};

const handleAddItem = () => {
  if (!selectedCategory.value) {
    ElMessage.warning("请先选择字典分类");
    return;
  }
  itemForm.name = "";
  itemForm.code = "";
  itemForm.sortNo = itemList.value.length + 1;
  itemForm.status = "启用";
  itemForm.remark = "";
  itemNameConflict.value = false;
  itemCodeConflict.value = false;
  itemDialogVisible.value = true;
};

const checkItemNameConflict = () => {
  // 模拟校验
  itemNameConflict.value = false;
};

const checkItemCodeConflict = () => {
  // 模拟校验
  itemCodeConflict.value = false;
};

const saveItem = () => {
  itemFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      // 检查是否被引用
      if (
        itemForm.status === "禁用" &&
        selectedItem.value?.modules &&
        selectedItem.value.modules.length > 0
      ) {
        ElMessageBox.alert(
          `该字典项已被以下业务模块引用：${selectedItem.value.modules.join("、")}`,
          "提示",
          { confirmButtonText: "确定" }
        );
      }
      ElMessage.success("字典项添加成功");
      itemDialogVisible.value = false;
    }
  });
};

const resetItemForm = () => {
  itemFormRef.value?.resetFields();
};

const generateCategoryCode = () => {
  categoryForm.code = `DICT${Date.now().toString().slice(-6)}`;
};

const copyCategoryCode = () => {
  navigator.clipboard.writeText(categoryForm.code);
  ElMessage.success("编码已复制");
};

const saveCategory = () => {
  categoryFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success("字典分类保存成功");
      categoryDialogVisible.value = false;
    }
  });
};

const printDetail = () => {
  ElMessage.info("打印功能");
};

onMounted(() => {
  // 初始化
});
</script>

<style scoped lang="scss">
.dictionary-management {
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
      width: 350px;
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

      .category-list {
        flex: 1;
        overflow: auto;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        padding: 10px;

        .category-item {
          padding: 15px;
          margin-bottom: 10px;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            background: #f5f7fa;
          }

          &.active {
            border-color: #409eff;
            background: #ecf5ff;
          }

          .category-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;

            .category-name {
              font-weight: bold;
              font-size: 16px;

              &.highlight {
                background-color: #fff7e6;
                padding: 2px 4px;
                border-radius: 4px;
              }
            }
          }

          .category-info {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }

    .right-content {
      flex: 1;
      display: flex;
      flex-direction: column;

      .dictionary-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;

        .item-list-section,
        .item-detail-section {
          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }
        }

        .item-detail-section {
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

  .code-tip {
    margin-top: 5px;
  }

  .field-tip {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }
}
</style>
