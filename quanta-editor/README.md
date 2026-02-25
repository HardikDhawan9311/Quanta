# Quanta Studio: The Premium Code Editor 💎

Quanta Studio is a professional, high-performance IDE built specifically for the Quanta Programming Language. It combines the power of Electron, the speed of Vite, and the intelligence of Gemini AI to deliver a state-of-the-art developer experience.

---

## 🚀 Quick Start (Development)

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/rohankumarrawat/Quanta.git
    cd Quanta/quanta-editor
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run in Development Mode**:
    ```bash
    npm run dev
    ```
    *This will simultaneously start the Vite dev server and launch the Electron application with Hot Module Replacement (HMR).*

---

## 🛠 Build & Installation (Production)

To create a standalone application (`.exe` for Windows, `.dmg` for Mac, `.deb` for Linux):

### 1. Build the frontend
```bash
npm run build
```

### 2. Package for your OS
```bash
# Windows
npm run package:win

# macOS
npm run package:mac

# Linux
npm run package:linux

# All Platforms
npm run package:all
```
The resulting installers will be located in the `quanta-editor/release/` directory.

---

## 📚 Every Step of Development (The Story)

Quanta Studio was transformed from a simple text-box into a premium IDE through these calculated steps:

### Phase 1: The Foundation
*   **Electron IPC Bridge**: Created a secure communication layer between the React UI and the Node.js file system.
*   **Multi-Tab Architecture**: Refactored the app to support opening and editing multiple files simultaneously using a dynamic tab management system.

### Phase 2: The IDE Skeleton
*   **VS Code Grid**: Implemented the industry-standard "Activity Bar + Sidebar + Editor" layout.
*   **Recursive Sidebar**: Built a high-performance file explorer that scans and displays project folders in real-time.
*   **Integrated Terminal**: Connected the Quanta CLI compiler to a built-in output panel.

### Phase 3: The Design Signature (Redesign)
*   **Premium Dark Theme**: Replaced standard IDE colors with custom "Void" and "Panel" shades for a unique, expensive feel.
*   **The Quanta Glow**: Implemented the signature Violet → Indigo → Cyan gradient across the Status Bar, Buttons, and Active Tab indicators.
*   **Glassmorphism**: Added subtle blur and transparency effects to secondary panels.

### Phase 4: Intelligence & UX
*   **Gemini AI Copilot**: Integrated Google's Gemini models to provide code generation and suggestions aware of Quanta's specific syntax.
*   **Custom Syntax Icons**: Designed a unique "Quantum Atom" icon for `.qnt` files.
*   **IDE Shortcuts**: Added standard shortcuts like `Ctrl+B` (Toggle Sidebar) and `F5` (Run Code).

---

## 🏗 Project Structure
- `electron/`: Main process logic and IPC handlers.
- `src/`: React frontend (Vite-powered).
- `src/components/`: Modular UI components (Sidebar, AI Modal, etc.).
- `resources/`: Bundled Quanta binary and syntax guides.
- `public/`: Static assets and icons.

---

## 📤 Deployment
Deployment is automated via **GitHub Actions**. Pushing to the `main` branch triggers the build pipeline, which compiles the source code and generates cross-platform installers as Release Artifacts.

---

### Developed by Antigravity
*Crafting the future of Quanta.*
