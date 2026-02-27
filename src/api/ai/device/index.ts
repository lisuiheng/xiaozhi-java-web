import request from '@/utils/astra-server-request';
import { AxiosPromise } from 'axios';
import { DeviceInfoForm, DeviceInfoVO, DeviceInfoQuery } from './types';

/**
 * @description 获取DeviceInfo列表
 * @param {DeviceInfoQuery} params
 * @returns {AxiosPromise}
 */
export function listDeviceInfo(params: DeviceInfoQuery): AxiosPromise<DeviceInfoVO[]> {
  return request({
    url: '/devices',
    method: 'get',
    params,
  });
}

/**
 * @description 获取DeviceInfo详细信息
 * @param {string} deviceId
 * @returns {AxiosPromise}
 */
export function getDeviceInfo(deviceId: string): AxiosPromise<DeviceInfoVO> {
  return request({
    url: `/devices/${deviceId}`,
    method: 'get',
  });
}

/**
 * @description 添加DeviceInfo
 * @param {DeviceInfoForm} data
 * @returns {AxiosPromise}
 */
export function addDeviceInfo(data: DeviceInfoForm): AxiosPromise<DeviceInfoVO> {
  return request({
    url: '/devices',
    method: 'post',
    data: data
  });
}

/**
 * @description 修改DeviceInfo
 * @param {DeviceInfoForm} data
 * @returns {AxiosPromise}
 */
export function updateDeviceInfo(data: DeviceInfoForm): AxiosPromise<DeviceInfoVO> {
  return request({
    url: `/devices/${data.id}`,
    method: 'put',
    data: data
  });
}

/**
 * @description 删除DeviceInfo
 * @param {string} deviceId
 * @returns {AxiosPromise}
 */
export function delDeviceInfo(deviceId: string): AxiosPromise<boolean> {
  return request({
    url: `/devices/${deviceId}`,
    method: 'delete',
  });
}

/**
 * @description 批量删除DeviceInfo
 * @param {string[]} deviceIds
 * @returns {AxiosPromise}
 */
export function batchDelDeviceInfo(deviceIds: string[]): AxiosPromise<boolean> {
  return request({
    url: '/devices/batch',
    method: 'delete',
    data: deviceIds,
  });
}

/**
 * @description 批量更新设备状态
 * @param {string[]} deviceIds
 * @param {string} deviceState
 * @returns {AxiosPromise}
 */
export function batchUpdateDeviceState(deviceIds: string[], deviceState: string): AxiosPromise<boolean> {
  return request({
    url: '/devices/batch/state',
    method: 'put',
    data: deviceIds,
    params: { deviceState }
  });
}

/**
 * @description 切换设备状态
 * @param {string} deviceId
 * @param {string} deviceState
 * @returns {AxiosPromise}
 */
export function toggleDeviceState(deviceId: string, deviceState: string): AxiosPromise<boolean> {
  return request({
    url: `/devices/${deviceId}/state`,
    method: 'put',
    params: { deviceState }
  });
}

/**
 * @description 搜索设备
 * @param {string} keyword
 * @param {string} deviceKind
 * @returns {AxiosPromise}
 */
export function searchDeviceInfo(keyword?: string, deviceKind?: string): AxiosPromise<DeviceInfoVO[]> {
  return request({
    url: '/devices/search',
    method: 'get',
    params: { keyword, deviceKind }
  });
}

/**
 * @description 绑定智能体到设备
 * @param {string} deviceId
 * @param {any} data
 * @returns {AxiosPromise}
 */
export function bindAgentToDevice(deviceId: string, data: any): AxiosPromise<any> {
  return request({
    url: `/devices/${deviceId}/bind-agent`,
    method: 'post',
    data: data
  });
}

/**
 * @description 解绑智能体
 * @param {string} agentId
 * @returns {AxiosPromise}
 */
export function unbindAgentFromDevice(agentId: string): AxiosPromise<boolean> {
  return request({
    url: '/devices/unbind-agent',
    method: 'delete',
    params: { agentId }
  });
}

/**
 * @description 获取设备当前绑定的智能体
 * @param {string} deviceId
 * @returns {AxiosPromise}
 */
export function getDeviceCurrentBinding(deviceId: string): AxiosPromise<any> {
  return request({
    url: `/devices/${deviceId}/binding`,
    method: 'get',
  });
}

/**
 * @description 获取设备绑定的智能体列表
 * @param {string} deviceId
 * @returns {AxiosPromise}
 */
export function getDeviceAgentBindings(deviceId: string): AxiosPromise<any[]> {
  return request({
    url: `/devices/${deviceId}/bindings`,
    method: 'get',
  });
}

/**
 * @description 获取设备使用统计
 * @param {string} deviceId
 * @returns {AxiosPromise}
 */
export function getDeviceUsageStats(deviceId: string): AxiosPromise<any> {
  return request({
    url: `/devices/${deviceId}/stats`,
    method: 'get',
  });
}

/**
 * @description 获取总体设备使用统计
 * @returns {AxiosPromise}
 */
export function getTotalDeviceUsageStats(): AxiosPromise<any> {
  return request({
    url: '/devices/stats/total',
    method: 'get',
  });
}

/**
 * @description 获取各类型设备统计
 * @returns {AxiosPromise}
 */
export function getDeviceTypeStats(): AxiosPromise<any[]> {
  return request({
    url: '/devices/stats/type',
    method: 'get',
  });
}

/**
 * @description 获取热门设备
 * @param {number} limit
 * @returns {AxiosPromise}
 */
export function getPopularDevices(limit: number = 10): AxiosPromise<any[]> {
  return request({
    url: '/devices/popular',
    method: 'get',
    params: { limit }
  });
}

/**
 * @description 验证设备配置
 * @param {string} deviceId
 * @returns {AxiosPromise}
 */
export function validateDeviceConfig(deviceId: string): AxiosPromise<boolean> {
  return request({
    url: `/devices/${deviceId}/validate`,
    method: 'get',
  });
}

/**
 * @description 克隆设备
 * @param {string} sourceDeviceId
 * @param {any} data
 * @returns {AxiosPromise}
 */
export function cloneDevice(sourceDeviceId: string, data: any): AxiosPromise<any> {
  return request({
    url: `/devices/${sourceDeviceId}/clone`,
    method: 'post',
    data: data
  });
}

/**
 * @description 通过验证码添加设备
 * @param {string} verifyCode
 * @returns {AxiosPromise}
 */
export function addDeviceByVerifyCode(verifyCode: string): AxiosPromise<any> {
  return request({
    url: '/devices/add-by-verify-code',
    method: 'post',
    data: { verifyCode }
  });
}
