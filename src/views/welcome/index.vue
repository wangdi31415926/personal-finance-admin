<script setup lang="ts">
defineOptions({
  name: "Welcome"
});

/** 四大类及下属小类：小类均指向现有静态路由，features 为可落地的真实系统能力补充（演示说明） */
const portals: {
  title: string;
  path: string;
  summary: string;
  items: { name: string; path: string; features: string[] }[];
}[] = [
  {
    title: "数据中台",
    path: "/data-platform/collect",
    summary:
      "面向短报文全景运维的统一数据底座：采得到、管得住、查得快、能赋能算法与二次开发。",
    items: [
      {
        name: "运维数据采集与共享",
        path: "/data-platform/collect",
        features: [
          "「平台接口 + 采集代理」双通道：支持调用频率、超时、熔断、退避重试与补采任务队列",
          "多协议接入（HTTP/HTTPS、MQTT、SNMP、Syslog 等），原始日志、指标、链路追踪分流入库",
          "数据订阅、主题分发与跨分系统共享 API；接口血缘、调用审计与敏感字段脱敏策略",
          "对接营业受理、计费、客服、短报文业务等外部系统时的契约版本管理与兼容性校验"
        ]
      },
      {
        name: "数据综合治理",
        path: "/data-platform/governance",
        features: [
          "清洗规则编排（去噪、补空、单位换算）、质检评分卡与异常样本抽检导出",
          "主数据对齐、标准字段映射与码表治理；变更审批与影响范围分析",
          "冷热分层与时序/关系/检索引擎分类存储；数据保留周期与合规归档策略",
          "元数据目录、数据字典与血缘视图；质量大屏（完整性、及时性、一致性）"
        ]
      },
      {
        name: "数据综合服务",
        path: "/data-platform/service",
        features: [
          "统一查询与多维分析服务，复杂条件下钻与导出；检索 SLA 与限流配额按租户配置",
          "指标模型分层（原子 / 派生 / 复合）与仪表盘模板库，支持同比环比与异常标注",
          "特征仓库、算法任务编排与模型输入数据集快照管理",
          "对外 OpenAPI 网关：鉴权、流控、计量计费与开发者门户（示例/SDK）"
        ]
      }
    ]
  },
  {
    title: "故障诊断",
    path: "/fault/model",
    summary:
      "从「看得见告警」到「定位根因、预测风险、闭环处置」的一体化智能运维中枢。",
    items: [
      {
        name: "系统故障模型",
        path: "/fault/model",
        features: [
          "故障树、贝叶斯网络、规则引擎混合建模；组件—症状—根因概率输出与置信度解释",
          "与监控事件、变更记录、配置漂移联动，自动触发推理与相似案例推荐",
          "模型版本、灰度发布、回滚与健康度看板；离线评估集与线上反馈闭环优化"
        ]
      },
      {
        name: "知识库管理",
        path: "/fault/knowledge",
        features: [
          "预案、手册、案例结构化入库；全文检索、标签体系与权限分级",
          "与工单、告警双向关联；处置步骤模板化、合规留痕与到期复核提醒",
          "运维知识图谱（组件—故障现象—处置动作—变更）增量构建与图查询"
        ]
      },
      {
        name: "故障诊断分析",
        path: "/fault/diagnose",
        features: [
          "多源证据融合：时序关联、拓扑传播分析、分布式追踪与日志链路对齐",
          "根因假设排序与证据链自动生成；支持专家会诊批注与结论合并",
          "诊断报告一键导出（现象、影响面、建议动作、参考预案），便于复盘与审计"
        ]
      },
      {
        name: "故障告警与处置",
        path: "/fault/alarm",
        features: [
          "告警抑制、合并、关联升级与静默窗口；与值班表、在岗路由联动",
          "工单全生命周期：受理—分派—处置—验证—复盘；SLA 计时与超时升级",
          "Runbook/自动化脚本联动执行、参数审批、执行日志与一键回滚"
        ]
      },
      {
        name: "故障预测分析",
        path: "/fault/predict",
        features: [
          "关键部件退化曲线、RUL 剩余寿命与风险评分；融合机理模型与历史故障统计",
          "异常检测（基线偏移、周期性打破、多维孤立点）；阈值自适应与误报抑制",
          "预测结果驱动预防性维护工单、巡检计划与备件建议"
        ]
      }
    ]
  },
  {
    title: "综合监控",
    path: "/monitor/hardware",
    summary:
      "云—边—端—星一体化可观测：资源、业务、体验、容器与端到端质量共用一套指标体系与追责链路。",
    items: [
      {
        name: "硬件资源监控",
        path: "/monitor/hardware",
        features: [
          "服务器、存储、网络、地面站设备等 Telemetry；温度、电压、风扇、冗余电源状态",
          "资产台账、维保到期、位置机柜与健康评分；备件与维保工单关联",
          "机房动环（温湿度、烟感、门禁）与能耗统计，合规阈值与巡检点位绑定"
        ]
      },
      {
        name: "系统综合监控",
        path: "/monitor/system",
        features: [
          "主备站角色、同步延迟、复制一致性校验；脑裂检测与切换演练记录",
          "各微服务存活、接口 SLO、依赖拓扑与健康检查聚合视图",
          "自动化巡检策略（Cron/事件触发）、报告模板、异常自动转工单与值守大屏"
        ]
      },
      {
        name: "系统服务性监视",
        path: "/monitor/service",
        features: [
          "MO/MT 成功率、端到端时延、丢失率、重复率等电信级 KPI 实时大盘",
          "按卫星、波束、区域、用户类型的多维钻取；同比环比与 SLA 违约时段标注",
          "业务优先级与排队深度监控，拥塞预警与容量联动提示"
        ]
      },
      {
        name: "用户使用分析",
        path: "/monitor/user-analysis",
        features: [
          "行业 / 大众用户分群、活跃终端、业务量与时段分布；沉默用户与激增预警",
          "地理热力、波束占用与潜在热点区域识别；终端固件 / 版本分布",
          "异常终端聚类（频繁失败、异常漫游）、召回策略与客户通知清单导出"
        ]
      },
      {
        name: "容器与运维管理",
        path: "/monitor/ops",
        features: [
          "Kubernetes 集群节点、Pod、镜像、HPA、资源配额与事件流可视化",
          "发布流水线轨迹、配置漂移、金丝雀/蓝绿状态与回滚一键触发（对接权限）",
          "集中日志检索、链路追踪采样策略；故障时段日志包一键导出"
        ]
      },
      {
        name: "端到端质量",
        path: "/monitor/e2e",
        features: [
          "从终端入站到出站的全链路 TraceId 串联，分段耗时瀑布图",
          "信处、网关、信服等瓶颈识别；与拨测任务、基线版本对比",
          "质量评分趋势、版本对比报表与重大变更前后对照分析"
        ]
      }
    ]
  },
  {
    title: "信号质量监测",
    path: "/signal/quality",
    summary:
      "面向无线侧与终端侧的可视化质量运营：看得懂谱、找得到干扰、估得准容量与用户体验。",
    items: [
      {
        name: "信号质量分析",
        path: "/signal/quality",
        features: [
          "C/N0、误码率、锁定状态等多指标融合评分与趋势；质量劣化事件自动切片",
          "按卫星、波束、极化、频段对比；与气象、维护窗口、重大活动日历叠加回放",
          "质量—业务量联合视图，支撑割接前后对照与优化效果评估"
        ]
      },
      {
        name: "溢出与电平特征",
        path: "/signal/overflow",
        features: [
          "前端 ADC 溢出片段统计、AGC 调节轨迹与饱和时长占比",
          "接收电平分布直方图与自适应门限学习；与链路预算、终端发射功率对照",
          "异常电平与业务失败率关联分析，辅助射频与天线优化"
        ]
      },
      {
        name: "干扰信息分析",
        path: "/signal/interference",
        features: [
          "窄带 / 宽带干扰特征提取，频谱瀑布图与干扰时段标注",
          "干扰事件与周边波束、终端业务影响面评估；协调工单与黑白名单策略建议",
          "历史干扰库与相似事件检索，支撑频谱监管协同接口预留"
        ]
      },
      {
        name: "用户画像与载噪比",
        path: "/signal/profile",
        features: [
          "终端侧 C/N0 轨迹与上报频次、业务类型、地理位置联合画像",
          "弱信号用户清单、波束指配与补盲网络规划输入",
          "载噪比与业务成功率联合建模；远程诊断引导与终端参数核查清单"
        ]
      }
    ]
  }
];
</script>

