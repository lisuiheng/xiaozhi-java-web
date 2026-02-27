<template>
  <div class="p-2">
    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button v-has-permi="['ai:chatDetail:add']" type="primary" plain icon="Plus" @click="handleAdd()">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-has-permi="['ai:chatDetail:edit']" type="success" plain :disabled="single" icon="Edit" @click="handleUpdate()">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-has-permi="['ai:chatDetail:remove']" type="danger" plain :disabled="multiple" icon="Delete" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" :columns="columns" :search="true" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <!-- 搜索条件 -->
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="85px">
        <el-row :gutter="20">
          <el-col :span="5">
            <el-form-item label="会话ID" prop="callId">
              <el-input
                v-model="queryParams.callId"
                placeholder="请输入会话ID"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="说话者类型" prop="questionKind"  >
              <el-select
                v-model="queryParams.questionKind"
                placeholder="请选择说话者类型"
                clearable
              >
                <el-option label="系统" value="SYSTEM" />
                <el-option label="用户" value="USER" />
                <el-option label="智能体" value="AGENT" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="设备ID" prop="deviceId">
              <el-input
                v-model="queryParams.deviceId"
                placeholder="请输入设备ID"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="用户ID" prop="userId">
              <el-input
                v-model="queryParams.userId"
                placeholder="请输入用户ID"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="对话类型" prop="chatKind">
              <el-input
                v-model="queryParams.chatKind"
                placeholder="请输入对话类型"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="5">
          </el-col>
          <el-col :span="5">
          </el-col>
          <el-col :span="5">
          </el-col>
          <el-col :span="5">
            <el-form-item class="search-btns">
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-table v-loading="loading" border :data="chatDetailList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column v-if="columns[0].visible" key="id" label="ID" align="center" prop="id" width="150" />
        <el-table-column v-if="columns[1].visible" key="callId" label="会话ID" align="center" prop="callId" :show-overflow-tooltip="true">
          <template #default="scope">
            <el-link type="primary" @click="copyCallId(scope.row.callId)" :underline="false">{{ scope.row.callId }}</el-link>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[2].visible" key="chatTime" label="对话时间" align="center" prop="chatTime" :show-overflow-tooltip="true" width="160">
          <template #default="scope">
            <span>{{ scope.row.chatTime }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[3].visible" key="questionKind" label="说话者类型" align="center" prop="questionKind" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[4].visible" key="questionName" label="说话者名称" align="center" prop="questionName" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[5].visible" key="content" label="对话内容" align="center" prop="content" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[6].visible" key="userId" label="用户ID" align="center" prop="userId" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[7].visible" key="agentId" label="智能体ID" align="center" prop="agentId" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[8].visible" key="deviceId" label="设备ID" align="center" prop="deviceId" :show-overflow-tooltip="true">
          <template #default="scope">
            <el-link type="primary" @click="copyDeviceId(scope.row.deviceId)" :underline="false">{{ scope.row.deviceId }}</el-link>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[9].visible" key="chatKind" label="对话类型" align="center" prop="chatKind" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[10].visible" label="创建时间" align="center" prop="createdAt" width="160">
          <template #default="scope">
            <span>{{ scope.row.createdAt }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="200" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['ai:chatDetail:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['ai:chatDetail:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>

            <el-tooltip content="查看详情" placement="top">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)">详情</el-button>
            </el-tooltip>

            <el-tooltip content="按会话查看" placement="top">
              <el-button link type="primary" icon="ChatLineRound" @click="handleViewBySession(scope.row)">会话</el-button>
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

    <!-- 添加或修改ChatDetail配置对话框 -->
    <el-dialog ref="formDialogRef" v-model="dialog.visible" :title="dialog.title" width="700px" append-to-body @close="closeDialog">
      <el-form ref="chatDetailFormRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="会话ID" prop="callId">
              <el-input v-model="form.callId" placeholder="请输入会话ID" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="对话时间" prop="chatTime">
              <el-date-picker
                v-model="form.chatTime"
                type="datetime"
                placeholder="请选择对话时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="说话者类型" prop="questionKind">
              <el-select v-model="form.questionKind" placeholder="请选择说话者类型" style="width: 100%">
                <el-option label="用户" value="PERSON" />
                <el-option label="智能体" value="AGENT" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="说话者名称" prop="questionName">
              <el-input v-model="form.questionName" placeholder="请输入说话者名称" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="对话内容" prop="content">
              <el-input v-model="form.content" type="textarea" :rows="4" placeholder="请输入对话内容" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户ID" prop="userId">
              <el-input v-model="form.userId" placeholder="请输入用户ID" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="智能体ID" prop="agentId">
              <el-input v-model="form.agentId" placeholder="请输入智能体ID" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="设备ID" prop="deviceId">
              <el-input v-model="form.deviceId" placeholder="请输入设备ID" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="对话类型" prop="chatKind">
              <el-input v-model="form.chatKind" placeholder="请输入对话类型(chat/pic/file/video)" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="对话文件ID" prop="chatId">
              <el-input v-model="form.chatId" placeholder="请输入对话文件ID" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否被打断" prop="isInterrupted">
              <el-switch v-model="form.isInterrupted" active-value="true" inactive-value="false"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="实际对话内容" prop="conversationContent">
              <el-input v-model="form.conversationContent" type="textarea" :rows="3" placeholder="请输入实际对话内容" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="经度" prop="longitude">
              <el-input v-model="form.longitude" placeholder="请输入经度" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度" prop="latitude">
              <el-input v-model="form.latitude" placeholder="请输入纬度" maxlength="50" />
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

    <!-- 聊天详情对话框 -->
    <el-dialog v-model="viewDialog.visible" :title="viewDialog.title" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ currentChatDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="会话ID">{{ currentChatDetail.callId }}</el-descriptions-item>
        <el-descriptions-item label="对话时间">{{ currentChatDetail.chatTime }}</el-descriptions-item>
        <el-descriptions-item label="说话者类型">{{ currentChatDetail.questionKind }}</el-descriptions-item>
        <el-descriptions-item label="说话者名称">{{ currentChatDetail.questionName }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentChatDetail.userId }}</el-descriptions-item>
        <el-descriptions-item label="智能体ID">{{ currentChatDetail.agentId }}</el-descriptions-item>
        <el-descriptions-item label="设备ID">{{ currentChatDetail.deviceId }}</el-descriptions-item>
        <el-descriptions-item label="对话类型">{{ currentChatDetail.chatKind }}</el-descriptions-item>
        <el-descriptions-item label="对话文件ID">{{ currentChatDetail.chatId }}</el-descriptions-item>
        <el-descriptions-item label="是否被打断">{{ currentChatDetail.isInterrupted ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="经度">{{ currentChatDetail.longitude }}</el-descriptions-item>
        <el-descriptions-item label="纬度">{{ currentChatDetail.latitude }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentChatDetail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentChatDetail.updatedAt }}</el-descriptions-item>
        <el-descriptions-item label="对话内容" :span="2">
          <div style="white-space: pre-wrap;">{{ currentChatDetail.content }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="实际对话内容" :span="2">
          <div style="white-space: pre-wrap;">{{ currentChatDetail.conversationContent }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 按会话查看对话框 -->
    <el-dialog v-model="sessionDialog.visible" :title="sessionDialog.title" width="900px" append-to-body>
      <div class="chat-session-container">
        <div class="chat-messages">
          <div
            v-for="message in sessionMessages"
            :key="message.id"
            :class="['message-item', message.questionKind === 'PERSON' ? 'user-message' : 'agent-message']"
          >
            <div class="message-header">
              <span class="message-sender">{{ message.questionName }}</span>
              <span class="message-time">{{ message.chatTime }}</span>
            </div>
            <div class="message-content">{{ message.content }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="ChatDetail" lang="ts">
import { listChatDetail, getChatDetail, addChatDetail, updateChatDetail, delChatDetail, getChatDetailsBySession } from '@/api/ai/chatDetail';
import { ChatDetailForm, ChatDetailQuery, ChatDetailVO } from '@/api/ai/chatDetail/types';
import { to } from 'await-to-js';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const chatDetailList = ref<ChatDetailVO[]>();
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: `ID`, visible: true, children: [] },
  { key: 1, label: `会话ID`, visible: true, children: [] },
  { key: 2, label: `对话时间`, visible: true, children: [] },
  { key: 3, label: `说话者类型`, visible: true, children: [] },
  { key: 4, label: `说话者名称`, visible: true, children: [] },
  { key: 5, label: `对话内容`, visible: true, children: [] },
  { key: 6, label: `用户ID`, visible: true, children: [] },
  { key: 7, label: `智能体ID`, visible: true, children: [] },
  { key: 8, label: `设备ID`, visible: true, children: [] },
  { key: 9, label: `对话类型`, visible: true, children: [] },
  { key: 10, label: `创建时间`, visible: true, children: [] }
]);

const chatDetailFormRef = ref<ElFormInstance>();
const formDialogRef = ref<ElDialogInstance>();
const queryFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const viewDialog = reactive<DialogOption>({
  visible: false,
  title: '聊天详情'
});

const sessionDialog = reactive<DialogOption>({
  visible: false,
  title: '会话详情'
});

const currentChatDetail = ref<ChatDetailVO>({});

const sessionMessages = ref<ChatDetailVO[]>([]);

const initFormData: ChatDetailForm = {
  id: undefined,
  callId: '',
  chatTime: undefined,
  questionKind: 'PERSON',
  questionName: '',
  content: '',
  voiceRemark: undefined,
  userId: '',
  agentId: '',
  deviceId: '',
  chatKind: 'chat',
  chatId: '',
  isInterrupted: false,
  conversationContent: '',
  longitude: '',
  latitude: ''
};

const initData: PageData<ChatDetailForm, ChatDetailQuery> = {
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    callId: '',
    questionKind: '',
    userId: '',
    agentId: '',
    deviceId: '',
    chatKind: undefined
  },
  rules: {
    callId: [
      { required: true, message: '会话ID不能为空', trigger: 'blur' }
    ],
    content: [
      { required: true, message: '对话内容不能为空', trigger: 'blur' }
    ]
  }
};

const data = reactive<PageData<ChatDetailForm, ChatDetailQuery>>(initData);

const { queryParams, form, rules } = toRefs<PageData<ChatDetailForm, ChatDetailQuery>>(data);

/** 查询ChatDetail列表 */
const getList = async () => {
  loading.value = true;
  const res = await listChatDetail(queryParams.value);
  loading.value = false;
  chatDetailList.value = res.rows || [];
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
  handleQuery();
};

/** 删除按钮操作 */
const handleDelete = async (row?: ChatDetailVO) => {
  const chatDetailIds = row?.id || ids.value;
  const [err] = await to(proxy?.$modal.confirm('是否确认删除聊天详情编号为"' + chatDetailIds + '"的数据项？') as any);
  if (!err) {
    const deleteIds = Array.isArray(chatDetailIds) ? chatDetailIds : [chatDetailIds];
    if (deleteIds.length === 1) {
      await delChatDetail(deleteIds[0]);
    } else {
      await batchDelChatDetail(deleteIds);
    }
    await getList();
    proxy?.$modal.msgSuccess('删除成功');
  }
};

/** 选择条数  */
const handleSelectionChange = (selection: ChatDetailVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 重置操作表单 */
const reset = () => {
  form.value = { ...initFormData };
  chatDetailFormRef.value?.resetFields();
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
  dialog.title = '新增聊天详情';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: ChatDetailForm) => {
  reset();
  const chatDetailId = row?.id || ids.value[0];
  const response = await getChatDetail(chatDetailId);
  dialog.visible = true;
  dialog.title = '修改聊天详情';
  Object.assign(form.value, response.data);
};

/** 提交按钮 */
const submitForm = () => {
  chatDetailFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.id) {
        await updateChatDetail(form.value);
      } else {
        await addChatDetail(form.value);
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/**
 * 关闭ChatDetail弹窗
 */
const closeDialog = () => {
  dialog.visible = false;
  resetForm();
};

/**
 * 重置表单
 */
const resetForm = () => {
  chatDetailFormRef.value?.resetFields();
  chatDetailFormRef.value?.clearValidate();

  form.value.id = undefined;
  form.value.questionKind = 'PERSON';
  form.value.chatKind = 'chat';
  form.value.isInterrupted = false;
};

/** 查看聊天详情 */
const handleView = (row: ChatDetailVO) => {
  currentChatDetail.value = { ...row };
  viewDialog.visible = true;
  viewDialog.title = `聊天详情 "${row.id}"`;
};

/** 按会话查看 */
const handleViewBySession = async (row: ChatDetailVO) => {
  try {
    const response = await getChatDetailsBySession(row.callId);
    sessionMessages.value = response.data || [];
    sessionDialog.visible = true;
    sessionDialog.title = `会话 "${row.callId}" 详情`;
  } catch (error) {
    proxy?.$modal.msgError('获取会话详情失败');
  }
};

/** 复制会话ID到搜索框 */
const copyCallId = (callId: string) => {
  queryParams.value.callId = callId;
  handleQuery(); // 自动搜索
  proxy?.$modal.msgSuccess('会话ID已复制到搜索框并执行搜索');
};

/** 复制设备ID到搜索框 */
const copyDeviceId = (deviceId: string) => {
  queryParams.value.deviceId = deviceId;
  handleQuery(); // 自动搜索
  proxy?.$modal.msgSuccess('设备ID已复制到搜索框并执行搜索');
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.chat-session-container {
  max-height: 600px;
  overflow-y: auto;
}

.chat-messages {
  display: flex;
  flex-direction: column;
}

.message-item {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
  max-width: 80%;
}

.user-message {
  align-self: flex-end;
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
}

.agent-message {
  align-self: flex-start;
  background-color: #f4f4f5;
  border: 1px solid #e9e9eb;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 12px;
  color: #909399;
}

.message-sender {
  font-weight: bold;
}

.message-time {
  color: #909399;
}

.message-content {
  word-wrap: break-word;
  white-space: pre-wrap;
}

.search-btns {
  text-align: right;
}
</style>
