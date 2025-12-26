<template>
  <div class="personal-knowledge-search">
    <el-card shadow="never" class="search-card">
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="输入关键词/问题，如'NE40E丢包处理'"
          size="large"
          clearable
          @keyup.enter="handleSearch"
          @input="handleInput"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" size="large" @click="handleSearch">
          搜索
        </el-button>
        <el-button size="large" @click="showAdvanced = true">高级</el-button>
      </div>

      <!-- 快捷检索 -->
      <div class="quick-search">
        <div class="quick-item" @click="handleQuickSearch('recent')">
          <el-icon><Clock /></el-icon>
          <span>最近编辑</span>
        </div>
        <div class="quick-item" @click="handleQuickSearch('optimize')">
          <el-icon><Edit /></el-icon>
          <span>待优化知识</span>
        </div>
        <div class="quick-item" @click="handleQuickSearch('command')">
          <el-icon><Document /></el-icon>
          <span>常用命令</span>
        </div>
      </div>

      <!-- 智能联想 -->
      <div v-if="suggestions.length > 0" class="suggestions">
        <div
          v-for="(item, index) in suggestions"
          :key="index"
          class="suggestion-item"
          @click="selectSuggestion(item)"
        >
          <el-icon v-if="item.type === 'recent'"><Clock /></el-icon>
          <el-icon v-else-if="item.type === 'frequent'"><Star /></el-icon>
          <span>{{ item.text }}</span>
        </div>
      </div>
    </el-card>

    <!-- 搜索结果 -->
    <div v-if="hasSearched" class="search-results">
      <div class="result-header">
        <span>找到 {{ searchResults.length }} 条结果</span>
        <el-select v-model="sortType" size="small" style="width: 150px">
          <el-option label="匹配度优先" value="match" />
          <el-option label="最近操作" value="recent" />
          <el-option label="使用频率" value="frequent" />
        </el-select>
      </div>

      <!-- 二次筛选 -->
      <div class="secondary-filters">
        <el-select
          v-model="filters.tag"
          placeholder="个人标签"
          clearable
          size="small"
          style="width: 150px"
        >
          <el-option
            v-for="tag in personalTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
        <el-select
          v-model="filters.type"
          placeholder="知识类型"
          clearable
          size="small"
          style="width: 150px"
        >
          <el-option
            v-for="type in typeOptions"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
        <el-select
          v-model="filters.status"
          placeholder="知识状态"
          clearable
          size="small"
          style="width: 150px"
        >
          <el-option label="草稿" value="draft" />
          <el-option label="已归档" value="archived" />
          <el-option label="待优化" value="optimize" />
        </el-select>
      </div>

      <!-- 结果列表 -->
      <div class="result-list">
        <el-card
          v-for="item in filteredResults"
          :key="item.id"
          class="result-card"
          shadow="hover"
        >
          <div class="card-header">
            <span class="knowledge-name">{{ item.name }}</span>
            <el-tag :type="getStatusTagType(item.status)" size="small">
              {{ getStatusText(item.status) }}
            </el-tag>
            <el-tag v-if="item.isRecent" type="success" size="small">
              新编辑
            </el-tag>
          </div>
          <div class="card-content">
            <div
              class="summary"
              v-html="highlightKeyword(item.summary, searchKeyword)"
            />
          </div>
          <div class="card-footer">
            <span>最近编辑：{{ item.updateTime }}</span>
            <span>标签：{{ item.tags.join(", ") }}</span>
          </div>
          <div class="card-actions">
            <el-button link type="primary" @click="handleView(item)">
              查看
            </el-button>
            <el-button link type="primary" @click="handleEdit(item)">
              编辑
            </el-button>
            <el-button link type="primary" @click="handleSync(item)">
              同步共享
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 高级检索弹窗 -->
    <el-dialog v-model="showAdvanced" title="高级检索" width="500px">
      <el-form :model="advancedForm" label-width="100px">
        <el-form-item label="知识类型">
          <el-select v-model="advancedForm.type" style="width: 100%">
            <el-option
              v-for="type in typeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="advancedForm.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="个人标签">
          <el-select v-model="advancedForm.tags" multiple style="width: 100%">
            <el-option
              v-for="tag in personalTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdvanced = false">取消</el-button>
        <el-button type="primary" @click="handleAdvancedSearch">搜索</el-button>
        <el-button @click="handleResetAdvanced">重置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import { Search, Clock, Edit, Document, Star } from "@element-plus/icons-vue";

