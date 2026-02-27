<template>
  <div class="p-2">
    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button v-has-permi="['ai:device:add']" type="primary" plain icon="Plus" @click="handleAdd()">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-has-permi="['ai:device:edit']" type="success" plain :disabled="single" icon="Edit" @click="handleUpdate()">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-has-permi="['ai:device:remove']" type="danger" plain :disabled="multiple" icon="Delete" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-has-permi="['ai:device:add']" type="warning" plain icon="Key" @click="handleAddByVerifyCode()">通过验证码添加</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" :columns="columns" :search="true" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="deviceList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column v-if="columns[0].visible" key="id" label="设备ID" align="center" prop="id" width="150" />
        <el-table-column v-if="columns[1].visible" key="name" label="设备名称" align="center" prop="name" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[2].visible" key="serialNumber" label="设备串号" align="center" prop="serialNumber" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[3].visible" key="deviceKind" label="设备类型" align="center" prop="deviceKind" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[4].visible" key="programKind" label="程序名称" align="center" prop="programKind" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[5].visible" key="programVer" label="程序版本" align="center" prop="programVer" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[6].visible" key="deviceState" label="设备状态" align="center" prop="deviceState" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[7].visible" label="状态" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.deviceState" :active-value="'ONLINE'" :inactive-value="'OFFLINE'" ></el-switch>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[8].visible" key="agentName" label="关联智能体" align="center" prop="agentName" :show-overflow-tooltip="true">
          <template #default="scope">
            <span v-if="scope.row.agentId" class="link-type" @click="handleViewAgent(scope.row)">
              {{ scope.row.agentName || '查看智能体' }}
            </span>
            <span v-else>未绑定</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[9].visible" label="创建时间" align="center" prop="createdAt" width="160">
          <template #default="scope">
            <span>{{ scope.row.createdAt }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="220" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['ai:device:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['ai:device:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>

            <el-tooltip content="绑定智能体" placement="top">
              <el-button link type="primary" icon="Link" @click="handleBindAgent(scope.row)">绑定</el-button>
            </el-tooltip>

            <el-tooltip content="设备详情" placement="top">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)">详情</el-button>
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

    <!-- 添加或修改Device配置对话框 -->
    <el-dialog ref="formDialogRef" v-model="dialog.visible" :title="dialog.title" width="600px" append-to-body @close="closeDialog">
      <el-form ref="deviceFormRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="设备名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入设备名称" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="设备串号" prop="serialNumber">
              <el-input v-model="form.serialNumber" placeholder="请输入设备串号" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="设备验证码" prop="verifyCode">
              <el-input v-model="form.verifyCode" placeholder="请输入设备验证码" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="设备类型" prop="deviceKind">
              <el-input v-model="form.deviceKind" placeholder="请输入设备类型" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备状态" prop="deviceState">
              <el-select v-model="form.deviceState" placeholder="请选择设备状态" style="width: 100%">
                <el-option label="在线" value="ONLINE" />
                <el-option label="离线" value="OFFLINE" />
                <el-option label="待激活" value="PENDING" />
                <el-option label="激活" value="ACTIVE" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="程序名称" prop="programKind">
              <el-input v-model="form.programKind" placeholder="请输入程序名称" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="程序版本" prop="programVer">
              <el-input v-model="form.programVer" placeholder="请输入程序版本" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="音量" prop="volume">
              <el-input-number v-model="form.volume" :min="0" :max="100" placeholder="请输入音量" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="亮度" prop="brightness">
              <el-input-number v-model="form.brightness" :min="0" :max="100" placeholder="请输入亮度" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否可更新" prop="isUpdatable">
              <el-select v-model="form.isUpdatable" placeholder="是否可更新" style="width: 100%">
                <el-option label="是" value="true" />
                <el-option label="否" value="false" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本类型" prop="versionType">
              <el-input v-model="form.versionType" placeholder="请输入版本类型" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="程序更新时间" prop="programUpdateTime">
              <el-date-picker
                v-model="form.programUpdateTime"
                type="datetime"
                placeholder="请选择程序更新时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="设备拓展信息" prop="detailInfo">
              <el-input v-model="form.detailInfo" type="textarea" :rows="3" placeholder="请输入设备拓展信息(json格式)" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="OTA更新URL" prop="otaUpdateUrl">
              <el-input v-model="form.otaUpdateUrl" placeholder="请输入OTA更新URL" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
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

    <!-- 绑定智能体对话框 -->
    <el-dialog v-model="bindDialog.visible" :title="bindDialog.title" width="500px" append-to-body>
      <el-form ref="bindFormRef" :model="bindForm" :rules="bindRules" label-width="100px">
        <el-form-item label="智能体ID" prop="agentId">
          <el-input v-model="bindForm.agentId" placeholder="请输入要绑定的智能体ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitBindForm">确 定</el-button>
          <el-button @click="cancelBind()">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设备详情对话框 -->
    <el-dialog v-model="viewDialog.visible" :title="viewDialog.title" width="600px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="设备ID">{{ currentDevice.id }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ currentDevice.name }}</el-descriptions-item>
        <el-descriptions-item label="设备串号">{{ currentDevice.serialNumber }}</el-descriptions-item>
        <el-descriptions-item label="设备验证码">{{ currentDevice.verifyCode }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">{{ currentDevice.deviceKind }}</el-descriptions-item>
        <el-descriptions-item label="设备状态">{{ currentDevice.deviceState }}</el-descriptions-item>
        <el-descriptions-item label="程序名称">{{ currentDevice.programKind }}</el-descriptions-item>
        <el-descriptions-item label="程序版本">{{ currentDevice.programVer }}</el-descriptions-item>
        <el-descriptions-item label="音量">{{ currentDevice.volume }}</el-descriptions-item>
        <el-descriptions-item label="亮度">{{ currentDevice.brightness }}</el-descriptions-item>
        <el-descriptions-item label="是否可更新">{{ currentDevice.isUpdatable }}</el-descriptions-item>
        <el-descriptions-item label="版本类型">{{ currentDevice.versionType }}</el-descriptions-item>
        <el-descriptions-item label="程序更新时间">{{ currentDevice.programUpdateTime }}</el-descriptions-item>
        <el-descriptions-item label="AES密钥">{{ currentDevice.aesKey }}</el-descriptions-item>
        <el-descriptions-item label="AES随机数">{{ currentDevice.aesNonce }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ currentDevice.remark }}</el-descriptions-item>
        <el-descriptions-item label="绑定智能体">
          <span v-if="currentDevice.agentId" class="link-type" @click="handleViewAgentDetail(currentDevice)">
            {{ currentDevice.agentName || '查看智能体' }}
          </span>
          <span v-else>未绑定</span>
        </el-descriptions-item>
        <el-descriptions-item label="绑定智能体ID">{{ currentDevice.agentId || '未绑定' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentDevice.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentDevice.updatedAt }}</el-descriptions-item>
        <el-descriptions-item label="设备拓展信息" :span="2">
          <pre>{{ currentDevice.detailInfo }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 通过验证码添加设备对话框 -->
    <el-dialog v-model="verifyCodeDialog.visible" :title="verifyCodeDialog.title" width="400px" append-to-body>
      <el-form ref="verifyCodeFormRef" :model="verifyCodeForm" :rules="verifyCodeRules" label-width="100px">
        <el-form-item label="设备验证码" prop="verifyCode">
          <el-input v-model="verifyCodeForm.verifyCode" placeholder="请输入设备验证码" maxlength="50" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitVerifyCodeForm">确 定</el-button>
          <el-button @click="cancelVerifyCode()">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Device" lang="ts">
import { listDeviceInfo, getDeviceInfo, addDeviceInfo, updateDeviceInfo, delDeviceInfo, toggleDeviceState, bindAgentToDevice, addDeviceByVerifyCode } from '@/api/ai/device';
import { useUserStore } from '@/store/modules/user';
import { getAgent } from '@/api/ai/agent';
import { DeviceInfoForm, DeviceInfoQuery, DeviceInfoVO } from '@/api/ai/device/types';
import { to } from 'await-to-js';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const deviceList = ref<DeviceInfoVO[]>();
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: `设备ID`, visible: true, children: [] },
  { key: 1, label: `设备名称`, visible: true, children: [] },
  { key: 2, label: `设备串号`, visible: true, children: [] },
  { key: 3, label: `设备类型`, visible: true, children: [] },
  { key: 4, label: `程序名称`, visible: true, children: [] },
  { key: 5, label: `程序版本`, visible: true, children: [] },
  { key: 6, label: `设备状态`, visible: true, children: [] },
  { key: 7, label: `状态开关`, visible: true, children: [] },
  { key: 8, label: `关联智能体`, visible: true, children: [] },
  { key: 9, label: `创建时间`, visible: true, children: [] }
]);

