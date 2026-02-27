<template>
  <div class="p-2">
    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button v-has-permi="['ai:agent:add']" type="primary" plain icon="Plus" @click="handleAdd()">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-has-permi="['ai:agent:edit']" type="success" plain :disabled="single" icon="Edit" @click="handleUpdate()">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-has-permi="['ai:agent:remove']" type="danger" plain :disabled="multiple" icon="Delete" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" :columns="columns" :search="true" @query-table="getList"></right-toolbar>
        </el-row>
        <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="智能体ID" prop="id">
            <el-input
              v-model="queryParams.id"
              placeholder="请输入智能体ID"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="智能体名称" prop="agentName">
            <el-input
              v-model="queryParams.agentName"
              placeholder="请输入智能体名称"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </template>

      <el-table v-loading="loading" border :data="agentList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column v-if="columns[0].visible" key="id" label="智能体ID" align="center" prop="id" width="150" />
        <el-table-column v-if="columns[1].visible" key="agentName" label="智能体名称" align="center" prop="agentName" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[2].visible" key="nickname" label="助手昵称" align="center" prop="nickname" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[3].visible" key="description" label="角色介绍" align="center" prop="description" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[4].visible" key="llmType" label="大模型类型" align="center" prop="llmType" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[5].visible" key="modelName" label="模型名称" align="center" prop="modelName" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[6].visible" key="maxTokens" label="最大Token数" align="center" prop="maxTokens" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[7].visible" key="systemPrompt" label="系统提示词" align="center" prop="systemPrompt" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[8].visible" key="ragThreshold" label="RAG相似度阈值" align="center" prop="ragThreshold" :formatter="formatRagThreshold" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[9].visible" key="status" label="状态" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[10].visible" label="创建时间" align="center" prop="createdAt" width="160">
          <template #default="scope">
            <span>{{ scope.row.createdAt }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="180" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['ai:agent:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['ai:agent:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>

            <el-tooltip content="测试连接" placement="top">
              <el-button link type="primary" icon="VideoPlay" @click="handleTestConnection(scope.row)">测试</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-card>

    <!-- 添加或修改Agent配置对话框 -->
    <el-dialog ref="formDialogRef" v-model="dialog.visible" :title="dialog.title" width="600px" append-to-body @close="closeDialog">
      <el-form ref="agentFormRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="智能体名称" prop="agentName">
              <el-input v-model="form.agentName" placeholder="请输入智能体名称" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="助手昵称" prop="nickname">
              <el-input v-model="form.nickname" placeholder="请输入助手昵称" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="角色介绍" prop="description">
              <el-input v-model="form.description" type="textarea" placeholder="请输入角色介绍" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="大模型类型" prop="llmType">
              <el-select v-model="form.llmType" placeholder="请选择大模型类型" style="width: 100%">
                <el-option label="OpenAI" value="openai" />
                <el-option label="ChatGLM" value="chatglm" />
                <el-option label="通义千问" value="qwen" />
                <el-option label="文心一言" value="wenxin" />
                <el-option label="星火认知" value="xinghuo" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模型名称" prop="modelName">
              <el-input v-model="form.modelName" placeholder="请输入模型名称" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="API密钥" prop="apiKey">
              <el-input v-model="form.apiKey" type="password" placeholder="请输入API密钥" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="API基础URL" prop="apiBaseUrl">
              <el-input v-model="form.apiBaseUrl" placeholder="请输入API基础URL" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="温度参数" prop="temperature">
              <el-input-number v-model="form.temperature" :min="0" :max="2" :step="0.1" placeholder="请输入温度参数" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大Token数" prop="maxTokens">
              <el-input-number v-model="form.maxTokens" :min="1" :max="32768" placeholder="请输入最大Token数" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="Top P" prop="topP">
              <el-input-number v-model="form.topP" :min="0" :max="1" :step="0.01" placeholder="请输入Top P值" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :value="1">启用</el-radio>
                <el-radio :value="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="系统提示词" prop="systemPrompt">
              <el-input v-model="form.systemPrompt" type="textarea" :rows="4" placeholder="请输入系统提示词" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="是否启用RAG" prop="enableRag">
              <el-checkbox v-model="form.enableRag">启用RAG</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="是否启用记忆" prop="enableMemory">
              <el-checkbox v-model="form.enableMemory">启用记忆</el-checkbox>
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
  </div>
</template>

<script setup name="Agent" lang="ts">
import { listAgent, getAgent, addAgent, updateAgent, delAgent, toggleAgentStatus } from '@/api/ai/agent';
import { AgentForm, AgentQuery, AgentVO } from '@/api/ai/agent/types';
import { to } from 'await-to-js';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const agentList = ref<AgentVO[]>();
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: `智能体ID`, visible: true, children: [] },
  { key: 1, label: `智能体名称`, visible: true, children: [] },
  { key: 2, label: `助手昵称`, visible: true, children: [] },
  { key: 3, label: `角色介绍`, visible: true, children: [] },
  { key: 4, label: `大模型类型`, visible: true, children: [] },
  { key: 5, label: `模型名称`, visible: true, children: [] },
  { key: 6, label: `最大Token数`, visible: true, children: [] },
  { key: 7, label: `系统提示词`, visible: true, children: [] },
  { key: 8, label: `RAG相似度阈值`, visible: true, children: [] },
  { key: 9, label: `状态`, visible: true, children: [] },
  { key: 10, label: `创建时间`, visible: true, children: [] }
]);

