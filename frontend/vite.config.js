import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/MedAxis-Plus/", // 👈 EXACT GitHub repo name
});
