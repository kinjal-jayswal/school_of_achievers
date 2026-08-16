import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                about: resolve(__dirname, "about.html"),
                academics: resolve(__dirname, "academics.html"),
                admission: resolve(__dirname, "admission.html"),
                contact: resolve(__dirname, "contact.html"),
            },
        },
    },
});