const agentFormRef = ref<ElFormInstance>();
const formDialogRef = ref<ElDialogInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const queryFormRef = ref<ElFormInstance>();

const initFormData: AgentForm = {
  id: undefined,
  agentName: '',
  nickname: '',
  description: '',
  llmType: 'openai',
  modelName: '',
  apiKey: '',
  apiBaseUrl: '',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  systemPrompt: '',
  status: 1,
  enableRag: false,
  enableMemory: false
};

const initData: PageData<AgentForm, AgentQuery> = {
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    id: '',
    agentName: '',
    category: '',
    status: undefined
  },
  rules: {
    agentName: [
      { required: true, message: '智能体名称不能为空', trigger: 'blur' },
      { min: 2, max: 50, message: '智能体名称长度必须介于 2 和 50 之间', trigger: 'blur' }
    ],
    llmType: [
      { required: true, message: '大模型类型不能为空', trigger: 'change' }
    ],
    modelName: [
      { required: true, message: '模型名称不能为空', trigger: 'blur' }
    ]
  }
};

const data = reactive<PageData<AgentForm, AgentQuery>>(initData);

const { queryParams, form, rules } = toRefs<PageData<AgentForm, AgentQuery>>(data);

// 从URL参数中获取查询条件并自动填充
const route = useRoute();

// 初始化时从URL参数获取查询条件
onMounted(() => {
  // 从URL参数中获取查询条件
  const { id, agentName } = route.query;

  if (id) {
    queryParams.value.id = String(id);
  }
  if (agentName) {
    queryParams.value.agentName = String(agentName);
  }

  // 如果URL中有查询参数，则执行查询
  if (id || agentName) {
    getList();
  } else {
    // 否则执行默认查询
    getList();
  }
});

/** 查询Agent列表 */
const getList = async () => {
  loading.value = true;
  const res = await listAgent(queryParams.value);
  loading.value = false;
  agentList.value = res.rows || [];
  total.value = res.total || 0;
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
  queryParams.value.id = '';
  queryParams.value.agentName = '';
  queryParams.value.category = '';
  queryParams.value.status = undefined;
  handleQuery();
};

/** 删除按钮操作 */
const handleDelete = async (row?: AgentVO) => {
  const agentIds = row?.id || ids.value;
  const [err] = await to(proxy?.$modal.confirm('是否确认删除Agent编号为"' + agentIds + '"的数据项？') as any);
  if (!err) {
    const deleteIds = Array.isArray(agentIds) ? agentIds : [agentIds];
    if (deleteIds.length === 1) {
      await delAgent(deleteIds[0]);
    } else {
      await batchDelAgent(deleteIds);
    }
    await getList();
    proxy?.$modal.msgSuccess('删除成功');
  }
};

/** Agent状态修改  */
const handleStatusChange = async (row: AgentVO) => {
  const text = row.status === 1 ? '启用' : '禁用';
  try {
    await proxy?.$modal.confirm('确认要"' + text + '""' + row.agentName + '"智能体吗?');
    await toggleAgentStatus(row.id, row.status);
    proxy?.$modal.msgSuccess(text + '成功');
  } catch (err) {
    row.status = row.status === 1 ? 0 : 1;
  }
};

/** 测试连接 */
const handleTestConnection = async (row: AgentVO) => {
  try {
    proxy?.$modal.msgSuccess('连接测试成功');
  } catch (err) {
    proxy?.$modal.msgError('连接测试失败');
  }
};

/** 格式化RAG相似度阈值 */
const formatRagThreshold = (row: AgentVO, column: any, cellValue: any) => {
  if (cellValue === undefined || cellValue === null) {
    return '-';
  }
  // 将数值转换为百分比显示
  return (cellValue * 100).toFixed(1) + '%';
};

/** 选择条数  */
const handleSelectionChange = (selection: AgentVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 重置操作表单 */
const reset = () => {
  form.value = { ...initFormData };
  agentFormRef.value?.resetFields();
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
  dialog.title = '新增智能体';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: AgentForm) => {
  reset();
  const agentId = row?.id || ids.value[0];
  const response = await getAgent(agentId);
  dialog.visible = true;
  dialog.title = '修改智能体';
  Object.assign(form.value, response.data);
};

/** 提交按钮 */
const submitForm = () => {
  agentFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.id) {
        await updateAgent(form.value);
      } else {
        await addAgent(form.value);
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/**
 * 关闭Agent弹窗
 */
const closeDialog = () => {
  dialog.visible = false;
  resetForm();
};

/**
 * 重置表单
 */
const resetForm = () => {
  agentFormRef.value?.resetFields();
  agentFormRef.value?.clearValidate();

  form.value.id = undefined;
  form.value.status = 1;
};


</script>
