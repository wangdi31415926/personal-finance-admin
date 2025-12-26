<template>
  <div class="alert-cache">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span>缓存监控</span>
          </template>
          <div class="cache-stats">
            <div class="stat-item">
              <span>当前生效屏蔽规则数:</span>
              <strong>15条</strong>
            </div>
            <div class="stat-item">
              <span>缓存告警总数:</span>
              <strong>1280条</strong>
            </div>
            <div class="stat-item">
              <span>缓存区使用率:</span>
              <strong
                :class="{ warning: cacheUsage > 80, danger: cacheUsage > 90 }"
                >{{ cacheUsage }}%</strong
              >
            </div>
          </div>
          <el-table
            :data="cacheRules"
            style="width: 100%; margin-top: 20px"
            max-height="400"
          >
            <el-table-column prop="id" label="规则ID" width="120" />
            <el-table-column prop="deviceGroup" label="设备组" />
            <el-table-column prop="level" label="告警级别" width="100" />
            <el-table-column prop="count" label="缓存数量" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span>触发配置</span>
          </template>
          <el-form label-width="150px">
            <el-form-item label="P0级触发延迟">
              <el-input-number v-model="triggerConfig.p0" :min="0" /> 秒
            </el-form-item>
            <el-form-item label="P1级触发延迟">
              <el-input-number v-model="triggerConfig.p1" :min="0" /> 秒
            </el-form-item>
            <el-form-item label="P2级触发延迟">
              <el-input-number v-model="triggerConfig.p2" :min="0" /> 分钟
            </el-form-item>
            <el-form-item label="P3级触发延迟">
              <el-input-number v-model="triggerConfig.p3" :min="0" /> 分钟
            </el-form-item>
            <el-form-item label="合并时间窗口">
              <el-input-number
                v-model="triggerConfig.mergeWindow"
                :min="1"
                :max="30"
              />
              分钟
            </el-form-item>
            <el-form-item label="合并相似度阈值">
              <el-input-number
                v-model="triggerConfig.similarity"
                :min="0"
                :max="100"
              />
              %
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveConfig"
                >保存配置</el-button
              >
              <el-button @click="handlePreview">预览触发效果</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span>追溯分析</span>
          </template>
          <el-input
            v-model="traceKeyword"
            placeholder="输入规则ID/设备IP/告警类型"
            style="margin-bottom: 15px"
          />
          <el-button type="primary" @click="handleTrace">检索</el-button>
          <div
            v-if="traceResults"
            class="trace-results"
            style="margin-top: 20px"
          >
            <div class="result-item">
              <strong>常见根因:</strong>
              <div>维护后配置未恢复 (60%)</div>
            </div>
            <div class="result-item">
              <strong>优化建议:</strong>
              <div>下次维护后添加'配置校验'步骤</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";

const cacheUsage = ref(65);
const traceKeyword = ref("");
const traceResults = ref(null);

const cacheRules = ref([
  {
    id: "R001",
    deviceGroup: "核心机房",
    level: "P2",
    count: 320,
    status: "存储中"
  },
  {
    id: "R002",
    deviceGroup: "边缘节点",
    level: "P3",
    count: 280,
    status: "待触发"
  },
  {
    id: "R003",
    deviceGroup: "分支机构",
    level: "P1",
    count: 150,
    status: "已触发"
  }
]);

const triggerConfig = reactive({
  p0: 0,
  p1: 30,
  p2: 5,
  p3: 10,
  mergeWindow: 5,
  similarity: 85
});

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    存储中: "primary",
    待触发: "warning",
    已触发: "success"
  };
  return map[status] || "info";
};

const handleSaveConfig = () => {
  ElMessage.success("配置已保存");
};

const handlePreview = () => {
  ElMessage.info("预览触发效果");
};

const handleTrace = () => {
  traceResults.value = {
    rootCause: "维护后配置未恢复",
    suggestion: "添加配置校验步骤"
  };
  ElMessage.success("检索完成");
};
</script>

<style scoped lang="scss">
.alert-cache {
  padding: 20px;

  .cache-stats {
    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      .warning {
        color: #e6a23c;
      }

      .danger {
        color: #f56c6c;
      }
    }
  }

  .trace-results {
    .result-item {
      margin-bottom: 15px;
      padding: 10px;
      background: #f5f7fa;
      border-radius: 4px;
    }
  }
}
</style>