const searchKeyword = ref("");
const hasSearched = ref(false);
const suggestions = ref<any[]>([]);
const sortType = ref("match");
const showAdvanced = ref(false);

const filters = reactive({
  tag: "",
  type: "",
  status: ""
});

const personalTags = ["Linux命令", "故障处理", "配置管理", "临时草稿"];

const typeOptions = [
  { label: "故障处理笔记", value: "fault" },
  { label: "命令手册", value: "command" },
  { label: "培训记录", value: "training" }
];

const advancedForm = reactive({
  type: "",
  timeRange: null,
  tags: []
});

// 测试数据
const searchResults = ref([
  {
    id: "1",
    name: "NE40E路由器丢包处理",
    summary: "NE40E路由器出现丢包问题的排查步骤和处理方法",
    status: "draft",
    updateTime: "2025-11-24 10:30",
    tags: ["故障处理", "路由器"],
    isRecent: true
  },
  {
    id: "2",
    name: "Linux常用命令集",
    summary: "日常运维中常用的Linux命令和参数说明",
    status: "active",
    updateTime: "2025-11-20 15:20",
    tags: ["Linux命令"],
    isRecent: false
  }
]);

const filteredResults = computed(() => {
  let results = [...searchResults.value];
  if (filters.status) {
    results = results.filter(item => item.status === filters.status);
  }
  return results;
});

const handleInput = () => {
  if (!searchKeyword.value) {
    suggestions.value = [];
    return;
  }
  suggestions.value = [
    { text: searchKeyword.value + "处理", type: "suggestion" },
    { text: "NE40E丢包排查", type: "recent" },
    { text: "端口占用处理", type: "frequent" }
  ];
};

const selectSuggestion = (item: any) => {
  searchKeyword.value = item.text;
  suggestions.value = [];
  handleSearch();
};

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning("请输入搜索关键词");
    return;
  }
  hasSearched.value = true;
};

const handleQuickSearch = (type: string) => {
  const map: Record<string, string> = {
    recent: "最近编辑",
    optimize: "待优化",
    command: "常用命令"
  };
  searchKeyword.value = map[type] || "";
  handleSearch();
};

const highlightKeyword = (text: string, keyword: string) => {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, "gi");
  return text.replace(
    regex,
    '<mark style="background-color: yellow;">$1</mark>'
  );
};

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    draft: "warning",
    archived: "info",
    optimize: "warning"
  };
  return map[status] || "";
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    draft: "草稿",
    archived: "已归档",
    optimize: "待优化"
  };
  return map[status] || "";
};

const handleAdvancedSearch = () => {
  showAdvanced.value = false;
  handleSearch();
};

const handleResetAdvanced = () => {
  Object.assign(advancedForm, {
    type: "",
    timeRange: null,
    tags: []
  });
};

const handleView = (item: any) => {
  ElMessage.info(`查看 ${item.name}`);
};

const handleEdit = (item: any) => {
  ElMessage.info(`编辑 ${item.name}`);
};

const handleSync = (item: any) => {
  ElMessage.success(`已同步 ${item.name} 至共享库`);
};
</script>

<style scoped lang="scss">
.personal-knowledge-search {
  .search-card {
    margin-bottom: 20px;

    .search-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    .quick-search {
      display: flex;
      gap: 15px;
      margin-bottom: 10px;

      .quick-item {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 8px 15px;
        background: #f5f7fa;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: #e4e7ed;
        }
      }
    }

    .suggestions {
      margin-top: 10px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      background: white;
      max-height: 200px;
      overflow-y: auto;

      .suggestion-item {
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;

        &:hover {
          background: #f5f7fa;
        }
      }
    }
  }

  .search-results {
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .secondary-filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .result-list {
      .result-card {
        margin-bottom: 15px;

        .card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;

          .knowledge-name {
            font-size: 16px;
            font-weight: bold;
          }
        }

        .card-content {
          margin-bottom: 10px;

          .summary {
            color: #606266;
            line-height: 1.6;
          }
        }

        .card-footer {
          font-size: 12px;
          color: #909399;
          margin-bottom: 10px;
          display: flex;
          gap: 20px;
        }

        .card-actions {
          display: flex;
          gap: 10px;
        }
      }
    }
  }
}
</style>
