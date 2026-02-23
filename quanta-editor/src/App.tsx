import { useState, useEffect, useCallback } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import './App.css';

// ─── Inline SVG Icons ────────────────────────────────────────────────────────

const IconFolder = () => (
    <svg className="icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1.5 3a1 1 0 0 1 1-1h3.879a1 1 0 0 1 .707.293l1 1H13.5a1 1 0 0 1 1 1v1h-13V3Zm-1 4h14a.5.5 0 0 1 .5.5v5a1.5 1.5 0 0 1-1.5 1.5H2A1.5 1.5 0 0 1 .5 12.5v-5A.5.5 0 0 1 .5 7Z" />
    </svg>
);

const IconSave = () => (
    <svg className="icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v4.5h2a.5.5 0 0 1 .354.854l-2.5 2.5a.5.5 0 0 1-.708 0l-2.5-2.5A.5.5 0 0 1 5.5 6.5h2V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2Z" />
    </svg>
);

const IconPlay = () => (
    <svg className="icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M11.596 8.697 4.5 12.742V3.258l7.096 4.439a.35.35 0 0 1 0 1Z" />
    </svg>
);

const IconFile = () => (
    <svg className="icon" width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5L10 0H4Zm6 1v3.5A1.5 1.5 0 0 0 11.5 6H15v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6Z" />
    </svg>
);

const IconTerminal = () => (
    <svg className="icon" width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <path d="M6 9a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3A.5.5 0 0 1 6 9ZM3.854 4.146a.5.5 0 1 0-.708.708L4.793 6.5 3.146 8.146a.5.5 0 1 0 .708.708l2-2a.5.5 0 0 0 0-.708l-2-2Z" />
        <path d="M2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H2Zm12 1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h12Z" />
    </svg>
);

// ─── Default starter code ─────────────────────────────────────────────────────

