const Layout = () => import("@/layout/index.vue");

export default {
  path: "/datacenter",
  name: "DataCenter",
  component: Layout,
  redirect: "/datacenter/visualization",
  meta: {
    icon: "ep:server",
    title: "数字孪生机房",
    rank: 2
  },
  children: [
    {
      path: "/datacenter/visualization",
      name: "DataCenterVisualization",
      component: () => import("@/views/datacenter/index.vue"),
      meta: {
        title: "机房可视化",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;


