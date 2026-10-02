import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    './src/index.ts',
  ],
  noExternal: [
    '@wenlv/font-cjkfonts-allseto',
    '@wenlv/font-departure-mono',
    '@wenlv/font-xiaolai',
  ],
  dts: true,
  sourcemap: true,
})
