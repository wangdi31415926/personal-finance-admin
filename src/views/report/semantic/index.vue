<template>
  <div class="semantic-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>语义解析配置</span>
          <div class="header-actions">
            <el-button size="small">导入规则</el-button>
            <el-button size="small">导出规则</el-button>
            <el-button type="primary" size="small" @click="handleAddMapping">新增映射</el-button>
          </div>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :span="10">
          <div class="section-title">关键词-标签映射</div>
          <div class="toolbar">
            <el-input
              v-model="mappingSearch"
              placeholder="搜索关键词或标签"
              clearable
              size="small"
              style="width: 200px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="tagFilter" placeholder="按标签筛选" size="small" clearable style="width: 140px">
              <el-option label="专业维度" value="pro" />
              <el-option label="空间维度" value="space" />
              <el-option label="时间维度" value="time" />
            </el-select>
          </div>
          <el-table
            :data="paginatedMappingList"
            stripe
            size="small"
            max-height="340"
            highlight-current-row
          >
            <el-table-column prop="keyword" label="关键词" width="110" />
            <el-table-column prop="tag" label="映射标签" min-width="140" show-overflow-tooltip />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small">编辑</el-button>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="10"
            :total="filteredMappingList.length"
            layout="total, prev, pager, next"
            small
            class="pagination"
          />
        </el-col>
        <el-col :span="14">
          <div class="section-title">解析试跑</div>
          <el-input
            v-model="userInput"
            type="textarea"
            :rows="3"
            placeholder="输入报告需求，如：北京区域核心交换机本周巡检报告"
          />
          <el-button type="primary" size="small" class="run-btn" @click="handleParse">一键解析</el-button>
          <el-collapse v-model="activeSteps" class="result-collapse">
            <el-collapse-item name="pre">
              <template #title>
                <el-tag type="info" size="small">预处理</el-tag>
                <span class="step-desc">文本清洗、分词、命名实体识别</span>
              </template>
              <div class="step-content">已识别实体：北京区域、核心交换机、本周、巡检报告</div>
            </el-collapse-item>
            <el-collapse-item name="intent">
              <template #title>
                <el-tag type="primary" size="small">意图理解</el-tag>
                <span class="step-desc">报告生成请求</span>
              </template>
              <div class="step-content">意图：报告生成；设备类型、地域、时间已识别</div>
            </el-collapse-item>
            <el-collapse-item name="tag">
              <template #title>
                <el-tag type="success" size="small">标签映射</el-tag>
                <span class="step-desc">输出标准化标签</span>
              </template>
              <div class="step-content">专业: 路由交换 | 场景: 核心机房 | 时间: 周度 | 类型: 巡检</div>
            </el-collapse-item>
          </el-collapse>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";

const mappingSearch = ref("");
const tagFilter = ref("");
const currentPage = ref(1);
const userInput = ref("北京区域核心交换机本周巡检报告");
const activeSteps = ref(["pre", "intent", "tag"]);

const pageSize = 10;
const mappingList = ref([
  { keyword: "核心交换机", tag: "专业维度-路由交换" },
  { keyword: "北京区域", tag: "空间维度-北京" },
  { keyword: "本周", tag: "时间维度-周度" },
  { keyword: "巡检报告", tag: "类型维度-巡检" },
  { keyword: "端口流量", tag: "数据维度-端口流量" },
  { keyword: "上海", tag: "空间维度-上海" },
  { keyword: "月度", tag: "时间维度-月度" },
  { keyword: "广州", tag: "空间维度-广州" },
  { keyword: "深圳", tag: "空间维度-深圳" },
  { keyword: "故障分析", tag: "类型维度-故障分析" },
  { keyword: "运行报告", tag: "类型维度-运行" },
  { keyword: "骨干链路", tag: "专业维度-骨干网" },
  { keyword: "昨日", tag: "时间维度-日度" }
]);

const filteredMappingList = computed(() => {
  let list = mappingList.value;
  if (mappingSearch.value) {
    const q = mappingSearch.value.toLowerCase();
    list = list.filter(
      item =>
        item.keyword.toLowerCase().includes(q) || item.tag.toLowerCase().includes(q)
    );
  }
  if (tagFilter.value) {
    list = list.filter(item => item.tag.startsWith(tagFilter.value === "pro" ? "专业" : tagFilter.value === "space" ? "空间" : "时间"));
  }
  return list;
});

const paginatedMappingList = computed(() => {
  const list = filteredMappingList.value;
  const start = (currentPage.value - 1) * pageSize;
  return list.slice(start, start + pageSize);
});

function handleAddMapping() {
  ElMessage.info("打开新增映射弹窗");
}

function handleParse() {
  ElMessage.success("解析完成");
}
</script>

<style scoped lang="scss">
.semantic-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-title {
    font-weight: 600;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
  }

  .pagination {
    margin-top: 12px;
  }

  .run-btn {
    margin-top: 10px;
  }

  .result-collapse {
    margin-top: 16px;

    .step-desc {
      margin-left: 8px;
      font-size: 13px;
      color: #606266;
    }

    .step-content {
      font-size: 13px;
      color: #606266;
      padding: 4px 0;
    }
  }
}
</style>
