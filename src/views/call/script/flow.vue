<template>
  <div class="script-flow">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">流程配置</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleSave">
              <el-icon><Check /></el-icon>
              保存
            </el-button>
            <el-button @click="handlePublish">
              <el-icon><Promotion /></el-icon>
              发布
            </el-button>
            <el-button @click="handleTest">
              <el-icon><VideoPlay /></el-icon>
              模拟测试
            </el-button>
          </div>
        </div>
      </template>

      <div class="flow-container">
        <!-- 左侧节点库 -->
        <div class="node-library">
          <div class="library-title">节点库</div>
          <div class="node-list">
            <div
              v-for="node in nodeTypes"
              :key="node.type"
              class="node-item"
              draggable="true"
              @dragstart="handleDragStart($event, node)"
            >
              <el-icon :class="node.icon">
                <component :is="node.iconComponent" />
              </el-icon>
              <span>{{ node.label }}</span>
            </div>
          </div>
        </div>

        <!-- 中间画布区 -->
        <div
          class="flow-canvas"
          ref="canvasRef"
          @drop="handleDrop"
          @dragover.prevent
        >
          <div v-if="flowNodes.length === 0" class="empty-canvas">
            <el-empty description="从左侧拖拽节点到此处开始构建流程" />
          </div>
          <div
            v-for="node in flowNodes"
            :key="node.id"
            class="flow-node"
            :style="{ left: node.x + 'px', top: node.y + 'px' }"
            @click="handleNodeClick(node)"
            :class="{ active: selectedNode?.id === node.id }"
          >
            <div class="node-header">
              <el-icon>
                <component :is="getNodeIcon(node.type)" />
              </el-icon>
              <span class="node-title">{{ getNodeLabel(node.type) }}</span>
              <el-button
                link
                type="danger"
                size="small"
                class="node-delete"
                @click.stop="handleDeleteNode(node.id)"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <div class="node-content">
              {{ node.name || "未命名节点" }}
            </div>
            <!-- 连接点 -->
            <div
              class="node-connector output"
              @mousedown="handleConnectorMouseDown($event, node, 'output')"
            ></div>
            <div
              class="node-connector input"
              @mousedown="handleConnectorMouseDown($event, node, 'input')"
            ></div>
          </div>

          <!-- 连线 -->
          <svg class="flow-lines" v-if="connections.length > 0">
            <path
              v-for="(conn, index) in connections"
              :key="index"
              :d="getConnectionPath(conn)"
              class="connection-line"
              stroke="#409eff"
              stroke-width="2"
              fill="none"
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

        <!-- 右侧属性面板 -->
        <div class="property-panel">
          <div class="panel-title">属性配置</div>
          <div v-if="!selectedNode" class="panel-empty">
            <el-empty description="请选择一个节点进行配置" :image-size="100" />
          </div>
          <div v-else class="panel-content">
            <el-form :model="nodeForm" label-width="100px" size="small">
              <el-form-item label="节点名称">
                <el-input
                  v-model="nodeForm.name"
                  placeholder="请输入节点名称"
                />
              </el-form-item>

              <!-- 普通节点配置 -->
              <template v-if="selectedNode.type === 'normal'">
                <el-form-item label="播报内容">
                  <el-input
                    v-model="nodeForm.content"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入播报的语音内容"
                  />
                </el-form-item>
                <el-form-item label="音色">
                  <el-select v-model="nodeForm.voice" placeholder="选择音色">
                    <el-option label="沉稳男声" value="male1" />
                    <el-option label="清晰女声" value="female1" />
                  </el-select>
                </el-form-item>
                <el-form-item label="语速">
                  <el-slider
                    v-model="nodeForm.speed"
                    :min="0.5"
                    :max="2"
                    :step="0.1"
                    show-input
                  />
                </el-form-item>
                <el-form-item label="允许打断">
                  <el-switch v-model="nodeForm.allowInterrupt" />
                </el-form-item>
              </template>

              <!-- 跳转节点配置 -->
              <template v-if="selectedNode.type === 'jump'">
                <el-form-item label="条件判断">
                  <div
                    v-for="(condition, index) in nodeForm.conditions"
                    :key="index"
                    class="condition-item"
                  >
                    <el-input
                      v-model="condition.keyword"
                      placeholder="关键词"
                      style="width: 150px; margin-right: 10px"
                    />
                    <el-select
                      v-model="condition.matchType"
                      placeholder="匹配规则"
                      style="width: 120px; margin-right: 10px"
                    >
                      <el-option label="包含" value="contains" />
                      <el-option label="精确" value="exact" />
                    </el-select>
                    <el-input
                      v-model="condition.targetNode"
                      placeholder="目标节点ID"
                      style="width: 120px; margin-right: 10px"
                    />
                    <el-button
                      link
                      type="danger"
                      size="small"
                      @click="handleRemoveCondition(index)"
                    >
                      删除
                    </el-button>
                  </div>
                  <el-button
                    type="primary"
                    link
                    size="small"
                    @click="handleAddCondition"
                    style="margin-top: 10px"
                  >
                    <el-icon><Plus /></el-icon>
                    添加条件
                  </el-button>
                </el-form-item>
              </template>

              <!-- 挽回节点配置 -->
              <template v-if="selectedNode.type === 'recovery'">
                <el-form-item label="挽回提示语">
                  <el-input
                    v-model="nodeForm.prompt"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入挽回提示语"
                  />
                </el-form-item>
                <el-form-item label="最大重试次数">
                  <el-input-number
                    v-model="nodeForm.maxRetry"
                    :min="1"
                    :max="5"
                    style="width: 150px"
                  />
                </el-form-item>
                <el-form-item label="重试失败后">
                  <el-select
                    v-model="nodeForm.failAction"
                    placeholder="选择动作"
                  >
                    <el-option label="转人工" value="transfer" />
                    <el-option label="结束通话" value="hangup" />
                  </el-select>
                </el-form-item>
              </template>

              <!-- 挂机节点配置 -->
              <template v-if="selectedNode.type === 'hangup'">
                <el-form-item label="结束语">
                  <el-input
                    v-model="nodeForm.endMessage"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入结束语"
                  />
                </el-form-item>
                <el-form-item label="挂机策略">
                  <el-radio-group v-model="nodeForm.hangupStrategy">
                    <el-radio label="system">系统主动挂断</el-radio>
                    <el-radio label="user">等待用户挂断</el-radio>
                  </el-radio-group>
                </el-form-item>
              </template>

              <!-- 按键节点配置 -->
              <template v-if="selectedNode.type === 'keypad'">
                <el-form-item label="提示音">
                  <el-input
                    v-model="nodeForm.prompt"
                    type="textarea"
                    :rows="2"
                    placeholder="引导用户按键的提示音"
                  />
                </el-form-item>
                <el-form-item label="有效按键">
                  <el-checkbox-group v-model="nodeForm.validKeys">
                    <el-checkbox label="0">0</el-checkbox>
                    <el-checkbox label="1">1</el-checkbox>
                    <el-checkbox label="2">2</el-checkbox>
                    <el-checkbox label="3">3</el-checkbox>
                    <el-checkbox label="4">4</el-checkbox>
                    <el-checkbox label="5">5</el-checkbox>
                    <el-checkbox label="6">6</el-checkbox>
                    <el-checkbox label="7">7</el-checkbox>
                    <el-checkbox label="8">8</el-checkbox>
                    <el-checkbox label="9">9</el-checkbox>
                    <el-checkbox label="*">*</el-checkbox>
                    <el-checkbox label="#">#</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                <el-form-item label="按键超时">
                  <el-input-number
                    v-model="nodeForm.timeout"
                    :min="1"
                    :max="30"
                    style="width: 150px"
                  />
                  <span style="margin-left: 10px">秒</span>
                </el-form-item>
                <el-form-item label="按键映射">
                  <div
                    v-for="(mapping, index) in nodeForm.keyMappings"
                    :key="index"
                    class="mapping-item"
                  >
                    <el-input
                      v-model="mapping.key"
                      placeholder="按键"
                      style="width: 80px; margin-right: 10px"
                    />
                    <el-input
                      v-model="mapping.targetNode"
                      placeholder="目标节点ID"
                      style="width: 150px; margin-right: 10px"
                    />
                    <el-button
                      link
                      type="danger"
                      size="small"
                      @click="handleRemoveMapping(index)"
                    >
                      删除
                    </el-button>
                  </div>
                  <el-button
                    type="primary"
                    link
                    size="small"
                    @click="handleAddMapping"
                    style="margin-top: 10px"
                  >
                    <el-icon><Plus /></el-icon>
                    添加映射
                  </el-button>
                </el-form-item>
              </template>
            </el-form>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Check,
  Promotion,
  VideoPlay,
  ChatDotRound,
  Switch,
  RefreshLeft,
  Phone,
  Key,
  Plus,
  Close
} from "@element-plus/icons-vue";

