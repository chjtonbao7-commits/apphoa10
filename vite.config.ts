import { defineConfig } from 'vite'
import { tanstackStartVite } from '@tanstack/start-vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStartVite(),
  ],
})
