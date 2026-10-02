// 文旅助手网关自测工具：本地 mock OpenAI 兼容上游（无需真实 Key）
// 用法：node server/dev/mock-llm.mjs （默认 :9001）
import { createServer } from 'node:http'
const PORT = 9001
createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/v1/chat/completions') {
    let raw = ''
    req.on('data', (c) => { raw += c })
    req.on('end', () => {
      let body = {}
      try { body = JSON.parse(raw) } catch {}
      const stream = body.stream === true
      if (!(req.headers.authorization || '').startsWith('Bearer ')) {
        res.writeHead(401, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ error: { message: 'mock: missing key' } })); return
      }
      const reply = { role: 'assistant', content: '你好，我是文旅助手小游！潮州推荐去广济桥看灯光秀，牌坊街吃牛肉丸～' }
      if (stream) {
        res.writeHead(200, { 'content-type': 'text/event-stream' })
        res.write(`data: ${JSON.stringify({ id: 'mock-1', object: 'chat.completion.chunk', model: 'test-model', choices: [{ index: 0, delta: { role: 'assistant', content: reply.content.slice(0, 6) } }] })}\n\n`)
        res.write(`data: ${JSON.stringify({ id: 'mock-1', object: 'chat.completion.chunk', model: 'test-model', choices: [{ index: 0, delta: { content: reply.content.slice(6) } }] })}\n\n`)
        res.write('data: [DONE]\n\n'); res.end()
      } else {
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ id: 'mock-1', object: 'chat.completion', model: 'test-model', choices: [{ index: 0, message: reply, finish_reason: 'stop' }] }))
      }
    }); return
  }
  if (req.method === 'GET' && req.url === '/v1/models') {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ object: 'list', data: [{ id: 'test-model' }] })); return
  }
  res.writeHead(404); res.end('not found')
}).listen(PORT, () => console.log(`mock LLM on :${PORT}`))
