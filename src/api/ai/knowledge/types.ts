/**
 * 知识库类型定义
 */

/**
 * 分页响应类型
 */
export interface PageResult<T> {
  total: number;
  rows: T[];
  code: number;
  msg: string;
  pageNum: number;
  pageSize: number;
  totalPage: number;
}

/**
 * 知识库查询对象类型
 */
export interface KnowledgeBaseQuery extends PageQuery {
  id?: string;
  name?: string;
  status?: number;
}

/**
 * 知识库返回对象类型
 */
export interface KnowledgeBaseVO {
  id: string;
  name: string;
  description?: string;
  status: number;
  totalDocuments?: number;
  totalChunks?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 知识库表单类型
 */
export interface KnowledgeBaseForm {
  id?: string;
  name: string;
  description?: string;
  status: number;
}

/**
 * 文档查询对象类型
 */
export interface DocumentQuery extends PageQuery {
  kbId?: string;
  keyword?: string;
}

/**
 * 文档返回对象类型
 */
export interface DocumentVO {
  id: string;
  kbId: string;
  docName: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  status: number;
  content?: string;
  totalChunks?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 文档表单类型
 */
export interface DocumentForm {
  id?: string;
  kbId: string;
  docName: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  content?: string;
  status: number;
}

/**
 * 添加文档请求类型
 */
export interface AddDocumentRequest {
  kbId: string;
  docName: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  content: string;
}

/**
 * 更新文档请求类型
 */
export interface UpdateDocumentRequest {
  docName?: string;
  content?: string;
}

/**
 * 知识库统计信息类型
 */
export interface KnowledgeBaseStatsDto {
  kbId: string;
  name: string;
  totalDocuments: number;
  totalChunks: number;
  totalTokens: number;
  storageSize: number;
  lastSyncTime?: string;
}

/**
 * 搜索请求类型
 */
export interface SearchRequestDto {
  kbId: string;
  query: string;
  topK?: number;
  threshold?: number;
}

/**
 * 搜索结果类型
 */
export interface SearchResultDto {
  success: boolean;
  results: SearchItemDto[];
  query: string;
  executionTime: number;
}

/**
 * 搜索项类型
 */
export interface SearchItemDto {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
  docName?: string;
}

/**
 * 同步结果类型
 */
export interface SyncResultDto {
  success: boolean;
  message: string;
  processedCount: number;
  successCount: number;
  errorCount: number;
  errorDetails?: string[];
}