const Layout = () => import("@/layout/index.vue");

export default {
  path: "/anomaly-annotation",
  name: "AnomalyAnnotation",
  component: Layout,
  redirect: "/anomaly-annotation/main",
  meta: {
    icon: "ep:edit",
    title: "异常点智能标注",
    rank: 2
  },
  children: [
    {
      path: "/anomaly-annotation/main",
      name: "AnomalyAnnotationMain",
      component: () => import("@/views/anomaly-annotation/index.vue"),
      meta: {
        title: "异常点智能标注",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
