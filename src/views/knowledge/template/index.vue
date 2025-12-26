<template>
  <div class="template-management">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>模板管理</span>
          <el-button type="primary" @click="handleCreateTemplate">
            新建模板
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索模板，如'故障处理'"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleAdvancedFilter">
          高级筛选
        </el-button>
      </div>

      <!-- 热门搜索标签 -->
      <div class="hot-tags">
        <el-tag
          v-for="tag in hotTags"
          :key="tag"
          class="hot-tag"
          @click="handleTagClick(tag)"
        >
          {{ tag }}
        </el-tag>
      </div>

      <!-- 分类导航 -->
      <div class="category-layout">
        <div class="category-sidebar">
          <div class="category-title">模板分类</div>
          <el-tree
            :data="categoryTree"
            :props="{ children: 'children', label: 'name' }"
            default-expand-all
            @node-click="handleCategoryClick"
          />
          <div class="category-actions">
            <el-button type="text" @click="handleManageCategory">
              管理分类
            </el-button>
          </div>
        </div>

        <div class="template-content">
          <div class="content-header">
            <el-select
              v-model="sortType"
              placeholder="排序方式"
              size="small"
              style="width: 150px"
            >
              <el-option label="使用频率" value="frequency" />
              <el-option label="评分排序" value="rating" />
              <el-option label="更新时间" value="update" />
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
          </div>

          <!-- 模板列表 -->
          <div v-if="viewMode === 'card'" class="template-cards">
            <el-card
              v-for="template in filteredTemplates"
              :key="template.id"
              class="template-card"
              shadow="hover"
            >
              <div class="card-header">
                <span class="template-name">{{ template.name }}</span>
                <el-tag :type="getTemplateTypeTag(template.type)" size="small">
                  {{ getTemplateTypeText(template.type) }}
                </el-tag>
                <el-tag v-if="template.isOfficial" type="primary" size="small">
                  官方认证
                </el-tag>
              </div>
              <div class="card-description">{{ template.description }}</div>
              <div class="card-stats">
                <span>使用次数：{{ template.useCount }}</span>
                <span>评分：{{ template.rating }}星</span>
                <span>更新时间：{{ template.updateTime }}</span>
              </div>
              <div class="card-tags">
                <el-tag
                  v-for="tag in template.tags"
                  :key="tag"
                  size="small"
                  class="tag-item"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <div class="card-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="handleUse(template)"
                >
                  立即使用
                </el-button>
                <el-button size="small" @click="handlePreview(template)">
                  预览
                </el-button>
                <el-button
                  v-if="template.canEdit"
                  size="small"
                  @click="handleEdit(template)"
                >
                  编辑
                </el-button>
                <el-button size="small" @click="handleShare(template)">
                  分享
                </el-button>
                <el-button size="small" @click="handleFavorite(template)">
                  收藏
                </el-button>
              </div>
            </el-card>
          </div>

          <!-- 列表视图 -->
          <el-table v-else :data="filteredTemplates" style="width: 100%" stripe>
            <el-table-column prop="name" label="模板名称" min-width="200" />
            <el-table-column prop="type" label="模板类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getTemplateTypeTag(row.type)" size="small">
                  {{ getTemplateTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="useCount" label="使用次数" width="120" />
            <el-table-column prop="rating" label="评分" width="100">
              <template #default="{ row }">
                <el-rate v-model="row.rating" disabled show-score />
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="180" />
            <el-table-column label="操作" width="300">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleUse(row)">
                  使用
                </el-button>
                <el-button link type="primary" @click="handlePreview(row)">
                  预览
                </el-button>
                <el-button
                  v-if="row.canEdit"
                  link
                  type="primary"
                  @click="handleEdit(row)"
                >
                  编辑
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";

const searchKeyword = ref("");
const sortType = ref("frequency");
const viewMode = ref("card");

const hotTags = ["故障处理", "Linux命令", "设备配置", "操作指南"];

const categoryTree = ref([
  {
    id: "1",
    name: "设备维护",
    children: [
      { id: "1-1", name: "路由器" },
      { id: "1-2", name: "交换机" }
    ]
  },
  {
    id: "2",
    name: "系统操作",
    children: [
      { id: "2-1", name: "Linux系统" },
      { id: "2-2", name: "Windows系统" }
    ]
  },
  {
    id: "3",
    name: "故障处理",
    children: [
      { id: "3-1", name: "网络故障" },
      { id: "3-2", name: "系统故障" }
    ]
  }
]);

// 测试数据
const templates = ref([
  {
    id: "1",
    name: "故障处理模板",
    description:
      "标准化的故障处理流程模板，包含问题描述、排查步骤、解决方案等字段",
    type: "system",
    isOfficial: true,
    useCount: 120,
    rating: 4.5,
    updateTime: "2025-11-20",
    tags: ["故障处理", "标准流程"],
    canEdit: false
  },
  {
    id: "2",
    name: "Linux命令集模板",
    description: "常用Linux命令的快速参考模板",
    type: "personal",
    isOfficial: false,
    useCount: 89,
    rating: 4.2,
    updateTime: "2025-11-18",
    tags: ["Linux", "命令"],
    canEdit: true
  },
  {
    id: "3",
    name: "设备配置模板",
    description: "网络设备配置的标准模板",
    type: "shared",
    isOfficial: false,
    useCount: 156,
    rating: 4.8,
    updateTime: "2025-11-22",
    tags: ["设备配置", "网络"],
    canEdit: true
  }
]);

const filteredTemplates = computed(() => {
  let results = [...templates.value];
  if (searchKeyword.value) {
    results = results.filter(
      item =>
        item.name.includes(searchKeyword.value) ||
        item.description.includes(searchKeyword.value)
    );
  }
  return results;
});

const getTemplateTypeTag = (type: string) => {
  const map: Record<string, string> = {
    system: "primary",
    personal: "success",
    shared: "info"
  };
  return map[type] || "";
};

const getTemplateTypeText = (type: string) => {
  const map: Record<string, string> = {
    system: "系统",
    personal: "个人",
    shared: "共享"
  };
  return map[type] || "";
};

const handleSearch = () => {
  // 搜索逻辑
};

const handleAdvancedFilter = () => {
  ElMessage.info("高级筛选功能");
};

const handleTagClick = (tag: string) => {
  searchKeyword.value = tag;
  handleSearch();
};

const handleCategoryClick = (data: any) => {
  ElMessage.info(`选择分类：${data.name}`);
};

const handleManageCategory = () => {
  ElMessage.info("管理分类");
};

const handleCreateTemplate = () => {
  ElMessage.info("新建模板");
};

const handleUse = (template: any) => {
  ElMessage.success(`正在使用模板：${template.name}`);
};

const handlePreview = (template: any) => {
  ElMessage.info(`预览模板：${template.name}`);
};

const handleEdit = (template: any) => {
  ElMessage.info(`编辑模板：${template.name}`);
};

const handleShare = (template: any) => {
  ElMessage.info(`分享模板：${template.name}`);
};

const handleFavorite = (template: any) => {
  ElMessage.success(`已收藏模板：${template.name}`);
};
</script>

<style scoped lang="scss">
.template-management {
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

  .hot-tags {
    margin-bottom: 20px;

    .hot-tag {
      margin-right: 10px;
      margin-bottom: 10px;
      cursor: pointer;

      &:hover {
        background: #409eff;
        color: white;
      }
    }
  }

  .category-layout {
    display: flex;
    gap: 20px;

    .category-sidebar {
      width: 200px;
      padding: 15px;
      background: #f5f7fa;
      border-radius: 4px;

      .category-title {
        font-weight: bold;
        margin-bottom: 15px;
      }

      .category-actions {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #dcdfe6;
      }
    }

    .template-content {
      flex: 1;

      .content-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
      }

      .template-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;

        .template-card {
          .card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;

            .template-name {
              font-size: 16px;
              font-weight: bold;
            }
          }

          .card-description {
            color: #606266;
            font-size: 14px;
            margin-bottom: 10px;
            line-height: 1.6;
          }

          .card-stats {
            font-size: 12px;
            color: #909399;
            margin-bottom: 10px;
            display: flex;
            gap: 15px;
          }

          .card-tags {
            margin-bottom: 10px;

            .tag-item {
              margin-right: 5px;
            }
          }

          .card-actions {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
          }
        }
      }
    }
  }
}
</style>