const deviceFormRef = ref<ElFormInstance>();
const formDialogRef = ref<ElDialogInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const bindDialog = reactive<DialogOption>({
  visible: false,
  title: '绑定智能体'
});

const viewDialog = reactive<DialogOption>({
  visible: false,
  title: '设备详情'
});

// 验证码对话框
const verifyCodeDialog = reactive<DialogOption>({
  visible: false,
  title: '通过验证码添加设备'
});

const currentDevice = ref<DeviceInfoVO>({});

const bindFormRef = ref<ElFormInstance>();
const bindForm = ref({
  agentId: '',
  deviceId: ''
});

const bindRules = ref({
  agentId: [
    { required: true, message: '智能体ID不能为空', trigger: 'blur' }
  ]
});

// 验证码表单
const verifyCodeFormRef = ref<ElFormInstance>();
const verifyCodeForm = ref({
  verifyCode: ''
});

const verifyCodeRules = ref({
  verifyCode: [
    { required: true, message: '设备验证码不能为空', trigger: 'blur' }
  ]
});

const initFormData: DeviceInfoForm = {
  id: undefined,
  name: '',
  serialNumber: '',
  verifyCode: '',
  deviceKind: '',
  deviceState: 'PENDING',
  programKind: '',
  programVer: '',
  volume: 50,
  brightness: 50,
  isUpdatable: 'true',
  versionType: '',
  programUpdateTime: undefined,
  detailInfo: '',
  otaUpdateUrl: '',
  aesKey: '',
  aesNonce: '',
  remark: '',
  agentId: undefined
};

