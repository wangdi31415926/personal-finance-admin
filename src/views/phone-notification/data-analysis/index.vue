<template>
  <div class="data-analysis">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 呼叫统计 -->
      <el-tab-pane label="呼叫统计" name="call">
        <el-tabs v-model="callActiveTab" type="card">
          <!-- 号码呼叫情况统计 -->
          <el-tab-pane label="号码呼叫情况统计" name="detail">
            <div class="call-detail-statistics">
              <!-- 筛选条件 -->
              <el-card class="filter-card" shadow="never">
                <el-form :model="callFilterForm" inline class="filter-form">
                  <el-form-item label="时间范围">
                    <el-date-picker
                      v-model="callFilterForm.dateRange"
                      type="datetimerange"
                      range-separator="至"
                      start-placeholder="开始时间"
                      end-placeholder="结束时间"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 380px"
                    />
                    <el-button-group style="margin-left: 10px">
                      <el-button size="small" @click="setQuickDate('today')"
                        >今天</el-button
                      >
                      <el-button size="small" @click="setQuickDate('week')"
                        >最近7天</el-button
                      >
                      <el-button size="small" @click="setQuickDate('month')"
                        >最近30天</el-button
                      >
                    </el-button-group>
                  </el-form-item>
                  <el-form-item label="被叫号码">
                    <el-input
                      v-model="callFilterForm.phone"
                      placeholder="请输入号码"
                      clearable
                      style="width: 200px"
                    />
                  </el-form-item>
                  <el-form-item label="呼叫结果">
                    <el-select
                      v-model="callFilterForm.result"
                      placeholder="全部"
                      clearable
                      multiple
                      style="width: 250px"
                    >
                      <el-option label="成功接听" value="success" />
                      <el-option label="无人接听" value="no_answer" />
                      <el-option label="忙线" value="busy" />
                      <el-option label="号码无效" value="invalid" />
                      <el-option label="系统挂机" value="system_hangup" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="关联任务">
                    <el-input
                      v-model="callFilterForm.taskName"
                      placeholder="任务名称"
                      clearable
                      style="width: 200px"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="handleCallSearch">
                      <el-icon><Search /></el-icon>
                      查询
                    </el-button>
                    <el-button @click="handleCallReset">
                      <el-icon><Refresh /></el-icon>
                      重置
                    </el-button>
                    <el-button @click="handleCallExport">
                      <el-icon><Download /></el-icon>
                      导出
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-card>

              <!-- 核心指标卡片 -->
              <el-row :gutter="20" class="statistics-row">
                <el-col :span="6">
                  <el-card class="stat-card">
                    <div class="stat-content">
                      <div class="stat-label">总呼叫次数</div>
                      <div class="stat-value">{{ callStatistics.total }}</div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="6">
                  <el-card class="stat-card">
                    <div class="stat-content">
                      <div class="stat-label">当前筛选数量</div>
                      <div class="stat-value info">
                        {{ filteredCallRecords.length }}
                      </div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="6">
                  <el-card class="stat-card">
                    <div class="stat-content">
                      <div class="stat-label">成功率</div>
                      <div class="stat-value success">
                        {{ callStatistics.successRate }}%
                      </div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="6">
                  <el-card class="stat-card">
                    <div class="stat-content">
                      <div class="stat-label">平均通话时长</div>
                      <div class="stat-value">
                        {{ callStatistics.avgDuration }}秒
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>

              <!-- 可视化图表 -->
              <el-row :gutter="20" class="charts-row">
                <el-col :span="12">
                  <el-card>
                    <template #header>
                      <div class="card-header">呼叫结果分布</div>
                    </template>
                    <div
                      ref="resultDistributionChartRef"
                      style="height: 300px"
                    ></div>
                  </el-card>
                </el-col>
                <el-col :span="12">
                  <el-card>
                    <template #header>
                      <div class="card-header">24小时接通趋势</div>
                    </template>
                    <div ref="hourlyTrendChartRef" style="height: 300px"></div>
                  </el-card>
                </el-col>
              </el-row>

              <!-- 明细列表 -->
              <el-card class="table-card" shadow="never">
                <el-table
                  :data="paginatedCallRecords"
                  style="width: 100%"
                  stripe
                  border
                  :default-sort="{ prop: 'callTime', order: 'descending' }"
                >
                  <el-table-column
                    prop="callTime"
                    label="呼叫时间"
                    width="180"
                    sortable
                  />
                  <el-table-column prop="phone" label="被叫号码" width="150" />
                  <el-table-column
                    prop="contactName"
                    label="联系人"
                    width="120"
                  />
                  <el-table-column
                    prop="taskName"
                    label="关联任务"
                    min-width="200"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="alertTitle"
                    label="关联告警"
                    min-width="200"
                    show-overflow-tooltip
                  />
                  <el-table-column prop="result" label="呼叫结果" width="120">
                    <template #default="{ row }">
                      <el-tag
                        :type="getResultType(row.result)"
                        :effect="'dark'"
                      >
                        {{ getResultText(row.result) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="duration"
                    label="通话时长(秒)"
                    width="130"
                  />
                  <el-table-column
                    prop="ringDuration"
                    label="振铃时长(秒)"
                    width="130"
                  />
                  <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                      <el-button
                        link
                        type="primary"
                        size="small"
                        @click="handleViewCallDetail(row)"
                      >
                        查看详情
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <div class="pagination-container">
                  <el-pagination
                    v-model:current-page="callPagination.page"
                    v-model:page-size="callPagination.size"
                    :page-sizes="[10, 20, 50, 100]"
                    :total="callPagination.total"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleCallSizeChange"
                    @current-change="handleCallPageChange"
                  />
                </div>
              </el-card>
            </div>
          </el-tab-pane>

          <!-- 号码呼叫情况汇总 -->
          <el-tab-pane label="号码呼叫情况汇总" name="summary">
            <div class="call-summary-statistics">
              <!-- 统计卡片 -->
              <el-row :gutter="20" class="statistics-row">
                <el-col :span="8">
                  <el-card class="stat-card">
                    <div class="stat-content">
                      <div class="stat-label">统计号码总数</div>
                      <div class="stat-value">
                        {{ summaryStatistics.totalPhones }}
                      </div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card class="stat-card">
                    <div class="stat-content">
                      <div class="stat-label">平均号码接通率</div>
                      <div class="stat-value success">
                        {{ summaryStatistics.avgSuccessRate }}%
                      </div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card class="stat-card">
                    <div class="stat-content">
                      <div class="stat-label">总呼叫次数</div>
                      <div class="stat-value">
                        {{ summaryStatistics.totalCalls }}
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>

              <!-- 汇总列表 -->
              <el-card class="table-card" shadow="never">
                <div class="table-toolbar">
                  <el-button @click="handleExportSummary">
                    <el-icon><Download /></el-icon>
                    导出汇总列表
                  </el-button>
                </div>
                <el-table
                  :data="phoneSummaryList"
                  style="width: 100%"
                  stripe
                  border
                  :default-sort="{ prop: 'totalCalls', order: 'descending' }"
                >
                  <el-table-column prop="phone" label="被叫号码" width="150" />
                  <el-table-column
                    prop="contactName"
                    label="联系人姓名"
                    width="150"
                  />
                  <el-table-column
                    prop="totalCalls"
                    label="总呼叫次数"
                    width="120"
                    sortable
                  />
                  <el-table-column
                    prop="successCalls"
                    label="接通次数"
                    width="120"
                    sortable
                  />
                  <el-table-column
                    prop="successRate"
                    label="历史接通率"
                    width="130"
                    sortable
                  >
                    <template #default="{ row }">
                      <span :class="getSuccessRateClass(row.successRate)">
                        {{ row.successRate }}%
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="noAnswerCount"
                    label="无人接听次数"
                    width="140"
                    sortable
                  />
                  <el-table-column
                    prop="busyCount"
                    label="忙线次数"
                    width="120"
                    sortable
                  />
                  <el-table-column
                    prop="lastCallTime"
                    label="最后呼叫时间"
                    width="180"
                    sortable
                  />
                  <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                      <el-button
                        link
                        type="primary"
                        size="small"
                        @click="handleViewPhoneDetail(row)"
                      >
                        查看明细
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <!-- 任务分析 -->
      <el-tab-pane label="任务分析" name="task">
        <div class="task-analysis">
          <!-- 任务查询 -->
          <el-card class="filter-card" shadow="never">
            <el-form :model="taskFilterForm" inline class="filter-form">
              <el-form-item label="任务名称">
                <el-input
                  v-model="taskFilterForm.taskName"
                  placeholder="任务名称"
                  clearable
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item label="创建时间">
                <el-date-picker
                  v-model="taskFilterForm.dateRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 380px"
                />
              </el-form-item>
              <el-form-item label="任务状态">
                <el-select
                  v-model="taskFilterForm.status"
                  placeholder="全部"
                  clearable
                  multiple
                  style="width: 200px"
                >
                  <el-option label="待呼叫" value="pending" />
                  <el-option label="呼叫中" value="calling" />
                  <el-option label="已完成" value="completed" />
                  <el-option label="已失败" value="failed" />
                </el-select>
              </el-form-item>
              <el-form-item label="关联告警">
                <el-input
                  v-model="taskFilterForm.alertTitle"
                  placeholder="告警标题"
                  clearable
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleTaskSearch">
                  <el-icon><Search /></el-icon>
                  查询
                </el-button>
                <el-button @click="handleTaskReset">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 任务明细列表 -->
          <el-card class="table-card" shadow="never">
            <el-table
              :data="filteredTaskList"
              style="width: 100%"
              stripe
              border
            >
              <el-table-column
                prop="taskName"
                label="任务名称"
                min-width="200"
                show-overflow-tooltip
              />
              <el-table-column prop="alertTitle" label="关联告警" width="200" />
              <el-table-column prop="status" label="任务状态" width="120">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)" :effect="'dark'">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="calledCount"
                label="已呼号码"
                width="120"
              />
              <el-table-column
                prop="successCount"
                label="成功接通"
                width="120"
              />
              <el-table-column prop="createTime" label="创建时间" width="180" />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button
                    link
                    type="primary"
                    size="small"
                    @click="handleViewTaskAnalysis(row)"
                  >
                    查看分析
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 任务分析弹窗 -->
    <el-dialog
      v-model="taskAnalysisDialogVisible"
      title="任务分析详情"
      width="90%"
      :close-on-click-modal="false"
      @opened="handleTaskAnalysisDialogOpened"
      @close="handleTaskAnalysisDialogClose"
    >
      <div class="task-analysis-dialog" v-if="currentAnalysisTask">
        <!-- 基础数据统计 -->
        <el-card class="statistics-card" shadow="never">
          <template #header>
            <div class="card-header">任务基础数据统计</div>
          </template>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-label">任务总数</div>
                <div class="stat-value">{{ dialogTaskStatistics.total }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-label">已呼号码数量</div>
                <div class="stat-value">
                  {{ dialogTaskStatistics.calledCount }}
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-label">成功接通数</div>
                <div class="stat-value success">
                  {{ dialogTaskStatistics.successCount }}
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-label">未接听数</div>
                <div class="stat-value warning">
                  {{ dialogTaskStatistics.noAnswerCount }}
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-label">平均呼叫尝试次数</div>
                <div class="stat-value">
                  {{ dialogTaskStatistics.avgRetryCount }}
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-label">任务完成耗时(分钟)</div>
                <div class="stat-value">
                  {{ dialogTaskStatistics.avgDuration }}
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 任务分类统计 -->
        <el-card class="charts-card" shadow="never">
          <template #header>
            <div class="card-header">任务分类统计</div>
          </template>
          <el-row :gutter="20">
            <el-col :span="12">
              <div ref="dialogTaskCategoryChartRef" style="height: 350px"></div>
            </el-col>
            <el-col :span="12">
              <div ref="dialogAlertLevelChartRef" style="height: 350px"></div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 通话时间分布 -->
        <el-card class="charts-card" shadow="never">
          <template #header>
            <div class="card-header">通话时间分布</div>
          </template>
          <div ref="dialogTimeDistributionChartRef" style="height: 400px"></div>
        </el-card>

        <!-- 热门问题统计 -->
        <el-card class="charts-card" shadow="never">
          <template #header>
            <div class="card-header">热门问题统计</div>
          </template>
          <el-row :gutter="20">
            <el-col :span="12">
              <div ref="dialogHotQuestionsChartRef" style="height: 350px"></div>
            </el-col>
            <el-col :span="12">
              <div class="hot-questions-list">
                <div class="list-header">Top 10 用户高频问题</div>
                <el-table :data="hotQuestionsList" border stripe>
                  <el-table-column type="index" label="排名" width="60" />
                  <el-table-column
                    prop="question"
                    label="问题内容"
                    min-width="200"
                  />
                  <el-table-column prop="count" label="出现次数" width="120" />
                  <el-table-column prop="rate" label="占比" width="100">
                    <template #default="{ row }"> {{ row.rate }}% </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 通话区域分布 -->
        <el-card class="charts-card" shadow="never">
          <template #header>
            <div class="card-header">通话区域分布</div>
          </template>
          <div
            ref="dialogRegionDistributionChartRef"
            style="height: 500px"
          ></div>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Search, Refresh, Download } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import * as echarts from "echarts";

interface CallRecord {
  id: string;
  callTime: string;
  phone: string;
  contactName: string;
  taskName: string;
  alertTitle: string;
  result: "success" | "no_answer" | "busy" | "invalid" | "system_hangup";
  duration: number;
  ringDuration: number;
}

interface PhoneSummary {
  phone: string;
  contactName: string;
  totalCalls: number;
  successCalls: number;
  successRate: number;
  noAnswerCount: number;
  busyCount: number;
  lastCallTime: string;
}

interface TaskRecord {
  id: string;
  taskName: string;
  alertTitle: string;
  status: string;
  calledCount: number;
  successCount: number;
  createTime: string;
  alertLevel?: string;
  taskType?: string;
}

const activeTab = ref("call");
const callActiveTab = ref("detail");

// 呼叫统计相关
const callFilterForm = reactive({
  dateRange: [] as string[],
  phone: "",
  result: [] as string[],
  taskName: ""
});

const callPagination = reactive({
  page: 1,
  size: 20,
  total: 0
});

// 测试数据 - 呼叫记录
const callRecords = ref<CallRecord[]>([
  {
    id: "1",
    callTime: "2024-01-15 14:30:25",
    phone: "13800138000",
    contactName: "张三",
    taskName: "告警-【核心路由器宕机】-2024-01-15 14:30",
    alertTitle: "核心路由器宕机",
    result: "success",
    duration: 120,
    ringDuration: 5
  },
  {
    id: "2",
    callTime: "2024-01-15 14:25:10",
    phone: "13900139000",
    contactName: "李四",
    taskName: "告警-【服务器CPU使用率超过90%】-2024-01-15 14:25",
    alertTitle: "服务器CPU使用率超过90%",
    result: "success",
    duration: 95,
    ringDuration: 3
  },
  {
    id: "3",
    callTime: "2024-01-15 14:20:05",
    phone: "13700137000",
    contactName: "王五",
    taskName: "告警-【数据库连接池耗尽】-2024-01-15 14:20",
    alertTitle: "数据库连接池耗尽",
    result: "no_answer",
    duration: 0,
    ringDuration: 30
  },
  {
    id: "4",
    callTime: "2024-01-15 14:15:00",
    phone: "13600136000",
    contactName: "赵六",
    taskName: "告警-【网络延迟异常】-2024-01-15 14:15",
    alertTitle: "网络延迟异常",
    result: "busy",
    duration: 0,
    ringDuration: 0
  },
  {
    id: "5",
    callTime: "2024-01-15 14:10:30",
    phone: "13500135000",
    contactName: "孙七",
    taskName: "告警-【存储空间不足】-2024-01-15 14:10",
    alertTitle: "存储空间不足",
    result: "no_answer",
    duration: 0,
    ringDuration: 30
  },
  {
    id: "6",
    callTime: "2024-01-15 13:50:15",
    phone: "13400134000",
    contactName: "周八",
    taskName: "告警-【应用服务异常】-2024-01-15 13:50",
    alertTitle: "应用服务异常",
    result: "success",
    duration: 85,
    ringDuration: 4
  },
  {
    id: "7",
    callTime: "2024-01-15 13:30:20",
    phone: "13300133000",
    contactName: "吴九",
    taskName: "告警-【安全漏洞检测】-2024-01-15 13:30",
    alertTitle: "安全漏洞检测",
    result: "success",
    duration: 150,
    ringDuration: 6
  },
  {
    id: "8",
    callTime: "2024-01-15 13:10:45",
    phone: "13200132000",
    contactName: "郑十",
    taskName: "告警-【备份任务失败】-2024-01-15 13:10",
    alertTitle: "备份任务失败",
    result: "invalid",
    duration: 0,
    ringDuration: 0
  }
]);

// 生成更多测试数据
for (let i = 9; i <= 50; i++) {
  const results: Array<
    "success" | "no_answer" | "busy" | "invalid" | "system_hangup"
  > = ["success", "no_answer", "busy", "invalid", "system_hangup"];
  const phones = [
    "13800138000",
    "13900139000",
    "13700137000",
    "13600136000",
    "13500135000",
    "13400134000",
    "13300133000",
    "13200132000"
  ];
  const names = [
    "张三",
    "李四",
    "王五",
    "赵六",
    "孙七",
    "周八",
    "吴九",
    "郑十"
  ];
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  const date = dayjs()
    .subtract(Math.floor(Math.random() * 7), "day")
    .hour(hours)
    .minute(minutes)
    .second(Math.floor(Math.random() * 60));

  callRecords.value.push({
    id: String(i),
    callTime: date.format("YYYY-MM-DD HH:mm:ss"),
    phone: phones[Math.floor(Math.random() * phones.length)],
    contactName: names[Math.floor(Math.random() * names.length)],
    taskName: `告警-【测试告警${i}】-${date.format("YYYY-MM-DD HH:mm")}`,
    alertTitle: `测试告警${i}`,
    result: results[Math.floor(Math.random() * results.length)],
    duration: Math.floor(Math.random() * 200),
    ringDuration: Math.floor(Math.random() * 30)
  });
}

const filteredCallRecords = computed(() => {
  let result = [...callRecords.value];

  if (callFilterForm.dateRange && callFilterForm.dateRange.length === 2) {
    result = result.filter(record => {
      const callTime = dayjs(record.callTime);
      return (
        callTime.isAfter(dayjs(callFilterForm.dateRange[0])) &&
        callTime.isBefore(dayjs(callFilterForm.dateRange[1]))
      );
    });
  }

  if (callFilterForm.phone) {
    result = result.filter(record =>
      record.phone.includes(callFilterForm.phone)
    );
  }

  if (callFilterForm.result && callFilterForm.result.length > 0) {
    result = result.filter(record =>
      callFilterForm.result.includes(record.result)
    );
  }

  if (callFilterForm.taskName) {
    result = result.filter(record =>
      record.taskName.includes(callFilterForm.taskName)
    );
  }

  return result;
});

const paginatedCallRecords = computed(() => {
  callPagination.total = filteredCallRecords.value.length;
  const start = (callPagination.page - 1) * callPagination.size;
  const end = start + callPagination.size;
  return filteredCallRecords.value.slice(start, end);
});

const callStatistics = computed(() => {
  const total = filteredCallRecords.value.length;
  const success = filteredCallRecords.value.filter(
    r => r.result === "success"
  ).length;
  const successRate = total > 0 ? Math.round((success / total) * 100) : 0;
  const totalDuration = filteredCallRecords.value
    .filter(r => r.result === "success")
    .reduce((sum, r) => sum + r.duration, 0);
  const avgDuration = success > 0 ? Math.round(totalDuration / success) : 0;

  return {
    total,
    successRate,
    avgDuration
  };
});

// 号码汇总数据
const phoneSummaryList = computed(() => {
  const phoneMap = new Map<string, PhoneSummary>();

  callRecords.value.forEach(record => {
    if (!phoneMap.has(record.phone)) {
      phoneMap.set(record.phone, {
        phone: record.phone,
        contactName: record.contactName,
        totalCalls: 0,
        successCalls: 0,
        successRate: 0,
        noAnswerCount: 0,
        busyCount: 0,
        lastCallTime: record.callTime
      });
    }

    const summary = phoneMap.get(record.phone)!;
    summary.totalCalls++;
    if (record.result === "success") {
      summary.successCalls++;
    } else if (record.result === "no_answer") {
      summary.noAnswerCount++;
    } else if (record.result === "busy") {
      summary.busyCount++;
    }
    if (dayjs(record.callTime).isAfter(dayjs(summary.lastCallTime))) {
      summary.lastCallTime = record.callTime;
    }
  });

  const summaries = Array.from(phoneMap.values());
  summaries.forEach(summary => {
    summary.successRate =
      summary.totalCalls > 0
        ? Math.round((summary.successCalls / summary.totalCalls) * 100)
        : 0;
  });

  return summaries.sort((a, b) => b.totalCalls - a.totalCalls);
});

const summaryStatistics = computed(() => {
  const totalPhones = phoneSummaryList.value.length;
  const totalCalls = phoneSummaryList.value.reduce(
    (sum, p) => sum + p.totalCalls,
    0
  );
  const avgSuccessRate =
    totalPhones > 0
      ? Math.round(
          phoneSummaryList.value.reduce((sum, p) => sum + p.successRate, 0) /
            totalPhones
        )
      : 0;

  return {
    totalPhones,
    avgSuccessRate,
    totalCalls
  };
});

// 任务分析相关
const taskFilterForm = reactive({
  taskName: "",
  dateRange: [] as string[],
  status: [] as string[],
  alertTitle: ""
});

// 任务分析弹窗相关
const taskAnalysisDialogVisible = ref(false);
const currentAnalysisTask = ref<TaskRecord | null>(null);

const taskList = ref<TaskRecord[]>([
  {
    id: "1",
    taskName: "告警-【核心路由器宕机】-2024-01-15 14:30",
    alertTitle: "核心路由器宕机",
    status: "completed",
    calledCount: 5,
    successCount: 3,
    createTime: "2024-01-15 14:30:25",
    alertLevel: "P0",
    taskType: "故障通知"
  },
  {
    id: "2",
    taskName: "告警-【服务器CPU使用率超过90%】-2024-01-15 14:25",
    alertTitle: "服务器CPU使用率超过90%",
    status: "calling",
    calledCount: 3,
    successCount: 2,
    createTime: "2024-01-15 14:25:10",
    alertLevel: "P1",
    taskType: "性能告警"
  },
  {
    id: "3",
    taskName: "告警-【数据库连接池耗尽】-2024-01-15 14:20",
    alertTitle: "数据库连接池耗尽",
    status: "failed",
    calledCount: 4,
    successCount: 1,
    createTime: "2024-01-15 14:20:05",
    alertLevel: "P1",
    taskType: "系统告警"
  },
  {
    id: "4",
    taskName: "告警-【网络延迟异常】-2024-01-15 14:15",
    alertTitle: "网络延迟异常",
    status: "pending",
    calledCount: 0,
    successCount: 0,
    createTime: "2024-01-15 14:15:00",
    alertLevel: "P2",
    taskType: "网络告警"
  },
  {
    id: "5",
    taskName: "告警-【存储空间不足】-2024-01-15 13:50",
    alertTitle: "存储空间不足",
    status: "completed",
    calledCount: 6,
    successCount: 5,
    createTime: "2024-01-15 13:50:30",
    alertLevel: "P1",
    taskType: "存储告警"
  },
  {
    id: "6",
    taskName: "告警-【应用服务异常】-2024-01-15 13:30",
    alertTitle: "应用服务异常",
    status: "completed",
    calledCount: 4,
    successCount: 3,
    createTime: "2024-01-15 13:30:20",
    alertLevel: "P0",
    taskType: "故障通知"
  },
  {
    id: "7",
    taskName: "告警-【安全漏洞检测】-2024-01-15 13:10",
    alertTitle: "安全漏洞检测",
    status: "calling",
    calledCount: 3,
    successCount: 2,
    createTime: "2024-01-15 13:10:15",
    alertLevel: "P1",
    taskType: "安全告警"
  },
  {
    id: "8",
    taskName: "告警-【备份任务失败】-2024-01-15 12:50",
    alertTitle: "备份任务失败",
    status: "completed",
    calledCount: 2,
    successCount: 2,
    createTime: "2024-01-15 12:50:45",
    alertLevel: "P2",
    taskType: "备份告警"
  },
  {
    id: "9",
    taskName: "告警-【内存使用率过高】-2024-01-15 12:30",
    alertTitle: "内存使用率过高",
    status: "completed",
    calledCount: 5,
    successCount: 4,
    createTime: "2024-01-15 12:30:10",
    alertLevel: "P1",
    taskType: "性能告警"
  },
  {
    id: "10",
    taskName: "告警-【磁盘IO异常】-2024-01-15 12:10",
    alertTitle: "磁盘IO异常",
    status: "failed",
    calledCount: 4,
    successCount: 1,
    createTime: "2024-01-15 12:10:25",
    alertLevel: "P1",
    taskType: "系统告警"
  },
  {
    id: "11",
    taskName: "告警-【负载均衡器故障】-2024-01-15 11:50",
    alertTitle: "负载均衡器故障",
    status: "completed",
    calledCount: 7,
    successCount: 6,
    createTime: "2024-01-15 11:50:30",
    alertLevel: "P0",
    taskType: "故障通知"
  },
  {
    id: "12",
    taskName: "告警-【API响应超时】-2024-01-15 11:30",
    alertTitle: "API响应超时",
    status: "calling",
    calledCount: 3,
    successCount: 2,
    createTime: "2024-01-15 11:30:15",
    alertLevel: "P2",
    taskType: "性能告警"
  },
  {
    id: "13",
    taskName: "告警-【数据库主从同步延迟】-2024-01-15 11:10",
    alertTitle: "数据库主从同步延迟",
    status: "completed",
    calledCount: 4,
    successCount: 3,
    createTime: "2024-01-15 11:10:40",
    alertLevel: "P1",
    taskType: "系统告警"
  },
  {
    id: "14",
    taskName: "告警-【防火墙规则异常】-2024-01-15 10:50",
    alertTitle: "防火墙规则异常",
    status: "completed",
    calledCount: 3,
    successCount: 3,
    createTime: "2024-01-15 10:50:20",
    alertLevel: "P2",
    taskType: "安全告警"
  },
  {
    id: "15",
    taskName: "告警-【缓存服务异常】-2024-01-15 10:30",
    alertTitle: "缓存服务异常",
    status: "failed",
    calledCount: 5,
    successCount: 2,
    createTime: "2024-01-15 10:30:10",
    alertLevel: "P1",
    taskType: "系统告警"
  },
  {
    id: "16",
    taskName: "告警-【消息队列堆积】-2024-01-15 10:10",
    alertTitle: "消息队列堆积",
    status: "completed",
    calledCount: 4,
    successCount: 3,
    createTime: "2024-01-15 10:10:50",
    alertLevel: "P1",
    taskType: "性能告警"
  },
  {
    id: "17",
    taskName: "告警-【SSL证书即将过期】-2024-01-15 09:50",
    alertTitle: "SSL证书即将过期",
    status: "completed",
    calledCount: 2,
    successCount: 2,
    createTime: "2024-01-15 09:50:30",
    alertLevel: "P2",
    taskType: "安全告警"
  },
  {
    id: "18",
    taskName: "告警-【CDN节点故障】-2024-01-15 09:30",
    alertTitle: "CDN节点故障",
    status: "calling",
    calledCount: 6,
    successCount: 4,
    createTime: "2024-01-15 09:30:15",
    alertLevel: "P1",
    taskType: "网络告警"
  },
  {
    id: "19",
    taskName: "告警-【日志服务异常】-2024-01-15 09:10",
    alertTitle: "日志服务异常",
    status: "completed",
    calledCount: 3,
    successCount: 2,
    createTime: "2024-01-15 09:10:25",
    alertLevel: "P2",
    taskType: "系统告警"
  },
  {
    id: "20",
    taskName: "告警-【监控系统告警】-2024-01-15 08:50",
    alertTitle: "监控系统告警",
    status: "completed",
    calledCount: 4,
    successCount: 4,
    createTime: "2024-01-15 08:50:40",
    alertLevel: "P2",
    taskType: "监控告警"
  }
]);

const filteredTaskList = computed(() => {
  let result = [...taskList.value];

  if (taskFilterForm.taskName) {
    result = result.filter(task =>
      task.taskName.includes(taskFilterForm.taskName)
    );
  }

  if (taskFilterForm.dateRange && taskFilterForm.dateRange.length === 2) {
    result = result.filter(task => {
      const createTime = dayjs(task.createTime);
      return (
        createTime.isAfter(dayjs(taskFilterForm.dateRange[0])) &&
        createTime.isBefore(dayjs(taskFilterForm.dateRange[1]))
      );
    });
  }

  if (taskFilterForm.status && taskFilterForm.status.length > 0) {
    result = result.filter(task => taskFilterForm.status.includes(task.status));
  }

  if (taskFilterForm.alertTitle) {
    result = result.filter(task =>
      task.alertTitle.includes(taskFilterForm.alertTitle)
    );
  }

  return result;
});

// 弹窗中的任务统计（基于当前分析的任务）
const dialogTaskStatistics = computed(() => {
  if (!currentAnalysisTask.value) {
    return {
      total: 0,
      calledCount: 0,
      successCount: 0,
      noAnswerCount: 0,
      avgRetryCount: "0",
      avgDuration: 0
    };
  }

  const task = currentAnalysisTask.value;
  const calledCount = task.calledCount;
  const successCount = task.successCount;
  const noAnswerCount = calledCount - successCount;
  const avgRetryCount = calledCount > 0 ? (calledCount / 1).toFixed(1) : "0";
  const avgDuration = Math.round(Math.random() * 60 + 10);

  return {
    total: 1,
    calledCount,
    successCount,
    noAnswerCount,
    avgRetryCount,
    avgDuration
  };
});

const hotQuestionsList = ref([
  { question: "故障是否已经修复？", count: 45, rate: 23.5 },
  { question: "需要我做什么？", count: 38, rate: 19.8 },
  { question: "影响范围有多大？", count: 32, rate: 16.7 },
  { question: "预计多久能恢复？", count: 28, rate: 14.6 },
  { question: "是否需要升级处理？", count: 22, rate: 11.5 },
  { question: "有没有备份方案？", count: 18, rate: 9.4 },
  { question: "其他系统是否受影响？", count: 15, rate: 7.8 },
  { question: "需要通知哪些人？", count: 12, rate: 6.3 },
  { question: "历史是否有类似问题？", count: 8, rate: 4.2 },
  { question: "如何预防此类问题？", count: 5, rate: 2.6 }
]);

// 图表引用
const resultDistributionChartRef = ref();
const hourlyTrendChartRef = ref();
// 弹窗中的图表引用
const dialogTaskCategoryChartRef = ref();
const dialogAlertLevelChartRef = ref();
const dialogTimeDistributionChartRef = ref();
const dialogHotQuestionsChartRef = ref();
const dialogRegionDistributionChartRef = ref();

// 工具函数
const getResultType = (result: string) => {
  const typeMap: Record<string, string> = {
    success: "success",
    no_answer: "warning",
    busy: "warning",
    invalid: "danger",
    system_hangup: "info"
  };
  return typeMap[result] || "info";
};

const getResultText = (result: string) => {
  const textMap: Record<string, string> = {
    success: "成功接听",
    no_answer: "无人接听",
    busy: "忙线",
    invalid: "号码无效",
    system_hangup: "系统挂机"
  };
  return textMap[result] || result;
};

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: "info",
    calling: "warning",
    completed: "success",
    failed: "danger"
  };
  return typeMap[status] || "info";
};

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: "待呼叫",
    calling: "呼叫中",
    completed: "已完成",
    failed: "已失败"
  };
  return textMap[status] || status;
};

