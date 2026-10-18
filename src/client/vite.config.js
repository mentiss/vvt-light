import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execFileSync } from 'node:child_process'
import process from 'node:process'

// Version affichée en pied de page de l'accueil : dernier commit au moment du build
// (« hash|AAAA-MM-JJ ») ; « dev » si git n'est pas disponible.
// git appelé sans shell : sous Windows, cmd.exe prenait le « | » du format pour un pipe.
// %cd + --date=short plutôt que %cs, absent avant git 2.25.
try {
  process.env.VITE_APP_VERSION = execFileSync('git', ['log', '-1', '--date=short', '--format=%h|%cd']).toString().trim()
} catch {
  process.env.VITE_APP_VERSION = 'dev'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    minifier: 'terser',
  },
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true
      },
      '/api': 'http://localhost:3001'
    }
  }
})