const Layout = () => import("@/layout/index.vue");

export default {
  path: "/knowledge-qa",
  name: "KnowledgeQA",
  component: Layout,
  redirect: "/knowledge-qa/chat",
  meta: {
    icon: "ep:chat-dot-round",
    title: "知识问答",
    rank: 3
  },
  children: [
    {
      path: "/knowledge-qa/chat",
      name: "KnowledgeQAChat",
      component: () => import("@/views/knowledge/qa/index.vue"),
      meta: {
        title: "知识问答",
        keepAlive: true
      }
    },
    {
      path: "/knowledge-qa/history",
      name: "KnowledgeQAHistory",
      component: () => import("@/views/knowledge/qa/history.vue"),
      meta: {
        title: "问答历史",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
