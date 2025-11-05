import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',  // Ensures absolute paths like '/running_tiger/scene.gltf' resolve to root
  build: {
    assetsInlineLimit: 0,  // Prevents inlining large GLTF files
    rollupOptions: {
      output: {
        manualChunks: undefined,  // Avoids chunking issues with Three.js modules
      },
    },
  },
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.bin', '**/*.png', '**/*.jpg'],  // Explicitly treats GLTF + dependencies as static assets
});