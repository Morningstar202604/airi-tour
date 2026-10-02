import type { McpCallToolPayload, McpCallToolResult, McpToolDescriptor, McpToolRuntime } from '../tools/mcp'
import { useProviderConfigStore } from '../stores/providers/config'

/**
 * Web 版 MCP 运行时：浏览器通过网关转发连接外部 MCP server（规避 CORS），
 * 或直连网关自身的 /mcp 端点（文旅助手能力）。
 *
 * 连接模式：
 * - serverUrl 为空 → 连网关自身 /mcp（Bearer GATEWAY_KEY，同源）
 * - serverUrl 非空 → 经网关 /mcp/proxy 转发（URL 必须在网关 MCP_PROXY_ALLOWLIST 白名单）
 *
 * 前端把配置的网关 Key 放 localStorage 键 `wenlv/gateway-key`（由引导/服务来源设置写入）。
 */

export const GATEWAY_KEY_STORAGE_KEY = 'wenlv/gateway-key'

/** 读取网关 Key：优先用已配置的 OpenAI 兼容 provider 的 apiKey（即网关 key），兜底 localStorage */
function gatewayKey(): string {
  try {
    const store = useProviderConfigStore()
    const cfg = store.getProviderConfig('openai-compatible')
    if (cfg?.apiKey)
      return cfg.apiKey
  }
  catch {
    // store 未初始化时忽略
  }
  return localStorage.getItem(GATEWAY_KEY_STORAGE_KEY) ?? ''
}

export interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: unknown
  result?: unknown
  error?: { code: number, message: string }
}

/** 发起一次 JSON-RPC 请求（直连网关自身或经网关代理） */
export async function mcpRpc(serverUrl: string, method: string, params: Record<string, unknown>, id: number): Promise<JsonRpcResponse> {
  const key = gatewayKey()
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (key)
    headers.authorization = `Bearer ${key}`

  const request = { jsonrpc: '2.0', id, method, params }

  if (!serverUrl) {
    // 网关自身 /mcp
    const res = await fetch('/mcp', {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    })
    return await res.json() as JsonRpcResponse
  }

  // 经网关 /mcp/proxy 转发
  const res = await fetch('/mcp/proxy', {
    method: 'POST',
    headers,
    body: JSON.stringify({ url: serverUrl, request }),
  })
  const data = await res.json() as { ok?: boolean, data?: JsonRpcResponse, error?: string }
  if (!data.ok || !data.data) {
    throw new Error(data.error || `MCP 代理失败（HTTP ${res.status}）`)
  }
  return data.data
}

/** 连接并拉取工具列表 */
export async function mcpListTools(serverUrl: string): Promise<McpToolDescriptor[]> {
  const init = await mcpRpc(serverUrl, 'initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'wenlv-web', version: '1.0' },
  }, 1)
  if (init.error)
    throw new Error(`initialize 失败: ${init.error.message}`)

  const list = await mcpRpc(serverUrl, 'tools/list', {}, 2)
  if (list.error)
    throw new Error(`tools/list 失败: ${list.error.message}`)

  const tools = (list.result as { tools?: McpToolDescriptor[] } | undefined)?.tools ?? []
  return tools.map(t => ({
    serverName: serverUrl || 'wenlv-gateway',
    name: t.name,
    toolName: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  }))
}

/** 调用远端 MCP 工具 */
export async function mcpCallTool(serverUrl: string, payload: McpCallToolPayload): Promise<McpCallToolResult> {
  const res = await mcpRpc(serverUrl, 'tools/call', { name: payload.name, arguments: payload.arguments }, 3)
  if (res.error)
    return { isError: true, content: [{ type: 'text', text: res.error.message }] }
  return (res.result as McpCallToolResult | undefined) ?? { content: [] }
}

/** 构造可注入 LLM 工具集的 web MCP runtime */
export function createWebMcpRuntime(serverUrl: string): McpToolRuntime {
  return {
    listTools: () => mcpListTools(serverUrl),
    callTool: payload => mcpCallTool(serverUrl, payload),
  }
}
