/**
 * 本地版无托管后端（账号/角色库/云同步/TTS 官方服务均已裁剪）。
 * 未配置 VITE_SERVER_URL 时默认空字符串：远程调用不会发起，页面优雅降级，
 * 不会连接任何上游服务器。
 * 如需接入自建后端，构建时注入 VITE_SERVER_URL 即可。
 */
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || ''
