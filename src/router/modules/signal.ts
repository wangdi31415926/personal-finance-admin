const Layout = () => import("@/layout/index.vue");

export default {
  path: "/signal",
  name: "Signal",
  component: Layout,
  redirect: "/signal/quality",
  meta: {
    icon: "ep:connection",
    title: "信号质量监测",
    rank: 14
  },
  children: [
    {
      path: "/signal/quality",
      name: "SigQuality",
      component: () => import("@/views/signal/quality.vue"),
      meta: { title: "信号质量分析", keepAlive: true }
    },
    {
      path: "/signal/overflow",
      name: "SigOverflow",
      component: () => import("@/views/signal/overflow.vue"),
      meta: { title: "溢出与电平特征", keepAlive: true }
    },
    {
      path: "/signal/interference",
      name: "SigInterference",
      component: () => import("@/views/signal/interference.vue"),
      meta: { title: "干扰信息分析", keepAlive: true }
    },
    {
      path: "/signal/profile",
      name: "SigProfile",
      component: () => import("@/views/signal/profile.vue"),
      meta: { title: "用户画像与载噪比", keepAlive: true }
    }
  ]
} satisfies RouteConfigsTable;
