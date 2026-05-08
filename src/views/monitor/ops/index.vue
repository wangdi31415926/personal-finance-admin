<script setup lang="ts">
import { ref } from "vue";
import PageShell from "@/views/_shared/PageShell.vue";
import PagedTable from "@/views/_shared/PagedTable.vue";
import { fmtTime } from "@/views/_shared/mockUtils";

defineOptions({ name: "MonOps" });

const tab = ref("o1");

const pods = ref(
  Array.from({ length: 18 }, (_, i) => ({
    id: `POD-${3500 + i}`,
    ns: ["ops", "beam", "gateway"][i % 3],
    name: `svc-${["metrics", "fault", "user"][i % 3]}-${i}`,
    cpu: `${40 + (i * 5) % 45}%`,
    mem: `${50 + (i * 3) % 40}%`,
    restarts: i % 7,
    node: `k8s-worker-${(i % 5) + 1}`,
    ready: `${2 + (i % 3)}/${2 + (i % 3)}`,
    age: `${1 + (i % 30)}d`,
    qos: ["BestEffort", "Burstable", "Guaranteed"][i % 3],
    imageDigest: `sha256:${(i * 9973).toString(16).slice(0, 10)}…`
  }))
);

const images = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `IMG-${3600 + i}`,
    repo: `registry.bdops.local/beam/${["api", "worker", "batch"][i % 3]}`,
    tag: `2026.05.${i % 20}`,
    scan: i % 5 === 0 ? "高危依赖" : "通过",
    sizeMb: (220 + (i % 18) * 17).toFixed(0),
    pushedAt: fmtTime(new Date(Date.now() - i * 86400000)),
    signer: `cosign-${(i % 3) + 1}`,
    layerCnt: 18 + (i % 12),
    baseOs: ["debian:12", "alpine:3.20", "ubi9"][i % 3]
  }))
);

const deploy = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `DP-${3700 + i}`,
    pipeline: ["金丝雀", "蓝绿", "滚动"][i % 3],
    ver: `rel-${120 + i}`,
    step: ["构建", "扫描", "灰度", "全量"][i % 4],
    time: fmtTime(new Date(Date.now() - i * 7200000)),
    env: ["prod", "staging"][i % 2],
    triggerBy: `ci-bot-${(i % 2) + 1}`,
    canaryPct: i % 3 === 0 ? `${10 + (i % 4) * 10}%` : "—",
    rollbackVer: `rel-${118 + (i % 3)}`,
    ticketId: `CHG-${20260509}-${420 + i}`
  }))
);
</script>

<template>
  <PageShell title="容器统一运维与镜像部署" subtitle="5.4.3.5 容器 · 镜像仓库 · 自动部署升级">
    <template #tabs>
      <el-tabs v-model="tab" class="shell-tab-bar">
        <el-tab-pane label="容器统一运维" name="o1" />
        <el-tab-pane label="镜像仓库" name="o2" />
        <el-tab-pane label="自动部署升级" name="o3" />
      </el-tabs>
    </template>

    <div class="pane">
      <PagedTable v-if="tab === 'o1'" :data="pods" :page-size="10" row-key="id">
        <el-table-column prop="id" label="Pod ID" width="112" />
        <el-table-column prop="ns" label="命名空间" width="100" />
        <el-table-column prop="name" label="工作负载" min-width="140" />
        <el-table-column prop="node" label="节点" width="120" />
        <el-table-column prop="ready" label="就绪" width="88" />
        <el-table-column prop="cpu" label="CPU" width="72" />
        <el-table-column prop="mem" label="内存" width="72" />
        <el-table-column prop="restarts" label="重启" width="72" />
        <el-table-column prop="age" label="运行时长" width="96" />
        <el-table-column prop="qos" label="QoS" width="104" />
        <el-table-column prop="imageDigest" label="镜像摘要" min-width="140" show-overflow-tooltip />
      </PagedTable>

      <PagedTable v-if="tab === 'o2'" :data="images" :page-size="8" row-key="id">
        <el-table-column prop="id" label="镜像ID" width="108" />
        <el-table-column prop="repo" label="仓库路径" min-width="200" show-overflow-tooltip />
        <el-table-column prop="tag" label="标签" width="100" />
        <el-table-column prop="sizeMb" label="大小MB" width="88" />
        <el-table-column prop="baseOs" label="基础OS" width="108" />
        <el-table-column prop="layerCnt" label="层数" width="72" />
        <el-table-column prop="scan" label="安全扫描" width="100" />
        <el-table-column prop="signer" label="签名" width="96" />
        <el-table-column prop="pushedAt" label="推送时间" width="158" />
      </PagedTable>

      <div v-if="tab === 'o3'" class="deploy-pane">
        <el-steps :active="3" align-center finish-status="success">
          <el-step title="构建" />
          <el-step title="镜像扫描" />
          <el-step title="灰度发布" />
          <el-step title="全量" />
        </el-steps>
        <PagedTable :data="deploy" :page-size="8" row-key="id" class="mt">
          <el-table-column prop="id" label="发布ID" width="108" />
          <el-table-column prop="ticketId" label="变更单" width="128" />
          <el-table-column prop="pipeline" label="策略" width="88" />
          <el-table-column prop="env" label="环境" width="88" />
          <el-table-column prop="ver" label="目标版本" width="108" />
          <el-table-column prop="rollbackVer" label="回滚版本" width="108" />
          <el-table-column prop="step" label="当前步骤" width="100" />
          <el-table-column prop="canaryPct" label="灰度比例" width="96" />
          <el-table-column prop="triggerBy" label="触发人" width="100" />
          <el-table-column prop="time" label="更新时间" width="158" />
        </PagedTable>
      </div>
    </div>
  </PageShell>
</template>

<style scoped>
.pane {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.deploy-pane {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mt {
  margin-top: 8px;
}
</style>
