import request from '@/utils/astra-server-request';
import { AxiosPromise } from 'axios';
import {
  KnowledgeBaseForm,
  KnowledgeBaseVO,
  KnowledgeBaseQuery,
  PageResult,
  DocumentForm,
  DocumentVO,
  DocumentQuery,
  AddDocumentRequest,
  UpdateDocumentRequest,
  KnowledgeBaseStatsDto,
  SearchRequestDto,
  SearchResultDto,
  SyncResultDto
} from './types';

/**
 * @description 获取知识库列表
 * @param {KnowledgeBaseQuery} params
 * @returns {AxiosPromise}
 */
export function listKnowledgeBase(params: KnowledgeBaseQuery): AxiosPromise<PageResult<KnowledgeBaseVO[]>> {
  return request({
    url: '/knowledge/bases',
    method: 'get',
    params,
  });
}

/**
 * @description 获取知识库详细信息
 * @param {string} kbId
 * @returns {AxiosPromise}
 */
export function getKnowledgeBase(kbId: string): AxiosPromise<KnowledgeBaseVO> {
  return request({
    url: `/knowledge/bases/${kbId}`,
    method: 'get',
  });
}

/**
 * @description 添加知识库
 * @param {KnowledgeBaseForm} data
 * @returns {AxiosPromise}
 */
export function addKnowledgeBase(data: KnowledgeBaseForm): AxiosPromise<KnowledgeBaseVO> {
  return request({
    url: '/knowledge/bases',
    method: 'post',
    data: data
  });
}

/**
 * @description 修改知识库
 * @param {KnowledgeBaseForm} data
 * @returns {AxiosPromise}
 */
export function updateKnowledgeBase(data: KnowledgeBaseForm): AxiosPromise<KnowledgeBaseVO> {
  return request({
    url: `/knowledge/bases/${data.id}`,
    method: 'put',
    data: data
  });
}

/**
 * @description 删除知识库
 * @param {string} kbId
 * @returns {AxiosPromise}
 */
export function delKnowledgeBase(kbId: string): AxiosPromise<boolean> {
  return request({
    url: `/knowledge/bases/${kbId}`,
    method: 'delete',
  });
}

/**
 * @description 获取知识库统计信息
 * @param {string} kbId
 * @returns {AxiosPromise}
 */
export function getKnowledgeBaseStats(kbId: string): AxiosPromise<KnowledgeBaseStatsDto> {
  return request({
    url: `/knowledge/bases/${kbId}/stats`,
    method: 'get',
  });
}

/**
 * @description 获取文档列表
 * @param {DocumentQuery} params
 * @returns {AxiosPromise}
 */
export function listDocuments(params: DocumentQuery): AxiosPromise<PageResult<DocumentVO[]>> {
  return request({
    url: '/knowledge/documents',
    method: 'get',
    params,
  });
}

/**
 * @description 获取知识库下的文档列表
 * @param {string} kbId
 * @param {number} page
 * @param {number} size
 * @param {string} keyword
 * @returns {AxiosPromise}
 */
export function getDocumentsByKbId(kbId: string, page: number = 1, size: number = 20, keyword?: string): AxiosPromise<PageResult<DocumentVO[]>> {
  return request({
    url: `/knowledge/bases/${kbId}/documents`,
    method: 'get',
    params: { page, size, keyword }
  });
}

/**
 * @description 获取文档详情
 * @param {string} documentId
 * @returns {AxiosPromise}
 */
export function getDocumentDetail(documentId: string): AxiosPromise<DocumentVO> {
  return request({
    url: `/knowledge/documents/${documentId}`,
    method: 'get',
  });
}

/**
 * @description 添加文档
 * @param {AddDocumentRequest} data
 * @returns {AxiosPromise}
 */
export function addDocument(data: AddDocumentRequest): AxiosPromise<DocumentVO> {
  return request({
    url: '/knowledge/documents',
    method: 'post',
    data: data
  });
}

/**
 * @description 更新文档
 * @param {string} documentId
 * @param {UpdateDocumentRequest} data
 * @returns {AxiosPromise}
 */
export function updateDocument(documentId: string, data: UpdateDocumentRequest): AxiosPromise<DocumentVO> {
  return request({
    url: `/knowledge/documents/${documentId}`,
    method: 'put',
    data: data
  });
}

/**
 * @description 删除文档
 * @param {string} documentId
 * @returns {AxiosPromise}
 */
export function delDocument(documentId: string): AxiosPromise<boolean> {
  return request({
    url: `/knowledge/documents/${documentId}`,
    method: 'delete',
  });
}

/**
 * @description 上传文件并添加文档
 * @param {string} kbId
 * @param {File} file
 * @param {string} docName
 * @returns {AxiosPromise}
 */
export function uploadAndAddDocument(kbId: string, file: File, docName?: string): AxiosPromise<DocumentVO> {
  const formData = new FormData();
  formData.append('kbId', kbId);
  formData.append('file', file);
  if (docName) {
    formData.append('docName', docName);
  }

  return request({
    url: '/knowledge/documents/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * @description 重新生成文档向量
 * @param {string} documentId
 * @returns {AxiosPromise}
 */
export function regenerateEmbedding(documentId: string): AxiosPromise<boolean> {
  return request({
    url: `/knowledge/documents/${documentId}/regenerate`,
    method: 'post',
  });
}

/**
 * @description 同步知识库到向量数据库
 * @param {string} kbId
 * @returns {AxiosPromise}
 */
export function syncKnowledgeBase(kbId: string): AxiosPromise<SyncResultDto> {
  return request({
    url: `/knowledge/bases/${kbId}/sync`,
    method: 'post',
  });
}

/**
 * @description 语义搜索
 * @param {SearchRequestDto} data
 * @returns {AxiosPromise}
 */
export function semanticSearch(data: SearchRequestDto): AxiosPromise<SearchResultDto> {
  return request({
    url: '/knowledge/search',
    method: 'post',
    data: data
  });
}
