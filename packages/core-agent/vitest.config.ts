import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@wenlv/core-agent',
    include: ['src/**/*.test.ts'],
  },
})
