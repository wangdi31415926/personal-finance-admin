const Layout = () => import("@/layout/index.vue");

export default {
  path: "/knowledge-base",
  name: "KnowledgeBase",
  component: Layout,
  redirect: "/knowledge-base/shared/list",
  meta: {
    icon: "ep:document",
    title: "知识库问答",
    rank: 1
  },
  children: [
    // 共享知识库
    {
      path: "/knowledge-base/shared/create",
      name: "KnowledgeBaseSharedCreate",
      component: () => import("@/views/knowledge/shared/create/index.vue"),
      meta: {
        title: "新建知识库",
        keepAlive: true
      }
    },
    {
      path: "/knowledge-base/shared/search",
      name: "KnowledgeBaseSharedSearch",
      component: () => import("@/views/knowledge/shared/search/index.vue"),
      meta: {
        title: "知识库搜索",
        keepAlive: true
      }
    },
    {
      path: "/knowledge-base/shared/list",
      name: "KnowledgeBaseSharedList",
      component: () => import("@/views/knowledge/shared/list/index.vue"),
      meta: {
        title: "知识库列表",
        keepAlive: true
      }
    },
    // 个人知识库
    {
      path: "/knowledge-base/personal/create",
      name: "KnowledgeBasePersonalCreate",
      component: () => import("@/views/knowledge/personal/create/index.vue"),
      meta: {
        title: "新建个人知识库",
        keepAlive: true
      }
    },
    {
      path: "/knowledge-base/personal/search",
      name: "KnowledgeBasePersonalSearch",
      component: () => import("@/views/knowledge/personal/search/index.vue"),
      meta: {
        title: "个人知识库搜索",
        keepAlive: true
      }
    },
    {
      path: "/knowledge-base/personal/list",
      name: "KnowledgeBasePersonalList",
      component: () => import("@/views/knowledge/personal/list/index.vue"),
      meta: {
        title: "个人知识库列表",
        keepAlive: true
      }
    },
    // 我的收藏
    {
      path: "/knowledge-base/favorite",
      name: "KnowledgeBaseFavorite",
      component: () => import("@/views/knowledge/favorite/index.vue"),
      meta: {
        title: "我的收藏",
        keepAlive: true
      }
    },
    // 标签管理
    {
      path: "/knowledge-base/tag",
      name: "KnowledgeBaseTag",
      component: () => import("@/views/knowledge/tag/index.vue"),
      meta: {
        title: "标签管理",
        keepAlive: true
      }
    },
    // 召回管理
    {
      path: "/knowledge-base/recall/manage",
      name: "KnowledgeBaseRecallManage",
      component: () => import("@/views/knowledge/recall/manage/index.vue"),
      meta: {
        title: "召回管理",
        keepAlive: true
      }
    },
    {
      path: "/knowledge-base/recall/test",
      name: "KnowledgeBaseRecallTest",
      component: () => import("@/views/knowledge/recall/test/index.vue"),
      meta: {
        title: "召回测试",
        keepAlive: true
      }
    },
    // 模板管理
    {
      path: "/knowledge-base/template",
      name: "KnowledgeBaseTemplate",
      component: () => import("@/views/knowledge/template/index.vue"),
      meta: {
        title: "模板管理",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
