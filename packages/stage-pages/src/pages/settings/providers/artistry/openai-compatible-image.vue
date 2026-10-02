<script setup lang="ts">
import { useArtistryStore } from '@proj-airi/stage-ui/stores/modules/artistry'
import { FieldInput } from '@proj-airi/ui'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const artistryStore = useArtistryStore()
const { t } = useI18n()

const {
  openaiImageBaseUrl,
  openaiImageApiKey,
  openaiImageModel,
} = storeToRefs(artistryStore)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="rounded-xl bg-emerald-500/8 p-5 dark:bg-emerald-500/12">
      <div class="mb-3 flex items-center gap-3">
        <div class="i-solar:magic-stick-3-bold-duotone text-3xl text-emerald-500" />
        <div>
          <h2 class="text-xl text-neutral-800 font-semibold dark:text-neutral-100">
            {{ t('settings.pages.providers.provider.openai-compatible-image.settings.heading') }}
          </h2>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            {{ t('settings.pages.providers.provider.openai-compatible-image.settings.description') }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <FieldInput
        v-model="openaiImageBaseUrl"
        :label="t('settings.pages.providers.provider.openai-compatible-image.settings.base_url.label')"
        :description="t('settings.pages.providers.provider.openai-compatible-image.settings.base_url.description')"
        placeholder="https://api.volcengine.com/..."
      />

      <FieldInput
        v-model="openaiImageApiKey"
        :label="t('settings.pages.providers.provider.openai-compatible-image.settings.api_key.label')"
        :description="t('settings.pages.providers.provider.openai-compatible-image.settings.api_key.description')"
        type="password"
      />

      <FieldInput
        v-model="openaiImageModel"
        :label="t('settings.pages.providers.provider.openai-compatible-image.settings.model.label')"
        :description="t('settings.pages.providers.provider.openai-compatible-image.settings.model.description')"
        placeholder="seedream-5.0 / wanx / cogview"
      />
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: settings
  titleKey: settings.pages.providers.provider.openai-compatible-image.settings.title
  subtitleKey: settings.title
  stageTransition:
    name: slide
</route>
