<template>
  <div class="script-management">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 话术模板配置 -->
      <el-tab-pane label="话术模板配置" name="template">
        <div class="template-management">
          <!-- 工具栏 -->
          <div class="toolbar">
            <el-button type="primary" @click="handleCreateTemplate">
              <el-icon><Plus /></el-icon>
              新建话术模板
            </el-button>
            <el-input
              v-model="templateSearchKeyword"
              placeholder="搜索话术模板"
              style="width: 300px; margin-left: 10px"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <!-- 话术模板列表 -->
          <el-table
            :data="filteredTemplateList"
            border
            stripe
            style="margin-top: 20px"
          >
            <el-table-column prop="name" label="话术名称" width="200" />
            <el-table-column prop="type" label="话术类型" width="150">
              <template #default="{ row }">
                <el-tag>{{ getTemplateTypeText(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="200" />
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column prop="updateTime" label="更新时间" width="180" />
            <el-table-column label="操作" width="250" fixed="right">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="handleEditTemplate(row)"
                >
                  编辑
                </el-button>
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="handlePreviewTemplate(row)"
                >
                  预览
                </el-button>
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="handleTestTemplate(row)"
                >
                  测试
                </el-button>
                <el-button
                  link
                  type="danger"
                  size="small"
                  @click="handleDeleteTemplate(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 流程配置 -->
      <el-tab-pane label="流程配置" name="flow">
        <div class="flow-management">
          <div class="flow-header">
            <el-select
              v-model="selectedScriptId"
              placeholder="选择话术模板"
              style="width: 300px"
            >
              <el-option
                v-for="script in scriptOptions"
                :key="script.id"
                :label="script.name"
                :value="script.id"
              />
            </el-select>
            <el-button
              type="primary"
              @click="handleCreateFlow"
              style="margin-left: 10px"
            >
              新建流程
            </el-button>
            <el-button @click="handleSaveFlow">保存流程</el-button>
            <el-button @click="handlePublishFlow">发布流程</el-button>
            <el-button @click="handleTestFlow">模拟测试</el-button>
          </div>

          <!-- 流程图画布 -->
          <div class="flow-canvas" v-if="selectedScriptId">
            <div class="canvas-container">
              <div class="node-library">
                <div class="library-title">节点库</div>
                <div class="node-list">
                  <div
                    v-for="nodeType in nodeTypes"
                    :key="nodeType.type"
                    class="node-item"
                    draggable="true"
                    @dragstart="handleDragStart($event, nodeType)"
                  >
                    <el-icon><component :is="nodeType.icon" /></el-icon>
                    <span>{{ nodeType.name }}</span>
                  </div>
                </div>
              </div>
              <div
                class="canvas"
                @drop="handleDrop"
                @dragover.prevent
                @click="handleCanvasClick"
              >
                <div
                  v-for="node in flowNodes"
                  :key="node.id"
                  class="flow-node"
                  :class="{ active: selectedNodeId === node.id }"
                  :style="{ left: node.x + 'px', top: node.y + 'px' }"
                  @click.stop="handleNodeClick(node)"
                >
                  <div class="node-header">{{ node.name }}</div>
                  <div class="node-content">{{ node.description }}</div>
                </div>
                <!-- 连线 -->
                <svg class="connections">
                  <line
                    v-for="connection in connections"
                    :key="connection.id"
                    :x1="connection.x1"
                    :y1="connection.y1"
                    :x2="connection.x2"
                    :y2="connection.y2"
                    stroke="#409eff"
                    stroke-width="2"
                    marker-end="url(#arrowhead)"
                  />
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3, 0 6" fill="#409eff" />
                    </marker>
                  </defs>
                </svg>
              </div>
              <div class="property-panel" v-if="selectedNodeId">
                <div class="panel-title">属性配置</div>
                <el-form :model="selectedNodeProperties" label-width="100px">
                  <el-form-item label="节点名称">
                    <el-input v-model="selectedNodeProperties.name" />
                  </el-form-item>
                  <el-form-item label="节点描述">
                    <el-input
                      v-model="selectedNodeProperties.description"
                      type="textarea"
                    />
                  </el-form-item>
                  <el-form-item
                    v-if="selectedNodeProperties.type === 'question'"
                    label="问题内容"
                  >
                    <el-input
                      v-model="selectedNodeProperties.question"
                      type="textarea"
                    />
                  </el-form-item>
                  <el-form-item
                    v-if="selectedNodeProperties.type === 'jump'"
                    label="跳转条件"
                  >
                    <el-input
                      v-model="selectedNodeProperties.condition"
                      type="textarea"
                    />
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>
          <el-empty v-else description="请先选择话术模板" />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 话术模板编辑弹窗 -->
    <el-dialog
      v-model="templateDialogVisible"
      :title="templateDialogMode === 'create' ? '新建话术模板' : '编辑话术模板'"
      width="900px"
    >
      <el-form :model="templateForm" label-width="120px">
        <el-form-item label="话术名称">
          <el-input v-model="templateForm.name" placeholder="请输入话术名称" />
        </el-form-item>
        <el-form-item label="话术类型">
          <el-select v-model="templateForm.type" placeholder="请选择话术类型">
            <el-option label="主动话术" value="active" />
            <el-option label="问题流程" value="question" />
            <el-option label="多轮对话" value="multi" />
            <el-option label="特殊流程" value="special" />
            <el-option label="流水表单" value="form" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="templateForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="话术内容">
          <el-input
            v-model="templateForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入话术内容，可使用变量如 ${alert_title}, ${device_ip}"
          />
        </el-form-item>
        <el-form-item label="TTS音色">
          <el-select v-model="templateForm.voice" placeholder="请选择音色">
            <el-option label="沉稳男声" value="male1" />
            <el-option label="清晰女声" value="female1" />
            <el-option label="温柔女声" value="female2" />
          </el-select>
        </el-form-item>
        <el-form-item label="语速">
          <el-slider
            v-model="templateForm.speed"
            :min="0.5"
            :max="2"
            :step="0.1"
          />
          <span style="margin-left: 10px">{{ templateForm.speed }}x</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveTemplate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Search,
  ChatDotRound,
  Connection,
  Refresh,
  Switch,
  Phone
} from "@element-plus/icons-vue";

interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  createTime: string;
  updateTime: string;
}

interface FlowNode {
  id: string;
  name: string;
  description: string;
  type: string;
  x: number;
  y: number;
}

const activeTab = ref("template");
const templateSearchKeyword = ref("");
const templateDialogVisible = ref(false);
const templateDialogMode = ref<"create" | "edit">("create");
const currentTemplateId = ref("");

const templateForm = reactive({
  name: "",
  type: "",
  description: "",
  content: "",
  voice: "female1",
  speed: 1.0
});

// 测试数据
const templateList = ref<Template[]>([
  {
    id: "1",
    name: "紧急故障通知话术",
    type: "active",
    description: "用于P0级别紧急故障的通知",
    createTime: "2024-01-10 10:00:00",
    updateTime: "2024-01-15 14:00:00"
  },
  {
    id: "2",
    name: "性能告警通知话术",
    type: "active",
    description: "用于性能类告警的通知",
    createTime: "2024-01-10 10:00:00",
    updateTime: "2024-01-15 14:00:00"
  },
  {
    id: "3",
    name: "故障确认流程",
    type: "question",
    description: "用于确认故障是否已修复",
    createTime: "2024-01-10 10:00:00",
    updateTime: "2024-01-15 14:00:00"
  },
  {
    id: "4",
    name: "多轮信息收集",
    type: "multi",
    description: "用于收集故障详细信息",
    createTime: "2024-01-10 10:00:00",
    updateTime: "2024-01-15 14:00:00"
  }
]);

const filteredTemplateList = computed(() => {
  if (!templateSearchKeyword.value) {
    return templateList.value;
  }
  const keyword = templateSearchKeyword.value.toLowerCase();
  return templateList.value.filter(
    template =>
      template.name.toLowerCase().includes(keyword) ||
      template.description.toLowerCase().includes(keyword)
  );
});

const getTemplateTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    active: "主动话术",
    question: "问题流程",
    multi: "多轮对话",
    special: "特殊流程",
    form: "流水表单"
  };
  return typeMap[type] || type;
};

