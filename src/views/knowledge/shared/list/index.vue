<template>
  <div class="knowledge-list">
    <div class="list-header">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建知识库
      </el-button>
    </div>
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="最热访问" name="hot">
        <div class="tab-content">
          <div class="time-filter">
            <el-radio-group
              v-model="timeRange"
              size="small"
              @change="handleTimeChange"
            >
              <el-radio-button label="week">周</el-radio-button>
              <el-radio-button label="month">月</el-radio-button>
              <el-radio-button label="quarter">季度</el-radio-button>
            </el-radio-group>
          </div>

          <div class="knowledge-cards">
            <el-card
              v-for="(item, index) in hotList"
              :key="item.id"
              class="knowledge-card"
              :class="getCardClass(index)"
              shadow="hover"
            >
              <div class="rank-badge">{{ index + 1 }}</div>
              <div class="card-content">
                <div class="card-header">
                  <span class="knowledge-name">{{ item.name }}</span>
                  <el-tag type="danger" size="small">热门</el-tag>
                </div>
                <div class="card-description">{{ item.description }}</div>
                <div class="card-stats">
                  <span>访问量：{{ item.visitCount }}</span>
                  <span>更新时间：{{ item.updateTime }}</span>
                </div>
                <div class="card-tags">
                  <el-tag
                    v-for="tag in item.tags"
                    :key="tag"
                    size="small"
                    class="tag-item"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
              <div class="card-actions">
                <el-button link type="primary" @click="handleFavorite(item)">
                  收藏
                </el-button>
                <el-button link type="primary" @click="handlePreview(item)">
                  预览
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="最近更新" name="recent">
        <div class="tab-content">
          <div class="time-filter">
            <el-radio-group v-model="recentTimeRange" size="small">
              <el-radio-button label="7">近7天</el-radio-button>
              <el-radio-button label="30">近30天</el-radio-button>
              <el-radio-button label="90">近90天</el-radio-button>
            </el-radio-group>
            <el-select
              v-model="updateTypeFilter"
              placeholder="更新类型"
              clearable
              size="small"
              style="width: 150px; margin-left: 10px"
            >
              <el-option label="新增内容" value="new" />
              <el-option label="内容优化" value="optimize" />
              <el-option label="错误修正" value="fix" />
              <el-option label="重大更新" value="major" />
            </el-select>
          </div>

          <div class="update-list">
            <el-card
              v-for="item in recentList"
              :key="item.id"
              class="update-card"
              shadow="hover"
            >
              <div class="update-time">{{ item.updateTime }}</div>
              <div class="card-content">
                <div class="card-header">
                  <span class="knowledge-name">{{ item.name }}</span>
                  <el-tag
                    :type="getUpdateTypeTag(item.updateType)"
                    size="small"
                  >
                    {{ getUpdateTypeText(item.updateType) }}
                  </el-tag>
                  <el-tag
                    v-if="isNewUpdate(item.updateTime)"
                    type="success"
                    size="small"
                  >
                    新
                  </el-tag>
                </div>
                <div class="card-description">{{ item.description }}</div>
                <div class="card-footer">
                  <span>更新人：{{ item.updater }}</span>
                  <span>关联业务系统：{{ item.businessSystem }}</span>
                </div>
              </div>
              <div class="card-actions">
                <el-button link type="primary" @click="handleViewUpdate(item)">
                  查看更新
                </el-button>
                <el-button link type="primary" @click="handleSubscribe(item)">
                  订阅提醒
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="最热收藏" name="favorite">
        <div class="tab-content">
          <div class="sort-filter">
            <el-select
              v-model="favoriteSortType"
              placeholder="排序方式"
              size="small"
              style="width: 150px"
            >
              <el-option label="全组织收藏量" value="all" />
              <el-option label="本部门收藏量" value="dept" />
              <el-option label="专家收藏量" value="expert" />
            </el-select>
          </div>

          <div class="favorite-list">
            <el-card
              v-for="item in favoriteList"
              :key="item.id"
              class="favorite-card"
              shadow="hover"
            >
              <div class="favorite-badge">
                <el-icon><Star /></el-icon>
                <span>热门收藏</span>
              </div>
              <div class="card-content">
                <div class="card-header">
                  <span class="knowledge-name">{{ item.name }}</span>
                  <el-tag
                    v-if="item.expertRecommended"
                    type="warning"
                    size="small"
                  >
                    专家推荐
                  </el-tag>
                </div>
                <div class="card-description">{{ item.description }}</div>
                <div class="favorite-stats">
                  <span>收藏量：{{ item.favoriteCount }}+</span>
                  <span>专家收藏：{{ item.expertCount }}人</span>
                </div>
              </div>
              <div class="card-actions">
                <el-button link type="primary" @click="handleFavorite(item)">
                  收藏
                </el-button>
                <el-button link type="primary" @click="handlePreview(item)">
                  预览
                </el-button>
                <el-button link type="primary" @click="handleShare(item)">
                  分享
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Star, Plus } from "@element-plus/icons-vue";

const router = useRouter();
const activeTab = ref("hot");
const timeRange = ref("month");
const recentTimeRange = ref("30");
const updateTypeFilter = ref("");
const favoriteSortType = ref("all");

