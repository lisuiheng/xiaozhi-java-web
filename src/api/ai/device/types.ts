/**
 * DeviceInfo信息类型定义
 */

/**
 * DeviceInfo查询对象类型
 */
export interface DeviceInfoQuery extends PageQuery {
  name?: string;
  deviceKind?: string;
  deviceState?: string;
  serialNumber?: string;
}

/**
 * DeviceInfo返回对象类型
 */
export interface DeviceInfoVO {
  id: string;
  name: string;
  serialNumber: string;
  verifyCode: string;
  deviceKind: string;
  deviceState: string;
  programKind: string;
  programVer: string;
  volume?: number;
  brightness?: number;
  isUpdatable: string;
  versionType?: string;
  programUpdateTime?: string;
  detailInfo?: string;
  otaUpdateUrl?: string;
  aesKey?: string;
  aesNonce?: string;
  remark?: string;
  agentId?: string;
  userId?: string;
  agentName?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * DeviceInfo表单类型
 */
export interface DeviceInfoForm {
  id?: string;
  name: string;
  serialNumber: string;
  verifyCode: string;
  deviceKind: string;
  deviceState: string;
  programKind: string;
  programVer: string;
  volume?: number;
  brightness?: number;
  isUpdatable: string;
  versionType?: string;
  programUpdateTime?: string;
  detailInfo?: string;
  otaUpdateUrl?: string;
  aesKey?: string;
  aesNonce?: string;
  remark?: string;
  agentId?: string;
  userId?: string;
}