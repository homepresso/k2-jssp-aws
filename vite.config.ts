import {defineConfig} from 'vite';
import path from 'path';
import glob from 'glob';

export default defineConfig({
    build: {
        lib: {
            // Define multiple entry points using glob, finds all .ts files recursively, then uses the name to create entrypoints
            entry: glob
                .sync('./src/**/*.ts')
                .reduce((entries, file) => {
                        const entryName = path
                            .relative('./src', file)
                            .replace(/\.ts$/, '');
                        entries[entryName] = path.resolve(__dirname, file);
                        return entries;
                    },
                    {} as Record<string, string>),
            formats: ['es'],
        },
        rollupOptions: {
            // Ensure that each entry point is treated separately
            output: {
                // Preserve the directory structure in the output
                entryFileNames: '[name].js',
                chunkFileNames: 'chunks/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]',
                dir: 'dist', // Output directory
                format: 'es',
            },
            // Externalize dependencies if needed
            external: [], // Add external dependencies here
        },
        outDir: 'dist', // Output directory
        emptyOutDir: true,
        sourcemap: true, // Optional: generate source maps
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    plugins: [
        // Add necessary Vite plugins here
    ],
    esbuild: {
        // Optionally, configure esbuild options if needed
        // For example, to handle JSX or other transformations
    },
});