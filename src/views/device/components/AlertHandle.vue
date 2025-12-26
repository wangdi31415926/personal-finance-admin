<template>
  <div class="alert-handle">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <el-button-group>
            <el-button
              :type="mode === 'auto' ? 'primary' : ''"
              @click="mode = 'auto'"
              >一级自动修复</el-button
            >
            <el-button
              :type="mode === 'assist' ? 'primary' : ''"
              @click="mode = 'assist'"
              >二级智能辅助手动</el-button
            >
            <el-button
              :type="mode === 'cooperate' ? 'primary' : ''"
              @click="mode = 'cooperate'"
              >三级跨团队协同</el-button
            >
          </el-button-group>
        </div>
      </template>

      <div class="alert-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="告警ID">A001</el-descriptions-item>
          <el-descriptions-item label="设备IP"
            >192.168.1.1</el-descriptions-item
          >
          <el-descriptions-item label="告警类型">丢包异常</el-descriptions-item>
          <el-descriptions-item label="告警级别">
            <el-tag type="warning">P1级</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="产生时间"
            >2025-11-25 11:00:00</el-descriptions-item
          >
          <el-descriptions-item label="置信度">95%</el-descriptions-item>
        </el-descriptions>
      </div>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>处置步骤</span>
            </template>
            <el-steps :active="currentStep" direction="vertical">
              <el-step title="排查" description="预计耗时10分钟">
                <template #description>
                  <div>预计耗时10分钟</div>
                  <div class="step-content">
                    <div class="device-params">
                      <strong>设备实时参数:</strong>
                      <div>CPU利用率: 60%</div>
                      <div>内存使用率: 55%</div>
                      <div style="color: #f56c6c">丢包率: 12% (超标)</div>
                    </div>
                    <div class="step-actions" style="margin-top: 15px">
                      <el-button size="small">远程登录设备</el-button>
                      <el-button size="small">日志查询</el-button>
                      <el-button size="small">拓扑定位</el-button>
                    </div>
                  </div>
                </template>
              </el-step>
              <el-step title="处置" description="选择处置模板">
                <template #description>
                  <div>选择处置模板</div>
                  <div class="step-content">
                    <el-select
                      v-model="handleTemplate"
                      placeholder="选择模板"
                      style="width: 100%; margin-top: 10px"
                    >
                      <el-option label="丢包异常处置模板" value="packet-loss" />
                    </el-select>
                    <el-input
                      v-model="handleNote"
                      type="textarea"
                      :rows="3"
                      placeholder="输入处置操作"
                      style="margin-top: 10px"
                    />
                  </div>
                </template>
              </el-step>
              <el-step title="验证" description="验证处置结果">
                <template #description>
                  <div>验证处置结果</div>
                  <div class="step-content">
                    <el-checkbox-group
                      v-model="verifyItems"
                      style="margin-top: 10px"
                    >
                      <el-checkbox label="丢包率≤5%">丢包率≤5%</el-checkbox>
                      <el-checkbox label="带宽利用率≤80%"
                        >带宽利用率≤80%</el-checkbox
                      >
                      <el-checkbox label="端口状态up">端口状态up</el-checkbox>
                    </el-checkbox-group>
                  </div>
                </template>
              </el-step>
            </el-steps>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>智能辅助</span>
            </template>
            <div class="rag-solutions">
              <div class="solution-title">相似案例TOP3</div>
              <div class="solution-item">
                <div class="solution-header">
                  <strong>华为路由器丢包异常处置 (CASE-20251001)</strong>
                  <el-tag type="success" size="small">成功概率92%</el-tag>
                </div>
                <div class="solution-steps">
                  <div>1. 查看带宽</div>
                  <div>2. 检查端口VLAN配置</div>
                  <div>3. 重启端口</div>
                </div>
                <el-button type="text" size="small">查看完整案例</el-button>
              </div>
            </div>

            <el-divider />

            <div class="related-data">
              <div class="data-title">关联数据</div>
              <div class="log-item">
                <div class="log-time">2025-11-25 10:58</div>
                <div class="log-content">Error: 端口1带宽利用率95%</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card shadow="never" style="margin-top: 20px">
        <template #header>
          <span>处置记录</span>
        </template>
        <div class="handle-records">
          <div
            v-for="(record, index) in records"
            :key="index"
            class="record-item"
          >
            <div class="record-time">{{ record.time }}</div>
            <div class="record-content">{{ record.content }}</div>
            <div class="record-hash">存证哈希: {{ record.hash }}</div>
          </div>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";

const mode = ref("assist");
const currentStep = ref(0);
const handleTemplate = ref("");
const handleNote = ref("");
const verifyItems = ref([]);

const records = ref([
  {
    time: "2025-11-25 11:00:00",
    content: "告警产生，进入二级处置",
    hash: "0x8a7f...3d2c"
  },
  {
    time: "2025-11-25 11:05:00",
    content: "运维人员开始排查，查看设备带宽",
    hash: "0x9b8e...4e3d"
  },
  {
    time: "2025-11-25 11:08:00",
    content: "系统推荐RAG案例CASE-20251001",
    hash: "0xac9f...5f4e"
  }
]);
</script>

<style scoped lang="scss">
.alert-handle {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .alert-info {
    margin-bottom: 20px;
  }

  .step-content {
    margin-top: 10px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;

    .device-params {
      margin-bottom: 10px;
    }
  }

  .rag-solutions {
    .solution-title {
      font-weight: bold;
      margin-bottom: 15px;
    }

    .solution-item {
      padding: 15px;
      background: #f5f7fa;
      border-radius: 4px;
      margin-bottom: 15px;

      .solution-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }

      .solution-steps {
        margin-bottom: 10px;
        color: #606266;
      }
    }
  }

  .related-data {
    .data-title {
      font-weight: bold;
      margin-bottom: 15px;
    }

    .log-item {
      padding: 10px;
      background: #f5f7fa;
      border-radius: 4px;
      margin-bottom: 10px;

      .log-time {
        font-size: 12px;
        color: #909399;
        margin-bottom: 5px;
      }

      .log-content {
        color: #606266;
      }
    }
  }

  .handle-records {
    .record-item {
      padding: 15px;
      background: #f5f7fa;
      border-radius: 4px;
      margin-bottom: 15px;

      .record-time {
        font-weight: bold;
        margin-bottom: 5px;
      }

      .record-content {
        margin-bottom: 5px;
        color: #606266;
      }

      .record-hash {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
