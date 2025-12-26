<template>
  <div class="script-template">
    <el-row :gutter="20">
      <!-- 左侧导航栏 -->
      <el-col :span="4">
        <el-card class="nav-card">
          <el-menu
            :default-active="activeMenu"
            @select="handleMenuSelect"
            class="nav-menu"
          >
            <el-menu-item index="active">
              <el-icon><ChatDotRound /></el-icon>
              <span>主动话术</span>
            </el-menu-item>
            <el-menu-item index="question">
              <el-icon><QuestionFilled /></el-icon>
              <span>问题流程</span>
            </el-menu-item>
            <el-menu-item index="dialogue">
              <el-icon><ChatLineRound /></el-icon>
              <span>多轮对话</span>
            </el-menu-item>
            <el-menu-item index="special">
              <el-icon><Warning /></el-icon>
              <span>特殊流程</span>
            </el-menu-item>
            <el-menu-item index="form">
              <el-icon><Document /></el-icon>
              <span>流水表单</span>
            </el-menu-item>
            <el-menu-item index="voice">
              <el-icon><Microphone /></el-icon>
              <span>语音管理</span>
            </el-menu-item>
            <el-menu-item index="hotword">
              <el-icon><Collection /></el-icon>
              <span>热词替换</span>
            </el-menu-item>
            <el-menu-item index="test">
              <el-icon><VideoPlay /></el-icon>
              <span>模拟测试</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <!-- 右侧主内容区 -->
      <el-col :span="20">
        <el-card>
          <template #header>
            <div class="card-header">
              <span class="title">{{ getMenuTitle(activeMenu) }}</span>
            </div>
          </template>

          <!-- 主动话术 -->
          <div v-if="activeMenu === 'active'" class="config-panel">
            <el-form :model="activeScriptForm" label-width="120px">
              <el-form-item label="话术内容">
                <el-input
                  v-model="activeScriptForm.content"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入话术内容，支持变量：${alert_title}, ${device_ip}, ${time}等"
                />
                <div class="form-tip">
                  <el-icon><InfoFilled /></el-icon>
                  支持使用变量，系统会在呼叫时自动替换为实际值
                </div>
              </el-form-item>
              <el-form-item label="音色选择">
                <el-radio-group v-model="activeScriptForm.voice">
                  <el-radio label="male1">沉稳男声</el-radio>
                  <el-radio label="female1">清晰女声</el-radio>
                  <el-radio label="male2">温和男声</el-radio>
                  <el-radio label="female2">甜美女声</el-radio>
                </el-radio-group>
                <el-button
                  type="primary"
                  link
                  style="margin-left: 20px"
                  @click="handlePreviewVoice"
                >
                  <el-icon><VideoPlay /></el-icon>
                  试听
                </el-button>
              </el-form-item>
              <el-form-item label="语速">
                <el-slider
                  v-model="activeScriptForm.speed"
                  :min="0.5"
                  :max="2"
                  :step="0.1"
                  show-input
                  style="width: 400px"
                />
              </el-form-item>
              <el-form-item label="语调">
                <el-slider
                  v-model="activeScriptForm.tone"
                  :min="0.5"
                  :max="2"
                  :step="0.1"
                  show-input
                  style="width: 400px"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveActiveScript"
                  >保存</el-button
                >
                <el-button @click="handleResetActiveScript">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 问题流程 -->
          <div v-if="activeMenu === 'question'" class="config-panel">
            <el-form :model="questionForm" label-width="120px">
              <el-form-item label="问题文本">
                <el-input
                  v-model="questionForm.question"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入需要播报的问题"
                />
              </el-form-item>
              <el-form-item label="预期答案">
                <div
                  v-for="(answer, index) in questionForm.answers"
                  :key="index"
                  class="answer-item"
                >
                  <el-input
                    v-model="answer.keyword"
                    placeholder="关键词"
                    style="width: 200px; margin-right: 10px"
                  />
                  <el-select
                    v-model="answer.matchType"
                    placeholder="匹配规则"
                    style="width: 150px; margin-right: 10px"
                  >
                    <el-option label="精确匹配" value="exact" />
                    <el-option label="包含匹配" value="contains" />
                  </el-select>
                  <el-input
                    v-model="answer.nextNode"
                    placeholder="跳转节点"
                    style="width: 150px; margin-right: 10px"
                  />
                  <el-button
                    type="danger"
                    link
                    @click="handleRemoveAnswer(index)"
                    :disabled="questionForm.answers.length <= 1"
                  >
                    删除
                  </el-button>
                </div>
                <el-button
                  type="primary"
                  link
                  @click="handleAddAnswer"
                  style="margin-top: 10px"
                >
                  <el-icon><Plus /></el-icon>
                  添加答案选项
                </el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveQuestion"
                  >保存</el-button
                >
                <el-button @click="handleResetQuestion">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 多轮对话 -->
          <div v-if="activeMenu === 'dialogue'" class="config-panel">
            <el-form :model="dialogueForm" label-width="120px">
              <el-form-item label="对话轮次">
                <el-table
                  :data="dialogueForm.rounds"
                  border
                  style="width: 100%"
                >
                  <el-table-column prop="round" label="轮次" width="80" />
                  <el-table-column prop="question" label="问题内容" />
                  <el-table-column
                    prop="contextRef"
                    label="上下文引用"
                    width="150"
                  />
                  <el-table-column label="操作" width="150">
                    <template #default="{ $index }">
                      <el-button
                        link
                        type="primary"
                        size="small"
                        @click="handleEditRound($index)"
                      >
                        编辑
                      </el-button>
                      <el-button
                        link
                        type="danger"
                        size="small"
                        @click="handleRemoveRound($index)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-button
                  type="primary"
                  @click="handleAddRound"
                  style="margin-top: 10px"
                >
                  <el-icon><Plus /></el-icon>
                  添加对话轮次
                </el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveDialogue"
                  >保存</el-button
                >
                <el-button @click="handleResetDialogue">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 特殊流程 -->
          <div v-if="activeMenu === 'special'" class="config-panel">
            <el-form :model="specialForm" label-width="120px">
              <el-form-item label="静音处理">
                <el-input-number
                  v-model="specialForm.silenceTimeout"
                  :min="1"
                  :max="30"
                  style="width: 150px"
                />
                <span style="margin-left: 10px">秒后触发提示</span>
                <el-input
                  v-model="specialForm.silencePrompt"
                  placeholder="静音提示语"
                  style="width: 300px; margin-left: 20px"
                />
              </el-form-item>
              <el-form-item label="打断处理">
                <el-switch v-model="specialForm.allowInterrupt" />
                <span style="margin-left: 10px">允许用户打断当前播报</span>
                <el-input
                  v-if="specialForm.allowInterrupt"
                  v-model="specialForm.interruptAction"
                  placeholder="打断后的处理流程"
                  style="width: 300px; margin-left: 20px"
                />
              </el-form-item>
              <el-form-item label="转人工触发">
                <el-input
                  v-model="specialForm.transferKeywords"
                  placeholder="转人工关键词，多个用逗号分隔"
                  style="width: 400px"
                />
                <el-select
                  v-model="specialForm.transferAction"
                  placeholder="转接动作"
                  style="width: 200px; margin-left: 10px"
                >
                  <el-option label="转接人工客服" value="transfer" />
                  <el-option label="生成人工工单" value="ticket" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveSpecial"
                  >保存</el-button
                >
                <el-button @click="handleResetSpecial">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 流水表单 -->
          <div v-if="activeMenu === 'form'" class="config-panel">
            <el-form :model="formConfig" label-width="120px">
              <el-form-item label="表单字段">
                <el-table :data="formConfig.fields" border style="width: 100%">
                  <el-table-column prop="name" label="字段名" width="150" />
                  <el-table-column prop="label" label="显示标签" width="150" />
                  <el-table-column prop="type" label="字段类型" width="120">
                    <template #default="{ row }">
                      <el-tag size="small">{{ row.type }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="required" label="必填" width="80">
                    <template #default="{ row }">
                      <el-tag
                        :type="row.required ? 'danger' : 'info'"
                        size="small"
                      >
                        {{ row.required ? "是" : "否" }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150">
                    <template #default="{ $index }">
                      <el-button
                        link
                        type="primary"
                        size="small"
                        @click="handleEditField($index)"
                      >
                        编辑
                      </el-button>
                      <el-button
                        link
                        type="danger"
                        size="small"
                        @click="handleRemoveField($index)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-button
                  type="primary"
                  @click="handleAddField"
                  style="margin-top: 10px"
                >
                  <el-icon><Plus /></el-icon>
                  添加字段
                </el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveForm"
                  >保存</el-button
                >
                <el-button @click="handleResetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 语音管理 -->
          <div v-if="activeMenu === 'voice'" class="config-panel">
            <div class="voice-management">
              <el-tabs v-model="voiceTab">
                <el-tab-pane label="TTS语音库" name="tts">
                  <el-table :data="ttsVoices" border style="width: 100%">
                    <el-table-column prop="name" label="音色名称" width="150" />
                    <el-table-column prop="gender" label="性别" width="100" />
                    <el-table-column prop="language" label="语种" width="100" />
                    <el-table-column prop="dialect" label="方言" width="100" />
                    <el-table-column label="试听" width="100">
                      <template #default="{ row }">
                        <el-button
                          link
                          type="primary"
                          size="small"
                          @click="handlePreviewTTS(row)"
                        >
                          试听
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-tab-pane>
                <el-tab-pane label="录音管理" name="record">
                  <div class="record-upload">
                    <el-upload
                      action="#"
                      :auto-upload="false"
                      :on-change="handleRecordChange"
                      :file-list="recordFiles"
                    >
                      <el-button type="primary">
                        <el-icon><Upload /></el-icon>
                        上传录音文件
                      </el-button>
                      <template #tip>
                        <div class="el-upload__tip">
                          支持 mp3, wav 格式，文件大小不超过 10MB
                        </div>
                      </template>
                    </el-upload>
                  </div>
                  <el-table
                    :data="recordList"
                    border
                    style="width: 100%; margin-top: 20px"
                  >
                    <el-table-column prop="name" label="文件名" />
                    <el-table-column prop="duration" label="时长" width="100" />
                    <el-table-column prop="size" label="文件大小" width="120" />
                    <el-table-column label="试听" width="100">
                      <template #default="{ row }">
                        <el-button
                          link
                          type="primary"
                          size="small"
                          @click="handlePreviewRecord(row)"
                        >
                          试听
                        </el-button>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150">
                      <template #default="{ row }">
                        <el-button
                          link
                          type="danger"
                          size="small"
                          @click="handleDeleteRecord(row)"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>

          <!-- 热词替换 -->
          <div v-if="activeMenu === 'hotword'" class="config-panel">
            <el-form :model="hotwordForm" label-width="120px">
              <el-form-item label="热词库">
                <el-table
                  :data="hotwordForm.hotwords"
                  border
                  style="width: 100%"
                >
                  <el-table-column prop="word" label="词汇" width="200" />
                  <el-table-column prop="pronunciation" label="强制发音" />
                  <el-table-column label="操作" width="150">
                    <template #default="{ $index }">
                      <el-button
                        link
                        type="primary"
                        size="small"
                        @click="handleEditHotword($index)"
                      >
                        编辑
                      </el-button>
                      <el-button
                        link
                        type="danger"
                        size="small"
                        @click="handleRemoveHotword($index)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-button
                  type="primary"
                  @click="handleAddHotword"
                  style="margin-top: 10px"
                >
                  <el-icon><Plus /></el-icon>
                  添加热词
                </el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveHotword"
                  >保存</el-button
                >
                <el-button @click="handleResetHotword">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 模拟测试 -->
          <div v-if="activeMenu === 'test'" class="config-panel">
            <div class="test-panel">
              <el-card shadow="never">
                <template #header>
                  <div class="test-header">
                    <span>交互式测试</span>
                    <el-button
                      type="primary"
                      size="small"
                      @click="handleStartTest"
                    >
                      开始测试
                    </el-button>
                  </div>
                </template>
                <div class="test-content">
                  <div class="test-log" ref="testLogRef">
                    <div
                      v-for="(log, index) in testLogs"
                      :key="index"
                      class="log-item"
                      :class="log.type"
                    >
                      <span class="log-time">{{ log.time }}</span>
                      <span class="log-content">{{ log.content }}</span>
                    </div>
                  </div>
                  <div class="test-input">
                    <el-input
                      v-model="testInput"
                      placeholder="输入模拟用户回答..."
                      @keyup.enter="handleTestInput"
                    >
                      <template #append>
                        <el-button @click="handleTestInput">发送</el-button>
                      </template>
                    </el-input>
                  </div>
                </div>
              </el-card>
              <el-button
                type="primary"
                @click="handleShareTest"
                style="margin-top: 20px"
              >
                <el-icon><Share /></el-icon>
                分享测试链接
              </el-button>
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
import {
  ChatDotRound,
  QuestionFilled,
  ChatLineRound,
  Warning,
  Document,
  Microphone,
  Collection,
  VideoPlay,
  InfoFilled,
  Plus,
  Upload,
  Share
} from "@element-plus/icons-vue";

const activeMenu = ref("active");

// 主动话术表单
const activeScriptForm = reactive({
  content: "",
  voice: "male1",
  speed: 1.0,
  tone: 1.0
});

// 问题流程表单
const questionForm = reactive({
  question: "",
  answers: [{ keyword: "", matchType: "exact", nextNode: "" }]
});

// 多轮对话表单
const dialogueForm = reactive({
  rounds: [{ round: 1, question: "", contextRef: "" }]
});

// 特殊流程表单
const specialForm = reactive({
  silenceTimeout: 5,
  silencePrompt: "您好，您还在听吗？",
  allowInterrupt: true,
  interruptAction: "",
  transferKeywords: "人工,客服",
  transferAction: "transfer"
});

// 流水表单配置
const formConfig = reactive({
  fields: [
    {
      name: "satisfaction",
      label: "满意度评分",
      type: "number",
      required: true
    }
  ]
});

// 语音管理
const voiceTab = ref("tts");
const ttsVoices = ref([
  { name: "沉稳男声", gender: "男", language: "中文", dialect: "普通话" },
  { name: "清晰女声", gender: "女", language: "中文", dialect: "普通话" }
]);
const recordFiles = ref([]);
const recordList = ref([
  { name: "品牌宣传语.mp3", duration: "10秒", size: "500KB" }
]);

// 热词表单
const hotwordForm = reactive({
  hotwords: [
    { word: "BGP", pronunciation: "B-G-P" },
    { word: "CPU", pronunciation: "C-P-U" }
  ]
});

// 模拟测试
const testLogs = ref<Array<{ time: string; content: string; type: string }>>(
  []
);
const testInput = ref("");
const testLogRef = ref<HTMLElement>();

const getMenuTitle = (menu: string) => {
  const titleMap: Record<string, string> = {
    active: "主动话术",
    question: "问题流程",
    dialogue: "多轮对话",
    special: "特殊流程",
    form: "流水表单",
    voice: "语音管理",
    hotword: "热词替换",
    test: "模拟测试"
  };
  return titleMap[menu] || "";
};

const handleMenuSelect = (key: string) => {
  activeMenu.value = key;
};

// 主动话术相关方法
const handlePreviewVoice = () => {
  ElMessage.info("试听功能开发中");
};

const handleSaveActiveScript = () => {
  ElMessage.success("保存成功");
};

const handleResetActiveScript = () => {
  activeScriptForm.content = "";
  activeScriptForm.voice = "male1";
  activeScriptForm.speed = 1.0;
  activeScriptForm.tone = 1.0;
};

// 问题流程相关方法
const handleAddAnswer = () => {
  questionForm.answers.push({ keyword: "", matchType: "exact", nextNode: "" });
};

const handleRemoveAnswer = (index: number) => {
  questionForm.answers.splice(index, 1);
};

const handleSaveQuestion = () => {
  ElMessage.success("保存成功");
};

const handleResetQuestion = () => {
  questionForm.question = "";
  questionForm.answers = [{ keyword: "", matchType: "exact", nextNode: "" }];
};

// 多轮对话相关方法
const handleAddRound = () => {
  dialogueForm.rounds.push({
    round: dialogueForm.rounds.length + 1,
    question: "",
    contextRef: ""
  });
};

const handleRemoveRound = (index: number) => {
  dialogueForm.rounds.splice(index, 1);
  // 重新编号
  dialogueForm.rounds.forEach((round, i) => {
    round.round = i + 1;
  });
};

const handleEditRound = (index: number) => {
  ElMessage.info("编辑功能开发中");
};

const handleSaveDialogue = () => {
  ElMessage.success("保存成功");
};

const handleResetDialogue = () => {
  dialogueForm.rounds = [{ round: 1, question: "", contextRef: "" }];
};

// 特殊流程相关方法
const handleSaveSpecial = () => {
  ElMessage.success("保存成功");
};

const handleResetSpecial = () => {
  specialForm.silenceTimeout = 5;
  specialForm.silencePrompt = "您好，您还在听吗？";
  specialForm.allowInterrupt = true;
  specialForm.interruptAction = "";
  specialForm.transferKeywords = "人工,客服";
  specialForm.transferAction = "transfer";
};

// 流水表单相关方法
const handleAddField = () => {
  formConfig.fields.push({
    name: "",
    label: "",
    type: "text",
    required: false
  });
};

const handleRemoveField = (index: number) => {
  formConfig.fields.splice(index, 1);
};

const handleEditField = (index: number) => {
  ElMessage.info("编辑功能开发中");
};

const handleSaveForm = () => {
  ElMessage.success("保存成功");
};

const handleResetForm = () => {
  formConfig.fields = [
    {
      name: "satisfaction",
      label: "满意度评分",
      type: "number",
      required: true
    }
  ];
};

// 语音管理相关方法
const handleRecordChange = (file: any) => {
  recordFiles.value.push(file);
};

const handlePreviewTTS = (row: any) => {
  ElMessage.info(`试听: ${row.name}`);
};

const handlePreviewRecord = (row: any) => {
  ElMessage.info(`试听: ${row.name}`);
};

const handleDeleteRecord = (row: any) => {
  ElMessage.success("删除成功");
};

// 热词相关方法
const handleAddHotword = () => {
  hotwordForm.hotwords.push({ word: "", pronunciation: "" });
};

const handleRemoveHotword = (index: number) => {
  hotwordForm.hotwords.splice(index, 1);
};

const handleEditHotword = (index: number) => {
  ElMessage.info("编辑功能开发中");
};

const handleSaveHotword = () => {
  ElMessage.success("保存成功");
};

const handleResetHotword = () => {
  hotwordForm.hotwords = [
    { word: "BGP", pronunciation: "B-G-P" },
    { word: "CPU", pronunciation: "C-P-U" }
  ];
};

// 模拟测试相关方法
const handleStartTest = () => {
  testLogs.value = [];
  testLogs.value.push({
    time: new Date().toLocaleTimeString(),
    content: "测试开始，AI开始播报...",
    type: "system"
  });
};

const handleTestInput = () => {
  if (!testInput.value.trim()) return;

  testLogs.value.push({
    time: new Date().toLocaleTimeString(),
    content: `用户: ${testInput.value}`,
    type: "user"
  });

  // 模拟AI回复
  setTimeout(() => {
    testLogs.value.push({
      time: new Date().toLocaleTimeString(),
      content: "AI: 收到您的回答，流程继续...",
      type: "ai"
    });
  }, 500);

  testInput.value = "";

  // 滚动到底部
  setTimeout(() => {
    if (testLogRef.value) {
      testLogRef.value.scrollTop = testLogRef.value.scrollHeight;
    }
  }, 100);
};

const handleShareTest = () => {
  ElMessage.success("测试链接已生成，已复制到剪贴板");
};
</script>

<style scoped lang="scss">
.script-template {
  padding: 20px;
  height: 100%;

  .nav-card {
    height: calc(100vh - 100px);

    .nav-menu {
      border-right: none;
    }
  }

  .card-header {
    .title {
      font-size: 18px;
      font-weight: bold;
    }
  }

  .config-panel {
    .form-tip {
      display: flex;
      align-items: center;
      margin-top: 5px;
      font-size: 12px;
      color: #909399;

      .el-icon {
        margin-right: 5px;
      }
    }

    .answer-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
  }

  .voice-management {
    .record-upload {
      margin-bottom: 20px;
    }
  }

  .test-panel {
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .test-content {
      .test-log {
        height: 400px;
        overflow-y: auto;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        padding: 15px;
        margin-bottom: 15px;
        background-color: #f5f7fa;

        .log-item {
          margin-bottom: 10px;
          padding: 8px;
          border-radius: 4px;

          &.system {
            background-color: #e4e7ed;
          }

          &.user {
            background-color: #ecf5ff;
            text-align: right;
          }

          &.ai {
            background-color: #f0f9ff;
          }

          .log-time {
            font-size: 12px;
            color: #909399;
            margin-right: 10px;
          }

          .log-content {
            color: #303133;
          }
        }
      }

      .test-input {
        width: 100%;
      }
    }
  }
}
</style>
