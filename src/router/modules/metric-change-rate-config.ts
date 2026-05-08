const Layout = () => import("@/layout/index.vue");

export default {
  path: "/metric-change-rate-config",
  name: "MetricChangeRateConfig",
  component: Layout,
  redirect: "/metric-change-rate-config/main",
  meta: {
    icon: "ep:data-line",
    title: "基于指标变化率的统计检测",
    rank: 2
  },
  children: [
    {
      path: "/metric-change-rate-config/main",
      name: "MetricChangeRateConfigMain",
      component: () => import("@/views/metric-change-rate-config/index.vue"),
      meta: {
        title: "基于指标变化率的统计检测",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
