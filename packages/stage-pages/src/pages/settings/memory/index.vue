<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-3">
    <RouterLink
      to="/settings/modules/memory-short-term"
      class="group flex items-center gap-4 rounded-2xl border border-neutral-200/80 bg-white/60 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-primary-300/60 hover:bg-white dark:border-neutral-800/70 dark:bg-neutral-900/40 dark:hover:border-primary-700/50"
    >
      <div class="i-solar:bookmark-bold-duotone text-2xl text-primary-500" />
      <div class="flex flex-col gap-0.5">
        <span class="text-sm font-semibold text-neutral-900 dark:text-white">
          {{ t('settings.pages.modules.memory-short-term.title') }}
        </span>
        <span class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ t('settings.pages.modules.memory-short-term.description') }}
        </span>
      </div>
      <div class="ml-auto i-solar:alt-arrow-right-bold-duotone text-lg text-neutral-400 transition group-hover:text-primary-500" />
    </RouterLink>

    <RouterLink
      to="/settings/modules/memory-long-term"
      class="group flex items-center gap-4 rounded-2xl border border-neutral-200/80 bg-white/60 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-primary-300/60 hover:bg-white dark:border-neutral-800/70 dark:bg-neutral-900/40 dark:hover:border-primary-700/50"
    >
      <div class="i-solar:book-bookmark-bold-duotone text-2xl text-primary-500" />
      <div class="flex flex-col gap-0.5">
        <span class="text-sm font-semibold text-neutral-900 dark:text-white">
          {{ t('settings.pages.modules.memory-long-term.title') }}
        </span>
        <span class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ t('settings.pages.modules.memory-long-term.description') }}
        </span>
      </div>
      <div class="ml-auto i-solar:alt-arrow-right-bold-duotone text-lg text-neutral-400 transition group-hover:text-primary-500" />
    </RouterLink>
  </div>
</template>

<route lang="yaml">
meta:
  layout: settings
  titleKey: settings.pages.memory.title
  subtitleKey: settings.title
  descriptionKey: settings.pages.memory.description
  icon: i-solar:leaf-bold-duotone
  settingsEntry: true
  order: 5
  stageTransition:
    name: slide
</route>