const getSuccessRateClass = (rate: number) => {
  if (rate >= 80) return "success-rate-high";
  if (rate >= 50) return "success-rate-medium";
  return "success-rate-low";
};

const setQuickDate = (type: string) => {
  const now = dayjs();
  let start: dayjs.Dayjs;

  switch (type) {
    case "today":
      start = now.startOf("day");
      break;
    case "week":
      start = now.subtract(7, "day");
      break;
    case "month":
      start = now.subtract(30, "day");
      break;
    default:
      start = now.startOf("day");
  }

  callFilterForm.dateRange = [
    start.format("YYYY-MM-DD HH:mm:ss"),
    now.format("YYYY-MM-DD HH:mm:ss")
  ];
};

// 事件处理
const handleCallSearch = () => {
  callPagination.page = 1;
  ElMessage.success("查询成功");
};

const handleCallReset = () => {
  callFilterForm.dateRange = [];
  callFilterForm.phone = "";
  callFilterForm.result = [];
  callFilterForm.taskName = "";
  callPagination.page = 1;
};

const handleCallExport = () => {
  ElMessage.success("导出功能开发中");
};

const handleCallSizeChange = (size: number) => {
  callPagination.size = size;
  callPagination.page = 1;
};

const handleCallPageChange = (page: number) => {
  callPagination.page = page;
};

