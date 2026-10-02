<script setup lang="ts">
import type { KnowledgeHit, TourKnowledgeItem } from '@wenlv/stage-ui/constants/tour/tour-knowledge'

import { searchTourKnowledge, TOUR_KNOWLEDGE_ITEMS, USER_INSTRUCTION_KEY, USER_KNOWLEDGE_KEY } from '@wenlv/stage-ui/constants/tour/tour-knowledge'
import { Button, FieldInput, FieldTextArea } from '@wenlv/ui'
import { computed, reactive, ref } from 'vue'

// —— 用户自定义知识条目 ——
const userItems = ref<TourKnowledgeItem[]>(loadUserItems())
const draft = reactive<TourKnowledgeItem>({ city: '', name: '', digest: '' })
const editingIndex = ref<number | null>(null)
const savedTip = ref('')

function loadUserItems(): TourKnowledgeItem[] {
  try {
    const raw = localStorage.getItem(USER_KNOWLEDGE_KEY)
    if (!raw)
      return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed))
      return []
    return parsed.filter((it): it is TourKnowledgeItem =>
      !!it && typeof it.city === 'string' && typeof it.name === 'string' && typeof it.digest === 'string')
  }
  catch {
    return []
  }
}

function persistUserItems() {
  localStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(userItems.value))
}

function flashSaved() {
  savedTip.value = '已保存，新对话立即生效'
  window.setTimeout(() => { savedTip.value = '' }, 2200)
}

function submitItem() {
  if (!draft.city.trim() || !draft.name.trim() || !draft.digest.trim())
    return
  const item: TourKnowledgeItem = { city: draft.city.trim(), name: draft.name.trim(), digest: draft.digest.trim() }
  if (editingIndex.value !== null) {
    userItems.value.splice(editingIndex.value, 1, item)
    editingIndex.value = null
  }
  else {
    userItems.value.push(item)
  }
  persistUserItems()
  draft.city = ''
  draft.name = ''
  draft.digest = ''
  flashSaved()
}

function editItem(index: number) {
  editingIndex.value = index
  const item = userItems.value[index]
  draft.city = item.city
  draft.name = item.name
  draft.digest = item.digest
}

function removeItem(index: number) {
  userItems.value.splice(index, 1)
  if (editingIndex.value === index)
    editingIndex.value = null
  persistUserItems()
  flashSaved()
}

// —— 附加指令 ——
const instruction = ref(localStorage.getItem(USER_INSTRUCTION_KEY) ?? '')

function saveInstruction() {
  localStorage.setItem(USER_INSTRUCTION_KEY, instruction.value)
  flashSaved()
}

// —— 内置知识库（只读展示） ——
const search = ref('')

const builtinGroups = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  const groups = new Map<string, TourKnowledgeItem[]>()
  for (const item of TOUR_KNOWLEDGE_ITEMS) {
    if (keyword && ![item.city, item.name, item.digest].some(text => text.toLowerCase().includes(keyword)))
      continue
    if (!groups.has(item.city))
      groups.set(item.city, [])
    groups.get(item.city)!.push(item)
  }
  return [...groups.entries()].map(([city, items]) => ({ city, items }))
})

// —— 检索测试（召回视图） ——
const ragQuery = ref('')
const ragHits = ref<KnowledgeHit[]>([])

function runRagTest() {
  ragHits.value = searchTourKnowledge(ragQuery.value, 12)
}
</script>

