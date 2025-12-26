<template>
  <div class="favorite-knowledge">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="知识库" name="library">
        <!-- 搜索框 -->
        <el-card shadow="never" class="search-card">
          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索我的收藏，如'NE40E配置'"
              size="large"
              clearable
              @keyup.enter="handleSearch"
              @input="handleInput"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="searchScope" size="large" style="width: 150px">
              <el-option label="全部收藏" value="all" />
              <el-option label="知识库" value="library" />
              <el-option label="知识点" value="point" />
              <el-option label="共享库" value="shared" />
            </el-select>
            <el-button type="primary" size="large" @click="handleSearch">
              搜索
            </el-button>
          </div>

          <!-- 快捷入口 -->
          <div class="quick-entries">
            <div class="quick-item" @click="handleQuickSearch('recent')">
              最近检索
            </div>
            <div class="quick-item" @click="handleQuickSearch('tag1')">
              核心设备配置
            </div>
            <div class="quick-item" @click="handleQuickSearch('tag2')">
              故障处理
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
              <el-icon v-if="item.type === 'favorite'"><Star /></el-icon>
              <el-icon v-else-if="item.type === 'shared'"><Document /></el-icon>
              <span>{{ item.text }}</span>
            </div>
          </div>
        </el-card>

        <!-- 知识库列表 -->
        <div class="library-list">
          <div class="list-header">
            <el-select
              v-model="sortType"
              placeholder="排序方式"
              size="small"
              style="width: 150px"
            >
              <el-option label="最近访问" value="access" />
              <el-option label="收藏时间" value="favorite" />
              <el-option label="更新时间" value="update" />
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
          </div>

          <div class="filter-bar">
            <el-select
              v-model="filters.source"
              placeholder="来源"
              clearable
              size="small"
              style="width: 120px"
            >
              <el-option label="个人知识库" value="personal" />
              <el-option label="共享知识库" value="shared" />
            </el-select>
            <el-select
              v-model="filters.tag"
              placeholder="收藏标签"
              clearable
              size="small"
              style="width: 150px"
            >
              <el-option
                v-for="tag in favoriteTags"
                :key="tag"
                :label="tag"
                :value="tag"
              />
            </el-select>
            <el-select
              v-model="filters.updateStatus"
              placeholder="更新状态"
              clearable
              size="small"
              style="width: 120px"
            >
              <el-option label="近7天更新" value="recent" />
              <el-option label="未更新" value="none" />
            </el-select>
          </div>

          <!-- 卡片视图 -->
          <div v-if="viewMode === 'card'" class="card-view">
            <el-card
              v-for="item in favoriteLibraries"
              :key="item.id"
              class="library-card"
              shadow="hover"
            >
              <div class="favorite-star">
                <el-icon><Star /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-header">
                  <span class="library-name">{{ item.name }}</span>
                  <el-tag
                    :type="item.source === 'personal' ? 'success' : 'primary'"
                    size="small"
                  >
                    {{ item.source === "personal" ? "个人" : "共享" }}
                  </el-tag>
                  <el-tag v-if="item.updated" type="warning" size="small">
                    新更新
                  </el-tag>
                </div>
                <div class="card-description">{{ item.description }}</div>
                <div class="card-footer">
                  <span>收藏时间：{{ item.favoriteTime }}</span>
                  <span v-if="item.updateTime"
                    >更新时间：{{ item.updateTime }}</span
                  >
                </div>
              </div>
              <div class="card-actions">
                <el-button link type="primary" @click="handleView(item)">
                  快速访问
                </el-button>
                <el-button link type="primary" @click="handleViewUpdate(item)">
                  查看更新
                </el-button>
                <el-button link type="primary" @click="handleSync(item)">
                  同步至个人库
                </el-button>
                <el-button link type="danger" @click="handleUnfavorite(item)">
                  取消收藏
                </el-button>
              </div>
            </el-card>
          </div>

          <!-- 列表视图 -->
          <el-table v-else :data="favoriteLibraries" style="width: 100%" stripe>
            <el-table-column prop="name" label="知识库名称" min-width="200" />
            <el-table-column prop="source" label="来源" width="100">
              <template #default="{ row }">
                <el-tag
                  :type="row.source === 'personal' ? 'success' : 'primary'"
                  size="small"
                >
                  {{ row.source === "personal" ? "个人" : "共享" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="favoriteTime" label="收藏时间" width="180" />
            <el-table-column prop="updateTime" label="更新时间" width="180" />
            <el-table-column label="操作" width="250">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleView(row)">
                  查看
                </el-button>
                <el-button link type="primary" @click="handleUnfavorite(row)">
                  取消收藏
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="知识点" name="point">
        <div class="point-list">
          <div class="list-header">
            <el-select
              v-model="pointFilters.library"
              placeholder="所属知识库"
              clearable
              size="small"
              style="width: 200px"
            >
              <el-option
                v-for="lib in favoriteLibraries"
                :key="lib.id"
                :label="lib.name"
                :value="lib.id"
              />
            </el-select>
            <el-select
              v-model="pointFilters.type"
              placeholder="知识点类型"
              clearable
              size="small"
              style="width: 150px"
            >
              <el-option label="命令集" value="command" />
              <el-option label="故障步骤" value="fault" />
              <el-option label="配置说明" value="config" />
            </el-select>
            <el-select
              v-model="pointFilters.scene"
              placeholder="使用场景"
              clearable
              size="small"
              style="width: 150px"
            >
              <el-option label="端口配置" value="port" />
              <el-option label="丢包处理" value="packet" />
            </el-select>
          </div>

          <div class="point-items">
            <el-card
              v-for="item in favoritePoints"
              :key="item.id"
              class="point-card"
              shadow="hover"
              @click="handleViewPoint(item)"
            >
              <div class="favorite-star">
                <el-icon><Star /></el-icon>
              </div>
              <div class="point-content">
                <div class="point-header">
                  <span class="point-title">{{ item.title }}</span>
                  <el-tag size="small">{{ item.type }}</el-tag>
                </div>
                <div class="point-library">所属：{{ item.libraryName }}</div>
                <div class="point-preview">
                  {{ item.preview }}
                </div>
                <div class="point-scene">
                  <el-tag
                    v-for="scene in item.scenes"
                    :key="scene"
                    size="small"
                    class="scene-tag"
                  >
                    {{ scene }}
                  </el-tag>
                </div>
                <div class="point-footer">
                  <span>收藏时间：{{ item.favoriteTime }}</span>
                </div>
              </div>
              <div class="point-actions">
                <el-button link type="primary" @click.stop="handleCopy(item)">
                  复制内容
                </el-button>
                <el-button
                  link
                  type="primary"
                  @click.stop="handleViewPoint(item)"
                >
                  查看详情
                </el-button>
                <el-button
                  link
                  type="danger"
                  @click.stop="handleUnfavoritePoint(item)"
                >
                  取消收藏
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 知识点详情弹窗 -->
    <el-dialog
      v-model="pointDetailVisible"
      title="知识点详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentPoint" class="point-detail">
        <div class="detail-header">
          <div class="point-title-section">
            <h3>{{ currentPoint.title }}</h3>
            <el-tag size="small" style="margin-left: 10px">{{
              currentPoint.type
            }}</el-tag>
          </div>
          <div class="point-meta">
            <span>所属知识库：{{ currentPoint.libraryName }}</span>
            <span>收藏时间：{{ currentPoint.favoriteTime }}</span>
          </div>
        </div>

        <el-divider />

        <div class="detail-content">
          <div class="content-section">
            <div class="section-title">核心内容</div>
            <div class="section-body">
              <pre class="content-text">{{
                currentPoint.content || currentPoint.preview
              }}</pre>
            </div>
          </div>

          <div
            v-if="currentPoint.scenes && currentPoint.scenes.length > 0"
            class="content-section"
          >
            <div class="section-title">使用场景</div>
            <div class="section-body">
              <el-tag
                v-for="scene in currentPoint.scenes"
                :key="scene"
                size="small"
                class="scene-tag"
                style="margin-right: 8px"
              >
                {{ scene }}
              </el-tag>
            </div>
          </div>

          <div v-if="currentPoint.commands" class="content-section">
            <div class="section-title">相关命令</div>
            <div class="section-body">
              <div class="command-block">
                <pre><code>{{ currentPoint.commands }}</code></pre>
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="handleCopyCommand(currentPoint.commands)"
                >
                  一键复制
                </el-button>
              </div>
            </div>
          </div>

          <div v-if="currentPoint.notes" class="content-section">
            <div class="section-title">注意事项</div>
            <div class="section-body notice-content">
              <el-icon><Warning /></el-icon>
              <span>{{ currentPoint.notes }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="pointDetailVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleCopyPointContent">
            复制全文
          </el-button>
          <el-button type="primary" @click="handleEditPoint"> 编辑 </el-button>
          <el-button type="danger" @click="handleUnfavoritePoint(currentPoint)">
            取消收藏
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { Search, Star, Document, Warning } from "@element-plus/icons-vue";

const activeTab = ref("library");
const searchKeyword = ref("");
const searchScope = ref("all");
const suggestions = ref<any[]>([]);
const sortType = ref("access");
const viewMode = ref("card");
const pointDetailVisible = ref(false);
const currentPoint = ref<any>(null);

const filters = reactive({
  source: "",
  tag: "",
  updateStatus: ""
});

const pointFilters = reactive({
  library: "",
  type: "",
  scene: ""
});

const favoriteTags = ["应急故障", "核心配置", "常用命令"];

// 测试数据
const favoriteLibraries = ref([
  {
    id: "1",
    name: "DNS解析失败故障处理手册",
    description: "详细介绍了DNS解析失败的排查步骤和处理方法",
    source: "shared",
    favoriteTime: "2025-11-20",
    updateTime: "2025-11-24",
    updated: true
  },
  {
    id: "2",
    name: "NE40E路由器配置",
    description: "NE40E路由器的详细配置文档",
    source: "personal",
    favoriteTime: "2025-11-18",
    updateTime: null,
    updated: false
  }
]);

const favoritePoints = ref([
  {
    id: "1",
    title: "Linux端口占用排查命令",
    type: "命令集",
    libraryName: "Linux常用命令集",
    preview: "使用 netstat -tulpn | grep :80 查看端口占用情况...",
    content: `# 查看端口占用情况
netstat -tulpn | grep :80

# 查看指定端口占用
lsof -i :80

# 查看所有端口占用
netstat -tulpn

# 杀死占用端口的进程
kill -9 <PID>`,
    commands: `netstat -tulpn | grep :80
lsof -i :80
kill -9 <PID>`,
    scenes: ["端口配置", "故障排查"],
    notes: "注意：使用 kill 命令前请确认进程ID，避免误杀重要进程",
    favoriteTime: "2025-11-20"
  },
  {
    id: "2",
    title: "路由器丢包处理步骤",
    type: "故障步骤",
    libraryName: "故障处理手册",
    preview: "1. 检查接口状态 2. 查看流量统计 3. 分析丢包原因...",
    content: `1. 检查接口状态
   - 使用 show interface 命令查看接口是否UP
   - 检查接口错误统计

2. 查看流量统计
   - 使用 show interface statistics 查看流量
   - 分析丢包位置

3. 分析丢包原因
   - 检查路由表是否正确
   - 查看日志信息
   - 分析网络拓扑`,
    scenes: ["丢包处理"],
    notes: "处理过程中注意保存日志，便于后续分析",
    favoriteTime: "2025-11-18"
  }
]);

const handleInput = () => {
  if (!searchKeyword.value) {
    suggestions.value = [];
    return;
  }
  suggestions.value = [
    { text: searchKeyword.value + "配置", type: "favorite" },
    { text: "NE40E配置手册", type: "shared" }
  ];
};

const selectSuggestion = (item: any) => {
  searchKeyword.value = item.text;
  suggestions.value = [];
  handleSearch();
};

const handleSearch = () => {
  ElMessage.info("搜索功能");
};

const handleQuickSearch = (type: string) => {
  const map: Record<string, string> = {
    recent: "最近检索",
    tag1: "核心设备配置",
    tag2: "故障处理"
  };
  searchKeyword.value = map[type] || "";
  handleSearch();
};

const handleView = (item: any) => {
  ElMessage.info(`查看 ${item.name}`);
};

const handleViewUpdate = (item: any) => {
  ElMessage.info(`查看更新记录 ${item.name}`);
};

const handleSync = (item: any) => {
  ElMessage.success(`已同步 ${item.name} 至个人库`);
};

const handleUnfavorite = (item: any) => {
  ElMessage.success(`已取消收藏 ${item.name}`);
};

const handleViewPoint = (item: any) => {
  currentPoint.value = item;
  pointDetailVisible.value = true;
};

const handleCopyCommand = (commands: string) => {
  navigator.clipboard.writeText(commands).then(() => {
    ElMessage.success("命令已复制");
  });
};

const handleCopyPointContent = () => {
  if (currentPoint.value) {
    const content = currentPoint.value.content || currentPoint.value.preview;
    navigator.clipboard.writeText(content).then(() => {
      ElMessage.success("内容已复制");
    });
  }
};

const handleEditPoint = () => {
  ElMessage.info(`编辑知识点 ${currentPoint.value?.title}`);
};

const handleCopy = (item: any) => {
  ElMessage.success("内容已复制");
};

const handleUnfavoritePoint = (item: any) => {
  if (item) {
    const index = favoritePoints.value.findIndex(p => p.id === item.id);
    if (index > -1) {
      favoritePoints.value.splice(index, 1);
      ElMessage.success(`已取消收藏 ${item.title}`);
      if (pointDetailVisible.value && currentPoint.value?.id === item.id) {
        pointDetailVisible.value = false;
        currentPoint.value = null;
      }
    }
  }
};
</script>

<style scoped lang="scss">
.favorite-knowledge {
  .search-card {
    margin-bottom: 20px;

    .search-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    .quick-entries {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;

      .quick-item {
        padding: 5px 15px;
        background: #f5f7fa;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;

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

  .library-list {
    .list-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
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

      .library-card {
        position: relative;

        .favorite-star {
          position: absolute;
          top: 10px;
          right: 10px;
          color: #e6a23c;
          font-size: 20px;
        }

        .card-content {
          .card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;

            .library-name {
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
            display: flex;
            gap: 20px;
          }
        }
      }
    }
  }

  .point-list {
    .list-header {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .point-items {
      .point-card {
        margin-bottom: 15px;
        position: relative;
        cursor: pointer;

        .favorite-star {
          position: absolute;
          top: 10px;
          right: 10px;
          color: #e6a23c;
          font-size: 20px;
        }

        .point-content {
          .point-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;

            .point-title {
              font-size: 16px;
              font-weight: bold;
            }
          }

          .point-library {
            font-size: 12px;
            color: #909399;
            margin-bottom: 10px;
          }

          .point-preview {
            color: #606266;
            font-size: 14px;
            margin-bottom: 10px;
            line-height: 1.6;
          }

          .point-scene {
            display: flex;
            gap: 5px;
            margin-bottom: 10px;

            .scene-tag {
              margin-right: 5px;
            }
          }

          .point-footer {
            font-size: 12px;
            color: #909399;
          }
        }

        .point-actions {
          margin-top: 10px;
          display: flex;
          gap: 10px;
        }
      }
    }
  }

  .point-detail {
    .detail-header {
      margin-bottom: 20px;

      .point-title-section {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }
      }

      .point-meta {
        display: flex;
        gap: 20px;
        font-size: 14px;
        color: #909399;
      }
    }

    .detail-content {
      .content-section {
        margin-bottom: 20px;

        .section-title {
          font-weight: bold;
          color: #303133;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .section-body {
          .content-text {
            background: #f5f7fa;
            padding: 15px;
            border-radius: 4px;
            white-space: pre-wrap;
            word-break: break-all;
            font-family: "Courier New", monospace;
            font-size: 13px;
            line-height: 1.6;
            margin: 0;
          }

          .command-block {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 12px;
            border-radius: 4px;
            position: relative;

            pre {
              margin: 0;
              font-family: "Courier New", monospace;
              font-size: 13px;
              white-space: pre-wrap;
              word-break: break-all;
            }

            .el-button {
              position: absolute;
              top: 5px;
              right: 5px;
            }
          }

          .notice-content {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px;
            background: #fff7e6;
            border-left: 3px solid #e6a23c;
            border-radius: 4px;
            color: #e6a23c;
          }
        }
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  }
}
</style>