const handleViewCallDetail = (row: CallRecord) => {
  ElMessage.info(`查看呼叫详情: ${row.id}`);
};

const handleExportSummary = () => {
  ElMessage.success("导出汇总列表成功");
};

const handleViewPhoneDetail = (row: PhoneSummary) => {
  callActiveTab.value = "detail";
  callFilterForm.phone = row.phone;
  handleCallSearch();
};

const handleTaskSearch = () => {
  ElMessage.success("查询成功");
};

const handleTaskReset = () => {
  taskFilterForm.taskName = "";
  taskFilterForm.dateRange = [];
  taskFilterForm.status = [];
  taskFilterForm.alertTitle = "";
};

const handleViewTaskAnalysis = (row: TaskRecord) => {
  currentAnalysisTask.value = row;
  taskAnalysisDialogVisible.value = true;
};

const handleTaskAnalysisDialogOpened = () => {
  nextTick(() => {
    initDialogTaskCharts();
  });
};

const handleTaskAnalysisDialogClose = () => {
  currentAnalysisTask.value = null;
  // 销毁图表实例
  if (dialogTaskCategoryChartRef.value) {
    const chart = echarts.getInstanceByDom(dialogTaskCategoryChartRef.value);
    if (chart) chart.dispose();
  }
  if (dialogAlertLevelChartRef.value) {
    const chart = echarts.getInstanceByDom(dialogAlertLevelChartRef.value);
    if (chart) chart.dispose();
  }
  if (dialogTimeDistributionChartRef.value) {
    const chart = echarts.getInstanceByDom(
      dialogTimeDistributionChartRef.value
    );
    if (chart) chart.dispose();
  }
  if (dialogHotQuestionsChartRef.value) {
    const chart = echarts.getInstanceByDom(dialogHotQuestionsChartRef.value);
    if (chart) chart.dispose();
  }
  if (dialogRegionDistributionChartRef.value) {
    const chart = echarts.getInstanceByDom(
      dialogRegionDistributionChartRef.value
    );
    if (chart) chart.dispose();
  }
};

