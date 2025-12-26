<template>
  <div class="knowledge-qa">
    <el-card shadow="never" class="qa-card">
      <div class="qa-header">
        <h2>知识问答</h2>
      </div>

      <!-- 对话区域 -->
      <div class="chat-area" ref="chatAreaRef">
        <div
          v-for="(item, index) in chatHistory"
          :key="index"
          class="chat-item"
          :class="item.type"
        >
          <div class="chat-bubble">
            <div v-if="item.type === 'user'" class="user-question">
              <el-icon><User /></el-icon>
              <div class="question-text">{{ item.content }}</div>
            </div>
            <div v-else class="system-answer">
              <el-icon><ChatDotRound /></el-icon>
              <div class="answer-content">
                <div class="answer-section">
                  <div class="section-title">核心结论</div>
                  <div class="section-content">
                    {{ item.answer.conclusion }}
                  </div>
                </div>
                <div class="answer-section">
                  <div class="section-title">操作步骤</div>
                  <ol class="step-list">
                    <li
                      v-for="(step, stepIndex) in item.answer.steps"
                      :key="stepIndex"
                    >
                      {{ step }}
                    </li>
                  </ol>
                </div>
                <div class="answer-section">
                  <div class="section-title">相关命令</div>
                  <div class="command-block">
                    <pre><code>{{ item.answer.commands }}</code></pre>
                    <el-button
                      link
                      type="primary"
                      size="small"
                      @click="handleCopyCommand(item.answer.commands)"
                    >
                      一键复制
                    </el-button>
                  </div>
                </div>
                <div class="answer-section">
                  <div class="section-title">注意事项</div>
                  <div class="notice-content">
                    <el-icon><Warning /></el-icon>
                    <span>{{ item.answer.notices }}</span>
                  </div>
                </div>
                <div class="answer-sources">
                  <div class="sources-title">知识来源：</div>
                  <el-tag
                    v-for="(source, sourceIndex) in item.answer.sources"
                    :key="sourceIndex"
                    class="source-tag"
                    @click="handleViewSource(source)"
                  >
                    {{ source }}
                  </el-tag>
                </div>
                <div class="related-questions">
                  <div class="related-title">相关问题：</div>
                  <el-link
                    v-for="(question, qIndex) in item.answer.relatedQuestions"
                    :key="qIndex"
                    type="primary"
                    class="related-link"
                    @click="handleRelatedQuestion(question)"
                  >
                    {{ question }}
                  </el-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="loading-indicator">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在思考中...</span>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <el-input
          v-model="questionInput"
          type="textarea"
          :rows="3"
          placeholder="请输入您的问题，如'路由器丢包怎么排查？'"
          @keyup.ctrl.enter="handleSubmit"
        />
        <div class="input-actions">
          <el-button
            :icon="VideoPlay"
            :type="isRecording ? 'danger' : ''"
            @click="handleVoiceInput"
          >
            {{ isRecording ? "停止录音" : "语音输入" }}
          </el-button>
          <el-button type="primary" @click="handleSubmit">发送</el-button>
        </div>
      </div>

      <!-- 反馈区域 -->
      <div v-if="lastAnswer" class="feedback-area">
        <span>这个回答对您有帮助吗？</span>
        <el-button
          :type="feedback === 'satisfied' ? 'success' : ''"
          size="small"
          @click="handleFeedback('satisfied')"
        >
          满意
        </el-button>
        <el-button
          :type="feedback === 'unsatisfied' ? 'danger' : ''"
          size="small"
          @click="handleFeedback('unsatisfied')"
        >
          不满意
        </el-button>
        <el-button
          v-if="feedback === 'unsatisfied'"
          type="text"
          size="small"
          @click="showFeedbackDialog = true"
        >
          反馈原因
        </el-button>
      </div>
    </el-card>

    <!-- 反馈原因弹窗 -->
    <el-dialog v-model="showFeedbackDialog" title="反馈原因" width="500px">
      <el-form :model="feedbackForm" label-width="100px">
        <el-form-item label="反馈原因">
          <el-radio-group v-model="feedbackForm.reason">
            <el-radio label="incomplete">答案不完整</el-radio>
            <el-radio label="error">步骤错误</el-radio>
            <el-radio label="mismatch">与场景不符</el-radio>
            <el-radio label="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="具体建议">
          <el-input
            v-model="feedbackForm.suggestion"
            type="textarea"
            :rows="4"
            placeholder="请输入您的具体建议"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showFeedbackDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitFeedback">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from "vue";
import { ElMessage } from "element-plus";
import {
  User,
  ChatDotRound,
  Warning,
  Loading,
  VideoPlay
} from "@element-plus/icons-vue";

const chatAreaRef = ref();
const questionInput = ref("");
const isLoading = ref(false);
const isRecording = ref(false);
const feedback = ref("");
const lastAnswer = ref<any>(null);
const showFeedbackDialog = ref(false);

const feedbackForm = reactive({
  reason: "",
  suggestion: ""
});

// 测试数据
const chatHistory = ref([
  {
    type: "user",
    content: "路由器丢包怎么排查？"
  },
  {
    type: "system",
    content: "",
    answer: {
      conclusion:
        "路由器丢包问题需要从接口状态、流量统计、路由表等多个维度进行排查。",
      steps: [
        "检查接口状态，确认接口是否UP",
        "查看接口流量统计，确认丢包位置",
        "检查路由表，确认路由是否正确",
        "分析日志，查找异常信息"
      ],
      commands: `show interface GigabitEthernet0/0/0
show interface statistics
show ip route
show log`,
      notices: "排查过程中注意保存日志，便于后续分析。",
      sources: ["路由器故障处理手册", "网络设备配置指南"],
      relatedQuestions: [
        "端口丢包怎么处理？",
        "路由器性能优化方法",
        "网络故障排查流程"
      ]
    }
  }
]);

