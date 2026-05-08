<template>
  <div class="chart-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>图表与报告</span>
          <div class="header-actions">
            <el-button size="small">从模板创建</el-button>
            <el-button type="primary" size="small">生成报告</el-button>
            <el-button size="small">导出</el-button>
          </div>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="config-section">
            <div class="section-title">报告模板</div>
            <el-select v-model="selectedTemplate" placeholder="选择模板" size="small" style="width: 100%">
              <el-option label="核心交换机周度巡检" value="1" />
              <el-option label="端口流量与告警分析" value="2" />
            </el-select>
            <div class="section-title mt">图表类型</div>
            <el-checkbox-group v-model="chartTypes" class="chart-checkbox">
              <el-checkbox label="折线图（时序）" />
              <el-checkbox label="柱状图" />
              <el-checkbox label="饼图" />
              <el-checkbox label="仪表盘（KPI）" />
            </el-checkbox-group>
            <div class="section-title mt">包含章节</div>
            <el-checkbox-group v-model="sections" class="chart-checkbox">
              <el-checkbox label="概述" />
              <el-checkbox label="数据图表" />
              <el-checkbox label="AI 总结" />
            </el-checkbox-group>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="preview-section">
            <div class="preview-header">
              <span>报告预览</span>
              <el-button link type="primary" size="small">刷新预览</el-button>
            </div>
            <div class="preview-placeholder">
              <el-icon :size="64" color="#c0c4cc"><Document /></el-icon>
              <p>报告内容将在此处预览</p>
              <p class="hint">支持 PDF、Word、HTML、Markdown 输出</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="config-section">
            <div class="section-title">输出格式</div>
            <el-radio-group v-model="outputFormat" class="radio-group">
              <el-radio label="pdf">PDF</el-radio>
              <el-radio label="docx">Word</el-radio>
              <el-radio label="html">HTML</el-radio>
              <el-radio label="md">Markdown</el-radio>
            </el-radio-group>
            <div class="section-title mt">发布选项</div>
            <el-checkbox v-model="genLink">生成访问链接</el-checkbox>
            <el-checkbox v-model="allowDownload">允许下载</el-checkbox>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Document } from "@element-plus/icons-vue";

const selectedTemplate = ref("1");
const chartTypes = ref(["折线图（时序）", "仪表盘（KPI）"]);
const sections = ref(["概述", "数据图表", "AI 总结"]);
const outputFormat = ref("pdf");
const genLink = ref(true);
const allowDownload = ref(true);
</script>

<style scoped lang="scss">
.chart-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .config-section {
    .section-title {
      font-weight: 600;
      margin-bottom: 10px;
      font-size: 14px;
    }

    .mt {
      margin-top: 20px;
    }

    .chart-checkbox {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }

  .preview-section {
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-weight: 600;
      font-size: 14px;
    }
  }

  .preview-placeholder {
    border: 1px dashed #dcdfe6;
    border-radius: 8px;
    padding: 48px 24px;
    text-align: center;
    color: #909399;
    font-size: 13px;
    min-height: 320px;

    .hint {
      font-size: 12px;
      margin-top: 8px;
    }
  }
}
</style>
