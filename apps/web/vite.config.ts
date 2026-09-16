import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: 5173,
		proxy: {
			// API は経路を直下に持つので、転送するときに /api を剥がす。
			// 画面側は同じ生成元だけを見ればよくなり、生成元をまたぐ設定が要らない。
			"/api": {
				target: "http://localhost:3000",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
		},
	},
	plugins: [
		tanstackRouter({ target: "react", autoCodeSplitting: true }),
		// React のプラグインは経路のプラグインより後に置く
		viteReact(),
	],
});
