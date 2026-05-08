<template>
  <div class="template-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>报告模板</span>
          <el-button type="primary" size="small">新建模板</el-button>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :span="5">
          <div class="sidebar">
            <div class="sidebar-title">模板分类</div>
            <el-tree
              :data="categoryTree"
              :props="{ label: 'name', children: 'children' }"
              default-expand-all
              highlight-current
              @node-click="handleCategoryClick"
            />
          </div>
        </el-col>
        <el-col :span="19">
          <div class="toolbar">
            <el-input
              v-model="searchKeyword"
              placeholder="按标签/场景检索"
              clearable
              size="small"
              style="width: 220px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="scope" placeholder="可见范围" size="small" style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="预置模板" value="system" />
              <el-option label="自定义" value="custom" />
            </el-select>
            <el-select v-model="sortBy" placeholder="排序" size="small" style="width: 120px">
              <el-option label="使用量" value="use" />
              <el-option label="最近更新" value="update" />
            </el-select>
          </div>
          <el-table
            :data="paginatedTemplateList"
            stripe
            size="small"
            highlight-current-row
            @row-click="handleRowClick"
          >
            <el-table-column prop="name" label="模板名称" min-width="200" />
            <el-table-column prop="scene" label="适用场景" width="120" />
            <el-table-column prop="scope" label="范围" width="90">
              <template #default="{ row }">
                <el-tag :type="row.scope === '预置' ? 'primary' : 'success'" size="small">
                  {{ row.scope }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="useCount" label="使用量" width="90" />
            <el-table-column prop="updateTime" label="更新时间" width="110" />
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small">使用</el-button>
                <el-button link type="primary" size="small">编辑</el-button>
                <el-button link type="primary" size="small">克隆</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-model:current-page="templatePage"
            v-model:page-size="templatePageSize"
            :total="filteredTemplateList.length"
            layout="total, prev, pager, next, sizes"
            :page-sizes="[10, 20, 50]"
            small
            class="pagination"
          />
          <el-drawer
            v-model="drawerVisible"
            title="模板详情"
            size="420"
            direction="rtl"
          >
            <template v-if="selectedTemplate">
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="模板名称">{{ selectedTemplate.name }}</el-descriptions-item>
                <el-descriptions-item label="适用场景">{{ selectedTemplate.scene }}</el-descriptions-item>
                <el-descriptions-item label="使用量">{{ selectedTemplate.useCount }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ selectedTemplate.updateTime }}</el-descriptions-item>
              </el-descriptions>
              <div class="drawer-section">章节结构</div>
              <el-tag size="small" class="mr-1">概述</el-tag>
              <el-tag size="small" class="mr-1">数据图表</el-tag>
              <el-tag size="small" class="mr-1">AI 总结</el-tag>
              <div class="drawer-section">关联接口</div>
              <el-text type="info" size="small">/data/metrics、/data/devices、/analysis/health</el-text>
              <div class="drawer-actions">
                <el-button type="primary" size="small">使用模板</el-button>
                <el-button size="small">克隆</el-button>
              </div>
            </template>
          </el-drawer>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Search } from "@element-plus/icons-vue";

const searchKeyword = ref("");
const scope = ref("");
const sortBy = ref("use");
const templatePage = ref(1);
const templatePageSize = ref(10);
const drawerVisible = ref(false);
const selectedTemplate = ref<{
  name: string;
  scene: string;
  scope: string;
  useCount: number;
  updateTime: string;
} | null>(null);

const categoryTree = ref([
  {
    name: "核心设备巡检",
    children: [
      { name: "核心交换机", children: [] },
      { name: "核心路由器", children: [] }
    ]
  },
  {
    name: "骨干链路故障分析",
    children: [
      { name: "链路质量", children: [] },
      { name: "丢包与时延", children: [] }
    ]
  },
  {
    name: "网络运行监控",
    children: [
      { name: "流量监控", children: [] },
      { name: "告警汇总", children: [] }
    ]
  },
  { name: "安全与合规", children: [] }
]);

const templateList = ref([
  { name: "核心交换机周度巡检报告", scene: "核心机房", scope: "预置", useCount: 320, updateTime: "2025-03-10" },
  { name: "端口流量与告警分析", scene: "运行监控", scope: "预置", useCount: 156, updateTime: "2025-03-08" },
  { name: "北京区域自定义巡检", scene: "核心机房", scope: "自定义", useCount: 28, updateTime: "2025-03-12" },
  { name: "骨干链路质量周报", scene: "骨干链路", scope: "预置", useCount: 89, updateTime: "2025-03-11" },
  { name: "设备健康度月度报告", scene: "运行监控", scope: "预置", useCount: 204, updateTime: "2025-03-09" },
  { name: "上海区域核心设备巡检", scene: "核心机房", scope: "自定义", useCount: 15, updateTime: "2025-03-14" },
  { name: "故障根因分析报告", scene: "故障分析", scope: "预置", useCount: 67, updateTime: "2025-03-07" },
  { name: "端口利用率趋势分析", scene: "运行监控", scope: "预置", useCount: 178, updateTime: "2025-03-06" },
  { name: "运维值班日报", scene: "运行监控", scope: "自定义", useCount: 42, updateTime: "2025-03-13" },
  { name: "网络拓扑与连通性报告", scene: "拓扑管理", scope: "预置", useCount: 95, updateTime: "2025-03-05" },
  { name: "告警统计与处理汇总", scene: "告警管理", scope: "预置", useCount: 132, updateTime: "2025-03-04" },
  { name: "广州区域周度巡检", scene: "核心机房", scope: "自定义", useCount: 8, updateTime: "2025-03-15" }
]);

const filteredTemplateList = computed(() => {
  let list = templateList.value;
  if (searchKeyword.value) {
    list = list.filter(
      item =>
        item.name.includes(searchKeyword.value) || item.scene.includes(searchKeyword.value)
    );
  }
  if (scope.value) {
    list = list.filter(item => (scope.value === "system" ? item.scope === "预置" : item.scope === "自定义"));
  }
  return list;
});

const paginatedTemplateList = computed(() => {
  const list = filteredTemplateList.value;
  const start = (templatePage.value - 1) * templatePageSize.value;
  return list.slice(start, start + templatePageSize.value);
});

function handleCategoryClick() {}
function handleRowClick(row: (typeof templateList.value)[0]) {
  selectedTemplate.value = row;
  drawerVisible.value = true;
}
</script>

<style scoped lang="scss">
.template-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sidebar {
    padding: 12px;
    background: #f5f7fa;
    border-radius: 6px;

    .sidebar-title {
      font-weight: 600;
      margin-bottom: 12px;
      font-size: 14px;
    }
  }

  .toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
  }

  .drawer-section {
    font-weight: 600;
    margin: 16px 0 8px;
    font-size: 13px;
  }

  .mr-1 {
    margin-right: 6px;
    margin-bottom: 6px;
  }

  .drawer-actions {
    margin-top: 24px;
    display: flex;
    gap: 10px;
  }

  .pagination {
    margin-top: 12px;
  }
}
</style>
