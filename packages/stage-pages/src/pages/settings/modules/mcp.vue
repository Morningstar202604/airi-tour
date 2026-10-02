<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMcpStore } from '@proj-airi/stage-ui/stores/mcp'
import { createWebMcpRuntime, mcpListTools } from '@proj-airi/stage-ui/libs/mcp-web'
import { createMcpTools } from '@proj-airi/stage-ui/tools/mcp'
import { useLlmToolsStore } from '@proj-airi/stage-ui/stores/ai/chat-llm/tools'

const { t } = useI18n()
const mcpStore = useMcpStore()
const llmToolsStore = useLlmToolsStore()

const urlInput = ref(mcpStore.serverUrl)
const testTip = ref('')
const testError = ref('')

const canConnect = computed(() => true)

/** 当前已注入的工具名 */
const injectedToolNames = computed(() => {
  const names = new Set<string>()
  for (const tool of llmToolsStore.activeTools) {
    const name = (tool as { function?: { name?: string } })?.function?.name ?? (tool as { name?: string })?.name
    if (name && name.startsWith('builtIn_mcp'))
      names.add(name)
  }
  return names
})

const hasInjected = computed(() => injectedToolNames.value.size > 0)

async function testConnection() {
  testTip.value = ''
  testError.value = ''
  mcpStore.status = 'connecting'
  mcpStore.lastError = ''
  try {
    const tools = await mcpListTools(urlInput.value.trim())
    mcpStore.tools = tools
    mcpStore.connected = true
    mcpStore.status = 'connected'
    mcpStore.serverUrl = urlInput.value.trim()
    testTip.value = `连接成功，发现 ${tools.length} 个工具`
  }
  catch (error) {
    mcpStore.connected = false
    mcpStore.status = 'error'
    mcpStore.lastError = error instanceof Error ? error.message : String(error)
    testError.value = mcpStore.lastError
  }
}

async function toggleInjected() {
  if (hasInjected.value) {
    llmToolsStore.removeToolsByIds('builtIn_mcpListTools', 'builtIn_mcpCallTool')
    mcpStore.enabled = false
    testTip.value = '已从对话工具中移除 MCP'
    return
  }
  if (mcpStore.tools.length === 0) {
    testError.value = '请先连接测试通过后再启用'
    return
  }
  const runtime = createWebMcpRuntime(mcpStore.serverUrl)
  const tools = await Promise.all(createMcpTools(runtime))
  llmToolsStore.addTools(...tools)
  mcpStore.enabled = true
  testTip.value = 'MCP 工具已注入对话运行时，模型可调用'
}

// 页面加载时若已启用，重新注入（刷新后恢复）
watch([], async () => {
  if (mcpStore.enabled && !hasInjected.value && mcpStore.tools.length > 0) {
    const runtime = createWebMcpRuntime(mcpStore.serverUrl)
    const tools = await Promise.all(createMcpTools(runtime))
    llmToolsStore.addTools(...tools)
  }
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="rounded-2xl border border-neutral-200/80 bg-white/60 p-5 shadow-sm backdrop-blur-sm dark:border-neutral-800/70 dark:bg-neutral-900/40">
      <h3 class="text-sm font-semibold text-neutral-900 dark:text-white">
        MCP（模型上下文协议）
      </h3>
      <p class="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        通过 MCP 连接外部工具服务，让模型可以调用它的能力。连接走本网关代理转发，目标 URL 需配置在网关的
        <code class="rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">MCP_PROXY_ALLOWLIST</code>
        白名单内。
      </p>
    </div>

    <div class="rounded-2xl border border-neutral-200/80 bg-white/60 p-5 shadow-sm backdrop-blur-sm dark:border-neutral-800/70 dark:bg-neutral-900/40">
      <label class="text-sm font-semibold text-neutral-900 dark:text-white">
        MCP Server 地址
      </label>
      <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        留空 = 连接本网关自带的文旅助手能力（wenlv_chat 对话 / wenlv_gateway_info 信息）；填外部地址需先在网关白名单里加入
      </p>
      <input
        v-model="urlInput"
        type="text"
        placeholder="例如 http://192.168.1.10:9100（留空连本网关）"
        class="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400 dark:border-neutral-700 dark:bg-neutral-800"
      >
      <div class="mt-3 flex flex-row gap-2">
        <button
          type="button"
          class="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          :disabled="!canConnect"
          @click="testConnection"
        >
          {{ mcpStore.status === 'connecting' ? '连接中…' : '测试连接' }}
        </button>
        <button
          type="button"
          class="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          :class="hasInjected ? 'border-red-300 text-red-500 hover:bg-red-500/10' : ''"
          @click="toggleInjected"
        >
          {{ hasInjected ? '移除 MCP 工具' : '注入对话工具' }}
        </button>
      </div>
      <p v-if="testTip" class="mt-2 text-xs text-emerald-500">{{ testTip }}</p>
      <p v-if="testError" class="mt-2 text-xs text-red-400">{{ testError }}</p>
    </div>

    <div class="rounded-2xl border border-neutral-200/80 bg-white/60 p-5 shadow-sm backdrop-blur-sm dark:border-neutral-800/70 dark:bg-neutral-900/40">
      <h3 class="text-sm font-semibold text-neutral-900 dark:text-white">
        可用工具（{{ mcpStore.tools.length }}）
      </h3>
      <p v-if="mcpStore.tools.length === 0" class="mt-2 text-sm text-neutral-400">
        尚未连接。测试连接后可查看工具清单。
      </p>
      <ul v-else class="mt-2 flex flex-col gap-2">
        <li
          v-for="tool in mcpStore.tools"
          :key="tool.name"
          class="rounded-lg bg-white/60 px-3 py-2 text-sm dark:bg-neutral-800/60"
        >
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs font-semibold text-primary-500">{{ tool.name }}</span>
            <span v-if="hasInjected" class="text-xs text-emerald-500">已注入</span>
          </div>
          <p v-if="tool.description" class="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {{ tool.description }}
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: settings
  titleKey: settings.pages.modules.mcp-server.title
  subtitleKey: settings.title
  stageTransition:
    name: slide
</route>
