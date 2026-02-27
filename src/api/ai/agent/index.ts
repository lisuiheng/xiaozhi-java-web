import request from '@/utils/astra-server-request';
import { AxiosPromise } from 'axios';
import { AgentForm, AgentVO, AgentQuery, PageResult } from './types';

/**
 * @description 获取Agent列表
 * @param {AgentQuery} params
 * @returns {AxiosPromise}
 */
export function listAgent(params: AgentQuery): AxiosPromise<PageResult<AgentVO[]>> {
  return request({
    url: '/agents',
    method: 'get',
    params,
  });
}

/**
 * @description 获取Agent详细信息
 * @param {string} agentId
 * @returns {AxiosPromise}
 */
export function getAgent(agentId: string): AxiosPromise<AgentVO> {
  return request({
    url: `/agents/${agentId}`,
    method: 'get',
  });
}

/**
 * @description 添加Agent
 * @param {AgentForm} data
 * @returns {AxiosPromise}
 */
export function addAgent(data: AgentForm): AxiosPromise<AgentVO> {
  return request({
    url: '/agents',
    method: 'post',
    data: data
  });
}

/**
 * @description 修改Agent
 * @param {AgentForm} data
 * @returns {AxiosPromise}
 */
export function updateAgent(data: AgentForm): AxiosPromise<AgentVO> {
  return request({
    url: `/agents/${data.id}`,
    method: 'put',
    data: data
  });
}

/**
 * @description 删除Agent
 * @param {string} agentId
 * @returns {AxiosPromise}
 */
export function delAgent(agentId: string): AxiosPromise<boolean> {
  return request({
    url: `/agents/${agentId}`,
    method: 'delete',
  });
}

/**
 * @description 批量删除Agent
 * @param {string[]} agentIds
 * @returns {AxiosPromise}
 */
export function batchDelAgent(agentIds: string[]): AxiosPromise<boolean> {
  return request({
    url: '/agents/batch',
    method: 'delete',
    data: agentIds,
  });
}

/**
 * @description 批量更新Agent状态
 * @param {string[]} agentIds
 * @param {number} status
 * @returns {AxiosPromise}
 */
export function batchUpdateAgentStatus(agentIds: string[], status: number): AxiosPromise<boolean> {
  return request({
    url: '/agents/batch/status',
    method: 'put',
    data: agentIds,
    params: { status }
  });
}

/**
 * @description 切换Agent状态
 * @param {string} agentId
 * @param {number} status
 * @returns {AxiosPromise}
 */
export function toggleAgentStatus(agentId: string, status: number): AxiosPromise<boolean> {
  return request({
    url: `/agents/${agentId}/status`,
    method: 'put',
    params: { status }
  });
}

/**
 * @description 搜索Agent
 * @param {string} keyword
 * @param {string} category
 * @returns {AxiosPromise}
 */
export function searchAgent(keyword?: string, category?: string): AxiosPromise<AgentVO[]> {
  return request({
    url: '/agents/search',
    method: 'get',
    params: { keyword, category }
  });
}

/**
 * @description 绑定设备到Agent
 * @param {string} agentId
 * @param {any} data
 * @returns {AxiosPromise}
 */
export function bindDeviceToAgent(agentId: string, data: any): AxiosPromise<any> {
  return request({
    url: `/agents/${agentId}/bind-device`,
    method: 'post',
    data: data
  });
}

/**
 * @description 解绑设备
 * @param {string} deviceId
 * @returns {AxiosPromise}
 */
export function unbindDeviceFromAgent(deviceId: string): AxiosPromise<boolean> {
  return request({
    url: '/agents/unbind-device',
    method: 'delete',
    params: { deviceId }
  });
}

/**
 * @description 获取设备当前绑定的Agent
 * @param {string} deviceId
 * @returns {AxiosPromise}
 */
export function getDeviceCurrentBinding(deviceId: string): AxiosPromise<any> {
  return request({
    url: `/agents/device/${deviceId}/binding`,
    method: 'get',
  });
}

/**
 * @description 获取Agent绑定的设备列表
 * @param {string} agentId
 * @returns {AxiosPromise}
 */
export function getAgentDeviceBindings(agentId: string): AxiosPromise<any[]> {
  return request({
    url: `/agents/${agentId}/bindings`,
    method: 'get',
  });
}

/**
 * @description 获取Agent使用统计
 * @param {string} agentId
 * @returns {AxiosPromise}
 */
export function getAgentUsageStats(agentId: string): AxiosPromise<any> {
  return request({
    url: `/agents/${agentId}/stats`,
    method: 'get',
  });
}

/**
 * @description 获取总体使用统计
 * @returns {AxiosPromise}
 */
export function getTotalUsageStats(): AxiosPromise<any> {
  return request({
    url: '/agents/stats/total',
    method: 'get',
  });
}

/**
 * @description 获取各分类统计
 * @returns {AxiosPromise}
 */
export function getCategoryStats(): AxiosPromise<any[]> {
  return request({
    url: '/agents/stats/category',
    method: 'get',
  });
}

/**
 * @description 获取热门智能体
 * @param {number} limit
 * @returns {AxiosPromise}
 */
export function getPopularAgents(limit: number = 10): AxiosPromise<any[]> {
  return request({
    url: '/agents/popular',
    method: 'get',
    params: { limit }
  });
}

/**
 * @description 验证智能体配置
 * @param {string} agentId
 * @returns {AxiosPromise}
 */
export function validateAgentConfig(agentId: string): AxiosPromise<boolean> {
  return request({
    url: `/agents/${agentId}/validate`,
    method: 'get',
  });
}

/**
 * @description 克隆智能体
 * @param {string} sourceAgentId
 * @param {any} data
 * @returns {AxiosPromise}
 */
export function cloneAgent(sourceAgentId: string, data: any): AxiosPromise<any> {
  return request({
    url: `/agents/${sourceAgentId}/clone`,
    method: 'post',
    data: data
  });
}

/**
 * @description 从模板创建智能体
 * @param {string} templateId
 * @param {any} data
 * @returns {AxiosPromise}
 */
export function createAgentFromTemplate(templateId: string, data: any): AxiosPromise<any> {
  return request({
    url: `/agents/template/${templateId}`,
    method: 'post',
    data: data
  });
}