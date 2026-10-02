import type { ProviderDefinition } from '../types'

import { provider302AI } from './cloud/302-ai'
import { providerAIHubMix } from './cloud/aihubmix'
import { providerAtlasCloud } from './cloud/atlascloud'
import { providerBytePlus } from './cloud/byteplus'
import { providerCometAPI, providerCometAPISpeech, providerCometAPITranscription } from './cloud/comet-api'
import { providerDeepSeek } from './cloud/deepseek'
import { providerMinimax } from './cloud/minimax'
import { providerMinimaxSpeech } from './cloud/minimax-speech'
import { providerModelScope } from './cloud/modelscope'
import { providerMoonshotAI } from './cloud/moonshot-ai'
import { providerN1N } from './cloud/n1n'
import {
  providerOpenAICompatibleAudioSpeech,
  providerOpenAICompatibleAudioTranscription,
} from './cloud/openai-audio'
import { providerOpenAICompatible } from './cloud/openai-compatible'
import {
  providerAlibabaCloudModelStudio,
  providerVolcengineSpeech,
} from './cloud/unspeech'
import { providerZai } from './cloud/zai'
import { providerBrowserWebSpeechApi } from './local/browser-web-speech-api'
import { providerIndexTtsVllm } from './local/index-tts-vllm'
import { providerLmStudio } from './local/lm-studio'
import { providerOllama } from './local/ollama'
import { providerPlayer2Speech } from './local/player2-speech'
import { providerSpeechNoop } from './local/speech-noop'

/**
 * Erases configuration types at the registry boundary.
 *
 * A registry selects definitions by a runtime id. It cannot know the selected
 * configuration type. Individual provider exports preserve their exact type.
 */
type ProviderDefinitionRegistration<TId extends string = string> = Pick<ProviderDefinition, 'name' | 'order'> & { id: TId }

type ErasedProviderDefinitions<TDefinitions extends readonly ProviderDefinitionRegistration[]> = {
  [K in keyof TDefinitions]: TDefinitions[K] extends ProviderDefinitionRegistration<infer TId>
    ? ProviderDefinition<Record<string, unknown>, TId>
    : never
}

function eraseProviderDefinitions<const TDefinitions extends readonly ProviderDefinitionRegistration[]>(
  ...definitions: TDefinitions
): ErasedProviderDefinitions<TDefinitions> {
  return definitions as unknown as ErasedProviderDefinitions<TDefinitions>
}

/**
 * Definitions that can load without Vue, Pinia, persistence, or Electron.
 *
 * 文旅助手版：已裁剪海外提供商，仅保留国内直连 / 本地 / OpenAI 兼容。
 * This list includes Browser-only definitions. Hosts must call
 * `isAvailableBy` before they offer one to a user in the current runtime.
 */
export const portableProviderDefinitions = eraseProviderDefinitions(
  provider302AI,
  providerAIHubMix,
  providerAtlasCloud,
  providerBytePlus,
  providerCometAPI,
  providerCometAPISpeech,
  providerCometAPITranscription,
  providerDeepSeek,
  providerMinimax,
  providerMinimaxSpeech,
  providerModelScope,
  providerMoonshotAI,
  providerN1N,
  providerOpenAICompatibleAudioSpeech,
  providerOpenAICompatibleAudioTranscription,
  providerOpenAICompatible,
  providerAlibabaCloudModelStudio,
  providerVolcengineSpeech,
  providerZai,
  providerBrowserWebSpeechApi,
  providerIndexTtsVllm,
  providerLmStudio,
  providerOllama,
  providerPlayer2Speech,
  providerSpeechNoop,
)

export { createProviderRegistry, defineProvider } from './registry'
