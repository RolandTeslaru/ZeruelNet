import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { glob } from 'glob'
import dts from 'vite-plugin-dts'
import tailwindcss from '@tailwindcss/vite'


const fileUrl = new URL(import.meta.url)
const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['lib/**'],
    }),
    tailwindcss()
  ],
  build: {
    lib: {
      entry: Object.fromEntries(
        glob
          .sync('lib/**/*.{ts,tsx}')
          .map((file) => [
            resolve(file)
              // @ts-expect-error
              .slice(0, file.length - resolve(file).split('.').pop().length - 1)
              .replace(new RegExp(`^${resolve('lib')}/`), ''),
            fileURLToPath(new URL(file, import.meta.url)),
          ]),
      ),
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
})
