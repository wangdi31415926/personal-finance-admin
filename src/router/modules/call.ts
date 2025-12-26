const Layout = () => import("@/layout/index.vue");

export default {
  path: "/call",
  name: "Call",
  component: Layout,
  redirect: "/call/ai-task",
  meta: {
    icon: "ep:phone",
    title: "呼叫管理",
    rank: 2
  },
  children: [
    {
      path: "/call/ai-task",
      name: "CallAiTask",
      component: () => import("@/views/call/ai-task/index.vue"),
      meta: {
        title: "AI任务管理",
        keepAlive: true
      }
    },
    {
      path: "/call/ai-task/create",
      name: "CallAiTaskCreate",
      component: () => import("@/views/call/ai-task/create.vue"),
      meta: {
        title: "AI任务创建",
        activeMenu: "/call/ai-task",
        keepAlive: false
      }
    },
    {
      path: "/call/ai-task/edit/:id",
      name: "CallAiTaskEdit",
      component: () => import("@/views/call/ai-task/edit.vue"),
      meta: {
        title: "AI任务编辑",
        activeMenu: "/call/ai-task",
        keepAlive: false,
        showLink: false,
        hiddenTag: true
      }
    },
    {
      path: "/call/ai-task/detail/:id",
      name: "CallAiTaskDetail",
      component: () => import("@/views/call/ai-task/detail.vue"),
      meta: {
        title: "AI任务详情",
        activeMenu: "/call/ai-task",
        keepAlive: false,
        showLink: false,
        hiddenTag: true
      }
    },
    {
      path: "/call/script/template",
      name: "CallScriptTemplate",
      component: () => import("@/views/call/script/template.vue"),
      meta: {
        title: "话术模板配置",
        keepAlive: true
      }
    },
    {
      path: "/call/script/flow",
      name: "CallScriptFlow",
      component: () => import("@/views/call/script/flow.vue"),
      meta: {
        title: "流程配置",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
