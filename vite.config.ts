import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
// Derive a generic base path:
// - Locally (dev/build): '/'
// - In GitHub Actions: '/<repo>/' (works for project pages)
// - Or override via env: VITE_BASE
const repo = process.env.GITHUB_REPOSITORY?.split('/')?.[1]
const inferredBase = process.env.GITHUB_ACTIONS && repo ? `/${repo}/` : '/'
const base = process.env.VITE_BASE ?? inferredBase

export default defineConfig({
  plugins: [react()],
  base,
})
