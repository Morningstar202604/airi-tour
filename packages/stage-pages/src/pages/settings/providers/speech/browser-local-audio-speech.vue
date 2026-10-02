<script setup lang="ts">
import { SpeechProviderSettings } from '@wenlv/stage-ui/components'
</script>

<template>
  <SpeechProviderSettings
    provider-id="browser-local-audio-speech"
    :hide-api-key="true"
    placeholder="http://localhost:8080/v1/"
  >
    <template #voice-settings>
      <div class="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        浏览器本地语音引擎（Transformers.js）。需要 WebGPU 或 8GB+ 内存的浏览器。填写本地服务地址即可使用，无需 API Key。
      </div>
    </template>
  </SpeechProviderSettings>
</template>

<route lang="yaml">
meta:
  layout: settings
  titleKey: settings.pages.providers.provider.browser-local-audio-speech.title
  subtitleKey: settings.title
  descriptionKey: settings.pages.providers.provider.browser-local-audio-speech.description
  stageTransition:
    name: slide
</route>