<template>
  <div flex="~ col gap-6" font-normal>
    <!-- 附加指令 -->
    <section flex="~ col gap-2">
      <h2 text-lg font-semibold>附加指令</h2>
      <p text-sm opacity-60>给 Agent 添加自定义行为指令（追加到系统提示词末尾，对全部对话生效）。例如：潮州问题要重点推荐牌坊街。</p>
      <FieldTextArea v-model="instruction" placeholder="输入想让 Agent 一直遵守的指令…" />
      <Button
        self-start
        :disabled="!instruction.trim()"
        @click="saveInstruction"
      >
        保存指令
      </Button>
    </section>

    <!-- 用户自定义知识 -->
    <section flex="~ col gap-2">
      <h2 text-lg font-semibold>自定义知识条目</h2>
      <p text-sm opacity-60>把内置知识库没有的景点、店铺、路线加进来，Agent 回答时优先引用。保存在本机浏览器。</p>

      <div grid="~ cols-12 gap-2" items-end>
        <div col-span-3>
          <FieldInput v-model="draft.city" label="城市" placeholder="潮州" />
        </div>
        <div col-span-3>
          <FieldInput v-model="draft.name" label="景点/名称" placeholder="牌坊街" />
        </div>
        <div col-span-4>
          <FieldInput v-model="draft.digest" label="速查文本" placeholder="免费街区，22座明清石牌坊，建议晚上逛…" />
        </div>
        <div col-span-2 pb-1>
          <Button
            w-full
            :disabled="!draft.city.trim() || !draft.name.trim() || !draft.digest.trim()"
            @click="submitItem"
          >
            {{ editingIndex !== null ? '更新' : '添加' }}
          </Button>
        </div>
      </div>

      <p v-if="savedTip" text-sm text-emerald-500>{{ savedTip }}</p>

      <p v-if="userItems.length === 0" text-sm opacity-50 py-4>
        还没有自定义条目，用上面表单添加第一条。
      </p>
      <template v-else>
        <p text-xs opacity-50>
          共 {{ userItems.length }} 条（{{ userItems.filter(i => i.source === 'auto').length }} 条自动沉淀 / {{ userItems.filter(i => i.source !== 'auto').length }} 条手动）
        </p>
        <ul flex="~ col gap-1">
        <li
          v-for="(item, index) in userItems"
          :key="`${item.city}-${item.name}-${index}`"
          class="flex flex-row gap-2 items-center bg-white/5 rounded-lg px-3 py-2"
        >
          <span font-semibold whitespace-nowrap>{{ item.city }}·{{ item.name }}</span>
          <span
            v-if="item.source === 'auto'"
            text-xs
            px-1.5
            py-0.5
            rounded
            class="bg-primary-500/15 text-primary-500"
          >沉淀</span>
          <span flex-1 text-sm opacity-80 truncate>{{ item.digest }}</span>
          <button text-sm px-2 @click="editItem(index)">编辑</button>
          <button text-sm px-2 text-red-400 @click="removeItem(index)">删除</button>
        </li>
        </ul>
      </template>
    </section>

    <!-- 检索测试 -->
    <section flex="~ col gap-2">
      <h2 text-lg font-semibold>检索测试</h2>
      <p text-sm opacity-60>模拟对话时按问题召回知识（内置+自定义合并打分，命中前 12 条注入系统提示）。</p>
      <div flex="~ row gap-2">
        <FieldInput v-model="ragQuery" placeholder="例如：潮州 广济桥 门票" @keyup.enter="runRagTest" />
        <Button :disabled="!ragQuery.trim()" @click="runRagTest">测试</Button>
      </div>
      <div v-if="ragHits.length > 0" flex="~ col gap-1">
        <p text-xs opacity-50>召回 {{ ragHits.length }} 条</p>
        <ul flex="~ col gap-0.5">
          <li
            v-for="hit in ragHits"
            :key="`${hit.item.city}-${hit.item.name}`"
            text-sm
            flex="~ row gap-2 items-center"
          >
            <span font-medium>{{ hit.item.city }}·{{ hit.item.name }}</span>
            <span text-xs opacity-60>分 {{ hit.score }}</span>
            <span flex-1 opacity-75 truncate>{{ hit.item.digest }}</span>
          </li>
        </ul>
      </div>
      <p v-else-if="ragQuery.trim()" text-sm opacity-50>没有命中条目，换个关键词试试。</p>
    </section>

    <!-- 内置知识库 -->
    <section flex="~ col gap-2">
      <h2 text-lg font-semibold>内置知识库（只读）</h2>
      <p text-sm opacity-60>默认内置的全国文旅速查知识，共 {{ TOUR_KNOWLEDGE_ITEMS.length }} 条。内置库不能修改，需要补充的请加到上面的自定义条目。</p>
      <FieldInput v-model="search" placeholder="搜索城市/景点/关键词…" />
      <div flex="~ col gap-3">
        <div v-for="group in builtinGroups" :key="group.city">
          <h3 font-semibold text-sm opacity-80>{{ group.city }}（{{ group.items.length }}）</h3>
          <ul flex="~ col gap-0.5">
            <li
              v-for="item in group.items"
              :key="`${item.city}-${item.name}`"
              text-sm
            >
              <span font-medium>{{ item.name }}</span>
              <span opacity-75> — {{ item.digest }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<route lang="yaml">
meta:
  layout: settings
  title: 知识库
  description: 自定义 Agent 知识库与附加指令
  icon: i-solar:book-bookmark-bold-duotone
  settingsEntry: true
  order: 26
  stageTransition:
    name: slide
</route>
