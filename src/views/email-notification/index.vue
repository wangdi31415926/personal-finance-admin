<template>
  <div class="email-notification">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="title">邮件通知</span>
        </div>
      </template>

      <el-tabs
        v-model="activeTab"
        type="border-card"
        @tab-change="handleTabChange"
      >
        <!-- 邮件发送 -->
        <el-tab-pane label="邮件发送" name="send">
          <EmailSend />
        </el-tab-pane>

        <!-- 邮件管理 -->
        <el-tab-pane label="邮件管理" name="management">
          <EmailManagement />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import EmailSend from "./components/EmailSend.vue";
import EmailManagement from "./components/EmailManagement.vue";

const activeTab = ref("send");

const handleTabChange = (tabName: string) => {
  console.log("切换到标签页:", tabName);
};
</script>

<style scoped lang="scss">
.email-notification {
  padding: 20px;
  height: 100%;

  .main-card {
    height: calc(100vh - 100px);

    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      font-weight: bold;
    }
  }

  :deep(.el-tabs) {
    height: 100%;

    .el-tabs__content {
      height: calc(100% - 55px);
      overflow: auto;
      padding: 20px;
    }

    .el-tab-pane {
      height: 100%;
    }
  }
}
</style>
