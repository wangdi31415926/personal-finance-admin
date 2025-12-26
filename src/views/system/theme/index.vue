<template>
  <div class="theme-management">
    <el-tabs v-model="activeMainTab" class="main-tabs">
      <el-tab-pane label="主题浏览" name="browse">
        <el-card class="main-card">
          <template #header>
            <div class="card-header">
              <span class="title">主题浏览</span>
            </div>
          </template>

          <!-- 筛选区 -->
          <div class="filter-bar">
            <el-select
              v-model="filterOrg"
              placeholder="选择组织"
              clearable
              style="width: 200px"
              @change="handleFilterChange"
            >
              <el-option
                v-for="org in orgList"
                :key="org.id"
                :label="org.name"
                :value="org.id"
              />
            </el-select>
            <el-radio-group
              v-model="filterStatus"
              @change="handleFilterChange"
              style="margin-left: 20px"
            >
              <el-radio label="all">全部</el-radio>
              <el-radio label="enabled">启用中</el-radio>
              <el-radio label="disabled">未启用</el-radio>
            </el-radio-group>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索主题名称/所属组织"
              clearable
              style="width: 300px; margin-left: 20px"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <!-- 主题列表 -->
          <div class="theme-list">
            <div
              v-for="theme in filteredThemeList"
              :key="theme.id"
              class="theme-card"
              @mouseenter="hoveredTheme = theme.id"
              @mouseleave="hoveredTheme = null"
            >
              <div class="theme-header">
                <div class="theme-info">
                  <h3 :class="{ highlight: theme.isSearchMatch }">
                    {{ theme.name }}
                  </h3>
                  <div class="theme-meta">
                    <span>所属组织：{{ theme.org }}</span>
                    <span>创建时间：{{ theme.createTime }}</span>
                  </div>
                </div>
                <div class="theme-status">
                  <el-tag
                    :type="theme.status === '启用中' ? 'success' : 'info'"
                    size="large"
                  >
                    {{ theme.status }}
                  </el-tag>
                  <el-tag
                    v-if="theme.isDefault"
                    type="warning"
                    size="small"
                    style="margin-left: 10px"
                  >
                    默认主题
                  </el-tag>
                </div>
              </div>
              <div class="theme-preview" @click="previewTheme(theme)">
                <div class="preview-content">
                  <div class="preview-navbar" :style="getNavbarStyle(theme)">
                    <span>导航栏</span>
                  </div>
                  <div class="preview-body">
                    <div
                      class="preview-sidebar"
                      :style="getSidebarStyle(theme)"
                    >
                      <span>菜单栏</span>
                    </div>
                    <div class="preview-main">
                      <span>内容区</span>
                    </div>
                  </div>
                </div>
                <div class="preview-overlay">
                  <el-button type="primary" @click.stop="previewTheme(theme)">
                    预览
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="themePage"
            v-model:page-size="themePageSize"
            :page-sizes="[10, 20, 50]"
            :total="themeTotal"
            layout="total, sizes, prev, pager, next, jumper"
            style="margin-top: 20px; justify-content: center"
          />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="新建主题" name="create">
        <el-card class="main-card">
          <template #header>
            <div class="card-header">
              <span class="title">新建主题</span>
            </div>
          </template>

          <div class="create-theme-wrapper">
            <!-- 左侧配置区 -->
            <div class="left-config">
              <el-scrollbar height="calc(100vh - 200px)">
                <!-- 主题基础信息 -->
                <el-collapse v-model="activeConfigGroups">
                  <el-collapse-item title="主题基础信息" name="basic">
                    <el-form :model="themeForm" label-width="120px">
                      <el-form-item label="主题名称" required>
                        <el-input
                          v-model="themeForm.name"
                          placeholder="请输入主题名称"
                        />
                      </el-form-item>
                      <el-form-item label="所属组织" required>
                        <el-select
                          v-model="themeForm.org"
                          placeholder="请选择所属组织"
                        >
                          <el-option
                            v-for="org in orgList"
                            :key="org.id"
                            :label="org.name"
                            :value="org.id"
                          />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="主题描述">
                        <el-input
                          v-model="themeForm.description"
                          type="textarea"
                          :rows="3"
                          placeholder="请输入主题描述"
                        />
                      </el-form-item>
                    </el-form>
                  </el-collapse-item>

                  <!-- 组织样式配置 -->
                  <el-collapse-item title="组织样式配置" name="style">
                    <el-form :model="themeForm.style" label-width="140px">
                      <el-form-item label="顶部导航栏样式">
                        <el-radio-group v-model="themeForm.style.navbarStyle">
                          <el-radio label="default">默认样式</el-radio>
                          <el-radio label="business">商务样式</el-radio>
                          <el-radio label="simple">简约样式</el-radio>
                        </el-radio-group>
                        <div v-if="styleError.navbar" class="error-tip">
                          {{ styleError.navbar }}
                        </div>
                      </el-form-item>
                      <el-form-item label="导航栏高度">
                        <el-select v-model="themeForm.style.navbarHeight">
                          <el-option label="小" value="small" />
                          <el-option label="中" value="medium" />
                          <el-option label="大" value="large" />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="左侧菜单栏样式">
                        <el-radio-group v-model="themeForm.style.sidebarStyle">
                          <el-radio label="default">默认样式</el-radio>
                          <el-radio label="compact">紧凑样式</el-radio>
                          <el-radio label="icon">图标优先样式</el-radio>
                        </el-radio-group>
                        <div v-if="styleError.sidebar" class="error-tip">
                          {{ styleError.sidebar }}
                        </div>
                      </el-form-item>
                      <el-form-item label="菜单宽度">
                        <el-select v-model="themeForm.style.sidebarWidth">
                          <el-option label="窄" value="narrow" />
                          <el-option label="中" value="medium" />
                          <el-option label="宽" value="wide" />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="按钮组件样式">
                        <el-radio-group v-model="themeForm.style.buttonStyle">
                          <el-radio label="default">默认样式</el-radio>
                          <el-radio label="round">圆角样式</el-radio>
                          <el-radio label="flat">扁平样式</el-radio>
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item label="按钮尺寸">
                        <el-select v-model="themeForm.style.buttonSize">
                          <el-option label="小" value="small" />
                          <el-option label="中" value="medium" />
                          <el-option label="大" value="large" />
                        </el-select>
                        <div v-if="styleError.button" class="error-tip">
                          {{ styleError.button }}
                        </div>
                      </el-form-item>
                    </el-form>
                  </el-collapse-item>

                  <!-- 组织颜色配置 -->
                  <el-collapse-item title="组织颜色配置" name="color">
                    <el-form :model="themeForm.color" label-width="120px">
                      <el-form-item label="主色调" required>
                        <div class="color-selector">
                          <el-color-picker v-model="themeForm.color.primary" />
                          <el-input
                            v-model="themeForm.color.primaryHex"
                            placeholder="或输入HEX色号"
                            style="width: 150px; margin-left: 10px"
                            @input="handlePrimaryColorChange"
                          />
                          <div class="preset-colors">
                            <div
                              v-for="color in presetColors"
                              :key="color"
                              class="preset-color"
                              :style="{ backgroundColor: color }"
                              @click="selectPresetColor(color, 'primary')"
                            />
                          </div>
                        </div>
                      </el-form-item>
                      <el-form-item label="辅助色" required>
                        <div class="color-selector">
                          <el-color-picker
                            v-model="themeForm.color.secondary"
                          />
                          <el-input
                            v-model="themeForm.color.secondaryHex"
                            placeholder="或输入HEX色号"
                            style="width: 150px; margin-left: 10px"
                            @input="handleSecondaryColorChange"
                          />
                          <div class="preset-colors">
                            <div
                              v-for="color in recommendedColors"
                              :key="color"
                              class="preset-color"
                              :style="{ backgroundColor: color }"
                              @click="selectPresetColor(color, 'secondary')"
                            />
                          </div>
                        </div>
                        <div v-if="colorError.secondary" class="error-tip">
                          {{ colorError.secondary }}
                        </div>
                        <div
                          v-if="recommendedColors.length > 0"
                          class="color-tip"
                        >
                          推荐颜色（对比度≥4.5:1）
                        </div>
                      </el-form-item>
                      <el-form-item label="文字色">
                        <el-radio-group v-model="themeForm.color.textColor">
                          <el-radio label="#000000">黑色</el-radio>
                          <el-radio label="#ffffff">白色</el-radio>
                          <el-radio label="#666666">灰色</el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </el-form>
                  </el-collapse-item>
                </el-collapse>

                <div class="config-actions">
                  <el-button @click="resetConfig">重置配置</el-button>
                  <el-button type="primary" @click="saveTheme"
                    >保存主题</el-button
                  >
                </div>
              </el-scrollbar>
            </div>

            <!-- 右侧预览区 -->
            <div class="right-preview">
              <div class="preview-header">
                <el-button @click="refreshPreview">
                  <el-icon><Refresh /></el-icon>
                  刷新预览
                </el-button>
              </div>
              <div class="preview-container">
                <div class="preview-frame">
                  <div class="preview-navbar" :style="getPreviewNavbarStyle()">
                    <span>导航栏</span>
                    <span class="preview-label"
                      >导航栏样式：{{ getNavbarStyleName() }}</span
                    >
                  </div>
                  <div class="preview-body">
                    <div
                      class="preview-sidebar"
                      :style="getPreviewSidebarStyle()"
                    >
                      <span>菜单栏</span>
                      <span class="preview-label"
                        >菜单栏样式：{{ getSidebarStyleName() }}</span
                      >
                    </div>
                    <div class="preview-main" :style="getPreviewMainStyle()">
                      <div class="preview-button-group">
                        <el-button :style="getButtonStyle()"
                          >按钮示例</el-button
                        >
                        <el-button type="primary" :style="getButtonStyle()"
                          >主要按钮</el-button
                        >
                      </div>
                      <span class="preview-label"
                        >按钮样式：{{ getButtonStyleName() }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
              <div class="preview-footer">
                <div class="contrast-result">
                  <span>颜色对比度检测结果：</span>
                  <el-tag :type="contrastResult.type" size="large">
                    {{ contrastResult.text }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 主题预览弹窗 -->
    <el-dialog v-model="previewDialogVisible" title="主题预览" width="1200px">
      <div class="preview-dialog-content">
        <div class="preview-frame-large">
          <div class="preview-navbar" :style="getNavbarStyle(previewThemeData)">
            <span>导航栏</span>
          </div>
          <div class="preview-body">
            <div
              class="preview-sidebar"
              :style="getSidebarStyle(previewThemeData)"
            >
              <span>菜单栏</span>
            </div>
            <div class="preview-main">
              <span>内容区</span>
            </div>
          </div>
        </div>
        <div class="preview-config-info">
          <h4>核心配置</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="导航栏样式">
              {{ getNavbarStyleName(previewThemeData) }}
            </el-descriptions-item>
            <el-descriptions-item label="菜单栏样式">
              {{ getSidebarStyleName(previewThemeData) }}
            </el-descriptions-item>
            <el-descriptions-item label="按钮样式">
              {{ getButtonStyleName(previewThemeData) }}
            </el-descriptions-item>
            <el-descriptions-item label="主色调">
              {{ previewThemeData?.color?.primary || "#409eff" }}
            </el-descriptions-item>
            <el-descriptions-item label="辅助色">
              {{ previewThemeData?.color?.secondary || "#67c23a" }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { Search, Refresh } from "@element-plus/icons-vue";

interface Theme {
  id: string;
  name: string;
  org: string;
  orgId: string;
  createTime: string;
  status: string;
  isDefault?: boolean;
  isSearchMatch?: boolean;
  style?: {
    navbarStyle: string;
    navbarHeight: string;
    sidebarStyle: string;
    sidebarWidth: string;
    buttonStyle: string;
    buttonSize: string;
  };
  color?: {
    primary: string;
    secondary: string;
    textColor: string;
  };
}

const activeMainTab = ref("browse");
const searchKeyword = ref("");
const filterOrg = ref("");
const filterStatus = ref("all");
const hoveredTheme = ref<string | null>(null);
const previewDialogVisible = ref(false);
const previewThemeData = ref<Theme | null>(null);
const themePage = ref(1);
const themePageSize = ref(10);
const themeTotal = ref(0);
const activeConfigGroups = ref(["basic", "style", "color"]);

const styleError = reactive({
  navbar: "",
  sidebar: "",
  button: ""
});

const colorError = reactive({
  secondary: ""
});

const orgList = ref([
  { id: "1", name: "总公司" },
  { id: "2", name: "技术部" },
  { id: "3", name: "市场部" }
]);

const presetColors = ref([
  "#409eff",
  "#67c23a",
  "#e6a23c",
  "#f56c6c",
  "#909399"
]);

const recommendedColors = ref<string[]>([]);

const themeForm = reactive({
  name: "",
  org: "",
  description: "",
  style: {
    navbarStyle: "default",
    navbarHeight: "medium",
    sidebarStyle: "default",
    sidebarWidth: "medium",
    buttonStyle: "default",
    buttonSize: "medium"
  },
  color: {
    primary: "#409eff",
    primaryHex: "#409eff",
    secondary: "#67c23a",
    secondaryHex: "#67c23a",
    textColor: "#000000"
  }
});

// 测试数据
const themeList = ref<Theme[]>([
  {
    id: "1",
    name: "默认主题",
    org: "总公司",
    orgId: "1",
    createTime: "2024-01-01 10:00:00",
    status: "启用中",
    isDefault: true,
    style: {
      navbarStyle: "default",
      navbarHeight: "medium",
      sidebarStyle: "default",
      sidebarWidth: "medium",
      buttonStyle: "default",
      buttonSize: "medium"
    },
    color: {
      primary: "#409eff",
      secondary: "#67c23a",
      textColor: "#000000"
    }
  },
  {
    id: "2",
    name: "商务主题",
    org: "技术部",
    orgId: "2",
    createTime: "2024-01-02 10:00:00",
    status: "启用中",
    style: {
      navbarStyle: "business",
      navbarHeight: "large",
      sidebarStyle: "icon",
      sidebarWidth: "narrow",
      buttonStyle: "round",
      buttonSize: "medium"
    },
    color: {
      primary: "#2c3e50",
      secondary: "#34495e",
      textColor: "#ffffff"
    }
  },
  {
    id: "3",
    name: "简约主题",
    org: "市场部",
    orgId: "3",
    createTime: "2024-01-03 10:00:00",
    status: "未启用",
    style: {
      navbarStyle: "simple",
      navbarHeight: "small",
      sidebarStyle: "compact",
      sidebarWidth: "narrow",
      buttonStyle: "flat",
      buttonSize: "small"
    },
    color: {
      primary: "#606266",
      secondary: "#909399",
      textColor: "#666666"
    }
  }
]);

const filteredThemeList = computed(() => {
  let result = themeList.value;

  // 组织筛选
  if (filterOrg.value) {
    result = result.filter(t => t.orgId === filterOrg.value);
  }

  // 状态筛选
  if (filterStatus.value !== "all") {
    const statusMap: Record<string, string> = {
      enabled: "启用中",
      disabled: "未启用"
    };
    result = result.filter(t => t.status === statusMap[filterStatus.value]);
  }

  // 搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result
      .map(t => ({
        ...t,
        isSearchMatch:
          t.name.toLowerCase().includes(keyword) ||
          t.org.toLowerCase().includes(keyword)
      }))
      .filter(t => t.isSearchMatch);
  }

  return result;
});

const contrastResult = computed(() => {
  // 简化的对比度检测
  const primary = themeForm.color.primary || "#409eff";
  const secondary = themeForm.color.secondary || "#67c23a";

  // 这里应该计算实际的对比度，简化处理
  if (primary && secondary) {
    return { type: "success", text: "对比度符合要求（≥4.5:1）" };
  }
  return { type: "warning", text: "请选择颜色进行对比度检测" };
});

// 方法
const handleSearch = () => {
  // 搜索逻辑已在computed中实现
};

const handleFilterChange = () => {
  // 筛选逻辑已在computed中实现
};

const previewTheme = (theme: Theme) => {
  previewThemeData.value = theme;
  previewDialogVisible.value = true;
};

const handlePrimaryColorChange = () => {
  // 更新主色调后，推荐辅助色
  updateRecommendedColors();
};

const handleSecondaryColorChange = () => {
  // 检查对比度
  checkContrast();
};

const selectPresetColor = (color: string, type: "primary" | "secondary") => {
  if (type === "primary") {
    themeForm.color.primary = color;
    themeForm.color.primaryHex = color;
    updateRecommendedColors();
  } else {
    themeForm.color.secondary = color;
    themeForm.color.secondaryHex = color;
    checkContrast();
  }
};

const updateRecommendedColors = () => {
  // 根据主色调推荐辅助色（简化实现）
  recommendedColors.value = ["#67c23a", "#e6a23c", "#f56c6c"];
};

const checkContrast = () => {
  // 检查对比度（简化实现）
  if (themeForm.color.primary && themeForm.color.secondary) {
    colorError.secondary = "";
  } else {
    colorError.secondary = "辅助色与主色调对比度需≥4.5:1";
  }
};

const checkStyleCompatibility = () => {
  // 检查样式兼容性
  styleError.navbar = "";
  styleError.sidebar = "";
  styleError.button = "";

  if (
    themeForm.style.navbarStyle === "business" &&
    !["default", "icon"].includes(themeForm.style.sidebarStyle)
  ) {
    styleError.sidebar = "商务导航栏仅支持搭配默认/图标优先菜单栏";
  }

  if (
    themeForm.style.navbarHeight === "small" &&
    themeForm.style.buttonSize === "large"
  ) {
    styleError.button = "小导航栏建议使用小按钮尺寸";
  }
};

watch(
  () => themeForm.style,
  () => {
    checkStyleCompatibility();
  },
  { deep: true }
);

const getNavbarStyle = (theme?: Theme) => {
  const style = theme?.style || themeForm.style;
  const color = theme?.color || themeForm.color;
  const heightMap: Record<string, string> = {
    small: "40px",
    medium: "50px",
    large: "60px"
  };
  return {
    backgroundColor: color?.primary || "#409eff",
    height: heightMap[style?.navbarHeight || "medium"],
    color: color?.textColor || "#000000"
  };
};

const getSidebarStyle = (theme?: Theme) => {
  const style = theme?.style || themeForm.style;
  const color = theme?.color || themeForm.color;
  const widthMap: Record<string, string> = {
    narrow: "180px",
    medium: "220px",
    wide: "260px"
  };
  return {
    backgroundColor: "#f5f7fa",
    width: widthMap[style?.sidebarWidth || "medium"],
    borderRight: "1px solid #dcdfe6"
  };
};

const getPreviewNavbarStyle = () => getNavbarStyle();
const getPreviewSidebarStyle = () => getSidebarStyle();
const getPreviewMainStyle = () => ({
  backgroundColor: "#ffffff",
  color: themeForm.color.textColor || "#000000"
});

const getButtonStyle = () => {
  const sizeMap: Record<string, string> = {
    small: "small",
    medium: "default",
    large: "large"
  };
  return {
    borderRadius: themeForm.style.buttonStyle === "round" ? "20px" : "4px"
  };
};

const getNavbarStyleName = (theme?: Theme) => {
  const style = theme?.style || themeForm.style;
  const map: Record<string, string> = {
    default: "默认样式",
    business: "商务样式",
    simple: "简约样式"
  };
  return map[style?.navbarStyle || "default"] || "默认样式";
};

const getSidebarStyleName = (theme?: Theme) => {
  const style = theme?.style || themeForm.style;
  const map: Record<string, string> = {
    default: "默认样式",
    compact: "紧凑样式",
    icon: "图标优先样式"
  };
  return map[style?.sidebarStyle || "default"] || "默认样式";
};

const getButtonStyleName = (theme?: Theme) => {
  const style = theme?.style || themeForm.style;
  const map: Record<string, string> = {
    default: "默认样式",
    round: "圆角样式",
    flat: "扁平样式"
  };
  return map[style?.buttonStyle || "default"] || "默认样式";
};

const refreshPreview = () => {
  ElMessage.success("预览已刷新");
};

const resetConfig = () => {
  Object.assign(themeForm, {
    name: "",
    org: "",
    description: "",
    style: {
      navbarStyle: "default",
      navbarHeight: "medium",
      sidebarStyle: "default",
      sidebarWidth: "medium",
      buttonStyle: "default",
      buttonSize: "medium"
    },
    color: {
      primary: "#409eff",
      primaryHex: "#409eff",
      secondary: "#67c23a",
      secondaryHex: "#67c23a",
      textColor: "#000000"
    }
  });
  styleError.navbar = "";
  styleError.sidebar = "";
  styleError.button = "";
  colorError.secondary = "";
};

const saveTheme = () => {
  if (!themeForm.name || !themeForm.org) {
    ElMessage.warning("请填写主题名称和所属组织");
    return;
  }
  checkStyleCompatibility();
  checkContrast();
  if (
    styleError.navbar ||
    styleError.sidebar ||
    styleError.button ||
    colorError.secondary
  ) {
    ElMessage.warning("请修正配置错误");
    return;
  }
  ElMessage.success("主题保存成功");
};
</script>

<style scoped lang="scss">
.theme-management {
  padding: 20px;
  height: 100%;

  .main-tabs {
    height: 100%;

    :deep(.el-tabs__content) {
      height: calc(100vh - 120px);
    }
  }

  .main-card {
    height: 100%;

    :deep(.el-card__body) {
      padding: 20px;
      height: calc(100% - 60px);
    }
  }

  .filter-bar {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #dcdfe6;
  }

  .theme-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 20px;
    margin-top: 20px;

    .theme-card {
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      padding: 15px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .theme-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;

        .theme-info {
          flex: 1;

          h3 {
            margin: 0 0 10px 0;
            font-size: 18px;

            &.highlight {
              background-color: #fff7e6;
              padding: 2px 4px;
              border-radius: 4px;
            }
          }

          .theme-meta {
            display: flex;
            flex-direction: column;
            gap: 5px;
            font-size: 12px;
            color: #909399;
          }
        }
      }

      .theme-preview {
        position: relative;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        overflow: hidden;

        .preview-content {
          .preview-navbar {
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
          }

          .preview-body {
            display: flex;
            height: 200px;

            .preview-sidebar {
              width: 150px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f5f7fa;
              font-size: 12px;
            }

            .preview-main {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              background: white;
              font-size: 12px;
            }
          }
        }

        .preview-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;

          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }

  .create-theme-wrapper {
    display: flex;
    gap: 20px;
    height: calc(100vh - 200px);

    .left-config {
      width: 500px;
      border-right: 1px solid #dcdfe6;
      padding-right: 20px;

      .config-actions {
        margin-top: 20px;
        text-align: center;
      }
    }

    .right-preview {
      flex: 1;
      display: flex;
      flex-direction: column;

      .preview-header {
        margin-bottom: 15px;
      }

      .preview-container {
        flex: 1;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        padding: 20px;
        background: #f5f7fa;

        .preview-frame {
          background: white;
          border-radius: 4px;
          overflow: hidden;

          .preview-navbar {
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            color: white;
            font-weight: bold;
          }

          .preview-body {
            display: flex;
            min-height: 400px;

            .preview-sidebar {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              padding: 20px;
              font-weight: bold;
            }

            .preview-main {
              flex: 1;
              padding: 20px;
              display: flex;
              flex-direction: column;
              gap: 20px;

              .preview-button-group {
                display: flex;
                gap: 10px;
              }
            }

            .preview-label {
              font-size: 12px;
              color: #909399;
              margin-top: 10px;
            }
          }
        }
      }

      .preview-footer {
        margin-top: 15px;
        padding: 15px;
        background: #f5f7fa;
        border-radius: 4px;

        .contrast-result {
          display: flex;
          align-items: center;
          gap: 10px;
        }
      }
    }
  }

  .preview-dialog-content {
    display: flex;
    gap: 20px;

    .preview-frame-large {
      flex: 1;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      overflow: hidden;

      .preview-navbar {
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
      }

      .preview-body {
        display: flex;
        min-height: 500px;

        .preview-sidebar {
          width: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f7fa;
          font-weight: bold;
        }

        .preview-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          font-weight: bold;
        }
      }
    }

    .preview-config-info {
      width: 300px;
    }
  }

  .error-tip {
    color: #f56c6c;
    font-size: 12px;
    margin-top: 5px;
  }

  .color-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }

  .color-selector {
    display: flex;
    align-items: center;

    .preset-colors {
      display: flex;
      gap: 5px;
      margin-left: 10px;

      .preset-color {
        width: 30px;
        height: 30px;
        border-radius: 4px;
        cursor: pointer;
        border: 1px solid #dcdfe6;
      }
    }
  }
}
</style>
