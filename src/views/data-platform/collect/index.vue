<script setup lang="ts">
import { computed, ref } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import DetailDrawer from "@/views/_shared/DetailDrawer.vue";
import MiniChart from "@/views/_shared/MiniChart.vue";
import {
  genTimeSeries,
  simpleLineOption,
  fmtTime,
  tagTypeOf
} from "@/views/_shared/mockUtils";

defineOptions({ name: "DpCollect" });

const mainTab = ref<"collect" | "share">("collect");
const collectMode = ref<"realtime" | "batch">("realtime");
const protocol = ref("SNMP");

const nodes = ref(
  Array.from({ length: 18 }, (_, i) => ({
    id: `ND-${1001 + i}`,
    name: `采集节点-${["网关", "边缘", "汇聚"][i % 3]}${i + 1}`,
    protocol: ["SNMP", "Modbus", "HTTP", "TCP/IP"][i % 4],
    mode: i % 3 === 0 ? "batch" : "realtime",
    progress: Math.min(100, 35 + (i * 11) % 66),
    status: ["正常", "正常", "异常", "暂停"][i % 4] as string,
    beamId: `B-${(i % 6) + 1}`,
    lastPkt: fmtTime(new Date(Date.now() - i * 3600000))
  }))
);

const shareApis = ref(
  Array.from({ length: 12 }, (_, i) => ({
    id: `API-${200 + i}`,
    method: ["GET", "POST", "GET"][i % 3],
    path: `/v1/ops/${["metrics", "fault", "beam", "user"][i % 4]}`,
    caller: ["运维管理系统", "业务编排", "外部审计", "集团门户"][i % 4],
    perm: ["只读", "读写", "订阅"][i % 3],
    qps: 120 + i * 37,
    rateLimit: `${80 + (i % 5) * 20}/s`,
    timeoutMs: 8000 + (i % 4) * 2000,
    version: `v${1 + (i % 3)}`,
    enabled: i % 5 !== 0
  }))
);

const shareLogs = ref(
  Array.from({ length: 15 }, (_, i) => ({
    id: `SL-${300 + i}`,
    traceId: `TRC-${20260509}${String(i).padStart(4, "0")}`,
    time: fmtTime(new Date(Date.now() - i * 420000)),
    caller: shareApis.value[i % shareApis.value.length].caller,
    path: shareApis.value[i % shareApis.value.length].path,
    method: shareApis.value[i % shareApis.value.length].method,
    bytes: (1200 + i * 880).toLocaleString(),
    latencyMs: 12 + (i % 8) * 7,
    clientIp: `10.${(i % 200) + 1}.${(i % 250)}.${(i % 200) + 10}`,
    result: i % 7 === 0 ? "权限异常" : i % 11 === 0 ? "格式错误" : "成功"
  }))
);

const drawer = ref(false);
const drawerRow = ref<(typeof nodes.value)[0] | null>(null);

const throughput = computed(() => {
  const { ts, values } = genTimeSeries(18, collectMode.value === "realtime" ? 120 : 45, 40, 3);
  return simpleLineOption(
    collectMode.value === "realtime" ? "实时采集吞吐（条/分钟）" : "批量批次吞吐（条/小时）",
    ts,
    values
  );
});

const shareTrend = computed(() => {
  const { ts, values } = genTimeSeries(16, 200, 80, 5);
  return simpleLineOption("共享调用 QPS 趋势", ts, values, "QPS");
});

function openNode(row: (typeof nodes.value)[0]) {
  drawerRow.value = row;
  drawer.value = true;
}
</script>