const initData: PageData<DeviceInfoForm, DeviceInfoQuery> = {
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: '',
    deviceKind: '',
    deviceState: undefined,
    serialNumber: ''
  },
  rules: {
    name: [
      { required: true, message: '设备名称不能为空', trigger: 'blur' },
      { min: 2, max: 50, message: '设备名称长度必须介于 2 和 50 之间', trigger: 'blur' }
    ],
    serialNumber: [
      { required: true, message: '设备串号不能为空', trigger: 'blur' }
    ],
    deviceKind: [
      { required: true, message: '设备类型不能为空', trigger: 'blur' }
    ]
  }
};

const data = reactive<PageData<DeviceInfoForm, DeviceInfoQuery>>(initData);

const { queryParams, form, rules } = toRefs<PageData<DeviceInfoForm, DeviceInfoQuery>>(data);

/** 查询DeviceInfo列表 */
const getList = async () => {
  loading.value = true;
  const res = await listDeviceInfo(queryParams.value);
  loading.value = false;
  deviceList.value = res.rows || [];
  total.value = res.total || 0;

  // 获取所有设备关联的智能体名称
  await fetchAgentNamesForDevices();
};

/** 批量获取设备关联的智能体名称 */
const fetchAgentNamesForDevices = async () => {
  if (deviceList.value && deviceList.value.length > 0) {
    // 收集所有唯一的agentId
    const agentIds = [...new Set(deviceList.value.filter(device => device.agentId).map(device => device.agentId))];

    if (agentIds.length > 0) {
      // 批量获取智能体信息
      for (const agentId of agentIds) {
        try {
          const agentRes = await getAgent(agentId);
          const agentName = agentRes.data?.agentName || '智能体';

          // 为所有关联此智能体的设备设置名称
          deviceList.value
            .filter(device => device.agentId === agentId)
            .forEach(device => device.agentName = agentName);
        } catch (error) {
          console.error(`获取智能体信息失败: ${agentId}`, error);

          // 为所有关联此智能体的设备设置默认名称
          deviceList.value
            .filter(device => device.agentId === agentId)
            .forEach(device => device.agentName = '智能体');
        }
      }
    }
  }
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.value.pageNum = 1;
  handleQuery();
};

