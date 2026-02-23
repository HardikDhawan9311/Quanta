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

const DEFAULT_CODE = `fn main() {
  print("Welcome to Quanta")
}

main()
`;

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
    const isDragging = useRef<boolean>(false);

    const monaco = useMonaco();

    // ── Register Quanta language ───────────────────────────────────────────────
    useEffect(() => {
        if (!monaco) return;
        monaco.languages.register({ id: 'quanta' });
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
                    ...['fn', 'let', 'if', 'elif', 'else', 'return', 'while', 'for', 'loop', 'in',
                        'class', 'struct', 'import', 'print', 'true', 'false', 'null',
                        'new', 'self', 'var', 'void', 'bool', 'int', 'float', 'string'].map(k => ({
                            label: k,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: k,
                            range
                        })),
                    // Built-in functions
                    ...['print', 'len', 'upper', 'lower', 'reverse', 'strip', 'replace', 'find', 'count'].map(fn => ({
                        label: fn,
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: `${fn}()`,
                        range
                    })),
                    // Snippets
                    {
                        label: 'fn',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: ['fn ${1:name}(${2:args}) {', '\t$0', '}'].join('\n'),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Function declaration',
                        range
                    },
                    {
                        label: 'if',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: ['if ${1:condition} {', '\t$0', '}'].join('\n'),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'If statement',
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
                            <h2>Quanta Syntax Guide</h2>
                            <button className="help-close" onClick={() => setShowHelp(false)}>✕</button>
                        </div>
                        <div className="help-content">
                            <div className="help-section">
                                <h3>Comments</h3>
                                <pre><code>@ Single line comment{'\n'}''' Multi-line{'\n'}    comment '''</code></pre>
                            </div>
                            <div className="help-section">
                                <h3>Variables & Types</h3>
                                <pre><code>let x = 10{'\n'}let name = "Quanta"{'\n'}let isAwesome = true</code></pre>
                            </div>
                            <div className="help-section">
                                <h3>Functions</h3>
                                <pre><code>fn greet(name) {'{\n'}  print("Hello " + name){'\n'}  return true{'\n'}{'}'}</code></pre>
                            </div>
                            <div className="help-section">
                                <h3>Control Flow</h3>
                                <pre><code>if x &gt; 5 {'{\n'}  print("Large"){'\n'}{'} '}elif x == 5 {'{\n'}  print("Five"){'\n'}{'} '}else {'{\n'}  print("Small"){'\n'}{'}'}</code></pre>
                            </div>
                            <div className="help-section">
                                <h3>Loops</h3>
                                <pre><code>let i = 0{'\n'}while i &lt; 5 {'{\n'}  print(i){'\n'}  i = i + 1{'\n'}{'}'}</code></pre>
                            </div>
                            <div className="help-section">
                                <h3>Built-in Methods</h3>
                                <pre><code>print(len("test"))         @ 4{'\n'}print(upper("abc"))        @ ABC{'\n'}print(replace("cat", "c", "b")) @ bat</code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
