const Layout = () => import("@/layout/index.vue");

export default {
  path: "/fault",
  name: "Fault",
  component: Layout,
  redirect: "/fault/model",
  meta: {
    icon: "ep:warning-filled",
    title: "故障诊断",
    rank: 12
  },
  children: [
    {
      path: "/fault/model",
      name: "FaultModel",
      component: () => import("@/views/fault/model/index.vue"),
      meta: { title: "系统故障模型", keepAlive: true }
    },
    {
      path: "/fault/knowledge",
      name: "FaultKnowledge",
      component: () => import("@/views/fault/knowledge/index.vue"),
      meta: { title: "知识库管理", keepAlive: true }
    },
    {
      path: "/fault/diagnose",
      name: "FaultDiagnose",
      component: () => import("@/views/fault/diagnose/index.vue"),
      meta: { title: "故障诊断分析", keepAlive: true }
    },
    {
      path: "/fault/alarm",
      name: "FaultAlarm",
      component: () => import("@/views/fault/alarm/index.vue"),
      meta: { title: "故障告警与处置", keepAlive: true }
    },
    {
      path: "/fault/predict",
      name: "FaultPredict",
      component: () => import("@/views/fault/predict/index.vue"),
      meta: { title: "故障预测分析", keepAlive: true }
    }
  ]
} satisfies RouteConfigsTable;
