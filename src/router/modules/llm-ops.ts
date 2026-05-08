const Layout = () => import("@/layout/index.vue");

export default {
  path: "/llm-ops",
  name: "LlmOps",
  component: Layout,
  redirect: "/llm-ops/main",
  meta: {
    icon: "ep:chat-dot-round",
    title: "大模型交互框架",
    rank: 2
  },
  children: [
    {
      path: "/llm-ops/main",
      name: "LlmOpsMain",
      component: () => import("@/views/llm-ops/index.vue"),
      meta: {
        title: "大模型交互",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
