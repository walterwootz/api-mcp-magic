import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import Sitemap from "vite-plugin-sitemap";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    Sitemap({
      hostname: 'https://convertmcp.com',
      dynamicRoutes: [
        '/',
        '/docs/getting-started',
        '/docs/python-mcp',
        '/docs/typescript-mcp',
        '/docs/go-mcp',
        '/docs/rust-mcp',
        '/docs/java-mcp',
        '/docs/kotlin-mcp',
        '/docs/dotnet-mcp',
        '/docs/php-mcp',
        '/docs/ruby-mcp',
        '/docs/swift-mcp',
        '/blog/what-is-mcp',
        '/blog/openapi-best-practices',
        '/examples',
      ],
      changefreq: 'weekly',
      priority: 0.8,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
