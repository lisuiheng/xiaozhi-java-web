/**
 * ChatDetail信息类型定义
 */

/**
 * ChatDetail查询对象类型
 */
export interface ChatDetailQuery extends PageQuery {
  callId?: string;
  questionKind?: string;
  userId?: string;
  agentId?: string;
  deviceId?: string;
  chatKind?: string;
}

/**
 * ChatDetail返回对象类型
 */
export interface ChatDetailVO {
  id: string;
  callId: string;
  chatTime?: string;
  questionKind?: string;
  questionName?: string;
  content: string;
  voiceRemark?: any[]; // 声纹数据
  userId?: string;
  agentId?: string;
  deviceId?: string;
  chatKind?: string;
  chatId?: string;
  isInterrupted?: boolean;
  conversationContent?: string;
  longitude?: string;
  latitude?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * ChatDetail表单类型
 */
export interface ChatDetailForm {
  id?: string;
  callId: string;
  chatTime?: string;
  questionKind?: string;
  questionName?: string;
  content: string;
  voiceRemark?: any[]; // 声纹数据
  userId?: string;
  agentId?: string;
  deviceId?: string;
  chatKind?: string;
  chatId?: string;
  isInterrupted?: boolean;
  conversationContent?: string;
  longitude?: string;
  latitude?: string;
}