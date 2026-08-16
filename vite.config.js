import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    server: {
        proxy: {
            "/api": "http://localhost:3000",
        },
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                about: resolve(__dirname, "about.html"),
                academics: resolve(__dirname, "academics.html"),
                admission: resolve(__dirname, "admission.html"),
                contact: resolve(__dirname, "contact.html"),
                events: resolve(__dirname, "events.html"),
                results: resolve(__dirname, "results.html"),
            },
        },
    },
});
