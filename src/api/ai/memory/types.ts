// 记忆项类型定义
export interface MemoryItem {
  id?: string;
  userId: string;
  content: string;
  score?: number;
  metadata?: Record<string, any>;
  timestamp?: string;
  createdAt?: string;
}

// 表单类型
export interface MemoryForm {
  id?: string;
  userId: string;
  content: string;
  type?: MessageRole;
  score?: number;
  timestamp?: string;
  metadataJson?: string;
  metadata?: Record<string, any>;
}

// 查询参数
export interface MemoryQuery {
  pageNum: number;
  pageSize: number;
  userId?: string;
  content?: string;
  dateRange?: string[];
  startDate?: string;
  endDate?: string;
}

// API响应类型
export interface MemoryVO extends MemoryItem {}
export interface MemoryListResult {
  rows: MemoryVO[];
  total: number;
}

// 消息角色类型
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

// 消息类型定义
export interface Message {
  role: MessageRole;
  content: string;
}

// 添加记忆请求
export interface AddMemoryRequest {
  userId: string;
  messages: Message[];
}

// 搜索请求
export interface SearchMemoryRequest {
  userId: string;
  query: string;
  topK?: number;
}

// 分析请求
export interface MemoryAnalysisRequest {
  userId: string;
  analysisType: string;
}

// 更新记忆请求
export interface UpdateMemoryRequest {
  memoryId: string;
  userId: string;
  newContent: string;
  metadata?: Record<string, any>;
}

// 清除响应
export interface MemoryClearResponse {
  deletedCount: number;
  userId: string;
  success: boolean;
  message?: string;
}