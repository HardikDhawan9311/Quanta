/// <reference types="vite/client" />

interface Window {
    electronAPI: {
        openFile: () => Promise<{ filePath: string, content: string, fileName: string } | null>;
        saveFileAs: (content: string) => Promise<{ filePath: string, fileName: string } | null>;
        saveFile: (filePath: string, content: string) => Promise<boolean>;
        executeCompiler: (filePath: string) => Promise<{ error: string | null, stdout: string, stderr: string }>;
        aiGenerate: (prompt: string) => Promise<{ error?: string, code?: string }>;
    }
}
