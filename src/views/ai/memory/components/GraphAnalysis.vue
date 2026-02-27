<template>
  <div class="graph-analysis">
    <el-card shadow="hover">
      <template #header>
        <div class="flex justify-between items-center">
          <span>记忆关系图</span>
          <div class="flex space-x-2">
            <el-select v-model="graphType" size="small" style="width: 120px">
              <el-option label="关键词" value="keywords" />
              <el-option label="时间" value="time" />
              <el-option label="用户" value="user" />
            </el-select>
            <el-button type="primary" size="small" @click="refreshGraph">刷新</el-button>
          </div>
        </div>
      </template>
      
      <div v-if="loading" class="text-center py-8">
        <el-icon class="is-loading"><Loading /></el-icon>
        加载中...
      </div>
      
      <div v-else-if="!graphData" class="text-center py-8 text-gray-400">
        暂无关系图数据
      </div>
      
      <div v-else>
        <div class="graph-container" style="height: 500px">
          <!-- 这里可以使用echarts或其他图表库 -->
          <div class="text-center py-12 text-gray-400">
            记忆关系图 (可集成ECharts力导向图)
          </div>
          
          <div class="mt-4">
            <h4 class="text-md font-medium mb-2">关系统计</h4>
            <el-row :gutter="10">
              <el-col :span="8">
                <div class="stat-card">
                  <div class="text-2xl font-bold">{{ graphData.nodes?.length || 0 }}</div>
                  <div class="text-sm text-gray-500">节点数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-card">
                  <div class="text-2xl font-bold">{{ graphData.links?.length || 0 }}</div>
                  <div class="text-sm text-gray-500">连接数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-card">
                  <div class="text-2xl font-bold">{{ graphData.clusters?.length || 0 }}</div>
                  <div class="text-sm text-gray-500">聚类数</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getMemoryRelationshipGraph } from '@/api/ai/memory';
import { Loading } from '@element-plus/icons-vue';

const props = defineProps<{
  userId: string;
}>();

const loading = ref(false);
const graphData = ref<any>(null);
const graphType = ref('keywords');

const refreshGraph = async () => {
  loading.value = true;
  try {
    const result = await getMemoryRelationshipGraph({
      userId: props.userId,
      limit: 30,
      similarityThreshold: 0.5,
      minClusterSize: 2
    });
    graphData.value = result.data || null;
  } catch (error) {
    console.error('获取关系图失败:', error);
    graphData.value = null;
  } finally {
    loading.value = false;
  }
};

watch(() => props.userId, refreshGraph);
onMounted(refreshGraph);
</script>

<style scoped>
.stat-card {
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}
</style>