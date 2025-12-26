<template>
  <div class="email-server-management">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="title">邮件服务器配置</span>
        </div>
      </template>

      <EmailServerList />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import EmailServerList from "./components/EmailServerList.vue";
</script>

<style scoped lang="scss">
.email-server-management {
  padding: 20px;
  height: 100%;

  .main-card {
    height: calc(100vh - 100px);

    :deep(.el-card__body) {
      padding: 20px;
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
}
</style>
