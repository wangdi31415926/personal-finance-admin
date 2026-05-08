<script setup lang="ts">
defineOptions({
  name: "Welcome"
});

const portals = [
  { title: "数据中台", path: "/data-platform/collect", desc: "采集 · 治理 · 综合服务" },
  { title: "故障诊断", path: "/fault/model", desc: "模型 · 知识库 · 诊断 · 告警 · 预测" },
  { title: "综合监控", path: "/monitor/hardware", desc: "硬件 · 系统 · 服务性 · 用户 · 运维 · 端到端" },
  { title: "信号质量监测", path: "/signal/quality", desc: "质量 · 溢出 · 干扰 · 画像" }
];
</script>

<template>
  <div class="welcome">
    <h1 class="title">北斗短报文智能运维（前端演示）</h1>
    <p class="sub">以下为新增静态路由入口，数据均为 mock，列表分页 total 与本地数据集一致。</p>
    <div class="cards">
      <router-link v-for="p in portals" :key="p.path" :to="p.path" class="card">
        <span class="card-title">{{ p.title }}</span>
        <span class="card-desc">{{ p.desc }}</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  padding: 8px 4px;
}
.title {
  font-size: 20px;
  margin: 0 0 8px;
}
.sub {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0 0 20px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
.card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.card:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 2px 12px rgb(0 0 0 / 6%);
}
.card-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--el-color-primary);
}
.card-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