interface FlowNode {
  id: string;
  type: "normal" | "jump" | "recovery" | "hangup" | "keypad";
  name: string;
  x: number;
  y: number;
  [key: string]: any;
}

interface NodeType {
  type: string;
  label: string;
  icon: string;
  iconComponent: any;
}

interface Connection {
  from: string;
  to: string;
}

const canvasRef = ref<HTMLElement>();
const selectedNode = ref<FlowNode | null>(null);
const flowNodes = ref<FlowNode[]>([]);
const connections = ref<Connection[]>([]);
const draggingNode = ref<NodeType | null>(null);

const nodeTypes: NodeType[] = [
  {
    type: "normal",
    label: "普通节点",
    icon: "ChatDotRound",
    iconComponent: ChatDotRound
  },
  {
    type: "jump",
    label: "跳转节点",
    icon: "Switch",
    iconComponent: Switch
  },
  {
    type: "recovery",
    label: "挽回节点",
    icon: "RefreshLeft",
    iconComponent: RefreshLeft
  },
  {
    type: "hangup",
    label: "挂机节点",
    icon: "Phone",
    iconComponent: Phone
  },
  {
    type: "keypad",
    label: "按键节点",
    icon: "Key",
    iconComponent: Key
  }
];

const nodeForm = reactive({
  name: "",
  content: "",
  voice: "male1",
  speed: 1.0,
  allowInterrupt: false,
  conditions: [] as Array<{
    keyword: string;
    matchType: string;
    targetNode: string;
  }>,
  prompt: "",
  maxRetry: 3,
  failAction: "transfer",
  endMessage: "",
  hangupStrategy: "system",
  validKeys: [] as string[],
  timeout: 10,
  keyMappings: [] as Array<{ key: string; targetNode: string }>
});

