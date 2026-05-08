const Layout = () => import("@/layout/index.vue");

export default {
  path: "/report",
  name: "Report",
  component: Layout,
  redirect: "/report/semantic",
  meta: {
    icon: "ep:notebook",
    title: "智能报告",
    rank: 2
  },
  children: [
    {
      path: "/report/semantic",
      name: "ReportSemantic",
      component: () => import("@/views/report/semantic/index.vue"),
      meta: { title: "语义解析配置", keepAlive: true }
    },
    {
      path: "/report/flow",
      name: "ReportFlow",
      component: () => import("@/views/report/flow/index.vue"),
      meta: { title: "流程编排", keepAlive: true }
    },
    {
      path: "/report/dialogue",
      name: "ReportDialogue",
      component: () => import("@/views/report/dialogue/index.vue"),
      meta: { title: "对话管理", keepAlive: true }
    },
    {
      path: "/report/template",
      name: "ReportTemplate",
      component: () => import("@/views/report/template/index.vue"),
      meta: { title: "报告模板", keepAlive: true }
    },
    {
      path: "/report/interface",
      name: "ReportInterface",
      component: () => import("@/views/report/interface/index.vue"),
      meta: { title: "接口管理", keepAlive: true }
    },
    {
      path: "/report/data",
      name: "ReportData",
      component: () => import("@/views/report/data/index.vue"),
      meta: { title: "数据源与任务", keepAlive: true }
    },
    {
      path: "/report/chart",
      name: "ReportChart",
      component: () => import("@/views/report/chart/index.vue"),
      meta: { title: "图表与报告", keepAlive: true }
    },
    {
      path: "/report/ai-summary",
      name: "ReportAiSummary",
      component: () => import("@/views/report/ai-summary/index.vue"),
      meta: { title: "AI 总结配置", keepAlive: true }
    },
    {
      path: "/report/profile",
      name: "ReportProfile",
      component: () => import("@/views/report/profile/index.vue"),
      meta: { title: "用户画像与反馈", keepAlive: true }
    },
    {
      path: "/report/permission",
      name: "ReportPermission",
      component: () => import("@/views/report/permission/index.vue"),
      meta: { title: "权限与角色", keepAlive: true }
    }
  ]
} satisfies RouteConfigsTable;
