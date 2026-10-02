/**
 * 本地版分析配置：未配置 VITE_ENABLE_ANALYTICS 时整个分析链路不启用。
 * apiUrl/clientId 已从上游服务器移除，改为可注入：
 * 自建分析服务时构建注入 VITE_OPENPANEL_API_URL 与 VITE_OPENPANEL_CLIENT_ID。
 * 绝不对接任何上游分析服务器。
 */
export const OPENPANEL_CONFIG = {
  apiUrl: import.meta.env.VITE_OPENPANEL_API_URL || '',
  clientId: import.meta.env.VITE_OPENPANEL_CLIENT_ID || '',
} as const