// 监听选中节点变化，更新表单
watch(
  selectedNode,
  node => {
    if (node) {
      nodeForm.name = node.name || "";
      nodeForm.content = node.content || "";
      nodeForm.voice = node.voice || "male1";
      nodeForm.speed = node.speed || 1.0;
      nodeForm.allowInterrupt = node.allowInterrupt || false;
      nodeForm.conditions = node.conditions || [];
      nodeForm.prompt = node.prompt || "";
      nodeForm.maxRetry = node.maxRetry || 3;
      nodeForm.failAction = node.failAction || "transfer";
      nodeForm.endMessage = node.endMessage || "";
      nodeForm.hangupStrategy = node.hangupStrategy || "system";
      nodeForm.validKeys = node.validKeys || [];
      nodeForm.timeout = node.timeout || 10;
      nodeForm.keyMappings = node.keyMappings || [];
    }
  },
  { deep: true }
);

// 监听表单变化，同步到节点
watch(
  nodeForm,
  newForm => {
    if (selectedNode.value) {
      Object.assign(selectedNode.value, newForm);
    }
  },
  { deep: true }
);

const getNodeIcon = (type: string) => {
  const nodeType = nodeTypes.find(nt => nt.type === type);
  return nodeType?.iconComponent || ChatDotRound;
};

const getNodeLabel = (type: string) => {
  const nodeType = nodeTypes.find(nt => nt.type === type);
  return nodeType?.label || "未知节点";
};

const handleDragStart = (event: DragEvent, node: NodeType) => {
  draggingNode.value = node;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "copy";
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  if (!draggingNode.value || !canvasRef.value) return;

  const rect = canvasRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left - 100;
  const y = event.clientY - rect.top - 50;

  const newNode: FlowNode = {
    id: `node_${Date.now()}`,
    type: draggingNode.value.type as any,
    name: "",
    x: Math.max(0, x),
    y: Math.max(0, y)
  };

  flowNodes.value.push(newNode);
  draggingNode.value = null;
};

const handleNodeClick = (node: FlowNode) => {
  selectedNode.value = node;
};

const handleDeleteNode = (nodeId: string) => {
  ElMessageBox.confirm("确定要删除此节点吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      flowNodes.value = flowNodes.value.filter(n => n.id !== nodeId);
      connections.value = connections.value.filter(
        c => c.from !== nodeId && c.to !== nodeId
      );
      if (selectedNode.value?.id === nodeId) {
        selectedNode.value = null;
      }
      ElMessage.success("删除成功");
    })
    .catch(() => {});
};

