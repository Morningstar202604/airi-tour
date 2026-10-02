<script setup lang="ts">
import { TranscriptionProviderSettings } from '@proj-airi/stage-ui/components'
</script>

<template>
  <TranscriptionProviderSettings
    provider-id="browser-local-audio-transcription"
    placeholder="http://localhost:8080/v1/"
  />
</template>

<route lang="yaml">
meta:
  layout: settings
  titleKey: settings.pages.providers.provider.browser-local-audio-transcription.title
  subtitleKey: settings.title
  descriptionKey: settings.pages.providers.provider.browser-local-audio-transcription.description
  stageTransition:
    name: slide
</route>
