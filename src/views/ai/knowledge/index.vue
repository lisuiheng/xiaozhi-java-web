<template>
  <div class="p-2">
    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button v-has-permi="['ai:knowledge:add']" type="primary" plain icon="Plus" @click="handleAdd()">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-has-permi="['ai:knowledge:edit']" type="success" plain :disabled="single" icon="Edit" @click="handleUpdate()">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-has-permi="['ai:knowledge:remove']" type="danger" plain :disabled="multiple" icon="Delete" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" :columns="columns" :search="true" @query-table="getList"></right-toolbar>
        </el-row>
        <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="知识库ID" prop="id">
            <el-input
              v-model="queryParams.id"
              placeholder="请输入知识库ID"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="知识库名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入知识库名称"
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

      <el-table v-loading="loading" border :data="knowledgeBaseList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column v-if="columns[0].visible" key="id" label="知识库ID" align="center" prop="id" width="150" />
        <el-table-column v-if="columns[1].visible" key="name" label="知识库名称" align="center" prop="name" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[2].visible" key="description" label="描述" align="center" prop="description" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[3].visible" key="totalDocuments" label="文档数" align="center" prop="totalDocuments" />
        <el-table-column v-if="columns[4].visible" key="totalChunks" label="分块数" align="center" prop="totalChunks" />
        <el-table-column v-if="columns[5].visible" key="status" label="状态" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[6].visible" label="创建时间" align="center" prop="createdAt" width="160">
          <template #default="scope">
            <span>{{ scope.row.createdAt }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="220" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['ai:knowledge:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['ai:knowledge:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="文档管理" placement="top">
              <el-button link type="primary" icon="FolderOpened" @click="handleManageDocuments(scope.row)">文档</el-button>
            </el-tooltip>
            <el-tooltip content="同步知识库" placement="top">
              <el-button link type="primary" icon="Refresh" @click="handleSyncKnowledgeBase(scope.row)">同步</el-button>
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

    <!-- 添加或修改知识库配置对话框 -->
    <el-dialog ref="formDialogRef" v-model="dialog.visible" :title="dialog.title" width="600px" append-to-body @close="closeDialog">
      <el-form ref="knowledgeBaseFormRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="知识库名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入知识库名称" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input v-model="form.description" type="textarea" placeholder="请输入描述" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :value="1">启用</el-radio>
                <el-radio :value="0">禁用</el-radio>
              </el-radio-group>
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

    <!-- 文档管理对话框 -->
    <el-dialog ref="documentDialogRef" v-model="documentDialog.visible" :title="documentDialog.title" width="800px" append-to-body @close="closeDocumentDialog">
      <div class="mb-3">
        <el-row :gutter="10" class="mb-2">
          <el-col :span="12">
            <el-button v-has-permi="['ai:knowledge:document:add']" type="primary" plain icon="Plus" @click="handleAddDocument()">新增文档</el-button>
          </el-col>
          <el-col :span="12">
            <el-input
              v-model="documentQueryParams.keyword"
              placeholder="请输入文档名称"
              clearable
              style="width: 200px"
              @keyup.enter="handleDocumentQuery"
            />
            <el-button type="primary" icon="Search" @click="handleDocumentQuery" class="ml-2">搜索</el-button>
          </el-col>
        </el-row>

        <el-table v-loading="documentLoading" border :data="documentList" @selection-change="handleDocumentSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="文档名称" prop="docName" :show-overflow-tooltip="true" />
          <el-table-column label="文件名" prop="fileName" :show-overflow-tooltip="true" />
          <el-table-column label="文件大小" prop="fileSize" :formatter="formatFileSize" />
          <el-table-column label="文件类型" prop="fileType" />
          <el-table-column label="内容" :formatter="formatContent" :show-overflow-tooltip="true" />
          <el-table-column label="分块数" prop="totalChunks" />
          <el-table-column label="状态" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '已处理' : '待处理' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button link type="primary" icon="Edit" @click="handleUpdateDocument(scope.row)">编辑</el-button>
              <el-button link type="primary" icon="Delete" @click="handleDeleteDocument(scope.row)">删除</el-button>
              <el-button link type="primary" icon="Refresh" @click="handleRegenerateEmbedding(scope.row)">重向量化</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="documentTotal > 0"
          v-model:page="documentQueryParams.pageNum"
          v-model:limit="documentQueryParams.pageSize"
          :total="documentTotal"
          @pagination="getDocumentList"
        />
      </div>

      <!-- 文档上传表单 -->
      <el-form v-if="documentDialog.mode === 'add'" ref="documentFormRef" :model="documentForm" :rules="documentRules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="文档名称" prop="docName">
              <el-input v-model="documentForm.docName" placeholder="请输入文档名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="文档内容" prop="content">
              <el-input v-model="documentForm.content" type="textarea" :rows="6" placeholder="请输入文档内容" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 文件上传区域 -->
      <div v-if="documentDialog.mode === 'upload'" class="upload-area">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :multiple="false"
          :limit="1"
          :on-change="handleFileChange"
          :file-list="fileList"
          :accept="'.txt,.pdf,.doc,.docx,.md'"
        >
          <template #trigger>
            <el-button icon="Upload">选择文件</el-button>
          </template>
          <el-button class="ml-3" size="small" @click="submitUpload">上传到知识库</el-button>
          <template #tip>
            <div class="el-upload__tip">支持上传txt、pdf、doc、docx、md格式文件</div>
          </template>
        </el-upload>
      </div>

      <!-- 文档添加/上传对话框底部按钮 -->
      <template #footer v-if="documentDialog.mode !== 'list'">
        <div class="dialog-footer">
          <el-button v-if="documentDialog.mode === 'add'" type="primary" @click="submitDocument">确 定</el-button>
          <el-button v-if="documentDialog.mode === 'upload'" type="primary" @click="submitUpload">上传到知识库</el-button>
          <el-button @click="cancelAddDocument">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 文档编辑对话框 -->
    <el-dialog ref="editDocumentDialogRef" v-model="editDocumentDialog.visible" :title="editDocumentDialog.title" width="800px" append-to-body @close="closeEditDocumentDialog">
      <el-form ref="editDocumentFormRef" :model="editDocumentForm" :rules="editDocumentRules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="文档名称" prop="docName">
              <el-input v-model="editDocumentForm.docName" placeholder="请输入文档名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="文档内容" prop="content">
              <el-input v-model="editDocumentForm.content" type="textarea" :rows="10" placeholder="请输入文档内容" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitEditDocumentForm">确 定</el-button>
          <el-button @click="cancelEditDocument()">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="KnowledgeBase" lang="ts">
import { listKnowledgeBase, getKnowledgeBase, addKnowledgeBase, updateKnowledgeBase, delKnowledgeBase, getKnowledgeBaseStats, getDocumentsByKbId, addDocument, updateDocument, delDocument, uploadAndAddDocument, regenerateEmbedding, syncKnowledgeBase } from '@/api/ai/knowledge';
import { KnowledgeBaseForm, KnowledgeBaseVO, KnowledgeBaseQuery, DocumentVO, DocumentQuery, AddDocumentRequest, UpdateDocumentRequest } from '@/api/ai/knowledge/types';
import { to } from 'await-to-js';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const knowledgeBaseList = ref<KnowledgeBaseVO[]>();
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: `知识库ID`, visible: true, children: [] },
  { key: 1, label: `知识库名称`, visible: true, children: [] },
  { key: 2, label: `描述`, visible: true, children: [] },
  { key: 3, label: `文档数`, visible: true, children: [] },
  { key: 4, label: `分块数`, visible: true, children: [] },
  { key: 5, label: `状态`, visible: true, children: [] },
  { key: 6, label: `创建时间`, visible: true, children: [] }
]);

