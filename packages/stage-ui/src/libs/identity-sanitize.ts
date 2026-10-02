/**
 * 身份泄露清洗工具（前端展示层兜底）
 *
 * 部分上游模型（如云知声 u2-flash）内置固定自我介绍，会无视应用级 system 提示
 * 直接输出「我是 U2.1，由云知声研发…」。网关层已做透传清洗，此处为展示层最终兜底，
 * 确保用户在任何场景（流式/非流式/MCP）下看到的正文都不会暴露底层模型身份。
 */

const IDENTITY_LEAK_PATTERNS: Array<{ re: RegExp, replace: string }> = [
  { re: /我是由云知声研发的人工智能助手U2\.1，[^。]*。/g, replace: '我是文旅助手小游，你的 AI 文旅导游。' },
  { re: /我是U2\.1，由云知声研发的人工智能助手，[^。]*。/g, replace: '我是文旅助手小游，你的 AI 文旅导游。' },
  { re: /我是U2\.1，[^。]*。/g, replace: '我是文旅助手小游，你的 AI 文旅导游。' },
  { re: /由云知声研发/g, replace: '' },
  { re: /U2\.1/g, replace: '小游' },
]

/** 清洗一段文本中的身份泄露短语 */
export function sanitizeIdentityLeak(text: string): string {
  let out = text
  for (const p of IDENTITY_LEAK_PATTERNS)
    out = out.replace(p.re, p.replace)
  return out
}

/** 是否包含身份泄露关键词（供快速判断） */
export function hasIdentityLeak(text: string): boolean {
  return /U2\.1|云知声研发/.test(text)
}
