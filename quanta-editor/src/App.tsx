import { useState, useEffect, useCallback, useRef } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import './App.css';

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconNewFile = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707L9.293 0ZM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1ZM8 7.5a.5.5 0 0 1 .5.5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1V8a.5.5 0 0 1 .5-.5Z" />
    </svg>
);

const IconFolder = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9Z" />
    </svg>
);

const IconSave = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v4.5h2a.5.5 0 0 1 .354.854l-2.5 2.5a.5.5 0 0 1-.708 0l-2.5-2.5A.5.5 0 0 1 5.5 6.5h2V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2Z" />
    </svg>
);

const IconPlay = () => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <path d="M11.596 8.697 4.5 12.742V3.258l7.096 4.439a.35.35 0 0 1 0 1Z" />
    </svg>
);

const IconFile = () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5L10 0H4Zm6 1v3.5A1.5 1.5 0 0 0 11.5 6H15v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6Z" />
    </svg>
);

const IconHelp = () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14Zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16Z" />
        <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286Zm1.557 5.733c0 .57.4.923.962.923.56 0 .935-.353.935-.923 0-.585-.375-.924-.935-.924-.56 0-.962.339-.962.924Z" />
    </svg>
);

const IconSparkles = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0l1.928 4.671L14.5 6.5l-4.572 1.829L8 13l-1.928-4.671L1.5 6.5l4.572-1.829z" />
        <path d="M13.5 11l.964 2.336L16.5 14l-2.036.814L13.5 17l-.964-2.186L10.5 14l2.036-.814z" />
    </svg>
);

