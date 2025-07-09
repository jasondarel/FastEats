import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0", 
    origin: "https://1d9d-61-5-26-165.ngrok-free.app",
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
  },
});