// 初始化图表
const initCallCharts = () => {
  nextTick(() => {
    // 呼叫结果分布环形图
    if (resultDistributionChartRef.value) {
      const chart = echarts.init(resultDistributionChartRef.value);
      const resultCounts = {
        success: filteredCallRecords.value.filter(r => r.result === "success")
          .length,
        no_answer: filteredCallRecords.value.filter(
          r => r.result === "no_answer"
        ).length,
        busy: filteredCallRecords.value.filter(r => r.result === "busy").length,
        invalid: filteredCallRecords.value.filter(r => r.result === "invalid")
          .length,
        system_hangup: filteredCallRecords.value.filter(
          r => r.result === "system_hangup"
        ).length
      };

      chart.setOption({
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
          orient: "vertical",
          left: "left",
          data: ["成功接听", "无人接听", "忙线", "号码无效", "系统挂机"]
        },
        series: [
          {
            name: "呼叫结果",
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: "{b}: {c}\n({d}%)"
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: "bold"
              }
            },
            data: [
              {
                value: resultCounts.success,
                name: "成功接听",
                itemStyle: { color: "#67c23a" }
              },
              {
                value: resultCounts.no_answer,
                name: "无人接听",
                itemStyle: { color: "#e6a23c" }
              },
              {
                value: resultCounts.busy,
                name: "忙线",
                itemStyle: { color: "#f56c6c" }
              },
              {
                value: resultCounts.invalid,
                name: "号码无效",
                itemStyle: { color: "#909399" }
              },
              {
                value: resultCounts.system_hangup,
                name: "系统挂机",
                itemStyle: { color: "#409eff" }
              }
            ]
          }
        ]
      });
    }

    // 24小时接通趋势
    if (hourlyTrendChartRef.value) {
      const chart = echarts.init(hourlyTrendChartRef.value);
      const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      const callCounts = Array.from({ length: 24 }, () => 0);
      const successCounts = Array.from({ length: 24 }, () => 0);

      filteredCallRecords.value.forEach(record => {
        const hour = dayjs(record.callTime).hour();
        callCounts[hour]++;
        if (record.result === "success") {
          successCounts[hour]++;
        }
      });

      chart.setOption({
        tooltip: {
          trigger: "axis"
        },
        legend: {
          data: ["呼叫尝试次数", "成功接通次数"]
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: hours
        },
        yAxis: {
          type: "value"
        },
        series: [
          {
            name: "呼叫尝试次数",
            type: "line",
            data: callCounts,
            itemStyle: { color: "#409eff" }
          },
          {
            name: "成功接通次数",
            type: "line",
            data: successCounts,
            itemStyle: { color: "#67c23a" }
          }
        ]
      });
    }
  });
};

