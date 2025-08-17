import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
// Derive a generic base path:
// - Locally (dev/build): '/'
// - In GitHub Actions: '/<repo>/' (works for project pages)
// - Or override via env: VITE_BASE
// Avoid Node typings by using globalThis
const env = (globalThis as any)?.process?.env as Record<string, string | undefined> | undefined
const repo = env?.GITHUB_REPOSITORY?.split('/')?.[1]
const inferredBase = env?.GITHUB_ACTIONS && repo ? `/${repo}/` : '/'
const base = env?.VITE_BASE ?? inferredBase

export default defineConfig({
  plugins: [react()],
  base,
})
