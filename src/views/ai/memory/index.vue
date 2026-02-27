<template>
  <div class="p-2">
    <!-- 顶部操作栏 -->
    <el-card shadow="hover" class="mb-4">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <el-button v-has-permi="['ai:memory:add']" type="primary" plain icon="Plus" @click="handleAdd()">
              添加记忆
            </el-button>
            <el-button v-has-permi="['ai:memory:edit']" type="success" plain :disabled="single" icon="Edit" @click="handleUpdate()">
              修改
            </el-button>
            <el-button v-has-permi="['ai:memory:remove']" type="danger" plain :disabled="multiple" icon="Delete" @click="handleDelete()">
              删除
            </el-button>
            <el-button v-has-permi="['ai:memory:clear']" type="warning" plain :disabled="single" icon="DeleteFilled" @click="handleClear()">
              清除用户记忆
            </el-button>
            <el-dropdown>
              <el-button type="info" plain icon="Operation">
                更多操作
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-has-permi="['ai:memory:analyze']" @click="handleAnalyze()">
                    <el-icon><TrendCharts /></el-icon> 记忆分析
                  </el-dropdown-item>
                  <el-dropdown-item v-has-permi="['ai:memory:export']" @click="handleExport()">
                    <el-icon><Download /></el-icon> 导出记忆
                  </el-dropdown-item>
                  <el-dropdown-item v-has-permi="['ai:memory:import']" @click="handleImport()">
                    <el-icon><Upload /></el-icon> 导入记忆
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="refreshHealth()">
                    <el-icon><Refresh /></el-icon> 刷新服务状态
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <right-toolbar v-model:show-search="showSearch" :columns="columns" :search="true" @query-table="getList"></right-toolbar>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" :inline="true" label-width="80px">
        <!-- 查询方式切换 -->
        <el-form-item label="查询方式" prop="queryType">
          <el-radio-group v-model="queryParams.queryType" @change="handleQueryTypeChange">
            <el-radio label="list">列表查询</el-radio>
            <el-radio label="search">相似度搜索</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="用户ID" prop="userId">
          <el-input
            v-model="queryParams.userId"
            placeholder="请输入用户ID"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <!-- 列表查询表单字段 -->
        <template v-if="queryParams.queryType === 'list'">
          <el-form-item label="记忆内容" prop="content">
            <el-input
              v-model="queryParams.content"
              placeholder="请输入记忆内容关键词"
              clearable
              style="width: 200px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="日期范围" prop="dateRange">
            <el-date-picker
              v-model="queryParams.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 240px"
            />
          </el-form-item>
        </template>

        <!-- 相似度搜索表单字段 -->
        <template v-else-if="queryParams.queryType === 'search'">
          <el-form-item label="记忆内容" prop="searchContent">
            <el-input
              v-model="queryParams.searchContent"
              placeholder="请输入搜索内容"
              clearable
              style="width: 200px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="TopK" prop="topK">
            <el-input-number
              v-model="queryParams.topK"
              :min="1"
              :max="100"
              placeholder="返回数量"
              style="width: 120px"
            />
          </el-form-item>
        </template>

        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 服务状态指示器 -->
      <div class="mb-4">
        <el-alert
          :title="healthStatus.title"
          :type="healthStatus.type"
          :description="healthStatus.description"
          :closable="false"
          show-icon
        >
          <template #title>
            <span class="flex items-center">
              <el-icon :class="healthStatus.iconClass" class="mr-2">
                <component :is="healthStatus.icon" />
              </el-icon>
              {{ healthStatus.title }}
            </span>
          </template>
        </el-alert>
      </div>
    </el-card>

    <!-- 记忆列表表格 -->
    <el-card shadow="hover">
      <el-table v-loading="loading" border :data="memoryList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column v-if="columns[0].visible" key="id" label="记忆ID" align="center" prop="id" width="180" />

        <el-table-column v-if="columns[1].visible" key="content" label="记忆内容" align="center" prop="content" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[2].visible" key="score" label="相关度" align="center" prop="score"  width="100"></el-table-column>
        <el-table-column v-if="columns[3].visible" key="timestamp" label="创建时间" align="center" width="160">
          <template #default="scope">
            <span>{{ formatTime(scope.row.timestamp) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="240" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button v-hasPermi="['ai:memory:view']" link type="primary" icon="View" @click="handleView(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['ai:memory:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['ai:memory:remove']" link type="danger" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>

            <!-- 更多操作下拉菜单 -->
            <el-dropdown @command="(command) => handleMoreCommand(command, scope.row)">
              <el-button link type="info" icon="MoreFilled"></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="analyze">
                    <el-icon><TrendCharts /></el-icon> 分析记忆
                  </el-dropdown-item>
                  <el-dropdown-item command="timeline">
                    <el-icon><Histogram /></el-icon> 时间线
                  </el-dropdown-item>
                  <el-dropdown-item command="graph">
                    <el-icon><Connection /></el-icon> 关系图
                  </el-dropdown-item>
                  <el-dropdown-item divided command="clearUser">
                    <el-icon><DeleteFilled /></el-icon> 清除用户所有记忆
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0 && queryParams.queryType === 'list'"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-card>

    <!-- 添加/修改记忆对话框 -->
    <el-dialog ref="formDialogRef" v-model="dialog.visible" :title="dialog.title" width="800px" append-to-body @close="closeDialog">
      <el-form ref="memoryFormRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户ID" prop="userId">
              <el-input v-model="form.userId" placeholder="请输入用户ID" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="记忆类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择记忆类型" style="width: 100%">
                <el-option label="用户消息" value="USER" />
                <el-option label="助手回复" value="ASSISTANT" />
                <el-option label="系统消息" value="SYSTEM" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="记忆内容" prop="content">
              <el-input
                v-model="form.content"
                type="textarea"
                placeholder="请输入记忆内容"
                :rows="6"
                maxlength="2000"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel()">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看记忆详情对话框 -->
    <el-dialog v-model="detailDialog.visible" title="记忆详情" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="记忆ID">{{ detailData.id || '-' }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ detailData.userId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(detailData.timestamp) }}</el-descriptions-item>
      </el-descriptions>

      <div class="mt-6">
        <h3 class="text-lg font-medium mb-2">记忆内容</h3>
        <div class="bg-gray-50 p-4 rounded border">
          <pre class="whitespace-pre-wrap text-sm">{{ detailData.content || '-' }}</pre>
        </div>
      </div>



      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="importDialog.visible" title="批量导入记忆" width="600px" append-to-body>
      <el-alert title="导入说明" type="info" show-icon class="mb-4" :closable="false">
        <template #default>
          <div class="text-sm">
            <p>1. 支持JSON格式的批量导入</p>
            <p>2. 文件格式参考：[{"userId": "user123", "content": "记忆内容"}]</p>
            <p>3. 最大支持一次性导入1000条记忆</p>
          </div>
        </template>
      </el-alert>

      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :show-file-list="true"
        accept=".json"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">仅支持JSON格式文件</div>
        </template>
      </el-upload>

      <div v-if="importData.preview.length > 0" class="mt-4">
        <h3 class="text-lg font-medium mb-2">预览 (显示前10条)</h3>
        <el-table :data="importData.preview.slice(0, 10)" border height="200">
          <el-table-column prop="userId" label="用户ID" width="120" />
          <el-table-column prop="content" label="内容" :show-overflow-tooltip="true" />
        </el-table>
        <div class="mt-2 text-sm text-gray-500">
          共 {{ importData.preview.length }} 条记录，将导入到用户: {{ importData.userId }}
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialog.visible = false">取 消</el-button>
          <el-button type="primary" :disabled="importData.preview.length === 0" @click="handleImportSubmit">
            开始导入
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分析对话框 -->
    <el-dialog v-model="analyzeDialog.visible" title="记忆分析" width="900px" append-to-body>
      <el-tabs v-model="analyzeDialog.activeTab">
        <el-tab-pane label="关键词分析" name="keywords">
          <KeywordsAnalysis v-if="analyzeDialog.activeTab === 'keywords'" :userId="analyzeDialog.userId" />
        </el-tab-pane>
        <el-tab-pane label="时间线分析" name="timeline">
          <TimelineAnalysis v-if="analyzeDialog.activeTab === 'timeline'" :userId="analyzeDialog.userId" />
        </el-tab-pane>
        <el-tab-pane label="关系图分析" name="graph">
          <GraphAnalysis v-if="analyzeDialog.activeTab === 'graph'" :userId="analyzeDialog.userId" />
        </el-tab-pane>
        <el-tab-pane label="统计概况" name="stats">
          <StatsAnalysis v-if="analyzeDialog.activeTab === 'stats'" :userId="analyzeDialog.userId" />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup name="Memory" lang="ts">
import { listMemory, getMemory, addMemory, updateMemory, deleteMemory, clearMemory, searchMemory, analyzeMemories, healthCheck, exportMemory, batchImportMemories, getMemoryRelationshipGraph, getUserMemoryDashboard } from '@/api/ai/memory';
import { MemoryForm, MemoryQuery, MemoryVO } from '@/api/ai/memory/types';
import { to } from 'await-to-js';
import KeywordsAnalysis from './components/KeywordsAnalysis.vue';
import TimelineAnalysis from './components/TimelineAnalysis.vue';
import GraphAnalysis from './components/GraphAnalysis.vue';
import StatsAnalysis from './components/StatsAnalysis.vue';
import { UploadFilled, View, Edit, Delete, DeleteFilled, MoreFilled,
         TrendCharts, Histogram, Connection, Download, Upload, Refresh,
         Operation, SuccessFilled, WarningFilled, InfoFilled } from '@element-plus/icons-vue';
import { format } from 'date-fns';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const memoryList = ref<MemoryVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: `记忆ID`, visible: true, children: [] },
  { key: 1, label: `记忆内容`, visible: true, children: [] },
  { key: 2, label: `相关度`, visible: true, children: [] },
  { key: 3, label: `创建时间`, visible: true, children: [] }
]);