const handleSubmit = async () => {
  if (!questionInput.value.trim()) {
    ElMessage.warning("请输入您的问题");
    return;
  }

  // 添加用户问题
  chatHistory.value.push({
    type: "user",
    content: questionInput.value
  });

  const currentQuestion = questionInput.value;
  questionInput.value = "";
  isLoading.value = true;
  feedback.value = "";

  // 滚动到底部
  await nextTick();
  scrollToBottom();

  // 模拟API调用
  setTimeout(async () => {
    // 添加系统回答
    chatHistory.value.push({
      type: "system",
      content: "",
      answer: {
        conclusion: "根据您的问题，我为您整理了以下解决方案。",
        steps: [
          "步骤1：检查相关配置",
          "步骤2：查看日志信息",
          "步骤3：执行诊断命令"
        ],
        commands: `# 示例命令
show config
show log`,
        notices: "请注意操作安全，建议在测试环境先验证。",
        sources: ["相关技术文档"],
        relatedQuestions: ["相关问题1", "相关问题2"]
      }
    });

    lastAnswer.value = chatHistory.value[chatHistory.value.length - 1];
    isLoading.value = false;

    await nextTick();
    scrollToBottom();
  }, 1500);
};

const handleVoiceInput = () => {
  isRecording.value = !isRecording.value;
  if (isRecording.value) {
    ElMessage.info("开始录音...");
    // 模拟语音识别
    setTimeout(() => {
      questionInput.value = "路由器丢包怎么排查？";
      isRecording.value = false;
      ElMessage.success("语音识别完成");
    }, 2000);
  } else {
    ElMessage.info("停止录音");
  }
};

const handleCopyCommand = (commands: string) => {
  navigator.clipboard.writeText(commands).then(() => {
    ElMessage.success("命令已复制");
  });
};

const handleViewSource = (source: string) => {
  ElMessage.info(`查看来源：${source}`);
};

const handleRelatedQuestion = (question: string) => {
  questionInput.value = question;
  handleSubmit();
};

const handleFeedback = (type: string) => {
  feedback.value = type;
  if (type === "satisfied") {
    ElMessage.success("感谢您的反馈！");
  } else {
    ElMessage.info("我们会持续改进");
  }
};

const handleSubmitFeedback = () => {
  ElMessage.success("反馈已提交，感谢您的建议！");
  showFeedbackDialog.value = false;
  Object.assign(feedbackForm, {
    reason: "",
    suggestion: ""
  });
};

const scrollToBottom = () => {
  if (chatAreaRef.value) {
    chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight;
  }
};
</script>

<style scoped lang="scss">
.knowledge-qa {
  .qa-card {
    min-height: 600px;
  }

  .qa-header {
    margin-bottom: 20px;
    text-align: center;

    h2 {
      margin: 0;
      color: #303133;
    }
  }

  .chat-area {
    min-height: 400px;
    max-height: 500px;
    overflow-y: auto;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 20px;

    .chat-item {
      margin-bottom: 20px;

      &.user {
        display: flex;
        justify-content: flex-end;

        .chat-bubble {
          background: #409eff;
          color: white;
          border-radius: 10px 10px 0 10px;
          max-width: 70%;
          padding: 12px 16px;

          .user-question {
            display: flex;
            align-items: center;
            gap: 8px;

            .question-text {
              word-break: break-word;
            }
          }
        }
      }

      &.system {
        display: flex;
        justify-content: flex-start;

        .chat-bubble {
          background: white;
          border-radius: 10px 10px 10px 0;
          max-width: 80%;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

          .system-answer {
            display: flex;
            gap: 12px;

            .answer-content {
              flex: 1;

              .answer-section {
                margin-bottom: 15px;

                .section-title {
                  font-weight: bold;
                  color: #303133;
                  margin-bottom: 8px;
                  font-size: 14px;
                }

                .section-content {
                  color: #606266;
                  line-height: 1.6;
                }

                .step-list {
                  margin: 0;
                  padding-left: 20px;
                  color: #606266;
                  line-height: 1.8;
                }

                .command-block {
                  background: #2d2d2d;
                  color: #f8f8f2;
                  padding: 12px;
                  border-radius: 4px;
                  position: relative;

                  pre {
                    margin: 0;
                    font-family: "Courier New", monospace;
                    font-size: 13px;
                    white-space: pre-wrap;
                    word-break: break-all;
                  }

                  .el-button {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                  }
                }

                .notice-content {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  padding: 10px;
                  background: #fff7e6;
                  border-left: 3px solid #e6a23c;
                  border-radius: 4px;
                  color: #e6a23c;
                }
              }

              .answer-sources {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #ebeef5;

                .sources-title {
                  font-size: 12px;
                  color: #909399;
                  margin-bottom: 8px;
                }

                .source-tag {
                  margin-right: 8px;
                  cursor: pointer;
                }
              }

              .related-questions {
                margin-top: 15px;

                .related-title {
                  font-size: 12px;
                  color: #909399;
                  margin-bottom: 8px;
                }

                .related-link {
                  margin-right: 15px;
                  font-size: 13px;
                }
              }
            }
          }
        }
      }
    }

    .loading-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #909399;
      padding: 20px;
      justify-content: center;
    }
  }

  .input-area {
    .input-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 10px;
    }
  }

  .feedback-area {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #ebeef5;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #606266;
  }
}
</style>