<template>
  <PageShell
    title="运维数据采集与数据共享"
    subtitle="5.4.1.1 多源采集 · 5.4.1.1.2 数据共享"
    class="dp-collect"
  >
    <template #toolbar>
      <el-tag type="info" size="small">mock 数据 ≤20 条/表</el-tag>
      <el-button size="small">导出策略</el-button>
      <el-button type="primary" size="small">保存采集配置</el-button>
    </template>

    <template #tabs>
      <el-tabs v-model="mainTab" class="shell-tab-bar">
        <el-tab-pane label="多源运维数据采集" name="collect" />
        <el-tab-pane label="数据共享能力" name="share" />
      </el-tabs>
    </template>

    <div v-show="mainTab === 'collect'" class="tab-pane-inner">
      <el-row :gutter="12" class="filter-row">
        <el-col :xs="24" :sm="8">
          <span class="lbl">采集模式</span>
          <el-radio-group v-model="collectMode" size="small">
            <el-radio-button value="realtime">实时采集</el-radio-button>
            <el-radio-button value="batch">批量采集</el-radio-button>
          </el-radio-group>
        </el-col>
        <el-col :xs="24" :sm="8">
          <span class="lbl">协议组件</span>
          <el-select v-model="protocol" size="small" style="width: 160px">
            <el-option label="SNMP" value="SNMP" />
            <el-option label="Modbus" value="Modbus" />
            <el-option label="HTTP" value="HTTP" />
            <el-option label="TCP/IP" value="TCP/IP" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="8">
          <span class="lbl">短报文平台接口</span>
          <el-switch active-text="启用重试" inactive-text="关闭" size="small" />
        </el-col>
      </el-row>

      <el-form label-width="96px" size="small" class="strategy-form">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="采集周期">
              <el-input-number :min="1" :max="3600" :model-value="60" controls-position="right" />
              <span class="unit">秒</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="超时时间">
              <el-input-number :min="1" :max="120" :model-value="15" controls-position="right" />
              <span class="unit">秒</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="波束过滤">
              <el-select placeholder="全部波束" style="width: 100%">
                <el-option label="B-1 华北" value="1" />
                <el-option label="B-3 华东" value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="split-grid">
        <div class="chart-box">
          <MiniChart :option="throughput" :height="220" />
        </div>
        <div class="hint-panel">
          <div class="hint-title">异常处置建议（mock）</div>
          <ul class="hint-list">
            <li>接口调用失败：检查短报文平台 Token 与调用频率上限。</li>
            <li>采集中断：重启边缘预处理节点或切换批量模式降级。</li>
            <li>数据丢失：核对监测接收机时钟同步与出站链路。</li>
          </ul>
        </div>
      </div>

      <div class="table-wrap">
        <div class="table-caption">采集节点 / 数据类型监控（点击行查看详情）</div>
        <PagedTable :data="nodes" :page-size="8" row-key="id" row-clickable @row-click="openNode">
          <el-table-column prop="id" label="节点ID" width="100" />
          <el-table-column prop="name" label="节点" min-width="120" />
          <el-table-column prop="protocol" label="协议" width="88" />
          <el-table-column prop="mode" label="模式" width="88">
            <template #default="{ row }">
              <el-tag size="small" type="info">{{ row.mode }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="beamId" label="关联波束" width="88" />
          <el-table-column prop="progress" label="进度%" width="88" />
          <el-table-column prop="status" label="状态" width="88">
            <template #default="{ row }">
              <el-tag :type="tagTypeOf(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastPkt" label="最近数据包" width="158" />
        </PagedTable>
      </div>
    </div>

    <div v-show="mainTab === 'share'" class="tab-pane-inner">
      <el-row :gutter="12" class="channel-row">
        <el-col :span="8">
          <el-card shadow="never" class="stat-card">
            <div class="stat-k">内部通道</div>
            <div class="stat-v">治理模块 ← 实时同步 → 服务模块</div>
            <el-tag type="success" size="small">运行正常</el-tag>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never" class="stat-card">
            <div class="stat-k">外部 API</div>
            <div class="stat-v">已注册 {{ shareApis.length }} 个消费者</div>
            <el-progress :percentage="72" :stroke-width="10" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never" class="stat-card">
            <div class="stat-k">今日共享字节</div>
            <div class="stat-v">18.6 GB</div>
            <span class="muted">含故障快照与波束指标</span>
          </el-card>
        </el-col>
      </el-row>

      <MiniChart :option="shareTrend" :height="200" />

      <el-row :gutter="12" class="two-cols">
        <el-col :span="14">
          <div class="table-caption">外部系统 API 注册</div>
          <PagedTable :data="shareApis" :page-size="6" row-key="id">
            <el-table-column prop="id" label="注册ID" width="100" />
            <el-table-column prop="method" label="方法" width="72" />
            <el-table-column prop="path" label="路径" min-width="160" />
            <el-table-column prop="caller" label="调用方" width="120" />
            <el-table-column prop="perm" label="权限" width="72" />
            <el-table-column prop="qps" label="峰值QPS" width="88" />
            <el-table-column prop="rateLimit" label="流控配额" width="100" />
            <el-table-column prop="timeoutMs" label="超时ms" width="88" />
            <el-table-column prop="version" label="契约版本" width="92" />
            <el-table-column prop="enabled" label="状态" width="88">
              <template #default="{ row }">
                <el-tag :type="row.enabled ? 'success' : 'info'" size="small">{{
                  row.enabled ? "启用" : "停用"
                }}</el-tag>
              </template>
            </el-table-column>
          </PagedTable>
        </el-col>
        <el-col :span="10">
          <div class="table-caption">共享审计日志</div>
          <PagedTable :data="shareLogs" :page-size="8" row-key="id">
            <el-table-column prop="traceId" label="TraceId" width="128" show-overflow-tooltip />
            <el-table-column prop="time" label="时间" width="158" />
            <el-table-column prop="caller" label="调用方" width="112" />
            <el-table-column prop="path" label="接口路径" min-width="140" show-overflow-tooltip />
            <el-table-column prop="method" label="方法" width="72" />
            <el-table-column prop="bytes" label="载荷字节" width="96" />
            <el-table-column prop="latencyMs" label="时延ms" width="88" />
            <el-table-column prop="clientIp" label="来源IP" width="124" />
            <el-table-column prop="result" label="结果" width="96">
              <template #default="{ row }">
                <el-tag :type="row.result === '成功' ? 'success' : 'danger'" size="small">{{
                  row.result
                }}</el-tag>
              </template>
            </el-table-column>
          </PagedTable>
        </el-col>
      </el-row>
    </div>

    <DetailDrawer v-model="drawer" title="采集节点详情">
      <template v-if="drawerRow">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="节点">{{ drawerRow.name }}</el-descriptions-item>
          <el-descriptions-item label="协议">{{ drawerRow.protocol }}</el-descriptions-item>
          <el-descriptions-item label="模式">{{ drawerRow.mode }}</el-descriptions-item>
          <el-descriptions-item label="波束">{{ drawerRow.beamId }}</el-descriptions-item>
          <el-descriptions-item label="建议">边缘预处理已开启去重与格式规整。</el-descriptions-item>
        </el-descriptions>
      </template>
    </DetailDrawer>
  </PageShell>
</template>

<style scoped>
.dp-collect {
  --lbl-w: 72px;
}
.shell-tab-bar :deep(.el-tabs__header) {
  margin-bottom: 0;
}
.tab-pane-inner {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}
.filter-row {
  flex-shrink: 0;
  align-items: center;
}
.lbl {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-right: 8px;
}
.strategy-form {
  flex-shrink: 0;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}
.unit {
  margin-left: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.split-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
  flex-shrink: 0;
  min-height: 220px;
}
@media (max-width: 960px) {
  .split-grid {
    grid-template-columns: 1fr;
  }
}
.chart-box {
  min-height: 220px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}
.hint-panel {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}
.hint-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}
.hint-list {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}
.table-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.table-caption {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}
.channel-row {
  flex-shrink: 0;
}
.stat-card {
  border-radius: 8px;
}
.stat-k {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.stat-v {
  font-size: 15px;
  font-weight: 600;
  margin: 6px 0;
}
.muted {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.two-cols {
  flex: 1;
  min-height: 0;
}
.two-cols .el-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.two-cols :deep(.paged-table) {
  flex: 1;
}
</style>
