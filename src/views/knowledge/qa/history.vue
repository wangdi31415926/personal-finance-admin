<template>
  <div class="qa-history">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>知识问答历史</span>
          <el-button size="small" @click="handleClearHistory">
            清空历史
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="检索历史问答，如'ACL配置冲突'"
          clearable
          @keyup.enter="handleSearch"
          @input="handleInput"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="showAdvanced = true">高级筛选</el-button>
      </div>

      <!-- 最近检索 -->
      <div
        v-if="!searchKeyword && recentSearches.length > 0"
        class="recent-searches"
      >
        <div class="recent-title">最近检索</div>
        <el-tag
          v-for="(search, index) in recentSearches"
          :key="index"
          class="search-tag"
          @click="handleRecentSearch(search)"
        >
          {{ search }}
        </el-tag>
      </div>

      <!-- 筛选器 -->
      <div class="filters">
        <el-select
          v-model="filters.favorite"
          placeholder="是否收藏"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option label="已收藏" value="yes" />
          <el-option label="未收藏" value="no" />
        </el-select>
        <el-select
          v-model="filters.feedback"
          placeholder="评价状态"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option label="已评价" value="yes" />
          <el-option label="未评价" value="no" />
        </el-select>
        <el-select
          v-model="filters.source"
          placeholder="来源类型"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option label="个人库" value="personal" />
          <el-option label="共享库" value="shared" />
          <el-option label="无答案" value="none" />
        </el-select>
        <el-select
          v-model="sortType"
          placeholder="排序方式"
          size="small"
          style="width: 150px"
        >
          <el-option label="提问时间" value="time" />
          <el-option label="收藏优先" value="favorite" />
          <el-option label="已评价优先" value="feedback" />
        </el-select>
      </div>

      <!-- 历史记录列表 -->
      <div class="history-list">
        <el-card
          v-for="item in filteredHistory"
          :key="item.id"
          class="history-card"
          :class="{ 'has-update': item.updated }"
          shadow="hover"
        >
          <div class="card-header">
            <div class="question-section">
              <div class="question-text">
                <el-icon v-if="item.isFavorite" class="favorite-icon">
                  <Star />
                </el-icon>
                <span>{{ item.question }}</span>
              </div>
              <div class="question-time">{{ item.questionTime }}</div>
            </div>
            <div class="card-actions">
              <el-button
                link
                type="primary"
                size="small"
                @click="handleViewDetail(item)"
              >
                查看详情
              </el-button>
              <el-button
                link
                type="primary"
                size="small"
                @click="handleFavorite(item)"
              >
                {{ item.isFavorite ? "取消收藏" : "收藏" }}
              </el-button>
              <el-button
                link
                type="primary"
                size="small"
                @click="handleEdit(item)"
              >
                编辑答案
              </el-button>
              <el-button
                link
                type="danger"
                size="small"
                @click="handleDelete(item)"
              >
                删除
              </el-button>
            </div>
          </div>
          <div class="answer-section">
            <div class="answer-label">回答摘要：</div>
            <div
              class="answer-text"
              v-html="highlightKeyword(item.answerSummary, searchKeyword)"
            />
          </div>
          <div class="card-footer">
            <el-tag :type="getSourceTagType(item.sourceType)" size="small">
              {{ getSourceText(item.sourceType) }}
            </el-tag>
            <el-tag
              v-if="item.feedback"
              :type="item.feedback === 'satisfied' ? 'success' : 'danger'"
              size="small"
            >
              {{
                item.feedback === "satisfied"
                  ? "已评价：满意"
                  : "已评价：不满意"
              }}
            </el-tag>
            <el-tag v-else type="warning" size="small"> 待评价 </el-tag>
            <el-tag
              v-if="item.updated"
              type="danger"
              size="small"
              @click="handleViewUpdate(item)"
            >
              答案已更新
            </el-tag>
          </div>
        </el-card>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="filteredHistory.length === 0"
        description="暂无历史问答记录"
      />

      <!-- 分页 -->
      <div v-if="filteredHistory.length > 0" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredHistory.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 高级筛选弹窗 -->
    <el-dialog v-model="showAdvanced" title="高级筛选" width="500px">
      <el-form :model="advancedForm" label-width="100px">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="advancedForm.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="标签关联">
          <el-select v-model="advancedForm.tags" multiple style="width: 100%">
            <el-option
              v-for="tag in tagOptions"
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
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Star } from "@element-plus/icons-vue";

const searchKeyword = ref("");
const recentSearches = ref(["ACL配置", "端口占用", "DNS解析"]);
const sortType = ref("time");
const currentPage = ref(1);
const pageSize = ref(10);
const showAdvanced = ref(false);

const filters = reactive({
  favorite: "",
  feedback: "",
  source: ""
});

const advancedForm = reactive({
  timeRange: null,
  tags: []
});

const tagOptions = ["ACL配置", "端口占用", "丢包处理"];