// 对话框引用
const memoryFormRef = ref<ElFormInstance>();
const formDialogRef = ref<ElDialogInstance>();
const uploadRef = ref();

// 对话框状态
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const detailDialog = reactive({
  visible: false
});

const importDialog = reactive({
  visible: false
});

const analyzeDialog = reactive({
  visible: false,
  activeTab: 'keywords',
  userId: ''
});

// 导入数据
const importData = reactive({
  preview: [] as any[],
  userId: ''
});

// 健康状态
const healthStatus = reactive({
  title: '正在检查服务状态...',
  type: 'info' as any,
  icon: InfoFilled,
  iconClass: 'text-blue-500',
  description: ''
});

// 表单数据
const initFormData: MemoryForm = {
  id: undefined,
  userId: '',
  content: '',
  type: 'USER' as MessageRole
};

const initData: PageData<MemoryForm, MemoryQuery> = {
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: '',
    content: '',
    dateRange: [],
    queryType: 'list', // 默认查询类型
    searchContent: '',
    topK: 10
  },
  rules: {
    userId: [
      { required: false, message: '用户ID不能为空', trigger: 'blur' },
      { min: 1, max: 50, message: '用户ID长度必须介于 1 和 50 之间', trigger: 'blur' }
    ],
    content: [
      { required: false, message: '记忆内容不能为空', trigger: 'blur' },
      { min: 1, max: 2000, message: '记忆内容长度必须介于 1 和 2000 之间', trigger: 'blur' }
    ],
    searchContent: [
      { required: false, message: '搜索内容不能为空', trigger: 'blur' }
    ]
  }
};

