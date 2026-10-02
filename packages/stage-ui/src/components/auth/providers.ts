import type { OAuthProvider } from '../../libs/auth'

export interface SignInProviderDefinition {
  id: OAuthProvider
  name: string
  icon: string
}

// 文旅助手面向国内使用，仅保留本地/自建身份体系，不提供海外社交账号登录。
export const defaultSignInProviders: SignInProviderDefinition[] = []