/** 删除按钮操作 */
const handleDelete = async (row?: DeviceInfoVO) => {
  const deviceIds = row?.id || ids.value;
  const [err] = await to(proxy?.$modal.confirm('是否确认删除设备编号为"' + deviceIds + '"的数据项？') as any);
  if (!err) {
    const deleteIds = Array.isArray(deviceIds) ? deviceIds : [deviceIds];
    if (deleteIds.length === 1) {
      await delDeviceInfo(deleteIds[0]);
    } else {
      await batchDelDeviceInfo(deleteIds);
    }
    await getList();
    proxy?.$modal.msgSuccess('删除成功');
  }
};

/** Device状态修改  */
const handleStatusChange = async (row: DeviceInfoVO) => {
  // 验证设备名称是否存在，避免undefined情况
  const deviceName = row.name || '未知设备';
  const text = row.deviceState === 'ONLINE' ? '上线' : '下线';
  try {
    await proxy?.$modal.confirm('确认要"' + text + '""' + deviceName + '"设备吗?');
    await toggleDeviceState(row.id, row.deviceState);
    proxy?.$modal.msgSuccess(text + '成功');
  } catch (err) {
    // 用户取消操作时，恢复原状态
    row.deviceState = row.deviceState === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
  }
};

/** 选择条数  */
const handleSelectionChange = (selection: DeviceInfoVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 重置操作表单 */
const reset = () => {
  form.value = { ...initFormData };
  deviceFormRef.value?.resetFields();
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
  dialog.title = '新增设备';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: DeviceInfoForm) => {
  reset();
  const deviceId = row?.id || ids.value[0];
  const response = await getDeviceInfo(deviceId);
  dialog.visible = true;
  dialog.title = '修改设备';
  Object.assign(form.value, response.data);
};

/** 提交按钮 */
const submitForm = () => {
  deviceFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.id) {
        await updateDeviceInfo(form.value);
      } else {
        await addDeviceInfo(form.value);
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/**
 * 关闭Device弹窗
 */
const closeDialog = () => {
  dialog.visible = false;
  resetForm();
};

/**
 * 重置表单
 */
const resetForm = () => {
  deviceFormRef.value?.resetFields();
  deviceFormRef.value?.clearValidate();

  form.value.id = undefined;
  form.value.deviceState = 'PENDING';
};

/** 绑定智能体 */
const handleBindAgent = async (row: DeviceInfoVO) => {
  bindForm.value = {
    agentId: row.agentId || '',
    deviceId: row.id
  };
  bindDialog.visible = true;
  bindDialog.title = `为设备 "${row.name}" 绑定智能体`;
};

/** 提交绑定表单 */
const submitBindForm = async () => {
  bindFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const data = {
          agentId: bindForm.value.agentId
        };
        await bindAgentToDevice(bindForm.value.deviceId, data);
        proxy?.$modal.msgSuccess('绑定成功');
        bindDialog.visible = false;
        await getList();
      } catch (error) {
        proxy?.$modal.msgError('绑定失败');
      }
    }
  });
};

/** 取消绑定 */
const cancelBind = () => {
  bindDialog.visible = false;
  bindFormRef.value?.resetFields();
};

/** 查看设备详情 */
const handleView = (row: DeviceInfoVO) => {
  currentDevice.value = { ...row };
  viewDialog.visible = true;
  viewDialog.title = `设备 "${row.name}" 详情`;
};

/** 查看关联的智能体 */
const handleViewAgent = (row: DeviceInfoVO) => {
  if (row.agentId) {
    router.push(`/ai/Agent?id=${row.agentId}`);
  }
};

/** 查看关联的智能体详情 */
const handleViewAgentDetail = (row: DeviceInfoVO) => {
  if (row.agentId) {
    router.push(`/ai/Agent?id=${row.agentId}`);
  }
};

/** 通过验证码添加设备 */
const handleAddByVerifyCode = () => {
  verifyCodeForm.value = {
    verifyCode: ''
  };
  verifyCodeDialog.visible = true;
};

/** 提交验证码表单 */
const submitVerifyCodeForm = () => {
  verifyCodeFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await addDeviceByVerifyCode(verifyCodeForm.value.verifyCode);
        proxy?.$modal.msgSuccess('添加成功');
        verifyCodeDialog.visible = false;
        await getList();
      } catch (error) {
        proxy?.$modal.msgError('添加失败');
      }
    }
  });
};

/** 取消验证码表单 */
const cancelVerifyCode = () => {
  verifyCodeDialog.visible = false;
  verifyCodeFormRef.value?.resetFields();
};

onMounted(() => {
  getList();
});
</script>
