/**
 * 文旅助手 · Linux 网关服务
 *
 * 职责：
 * 1. 托管 Web 前端（apps/stage-web/dist 生产构建产物，SPA 回退）
 * 2. 代理 LLM 请求（OpenAI 兼容协议，流式透传），API Key 只存在服务器端
 *
 * 前端使用方式：
 * 设置 → 服务来源 → 「OpenAI 兼容 API」
 *   - Base URL：http://<服务器IP>:<端口>/v1
 *   - 模型：deepseek-chat（或 LLM_MODEL 指定的模型）
 *   - API Key：GATEWAY_KEY 的值（未设置 GATEWAY_KEY 时可填任意非空值）
 */

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

// ---------------------------------------------------------------------------
// 配置（环境变量）
// ---------------------------------------------------------------------------

const PORT = Number(process.env.PORT || 8080)
const HOST = process.env.HOST || '0.0.0.0'

/** 上游 LLM 的 OpenAI 兼容根地址（含 /v1），默认 DeepSeek */
const LLM_BASE_URL = (process.env.LLM_BASE_URL || 'https://api.deepseek.com/v1').replace(/\/+$/, '')
/** 上游 LLM 的 API Key（必填，服务器端持有，绝不下发前端） */
const LLM_API_KEY = process.env.LLM_API_KEY || ''
/** 默认模型名（仅当前端请求未指定 model 时使用；前端指定则透传） */
const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-chat'
/** 前端访问网关时使用的 Key（强烈建议设置；未设置时任何人可调用代理） */
const GATEWAY_KEY = process.env.GATEWAY_KEY || ''
/** CORS 白名单（逗号分隔的完整 origin；未设置时放开所有来源，单机同源部署场景） */
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
/** 上游请求超时（毫秒） */
const UPSTREAM_TIMEOUT_MS = Number(process.env.UPSTREAM_TIMEOUT_MS || 120000)
/** MCP 代理目标白名单（逗号分隔 URL；未配置时 MCP 代理端点禁用，仅本网关自身 MCP 服务端可用） */
const MCP_PROXY_ALLOWLIST = (process.env.MCP_PROXY_ALLOWLIST || '').split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean)

/** 启动时间（健康检查/uptime 用） */
const STARTED_AT = Date.now()

/** 前端构建产物目录 */
const DIST_ROOT = resolve(import.meta.dirname, '../../apps/stage-web/dist')

const app = new Hono()

// 请求日志
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  console.log(`[gw] ${c.req.method} ${c.req.path} -> ${c.res.status} ${Date.now() - start}ms`)
})

// CORS（支持白名单配置；未配置 ALLOWED_ORIGINS 时保持 *，便于同源部署）
app.use('*', async (c, next) => {
  const origin = c.req.header('origin')
  const allowAll = ALLOWED_ORIGINS.length === 0
  const allowed = allowAll || (origin !== undefined && ALLOWED_ORIGINS.includes(origin))

  if (allowed) {
    c.header('Access-Control-Allow-Origin', allowAll ? '*' : origin)
    c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  if (c.req.method === 'OPTIONS')
    return c.body(null, allowed ? 204 : 403)
  await next()
})

// ---------------------------------------------------------------------------
// 健康检查
// ---------------------------------------------------------------------------

app.get('/health', (c) => {
  if (!checkGatewayKey(c))
    return c.json({ error: { message: 'Invalid gateway key' } }, 401)
  return c.json({
    status: 'ok',
    uptimeMs: Date.now() - STARTED_AT,
    model: LLM_MODEL,
    upstream: LLM_BASE_URL,
    upstreamKeyConfigured: Boolean(LLM_API_KEY),
    mcpProxyEnabled: MCP_PROXY_ALLOWLIST.length > 0,
    version: 'wenlv-gateway/1.1',
  })
})

// ---------------------------------------------------------------------------
// MCP 服务端（streamable HTTP 的 JSON 响应形态，供其他 Agent 接入本网关能力）
// 协议：JSON-RPC 2.0 over HTTP POST，请求体 { jsonrpc, id, method, params }
// 端点：POST /mcp （需 Gateway Key）
// ---------------------------------------------------------------------------

const MCP_PROTOCOL_VERSION = '2025-06-18'

function mcpResult(id: unknown, result: unknown) {
  return c_json({ jsonrpc: '2.0', id: id ?? null, result })
}
function mcpError(id: unknown, code: number, message: string) {
  return c_json({ jsonrpc: '2.0', id: id ?? null, error: { code, message } })
}

/** 轻量 JSON 响应助手（c.json 包装） */
function c_json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

/** MCP 工具：文旅对话（透传上游 LLM，携带文旅系统提示） */
async function mcpToolWenlvChat(args: Record<string, unknown>): Promise<unknown> {
  const messages = args.messages
  if (!Array.isArray(messages) || messages.length === 0)
    return { isError: true, content: [{ type: 'text', text: 'messages 必须是非空数组' }] }
  const system = typeof args.system === 'string' && args.system.trim() ? args.system : undefined
  const upstreamBody: Record<string, unknown> = {
    model: typeof args.model === 'string' ? args.model : LLM_MODEL,
    messages: system ? [{ role: 'system', content: system }, ...messages] : messages,
    stream: false,
  }
  const upstream = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify(upstreamBody),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  })
  if (!upstream.ok) {
    const text = await upstream.text().catch(() => '')
    return { isError: true, content: [{ type: 'text', text: `上游返回 ${upstream.status}: ${text.slice(0, 200)}` }] }
  }
  const data: unknown = await upstream.json().catch(() => null)
  const content = (data as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content
  return { content: [{ type: 'text', text: typeof content === 'string' ? content : JSON.stringify(content ?? null) }] }
}

