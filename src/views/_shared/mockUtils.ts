/**
 * 通用前端 mock 工具：分页 / 延迟 / 时序数据 / 简易随机
 * 单模块 mock 数据上限 20 条；分页 total 与 mock 总数严格一致
 */

export interface PageQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function paginate<T>(
  source: T[],
  page = 1,
  pageSize = 10
): PageResult<T> {
  const total = source.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    list: source.slice(start, end),
    total,
    page,
    pageSize
  };
}

export function delayMock<T>(data: T, ms = 200): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), ms));
}

/** 基于 seed 的稳定伪随机，刷新页面数据保持一致 */
export function seedRandom(seed = 1): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** 生成时间序列点（用于 ECharts） */
/** 折线图 option（简单图，配合 MiniChart） */
export function simpleLineOption(
  title: string,
  ts: string[],
  values: number[],
  seriesName?: string
): Record<string, unknown> {
  return {
    title: { text: title, left: 0, textStyle: { fontSize: 13 } },
    tooltip: { trigger: "axis" },
    grid: { left: 48, right: 16, top: 40, bottom: 32 },
    xAxis: { type: "category", boundaryGap: false, data: ts },
    yAxis: { type: "value", splitLine: { lineStyle: { type: "dashed" } } },
    series: [
      {
        name: seriesName || title,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 4,
        data: values,
        areaStyle: { opacity: 0.08 }
      }
    ]
  };
}

/** 柱状图 */
export function simpleBarOption(
  title: string,
  categories: string[],
  values: number[]
): Record<string, unknown> {
  return {
    title: { text: title, left: 0, textStyle: { fontSize: 13 } },
    tooltip: { trigger: "axis" },
    grid: { left: 48, right: 16, top: 40, bottom: 40 },
    xAxis: { type: "category", data: categories },
    yAxis: { type: "value", splitLine: { lineStyle: { type: "dashed" } } },
    series: [{ type: "bar", data: values, barMaxWidth: 28 }]
  };
}

/** 饼图 */
export function simplePieOption(
  title: string,
  data: { name: string; value: number }[]
): Record<string, unknown> {
  return {
    title: { text: title, left: 0, textStyle: { fontSize: 13 } },
    tooltip: { trigger: "item" },
    legend: { bottom: 0, type: "scroll" },
    series: [
      {
        type: "pie",
        radius: ["42%", "68%"],
        avoidLabelOverlap: true,
        label: { formatter: "{b}\n{d}%" },
        data
      }
    ]
  };
}

export function genTimeSeries(
  points = 24,
  base = 50,
  amp = 20,
  seed = 7
): { ts: string[]; values: number[] } {
  const rand = seedRandom(seed);
  const ts: string[] = [];
  const values: number[] = [];
  const now = new Date();
  for (let i = points - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    ts.push(
      `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:00`
    );
    values.push(+(base + (rand() - 0.5) * 2 * amp).toFixed(2));
  }
  return { ts, values };
}

/** 简化日期格式化 */
export function fmtTime(d: Date | number | string = new Date()): string {
  const date = typeof d === "object" ? d : new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** 状态徽标主题映射 */
export const statusTagType: Record<
  string,
  "primary" | "success" | "warning" | "danger" | "info"
> = {
  正常: "success",
  运行中: "success",
  在线: "success",
  已闭环: "success",
  已完成: "success",
  通过: "success",
  启用: "success",
  健康: "success",
  异常: "danger",
  离线: "danger",
  失败: "danger",
  紧急: "danger",
  P0: "danger",
  超阈值: "danger",
  警告: "warning",
  待处置: "warning",
  处置中: "warning",
  暂停: "warning",
  P1: "warning",
  待复核: "warning",
  灰度: "warning",
  P2: "info",
  关闭: "info",
  待启用: "info",
  归档: "info",
  退役: "info",
  调试: "info"
};

export function tagTypeOf(
  status: string
): "primary" | "success" | "warning" | "danger" | "info" {
  return statusTagType[status] || "info";
}
