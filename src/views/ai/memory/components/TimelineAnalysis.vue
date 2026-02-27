<template>
  <div class="timeline-analysis">
    <el-card shadow="hover">
      <template #header>
        <div class="flex justify-between items-center">
          <span>记忆时间线</span>
          <div class="flex space-x-2">
            <el-select v-model="groupBy" size="small" style="width: 120px">
              <el-option label="按天" value="day" />
              <el-option label="按周" value="week" />
              <el-option label="按月" value="month" />
            </el-select>
            <el-button type="primary" size="small" @click="refreshAnalysis">刷新</el-button>
          </div>
        </div>
      </template>
      
      <div v-if="loading" class="text-center py-8">
        <el-icon class="is-loading"><Loading /></el-icon>
        加载中...
      </div>
      
      <div v-else-if="timelineData.length === 0" class="text-center py-8 text-gray-400">
        暂无时间线数据
      </div>
      
      <div v-else>
        <div class="mb-4">
          <div class="flex justify-between text-sm text-gray-500 mb-2">
            <span>时间段: {{ timelineData[0]?.period }} - {{ timelineData[timelineData.length - 1]?.period }}</span>
            <span>总记忆数: {{ totalMemories }}</span>
          </div>
          <el-progress :percentage="avgMemoriesPercentage" :stroke-width="8" />
        </div>
        
        <div class="timeline-chart" style="height: 300px">
          <!-- 这里可以使用echarts或其他图表库 -->
          <div class="text-center py-12 text-gray-400">
            时间线图表 (可集成ECharts)
          </div>
        </div>
        
        <el-table :data="timelineData.slice(0, 10)" border class="mt-4">
          <el-table-column prop="period" label="时间段" />
          <el-table-column prop="count" label="记忆数量">
            <template #default="scope">
              <el-tag size="small">{{ scope.row.count }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button size="small" @click="viewPeriodMemories(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { getUserMemoryTimeline } from '@/api/ai/memory';
import { Loading } from '@element-plus/icons-vue';

const props = defineProps<{
  userId: string;
}>();

const loading = ref(false);
const timelineData = ref<any[]>([]);
const groupBy = ref('day');

const totalMemories = computed(() => {
  return timelineData.value.reduce((sum, item) => sum + item.count, 0);
});

const avgMemoriesPercentage = computed(() => {
  if (timelineData.value.length === 0) return 0;
  const avg = totalMemories.value / timelineData.value.length;
  return Math.min((avg / 10) * 100, 100); // 假设10条为100%
});

const refreshAnalysis = async () => {
  loading.value = true;
  try {
    const result = await getUserMemoryTimeline({
      userId: props.userId,
      groupBy: groupBy.value
    });
    timelineData.value = result.data?.timeline || [];
  } catch (error) {
    console.error('获取时间线失败:', error);
    timelineData.value = [];
  } finally {
    loading.value = false;
  }
};

const viewPeriodMemories = (period: any) => {
  // 打开查看对话框的逻辑
  console.log('查看时间段记忆:', period);
};

watch(() => props.userId, refreshAnalysis);
watch(groupBy, refreshAnalysis);
onMounted(refreshAnalysis);
</script>