/** MCP 工具：网关信息（模型、上游、状态） */
function mcpToolWenlvGatewayInfo(): unknown {
  return {
    content: [{ type: 'text', text: JSON.stringify({
      model: LLM_MODEL,
      upstream: LLM_BASE_URL,
      uptimeMs: Date.now() - STARTED_AT,
      mcpProxyEnabled: MCP_PROXY_ALLOWLIST.length > 0,
      note: '文旅助手网关 · 国内文旅场景 · 模型驱动可随时换绑上游',
    }) }],
  }
}

const MCP_TOOLS = [
  {
    name: 'wenlv_chat',
    description: '文旅助手对话：把消息发给网关绑定的 LLM（带可选系统提示），返回助手回复文本。适合旅游问答、行程规划、景点介绍。',
    inputSchema: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          items: { type: 'object', properties: { role: { type: 'string' }, content: { type: 'string' } }, required: ['role', 'content'] },
          description: '对话消息数组，例如 [{"role":"user","content":"潮州两天怎么玩"}]',
        },
        model: { type: 'string', description: '可选，覆盖网关默认模型' },
        system: { type: 'string', description: '可选，额外系统提示（追加在文旅默认之上）' },
      },
      required: ['messages'],
    },
  },
  {
    name: 'wenlv_gateway_info',
    description: '返回网关当前模型、上游地址与运行状态，无需参数。',
    inputSchema: { type: 'object', properties: {} },
  },
]

app.post('/mcp', async (c) => {
  if (!checkGatewayKey(c))
    return mcpError(undefined, -32001, 'Invalid gateway key')

  const body = await c.req.json().catch(() => null)
  if (!body || body.jsonrpc !== '2.0')
    return mcpError(undefined, -32600, 'Invalid JSON-RPC request')

  const id: unknown = body.id
  const method = typeof body.method === 'string' ? body.method : ''
  const params: Record<string, unknown> = (body.params && typeof body.params === 'object') ? body.params as Record<string, unknown> : {}

  switch (method) {
    case 'initialize': {
      return mcpResult(id, {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: 'wenlv-gateway', version: '1.1' },
        instructions: '文旅助手网关。用 tools/list 查看可用工具，用 tools/call 调用。',
      })
    }
    case 'notifications/initialized':
      return mcpResult(id, {})
    case 'ping':
      return mcpResult(id, {})
    case 'tools/list':
      return mcpResult(id, { tools: MCP_TOOLS })
    case 'tools/call': {
      const name = typeof params.name === 'string' ? params.name : ''
      const args: Record<string, unknown> = (params.arguments && typeof params.arguments === 'object') ? params.arguments as Record<string, unknown> : {}
      if (name === 'wenlv_chat') {
        if (!LLM_API_KEY)
          return mcpError(id, -32000, 'LLM_API_KEY 未配置')
        try {
          return mcpResult(id, await mcpToolWenlvChat(args))
        }
        catch (error) {
          return mcpResult(id, { isError: true, content: [{ type: 'text', text: `调用失败: ${error instanceof Error ? error.message : String(error)}` }] })
        }
      }
      if (name === 'wenlv_gateway_info')
        return mcpResult(id, mcpToolWenlvGatewayInfo())
      return mcpError(id, -32602, `未知工具: ${name}`)
    }
    default:
      return mcpError(id, -32601, `Method not found: ${method}`)
  }
})

// ---------------------------------------------------------------------------
// MCP 代理（前端/浏览器连外部 MCP server 时走网关转发，规避 CORS）
// POST /mcp/proxy  body: { url, request }  → 转发 JSON-RPC，返回 { ok, data }
// ---------------------------------------------------------------------------

