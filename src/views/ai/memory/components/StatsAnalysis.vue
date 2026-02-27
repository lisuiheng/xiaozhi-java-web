<template>
  <div class="stats-analysis">
    <el-card shadow="hover">
      <template #header>
        <div class="flex justify-between items-center">
          <span>记忆统计概况</span>
          <el-button type="primary" size="small" @click="refreshStats">刷新</el-button>
        </div>
      </template>
      
      <div v-if="loading" class="text-center py-8">
        <el-icon class="is-loading"><Loading /></el-icon>
        加载中...
      </div>
      
      <div v-else-if="!statsData" class="text-center py-8 text-gray-400">
        暂无统计数据
      </div>
      
      <div v-else>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="text-3xl font-bold text-blue-500">{{ statsData.totalMemories || 0 }}</div>
              <div class="text-sm text-gray-500 mt-2">总记忆数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="text-3xl font-bold text-green-500">{{ statsData.dailyAverage?.toFixed(2) || 0 }}</div>
              <div class="text-sm text-gray-500 mt-2">日均记忆数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="text-3xl font-bold text-purple-500">{{ statsData.recentActivity || 0 }}</div>
              <div class="text-sm text-gray-500 mt-2">近期活动数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="text-3xl font-bold text-orange-500">{{ statsData.activeDays || 0 }}</div>
              <div class="text-sm text-gray-500 mt-2">活跃天数</div>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" class="mt-4">
          <el-col :span="12">
            <el-card shadow="never" class="bg-gray-50">
              <template #header>
                <span>时间信息</span>
              </template>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span>首次记忆时间:</span>
                  <span>{{ formatTime(statsData.firstMemoryTime) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>最后记忆时间:</span>
                  <span>{{ formatTime(statsData.lastMemoryTime) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>记忆跨度:</span>
                  <span>{{ calculateTimeSpan(statsData.firstMemoryTime, statsData.lastMemoryTime) }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never" class="bg-gray-50">
              <template #header>
                <span>关键词统计</span>
              </template>
              <div v-if="statsData.topKeywords && statsData.topKeywords.length > 0" class="space-y-2">
                <div v-for="(keyword, index) in statsData.topKeywords.slice(0, 5)" :key="index" class="flex justify-between">
                  <span>{{ keyword.text || keyword.keyword }}</span>
                  <span class="text-gray-500">{{ keyword.count || keyword.frequency }}</span>
                </div>
              </div>
              <div v-else class="text-gray-500 text-center py-4">
                暂无关键词统计
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-card shadow="never" class="bg-gray-50 mt-4">
          <template #header>
            <span>记忆分布</span>
          </template>
          <div class="text-center py-8 text-gray-400">
            记忆分布图表 (可集成ECharts饼图/柱状图)
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getUserMemoryDashboard } from '@/api/ai/memory';
import { Loading } from '@element-plus/icons-vue';
import { format } from 'date-fns';

const props = defineProps<{
  userId: string;
}>();

const loading = ref(false);
const statsData = ref<any>(null);

const refreshStats = async () => {
  loading.value = true;
  try {
    const result = await getUserMemoryDashboard({
      userId: props.userId,
      recentLimit: 10,
      keywordLimit: 10,
      daysBack: 30
    });
    statsData.value = result.data?.stats || null;
  } catch (error) {
    console.error('获取统计失败:', error);
    statsData.value = null;
  } finally {
    loading.value = false;
  }
};

const formatTime = (time: string) => {
  if (!time) return '-';
  try {
    return format(new Date(time), 'yyyy-MM-dd HH:mm:ss');
  } catch (error) {
    return time;
  }
};

const calculateTimeSpan = (startTime: string, endTime: string) => {
  if (!startTime || !endTime) return '-';
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `${diffDays} 天`;
  } catch (error) {
    return '-';
  }
};

watch(() => props.userId, refreshStats);
onMounted(refreshStats);
</script>

<style scoped>
.stat-card {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  transition: all 0.3s cubic-bezier(.25,.8,.25,1);
}

.stat-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.16), 0 4px 4px rgba(0,0,0,0.23);
}
</style>