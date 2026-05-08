<template>
  <div class="metric-change-rate-config">
    <div class="config-card">
      <div class="config-title-wrap">
        <h1 class="config-title">基于指标变化率的统计检测配置</h1>
        <div class="config-title-line" />
      </div>

      <el-form
        ref="formRef"
        :model="form"
        label-width="120px"
        label-position="right"
        class="config-form"
      >
        <!-- 第一模块：指标选择 -->
        <div class="form-module">
          <el-form-item label="指标选择">
            <el-select
              v-model="form.metricId"
              placeholder="请选择目标指标，支持按指标/设备/业务系统筛选"
              filterable
              clearable
              class="form-select"
              @change="onMetricChange"
            >
              <el-option
                v-for="opt in filteredMetricOptions"
                :key="opt.id"
                :label="opt.label"
                :value="opt.id"
              >
                <span>{{ opt.metric }}</span>
                <span class="option-meta">{{ opt.device }} / {{ opt.business }}</span>
              </el-option>
            </el-select>
            <div class="filter-tabs">
              <span
                v-for="f in filterTabs"
                :key="f.key"
                :class="['filter-tab', { active: filterBy === f.key }]"
                @click="filterBy = f.key"
              >
                {{ f.label }}
              </span>
            </div>
          </el-form-item>
        </div>

        <el-divider class="module-divider" />

        <!-- 第二模块：当前指标信息 -->
        <div class="form-module">
          <el-form-item label="当前指标信息">
            <div :class="['info-card', { empty: !currentMetric }]">
              <span class="info-line">指标名称：{{ currentMetric ? currentMetric.metric : "--" }}</span>
              <span class="info-line">所属设备/业务系统：{{ currentMetric ? `${currentMetric.device} / ${currentMetric.business}` : "--" }}</span>
            </div>
          </el-form-item>
        </div>

        <el-divider class="module-divider" />

        <!-- 第三模块：指标波动性分级 -->
        <div class="form-module">
          <el-form-item label="指标波动性分级">
            <el-radio-group
              v-model="form.volatility"
              class="volatility-radios"
              @change="onVolatilityChange"
            >
              <el-radio label="high">高波动</el-radio>
              <el-radio label="mid">中波动</el-radio>
              <el-radio label="low">低波动</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <el-divider class="module-divider" />

        <!-- 第四模块：环比变化率阈值 -->
        <div class="form-module">
          <el-form-item label="环比变化率阈值">
            <div class="input-with-suffix">
              <el-input-number
                v-model="form.chainRatioThreshold"
                :min="1"
                :max="100"
                controls-position="right"
                class="form-input-number"
              />
              <span class="form-suffix">%</span>
            </div>
          </el-form-item>
        </div>

        <el-divider class="module-divider" />

        <!-- 第五模块：同比变化率阈值 -->
        <div class="form-module">
          <el-form-item label="同比变化率阈值">
            <div class="input-with-suffix">
              <el-input-number
                v-model="form.yoyThreshold"
                :min="1"
                :max="100"
                controls-position="right"
                class="form-input-number"
              />
              <span class="form-suffix">%</span>
            </div>
          </el-form-item>
        </div>

        <el-divider class="module-divider" />

        <!-- 第六模块：检测周期时长 -->
        <div class="form-module">
          <el-form-item label="检测周期时长">
            <el-select v-model="form.cycleMinutes" placeholder="请选择" class="form-select">
              <el-option label="5 分钟" :value="5" />
              <el-option label="10 分钟" :value="10" />
              <el-option label="30 分钟" :value="30" />
              <el-option label="1 小时" :value="60" />
            </el-select>
          </el-form-item>
        </div>

        <!-- 底部操作区 -->
        <div class="form-actions">
          <el-button type="primary" size="default" class="btn-submit" @click="handleSubmit">提交</el-button>
          <el-button size="default" class="btn-reset" @click="handleReset">重置</el-button>
          <el-button plain size="default" class="btn-cancel" @click="handleCancel">取消</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";

const formRef = ref();
const router = useRouter();

type Volatility = "high" | "mid" | "low";

const filterBy = ref<"metric" | "device" | "business">("metric");
const filterTabs = [
  { key: "metric" as const, label: "按指标" },
  { key: "device" as const, label: "按设备" },
  { key: "business" as const, label: "按业务系统" }
];

const metricOptions = [
  { id: "m1", metric: "丢包率", device: "接入网-A区", business: "传输" },
  { id: "m2", metric: "时延", device: "核心网-节点1", business: "传输" },
  { id: "m3", metric: "抖动", device: "接入网-B区", business: "接入" },
  { id: "m4", metric: "CPU 使用率", device: "核心网-节点1", business: "计算" }
];