// 初始化弹窗中的任务分析图表
const initDialogTaskCharts = () => {
  nextTick(() => {
    if (!currentAnalysisTask.value) return;

    const task = currentAnalysisTask.value;

    // 任务分类统计 - 显示所有任务的数据聚合
    if (dialogTaskCategoryChartRef.value) {
      const chart = echarts.init(dialogTaskCategoryChartRef.value);
      const categoryMap = new Map<string, number>();

      // 统计所有任务按类型的数量
      taskList.value.forEach(t => {
        const type = t.taskType || "其他";
        categoryMap.set(type, (categoryMap.get(type) || 0) + 1);
      });

      // 按数量排序
      const sortedCategories = Array.from(categoryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(item => item[0]);
      const sortedValues = Array.from(categoryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(item => item[1]);

      chart.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          },
          formatter: function (params: any) {
            const param = params[0];
            return `${param.name}<br/>任务数量: ${param.value}`;
          }
        },
        legend: {
          data: ["任务数量"]
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: {
          type: "category",
          data: sortedCategories,
          axisLabel: {
            rotate: 45,
            interval: 0
          }
        },
        yAxis: {
          type: "value",
          name: "任务数量"
        },
        series: [
          {
            name: "任务数量",
            type: "bar",
            data: sortedValues,
            itemStyle: {
              color: function (params: any) {
                const colors = [
                  "#409eff",
                  "#67c23a",
                  "#e6a23c",
                  "#f56c6c",
                  "#909399",
                  "#9c27b0",
                  "#ff9800",
                  "#00bcd4"
                ];
                return colors[params.dataIndex % colors.length];
              }
            },
            label: {
              show: true,
              position: "top"
            }
          }
        ]
      });
    }

    // 告警级别统计 - 显示所有任务的数据聚合
    if (dialogAlertLevelChartRef.value) {
      const chart = echarts.init(dialogAlertLevelChartRef.value);
      const levelMap = new Map<string, { total: number; success: number }>();

      // 统计所有任务按告警级别的数据
      taskList.value.forEach(t => {
        const level = t.alertLevel || "其他";
        if (!levelMap.has(level)) {
          levelMap.set(level, { total: 0, success: 0 });
        }
        const data = levelMap.get(level)!;
        data.total += t.calledCount;
        data.success += t.successCount;
      });

      // 按级别排序 (P0, P1, P2, 其他)
      const levelOrder = ["P0", "P1", "P2", "P3", "其他"];
      const sortedLevels = Array.from(levelMap.keys()).sort((a, b) => {
        const indexA =
          levelOrder.indexOf(a) !== -1 ? levelOrder.indexOf(a) : 999;
        const indexB =
          levelOrder.indexOf(b) !== -1 ? levelOrder.indexOf(b) : 999;
        return indexA - indexB;
      });

      chart.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          },
          formatter: function (params: any) {
            let result = `${params[0].name}<br/>`;
            params.forEach((param: any) => {
              result += `${param.seriesName}: ${param.value}<br/>`;
            });
            return result;
          }
        },
        legend: {
          data: ["总呼叫数", "成功接通数"]
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: {
          type: "category",
          data: sortedLevels
        },
        yAxis: {
          type: "value",
          name: "呼叫次数"
        },
        series: [
          {
            name: "总呼叫数",
            type: "bar",
            data: sortedLevels.map(level => levelMap.get(level)!.total),
            itemStyle: { color: "#409eff" },
            label: {
              show: true,
              position: "top"
            }
          },
          {
            name: "成功接通数",
            type: "bar",
            data: sortedLevels.map(level => levelMap.get(level)!.success),
            itemStyle: { color: "#67c23a" },
            label: {
              show: true,
              position: "top"
            }
          }
        ]
      });
    }

    // 通话时间分布热力图
    if (dialogTimeDistributionChartRef.value) {
      const chart = echarts.init(dialogTimeDistributionChartRef.value);
      const hours = Array.from({ length: 24 }, (_, i) => i);
      const weekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
      const data: Array<[number, number, number]> = [];

      // 生成模拟数据
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          const count = Math.floor(Math.random() * 20);
          data.push([day, hour, count]);
        }
      }

      chart.setOption({
        tooltip: {
          position: "top",
          formatter: function (params: any) {
            return `${weekdays[params.data[0]]} ${params.data[1]}:00<br/>通话次数: ${params.data[2]}`;
          }
        },
        grid: {
          height: "50%",
          top: "10%"
        },
        xAxis: {
          type: "category",
          data: hours,
          splitArea: {
            show: true
          }
        },
        yAxis: {
          type: "category",
          data: weekdays,
          splitArea: {
            show: true
          }
        },
        visualMap: {
          min: 0,
          max: 20,
          calculable: true,
          orient: "horizontal",
          left: "center",
          bottom: "15%",
          inRange: {
            color: ["#e0f3ff", "#409eff"]
          }
        },
        series: [
          {
            name: "通话次数",
            type: "heatmap",
            data: data,
            label: {
              show: true
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            }
          }
        ]
      });
    }

    // 热门问题词云（用柱状图代替）
    if (dialogHotQuestionsChartRef.value) {
      const chart = echarts.init(dialogHotQuestionsChartRef.value);
      chart.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          }
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: {
          type: "value"
        },
        yAxis: {
          type: "category",
          data: hotQuestionsList.value.map(q => q.question)
        },
        series: [
          {
            name: "出现次数",
            type: "bar",
            data: hotQuestionsList.value.map(q => q.count),
            itemStyle: { color: "#409eff" }
          }
        ]
      });
    }

    // 通话区域分布（简化版，用柱状图代替地图）
    if (dialogRegionDistributionChartRef.value) {
      const chart = echarts.init(dialogRegionDistributionChartRef.value);
      const regions = [
        "北京",
        "上海",
        "广州",
        "深圳",
        "杭州",
        "成都",
        "武汉",
        "西安"
      ];
      const callCounts = regions.map(() =>
        Math.floor(Math.random() * 100 + 50)
      );
      const successRates = regions.map(() =>
        Math.floor(Math.random() * 30 + 70)
      );

      chart.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          }
        },
        legend: {
          data: ["通话量", "接通率"]
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: {
          type: "category",
          data: regions
        },
        yAxis: [
          {
            type: "value",
            name: "通话量",
            position: "left"
          },
          {
            type: "value",
            name: "接通率(%)",
            position: "right",
            max: 100
          }
        ],
        series: [
          {
            name: "通话量",
            type: "bar",
            data: callCounts,
            itemStyle: { color: "#409eff" }
          },
          {
            name: "接通率",
            type: "line",
            yAxisIndex: 1,
            data: successRates,
            itemStyle: { color: "#67c23a" }
          }
        ]
      });
    }
  });
};