const DEFAULT_CODE = `print("Welcome to Quanta")`;

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
    const [code, setCode] = useState<string>(DEFAULT_CODE);
    const [output, setOutput] = useState<string>('');
    const [isCompiling, setIsCompiling] = useState<boolean>(false);
    const [currentFile, setCurrentFile] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('Untitled.qnt');
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [editorKey, setEditorKey] = useState<number>(0);

    const [terminalHeight, setTerminalHeight] = useState<number>(210);
    const [showHelp, setShowHelp] = useState<boolean>(false);
    const [helpTab, setHelpTab] = useState<string>('Variables & Types');
    const isDragging = useRef<boolean>(false);

    // AI Generation State
    const [showAiModal, setShowAiModal] = useState<boolean>(false);
    const [aiPrompt, setAiPrompt] = useState<string>('');
    const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('quanta_gemini_key') || '');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const monaco = useMonaco();

    // ── Register Quanta language ───────────────────────────────────────────────
    useEffect(() => {
        if (!monaco) return;
        monaco.languages.register({ id: 'quanta' });

        // ── Language Configuration (Auto-Closing Brackets) ───────────────────
        monaco.languages.setLanguageConfiguration('quanta', {
            comments: {
                lineComment: '@',
                blockComment: ["'''", "'''"]
            },
            brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')']
            ],
            autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: "'", close: "'" },
                { open: "'''", close: "'''" }
            ],
            surroundingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: "'", close: "'" }
            ]
        });

        // ── Syntax Highlighting Tokens ───────────────────────────────────────
        monaco.languages.setMonarchTokensProvider('quanta', {
            keywords: ['fn', 'let', 'if', 'elif', 'else', 'return', 'while', 'for', 'loop', 'in',
                'class', 'struct', 'import', 'print', 'true', 'false', 'null',
                'and', 'or', 'not', 'break', 'continue', 'new', 'self', 'var', 'void'],
            tokenizer: {
                root: [
                    [/@.*$/, 'comment'],             // @ single-line comment
                    [/'''/, 'comment', '@tripleS'],  // ''' block comment
                    [/"""/, 'comment', '@tripleD'],  // """ block comment
                    [/\b(fn|let|if|elif|else|return|while|for|loop|in|class|struct|import|print|true|false|null|and|or|not|break|continue|new|self|var|void)\b/, 'keyword'],
                    [/"([^"\\]|\\.)*"/, 'string'],
                    [/\b\d+(\.\d+)?\b/, 'number'],
                    [/[{}()\[\]]/, '@brackets'],
                    [/[=><!\~?:&|+\-*\/\^%]+/, 'operator'],
                ],
                tripleS: [[/'''/, 'comment', '@pop'], [/./, 'comment']],
                tripleD: [[/"""/, 'comment', '@pop'], [/./, 'comment']],
            }
        });
        monaco.editor.defineTheme('quantaTheme', {
            base: 'vs-dark', inherit: true,
            rules: [
                { token: 'keyword', foreground: 'c678dd', fontStyle: 'bold' },
                { token: 'string', foreground: '98c379' },
                { token: 'number', foreground: 'd19a66' },
                { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
                { token: 'operator', foreground: '56b6c2' },
            ],
            colors: {
                'editor.background': '#181818',
                'editor.foreground': '#abb2bf',
                'editor.lineHighlightBackground': '#222222',
                'editor.selectionBackground': '#264f78',
                'editorCursor.foreground': '#c678dd',
                'editorLineNumber.foreground': '#3d3d3d',
                'editorLineNumber.activeForeground': '#7d7d7d',
                'editorIndentGuide.background1': '#282828',
                'editorWidget.background': '#1e1e1e',
                'editorSuggestWidget.background': '#252526',
            }
        });

        // ── Autocomplete / IntelliSense ───────────────────────────────────────
        monaco.languages.registerCompletionItemProvider('quanta', {
            provideCompletionItems: (model, position) => {
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };

                const suggestions = [
                    // Keywords
                    ...['if', 'elif', 'else', 'return', 'loop', 'in',
                        'import', 'print', 'true', 'false', 'null',
                        'var', 'void', 'bool', 'int', 'float', 'string', 'char', 'all', 'push', 'pop', 'len'].map(k => ({
                            label: k,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: k,
                            range
                        })),
                    // Built-in functions & methods
                    ...['print', 'len', 'upper', 'lower', 'reverse', 'strip', 'lstrip', 'rstrip', 'capitalize', 'title', 'isalpha', 'isdigit', 'isspace', 'isalnum', 'find', 'count', 'startswith', 'endswith', 'replace', 'push', 'pop'].map(fn => ({
                        label: fn,
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: `${fn}()`,
                        range
                    })),
                    // Snippets
                    {
                        label: 'func',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: ['${1:int} ${2:name}(${3:args}) {', '\t$0', '}'].join('\n'),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Function declaration',
                        range
                    },
                    {
                        label: 'if',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: ['if (${1:condition}) {', '\t$0', '}'].join('\n'),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'If statement',
                        range
                    },
                    {
                        label: 'loop',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: ['loop (${1:condition}) {', '\t$0', '}'].join('\n'),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Loop statement',
                        range
                    }
                ];
                return { suggestions };
            }
        });
    }, [monaco]);

    const handleEditorChange = useCallback((value: string | undefined) => {
        if (value !== undefined) { setCode(value); setIsDirty(true); }
    }, []);

    // ── New File ───────────────────────────────────────────────────────────────
    const handleNewFile = () => {
        setCode(DEFAULT_CODE);
        setCurrentFile(null);
        setFileName('Untitled.qnt');
        setIsDirty(false);
        setOutput('');
        setEditorKey(k => k + 1); // force Monaco to remount with fresh content
    };

    // ── Open File ──────────────────────────────────────────────────────────────
    const handleOpenFile = async () => {
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.openFile();
                if (result) {
                    setCode(result.content);
                    setCurrentFile(result.filePath);
                    setFileName(result.fileName);
                    setIsDirty(false);
                    setOutput('');
                }
            }
        } catch (e: any) { setOutput(`Error opening file: ${e.message}`); }
    };

    // ── Save File ──────────────────────────────────────────────────────────────
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
            }
        } catch (e: any) { setOutput(`Error saving: ${e.message}`); }
    };

    // ── AI Code Generation ─────────────────────────────────────────────────────
    const handleGenerateCode = async () => {
        if (!aiPrompt.trim()) return;
        if (!apiKey) {
            setOutput("Error: Please provide a Gemini API Key to use AI Code Generation.");
            return;
        }

        setIsGenerating(true);
        setOutput("Generating code with Gemini...");

        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.aiGenerate(aiPrompt, apiKey);

                if (result.error) {
                    setOutput(`AI Error: ${result.error}`);
                } else if (result.code) {

                    // Save key for future use if successful
                    localStorage.setItem('quanta_gemini_key', apiKey);

                    // Insert at current cursor position or replace everything if empty
                    const editor = monaco?.editor.getModels()[0];
                    if (editor) {
                        const currentText = editor.getValue();
                        if (currentText === DEFAULT_CODE || currentText.trim() === '') {
                            setCode(result.code);
                        } else {
                            // Insert at the bottom for now if we can't get cursor position
                            setCode(currentText + '\n\n' + result.code);
                        }
                    } else {
                        setCode(result.code);
                    }

                    setIsDirty(true);
                    setOutput("AI Code Generation Complete!");
                    setShowAiModal(false);
                    setAiPrompt('');
                }
            } else {
                setOutput("Error: AI Generation requires the desktop app.");
            }
        } catch (e: any) {
            setOutput(`Fatal AI Error: ${e.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    // ── Run ────────────────────────────────────────────────────────────────────
    const handleRun = async () => {
        if (!window.electronAPI) {
            setOutput('Compiler requires the desktop app.');
            return;
        }
        let targetFile = currentFile;
        if (!targetFile) {
            const result = await window.electronAPI.saveFileAs(code);
            if (result) { targetFile = result.filePath; setCurrentFile(result.filePath); setFileName(result.fileName); setIsDirty(false); }
            else { setOutput('Save the file first to run.'); return; }
        } else {
            await window.electronAPI.saveFile(targetFile, code);
            setIsDirty(false);
        }
        setIsCompiling(true);
        setOutput('');
        try {
            const result = await window.electronAPI.executeCompiler(targetFile!);
            // Always combine stdout + stderr so nothing is lost
            const combined = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
            if (result.error) {
                // Show whatever output the compiler produced, fall back to the error message
                setOutput(combined || result.error);
            } else {
                setOutput(combined || 'Done (no output).');
            }
        } catch (e: any) { setOutput(`Fatal error: ${e.message}`); }
        finally { setIsCompiling(false); }
    };

    // ── Ctrl+S shortcut ────────────────────────────────────────────────────────
    useEffect(() => {
        const k = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSaveFile(); }
        };
        window.addEventListener('keydown', k);
        return () => window.removeEventListener('keydown', k);
    }, [currentFile, code]);

    // ── Resizer ────────────────────────────────────────────────────────────────
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            const newHeight = window.innerHeight - e.clientY - 22; // 22 is status bar height
            if (newHeight > 50 && newHeight < window.innerHeight - 150) {
                setTerminalHeight(newHeight);
            }
        };
        const handleMouseUp = () => { isDragging.current = false; document.body.style.cursor = 'default'; };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const isError = output.startsWith('Error') || output.startsWith('Fatal');

    return (
        <div className="app">

            {/* ── Title Bar ── */}
            <div className="titlebar drag-region">
                <div className="titlebar-left no-drag">
                    <span className="logo-dot" />
                    <span className="logo-name">Quanta Studio</span>
                </div>
                <div className="titlebar-file no-drag">
                    {isDirty && <span className="dirty-dot">●</span>}
                    {fileName}
                </div>
                <div className="titlebar-right" />
            </div>

            {/* ── Toolbar ── */}
            <div className="toolbar">
                <div className="toolbar-group no-drag">
                    <button className="btn btn-ghost" onClick={handleNewFile} title="New File">
                        <IconNewFile /> New
                    </button>
                    <button className="btn btn-ghost" onClick={handleOpenFile} title="Open File (Ctrl+O)">
                        <IconFolder /> Open
                    </button>
                    <button className="btn btn-ghost" onClick={handleSaveFile} title="Save (Ctrl+S)">
                        <IconSave /> Save
                    </button>
                </div>
                <div className="toolbar-divider" />
                <div className="no-drag">
                    <button className="btn btn-ghost ai-btn" onClick={() => setShowAiModal(true)} title="Generate Code with AI">
                        <IconSparkles /> Generate
                    </button>
                    <button className="btn btn-ghost" onClick={() => setShowHelp(true)} title="Syntax Help">
                        <IconHelp /> Help
                    </button>
                    <button
                        className={`btn btn-run${isCompiling ? ' running' : ''}`}
                        onClick={handleRun}
                        disabled={isCompiling}
                        title="Run Code"
                    >
                        <IconPlay />
                        {isCompiling ? 'Running…' : 'Run Code'}
                    </button>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="content">

                {/* Tab Bar */}
                <div className="tab-bar">
                    <div className="tab active">
                        <span className="tab-icon"><IconFile /></span>
                        <span>{isDirty ? '● ' : ''}{fileName}</span>
                    </div>
                    <div className="tab-bar-actions no-drag">
                        <button className="tab-new-btn" onClick={handleNewFile} title="New file">＋</button>
                    </div>
                </div>

                {/* Editor */}
                <div className="editor-pane">
                    <Editor
                        key={editorKey}
                        height="100%"
                        language="quanta"
                        theme="quantaTheme"
                        value={code}
                        onChange={handleEditorChange}
                        loading={
                            <div className="editor-loading">
                                <div className="editor-loading-spinner" />
                                <span>Loading editor…</span>
                            </div>
                        }
                        options={{
                            minimap: { enabled: true, scale: 1 },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
                            fontLigatures: true,
                            lineHeight: 22,
                            padding: { top: 14, bottom: 14 },
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
                            contextmenu: true,
                            renderWhitespace: 'selection',
                            suggestOnTriggerCharacters: true,
                            quickSuggestions: true,
                            snippetSuggestions: 'top',
                        }}
                    />
                </div>

                {/* Resizer */}
                <div
                    className="resizer"
                    onMouseDown={() => { isDragging.current = true; document.body.style.cursor = 'row-resize'; }}
                />

                {/* Terminal */}
                <div className="terminal-panel" style={{ height: terminalHeight, minHeight: terminalHeight }}>
                    <div className="terminal-header">
                        <div className="terminal-title">
                            <span className={`term-dot${isCompiling ? ' compiling' : ''}`} />
                            OUTPUT
                        </div>
                        <button className="terminal-clear" onClick={() => setOutput('')}>✕ Clear</button>
                    </div>
                    <div className="terminal-body">
                        {output ? (
                            <>
                                <span className="term-prompt">$ quanta </span>
                                <span className="term-fname">{fileName}</span>
                                {'\n\n'}
                                <span className={isError ? 'term-error' : 'term-out'}>{output}</span>
                            </>
                        ) : (
                            <span className="term-empty">Press ▶ Run Code to execute your program…</span>
                        )}
                    </div>
                </div>

            </div>

            {/* ── Status Bar ── */}
            <div className="statusbar">
                <div className="statusbar-left">
                    <span>◆ Quanta Studio</span>
                    <span>⬧ Quanta</span>
                </div>
                <div className="statusbar-right">
                    <span>{isCompiling ? '⏳ Running…' : isDirty ? '● Unsaved' : '✓ Ready'}</span>
                    <span>UTF-8</span>
                </div>
            </div>

            {/* ── Help Modal ── */}
            {showHelp && (
                <div className="help-overlay" onClick={() => setShowHelp(false)}>
                    <div className="help-modal" onClick={e => e.stopPropagation()}>
                        <div className="help-header">
                            <div>
                                <h2>Quanta Syntax Reference</h2>
                                <p className="help-subtitle">Everything you need to write Quanta code</p>
                            </div>
                            <button className="help-close" onClick={() => setShowHelp(false)}>✕</button>
                        </div>
                        <div className="help-body">
                            {/* ── Sidebar ── */}
                            <div className="help-sidebar">
                                {['Variables & Types', 'Arrays & Lists', '2D Matrix Arrays', 'Functions & Defaults', 'Control Flow', 'Loops', 'String Methods', 'String Validation', 'Comments'].map(tab => (
                                    <button
                                        key={tab}
                                        className={`help-tab ${helpTab === tab ? 'active' : ''}`}
                                        onClick={() => setHelpTab(tab)}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* ── Content Area ── */}
                            <div className="help-content-area">
                                {helpTab === 'Variables & Types' && (
                                    <div className="help-section animated">
                                        <h3>Variables & Types</h3>
                                        <p>Quanta supports both dynamically and statically typed initializations.</p>
                                        <pre><code>@ Implicit types{'\n'}x = 100{'\n'}name = "Quanta"{'\n'}isValid = true{'\n'}{'\n'}@ Explicit types{'\n'}int age = 10{'\n'}float pi = 3.14{'\n'}string msg = "Hello"</code></pre>
                                    </div>
                                )}

                                {helpTab === 'Arrays & Lists' && (
                                    <div className="help-section animated">
                                        <h3>Arrays & Lists</h3>
                                        <p>Arrays are fixed in size and live on the stack. Lists grow dynamically on the heap.</p>
                                        <pre><code>@ Fixed Array (Size 3){'\n'}int[3] arr = [10, 20, 30];{'\n'}arr[1] = 99;{'\n'}{'\n'}@ Dynamic List (Resizable){'\n'}int[] list = [5, 10];{'\n'}list.push(15);{'\n'}int last = list.pop();{'\n'}print(list.len());</code></pre>
                                    </div>
                                )}

                                {helpTab === '2D Matrix Arrays' && (
                                    <div className="help-section animated">
                                        <h3>2D Matrix Arrays</h3>
                                        <p>Create multi-dimensional grids for math and maps.</p>
                                        <pre><code>@ Static 2D Array{'\n'}int[2][3] mat = [[1, 2], [3, 4]];{'\n'}mat[0][1] = 99;{'\n'}{'\n'}@ Dynamic 2D List{'\n'}int[][] grid = [[1], [2, 3]];{'\n'}print(grid[1][0]); @ Prints 2</code></pre>
                                    </div>
                                )}

                                {helpTab === 'Functions & Defaults' && (
                                    <div className="help-section animated">
                                        <h3>Functions & Defaults</h3>
                                        <p>Declare functions with specific types and elegant default parameter fallbacks.</p>
                                        <pre><code>@ Standard function{'\n'}int add(a, b) {'{\n'}  return a + b;{'\n'}{'}'}{'\n\n'}@ Default arguments{'\n'}int area(w=10, h=20) {'{\n'}  return w * h;{'\n'}{'}'}</code></pre>
                                    </div>
                                )}

                                {helpTab === 'Control Flow' && (
                                    <div className="help-section animated">
                                        <h3>Control Flow</h3>
                                        <p>Standard conditional logic for branching paths.</p>
                                        <pre><code>if (x &gt; 5) {'{\n'}  print("Large");{'\n'}{'} '}elif (x == 5) {'{\n'}  print("Five");{'\n'}{'} '}else {'{\n'}  print("Small");{'\n'}{'}'}</code></pre>
                                    </div>
                                )}

                                {helpTab === 'Loops' && (
                                    <div className="help-section animated">
                                        <h3>Loops</h3>
                                        <p>An infinite/conditional `loop` keyword replaces standard while/for.</p>
                                        <pre><code>int i = 0;{'\n'}loop (i &lt; 5) {'{\n'}  print(i);{'\n'}  i++;{'\n'}{'}'}</code></pre>
                                    </div>
                                )}

                                {helpTab === 'String Methods' && (
                                    <div className="help-section animated">
                                        <h3>String Methods</h3>
                                        <p>Built-in manipulation methods that act on strings.</p>
                                        <pre><code>string s = " Quanta Language "{'\n'}{'\n'}s.len()        @ length{'\n'}s.upper()      @ " QUANTA ..."{'\n'}s.lower()      @ " quanta ..."{'\n'}s.strip()      @ removes spaces{'\n'}s.replace("a", "A"){'\n'}s.reverse(){'\n'}s.find("Lan")  @ returns index</code></pre>
                                    </div>
                                )}

                                {helpTab === 'String Validation' && (
                                    <div className="help-section animated">
                                        <h3>String Validation</h3>
                                        <p>Useful boolean checks for verifying characters.</p>
                                        <pre><code>string val = "Hello"{'\n'}{'\n'}val.isalpha()   @ true{'\n'}val.isdigit()   @ false{'\n'}val.isspace()   @ false{'\n'}val.isalnum()   @ true{'\n'}val.startswith("He") @ true{'\n'}val.endswith("lo")   @ true</code></pre>
                                    </div>
                                )}

                                {helpTab === 'Comments' && (
                                    <div className="help-section animated">
                                        <h3>Comments</h3>
                                        <p>Add notes unheeded by the compiler.</p>
                                        <pre><code>@ Single line comment{'\n\n'}'''{'\n'}Multi-line block comment{'\n'}for longer explanations{'\n'}'''</code></pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── AI Generation Modal ── */}
            {showAiModal && (
                <div className="help-overlay" onClick={() => !isGenerating && setShowAiModal(false)}>
                    <div className="ai-modal" onClick={e => e.stopPropagation()}>
                        <div className="help-header">
                            <div>
                                <h2>✨ Generate Quanta Code</h2>
                                <p className="help-subtitle">Describe what you want to build, and AI will write it.</p>
                            </div>
                            <button className="help-close" onClick={() => !isGenerating && setShowAiModal(false)}>✕</button>
                        </div>
                        <div className="ai-body">
                            {localStorage.getItem('quanta_gemini_key') ? (
                                <div className="ai-input-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-editor)', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border-lt)' }}>
                                    <span style={{ color: 'var(--green)', fontSize: '13px', fontWeight: 500 }}>✓ API Key Configured Securely</span>
                                    <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => { localStorage.removeItem('quanta_gemini_key'); setApiKey(''); }}>Change Key</button>
                                </div>
                            ) : (
                                <div className="ai-input-group">
                                    <label>Gemini API Key (Required Once)</label>
                                    <input
                                        type="password"
                                        placeholder="AIzaSy..."
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        disabled={isGenerating}
                                    />
                                </div>
                            )}
                            <div className="ai-input-group">
                                <label>What should I write?</label>
                                <textarea
                                    className="ai-prompt-area"
                                    placeholder="e.g. Write a function that calculates the factorial of a number."
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    disabled={isGenerating}
                                    rows={4}
                                    onKeyDown={(e) => {
                                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleGenerateCode();
                                    }}
                                />
                                <span className="ai-hint">Pro Tip: Press Ctrl+Enter to generate</span>
                            </div>
                        </div>
                        <div className="ai-footer">
                            <button className="btn btn-ghost" onClick={() => setShowAiModal(false)} disabled={isGenerating}>Cancel</button>
                            <button
                                className={`btn btn-run ${isGenerating ? 'running' : ''}`}
                                onClick={handleGenerateCode}
                                disabled={isGenerating || !aiPrompt.trim()}
                            >
                                <IconSparkles /> {isGenerating ? 'Generating...' : 'Generate Code'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