// 最热访问列表测试数据
const hotList = ref([
  {
    id: "1",
    name: "DNS解析失败故障处理手册",
    description: "详细介绍了DNS解析失败的排查步骤和处理方法",
    visitCount: 1256,
    updateTime: "2025-11-24",
    tags: ["高频故障", "新手必备"]
  },
  {
    id: "2",
    name: "路由器OSPF协议配置指南",
    description: "OSPF协议配置的完整指南，包含参数说明和最佳实践",
    visitCount: 892,
    updateTime: "2025-11-23",
    tags: ["专家推荐"]
  },
  {
    id: "3",
    name: "Linux服务器端口占用排查",
    description: "快速定位占用端口的进程，使用netstat、lsof等命令",
    visitCount: 756,
    updateTime: "2025-11-22",
    tags: ["高频故障"]
  }
]);

// 最近更新列表测试数据
const recentList = ref([
  {
    id: "1",
    name: "核心路由器配置手册",
    description: "更新了NE40E路由器的配置参数和故障处理流程",
    updateTime: "2025-11-24 15:30",
    updateType: "major",
    updater: "张三",
    businessSystem: "核心路由器"
  },
  {
    id: "2",
    name: "Linux系统优化指南",
    description: "新增了系统性能调优章节，优化了命令示例",
    updateTime: "2025-11-23 10:20",
    updateType: "optimize",
    updater: "李四",
    businessSystem: "服务器运维"
  },
  {
    id: "3",
    name: "防火墙规则配置",
    description: "修正了ACL规则配置中的错误示例",
    updateTime: "2025-11-22 14:15",
    updateType: "fix",
    updater: "王五",
    businessSystem: "安全防护"
  }
]);

// 最热收藏列表测试数据
const favoriteList = ref([
  {
    id: "1",
    name: "复杂故障处理宝典",
    description: "汇集了各种复杂故障的处理方案和专家经验",
    favoriteCount: 120,
    expertCount: 30,
    expertRecommended: true
  },
  {
    id: "2",
    name: "核心设备配置手册",
    description: "核心网络设备的详细配置文档和操作指南",
    favoriteCount: 89,
    expertCount: 25,
    expertRecommended: true
  },
  {
    id: "3",
    name: "Linux命令速查手册",
    description: "常用Linux命令的快速参考和示例",
    favoriteCount: 156,
    expertCount: 15,
    expertRecommended: false
  }
]);

// 卡片样式
const getCardClass = (index: number) => {
  if (index < 3) return "top-three";
  if (index < 10) return "top-ten";
  return "";
};

// 更新类型标签
const getUpdateTypeTag = (type: string) => {
  const map: Record<string, string> = {
    new: "success",
    optimize: "primary",
    fix: "warning",
    major: "danger"
  };
  return map[type] || "";
};

const getUpdateTypeText = (type: string) => {
  const map: Record<string, string> = {
    new: "新增内容",
    optimize: "内容优化",
    fix: "错误修正",
    major: "重大更新"
  };
  return map[type] || "";
};

// 是否为新更新（7天内）
const isNewUpdate = (time: string) => {
  const updateDate = new Date(time);
  const now = new Date();
  const diff = now.getTime() - updateDate.getTime();
  return diff < 7 * 24 * 60 * 60 * 1000;
};

// 操作
const handleCreate = () => {
  router.push("/knowledge-base/shared/create");
};

const handleTabChange = (tab: string) => {
  // 切换标签页时重新加载数据
};

const handleTimeChange = () => {
  // 时间范围改变时重新加载数据
};

const handleFavorite = (item: any) => {
  ElMessage.success(`已收藏 ${item.name}`);
};

const handlePreview = (item: any) => {
  ElMessage.info(`预览 ${item.name}`);
};

const handleViewUpdate = (item: any) => {
  ElMessage.info(`查看更新记录 ${item.name}`);
};

const handleSubscribe = (item: any) => {
  ElMessage.success(`已订阅 ${item.name} 的更新提醒`);
};

const handleShare = (item: any) => {
  ElMessage.info(`分享 ${item.name}`);
};
</script>

<style scoped lang="scss">
.knowledge-list {
  .list-header {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .tab-content {
    padding: 20px 0;

    .time-filter,
    .sort-filter {
      margin-bottom: 20px;
    }

    .knowledge-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;

      .knowledge-card {
        position: relative;
        transition: all 0.3s;

        &.top-three {
          background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
        }

        &.top-ten {
          background: linear-gradient(135deg, #fef0f0 0%, #ffffff 100%);
        }

        .rank-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          width: 30px;
          height: 30px;
          background: #f56c6c;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .card-content {
          margin-left: 50px;

          .card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;

            .knowledge-name {
              font-size: 16px;
              font-weight: bold;
            }
          }

          .card-description {
            color: #606266;
            font-size: 14px;
            margin-bottom: 10px;
            line-height: 1.6;
          }

          .card-stats {
            font-size: 12px;
            color: #909399;
            margin-bottom: 10px;
            display: flex;
            gap: 15px;
          }

          .card-tags {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
          }
        }

        .card-actions {
          margin-top: 10px;
          display: flex;
          gap: 10px;
        }
      }
    }

    .update-list,
    .favorite-list {
      .update-card,
      .favorite-card {
        margin-bottom: 15px;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .update-time {
          font-size: 12px;
          color: #909399;
          margin-bottom: 10px;
        }

        .favorite-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #e6a23c;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .card-content {
          .card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;

            .knowledge-name {
              font-size: 16px;
              font-weight: bold;
            }
          }

          .card-description {
            color: #606266;
            font-size: 14px;
            margin-bottom: 10px;
            line-height: 1.6;
          }

          .card-footer {
            font-size: 12px;
            color: #909399;
            display: flex;
            gap: 20px;
          }

          .favorite-stats {
            font-size: 14px;
            color: #606266;
            display: flex;
            gap: 20px;
            margin-top: 10px;
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
}
</style>
