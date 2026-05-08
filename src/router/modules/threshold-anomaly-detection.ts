const Layout = () => import("@/layout/index.vue");

export default {
  path: "/threshold-anomaly-detection",
  name: "ThresholdAnomalyDetection",
  component: Layout,
  redirect: "/threshold-anomaly-detection/main",
  meta: {
    icon: "ep:data-analysis",
    title: "动态阈值异常检测",
    rank: 2
  },
  children: [
    {
      path: "/threshold-anomaly-detection/main",
      name: "ThresholdAnomalyDetectionMain",
      component: () => import("@/views/threshold-anomaly-detection/index.vue"),
      meta: {
        title: "动态阈值异常检测",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
