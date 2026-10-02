/**
 * 本地模式 API 客户端（占位实现）
 *
 * 上游版本通过 `@wenlv/api-server`（托管后端）提供 Hono 客户端类型。
 * 文旅助手版已裁剪托管后端，聊天/语音/角色/设置全部在本地（浏览器）运行。
 *
 * 此客户端仅保留与上游一致的「调用形状」，用于类型兼容：
 * - 未配置 VITE_SERVER_URL 时，远程调用不会发起（相关页面会优雅降级）；
 * - 未来如需接入自建后端，可恢复 `@wenlv/api-server` 的 AppType 类型。
 *
 * 远程服务接口见：
 * - CharactersRemoteClient（services/characters.ts）
 * - InferenceServiceProvidersRemoteClient（services/inference-service-providers.ts）
 */

import { authedFetch } from '../libs/auth-fetch'
import { SERVER_URL } from '../libs/server'

interface RequestOptions {
  init: { signal: AbortSignal }
}

interface RemoteResponse<T> {
  json: () => Promise<T>
  ok: boolean
}

interface StageApiClientShape {
  api: {
    v1: {
      characters: {
        $get: (params: { query: { all: string } }, options?: RequestOptions) => Promise<RemoteResponse<unknown[]>>
        $post: (params: { json: unknown }, options?: RequestOptions) => Promise<RemoteResponse<unknown>>
        ':id': {
          $get: (params: { param: { id: string } }, options?: RequestOptions) => Promise<RemoteResponse<unknown>>
          $patch: (params: { param: { id: string }, json: unknown }, options?: RequestOptions) => Promise<RemoteResponse<unknown>>
          $delete: (params: { param: { id: string } }, options?: RequestOptions) => Promise<{ ok: boolean }>
          bookmark: {
            $post: (params: { param: { id: string } }, options?: RequestOptions) => Promise<RemoteResponse<unknown>>
          }
          like: {
            $post: (params: { param: { id: string } }, options?: RequestOptions) => Promise<RemoteResponse<unknown>>
          }
        }
      }
      providers: {
        $get: (params?: undefined, options?: RequestOptions) => Promise<RemoteResponse<unknown[]>>
        ':id': {
          $put: (params: { json: { definitionId: string, config: Record<string, unknown> }, param: { id: string } }, options?: RequestOptions) => Promise<RemoteResponse<unknown>>
          $delete: (params: { param: { id: string } }, options?: RequestOptions) => Promise<{ ok: boolean, status: number }>
        }
      }
      flux: {
        $get: () => Promise<{ ok: boolean, json: () => Promise<{ flux: number }> }>
      }
    }
  }
}

export const client = {
  api: {
    v1: {},
  },
} as unknown as StageApiClientShape

export type StageApiClient = StageApiClientShape
