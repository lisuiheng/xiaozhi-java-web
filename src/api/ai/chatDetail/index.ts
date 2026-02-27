import request from '@/utils/astra-server-request';
import { AxiosPromise } from 'axios';
import { ChatDetailForm, ChatDetailVO, ChatDetailQuery } from './types';

/**
 * @description 获取ChatDetail列表
 * @param {ChatDetailQuery} params
 * @returns {AxiosPromise}
 */
export function listChatDetail(params: ChatDetailQuery): AxiosPromise<ChatDetailVO[]> {
  return request({
    url: '/chat-details',
    method: 'get',
    params,
  });
}

/**
 * @description 获取ChatDetail详细信息
 * @param {string} chatDetailId
 * @returns {AxiosPromise}
 */
export function getChatDetail(chatDetailId: string): AxiosPromise<ChatDetailVO> {
  return request({
    url: `/chat-details/${chatDetailId}`,
    method: 'get',
  });
}

/**
 * @description 添加ChatDetail
 * @param {ChatDetailForm} data
 * @returns {AxiosPromise}
 */
export function addChatDetail(data: ChatDetailForm): AxiosPromise<ChatDetailVO> {
  return request({
    url: '/chat-details',
    method: 'post',
    data: data
  });
}

/**
 * @description 修改ChatDetail
 * @param {ChatDetailForm} data
 * @returns {AxiosPromise}
 */
export function updateChatDetail(data: ChatDetailForm): AxiosPromise<ChatDetailVO> {
  return request({
    url: `/chat-details/${data.id}`,
    method: 'put',
    data: data
  });
}

/**
 * @description 删除ChatDetail
 * @param {string} chatDetailId
 * @returns {AxiosPromise}
 */
export function delChatDetail(chatDetailId: string): AxiosPromise<boolean> {
  return request({
    url: `/chat-details/${chatDetailId}`,
    method: 'delete',
  });
}

/**
 * @description 批量删除ChatDetail
 * @param {string[]} chatDetailIds
 * @returns {AxiosPromise}
 */
export function batchDelChatDetail(chatDetailIds: string[]): AxiosPromise<boolean> {
  return request({
    url: '/chat-details/batch',
    method: 'delete',
    data: chatDetailIds,
  });
}

/**
 * @description 搜索聊天详情
 * @param {string} keyword
 * @param {string} chatKind
 * @returns {AxiosPromise}
 */
export function searchChatDetail(keyword?: string, chatKind?: string): AxiosPromise<ChatDetailVO[]> {
  return request({
    url: '/chat-details/search',
    method: 'get',
    params: { keyword, chatKind }
  });
}

/**
 * @description 根据会话ID获取聊天记录
 * @param {string} callId
 * @returns {AxiosPromise}
 */
export function getChatDetailsBySession(callId: string): AxiosPromise<ChatDetailVO[]> {
  return request({
    url: `/chat-details/session/${callId}`,
    method: 'get',
  });
}

/**
 * @description 根据智能体ID获取聊天记录
 * @param {string} agentId
 * @returns {AxiosPromise}
 */
export function getChatDetailsByAgent(agentId: string): AxiosPromise<ChatDetailVO[]> {
  return request({
    url: `/chat-details/agent/${agentId}`,
    method: 'get',
  });
}

/**
 * @description 根据用户ID获取聊天记录
 * @param {string} userId
 * @returns {AxiosPromise}
 */
export function getChatDetailsByUser(userId: string): AxiosPromise<ChatDetailVO[]> {
  return request({
    url: `/chat-details/user/${userId}`,
    method: 'get',
  });
}

/**
 * @description 根据设备ID获取聊天记录
 * @param {string} deviceId
 * @returns {AxiosPromise}
 */
export function getChatDetailsByDevice(deviceId: string): AxiosPromise<ChatDetailVO[]> {
  return request({
    url: `/chat-details/device/${deviceId}`,
    method: 'get',
  });
}

/**
 * @description 获取总体聊天统计
 * @returns {AxiosPromise}
 */
export function getTotalChatStats(): AxiosPromise<any> {
  return request({
    url: '/chat-details/stats/total',
    method: 'get',
  });
}

/**
 * @description 获取各类型聊天统计
 * @returns {AxiosPromise}
 */
export function getChatTypeStats(): AxiosPromise<any[]> {
  return request({
    url: '/chat-details/stats/type',
    method: 'get',
  });
}

/**
 * @description 获取最近聊天记录
 * @param {number} limit
 * @returns {AxiosPromise}
 */
export function getRecentChats(limit: number = 10): AxiosPromise<ChatDetailVO[]> {
  return request({
    url: '/chat-details/recent',
    method: 'get',
    params: { limit }
  });
}

/**
 * @description 清空指定会话的聊天记录
 * @param {string} callId
 * @returns {AxiosPromise}
 */
export function clearSessionChats(callId: string): AxiosPromise<boolean> {
  return request({
    url: `/chat-details/session/${callId}/clear`,
    method: 'delete',
  });
}