const filteredMetricOptions = computed(() => {
  return metricOptions.map(o => ({ ...o, label: o.metric }));
});

const volatilityDefaults: Record<Volatility, number> = {
  high: 30,
  mid: 20,
  low: 10
};

const form = reactive({
  metricId: "" as string,
  volatility: "mid" as Volatility,
  chainRatioThreshold: 20,
  yoyThreshold: 20,
  cycleMinutes: 5
});

const currentMetric = computed(() => {
  if (!form.metricId) return null;
  return metricOptions.find(o => o.id === form.metricId) ?? null;
});

function onMetricChange() {}

function onVolatilityChange(v: Volatility) {
  const val = volatilityDefaults[v];
  form.chainRatioThreshold = val;
  form.yoyThreshold = val;
}

const initialForm = () => ({
  metricId: "" as string,
  volatility: "mid" as Volatility,
  chainRatioThreshold: 20,
  yoyThreshold: 20,
  cycleMinutes: 5
});

function handleSubmit() {}

function handleReset() {
  Object.assign(form, initialForm());
}

function handleCancel() {
  router.back();
}
</script>

<style scoped>
.metric-change-rate-config {
  min-height: 100%;
  padding: 28px 24px 40px;
  font-family: "Microsoft YaHei", "Source Han Sans SC", sans-serif;
  font-size: 14px;
  background: linear-gradient(
    160deg,
    var(--el-fill-color-lighter) 0%,
    var(--el-bg-color) 45%
  );
}

.config-card {
  max-width: 620px;
  margin: 0 auto;
  padding: 32px 36px 36px;
  background: var(--el-bg-color);
  border-radius: 16px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

.config-title-wrap {
  margin-bottom: 28px;
  text-align: center;
}

.config-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 12px 0;
  letter-spacing: 0.02em;
}

.config-title-line {
  width: 48px;
  height: 3px;
  margin: 0 auto;
  background: linear-gradient(
    90deg,
    var(--el-color-primary),
    var(--el-color-primary-light-3)
  );
  border-radius: 2px;
}

.config-form {
  font-size: 14px;
}

.form-module {
  padding: 14px 0;
}

:deep(.el-form-item) {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 120px;
  height: auto;
  min-height: 32px;
  text-align: right;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

:deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  margin-left: 40px;
  min-height: 32px;
}

.module-divider {
  margin: 14px 0;
  border: none;
  border-top: 1px solid var(--el-border-color-lighter);
  opacity: 0.8;
}

.form-select {
  width: 100%;
  max-width: 360px;
  border-radius: 8px;
}

.form-select :deep(.el-input__wrapper) {
  border-radius: 8px;
  background-color: var(--el-fill-color-lighter);
  box-shadow: 0 0 0 1px var(--el-border-color-lighter);
  transition:
    box-shadow 0.2s,
    background-color 0.2s;
}

.form-select :deep(.el-input__wrapper:hover),
.form-select :deep(.el-input.is-focus .el-input__wrapper) {
  background-color: var(--el-fill-color-blank);
  box-shadow: 0 0 0 1px var(--el-color-primary);
}

.input-with-suffix {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-input-number {
  width: 128px;
  border-radius: 8px;
}

.form-input-number :deep(.el-input__wrapper) {
  border-radius: 8px;
  background-color: var(--el-fill-color-lighter);
  box-shadow: 0 0 0 1px var(--el-border-color-lighter);
}

.form-suffix {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.filter-tabs {
  margin-top: 12px;
  display: flex;
  gap: 4px;
}

.filter-tab {
  padding: 4px 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition:
    color 0.2s,
    background-color 0.2s;
}

.filter-tab:hover {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.filter-tab.active {
  color: var(--el-color-primary);
  font-weight: 500;
  background-color: var(--el-color-primary-light-9);
}

.option-meta {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-left: 8px;
}

.info-card {
  width: 100%;
  max-width: 360px;
  padding: 14px 18px;
  background: var(--el-fill-color-lighter);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  font-size: 14px;
  color: var(--el-text-color-primary);
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s;
}

.info-card.empty {
  background: var(--el-fill-color-blank);
  color: var(--el-text-color-placeholder);
  border-style: dashed;
}

.info-line {
  display: block;
}

.info-line + .info-line {
  margin-top: 8px;
}

.volatility-radios :deep(.el-radio) {
  margin-right: 24px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.btn-submit {
  min-width: 88px;
  border-radius: 8px;
}

.btn-reset,
.btn-cancel {
  min-width: 88px;
  border-radius: 8px;
}
</style>