<template>
  <div class="welcome">
    <h1 class="title">北斗短报文智能运维（前端演示）</h1>
    <p class="sub">
      以下为四大功能域及现有静态路由入口；各小类下列举的能力为真实生产系统常见模块（当前前端为 mock
      演示，便于对照后续迭代）。
    </p>
    <div class="portals">
      <section v-for="p in portals" :key="p.title" class="portal">
        <header class="portal-head">
          <router-link :to="p.path" class="portal-title-link">
            <span class="portal-title">{{ p.title }}</span>
            <span class="portal-enter">进入默认页 →</span>
          </router-link>
          <p class="portal-summary">{{ p.summary }}</p>
        </header>
        <div class="items">
          <article v-for="item in p.items" :key="item.path + item.name" class="item">
            <router-link :to="item.path" class="item-name">{{ item.name }}</router-link>
            <ul class="feature-list">
              <li v-for="(f, i) in item.features" :key="i">{{ f }}</li>
            </ul>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  padding: 8px 4px;
  max-width: 1100px;
}
.title {
  font-size: 20px;
  margin: 0 0 8px;
}
.sub {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0 0 20px;
  line-height: 1.55;
}
.portals {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.portal {
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  overflow: hidden;
}
.portal-head {
  padding: 14px 16px;
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-extra-light);
}
.portal-title-link {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  flex-wrap: wrap;
}
.portal-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--el-color-primary);
}
.portal-enter {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.portal-title-link:hover .portal-enter {
  color: var(--el-color-primary);
}
.portal-summary {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}
.items {
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.item {
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--el-border-color-extra-light);
}
.item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}
.item-name {
  display: inline-block;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  color: var(--el-color-primary);
  text-decoration: none;
}
.item-name:hover {
  text-decoration: underline;
}
.feature-list {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.55;
}
.feature-list li {
  margin-bottom: 4px;
}
.feature-list li:last-child {
  margin-bottom: 0;
}
</style>
