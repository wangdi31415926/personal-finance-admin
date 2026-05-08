const Layout = () => import("@/layout/index.vue");

export default {
  path: "/troubleshoot-plan",
  name: "TroubleshootPlan",
  component: Layout,
  redirect: "/troubleshoot-plan/main",
  meta: {
    icon: "ep:list",
    title: "优先级排障方案",
    rank: 2
  },
  children: [
    {
      path: "/troubleshoot-plan/main",
      name: "TroubleshootPlanMain",
      component: () => import("@/views/troubleshoot-plan/index.vue"),
      meta: {
        title: "排障方案生成",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