app.post('/mcp/proxy', async (c) => {
  if (!checkGatewayKey(c))
    return c_json({ ok: false, error: 'Invalid gateway key' })

  if (MCP_PROXY_ALLOWLIST.length === 0)
    return c_json({ ok: false, error: 'MCP 代理未启用：请在网关环境变量 MCP_PROXY_ALLOWLIST 配置允许的目标 URL' })

  const body = await c.req.json().catch(() => null)
  const url = body?.url
  const request = body?.request
  if (typeof url !== 'string' || !request)
    return c_json({ ok: false, error: 'body 需要 { url, request }' })

  const target = url.replace(/\/+$/, '')
  if (!MCP_PROXY_ALLOWLIST.includes(target))
    return c_json({ ok: false, error: `目标 URL 不在代理白名单：${target}` })

  try {
    const upstream = await fetch(`${target}/mcp`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })
    const data = await upstream.json().catch(() => null)
    return c_json({ ok: upstream.ok, status: upstream.status, data })
  }
  catch (error) {
    return c_json({ ok: false, error: `代理转发失败: ${error instanceof Error ? error.message : String(error)}` })
  }
})

// ---------------------------------------------------------------------------
// LLM 代理
// ---------------------------------------------------------------------------

/** 校验前端网关 Key（未配置 GATEWAY_KEY 时跳过） */
function checkGatewayKey(c: { req: { header: (name: string) => string | undefined } }): boolean {
  if (!GATEWAY_KEY)
    return true
  const auth = c.req.header('authorization') || ''
  return auth === `Bearer ${GATEWAY_KEY}`
}

/** 上游模型列表缓存（透传上游真实模型，避免换上游后前端模型名对不上） */
let cachedModels: { data: unknown, fetchedAt: number } | undefined

app.get('/v1/models', async (c) => {
  if (!checkGatewayKey(c))
    return c.json({ error: { message: 'Invalid gateway key' } }, 401)

  // 有缓存且 < 60s 直接用
  if (cachedModels && Date.now() - cachedModels.fetchedAt < 60_000)
    return c.json(cachedModels.data)

  // 透传上游真实模型列表；失败时回退为网关默认模型
  try {
    const upstream = await fetch(`${LLM_BASE_URL}/models`, {
      headers: { authorization: `Bearer ${LLM_API_KEY}` },
      signal: AbortSignal.timeout(10_000),
    })
    if (upstream.ok) {
      const data = await upstream.json()
      cachedModels = { data, fetchedAt: Date.now() }
      return c.json(data)
    }
  }
  catch {
    // 上游 models 不可达时走回退
  }

  const fallback = { object: 'list', data: [{ id: LLM_MODEL, object: 'model', owned_by: 'wenlv-gateway' }] }
  cachedModels = { data: fallback, fetchedAt: Date.now() }
  return c.json(fallback)
})

app.post('/v1/chat/completions', async (c) => {
  if (!checkGatewayKey(c))
    return c.json({ error: { message: 'Invalid gateway key' } }, 401)

  if (!LLM_API_KEY)
    return c.json({ error: { message: 'LLM_API_KEY 未配置，请在服务器端设置上游模型 Key' } }, 500)

  const body = await c.req.json().catch(() => null)
  if (!body || typeof body !== 'object')
    return c.json({ error: { message: 'Invalid request body' } }, 400)

  // 前端指定的模型优先透传；未指定时用网关默认模型
  const upstreamBody = { ...body, model: body.model || LLM_MODEL }

  let upstream: Response
  try {
    upstream = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify(upstreamBody),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })
  }
  catch (error) {
    console.error(`[gw] upstream request failed: ${error instanceof Error ? error.message : String(error)}`)
    const timedOut = error instanceof Error && error.name === 'TimeoutError'
    return c.json({ error: { message: timedOut ? 'Upstream LLM timeout' : 'Upstream LLM unreachable' } }, timedOut ? 504 : 502)
  }

  if (!upstream.ok)
    console.error(`[gw] upstream error ${upstream.status}`)

  // 原样透传状态码与内容类型（流式 SSE 与非流式 JSON 均直接透传）
  const contentType = upstream.headers.get('content-type') || 'application/json'
  return new Response(await sanitizeUpstreamBody(upstream.body, contentType), {
    status: upstream.status,
    headers: { 'content-type': contentType },
  })
})

