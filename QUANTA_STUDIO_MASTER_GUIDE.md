# Quanta Studio: The Master Development Guide 🚀

This is the exhaustive, step-by-step documentation of how **Quanta Studio** was built—from the very first `npm init` to a premium, cross-platform IDE deployment.

> [!TIP]
> **New to Node.js?** Check out the [Quanta Studio Deep Dive](file:///Users/rohan/Desktop/Quanta/QUANTA_STUDIO_DEEP_DIVE.md) for a beginner-friendly explanation of the whole tech stack.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Phase 1: Project Initialization](#phase-1-project-initialization)
3. [Phase 2: Core Architecture (Electron Backend)](#phase-2-core-architecture-electron-backend)
4. [Phase 3: The IDE Skeleton (VS Code Layout)](#phase-3-the-ide-skeleton-vs-code-layout)
5. [Phase 4: Premium UI Redesign (The Quanta Brand)](#phase-4-premium-ui-redesign-the-quanta-brand)
6. [Phase 5: Advanced Feature Implementation](#phase-5-advanced-feature-implementation)
7. [Phase 6: Quality Assurance & UX Polish](#phase-6-quality-assurance--ux-polish)
8. [Phase 7: Packaging & Deployment](#phase-7-packaging--deployment)

---

## 🛠 Prerequisites
To develop or build Quanta Studio, you need:
- **Node.js** (v18+) & **NPM**.
- **LLVM 17+** (Required for the Quanta compiler backend).
- **Git** for version control.
- **Electron-Builder Dependencies**:
  - Windows: NSIS.
  - macOS: Xcode Command Line Tools.
  - Linux: `libicns1`, `icnsutils`, `graphicsmagick`.

---

## 🏁 Phase 1: Project Initialization

1.  **Vite + React Setup**:
    Initialize the frontend using Vite for lightning-fast HMR.
    ```bash
    npm create vite@latest quanta-editor -- --template react-ts
    ```
2.  **Electron Integration**:
    Install Electron and essential development tools.
    ```bash
    npm install electron electron-builder electronmon --save-dev
    ```
3.  **Directory Structure**:
    Established the separation of concerns:
    - `/electron`: Main process and Preload scripts.
    - `/src`: React frontend, components, and styles.
    - `/public`: Static assets.

---

## 🏗 Phase 2: Core Architecture (Electron Backend)

1.  **Main Process Setup (`electron/main.ts`)**:
    Configured the `BrowserWindow` with `contextIsolation: true` for security.
2.  **IPC Bridge Implementation**:
    Mapped Node.js file system capabilities to the renderer process via `preload.ts`:
    - `openDirectory`: Native OS folder picker.
    - `readDirectory`: Recursive directory walker using `fs.readdir`.
    - `readFile/writeFile`: Basic buffer handling for the editor.
3.  **Compiler Integration**:
    Created the `exec:quanta` IPC handler to spawn the Quanta binary and capture stdout/stderr for the integrated terminal.

---

## 🖼 Phase 3: The IDE Skeleton (VS Code Layout)

1.  **Grid Transformation**:
    Switched from a centered "Web Layout" to a 3-column IDE grid:
    - **Activity Bar** (Fixed left, 52px).
    - **Sidebar** (Resizable, 250px-300px).
    - **Main Content** (Flexible editor + terminal).
2.  **Sidebar Logic**:
    Built `Sidebar.tsx` with a recursive file tree that handles folder expansion and file selection.
3.  **Tab Engine**:
    Implemented the multi-tab system in `App.tsx`:
    - Tracks an array of `OpenFile` objects.
    - Maps the Monaco Editor to the `activeTab`.

---

## 💎 Phase 4: Premium UI Redesign (The Quanta Brand)

1.  **Custom Design Tokens**:
    Defined a deep-dark color system in `App.css`:
    - Background: `#0a0a0f`
    - Panel: `#11111c`
    - Border: `rgba(124, 58, 237, 0.12)`
2.  **The Signature Gradient**:
    Implemented the **Quanta Glow** (Violet → Indigo → Cyan).
    ```css
    --qs-gradient: linear-gradient(135deg, #7c3aed, #4f46e5, #06b6d4);
    ```
3.  **Glassmorphism Panels**:
    Applied `backdrop-filter: blur()` and semi-transparent backgrounds to the Sidebar and Modals for a high-end feel.

---

## 🚀 Phase 5: Advanced Feature Implementation

1.  **AI Copilot (Gemini)**:
    Integrated `@google/genai` to provide code generation. Built a custom system prompt that enforces Quanta syntax rules.
2.  **LeetCode Integration**:
    Built a GraphQL bridge to fetch coding problems directly into the "Practice Mode" of the editor.
3.  **Quanta Language Icons**:
    Created a custom **Quantum Atom SVG** for `.qnt` files, giving the language its own visual identity in the tab bar.

---

## 🛠 Phase 6: Quality Assurance & UX Polish

1.  **Babel Parse Fix**:
    Identified and fixed a crash in the Vite build caused by HTML comments inside JSX SVGs.
2.  **Keyboard Shortcuts**:
    - `F5` / `Cmd+5`: Trigger "Run Code".
    - `Cmd+B`: Toggle Sidebar visibility.
3.  **Status Bar Integration**:
    Transformed the bottom bar into a beautiful brand stripe that displays file stats (Ready, UTF-8).

---

## 📦 Phase 7: Packaging & Deployment

1.  **Configuration (`package.json`)**:
    Set up `electron-builder` with custom NSIS (Windows) and DMG (macOS) targets.
2.  **Build Pipeline**:
    ```bash
    # 1. Compile TypeScript
    npm run build
    # 2. Package for Windows
    npm run package:win
    # 3. Package for Mac
    npm run package:mac
    ```
3.  **Extra Resources**:
    Configured the app to bundle the CLI `quanta` binary inside the application's internal resources folder using the `extraResources` flag.

---

## 📤 Phase 8: Deployment

1.  **GitHub Push**:
    Synchronized the entire codebase to the main repository.
2.  **Release Management**:
    Automated the generation of artifacts (`.exe`, `.dmg`, `.deb`) for distribution via GitHub Releases.

---

**Quanta Studio** is more than an editor; it's a premium ecosystem for the next generation of developers.

*Created & Documented by Antigravity*