const knowledgeBaseFormRef = ref<ElFormInstance>();
const formDialogRef = ref<ElDialogInstance>();
const documentDialogRef = ref<ElDialogInstance>();
const editDocumentDialogRef = ref<ElDialogInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const documentDialog = reactive<DialogOption & { kbId?: string, mode?: string }>({
  visible: false,
  title: '',
  kbId: '',
  mode: 'list' // list, add, upload
});

const editDocumentDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const queryFormRef = ref<ElFormInstance>();
const documentFormRef = ref<ElFormInstance>();
const editDocumentFormRef = ref<ElFormInstance>();
const uploadRef = ref();

const initFormData: KnowledgeBaseForm = {
  id: undefined,
  name: '',
  description: '',
  status: 1
};

const initDocumentData: AddDocumentRequest = {
  kbId: '',
  docName: '',
  fileType: 'text',
  content: ''
};

const initData: PageData<KnowledgeBaseForm, KnowledgeBaseQuery> = {
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    id: '',
    name: '',
    status: undefined
  },
  rules: {
    name: [
      { required: true, message: '知识库名称不能为空', trigger: 'blur' },
      { min: 2, max: 50, message: '知识库名称长度必须介于 2 和 50 之间', trigger: 'blur' }
    ]
  }
};

const data = reactive<PageData<KnowledgeBaseForm, KnowledgeBaseQuery>>(initData);

const { queryParams, form, rules } = toRefs<PageData<KnowledgeBaseForm, KnowledgeBaseQuery>>(data);

// 文档管理相关数据
const documentList = ref<DocumentVO[]>();
const documentLoading = ref(false);
const documentIds = ref<Array<string | number>>([]);
const documentSingle = ref(true);
const documentMultiple = ref(true);
const documentTotal = ref(0);

