<script setup lang="ts">
import { SpeechProviderSettings } from '@wenlv/stage-ui/components'
</script>

<template>
  <SpeechProviderSettings
    provider-id="app-local-audio-speech"
    :hide-api-key="true"
    placeholder="http://localhost:8080/v1/"
  >
    <template #voice-settings>
      <div class="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        App 本地语音引擎（HuggingFace Candle 系服务）。填写本地服务地址后即可使用，无需 API Key。
      </div>
    </template>
  </SpeechProviderSettings>
</template>

<route lang="yaml">
meta:
  layout: settings
  titleKey: settings.pages.providers.provider.app-local-audio-speech.title
  subtitleKey: settings.title
  descriptionKey: settings.pages.providers.provider.app-local-audio-speech.description
  stageTransition:
    name: slide
</route>
