import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { PORT } from "./src/config/api";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0", 
    origin: "https://1d9d-61-5-26-165.ngrok-free.app", // Menentukan asal yang diizinkan
    strictPort: true, // Opsional, memastikan port tetap jika digunakan
  },
  preview: {
    host: "0.0.0.0",
    port: PORT,
  },
});
