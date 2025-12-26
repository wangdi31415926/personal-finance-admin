<template>
  <div class="personal-knowledge-list">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部知识库" name="all">
        <div class="list-content">
          <div class="toolbar">
            <el-select
              v-model="sortType"
              placeholder="排序方式"
              size="small"
              style="width: 150px"
            >
              <el-option label="更新时间" value="update" />
              <el-option label="创建时间" value="create" />
              <el-option label="名称排序" value="name" />
            </el-select>
            <el-button-group style="margin-left: 10px">
              <el-button
                :type="viewMode === 'card' ? 'primary' : ''"
                size="small"
                @click="viewMode = 'card'"
              >
                卡片
              </el-button>
              <el-button
                :type="viewMode === 'list' ? 'primary' : ''"
                size="small"
                @click="viewMode = 'list'"
              >
                列表
              </el-button>
            </el-button-group>
            <el-button
              type="primary"
              size="small"
              style="margin-left: 10px"
              @click="handleCreate"
            >
              新建知识库
            </el-button>
          </div>

          <div class="filter-bar">
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

          <!-- 卡片视图 -->
          <div v-if="viewMode === 'card'" class="card-view">
            <el-card
              v-for="item in filteredList"
              :key="item.id"
              class="knowledge-card"
              shadow="hover"
            >
              <div class="card-header">
                <span class="knowledge-name">{{ item.name }}</span>
                <el-tag :type="getStatusTagType(item.status)" size="small">
                  {{ getStatusText(item.status) }}
                </el-tag>
              </div>
              <div class="card-description">{{ item.description }}</div>
              <div class="card-footer">
                <span>更新时间：{{ item.updateTime }}</span>
                <span>标签：{{ item.tags.join(", ") }}</span>
              </div>
              <div class="card-actions">
                <el-button link type="primary" @click="handleEdit(item)">
                  编辑
                </el-button>
                <el-button link type="primary" @click="handleView(item)">
                  查看
                </el-button>
                <el-button link type="primary" @click="handleFavorite(item)">
                  收藏
                </el-button>
              </div>
            </el-card>
          </div>

          <!-- 列表视图 -->
          <el-table v-else :data="filteredList" style="width: 100%" stripe>
            <el-table-column prop="name" label="知识库名称" min-width="200" />
            <el-table-column prop="type" label="知识类型" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="180" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleEdit(row)">
                  编辑
                </el-button>
                <el-button link type="primary" @click="handleView(row)">
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="最近访问" name="recent">
        <div class="list-content">
          <div class="time-filter">
            <el-radio-group v-model="recentTimeRange" size="small">
              <el-radio-button label="7">近7天</el-radio-button>
              <el-radio-button label="15">近15天</el-radio-button>
              <el-radio-button label="30">近30天</el-radio-button>
              <el-radio-button label="all">全部</el-radio-button>
            </el-radio-group>
            <el-button
              size="small"
              style="margin-left: 10px"
              @click="handleClearHistory"
            >
              清空历史
            </el-button>
          </div>

          <div class="recent-list">
            <el-card
              v-for="item in recentList"
              :key="item.id"
              class="recent-card"
              shadow="hover"
            >
              <div class="access-time">{{ item.accessTime }}</div>
              <div class="card-content">
                <div class="knowledge-name">{{ item.name }}</div>
                <div class="access-count">已访问 {{ item.accessCount }} 次</div>
              </div>
              <div class="card-actions">
                <el-button link type="primary" @click="handleView(item)">
                  查看
                </el-button>
                <el-button link type="primary" @click="handleSetCommon(item)">
                  设为常用
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="我的收藏" name="favorite">
        <div class="list-content">
          <div class="favorite-stats">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-label">收藏总数</div>
                <div class="stat-value">{{ favoriteStats.total }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">收藏夹数量</div>
                <div class="stat-value">{{ favoriteStats.folders }}</div>
              </div>
            </el-card>
          </div>

          <div class="favorite-list">
            <el-card
              v-for="item in favoriteList"
              :key="item.id"
              class="favorite-card"
              shadow="hover"
            >
              <div class="favorite-badge">
                <el-icon><Star /></el-icon>
              </div>
              <div class="card-content">
                <div class="knowledge-name">{{ item.name }}</div>
                <div class="card-description">{{ item.description }}</div>
                <div class="card-footer">
                  <span>收藏时间：{{ item.favoriteTime }}</span>
                  <span v-if="item.updated" class="update-tag">已更新</span>
                </div>
              </div>
              <div class="card-actions">
                <el-button link type="primary" @click="handleSync(item)">
                  同步共享
                </el-button>
                <el-button link type="primary" @click="handleUnfavorite(item)">
                  取消收藏
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Star } from "@element-plus/icons-vue";