const DEFAULT_CODE = `// Welcome to Quanta Studio!
// Write your Quanta code here and press ▶ Run Code

fn greet(name) {
  print("Hello,", name)
}

fn main() {
  let nums = [1, 2, 3, 4, 5]
  for i in nums {
    greet("World")
  }
}

main()
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function App() {
    const [code, setCode] = useState<string>(DEFAULT_CODE);
    const [output, setOutput] = useState<string>('');
    const [isCompiling, setIsCompiling] = useState<boolean>(false);
    const [currentFile, setCurrentFile] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('Untitled.qnt');
    const [isDirty, setIsDirty] = useState<boolean>(false);

    const monaco = useMonaco();

    // ── Register Quanta Language ───────────────────────────────────────────────
    useEffect(() => {
        if (!monaco) return;

        monaco.languages.register({ id: 'quanta' });

        monaco.languages.setMonarchTokensProvider('quanta', {
            keywords: ['fn', 'let', 'if', 'else', 'return', 'while', 'for', 'in',
                'class', 'struct', 'import', 'print', 'true', 'false', 'null',
                'and', 'or', 'not', 'break', 'continue', 'new', 'self'],
            tokenizer: {
                root: [
                    [/\b(fn|let|if|else|return|while|for|in|class|struct|import|print|true|false|null|and|or|not|break|continue|new|self)\b/, 'keyword'],
                    [/"([^"\\]|\\.)*"/, 'string'],
                    [/'([^'\\]|\\.)*'/, 'string'],
                    [/\b\d+(\.\d+)?\b/, 'number'],
                    [/\/\/.*$/, 'comment'],
                    [/\/\*/, 'comment', '@comment'],
                    [/[{}()\[\]]/, '@brackets'],
                    [/[=><!~?:&|+\-*\/\^%@]+/, 'operator'],
                ],
                comment: [
                    [/[^\/*]+/, 'comment'],
                    [/\*\//, 'comment', '@pop'],
                    [/[\/*]/, 'comment']
                ]
            }
        });

        monaco.editor.defineTheme('quantaTheme', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: 'c678dd', fontStyle: 'bold' },
                { token: 'string', foreground: '98c379' },
                { token: 'number', foreground: 'd19a66' },
                { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
                { token: 'operator', foreground: '56b6c2' },
            ],
            colors: {
                'editor.background': '#1a1a1a',
                'editor.foreground': '#abb2bf',
                'editor.lineHighlightBackground': '#252525',
                'editor.selectionBackground': '#264f78',
                'editorCursor.foreground': '#528bff',
                'editorLineNumber.foreground': '#3d3d3d',
                'editorLineNumber.activeForeground': '#858585',
                'editorIndentGuide.background1': '#2a2a2a',
            }
        });
    }, [monaco]);

    const handleEditorChange = useCallback((value: string | undefined) => {
        if (value !== undefined) {
            setCode(value);
            setIsDirty(true);
        }
    }, []);

    // ── File: Open ─────────────────────────────────────────────────────────────
    const handleOpenFile = async () => {
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.openFile();
                if (result) {
                    setCode(result.content);
                    setCurrentFile(result.filePath);
                    setFileName(result.fileName);
                    setIsDirty(false);
                    setOutput(`Opened: ${result.filePath}`);
                }
            } else {
                setOutput('File system is only available in the desktop app.');
            }
        } catch (e: any) {
            setOutput(`Error opening file: ${e.message}`);
        }
    };

    // ── File: Save ─────────────────────────────────────────────────────────────
    const handleSaveFile = async () => {
        try {
            if (window.electronAPI) {
                if (currentFile) {
                    await window.electronAPI.saveFile(currentFile, code);
                    setIsDirty(false);
                    setOutput(`Saved: ${currentFile}`);
                } else {
                    const result = await window.electronAPI.saveFileAs(code);
                    if (result) {
                        setCurrentFile(result.filePath);
                        setFileName(result.fileName);
                        setIsDirty(false);
                        setOutput(`Saved: ${result.filePath}`);
                    }
                }
            } else {
                setOutput('File system is only available in the desktop app.');
            }
        } catch (e: any) {
            setOutput(`Error saving file: ${e.message}`);
        }
    };

    // ── Run Compiler ───────────────────────────────────────────────────────────
    const handleRunCompiler = async () => {
        if (!window.electronAPI) {
            setOutput('The compiler requires the desktop app.\nPlease run Quanta Studio from your installation.');
            return;
        }

        let targetFile = currentFile;
        if (!targetFile) {
            const result = await window.electronAPI.saveFileAs(code);
            if (result) {
                targetFile = result.filePath;
                setCurrentFile(result.filePath);
                setFileName(result.fileName);
                setIsDirty(false);
            } else {
                setOutput('Cancelled. Save the file first to compile.');
                return;
            }
        } else {
            await window.electronAPI.saveFile(targetFile, code);
            setIsDirty(false);
        }

        setIsCompiling(true);
        setOutput('');

        try {
            const result = await window.electronAPI.executeCompiler(targetFile!);
            if (result.error) {
                setOutput(`── Error ──────────────\n${result.stderr || result.error}`);
            } else {
                setOutput(
                    result.stdout ||
                    (result.stderr ? `── Warnings ──────────────\n${result.stderr}` : '── Done (no output) ──')
                );
            }
        } catch (error: any) {
            setOutput(`── Fatal Error ──────────────\n${error.message}`);
        } finally {
            setIsCompiling(false);
        }
    };

    // ── Keyboard shortcut: Ctrl+S / Cmd+S ─────────────────────────────────────
    useEffect(() => {
        const handle = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSaveFile();
            }
        };
        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [currentFile, code]);

    const isError = output.startsWith('── Error') || output.startsWith('── Fatal');

    return (
        <div className="app">

            {/* ── Title Bar ── */}
            <div className="titlebar drag-region">
                <div className="titlebar-logo no-drag">
                    <span className="logo-dot" />
                    <span style={{ color: '#e0e0e0', fontWeight: 600 }}>Quanta Studio</span>
                </div>
                <div className="titlebar-file no-drag">
                    {isDirty ? '● ' : ''}{fileName}
                </div>
            </div>

            {/* ── Toolbar ── */}
            <div className="toolbar">
                <div className="toolbar-group">
                    <button className="btn btn-ghost no-drag" onClick={handleOpenFile} title="Open File (Ctrl+O)">
                        <IconFolder /> Open
                    </button>
                    <button className="btn btn-ghost no-drag" onClick={handleSaveFile} title="Save File (Ctrl+S)">
                        <IconSave /> Save
                    </button>
                </div>
                <div className="toolbar-divider" />
                <button
                    className={`btn btn-run no-drag${isCompiling ? ' running' : ''}`}
                    onClick={handleRunCompiler}
                    disabled={isCompiling}
                    title="Run Code (Ctrl+Enter)"
                >
                    <IconPlay />
                    {isCompiling ? 'Running…' : '▶  Run Code'}
                </button>
            </div>

            {/* ── Content ── */}
            <div className="content">

                {/* Editor Tab Bar */}
                <div className="tab-bar">
                    <div className="tab active">
                        <span className="tab-icon"><IconFile /></span>
                        {fileName}
                    </div>
                </div>

                {/* Monaco Editor */}
                <div className="editor-pane">
                    <Editor
                        height="100%"
                        language="quanta"
                        theme="quantaTheme"
                        value={code}
                        onChange={handleEditorChange}
                        loading={
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                height: '100%', color: '#555', fontFamily: 'var(--font-mono)',
                                fontSize: 13, gap: 12
                            }}>
                                <span style={{ animation: 'pulse-run 1s ease-in-out infinite', color: '#c678dd' }}>◆</span>
                                Loading editor…
                            </div>
                        }
                        options={{
                            minimap: { enabled: true, scale: 1 },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
                            fontLigatures: true,
                            lineHeight: 22,
                            padding: { top: 16, bottom: 16 },
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            cursorBlinking: 'smooth',
                            cursorSmoothCaretAnimation: 'on',
                            formatOnPaste: true,
                            wordWrap: 'on',
                            bracketPairColorization: { enabled: true },
                            renderLineHighlight: 'line',
                            tabSize: 2,
                            autoIndent: 'full',
                        }}
                    />
                </div>

                {/* Terminal Panel */}
                <div className="terminal-panel">
                    <div className="terminal-header">
                        <div className="terminal-title">
                            <IconTerminal />
                            <span className="terminal-dot" />
                            Output
                        </div>
                        <button
                            className="terminal-clear"
                            onClick={() => setOutput('')}
                            title="Clear output"
                        >
                            ✕ Clear
                        </button>
                    </div>
                    <div className="terminal-body">
                        {output ? (
                            <>
                                <span className="terminal-prompt">{'$ quanta '}</span>
                                <span style={{ color: '#555' }}>{fileName}</span>
                                {'\n\n'}
                                <span className={isError ? 'terminal-error' : 'terminal-output'}>
                                    {output}
                                </span>
                            </>
                        ) : (
                            <span className="terminal-empty">
                                Press ▶ Run Code to execute your Quanta program…
                            </span>
                        )}
                    </div>
                </div>

            </div>

            {/* ── Status Bar ── */}
            <div className="statusbar">
                <div className="statusbar-left">
                    <span className="statusbar-item">◆ Quanta Studio</span>
                    <span className="statusbar-item">⬧ Quanta Language</span>
                </div>
                <div className="statusbar-right">
                    <span className="statusbar-item">
                        {isCompiling ? '⏳ Compiling…' : '✓ Ready'}
                    </span>
                    <span className="statusbar-item">UTF-8</span>
                </div>
            </div>

        </div>
    );
}
