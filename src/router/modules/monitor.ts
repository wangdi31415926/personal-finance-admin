const Layout = () => import("@/layout/index.vue");

export default {
  path: "/monitor",
  name: "Monitor",
  component: Layout,
  redirect: "/monitor/hardware",
  meta: {
    icon: "ep:monitor",
    title: "综合监控",
    rank: 13
  },
  children: [
    {
      path: "/monitor/hardware",
      name: "MonHardware",
      component: () => import("@/views/monitor/hardware/index.vue"),
      meta: { title: "硬件资源监控", keepAlive: true }
    },
    {
      path: "/monitor/system",
      name: "MonSystem",
      component: () => import("@/views/monitor/system/index.vue"),
      meta: { title: "系统综合监控", keepAlive: true }
    },
    {
      path: "/monitor/service",
      name: "MonService",
      component: () => import("@/views/monitor/service/index.vue"),
      meta: { title: "系统服务性监视", keepAlive: true }
    },
    {
      path: "/monitor/user-analysis",
      name: "MonUserAnalysis",
      component: () => import("@/views/monitor/user-analysis/index.vue"),
      meta: { title: "用户使用分析", keepAlive: true }
    },
    {
      path: "/monitor/ops",
      name: "MonOps",
      component: () => import("@/views/monitor/ops/index.vue"),
      meta: { title: "容器与运维管理", keepAlive: true }
    },
    {
      path: "/monitor/e2e",
      name: "MonE2e",
      component: () => import("@/views/monitor/e2e/index.vue"),
      meta: { title: "端到端质量", keepAlive: true }
    }
  ]
} satisfies RouteConfigsTable;
