import { useLocalStorageManualReset } from '@wenlv/stage-shared/composables'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { McpToolDescriptor } from '../tools/mcp'

/**
 * MCP 连接配置（Web 版）：
 * - serverUrl：外部 MCP server 的根地址（如 http://192.168.1.10:9100），其 /mcp 端点须在
 *   网关 MCP_PROXY_ALLOWLIST 白名单内，由网关代理转发（规避浏览器 CORS）。
 * - 留空时默认连本网关自身的 /mcp（文旅助手能力：wenlv_chat / wenlv_gateway_info）。
 */

/** 默认指向同源网关 MCP 服务端（网关代理模式下留空即网关自身） */
export const DEFAULT_MCP_SERVER_URL = ''

export const useMcpStore = defineStore('mcp', () => {
  // 兼容旧桌面版字段（保留，不再使用）
  const serverCmd = useLocalStorageManualReset<string>('settings/mcp/server-cmd', '')
  const serverArgs = useLocalStorageManualReset<string>('settings/mcp/server-args', '')

  // Web 版字段
  const serverUrl = useLocalStorageManualReset<string>('settings/mcp/server-url', DEFAULT_MCP_SERVER_URL)
  const enabled = useLocalStorageManualReset<boolean>('mcp/enabled', false)
  const connected = ref(false)
  const tools = ref<McpToolDescriptor[]>([])
  const status = ref<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const lastError = ref('')

  function resetState() {
    serverCmd.reset()
    serverArgs.reset()
    serverUrl.reset()
    enabled.reset()
    connected.value = false
    tools.value = []
    status.value = 'idle'
    lastError.value = ''
  }

  return {
    serverCmd,
    serverArgs,
    serverUrl,
    enabled,
    connected,
    tools,
    status,
    lastError,
    resetState,
  }
})
