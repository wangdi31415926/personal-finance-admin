const Layout = () => import("@/layout/index.vue");

export default {
  path: "/rag-fault-kb",
  name: "RagFaultKb",
  component: Layout,
  redirect: "/rag-fault-kb/main",
  meta: {
    icon: "ep:collection",
    title: "RAG故障知识库",
    rank: 2
  },
  children: [
    {
      path: "/rag-fault-kb/main",
      name: "RagFaultKbMain",
      component: () => import("@/views/rag-fault-kb/index.vue"),
      meta: {
        title: "RAG增强故障知识库",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