const handleCreateTemplate = () => {
  templateDialogMode.value = "create";
  Object.assign(templateForm, {
    name: "",
    type: "",
    description: "",
    content: "",
    voice: "female1",
    speed: 1.0
  });
  templateDialogVisible.value = true;
};

const handleEditTemplate = (row: Template) => {
  templateDialogMode.value = "edit";
  currentTemplateId.value = row.id;
  Object.assign(templateForm, {
    name: row.name,
    type: row.type,
    description: row.description,
    content: "您好，这里是运维告警系统，检测到${alert_title}，需要您立即处理。",
    voice: "female1",
    speed: 1.0
  });
  templateDialogVisible.value = true;
};

const handleSaveTemplate = () => {
  ElMessage.success("保存成功");
  templateDialogVisible.value = false;
};

const handlePreviewTemplate = (row: Template) => {
  ElMessage.info(`预览话术: ${row.name}`);
};

const handleTestTemplate = (row: Template) => {
  ElMessage.info(`测试话术: ${row.name}`);
};

const handleDeleteTemplate = (row: Template) => {
  ElMessageBox.confirm("确定要删除此话术模板吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      const index = templateList.value.findIndex(t => t.id === row.id);
      if (index > -1) {
        templateList.value.splice(index, 1);
        ElMessage.success("删除成功");
      }
    })
    .catch(() => {});
};