const documentQueryParams = reactive<DocumentQuery>({
  pageNum: 1,
  pageSize: 10,
  kbId: '',
  keyword: ''
});

const documentForm = ref<AddDocumentRequest>({ ...initDocumentData });
const editDocumentForm = ref<UpdateDocumentRequest>({ content: '', docName: '' });

const documentRules = {
  docName: [
    { required: true, message: '文档名称不能为空', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '文档内容不能为空', trigger: 'blur' }
  ]
};

const editDocumentRules = {
  docName: [
    { required: true, message: '文档名称不能为空', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '文档内容不能为空', trigger: 'blur' }
  ]
};

const fileList = ref<any[]>([]);

// 从URL参数中获取查询条件并自动填充
const route = useRoute();

// 初始化时从URL参数获取查询条件
onMounted(() => {
  // 从URL参数中获取查询条件
  const { id, name } = route.query;

  if (id) {
    queryParams.value.id = String(id);
  }
  if (name) {
    queryParams.value.name = String(name);
  }

  // 如果URL中有查询参数，则执行查询
  if (id || name) {
    getList();
  } else {
    // 否则执行默认查询
    getList();
  }
});

/** 查询知识库列表 */
const getList = async () => {
  loading.value = true;
  const res = await listKnowledgeBase(queryParams.value);
  loading.value = false;
  knowledgeBaseList.value = res.rows || [];
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
  queryParams.value.name = '';
  queryParams.value.status = undefined;
  handleQuery();
};

/** 删除按钮操作 */
const handleDelete = async (row?: KnowledgeBaseVO) => {
  const kbIds = row?.id || ids.value;
  const [err] = await to(proxy?.$modal.confirm('是否确认删除知识库编号为"' + kbIds + '"的数据项？') as any);
  if (!err) {
    const deleteIds = Array.isArray(kbIds) ? kbIds : [kbIds];
    if (deleteIds.length === 1) {
      await delKnowledgeBase(deleteIds[0]);
    } else {
      // 批量删除暂未实现，这里只删除单个
      await delKnowledgeBase(deleteIds[0]);
    }
    await getList();
    proxy?.$modal.msgSuccess('删除成功');
  }
};

/** 知识库状态修改  */
const handleStatusChange = async (row: KnowledgeBaseVO) => {
  const text = row.status === 1 ? '启用' : '禁用';
  try {
    await proxy?.$modal.confirm('确认要"' + text + '""' + row.name + '"知识库吗?');
    // 这里需要后端提供切换状态的API
    proxy?.$modal.msgSuccess(text + '成功');
  } catch (err) {
    row.status = row.status === 1 ? 0 : 1;
  }
};

