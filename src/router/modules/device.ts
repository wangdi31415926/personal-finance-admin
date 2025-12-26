const Layout = () => import("@/layout/index.vue");

export default {
  path: "/device",
  name: "Device",
  component: Layout,
  redirect: "/device/connection",
  meta: {
    icon: "ep:monitor",
    title: "设备监控管理",
    rank: 1
  },
  children: [
    {
      path: "/device/connection",
      name: "DeviceConnection",
      component: () => import("@/views/device/index.vue"),
      meta: {
        title: "设备监控管理",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
