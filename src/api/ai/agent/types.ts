/**
 * Agent信息类型定义
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
 * Agent查询对象类型
 */
export interface AgentQuery extends PageQuery {
  id?: string;
  agentName?: string;
  category?: string;
  status?: number;
}

/**
 * Agent返回对象类型
 */
export interface AgentVO {
  id: string;
  agentName: string;
  nickname: string;
  voiceId?: string;
  memoryId?: string;
  description?: string;
  agentTemplateId?: string;
  llmType?: string;
  modelName?: string;
  apiBaseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  systemPrompt?: string;
  welcomeMessage?: string;
  avatarUrl?: string;
  chatMode?: string;
  enableRag?: boolean;
  ragThreshold?: number;
  ragTopK?: number;
  maxMemoriesToRetrieve?: number;
  enableMemory?: boolean;
  memoryType?: string;
  memoryConfig?: string;
  memoryContextWindow?: number;
  memorySummaryThreshold?: number;
  kbConfigs?: Array<Record<string, any>>;
  isPublic?: boolean;
  status: number;
  priority?: number;
  rateLimit?: number;
  totalCalls?: number;
  totalTokens?: number;
  creatorId?: string;
  userId?: string;
  category?: string;
  tags?: string[];
  configJson?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 绑定设备请求类型
 */
export interface BindDeviceRequest {
  agentId: string;
  deviceId: string;
  bindingType?: string;
  expireTime?: string;
}

/**
 * Agent设备绑定类型
 */
export interface AgentDeviceBinding {
  id?: string;
  agentId: string;
  deviceId: string;
  bindingType?: string;
  expireTime?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Agent表单类型
 */
export interface AgentForm {
  id?: string;
  agentName: string;
  nickname?: string;
  voiceId?: string;
  memoryId?: string;
  description?: string;
  agentTemplateId?: string;
  llmType?: string;
  modelName?: string;
  apiKey?: string;
  apiBaseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  systemPrompt?: string;
  welcomeMessage?: string;
  avatarUrl?: string;
  chatMode?: string;
  enableRag?: boolean;
  ragThreshold?: number;
  ragTopK?: number;
  maxMemoriesToRetrieve?: number;
  enableMemory?: boolean;
  memoryType?: string;
  memoryConfig?: string;
  memoryContextWindow?: number;
  memorySummaryThreshold?: number;
  kbConfigs?: Array<Record<string, any>>;
  isPublic?: boolean;
  status: number;
  priority?: number;
  rateLimit?: number;
  category?: string;
  tags?: string[];
  configJson?: string;
}