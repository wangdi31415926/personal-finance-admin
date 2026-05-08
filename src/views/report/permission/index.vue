<template>
  <div class="permission-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>权限与角色</span>
          <el-button type="primary" size="small">新建角色</el-button>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="section-title">角色列表</div>
          <el-table
            :data="paginatedRoles"
            stripe
            size="small"
            highlight-current-row
            @current-change="handleRoleSelect"
          >
            <el-table-column prop="name" label="角色" width="110" />
            <el-table-column prop="userCount" label="关联用户" width="90" />
          </el-table>
          <el-pagination
            v-model:current-page="rolePage"
            :page-size="10"
            :total="roles.length"
            layout="total, prev, pager, next"
            small
            class="pagination"
          />
        </el-col>
        <el-col :span="8">
          <div class="section-title">数据范围</div>
          <template v-if="selectedRole">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="数据范围">{{ selectedRole.scope }}</el-descriptions-item>
            </el-descriptions>
            <el-tag size="small" class="mt-1">按区域、设备类型、指标划分</el-tag>
          </template>
          <el-empty v-else description="选择角色查看" :image-size="50" />
        </el-col>
        <el-col :span="8">
          <div class="section-title">功能权限</div>
          <el-tree
            v-if="selectedRole"
            :data="functionPerms"
            :props="{ label: 'name', children: 'children' }"
            default-expand-all
            show-checkbox
          />
          <el-empty v-else description="选择角色查看" :image-size="50" />
        </el-col>
      </el-row>
      <el-divider />
      <div class="template-scope-section">
        <div class="section-title">模板可见范围</div>
        <el-radio-group v-model="templateScope" size="small">
          <el-radio label="个人" />
          <el-radio label="团队" />
          <el-radio label="部门" />
          <el-radio label="全局" />
        </el-radio-group>
        <el-text type="info" size="small" class="block mt-1">认证：统一身份、OAuth2、JWT；全链路权限校验</el-text>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const templateScope = ref("团队");
const rolePage = ref(1);
const selectedRole = ref<{ name: string; scope: string; userCount: number } | null>(null);

const roles = ref([
  { name: "运维人员", scope: "北京区域 · 核心设备", userCount: 12 },
  { name: "网络管理员", scope: "全网 · 全部设备", userCount: 3 },
  { name: "部门经理", scope: "本部门 · 汇总数据", userCount: 5 },
  { name: "安全审计员", scope: "全网 · 只读", userCount: 2 },
  { name: "区域运维", scope: "上海区域 · 核心设备", userCount: 8 },
  { name: "报表查看", scope: "本部门 · 汇总数据只读", userCount: 15 },
  { name: "模板管理员", scope: "全网 · 模板配置", userCount: 4 },
  { name: "接口调用方", scope: "按应用授权", userCount: 6 },
  { name: "超级管理员", scope: "全网 · 全部", userCount: 1 },
  { name: "访客", scope: "无数据权限", userCount: 0 },
  { name: "数据分析师", scope: "全网 · 脱敏数据", userCount: 7 }
]);

const paginatedRoles = computed(() => {
  const start = (rolePage.value - 1) * 10;
  return roles.value.slice(start, start + 10);
});

const functionPerms = ref([
  { name: "报告生成", children: [{ name: "使用预置模板" }, { name: "自定义模板" }, { name: "下载报告" }] },
  { name: "模板管理", children: [{ name: "新建/编辑" }, { name: "删除" }] },
  { name: "系统管理", children: [{ name: "用户与角色" }, { name: "接口配置" }] }
]);

function handleRoleSelect(row: (typeof roles.value)[0] | null) {
  selectedRole.value = row ? { name: row.name, scope: row.scope, userCount: row.userCount } : null;
}
</script>

<style scoped lang="scss">
.permission-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-title {
    font-weight: 600;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .mt-1 {
    margin-top: 8px;
    display: block;
  }

  .template-scope-section {
    .block.mt-1 {
      margin-top: 8px;
    }
  }

  .pagination {
    margin-top: 12px;
  }
}
</style>
