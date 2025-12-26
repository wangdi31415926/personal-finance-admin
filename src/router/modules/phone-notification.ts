const Layout = () => import("@/layout/index.vue");

export default {
  path: "/phone-notification",
  name: "PhoneNotification",
  component: Layout,
  redirect: "/phone-notification/call-management",
  meta: {
    icon: "ep:phone-filled",
    title: "电话通知",
    rank: 2
  },
  children: [
    {
      path: "/phone-notification/call-management",
      name: "PhoneNotificationCallManagement",
      component: () =>
        import("@/views/phone-notification/call-management/index.vue"),
      meta: {
        title: "呼叫管理",
        keepAlive: true
      }
    },
    {
      path: "/phone-notification/script-management",
      name: "PhoneNotificationScriptManagement",
      component: () =>
        import("@/views/phone-notification/script-management/index.vue"),
      meta: {
        title: "话术管理",
        keepAlive: true
      }
    },
    {
      path: "/phone-notification/data-analysis",
      name: "PhoneNotificationDataAnalysis",
      component: () =>
        import("@/views/phone-notification/data-analysis/index.vue"),
      meta: {
        title: "数据分析",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
