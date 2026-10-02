<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { ref } from 'vue'
import { AUTO_SEDIMENT_KEY, clearAutoKnowledgeItems, countAutoKnowledgeItems, isAutoSedimentEnabled } from '@wenlv/stage-ui/constants/tour/tour-knowledge'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const autoSediment = ref(isAutoSedimentEnabled())
const autoCount = ref(countAutoKnowledgeItems())
const clearTip = ref('')

function toggleAutoSediment() {
  autoSediment.value = !autoSediment.value
  localStorage.setItem(AUTO_SEDIMENT_KEY, autoSediment.value ? 'on' : 'off')
}

function clearAutoItems() {
  const removed = clearAutoKnowledgeItems()
  autoCount.value = 0
  clearTip.value = removed > 0 ? `已清空 ${removed} 条自动沉淀条目` : '当前没有自动沉淀条目'
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="rounded-2xl border border-neutral-200/80 bg-white/60 p-5 shadow-sm backdrop-blur-sm dark:border-neutral-800/70 dark:bg-neutral-900/40">
      <h3 class="text-sm font-semibold text-neutral-900 dark:text-white">
        长期记忆说明
      </h3>
      <p class="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        长期记忆是跨会话持续生效的知识与偏好。本版本将长期记忆落在这三处：<br>
        ① 自动沉淀 —— 对话中 Agent 提到的景点自动写入知识库（可开关）；<br>
        ② 知识库 —— 你手写的景点、店铺、路线等长期知识（Agent 每次回答都会参考）；<br>
        ③ 数据管理 —— 本地保存的会话与配置，可导出备份或重置。
      </p>
    </div>

    <div class="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white/60 p-5 shadow-sm backdrop-blur-sm dark:border-neutral-800/70 dark:bg-neutral-900/40">
      <div class="flex flex-col gap-0.5">
        <span class="text-sm font-semibold text-neutral-900 dark:text-white">
          自动沉淀
        </span>
        <span class="text-xs text-neutral-500 dark:text-neutral-400">
          Agent 回复中提到内置知识库的景点时，自动追加到你的知识库，跨会话生效
        </span>
      </div>
      <button
        type="button"
        role="switch"
        :aria-checked="autoSediment"
        class="relative h-6 w-11 shrink-0 rounded-full transition-colors"
        :class="autoSediment ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-700'"
        @click="toggleAutoSediment"
      >
        <span
          class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
          :class="autoSediment ? 'left-[22px]' : 'left-0.5'"
        />
      </button>
    </div>

    <div class="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white/60 p-5 shadow-sm backdrop-blur-sm dark:border-neutral-800/70 dark:bg-neutral-900/40">
      <div class="flex flex-col gap-0.5">
        <span class="text-sm font-semibold text-neutral-900 dark:text-white">
          沉淀条目
        </span>
        <span class="text-xs text-neutral-500 dark:text-neutral-400">
          当前已自动沉淀 {{ autoCount }} 条（上限 100 条，超出自动保留最新）
        </span>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-lg border border-red-300/60 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10 dark:border-red-700/50 dark:text-red-400"
        @click="clearAutoItems"
      >
        清空沉淀
      </button>
    </div>
    <p v-if="clearTip" class="-mt-2 text-xs text-emerald-500">
      {{ clearTip }}
    </p>

    <RouterLink
      to="/settings/knowledge"
      class="group flex items-center gap-4 rounded-2xl border border-neutral-200/80 bg-white/60 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-primary-300/60 hover:bg-white dark:border-neutral-800/70 dark:bg-neutral-900/40 dark:hover:border-primary-700/50"
    >
      <div class="i-solar:book-bookmark-bold-duotone text-2xl text-primary-500" />
      <div class="flex flex-col gap-0.5">
        <span class="text-sm font-semibold text-neutral-900 dark:text-white">
          知识库（长期记忆）
        </span>
        <span class="text-xs text-neutral-500 dark:text-neutral-400">
          添加自定义知识条目与附加指令，跨会话持续生效
        </span>
      </div>
      <div class="ml-auto i-solar:alt-arrow-right-bold-duotone text-lg text-neutral-400 transition group-hover:text-primary-500" />
    </RouterLink>

    <RouterLink
      to="/settings/data"
      class="group flex items-center gap-4 rounded-2xl border border-neutral-200/80 bg-white/60 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-primary-300/60 hover:bg-white dark:border-neutral-800/70 dark:bg-neutral-900/40 dark:hover:border-primary-700/50"
    >
      <div class="i-solar:database-bold-duotone text-2xl text-primary-500" />
      <div class="flex flex-col gap-0.5">
        <span class="text-sm font-semibold text-neutral-900 dark:text-white">
          数据管理
        </span>
        <span class="text-xs text-neutral-500 dark:text-neutral-400">
          导出对话记录、清理存储、恢复默认设置
        </span>
      </div>
      <div class="ml-auto i-solar:alt-arrow-right-bold-duotone text-lg text-neutral-400 transition group-hover:text-primary-500" />
    </RouterLink>
  </div>
</template>

<route lang="yaml">
meta:
  layout: settings
  titleKey: settings.pages.modules.memory-long-term.title
  subtitleKey: settings.title
  stageTransition:
    name: slide
</route>
