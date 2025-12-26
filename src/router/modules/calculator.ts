const Layout = () => import("@/layout/index.vue");

export default {
  path: "/calculator",
  name: "Calculator",
  component: Layout,
  redirect: "/calculator/index",
  meta: {
    icon: "ep/calculator",
    title: "计算器",
    rank: 10
  },
  children: [
    {
      path: "/calculator/index",
      name: "CalculatorIndex",
      component: () => import("@/views/calculator/index.vue"),
      meta: {
        title: "简易计算器",
        showLink: true
      }
    }
  ]
} satisfies RouteConfigsTable;
