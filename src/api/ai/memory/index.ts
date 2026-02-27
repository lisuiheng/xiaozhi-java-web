import request from '@/utils/astra-server-request';
import { AxiosPromise } from 'axios';
import {
  MemoryItem,
  MemoryForm,
  MemoryQuery,
  MemoryVO,
  MemoryListResult,
  AddMemoryRequest,
  Message,
  SearchMemoryRequest,
  MemoryAnalysisRequest,
  MemoryClearResponse,
  UpdateMemoryRequest
} from './types';

// API函数
export function listMemory(query: MemoryQuery): AxiosPromise<MemoryListResult> {
  return request({
    url: '/memory/list',
    method: 'post',
    data: query
  });
}

export function getMemory(id: string, userId?: string): AxiosPromise<{ data: MemoryVO }> {
  const params: any = {};
  if (userId) {
    params.userId = userId;
  }
  return request({
    url: `/memory/${id}`,
    method: 'get',
    params
  });
}

export function addMemory(data: MemoryForm): AxiosPromise<void> {
  // 将 MemoryForm 转换为 AddMemoryRequest 格式
  const requestData = {
    userId: data.userId,
    messages: [
      {
        role: data.type || 'USER',
        content: data.content
      }
    ]
  };
  return request({
    url: '/memory/add',
    method: 'post',
    data: requestData
  });
}

export function updateMemory(data: MemoryForm): AxiosPromise<void> {
  // 构建更新记忆请求数据
  const requestData = {
    memoryId: data.id,
    userId: data.userId,
    newContent: data.content,
    metadata: data.metadata
  };
  return request({
    url: `/memory/${data.id}`,  // 使用 memoryId 作为路径参数
    method: 'put',
    data: requestData
  });
}

export function deleteMemory(ids: string | string[]): AxiosPromise<void> {
  return request({
    url: '/memory/delete',
    method: 'delete',
    data: Array.isArray(ids) ? ids : [ids]
  });
}

export function clearMemory(userId: string): AxiosPromise<MemoryClearResponse> {
  return request({
    url: `/memory/clear/${userId}`,
    method: 'delete'
  });
}

export function searchMemory(params: SearchMemoryRequest): AxiosPromise<MemoryVO[]> {
  return request({
    url: '/memory/search',
    method: 'post',
    data: params
  });
}

export function analyzeMemories(params: MemoryAnalysisRequest): AxiosPromise<any> {
  return request({
    url: '/memory/analyze',
    method: 'post',
    data: params
  });
}

export function getUserMemoryDashboard(params: {
  userId: string;
  recentLimit?: number;
  keywordLimit?: number;
  daysBack?: number;
}): AxiosPromise<any> {
  return request({
    url: `/memory/user/${params.userId}/dashboard`,
    method: 'get',
    params
  });
}

export function getUserMemoryTimeline(params: {
  userId: string;
  groupBy?: string;
  startDate?: string;
  endDate?: string;
}): AxiosPromise<any> {
  return request({
    url: `/memory/user/${params.userId}/timeline`,
    method: 'get',
    params
  });
}

export function healthCheck(): AxiosPromise<any> {
  return request({
    url: '/memory/health',
    method: 'get'
  });
}

export function exportMemory(userId: string, format: string): AxiosPromise<any> {
  return request({
    url: `/memory/user/${userId}/export`,
    method: 'get',
    params: { format }
  });
}

export function batchImportMemories(data: any[]): AxiosPromise<{ successCount: number }> {
  return request({
    url: '/memory/batch/add',
    method: 'post',
    data: { memories: data }
  });
}

export function getMemoryRelationshipGraph(params: {
  userId: string;
  limit?: number;
  similarityThreshold?: number;
  minClusterSize?: number;
}): AxiosPromise<any> {
  return request({
    url: `/memory/user/${params.userId}/graph`,
    method: 'get',
    params
  });
}