const data = reactive<PageData<MemoryForm, MemoryQuery>>(initData);
const { queryParams, form, rules } = toRefs<PageData<MemoryForm, MemoryQuery>>(data);

// 详情数据
const detailData = ref<MemoryVO>({});

// 从URL参数中获取查询条件
const route = useRoute();

// 初始化
onMounted(async () => {
  // 从URL参数中获取查询条件
  const { userId, content, queryType } = route.query;

  if (userId) {
    queryParams.value.userId = String(userId);
  }
  if (content) {
    // 根据URL参数判断查询类型
    if (queryType === 'search') {
      queryParams.value.queryType = 'search';
      queryParams.value.searchContent = String(content);
    } else {
      queryParams.value.content = String(content);
    }
  }

  // 初始化验证规则 - 所有字段都为可选
  rules.value.content[0].required = false;
  rules.value.searchContent[0].required = false;

  // 刷新服务状态
  await refreshHealth();

  // 如果URL中有查询参数，则执行查询
  if (userId || content) {
    await getList();
  } else {
    // 否则执行默认查询
    await getList();
  }
});

/** 查询记忆列表 */
const getList = async () => {
  loading.value = true;
  try {
    if (queryParams.value.queryType === 'list') {
      // 列表查询 - 使用listMemory API
      const params = {
        ...queryParams.value,
        startDate: queryParams.value.dateRange?.[0],
        endDate: queryParams.value.dateRange?.[1],
        // 从查询参数中移除相似度搜索相关参数
        searchContent: undefined,
        topK: undefined
      };

      const [err, res] = await to(listMemory(params));
      if (!err && res) {
        memoryList.value = res.rows || [];
        total.value = res.total || 0;
        // 列表查询使用分页参数
      } else {
        memoryList.value = [];
        total.value = 0;
        proxy?.$modal.msgError('获取记忆列表失败');
      }
    } else if (queryParams.value.queryType === 'search') {
      // 相似度搜索 - 使用searchMemory API，不进行分页
      const searchParams = {
        userId: queryParams.value.userId,
        query: queryParams.value.searchContent,
        topK: queryParams.value.topK
      };

      const [err, res] = await to(searchMemory(searchParams));
      if (!err && res) {
        // 确保 res 是数组格式
        const searchResults = Array.isArray(res.data) ? res.data : [];
        memoryList.value = searchResults;
        total.value = searchResults.length || 0;
        // 相似度搜索不进行分页，直接显示所有结果
        queryParams.value.pageNum = 1;
      } else {
        memoryList.value = [];
        total.value = 0;
        proxy?.$modal.msgError('搜索记忆失败');
      }
    }
  } catch (error) {
    console.error('获取记忆列表失败:', error);
    memoryList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

/** 刷新服务状态 */
const refreshHealth = async () => {
  try {
    const [err, res] = await to(healthCheck());
    if (!err && res && res.data.status === 'healthy') {
      healthStatus.title = '记忆服务运行正常';
      healthStatus.type = 'success';
      healthStatus.icon = SuccessFilled;
      healthStatus.iconClass = 'text-green-500';
      healthStatus.description = `服务版本: ${res.data.version || '未知'}，最后检查: ${new Date().toLocaleTimeString()}`;
    } else {
      healthStatus.title = '记忆服务异常';
      healthStatus.type = 'error';
      healthStatus.icon = WarningFilled;
      healthStatus.iconClass = 'text-red-500';
      healthStatus.description = res?.error || '无法连接到记忆服务';
    }
  } catch (error) {
    healthStatus.title = '记忆服务异常';
    healthStatus.type = 'error';
    healthStatus.icon = WarningFilled;
    healthStatus.iconClass = 'text-red-500';
    healthStatus.description = '连接记忆服务失败';
  }
};

/** 搜索按钮操作 */
const handleQuery = () => {
  // 根据查询类型动态设置验证规则
  if (queryParams.value.queryType === 'list') {
    // 列表查询时，记忆内容为可选
    rules.value.content[0].required = false;
    rules.value.searchContent[0].required = false;
  } else if (queryParams.value.queryType === 'search') {
    // 相似度搜索时，搜索内容为可选
    rules.value.content[0].required = false;
    rules.value.searchContent[0].required = false;
  }

  queryParams.value.pageNum = 1;
  getList();
};

/** 查询类型切换 */
const handleQueryTypeChange = () => {
  // 查询类型改变时，重置其他查询参数
  if (queryParams.value.queryType === 'list') {
    queryParams.value.searchContent = '';
    queryParams.value.topK = 10;
  } else if (queryParams.value.queryType === 'search') {
    queryParams.value.content = '';
    queryParams.value.dateRange = [];
  }
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  queryParams.value.userId = '';
  queryParams.value.content = '';
  queryParams.value.dateRange = [];
  queryParams.value.queryType = 'list';
  queryParams.value.searchContent = '';
  queryParams.value.topK = 10;
  handleQuery();
};

/** 根据评分获取标签类型 */
const getScoreType = (score: number) => {
  if (!score && score !== 0) return 'info';
  if (score >= 0.8) return 'success';
  if (score >= 0.5) return 'warning';
  return 'danger';
};

/** 格式化时间 */
const formatTime = (time: string) => {
  if (!time) return '-';
  try {
    return format(new Date(time), 'yyyy-MM-dd HH:mm:ss');
  } catch (error) {
    return time;
  }
};

/** 删除记忆 */
const handleDelete = async (row?: MemoryVO) => {
  const memoryIds = row?.id || ids.value;
  const [err] = await to(proxy?.$modal.confirm('是否确认删除记忆ID为"' + memoryIds + '"的数据项？') as any);
  if (!err) {
    try {
      const deleteIds = Array.isArray(memoryIds) ? memoryIds : [memoryIds];
      await deleteMemory(deleteIds);
      await getList();
      proxy?.$modal.msgSuccess('删除成功');
    } catch (error) {
      proxy?.$modal.msgError('删除失败');
    }
  }
};

/** 清除用户所有记忆 */
const handleClear = async (row?: MemoryVO) => {
  const userId = row?.userId || (single.value ? memoryList.value.find(item => item.id === ids.value[0])?.userId : null);

  if (!userId) {
    proxy?.$modal.msgWarning('请先选择要清除记忆的用户');
    return;
  }

  const [err] = await to(proxy?.$modal.confirm(`是否确认清除用户 "${userId}" 的所有记忆？此操作不可恢复！`) as any);
  if (!err) {
    try {
      const result = await clearMemory(userId);
      if (result.success) {
        proxy?.$modal.msgSuccess(`已清除用户 ${userId} 的 ${result.deletedCount} 条记忆`);
        await getList();
      } else {
        proxy?.$modal.msgError(`清除失败: ${result.message}`);
      }
    } catch (error) {
      proxy?.$modal.msgError('清除记忆失败');
    }
  }
};

/** 选择条数 */
const handleSelectionChange = (selection: MemoryVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

/** 重置表单 */
const reset = () => {
  form.value = { ...initFormData };
  memoryFormRef.value?.resetFields();
};

/** 取消按钮 */
const cancel = () => {
  dialog.visible = false;
  reset();
};

/** 新增按钮操作 */
const handleAdd = async () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加记忆';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: MemoryForm) => {
  reset();
  
  // 直接使用传入的行数据，如果存在则直接填充表单
  if (row) {
    Object.assign(form.value, row);
    dialog.visible = true;
    dialog.title = '修改记忆';
    return;
  }
  
  // 如果没有传入行数据，则从列表中查找
  const memoryId = ids.value[0];
  const memoryItem = memoryList.value.find(item => item.id === memoryId);
  
  if (!memoryItem) {
    proxy?.$modal.msgError('未找到要编辑的记忆');
    return;
  }
  
  Object.assign(form.value, memoryItem);
  dialog.visible = true;
  dialog.title = '修改记忆';
};

/** 查看详情 */
const handleView = async (row: MemoryVO) => {
  // 直接使用传入的行数据
  detailData.value = row;
  detailDialog.visible = true;
};

/** 提交表单 */
const submitForm = () => {
  memoryFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const submitData = { ...form.value };

        if (submitData.id) {
          await updateMemory(submitData);
        } else {
          await addMemory(submitData);
        }

        proxy?.$modal.msgSuccess('操作成功');
        dialog.visible = false;
        await getList();
      } catch (error) {
        proxy?.$modal.msgError('操作失败');
      }
    }
  });
};