onMounted(() => {
  initCallCharts();
});
</script>

<style scoped lang="scss">
.data-analysis {
  padding: 20px;
  height: 100%;

  .filter-card {
    margin-bottom: 20px;

    .filter-form {
      :deep(.el-form-item) {
        margin-bottom: 10px;
      }
    }
  }

  .statistics-row {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 10px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;

          &.success {
            color: #67c23a;
          }

          &.info {
            color: #409eff;
          }

          &.warning {
            color: #e6a23c;
          }

          &.danger {
            color: #f56c6c;
          }
        }
      }
    }
  }

  .charts-row {
    margin-bottom: 20px;
  }

  .table-card {
    margin-bottom: 20px;

    .table-toolbar {
      margin-bottom: 15px;
    }

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }

  .card-header {
    font-weight: 500;
    font-size: 16px;
  }

  .statistics-card {
    margin-bottom: 20px;

    .stat-item {
      text-align: center;
      padding: 20px;

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 10px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #303133;

        &.success {
          color: #67c23a;
        }

        &.warning {
          color: #e6a23c;
        }
      }
    }
  }

  .charts-card {
    margin-bottom: 20px;
  }

  .task-analysis-dialog {
    .statistics-card,
    .charts-card {
      margin-bottom: 20px;
    }
  }

  .hot-questions-list {
    .list-header {
      font-weight: 500;
      margin-bottom: 15px;
      font-size: 14px;
    }
  }

  .success-rate-high {
    color: #67c23a;
    font-weight: bold;
  }

  .success-rate-medium {
    color: #e6a23c;
    font-weight: bold;
  }

  .success-rate-low {
    color: #f56c6c;
    font-weight: bold;
  }
}
</style>