// ---------------------------------------------------------------------------
// 回复清洗（防模型身份泄露）
// 部分上游（如云知声 u2-flash）内置固定自我介绍，会无视应用级 system 提示
// 直接输出「我是 U2.1，由云知声研发…」。网关在透传层改写为文旅人设。
// ---------------------------------------------------------------------------

const IDENTITY_LEAK_PATTERNS: Array<{ re: RegExp, replace: string }> = [
  { re: /我是由云知声研发的人工智能助手U2\.1，[^。]*。/g, replace: '我是文旅助手小游，你的 AI 文旅导游。' },
  { re: /我是U2\.1，由云知声研发的人工智能助手，[^。]*。/g, replace: '我是文旅助手小游，你的 AI 文旅导游。' },
  { re: /我是U2\.1，[^。]*。/g, replace: '我是文旅助手小游，你的 AI 文旅导游。' },
  { re: /由云知声研发/g, replace: '' },
  { re: /U2\.1/g, replace: '小游' },
]

/** 清洗一段文本中的身份泄露短语 */
function sanitizeIdentityLeak(text: string): string {
  let out = text
  for (const p of IDENTITY_LEAK_PATTERNS)
    out = out.replace(p.re, p.replace)
  return out
}

/** 清洗非流式 JSON 响应体（仅改 content 文本） */
function sanitizeChatJson(raw: string): string {
  try {
    const data = JSON.parse(raw) as { choices?: Array<{ message?: { content?: unknown } }> }
    const content = data.choices?.[0]?.message?.content
    if (typeof content === 'string' && /U2\.1|云知声研发/.test(content)) {
      data.choices[0]!.message!.content = sanitizeIdentityLeak(content)
      return JSON.stringify(data)
    }
  }
  catch {
    // 非 JSON 或解析失败原样返回
  }
  return raw
}

/** 清洗 SSE 流（逐 chunk 改写 data 行内的 content 值） */
function createSanitizedSseStream(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let buffer = ''
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = body.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done)
            break
          buffer += decoder.decode(value, { stream: true })
          // 按行处理：data: {...} 行内对 "content":"..." 的值做清洗
          let idx = buffer.indexOf('\n')
          while (idx !== -1) {
            const line = buffer.slice(0, idx)
            buffer = buffer.slice(idx + 1)
            if (line.startsWith('data:')) {
              const payload = line.slice(5).trim()
              if (payload && payload !== '[DONE]')
                controller.enqueue(encoder.encode(`data: ${sanitizeChatJson(payload)}\n\n`))
              else
                controller.enqueue(encoder.encode(line + '\n\n'))
            }
            else {
              controller.enqueue(encoder.encode(line + '\n'))
            }
            idx = buffer.indexOf('\n')
          }
        }
        // 尾部残留
        if (buffer.trim()) {
          if (buffer.startsWith('data:')) {
            const payload = buffer.slice(5).trim()
            if (payload && payload !== '[DONE]')
              controller.enqueue(encoder.encode(`data: ${sanitizeChatJson(payload)}\n\n`))
            else
              controller.enqueue(encoder.encode(buffer + '\n\n'))
          }
          else {
            controller.enqueue(encoder.encode(buffer))
          }
        }
      }
      catch (error) {
        controller.error(error)
      }
      finally {
        controller.close()
        reader.releaseLock()
      }
    },
  })
}

// 身份泄露触发词：content 中出现这些词则进入缓冲模式，等完整句出现再清洗输出
const LEAK_TRIGGER_WORDS = ['U2.', 'U2.1', '云知声', '我是U', '我是由云知声']
const LEAK_BUFFER_MAX = 600

/**
 * 流式清洗 v2：对 content delta 累积缓冲，出现身份泄露触发词时暂缓输出，
 * 直到句子结束（句号/换行/超长）整句清洗后重组为一个 delta 行输出；
 * 无触发词的 content 与 reasoning 等非 content 行原样即时透传。
 * 解决身份句被 SSE 切成多个 chunk、逐行正则无法匹配的问题。
 */
