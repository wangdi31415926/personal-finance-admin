<template>
  <div class="knowledge-search">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入关键词或问题，如'DNS解析失败处理'"
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
        <el-button size="large" @click="showAdvancedSearch = true">
          高级检索
        </el-button>
      </div>

      <!-- 智能联想 -->
      <div v-if="suggestions.length > 0" class="suggestions">
        <div
          v-for="(item, index) in suggestions"
          :key="index"
          class="suggestion-item"
          @click="selectSuggestion(item)"
        >
          <el-icon v-if="item.type === 'history'"><Clock /></el-icon>
          <el-icon v-else-if="item.type === 'hot'"><Star /></el-icon>
          <span>{{ item.text }}</span>
        </div>
      </div>

      <!-- 热门搜索 -->
      <div v-if="!searchKeyword && !hasSearched" class="hot-searches">
        <div class="hot-title">热门搜索</div>
        <el-tag
          v-for="(tag, index) in hotSearches"
          :key="index"
          class="hot-tag"
          @click="selectSuggestion({ text: tag, type: 'hot' })"
        >
          {{ tag }}
        </el-tag>
      </div>
    </el-card>

    <!-- 搜索结果 -->
    <div v-if="hasSearched" class="search-results">
      <div class="result-header">
        <span class="result-count"
          >找到 {{ searchResults.length }} 条匹配结果</span
        >
        <el-select
          v-model="sortType"
          size="small"
          style="width: 150px"
          @change="handleSort"
        >
          <el-option label="综合排序" value="default" />
          <el-option label="最新更新" value="time" />
          <el-option label="最多访问" value="visit" />
        </el-select>
      </div>

      <!-- 二次筛选 -->
      <div class="secondary-filters">
        <el-select
          v-model="filters.domain"
          placeholder="知识领域"
          clearable
          size="small"
          style="width: 150px"
        >
          <el-option
            v-for="item in domainOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
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
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-date-picker
          v-model="filters.timeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          style="width: 240px"
        />
      </div>

      <!-- 结果列表 -->
      <div v-if="filteredResults.length > 0" class="result-list">
        <el-card
          v-for="item in filteredResults"
          :key="item.id"
          class="result-card"
          shadow="hover"
          @click="handleViewDetail(item)"
        >
          <div class="card-header">
            <span class="knowledge-name">{{ item.name }}</span>
            <el-tag :type="getTypeTagType(item.type)" size="small">
              {{ item.type }}
            </el-tag>
          </div>
          <div class="card-content">
            <div
              class="summary"
              v-html="highlightKeyword(item.summary, searchKeyword)"
            />
          </div>
          <div class="card-footer">
            <span>创建人：{{ item.creator }}</span>
            <span>更新时间：{{ item.updateTime }}</span>
            <span>访问量：{{ item.visitCount }}</span>
          </div>
          <div class="card-actions">
            <el-button link type="primary" @click.stop="handleView(item)">
              查看
            </el-button>
            <el-button link type="primary" @click.stop="handleFavorite(item)">
              收藏
            </el-button>
            <el-button link type="primary" @click.stop="handleShare(item)">
              分享
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 无结果 -->
      <el-empty
        v-else
        description="未找到相关知识，建议尝试以下方式：1.简化关键词 2.使用同义词 3.扩大检索范围"
      >
        <el-button type="primary" @click="showAdvancedSearch = true">
          使用高级检索
        </el-button>
      </el-empty>

      <!-- 分页 -->
      <div v-if="filteredResults.length > 0" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          :total="filteredResults.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>

    <!-- 高级检索弹窗 -->
    <el-dialog v-model="showAdvancedSearch" title="高级检索" width="600px">
      <el-form :model="advancedForm" label-width="100px">
        <el-form-item label="基础条件">
          <el-input v-model="advancedForm.keyword" placeholder="关键词" />
        </el-form-item>
        <el-form-item label="知识领域">
          <el-select
            v-model="advancedForm.domain"
            multiple
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in domainOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="知识类型">
          <el-select
            v-model="advancedForm.type"
            multiple
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
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
      </el-form>
      <template #footer>
        <el-button @click="showAdvancedSearch = false">取消</el-button>
        <el-button type="primary" @click="handleAdvancedSearch">搜索</el-button>
        <el-button @click="handleResetAdvanced">重置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import { Search, Clock, Star } from "@element-plus/icons-vue";

// 搜索关键词
const searchKeyword = ref("");
const hasSearched = ref(false);
const suggestions = ref<any[]>([]);
const sortType = ref("default");
const currentPage = ref(1);
const pageSize = ref(10);
const showAdvancedSearch = ref(false);

// 热门搜索
const hotSearches = [
  "DNS解析失败",
  "路由器配置",
  "Linux端口占用",
  "服务器宕机处理",
  "网络故障排查"
];

// 筛选条件
const filters = reactive({
  domain: "",
  type: "",
  timeRange: null
});

const domainOptions = [
  { label: "网络设备", value: "network" },
  { label: "服务器运维", value: "server" },
  { label: "应用部署", value: "deployment" }
];

