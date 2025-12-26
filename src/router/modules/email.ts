const Layout = () => import("@/layout/index.vue");

export default {
  path: "/email",
  name: "Email",
  component: Layout,
  redirect: "/email/server",
  meta: {
    icon: "ep:message",
    title: "邮件管理",
    rank: 2
  },
  children: [
    {
      path: "/email/server",
      name: "EmailServer",
      component: () => import("@/views/email/index.vue"),
      meta: {
        title: "邮件服务器配置",
        keepAlive: true
      }
    },
    {
      path: "/email/notification",
      name: "EmailNotification",
      component: () => import("@/views/email-notification/index.vue"),
      meta: {
        title: "邮件通知",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