/** 关闭对话框 */
const closeDialog = () => {
  dialog.visible = false;
  reset();
};

/** 重置表单 */
const resetForm = () => {
  memoryFormRef.value?.resetFields();
  memoryFormRef.value?.clearValidate();
  form.value.id = undefined;
};

/** 更多操作命令 */
const handleMoreCommand = (command: string, row: MemoryVO) => {
  switch (command) {
    case 'analyze':
      handleAnalyze(row.userId);
      break;
    case 'timeline':
      handleTimeline(row.userId);
      break;
    case 'graph':
      handleGraph(row.userId);
      break;
    case 'clearUser':
      handleClear(row);
      break;
  }
};

/** 打开分析对话框 */
const handleAnalyze = (userId?: string) => {
  const targetUserId = userId || (single.value ? memoryList.value.find(item => item.id === ids.value[0])?.userId : null);

  if (!targetUserId) {
    proxy?.$modal.msgWarning('请先选择要分析的用户');
    return;
  }

  analyzeDialog.userId = targetUserId;
  analyzeDialog.activeTab = 'keywords';
  analyzeDialog.visible = true;
};

/** 打开时间线分析 */
const handleTimeline = (userId: string) => {
  analyzeDialog.userId = userId;
  analyzeDialog.activeTab = 'timeline';
  analyzeDialog.visible = true;
};

