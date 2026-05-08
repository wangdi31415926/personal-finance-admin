const Layout = () => import("@/layout/index.vue");

export default {
  path: "/data-platform",
  name: "DataPlatform",
  component: Layout,
  redirect: "/data-platform/collect",
  meta: {
    icon: "ep:folder-opened",
    title: "数据中台",
    rank: 11
  },
  children: [
    {
      path: "/data-platform/collect",
      name: "DpCollect",
      component: () => import("@/views/data-platform/collect/index.vue"),
      meta: { title: "运维数据采集与共享", keepAlive: true }
    },
    {
      path: "/data-platform/governance",
      name: "DpGovernance",
      component: () => import("@/views/data-platform/governance/index.vue"),
      meta: { title: "数据综合治理", keepAlive: true }
    },
    {
      path: "/data-platform/service",
      name: "DpService",
      component: () => import("@/views/data-platform/service/index.vue"),
      meta: { title: "数据综合服务", keepAlive: true }
    }
  ]
} satisfies RouteConfigsTable;