// 流程配置相关
const selectedScriptId = ref("");
const scriptOptions = ref([
  { id: "1", name: "紧急故障通知话术" },
  { id: "2", name: "性能告警通知话术" }
]);

const nodeTypes = [
  { type: "normal", name: "普通节点", icon: ChatDotRound },
  { type: "question", name: "问题流程", icon: ChatDotRound },
  { type: "jump", name: "跳转节点", icon: Connection },
  { type: "recover", name: "挽回节点", icon: Refresh },
  { type: "hangup", name: "挂机节点", icon: Phone },
  { type: "keypress", name: "按键节点", icon: Switch }
];

const flowNodes = ref<FlowNode[]>([]);
const connections = ref<
  Array<{ id: string; x1: number; y1: number; x2: number; y2: number }>
>([]);
const selectedNodeId = ref("");
const selectedNodeProperties = reactive({
  id: "",
  name: "",
  description: "",
  type: "",
  question: "",
  condition: ""
});

const handleCreateFlow = () => {
  flowNodes.value = [];
  connections.value = [];
  selectedNodeId.value = "";
};

const handleDragStart = (event: DragEvent, nodeType: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData("nodeType", JSON.stringify(nodeType));
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  const data = event.dataTransfer?.getData("nodeType");
  if (!data) return;

  const nodeType = JSON.parse(data);
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const newNode: FlowNode = {
    id: `node-${Date.now()}`,
    name: nodeType.name,
    description: "点击配置节点属性",
    type: nodeType.type,
    x: x - 100,
    y: y - 50
  };

  flowNodes.value.push(newNode);
};

const handleCanvasClick = () => {
  selectedNodeId.value = "";
};

const handleNodeClick = (node: FlowNode) => {
  selectedNodeId.value = node.id;
  Object.assign(selectedNodeProperties, {
    id: node.id,
    name: node.name,
    description: node.description,
    type: node.type,
    question: "",
    condition: ""
  });
};

const handleSaveFlow = () => {
  ElMessage.success("流程保存成功");
};

const handlePublishFlow = () => {
  ElMessage.success("流程发布成功");
};

const handleTestFlow = () => {
  ElMessage.info("打开模拟测试界面");
};
</script>

<style scoped lang="scss">
.script-management {
  padding: 20px;
  height: 100%;

  .template-management {
    .toolbar {
      display: flex;
      align-items: center;
    }
  }

  .flow-management {
    .flow-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }

    .flow-canvas {
      height: calc(100vh - 300px);
      border: 1px solid #dcdfe6;
      border-radius: 4px;

      .canvas-container {
        display: flex;
        height: 100%;

        .node-library {
          width: 200px;
          border-right: 1px solid #dcdfe6;
          padding: 15px;
          background: #f5f7fa;

          .library-title {
            font-weight: 500;
            margin-bottom: 15px;
          }

          .node-list {
            .node-item {
              display: flex;
              align-items: center;
              padding: 10px;
              margin-bottom: 10px;
              background: white;
              border: 1px solid #dcdfe6;
              border-radius: 4px;
              cursor: move;

              .el-icon {
                margin-right: 8px;
              }

              &:hover {
                border-color: #409eff;
                color: #409eff;
              }
            }
          }
        }

        .canvas {
          flex: 1;
          position: relative;
          background: #fafafa;
          overflow: hidden;

          .flow-node {
            position: absolute;
            width: 200px;
            padding: 15px;
            background: white;
            border: 2px solid #dcdfe6;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

            &.active {
              border-color: #409eff;
              box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
            }

            .node-header {
              font-weight: 500;
              margin-bottom: 8px;
              color: #303133;
            }

            .node-content {
              font-size: 12px;
              color: #909399;
            }
          }

          .connections {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
          }
        }

        .property-panel {
          width: 300px;
          border-left: 1px solid #dcdfe6;
          padding: 15px;
          background: white;
          overflow-y: auto;

          .panel-title {
            font-weight: 500;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #dcdfe6;
          }
        }
      }
    }
  }
}
</style>
