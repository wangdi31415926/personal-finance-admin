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
    restarts: i % 7
  }))
);

const images = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `IMG-${3600 + i}`,
    repo: `registry.bdops.local/beam/${["api", "worker", "batch"][i % 3]}`,
    tag: `2026.05.${i % 20}`,
    scan: i % 5 === 0 ? "高危依赖" : "通过"
  }))
);

const deploy = ref(
  Array.from({ length: 14 }, (_, i) => ({
    id: `DP-${3700 + i}`,
    pipeline: ["金丝雀", "蓝绿", "滚动"][i % 3],
    ver: `rel-${120 + i}`,
    step: ["构建", "扫描", "灰度", "全量"][i % 4],
    time: fmtTime(new Date(Date.now() - i * 7200000))
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
        <el-table-column prop="ns" label="命名空间" width="100" />
        <el-table-column prop="name" label="工作负载" />
        <el-table-column prop="cpu" label="CPU" width="72" />
        <el-table-column prop="mem" label="内存" width="72" />
        <el-table-column prop="restarts" label="重启" width="72" />
      </PagedTable>

      <PagedTable v-if="tab === 'o2'" :data="images" :page-size="8" row-key="id">
        <el-table-column prop="repo" label="镜像" min-width="220" />
        <el-table-column prop="tag" label="标签" width="100" />
        <el-table-column prop="scan" label="扫描" width="100" />
      </PagedTable>

      <div v-if="tab === 'o3'" class="deploy-pane">
        <el-steps :active="3" align-center finish-status="success">
          <el-step title="构建" />
          <el-step title="镜像扫描" />
          <el-step title="灰度发布" />
          <el-step title="全量" />
        </el-steps>
        <PagedTable :data="deploy" :page-size="8" row-key="id" class="mt">
          <el-table-column prop="pipeline" label="策略" width="88" />
          <el-table-column prop="ver" label="版本" width="100" />
          <el-table-column prop="step" label="当前步骤" width="100" />
          <el-table-column prop="time" label="时间" width="158" />
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