// 测试数据
const historyList = ref([
  {
    id: "1",
    question: "路由器丢包怎么排查？",
    answerSummary:
      "路由器丢包问题需要从接口状态、流量统计、路由表等多个维度进行排查。首先检查接口状态，确认接口是否UP...",
    questionTime: "2025-11-24 10:30",
    sourceType: "shared",
    isFavorite: true,
    feedback: "satisfied",
    updated: false
  },
  {
    id: "2",
    question: "Linux服务器端口占用如何释放？",
    answerSummary:
      "使用netstat或lsof命令查找占用端口的进程，然后使用kill命令终止进程...",
    questionTime: "2025-11-23 15:20",
    sourceType: "personal",
    isFavorite: false,
    feedback: "",
    updated: true
  },
  {
    id: "3",
    question: "ACL配置冲突怎么处理？",
    answerSummary:
      "ACL配置冲突通常是由于规则优先级设置不当导致的，需要检查规则顺序...",
    questionTime: "2025-11-22 09:15",
    sourceType: "shared",
    isFavorite: false,
    feedback: "unsatisfied",
    updated: false
  }
]);

const filteredHistory = computed(() => {
  let results = [...historyList.value];

  if (filters.favorite === "yes") {
    results = results.filter(item => item.isFavorite);
  } else if (filters.favorite === "no") {
    results = results.filter(item => !item.isFavorite);
  }

  if (filters.feedback === "yes") {
    results = results.filter(item => item.feedback);
  } else if (filters.feedback === "no") {
    results = results.filter(item => !item.feedback);
  }

  if (filters.source) {
    results = results.filter(item => item.sourceType === filters.source);
  }

  if (searchKeyword.value) {
    results = results.filter(
      item =>
        item.question.includes(searchKeyword.value) ||
        item.answerSummary.includes(searchKeyword.value)
    );
  }

  return results;
});

const handleInput = () => {
  // 输入联想逻辑
};

const handleSearch = () => {
  // 搜索逻辑
};

const handleRecentSearch = (search: string) => {
  searchKeyword.value = search;
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

const getSourceTagType = (source: string) => {
  const map: Record<string, string> = {
    personal: "success",
    shared: "primary",
    none: "info"
  };
  return map[source] || "";
};

const getSourceText = (source: string) => {
  const map: Record<string, string> = {
    personal: "个人库",
    shared: "共享库",
    none: "无答案"
  };
  return map[source] || "";
};

const handleViewDetail = (item: any) => {
  ElMessage.info(`查看详情：${item.question}`);
};

const handleFavorite = (item: any) => {
  item.isFavorite = !item.isFavorite;
  ElMessage.success(item.isFavorite ? "已收藏" : "已取消收藏");
};

const handleEdit = (item: any) => {
  ElMessage.info(`编辑答案：${item.question}`);
};

const handleDelete = (item: any) => {
  ElMessageBox.confirm("确定要删除这条记录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    const index = historyList.value.findIndex(h => h.id === item.id);
    if (index > -1) {
      historyList.value.splice(index, 1);
      ElMessage.success("删除成功");
    }
  });
};

const handleViewUpdate = (item: any) => {
  ElMessage.info(`查看更新内容：${item.question}`);
};

const handleClearHistory = () => {
  ElMessageBox.confirm("确定要清空所有历史记录吗？删除后不可恢复。", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    historyList.value = [];
    ElMessage.success("历史记录已清空");
  });
};

const handleAdvancedSearch = () => {
  showAdvanced.value = false;
  handleSearch();
};

const handleResetAdvanced = () => {
  Object.assign(advancedForm, {
    timeRange: null,
    tags: []
  });
};
</script>

<style scoped lang="scss">
.qa-history {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-bar {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;

    .el-input {
      flex: 1;
    }
  }

  .recent-searches {
    margin-bottom: 15px;

    .recent-title {
      font-size: 14px;
      color: #909399;
      margin-bottom: 10px;
    }

    .search-tag {
      margin-right: 10px;
      margin-bottom: 10px;
      cursor: pointer;

      &:hover {
        background: #409eff;
        color: white;
      }
    }
  }

  .filters {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .history-list {
    .history-card {
      margin-bottom: 15px;
      transition: all 0.3s;

      &.has-update {
        border-left: 3px solid #f56c6c;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;

        .question-section {
          flex: 1;

          .question-text {
            font-size: 16px;
            font-weight: bold;
            color: #303133;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;

            .favorite-icon {
              color: #e6a23c;
            }
          }

          .question-time {
            font-size: 12px;
            color: #909399;
          }
        }

        .card-actions {
          display: flex;
          gap: 10px;
        }
      }

      .answer-section {
        margin-bottom: 15px;
        padding: 10px;
        background: #f5f7fa;
        border-radius: 4px;

        .answer-label {
          font-size: 12px;
          color: #909399;
          margin-bottom: 5px;
        }

        .answer-text {
          color: #606266;
          font-size: 14px;
          line-height: 1.6;
        }
      }

      .card-footer {
        display: flex;
        gap: 10px;
        align-items: center;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>