const handleConnectorMouseDown = (
  event: MouseEvent,
  node: FlowNode,
  type: string
) => {
  // 连线功能简化实现
  event.stopPropagation();
  ElMessage.info("连线功能开发中，请通过配置目标节点ID来建立连接");
};

const getConnectionPath = (conn: Connection) => {
  const fromNode = flowNodes.value.find(n => n.id === conn.from);
  const toNode = flowNodes.value.find(n => n.id === conn.to);
  if (!fromNode || !toNode) return "";

  const x1 = fromNode.x + 200;
  const y1 = fromNode.y + 50;
  const x2 = toNode.x;
  const y2 = toNode.y + 50;

  return `M ${x1} ${y1} L ${x2} ${y2}`;
};

// 跳转节点条件管理
const handleAddCondition = () => {
  nodeForm.conditions.push({
    keyword: "",
    matchType: "contains",
    targetNode: ""
  });
};

const handleRemoveCondition = (index: number) => {
  nodeForm.conditions.splice(index, 1);
};

// 按键节点映射管理
const handleAddMapping = () => {
  nodeForm.keyMappings.push({ key: "", targetNode: "" });
};

const handleRemoveMapping = (index: number) => {
  nodeForm.keyMappings.splice(index, 1);
};

const handleSave = () => {
  ElMessage.success("保存成功");
};

const handlePublish = () => {
  ElMessageBox.confirm("确定要发布此流程配置吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      ElMessage.success("发布成功");
    })
    .catch(() => {});
};

const handleTest = () => {
  ElMessage.info("模拟测试功能开发中");
};
</script>

<style scoped lang="scss">
.script-flow {
  padding: 20px;
  height: 100%;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      font-weight: bold;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .flow-container {
    display: flex;
    height: calc(100vh - 200px);
    gap: 20px;

    .node-library {
      width: 200px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      padding: 15px;
      background-color: #f5f7fa;

      .library-title {
        font-weight: bold;
        margin-bottom: 15px;
        color: #303133;
      }

      .node-list {
        .node-item {
          display: flex;
          align-items: center;
          padding: 10px;
          margin-bottom: 10px;
          background-color: #fff;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          cursor: move;
          transition: all 0.3s;

          &:hover {
            border-color: #409eff;
            box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
          }

          .el-icon {
            margin-right: 8px;
            color: #409eff;
          }
        }
      }
    }

    .flow-canvas {
      flex: 1;
      position: relative;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      background-color: #fafafa;
      background-image: radial-gradient(circle, #e0e0e0 1px, transparent 1px);
      background-size: 20px 20px;
      overflow: auto;

      .empty-canvas {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }

      .flow-node {
        position: absolute;
        width: 200px;
        background-color: #fff;
        border: 2px solid #dcdfe6;
        border-radius: 8px;
        cursor: move;
        transition: all 0.3s;

        &:hover {
          border-color: #409eff;
          box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
        }

        &.active {
          border-color: #409eff;
          box-shadow: 0 4px 12px rgba(64, 158, 255, 0.5);
        }

        .node-header {
          display: flex;
          align-items: center;
          padding: 10px;
          background-color: #f5f7fa;
          border-bottom: 1px solid #dcdfe6;
          border-radius: 6px 6px 0 0;

          .el-icon {
            margin-right: 8px;
            color: #409eff;
          }

          .node-title {
            flex: 1;
            font-weight: 500;
            font-size: 14px;
          }

          .node-delete {
            padding: 0;
            width: 20px;
            height: 20px;
          }
        }

        .node-content {
          padding: 10px;
          font-size: 12px;
          color: #606266;
          min-height: 40px;
        }

        .node-connector {
          position: absolute;
          width: 12px;
          height: 12px;
          background-color: #409eff;
          border: 2px solid #fff;
          border-radius: 50%;
          cursor: crosshair;

          &.output {
            right: -6px;
            top: 50%;
            transform: translateY(-50%);
          }

          &.input {
            left: -6px;
            top: 50%;
            transform: translateY(-50%);
          }
        }
      }

      .flow-lines {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;

        .connection-line {
          pointer-events: stroke;
        }
      }
    }

    .property-panel {
      width: 350px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      padding: 15px;
      background-color: #fff;
      overflow-y: auto;

      .panel-title {
        font-weight: bold;
        margin-bottom: 15px;
        color: #303133;
      }

      .panel-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 300px;
      }

      .panel-content {
        .condition-item,
        .mapping-item {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
      }
    }
  }
}
</style>