/** 打开关系图分析 */
const handleGraph = (userId: string) => {
  analyzeDialog.userId = userId;
  analyzeDialog.activeTab = 'graph';
  analyzeDialog.visible = true;
};

/** 导出记忆 */
const handleExport = async () => {
  const userId = single.value ? memoryList.value.find(item => item.id === ids.value[0])?.userId : null;

  if (!userId) {
    proxy?.$modal.msgWarning('请先选择要导出的用户');
    return;
  }

  try {
    const response = await exportMemory(userId, 'json');

    // 创建下载链接
    const dataStr = JSON.stringify(response.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `memories_${userId}_${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
    proxy?.$modal.msgSuccess('导出成功');
  } catch (error) {
    proxy?.$modal.msgError('导出失败');
  }
};

/** 导入记忆 */
const handleImport = () => {
  importDialog.visible = true;
  importData.preview = [];
  importData.userId = '';
};

/** 处理文件上传 */
const handleFileChange = (file: any) => {
  if (file.raw) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (Array.isArray(data)) {
          // 提取用户ID（假设所有记录属于同一用户）
          const firstUserId = data[0]?.userId;
          if (firstUserId && data.every(item => item.userId === firstUserId)) {
            importData.userId = firstUserId;
          }

          importData.preview = data;
          proxy?.$modal.msgSuccess(`成功读取 ${data.length} 条记录`);
        } else {
          proxy?.$modal.msgError('文件格式错误，必须是JSON数组');
        }
      } catch (error) {
        proxy?.$modal.msgError('解析JSON文件失败');
      }
    };
    reader.readAsText(file.raw);
  }
};

/** 提交导入 */
const handleImportSubmit = async () => {
  if (importData.preview.length === 0) {
    proxy?.$modal.msgWarning('请先上传文件');
    return;
  }

  try {
    loading.value = true;

    // 将数据转换为API需要的格式
    const memories = importData.preview.map(item => ({
      userId: item.userId || importData.userId,
      messages: [
        {
          role: (item.type === 'USER' || item.type === 'ASSISTANT' || item.type === 'SYSTEM') ? item.type : 'USER',
          content: item.content
        } as Message
      ]
    }));

    // 分批导入
    const batchSize = 50;
    let successCount = 0;

    for (let i = 0; i < memories.length; i += batchSize) {
      const batch = memories.slice(i, i + batchSize);
      const result = await batchImportMemories(batch);
      successCount += result.successCount;

      // 更新进度
      proxy?.$modal.msgInfo(`正在导入... ${Math.min(i + batchSize, memories.length)}/${memories.length}`);
    }

    proxy?.$modal.msgSuccess(`导入完成，成功 ${successCount}/${memories.length} 条`);
    importDialog.visible = false;
    await getList();
  } catch (error) {
    proxy?.$modal.msgError('导入失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.upload-demo {
  margin-top: 20px;
}

.el-descriptions {
  margin-bottom: 20px;
}

.el-tag {
  cursor: default;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.text-xs {
  font-size: 0.75rem;
}

.text-gray-500 {
  color: #6b7280;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mt-6 {
  margin-top: 1.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.font-medium {
  font-weight: 500;
}

.text-sm {
  font-size: 0.875rem;
}

.text-lg {
  font-size: 1.125rem;
}

.text-green-500 {
  color: #10b981;
}

.text-red-500 {
  color: #ef4444;
}

.text-blue-500 {
  color: #3b82f6;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
}

.rounded {
  border-radius: 0.375rem;
}

.border {
  border: 1px solid #e5e7eb;
}
</style>
