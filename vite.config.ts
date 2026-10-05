import { defineConfig } from 'vite'
import { tanstackStartVite } from '@tanstack/vite-plugin-tanstack-start'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStartVite(),
  ],
})
