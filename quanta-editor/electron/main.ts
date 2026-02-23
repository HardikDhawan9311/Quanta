import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#1e1e1e',
            symbolColor: '#ffffff',
            height: 35
        },
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        show: false,
        backgroundColor: '#1e1e1e',
        icon: path.join(__dirname, '../public/icon.png')
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        const primaryPath = path.join(__dirname, '../dist/index.html');
        const fallbackPath = path.join(__dirname, 'dist/index.html');
        const asarFallbackPath = path.join(__dirname, '../../dist/index.html');

        if (fs.existsSync(primaryPath)) {
            mainWindow.loadFile(primaryPath);
        } else if (fs.existsSync(fallbackPath)) {
            mainWindow.loadFile(fallbackPath);
        } else {
            mainWindow.loadFile(asarFallbackPath);
        }
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// --- IPC Handlers for File System ---

ipcMain.handle('dialog:openFile', async () => {
    if (!mainWindow) return null;
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{ name: 'Quanta Files', extensions: ['qunta', 'quanta'] }, { name: 'All Files', extensions: ['*'] }]
    });

    if (canceled || filePaths.length === 0) return null;

    const filePath = filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    return { filePath, content, fileName: path.basename(filePath) };
});

ipcMain.handle('fs:saveFile', async (_, filePath: string, content: string) => {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
});

ipcMain.handle('dialog:saveFileAs', async (_, content: string) => {
    if (!mainWindow) return null;
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        filters: [{ name: 'Quanta Files', extensions: ['qunta', 'quanta'] }]
    });

    if (canceled || !filePath) return null;

    fs.writeFileSync(filePath, content, 'utf-8');
    return { filePath, fileName: path.basename(filePath) };
});

// --- IPC Handler for Executing Quanta Compiler ---

ipcMain.handle('exec:quanta', async (_, filePath: string) => {
    return new Promise((resolve) => {
        // In production, the compiler might be alongside the editor executable
        // Let's assume quanta.exe is in the system PATH or alongside the app

        let compilerPath = 'quanta';

        // In development or if deployed alongside
        const possibleLocalPath = path.join(process.resourcesPath, '..', 'quanta.exe');
        if (fs.existsSync(possibleLocalPath)) {
            compilerPath = `"${possibleLocalPath}"`;
        }

        const command = `${compilerPath} run "${filePath}"`;

        exec(command, (error, stdout, stderr) => {
            resolve({
                error: error ? error.message : null,
                stdout,
                stderr
            });
        });
    });
});
