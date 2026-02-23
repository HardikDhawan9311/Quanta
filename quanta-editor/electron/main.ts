import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 900,
        minHeight: 600,
        // FIX: show: true so the window is ALWAYS visible on launch
        // Previously 'show: false' was hiding it when ready-to-show never fired
        show: true,
        backgroundColor: '#1e1e1e',
        // NOTE: titleBarOverlay is Windows-only and caused crashes on some setups
        // Removed icon path (no icon file exists yet in public/)
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        // When packaged by electron-builder, __dirname is inside the asar:
        //   app.asar/dist-electron/main.js
        // So ../dist/index.html correctly points to app.asar/dist/index.html
        const indexHtml = path.join(__dirname, '../dist/index.html');
        mainWindow.loadFile(indexHtml).catch((err) => {
            // If loading fails, log the error and show a dialog so the user
            // knows something went wrong instead of seeing a blank screen
            console.error('Failed to load index.html:', err);
            dialog.showErrorBox(
                'Quanta Studio - Load Error',
                `Failed to load the editor UI.\nPath tried: ${indexHtml}\nError: ${err.message}`
            );
        });
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        // macOS: re-create window when dock icon is clicked
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    // macOS: keep app running until CMD+Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// ─── IPC: Open File ──────────────────────────────────────────────────────────
ipcMain.handle('dialog:openFile', async () => {
    if (!mainWindow) return null;
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Quanta Files', extensions: ['qnt', 'quanta'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    if (canceled || filePaths.length === 0) return null;

    const filePath = filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    return { filePath, content, fileName: path.basename(filePath) };
});

// ─── IPC: Save File ───────────────────────────────────────────────────────────
ipcMain.handle('fs:saveFile', async (_, filePath: string, content: string) => {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
});

ipcMain.handle('dialog:saveFileAs', async (_, content: string) => {
    if (!mainWindow) return null;
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        filters: [
            { name: 'Quanta Files', extensions: ['qnt', 'quanta'] }
        ]
    });
    if (canceled || !filePath) return null;

    fs.writeFileSync(filePath, content, 'utf-8');
    return { filePath, fileName: path.basename(filePath) };
});

// ─── IPC: Run Quanta Compiler ─────────────────────────────────────────────────
ipcMain.handle('exec:quanta', async (_, filePath: string) => {
    return new Promise((resolve) => {
        const home = process.env.HOME || '';
        const candidates = [
            path.join(path.dirname(process.execPath), '..', 'quanta.exe'),
            path.join(path.dirname(process.execPath), '..', 'quanta'),
            '/opt/homebrew/bin/quanta',
            '/usr/local/bin/quanta',
            path.join(home, 'Desktop', 'Quanta', 'build', 'quanta'),
            path.join(home, 'Quanta', 'build', 'quanta'),
        ];
        let compilerPath = 'quanta';
        for (const c of candidates) {
            try { if (fs.existsSync(c)) { compilerPath = `"${path.resolve(c)}"`; break; } } catch { }
        }
        const command = `${compilerPath} "${filePath}"`;
        const env = {
            ...process.env,
            PATH: ['/opt/homebrew/bin', '/opt/homebrew/sbin', '/usr/local/bin', '/usr/bin', '/bin', process.env.PATH || ''].join(':')
        };
        exec(command, { env, cwd: path.dirname(filePath), timeout: 15000 }, (error, stdout, stderr) => {
            resolve({ error: error ? error.message : null, stdout, stderr });
        });
    });
});
