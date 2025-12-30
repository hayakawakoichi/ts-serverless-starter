import { defineConfig } from "tsup"

export default defineConfig({
    entry: {
        index: "src/lambda.ts",
    },
    format: ["esm"],
    dts: false,
    clean: true,
    sourcemap: true,
    minify: true,
    target: "node20",
    outDir: "dist",
    banner: {
        js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
    },
})
