import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    saveFileAs: (content: string) => ipcRenderer.invoke('dialog:saveFileAs', content),
    saveFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:saveFile', filePath, content),
    executeCompiler: (filePath: string) => ipcRenderer.invoke('exec:quanta', filePath),
    aiGenerate: (prompt: string) => ipcRenderer.invoke('ai:generate', prompt)
});
