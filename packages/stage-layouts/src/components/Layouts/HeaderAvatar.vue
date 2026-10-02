<script setup lang="ts">
import { signOut } from '@wenlv/stage-ui/libs/auth'
import { useAuthStore } from '@wenlv/stage-ui/stores/auth'
import { AnimatedContent, Avatar } from '@wenlv/ui'
import { storeToRefs } from 'pinia'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'reka-ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

defineProps<{
  /** Shows only the account control on the mobile Stage. @default false */
  compact?: boolean
}>()

const authStore = useAuthStore()
const { isAuthenticated, user } = storeToRefs(authStore)
const { t } = useI18n()

const userName = computed(() => user.value?.name)
const userAvatar = computed(() => user.value?.image)

</script>

<template>
  <div flex items-center gap-2>
    <!-- 未登录：仅设置入口（登录功能已随托管后端裁剪） -->
    <template v-if="!isAuthenticated">
      <RouterLink
        v-if="!compact"
        border="2 solid neutral-100/60 dark:neutral-800/30"
        bg="neutral-50/70 dark:neutral-800/70"
        w-fit flex items-center justify-center rounded-xl p-2 backdrop-blur-md
        title="Settings"
        to="/settings"
      >
        <div i-solar:settings-minimalistic-bold-duotone size-5 text="neutral-500 dark:neutral-400" />
      </RouterLink>
    </template>

    <!-- Authenticated: Avatar Dropdown -->
    <DropdownMenuRoot v-else>
      <DropdownMenuTrigger as-child>
        <button
          type="button"
          :aria-label="userName || t('settings.pages.account.title')"
          :class="[
            'group h-10 flex items-center gap-2 rounded-full border-2 p-1 outline-none shadow-sm backdrop-blur-md',
            compact ? 'size-11 justify-center focus-visible:ring-2 focus-visible:ring-primary-500' : 'pl-1 pr-3',
            'border-neutral-100/60 bg-neutral-50/70 dark:border-neutral-800/30 dark:bg-neutral-800/70',
            'hover:bg-neutral-100 data-[state=open]:bg-neutral-100',
            'dark:hover:bg-neutral-800 dark:data-[state=open]:bg-neutral-800',
            'data-[state=open]:ring-2 data-[state=open]:ring-primary-500/20',
            'transition-colors duration-200 ease-in-out',
          ]"
        >
          <Avatar
            :src="userAvatar"
            :class="[
              'h-7 w-7 rounded-full',
              'bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400',
            ]"
          />

          <span
            v-if="userName && !compact"
            :class="[
              'max-w-[100px] hidden truncate text-sm font-medium sm:block',
              'text-neutral-700 dark:text-neutral-200',
            ]"
          >
            {{ userName }}
          </span>
          <div
            v-if="!compact"
            :class="[
              'i-solar:alt-arrow-down-linear text-neutral-400',
              'transition-transform duration-200',
              'group-data-[state=open]:rotate-180',
            ]"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent
          as-child
          align="end"
          side="bottom"
          :side-offset="6"
          :class="[
            'z-10000 w-60 rounded-xl border p-1 shadow-lg outline-none backdrop-blur-md',
            'border-neutral-100/80 bg-neutral-100/80 text-neutral-700',
            'dark:border-neutral-800/60 dark:bg-neutral-800/80 dark:text-neutral-100',
          ]"
        >
          <AnimatedContent>
            <div class="px-3 py-2">
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                Signed in as
              </p>
              <p class="truncate text-sm text-neutral-900 font-medium dark:text-white">
                {{ userName }}
              </p>
            </div>

            <DropdownMenuSeparator :class="['mx-2 my-1 h-px bg-neutral-200/80 dark:bg-neutral-700/80']" />

            <DropdownMenuItem as-child>
              <RouterLink
                to="/settings"
                :class="[
                  'group w-full flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2',
                  'text-sm leading-none outline-none text-neutral-700 dark:text-neutral-200',
                  'data-[highlighted]:bg-primary-100/80 dark:data-[highlighted]:bg-primary-900/40',
                  'transition-colors duration-150 ease-in-out',
                ]"
              >
                <div class="i-solar:settings-minimalistic-bold-duotone text-lg text-neutral-400 transition group-hover:text-primary-500" />
                Settings
              </RouterLink>
            </DropdownMenuItem>

            <DropdownMenuSeparator :class="['mx-2 my-1 h-px bg-neutral-200/80 dark:bg-neutral-700/80']" />

            <DropdownMenuItem as-child>
              <button
                :class="[
                  'group w-full flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2',
                  'text-sm leading-none outline-none text-red-600 dark:text-red-400',
                  'data-[highlighted]:bg-red-50 dark:data-[highlighted]:bg-red-900/20',
                  'transition-colors duration-150 ease-in-out',
                ]"
                @click="signOut"
              >
                <div class="i-solar:logout-3-bold-duotone text-lg transition group-hover:text-red-600 dark:group-hover:text-red-400" />
                Sign out
              </button>
            </DropdownMenuItem>
          </AnimatedContent>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  </div>
</template>
