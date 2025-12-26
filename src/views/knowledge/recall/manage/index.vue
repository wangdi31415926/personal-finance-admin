<template>
  <div class="recall-management">
    <el-row :gutter="20">
      <!-- 左侧：搜索条件配置 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>搜索条件配置</span>
          </template>

          <el-form :model="searchForm" label-width="120px">
            <el-form-item label="规则名称">
              <el-input
                v-model="searchForm.ruleName"
                placeholder="请输入规则名称以便后续复用"
              />
            </el-form-item>

            <el-divider content-position="left">基础条件</el-divider>

            <el-form-item label="知识类型">
              <el-select
                v-model="searchForm.types"
                multiple
                placeholder="请选择知识类型"
                style="width: 100%"
              >
                <el-option
                  v-for="type in typeOptions"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="关联场景">
              <el-select
                v-model="searchForm.scenes"
                multiple
                placeholder="请选择关联场景"
                style="width: 100%"
              >
                <el-option
                  v-for="scene in sceneOptions"
                  :key="scene.value"
                  :label="scene.label"
                  :value="scene.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="知识来源">
              <el-radio-group v-model="searchForm.source">
                <el-radio label="personal">个人库</el-radio>
                <el-radio label="shared">共享库</el-radio>
                <el-radio label="mixed">混合</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="创建时间">
              <el-date-picker
                v-model="searchForm.timeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
              />
            </el-form-item>

            <el-divider content-position="left">权重设置</el-divider>

            <el-form-item label="关联场景权重">
              <el-slider
                v-model="searchForm.sceneWeight"
                :min="1"
                :max="10"
                show-input
                :show-input-controls="false"
              />
            </el-form-item>

            <el-form-item label="知识类型权重">
              <el-slider
                v-model="searchForm.typeWeight"
                :min="1"
                :max="10"
                show-input
                :show-input-controls="false"
              />
            </el-form-item>

            <el-form-item label="快捷权重">
              <el-checkbox v-model="searchForm.prioritizeFavorite">
                优先召回收藏知识
              </el-checkbox>
              <el-checkbox v-model="searchForm.prioritizeRecent">
                优先召回最近编辑知识
              </el-checkbox>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handlePreview"
                >预览效果</el-button
              >
              <el-button @click="handleSaveRule">保存规则</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：效果预览 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>知识点列表</span>
            <el-button
              type="text"
              style="float: right"
              @click="handleOptimizeRule"
            >
              优化规则
            </el-button>
          </template>

          <div class="statistics">
            <div class="stat-item">
              <span class="stat-label">符合条件知识总数：</span>
              <span class="stat-value">{{ statistics.total }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">优质知识占比：</span>
              <span class="stat-value">{{ statistics.qualityRate }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">匹配度≥80分占比：</span>
              <span class="stat-value">{{ statistics.highMatchRate }}%</span>
            </div>
          </div>

          <div class="knowledge-list">
            <el-card
              v-for="item in knowledgeList"
              :key="item.id"
              class="knowledge-card"
              shadow="hover"
            >
              <div class="match-score" :class="getScoreClass(item.matchScore)">
                {{ item.matchScore }}分
              </div>
              <div class="card-content">
                <div class="card-header">
                  <span class="knowledge-name">{{ item.name }}</span>
                </div>
                <div class="match-info">匹配条件：{{ item.matchInfo }}</div>
                <div class="card-description">{{ item.description }}</div>
                <div class="card-footer">
                  <span>来源：{{ item.source }}</span>
                  <span>创建时间：{{ item.createTime }}</span>
                </div>
              </div>
              <div class="card-actions">
                <el-button link type="primary" @click="handleShield(item)">
                  屏蔽
                </el-button>
                <el-button
                  link
                  type="primary"
                  @click="handleAdjustWeight(item)"
                >
                  调整权重
                </el-button>
                <el-button link type="primary" @click="handleMarkQuality(item)">
                  标记优质
                </el-button>
              </div>
            </el-card>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";

const searchForm = reactive({
  ruleName: "",
  types: [],
  scenes: [],
  source: "mixed",
  timeRange: null,
  sceneWeight: 10,
  typeWeight: 8,
  prioritizeFavorite: false,
  prioritizeRecent: false
});

const typeOptions = [
  { label: "故障处理笔记", value: "fault" },
  { label: "命令手册", value: "command" },
  { label: "配置说明", value: "config" }
];

const sceneOptions = [
  { label: "设备", value: "device" },
  { label: "Linux系统", value: "linux" },
  { label: "核心网运维", value: "core" }
];

const statistics = reactive({
  total: 25,
  qualityRate: 68,
  highMatchRate: 52
});

// 测试数据
const knowledgeList = ref([
  {
    id: "1",
    name: "DNS解析失败故障处理",
    matchScore: 92,
    matchInfo: "匹配'设备'场景+'故障处理'类型",
    description: "详细介绍了DNS解析失败的排查步骤和处理方法",
    source: "共享库",
    createTime: "2025-11-20"
  },
  {
    id: "2",
    name: "Linux端口占用排查",
    matchScore: 85,
    matchInfo: "匹配'Linux系统'场景+'命令手册'类型",
    description: "使用netstat、lsof等命令进行端口占用排查",
    source: "个人库",
    createTime: "2025-11-18"
  },
  {
    id: "3",
    name: "路由器OSPF配置",
    matchScore: 78,
    matchInfo: "匹配'设备'场景+'配置说明'类型",
    description: "OSPF协议的详细配置步骤和参数说明",
    source: "共享库",
    createTime: "2025-11-15"
  }
]);

const getScoreClass = (score: number) => {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
};

const handlePreview = () => {
  ElMessage.info("预览效果");
};

const handleSaveRule = () => {
  if (!searchForm.ruleName) {
    ElMessage.warning("请输入规则名称");
    return;
  }
  ElMessage.success("规则已保存");
};

const handleReset = () => {
  Object.assign(searchForm, {
    ruleName: "",
    types: [],
    scenes: [],
    source: "mixed",
    timeRange: null,
    sceneWeight: 10,
    typeWeight: 8,
    prioritizeFavorite: false,
    prioritizeRecent: false
  });
};

const handleOptimizeRule = () => {
  ElMessage.info("跳转到规则优化页面");
};

const handleShield = (item: any) => {
  ElMessage.success(`已屏蔽 ${item.name}`);
};

const handleAdjustWeight = (item: any) => {
  ElMessage.info(`调整 ${item.name} 的权重`);
};

const handleMarkQuality = (item: any) => {
  ElMessage.success(`已将 ${item.name} 标记为优质知识`);
};
</script>

<style scoped lang="scss">
.recall-management {
  .statistics {
    display: flex;
    gap: 30px;
    margin-bottom: 20px;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 4px;

    .stat-item {
      .stat-label {
        font-size: 14px;
        color: #606266;
      }

      .stat-value {
        font-size: 18px;
        font-weight: bold;
        color: #409eff;
        margin-left: 5px;
      }
    }
  }

  .knowledge-list {
    .knowledge-card {
      margin-bottom: 15px;
      position: relative;

      .match-score {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 5px 10px;
        border-radius: 4px;
        font-weight: bold;

        &.high {
          background: #67c23a;
          color: white;
        }

        &.medium {
          background: #e6a23c;
          color: white;
        }

        &.low {
          background: #f56c6c;
          color: white;
        }
      }

      .card-content {
        margin-right: 80px;

        .card-header {
          margin-bottom: 10px;

          .knowledge-name {
            font-size: 16px;
            font-weight: bold;
          }
        }

        .match-info {
          font-size: 12px;
          color: #909399;
          margin-bottom: 10px;
        }

        .card-description {
          color: #606266;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .card-footer {
          font-size: 12px;
          color: #909399;
          display: flex;
          gap: 20px;
        }
      }

      .card-actions {
        margin-top: 10px;
        display: flex;
        gap: 10px;
      }
    }
  }
}
</style>
