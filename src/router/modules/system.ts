const Layout = () => import("@/layout/index.vue");

export default {
  path: "/system",
  name: "System",
  component: Layout,
  redirect: "/system/organization",
  meta: {
    icon: "ep:setting",
    title: "系统管理",
    rank: 1
  },
  children: [
    {
      path: "/system/organization",
      name: "SystemOrganization",
      component: () => import("@/views/system/organization/index.vue"),
      meta: {
        title: "组织管理",
        keepAlive: true
      }
    },
    {
      path: "/system/position",
      name: "SystemPosition",
      component: () => import("@/views/system/position/index.vue"),
      meta: {
        title: "岗位管理",
        keepAlive: true
      }
    },
    {
      path: "/system/user",
      name: "SystemUser",
      component: () => import("@/views/system/user/index.vue"),
      meta: {
        title: "用户管理",
        keepAlive: true
      }
    },
    {
      path: "/system/role",
      name: "SystemRole",
      component: () => import("@/views/system/role/index.vue"),
      meta: {
        title: "角色管理",
        keepAlive: true
      }
    },
    {
      path: "/system/resource",
      name: "SystemResource",
      component: () => import("@/views/system/resource/index.vue"),
      meta: {
        title: "资源管理",
        keepAlive: true
      }
    },
    {
      path: "/system/dictionary",
      name: "SystemDictionary",
      component: () => import("@/views/system/dictionary/index.vue"),
      meta: {
        title: "字典管理",
        keepAlive: true
      }
    },
    {
      path: "/system/theme",
      name: "SystemTheme",
      component: () => import("@/views/system/theme/index.vue"),
      meta: {
        title: "主题管理",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