const activeTab = ref("all");
const viewMode = ref("card");
const sortType = ref("update");
const recentTimeRange = ref("30");

const filters = reactive({
  tag: "",
  type: "",
  status: ""
});

const personalTags = ["Linux命令", "故障处理", "配置管理"];
const typeOptions = [
  { label: "故障处理笔记", value: "fault" },
  { label: "命令手册", value: "command" }
];

// 测试数据
const allList = ref([
  {
    id: "1",
    name: "NE40E路由器丢包处理",
    type: "故障处理笔记",
    status: "draft",
    description: "NE40E路由器出现丢包问题的排查步骤",
    updateTime: "2025-11-24 10:30",
    tags: ["故障处理", "路由器"]
  },
  {
    id: "2",
    name: "Linux常用命令集",
    type: "命令手册",
    status: "active",
    description: "日常运维中常用的Linux命令",
    updateTime: "2025-11-20 15:20",
    tags: ["Linux命令"]
  }
]);

const recentList = ref([
  {
    id: "1",
    name: "NE40E路由器丢包处理",
    accessTime: "2025-11-24 10:30",
    accessCount: 5
  },
  {
    id: "2",
    name: "Linux常用命令集",
    accessTime: "2025-11-20 15:20",
    accessCount: 12
  }
]);

const favoriteList = ref([
  {
    id: "1",
    name: "复杂故障处理宝典",
    description: "汇集了各种复杂故障的处理方案",
    favoriteTime: "2025-11-20",
    updated: true
  },
  {
    id: "2",
    name: "核心设备配置手册",
    description: "核心网络设备的详细配置文档",
    favoriteTime: "2025-11-18",
    updated: false
  }
]);

const favoriteStats = ref({
  total: 12,
  folders: 3
});

const filteredList = computed(() => {
  let results = [...allList.value];
  if (filters.status) {
    results = results.filter(item => item.status === filters.status);
  }
  return results;
});

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

const handleTabChange = (tab: string) => {
  // 切换标签页
};

const handleCreate = () => {
  // 跳转到新建页面
};

const handleEdit = (item: any) => {
  ElMessage.info(`编辑 ${item.name}`);
};

const handleView = (item: any) => {
  ElMessage.info(`查看 ${item.name}`);
};

const handleFavorite = (item: any) => {
  ElMessage.success(`已收藏 ${item.name}`);
};

const handleClearHistory = () => {
  ElMessageBox.confirm("确定要清空历史记录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    ElMessage.success("历史记录已清空");
  });
};

const handleSetCommon = (item: any) => {
  ElMessage.success(`已将 ${item.name} 设为常用`);
};

const handleSync = (item: any) => {
  ElMessage.success(`已同步 ${item.name} 至共享库`);
};

const handleUnfavorite = (item: any) => {
  ElMessage.success(`已取消收藏 ${item.name}`);
};
</script>

<style scoped lang="scss">
.personal-knowledge-list {
  .list-content {
    padding: 20px 0;

    .toolbar {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }

    .filter-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .card-view {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;

      .knowledge-card {
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;

          .knowledge-name {
            font-size: 16px;
            font-weight: bold;
          }
        }

        .card-description {
          color: #606266;
          font-size: 14px;
          margin-bottom: 10px;
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

    .time-filter {
      margin-bottom: 20px;
    }

    .recent-list {
      .recent-card {
        margin-bottom: 15px;

        .access-time {
          font-size: 12px;
          color: #909399;
          margin-bottom: 10px;
        }

        .card-content {
          .knowledge-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }

          .access-count {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }

    .favorite-stats {
      margin-bottom: 20px;

      .stat-card {
        .stat-item {
          display: inline-block;
          margin-right: 40px;

          .stat-label {
            font-size: 14px;
            color: #909399;
            margin-bottom: 5px;
          }

          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #409eff;
          }
        }
      }
    }

    .favorite-list {
      .favorite-card {
        margin-bottom: 15px;
        position: relative;

        .favorite-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          color: #e6a23c;
          font-size: 20px;
        }

        .card-content {
          .knowledge-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
          }

          .card-description {
            color: #606266;
            font-size: 14px;
            margin-bottom: 10px;
          }

          .card-footer {
            font-size: 12px;
            color: #909399;
            display: flex;
            align-items: center;
            gap: 20px;

            .update-tag {
              color: #f56c6c;
            }
          }
        }
      }
    }
  }
}
</style>
