<template>
  <div class="keywords-analysis">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="flex justify-between items-center">
              <span>关键词分析</span>
              <el-button type="primary" size="small" @click="refreshAnalysis">刷新分析</el-button>
            </div>
          </template>
          <div v-if="loading" class="text-center py-8">
            <el-icon class="is-loading"><Loading /></el-icon>
            分析中...
          </div>
          <div v-else>
            <div v-if="keywords.length === 0" class="text-center py-8 text-gray-400">
              暂无关键词数据
            </div>
            <div v-else class="space-y-4">
              <div v-for="(keyword, index) in keywords" :key="index" class="keyword-item">
                <div class="flex justify-between items-center">
                  <span class="font-medium">{{ keyword.keyword }}</span>
                  <span class="text-sm text-gray-500">频率: {{ (keyword.frequency * 100).toFixed(1) }}%</span>
                </div>
                <el-progress 
                  :percentage="Math.min(keyword.frequency * 1000, 100)" 
                  :stroke-width="12"
                  :format="() => `${keyword.count}次`"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>分析洞察</span>
          </template>
          <div v-if="analysisResult?.insights?.length">
            <ul class="space-y-2">
              <li v-for="(insight, index) in analysisResult.insights" :key="index" class="flex items-start">
                <el-icon class="mr-2 mt-1"><InfoFilled /></el-icon>
                <span>{{ insight }}</span>
              </li>
            </ul>
          </div>
          <div v-else class="text-center py-8 text-gray-400">
            暂无分析洞察
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { analyzeMemories } from '@/api/ai/memory';
import { Loading, InfoFilled } from '@element-plus/icons-vue';

const props = defineProps<{
  userId: string;
}>();

const loading = ref(false);
const analysisResult = ref<any>(null);
const keywords = ref<any[]>([]);

const refreshAnalysis = async () => {
  loading.value = true;
  try {
    const result = await analyzeMemories({
      userId: props.userId,
      analysisType: 'keywords'
    });
    analysisResult.value = result;
    keywords.value = result.data || [];
  } catch (error) {
    console.error('分析失败:', error);
  } finally {
    loading.value = false;
  }
};

watch(() => props.userId, refreshAnalysis);
onMounted(refreshAnalysis);
</script>

<style scoped>
.keyword-item {
  padding: 8px 0;
}
</style>