const typeOptions = [
  { label: "故障处理", value: "fault" },
  { label: "配置手册", value: "config" },
  { label: "操作指南", value: "guide" }
];

// 高级检索表单
const advancedForm = reactive({
  keyword: "",
  domain: [],
  type: [],
  timeRange: null
});

// 测试数据
const searchResults = ref([
  {
    id: "1",
    name: "DNS解析失败故障处理手册",
    type: "故障处理",
    summary:
      "DNS解析失败是常见的网络故障，本文档详细介绍了DNS解析失败的排查步骤和处理方法，包括检查DNS服务器配置、网络连接状态等。",
    creator: "张三",
    updateTime: "2025-11-24 10:30",
    visitCount: 156
  },
  {
    id: "2",
    name: "路由器OSPF协议配置指南",
    type: "配置手册",
    summary:
      "OSPF（开放最短路径优先）协议是常用的动态路由协议，本文档提供了详细的OSPF配置步骤和参数说明。",
    creator: "李四",
    updateTime: "2025-11-23 15:20",
    visitCount: 89
  },
  {
    id: "3",
    name: "Linux服务器端口占用排查方法",
    type: "操作指南",
    summary:
      "当Linux服务器出现端口占用问题时，需要快速定位占用端口的进程。本文档介绍了使用netstat、lsof等命令进行排查的方法。",
    creator: "王五",
    updateTime: "2025-11-22 09:15",
    visitCount: 234
  }
]);

// 过滤后的结果
const filteredResults = computed(() => {
  let results = [...searchResults.value];

  if (filters.domain) {
    // 这里应该根据实际数据过滤
  }
  if (filters.type) {
    results = results.filter(item => item.type === filters.type);
  }

  return results;
});

// 输入联想
const handleInput = () => {
  if (!searchKeyword.value) {
    suggestions.value = [];
    return;
  }

  // 模拟联想数据
  suggestions.value = [
    { text: searchKeyword.value + "处理", type: "suggestion" },
    { text: searchKeyword.value + "排查", type: "suggestion" },
    { text: "DNS解析失败处理", type: "history" },
    { text: "DNS配置", type: "hot" }
  ].slice(0, 5);
};

// 选择联想
const selectSuggestion = (item: any) => {
  searchKeyword.value = item.text;
  suggestions.value = [];
  handleSearch();
};

// 搜索
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning("请输入搜索关键词");
    return;
  }
  hasSearched.value = true;
  suggestions.value = [];
  // 这里应该是API调用
};

// 排序
const handleSort = () => {
  // 这里应该重新排序结果
};

// 高亮关键词
const highlightKeyword = (text: string, keyword: string) => {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, "gi");
  return text.replace(
    regex,
    '<mark style="background-color: yellow;">$1</mark>'
  );
};

// 获取类型标签样式
const getTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    故障处理: "danger",
    配置手册: "primary",
    操作指南: "success"
  };
  return map[type] || "";
};

// 高级检索
const handleAdvancedSearch = () => {
  searchKeyword.value = advancedForm.keyword || "";
  filters.domain = advancedForm.domain[0] || "";
  filters.type = advancedForm.type[0] || "";
  filters.timeRange = advancedForm.timeRange;
  showAdvancedSearch.value = false;
  handleSearch();
};

const handleResetAdvanced = () => {
  Object.assign(advancedForm, {
    keyword: "",
    domain: [],
    type: [],
    timeRange: null
  });
};

// 操作
const handleViewDetail = (item: any) => {
  // 跳转到详情页
  ElMessage.info(`查看 ${item.name}`);
};

const handleView = (item: any) => {
  handleViewDetail(item);
};

const handleFavorite = (item: any) => {
  ElMessage.success(`已收藏 ${item.name}`);
};

const handleShare = (item: any) => {
  ElMessage.info(`分享 ${item.name}`);
};
</script>

<style scoped lang="scss">
.knowledge-search {
  .search-card {
    margin-bottom: 20px;

    .search-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;

      .el-input {
        flex: 1;
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

    .hot-searches {
      margin-top: 20px;

      .hot-title {
        font-size: 14px;
        color: #909399;
        margin-bottom: 10px;
      }

      .hot-tag {
        margin-right: 10px;
        margin-bottom: 10px;
        cursor: pointer;
      }
    }
  }

  .search-results {
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .result-count {
        font-size: 14px;
        color: #606266;
      }
    }

    .secondary-filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .result-list {
      .result-card {
        margin-bottom: 15px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;

          .knowledge-name {
            font-size: 16px;
            font-weight: bold;
            color: #303133;
          }
        }

        .card-content {
          margin-bottom: 10px;

          .summary {
            color: #606266;
            line-height: 1.6;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }

        .card-footer {
          display: flex;
          gap: 20px;
          font-size: 12px;
          color: #909399;
          margin-bottom: 10px;
        }

        .card-actions {
          display: flex;
          gap: 10px;
        }
      }
    }

    .pagination {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }
}
</style>
