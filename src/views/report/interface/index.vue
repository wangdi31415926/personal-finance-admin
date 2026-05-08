<template>
  <div class="interface-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>接口管理</span>
          <el-button type="primary" size="small">新增接口</el-button>
        </div>
      </template>
      <div class="toolbar">
        <el-select v-model="serviceFilter" placeholder="所属服务" size="small" clearable style="width: 140px">
          <el-option label="数据服务" value="数据服务" />
          <el-option label="报告服务" value="报告服务" />
          <el-option label="分析服务" value="分析服务" />
          <el-option label="模型服务" value="模型服务" />
        </el-select>
        <el-input
          v-model="tagFilter"
          placeholder="按标签筛选"
          clearable
          size="small"
          style="width: 160px"
        />
      </div>
      <el-table
        :data="paginatedInterfaceList"
        stripe
        size="small"
        highlight-current-row
        @row-click="handleRowClick"
      >
        <el-table-column prop="method" label="方法" width="70">
          <template #default="{ row }">
            <el-tag :type="row.method === 'GET' ? 'success' : 'primary'" size="small">{{ row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" min-width="200" show-overflow-tooltip />
        <el-table-column prop="service" label="所属服务" width="100" />
        <el-table-column prop="tags" label="业务标签" width="200">
          <template #default="{ row }">
            <el-tag v-for="t in row.tags" :key="t" size="small" class="mr-1">{{ t }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="permission" label="权限标识" width="120" />
        <el-table-column prop="callCount" label="近7日调用" width="90" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click.stop="handleTest(row)">测试</el-button>
            <el-button link type="primary" size="small">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="interfacePage"
        v-model:page-size="interfacePageSize"
        :total="filteredInterfaceList.length"
        layout="total, prev, pager, next, sizes"
        :page-sizes="[10, 20, 50]"
        small
        class="pagination"
      />
      <el-drawer v-model="drawerVisible" title="接口详情" size="420" direction="rtl">
        <template v-if="selectedApi">
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="路径">{{ selectedApi.path }}</el-descriptions-item>
            <el-descriptions-item label="方法">{{ selectedApi.method }}</el-descriptions-item>
            <el-descriptions-item label="权限">{{ selectedApi.permission }}</el-descriptions-item>
          </el-descriptions>
          <div class="drawer-section">请求示例</div>
          <pre class="code-block">{{ requestSample }}</pre>
          <div class="drawer-section">响应说明</div>
          <el-text type="info" size="small">JSON，含 code、message、data、pagination、trace_id</el-text>
          <el-button type="primary" size="small" class="mt-2" @click="handleTest(selectedApi)">发起测试</el-button>
        </template>
      </el-drawer>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";

const serviceFilter = ref("");
const tagFilter = ref("");
const drawerVisible = ref(false);
const selectedApi = ref<{
  path: string;
  method: string;
  service: string;
  tags: string[];
  permission: string;
  callCount: string;
} | null>(null);

const requestSample = `GET /data/metrics?region=beijing&device=core_sw
Authorization: Bearer {token}`;

const interfacePage = ref(1);
const interfacePageSize = ref(10);
const interfaceList = ref([
  { path: "/data/metrics", method: "GET", service: "数据服务", tags: ["路由交换", "端口流量"], permission: "data:metrics", callCount: "1.2k" },
  { path: "/data/devices", method: "GET", service: "数据服务", tags: ["设备列表", "区域"], permission: "data:devices", callCount: "856" },
  { path: "/reports/generate", method: "POST", service: "报告服务", tags: ["报告生成"], permission: "report:generate", callCount: "420" },
  { path: "/analysis/health", method: "GET", service: "分析服务", tags: ["健康度"], permission: "analysis:health", callCount: "638" },
  { path: "/data/topology", method: "GET", service: "数据服务", tags: ["拓扑", "连通性"], permission: "data:topology", callCount: "312" },
  { path: "/data/alarms", method: "GET", service: "数据服务", tags: ["告警"], permission: "data:alarms", callCount: "2.1k" },
  { path: "/reports/templates", method: "GET", service: "报告服务", tags: ["模板"], permission: "report:templates", callCount: "589" },
  { path: "/reports/{id}/download", method: "GET", service: "报告服务", tags: ["报告下载"], permission: "report:download", callCount: "267" },
  { path: "/analysis/predict", method: "POST", service: "分析服务", tags: ["预测"], permission: "analysis:predict", callCount: "145" },
  { path: "/analysis/detect", method: "POST", service: "分析服务", tags: ["异常检测"], permission: "analysis:detect", callCount: "198" },
  { path: "/analysis/rootcause", method: "POST", service: "分析服务", tags: ["根因分析"], permission: "analysis:rootcause", callCount: "76" },
  { path: "/models/inference", method: "POST", service: "模型服务", tags: ["推理"], permission: "models:inference", callCount: "3.2k" }
]);

const filteredInterfaceList = computed(() => {
  let list = interfaceList.value;
  if (serviceFilter.value) list = list.filter(item => item.service === serviceFilter.value);
  if (tagFilter.value) list = list.filter(item => item.tags.some(t => t.includes(tagFilter.value)));
  return list;
});

const paginatedInterfaceList = computed(() => {
  const list = filteredInterfaceList.value;
  const start = (interfacePage.value - 1) * interfacePageSize.value;
  return list.slice(start, start + interfacePageSize.value);
});

function handleRowClick(row: (typeof interfaceList.value)[0]) {
  selectedApi.value = row;
  drawerVisible.value = true;
}
function handleTest(row: (typeof interfaceList.value)[0]) {
  ElMessage.success(`测试接口：${row.path}`);
}
</script>

<style scoped lang="scss">
.interface-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
  }

  .mr-1 {
    margin-right: 4px;
  }

  .drawer-section {
    font-weight: 600;
    margin: 16px 0 8px;
    font-size: 13px;
  }

  .code-block {
    font-size: 12px;
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    margin: 0;
    overflow-x: auto;
  }

  .mt-2 {
    margin-top: 12px;
  }

  .pagination {
    margin-top: 12px;
  }
}
</style>
