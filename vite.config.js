import {defineConfig} from "vite"
import basicSsl from "@vitejs/plugin-basic-ssl"
import pluginTerminal from "vite-plugin-terminal"

export default defineConfig({
    plugins: [
        basicSsl(),
        pluginTerminal({
            output: ["terminal", "console"],
            // console: "terminal"
        })
    ],
    server: {
        host: true,
        https: true //use https because getUserMedia requires it
    }
});
