# Quanta Studio: The Educational Deep Dive 🎓

Built for developers who want to understand the *why* and *how* behind a modern desktop IDE. If you are new to Node.js, this is your starting point.

---

## 🌍 1. The Ecosystem: Node.js & NPM

At its core, **Node.js** is a tool that lets us run JavaScript *on your computer* instead of just inside a web browser. 

*   **NPM (Node Package Manager)**: Think of this as the "App Store" for developers. We use it to download tools like Electron, React, and Monaco (the code editor component).
*   **package.json**: This is the "ID Card" of our project. It lists every tool we use and the "Scripts" (shortcuts) we created to run or build the app.

---

## 🏗️ 2. The Engine: Electron Architecture

Most apps are just "one window." Electron is different. It uses a **Two-Process Model** for security and performance:

1.  **The MAIN Process (`electron/main.ts`)**: 
    - This is the "Brain." It runs on Node.js and has full access to your computer (your files, your camera, your hard drive).
    - It creates the window but *doesn't* draw the UI.
2.  **The RENDERER Process (`src/App.tsx`)**: 
    - This is the "Face." It's essentially a Chrome browser window.
    - It draws the buttons, the gradients, and the code editor.
    - **Security Rule**: The Face is NOT allowed to touch your files directly. It must ask the Brain for permission.

---

## 🌉 3. The Bridge: IPC & Preload

How does the UI ask the Brain to open a folder? We use an **IPC (Inter-Process Communication)** bridge.

*   **Preload Script (`electron/preload.ts`)**: This is the "Secure Tunnel." We use it to expose specific, safe commands (like `openFile` or `readDirectory`) to the UI without exposing the whole computer.
*   **The Flow**:
    1.  User clicks "Open Folder" in React.
    2.  React calls `window.electronAPI.openDirectory()`.
    3.  The Preload script sends a message to the Main process.
    4.  The Main process opens the real Windows/Mac folder picker.
    5.  The selected path is sent back through the tunnel to React.

---

## ⚛️ 4. The UI: React & Vite

We used **React** to build the UI because it lets us think in "Components."

*   **Components**: Instead of one giant 5000-line file, we broke the UI into `Sidebar`, `Terminal`, `ActivityBar`, etc.
*   **State**: When you switch a tab, React updates the "State." It automatically redraws the screen so you see the new code instantly.
*   **Vite**: This is our development "Server." It monitors every time you save a file and pushes the change into the running Electron window in milliseconds (Hot Module Replacement).

---

## 🔍 5. Key File Walkthrough

### `quanta-editor/src/App.tsx`
The central hub. It manages which tabs are open, which file is active, and coordinates the layout.

### `quanta-editor/src/App.css`
This is where the "Premium" look lives. We used **CSS Variables** (`--qs-accent`) to define our violet-blue theme globally so that changing one value updates the whole IDE.

### `quanta-editor/electron/main.ts`
The system logic. This handles spawning the Quanta compiler (`exec`), reading the hard drive, and managing the application lifecycle.

---

## 📦 6. Building & Packaging

To turn code into a real `.exe` or `.app` file, we use **electron-builder**.

1.  **TSC**: Compiles our TypeScript (safe code) into standard JavaScript.
2.  **Vite Build**: Minifies the UI to be as small and fast as possible.
3.  **Electron-Builder**: 
    - Bundles the binary files.
    - Adds the Quanta Studio icon.
    - Packages it into an installer (NSIS for Windows, DMG for Mac).

---

## 🚀 7. How to Learn More

To truly master this, try these "Homework" tasks:
1.  **Change a Color**: Go to `App.css`, find `--bg-base`, and change it to a deep red. See how the IDE transforms.
2.  **Add a Menu Item**: Try adding a new icon to the `ActivityBar` in `App.tsx`.
3.  **Trace a Command**: Follow a click from `Sidebar.tsx` through `App.tsx` into `electron/main.ts`.

---

**Welcome to the Quanta Development Team!** 
*This guide was created to turn users into creators.*
