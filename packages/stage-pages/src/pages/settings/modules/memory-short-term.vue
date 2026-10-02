<script setup lang="ts">
import { Alert } from '@wenlv/stage-ui/components'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useChatContextStore } from '@wenlv/stage-ui/stores/chat/context-store'

const { t } = useI18n()
const chatContextStore = useChatContextStore()
const { activeContexts } = storeToRefs(chatContextStore)

const limit = ref(400)
const isDirty = ref(false)
const saved = ref(false)

onMounted(() => {
  const stored = Number(localStorage.getItem('settings/memory/short-term-limit') ?? '400')
  limit.value = Number.isFinite(stored) && stored > 0 ? stored : 400
})

function clamp(n: number) {
  return Math.min(Math.max(Math.floor(n) || 400, 1), 2000)
}

const activeBucketCount = computed(() => Object.keys(activeContexts.value).length)
const activeMessageCount = computed(() => Object.values(activeContexts.value).reduce((sum, msgs) => sum + msgs.length, 0))

function save() {
  const value = clamp(limit.value)
  limit.value = value
  chatContextStore.updateContextHistoryLimit(value)
  isDirty.value = false
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

function resetToDefault() {
  limit.value = 400
  chatContextStore.updateContextHistoryLimit(400)
  isDirty.value = false
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <Alert type="info">
      <template #title>
        短期记忆 = 会话上下文窗口
      </template>
      <template #content>
        Agent 在回答时会参考最近 N 条上下文记录（工具调用、系统事件等）。条数越大记得越久，但消耗的模型上下文 token 越多。
      </template>
    </Alert>

    <div class="rounded-2xl border border-neutral-200/80 bg-white/60 p-5 shadow-sm backdrop-blur-sm dark:border-neutral-800/70 dark:bg-neutral-900/40">
      <label class="block text-sm font-semibold text-neutral-900 dark:text-white">
        上下文记忆条数
      </label>
      <div class="mt-2 flex items-center gap-3">
        <input
          v-model.number="limit"
          type="range"
          min="1"
          max="2000"
          step="10"
          class="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-neutral-200 dark:bg-neutral-700"
          @input="isDirty = true; saved = false"
        >
        <input
          v-model.number="limit"
          type="number"
          min="1"
          max="2000"
          class="w-24 rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          @input="isDirty = true; saved = false"
        >
      </div>
      <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        当前 {{ limit }} 条 · 推荐 200–800 · 默认 400
      </p>
      <div class="mt-4 flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-40"
          :disabled="!isDirty"
          @click="save"
        >
          保存
        </button>
        <button
          type="button"
          class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          @click="resetToDefault"
        >
          恢复默认
        </button>
        <span v-if="saved" class="text-sm text-emerald-600 dark:text-emerald-400">
          ✓ 已保存
        </span>
      </div>
    </div>

    <div class="rounded-2xl border border-neutral-200/80 bg-white/60 p-5 text-sm text-neutral-600 shadow-sm backdrop-blur-sm dark:border-neutral-800/70 dark:bg-neutral-900/40 dark:text-neutral-300">
      当前活跃上下文：<span class="font-semibold text-primary-600 dark:text-primary-400">{{ activeBucketCount }}</span> 个来源 · <span class="font-semibold text-primary-600 dark:text-primary-400">{{ activeMessageCount }}</span> 条消息
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: settings
  titleKey: settings.pages.modules.memory-short-term.title
  subtitleKey: settings.title
  stageTransition:
    name: slide
</route>