/** 选择条数  */
const handleSelectionChange = (selection: KnowledgeBaseVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 重置操作表单 */
const reset = () => {
  form.value = { ...initFormData };
  knowledgeBaseFormRef.value?.resetFields();
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
  dialog.title = '新增知识库';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: KnowledgeBaseForm) => {
  reset();
  const kbId = row?.id || ids.value[0];
  const response = await getKnowledgeBase(kbId);
  dialog.visible = true;
  dialog.title = '修改知识库';
  Object.assign(form.value, response.data);
};

/** 提交按钮 */
const submitForm = () => {
  knowledgeBaseFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.id) {
        await updateKnowledgeBase(form.value);
      } else {
        await addKnowledgeBase(form.value);
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/**
 * 关闭知识库弹窗
 */
const closeDialog = () => {
  dialog.visible = false;
  resetForm();
};

/**
 * 重置表单
 */
const resetForm = () => {
  knowledgeBaseFormRef.value?.resetFields();
  knowledgeBaseFormRef.value?.clearValidate();

  form.value.id = undefined;
  form.value.status = 1;
};

// 文档管理相关方法
/** 管理文档 */
const handleManageDocuments = async (row: KnowledgeBaseVO) => {
  documentDialog.kbId = row.id;
  documentDialog.visible = true;
  documentDialog.title = `文档管理 - ${row.name}`;
  documentDialog.mode = 'list';
  await getDocumentList();
};

/** 获取文档列表 */
const getDocumentList = async () => {
  if (!documentDialog.kbId) return;

  documentLoading.value = true;
  documentQueryParams.kbId = documentDialog.kbId;
  const res = await getDocumentsByKbId(documentQueryParams.kbId, documentQueryParams.pageNum, documentQueryParams.pageSize, documentQueryParams.keyword);
  documentLoading.value = false;
  documentList.value = res.rows || [];
  documentTotal.value = res.total || 0;
};

/** 添加文档 */
const handleAddDocument = () => {
  documentDialog.mode = 'add';
  documentForm.value = { ...initDocumentData };
  documentForm.value.kbId = documentDialog.kbId || '';
  documentFormRef.value?.resetFields();
};

/** 上传文档 */
const handleUploadDocument = () => {
  documentDialog.mode = 'upload';
  fileList.value = [];
};

/** 文档搜索 */
const handleDocumentQuery = () => {
  documentQueryParams.pageNum = 1;
  getDocumentList();
};

/** 选择文档 */
const handleDocumentSelectionChange = (selection: DocumentVO[]) => {
  documentIds.value = selection.map((item) => item.id);
  documentSingle.value = selection.length != 1;
  documentMultiple.value = !selection.length;
};

/** 格式化文件大小 */
const formatFileSize = (row: DocumentVO, column: any, cellValue: any) => {
  if (!cellValue) return '-';
  const size = Number(cellValue);
  if (size < 1024) {
    return size + ' B';
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB';
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB';
  }
};

/** 格式化内容显示 */
const formatContent = (row: DocumentVO, column: any, cellValue: any) => {
  if (!cellValue) return '-';
  // 限制内容显示长度，避免内容过长影响表格显示
  const content = String(cellValue);
  return content.length > 100 ? content.substring(0, 100) + '...' : content;
};

/** 提交文档 */
const submitDocument = async () => {
  if (documentDialog.mode === 'add') {
    // 添加文本文档
    await addDocument(documentForm.value);
    proxy?.$modal.msgSuccess('文档添加成功');
    documentDialog.mode = 'list';
    await getDocumentList();
  }
};

/** 取消添加文档 */
const cancelAddDocument = () => {
  documentDialog.mode = 'list';
  documentFormRef.value?.resetFields();
};

/** 文件变更 */
const handleFileChange = (file: any) => {
  fileList.value = [file];
};

/** 提交上传 */
const submitUpload = async () => {
  if (!fileList.value.length) {
    proxy?.$modal.msgError('请选择要上传的文件');
    return;
  }

  const file = fileList.value[0].raw;
  try {
    await uploadAndAddDocument(documentDialog.kbId || '', file);
    proxy?.$modal.msgSuccess('文件上传成功');
    documentDialog.mode = 'list';
    fileList.value = [];
    await getDocumentList();
  } catch (error) {
    proxy?.$modal.msgError('文件上传失败');
  }
};

/** 删除文档 */
const handleDeleteDocument = async (row: DocumentVO) => {
  const [err] = await to(proxy?.$modal.confirm('是否确认删除文档"' + row.docName + '"？') as any);
  if (!err) {
    await delDocument(row.id);
    proxy?.$modal.msgSuccess('删除成功');
    await getDocumentList();
  }
};

/** 编辑文档 */
const handleUpdateDocument = (row: DocumentVO) => {
  editDocumentForm.value = { docName: row.docName, content: row.content || '' };
  editDocumentDialog.visible = true;
  editDocumentDialog.title = '编辑文档 - ' + row.docName;
  editDocumentFormRef.value?.resetFields();
};

/** 提交编辑文档表单 */
const submitEditDocumentForm = () => {
  editDocumentFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (!documentIds.value.length) return;
      await updateDocument(documentIds.value[0] as string, editDocumentForm.value);
      proxy?.$modal.msgSuccess('文档更新成功');
      editDocumentDialog.visible = false;
      await getDocumentList();
    }
  });
};

/** 取消编辑文档 */
const cancelEditDocument = () => {
  editDocumentDialog.visible = false;
  editDocumentFormRef.value?.resetFields();
};

/** 关闭编辑文档对话框 */
const closeEditDocumentDialog = () => {
  editDocumentDialog.visible = false;
  editDocumentFormRef.value?.resetFields();
};

/** 重新生成向量 */
const handleRegenerateEmbedding = async (row: DocumentVO) => {
  const [err] = await to(proxy?.$modal.confirm('是否确认重新生成文档"' + row.docName + '"的向量？') as any);
  if (!err) {
    await regenerateEmbedding(row.id);
    proxy?.$modal.msgSuccess('向量重新生成成功');
    await getDocumentList();
  }
};

/** 同步知识库 */
const handleSyncKnowledgeBase = async (row: KnowledgeBaseVO) => {
  const [err] = await to(proxy?.$modal.confirm('是否确认同步知识库"' + row.name + '"到向量数据库？') as any);
  if (!err) {
    const result = await syncKnowledgeBase(row.id);
    if (result.success) {
      proxy?.$modal.msgSuccess(`同步成功，处理了${result.processedCount}个文档，成功${result.successCount}个，失败${result.errorCount}个`);
    } else {
      proxy?.$modal.msgError(`同步失败：${result.message}`);
    }
    await getDocumentList();
  }
};

/** 关闭文档对话框 */
const closeDocumentDialog = () => {
  documentDialog.visible = false;
  documentDialog.mode = 'list';
  documentFormRef.value?.resetFields();
};
</script>