function createSmartSanitizedSseStream(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let lineBuf = ''
  let pending = ''
  let hasTrigger = false
  let sseId = ''
  const flush = (controller: ReadableStreamDefaultController<Uint8Array>) => {
    if (!pending)
      return
    const clean = sanitizeIdentityLeak(pending)
    if (clean) {
      const payload = JSON.stringify({
        id: sseId,
        choices: [{ index: 0, delta: { content: clean }, finish_reason: null, logprobs: null }],
      })
      controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
    }
    pending = ''
    hasTrigger = false
  }
  const emitRaw = (controller: ReadableStreamDefaultController<Uint8Array>, line: string, sep = '\n\n') => {
    controller.enqueue(encoder.encode(line + sep))
  }
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = body.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            flush(controller)
            break
          }
          lineBuf += decoder.decode(value, { stream: true })
          let idx = lineBuf.indexOf('\n')
          while (idx !== -1) {
            const line = lineBuf.slice(0, idx)
            lineBuf = lineBuf.slice(idx + 1)
            if (!line.startsWith('data:')) {
              emitRaw(controller, line, '\n')
              continue
            }
            const payload = line.slice(5).trim()
            if (!payload) {
              emitRaw(controller, line)
              continue
            }
            if (payload === '[DONE]') {
              flush(controller)
              emitRaw(controller, line)
              continue
            }
            if (!sseId) {
              const idMatch = payload.match(/"id":"([^"]+)"/)
              if (idMatch)
                sseId = idMatch[1]
            }
            const contentMatch = payload.match(/"content":"((?:[^"\\]|\\.)*)"/)
            if (!contentMatch) {
              // role / reasoning / finish 等非 content 行：先冲刷缓冲再透传
              flush(controller)
              emitRaw(controller, line)
              continue
            }
            const delta = contentMatch[1].replace(/\\n/g, '\n')
            pending += delta
            if (!hasTrigger)
              hasTrigger = LEAK_TRIGGER_WORDS.some(w => pending.includes(w))
            const sentenceEnd = /[。！？!?\n]$/.test(pending)
            const tooLong = pending.length > LEAK_BUFFER_MAX
            if (!hasTrigger || sentenceEnd || tooLong)
              flush(controller)
          }
        }
        if (lineBuf.trim()) {
          flush(controller)
          emitRaw(controller, lineBuf.replace(/\n$/, ''))
        }
      }
      catch (error) {
        controller.error(error)
      }
      finally {
        controller.close()
        reader.releaseLock()
      }
    },
  })
}

/** 按内容类型选择清洗路径 */
async function sanitizeUpstreamBody(body: ReadableStream<Uint8Array> | null, contentType: string): Promise<ReadableStream<Uint8Array>> {
  if (!body)
    return new ReadableStream({ start(c) { c.close() } })
  if (contentType.includes('text/event-stream'))
    return createSmartSanitizedSseStream(body)
  // 非流式：整读后清洗
  const raw = await new Response(body).text()
  return new Response(sanitizeChatJson(raw)).body!
}

// ---------------------------------------------------------------------------
// 静态托管（SPA 回退）
// ---------------------------------------------------------------------------

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.task': 'application/octet-stream',
  '.map': 'application/json',
}

function safeJoin(root: string, pathname: string): string | null {
  const sep = '/'
  const filePath = normalize(join(root, pathname))
  return filePath === root || filePath.startsWith(root + sep) ? filePath : null
}

app.get('*', async (c) => {
  let pathname = c.req.path
  if (pathname === '/')
    pathname = '/index.html'

  const candidate = safeJoin(DIST_ROOT, pathname)
  if (!candidate)
    return c.text('Not Found', 404)

  const target = existsSync(candidate) && !existsSync(candidate + '/')
    ? candidate
    : join(DIST_ROOT, 'index.html')

  try {
    const content = await readFile(target)
    const mime = MIME[extname(target)] || 'application/octet-stream'
    return c.body(content, 200, { 'content-type': mime })
  }
  catch {
    return c.text('Not Found', 404)
  }
})

// ---------------------------------------------------------------------------
// 启动
// ---------------------------------------------------------------------------

serve(
  {
    fetch: app.fetch,
    port: PORT,
    hostname: HOST,
  },
  () => {
    console.log('')
    console.log('┌────────────────────────────────────────────┐')
    console.log('│  文旅助手 · Linux 网关服务已启动            │')
    console.log('└────────────────────────────────────────────┘')
    console.log(`  Web 前端：  http://localhost:${PORT}/`)
    console.log(`  LLM 代理：  http://localhost:${PORT}/v1/chat/completions`)
    console.log(`  MCP 服务：  http://localhost:${PORT}/mcp`)
    console.log(`  MCP 代理：  ${MCP_PROXY_ALLOWLIST.length > 0 ? `http://localhost:${PORT}/mcp/proxy（白名单 ${MCP_PROXY_ALLOWLIST.length} 个目标）` : '未启用（设 MCP_PROXY_ALLOWLIST 开启）'}`)
    console.log(`  健康检查：  http://localhost:${PORT}/health`)
    console.log(`  模型：      ${LLM_MODEL}`)
    console.log(`  上游：      ${LLM_BASE_URL}`)
    console.log(`  网关 Key：  ${GATEWAY_KEY ? '已启用（见 .env）' : '未启用（前端可填任意值）'}`)
    console.log('')
  },
)
