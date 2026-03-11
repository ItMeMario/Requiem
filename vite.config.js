"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vite_1 = require("vite");
var plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
var path_1 = require("path");
exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)()],
    root: (0, path_1.resolve)(__dirname, 'src/renderer'),
    base: './',
    build: {
        outDir: (0, path_1.resolve)(__dirname, 'dist/renderer'),
        emptyOutDir: true,
    },
    server: {
        port: 5173,
        strictPort: true,
    },
});
