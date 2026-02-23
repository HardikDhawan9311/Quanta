import { useState, useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { Play, Save, FolderOpen, FileText } from 'lucide-react';
import './App.css';

function App() {
    const [code, setCode] = useState<string>('fn main() {\n  print("Hello from Quanta Studio!");\n}\n');
    const [output, setOutput] = useState<string>('');
    const [isCompiling, setIsCompiling] = useState<boolean>(false);
    const [currentFile, setCurrentFile] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('Untitled.qunta');

    const monaco = useMonaco();

    useEffect(() => {
        if (monaco) {
            // Register custom Language
            monaco.languages.register({ id: 'quanta' });

            monaco.languages.setMonarchTokensProvider('quanta', {
                tokenizer: {
                    root: [
                        [/\b(fn|let|if|else|return|while|for|class|struct|import|print)\b/, 'keyword'],
                        [/"([^"\\]|\\.)*"/, 'string'],
                        [/\b\d+(\.\d+)?\b/, 'number'],
                        [/\/\/.*$/, 'comment'],
                        [/\/\*/, 'comment', '@comment'],
                        [/[{}()[\]]/, '@brackets'],
                        [/[=><!~?:&|+\-*\/\^%]+/, 'operator'],
                    ],
                    comment: [
                        [/[^\/*]+/, 'comment'],
                        [/\*\//, 'comment', '@pop'],
                        [/[\/*]/, 'comment']
                    ]
                }
            });

            // Define a custom theme
            monaco.editor.defineTheme('quantaTheme', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'keyword', foreground: 'c678dd', fontStyle: 'bold' },
                    { token: 'string', foreground: '98c379' },
                    { token: 'number', foreground: 'd19a66' },
                    { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
                    { token: 'operator', foreground: '56b6c2' }
                ],
                colors: {
                    'editor.background': '#1e1e1e',
                    'editor.lineHighlightBackground': '#2c313a'
                }
            });
        }
    }, [monaco]);

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setCode(value);
        }
    };

    const handleOpenFile = async () => {
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.openFile();
                if (result) {
                    setCode(result.content);
                    setCurrentFile(result.filePath);
                    setFileName(result.fileName);
                    setOutput(`Opened ${result.filePath}`);
                }
            } else {
                alert("Running in Web Mode: File System is disabled.");
            }
        } catch (e) {
            console.error(e);
            setOutput(`Error opening file: ${e}`);
        }
    };

    const handleSaveFile = async () => {
        try {
            if (window.electronAPI) {
                if (currentFile) {
                    await window.electronAPI.saveFile(currentFile, code);
                    setOutput(`Saved ${currentFile}`);
                } else {
                    const result = await window.electronAPI.saveFileAs(code);
                    if (result) {
                        setCurrentFile(result.filePath);
                        setFileName(result.fileName);
                        setOutput(`Saved ${result.filePath}`);
                    }
                }
            } else {
                alert("Running in Web Mode: File System is disabled.");
            }
        } catch (e) {
            console.error(e);
            setOutput(`Error saving file: ${e}`);
        }
    };

    const handleRunCompiler = async () => {
        if (!window.electronAPI) {
            setOutput("Compiler cannot run in Web browser. Please run the desktop app.");
            return;
        }

        // Auto-save before run
        let targetFile = currentFile;
        if (!targetFile) {
            const result = await window.electronAPI.saveFileAs(code);
            if (result) {
                targetFile = result.filePath;
                setCurrentFile(result.filePath);
                setFileName(result.fileName);
            } else {
                setOutput("Compilation cancelled. You must save the file first.");
                return;
            }
        } else {
            await window.electronAPI.saveFile(targetFile, code);
        }

        setIsCompiling(true);
        setOutput("Compiling...");

        try {
            const result = await window.electronAPI.executeCompiler(targetFile!);
            if (result.error) {
                setOutput(`Error: ${result.error}\n${result.stderr}`);
            } else {
                setOutput(result.stdout || (result.stderr ? `Warning/Error output:\n${result.stderr}` : 'Execution completed.'));
            }
        } catch (error: any) {
            setOutput(`Fatal Error: ${error.message}`);
        } finally {
            setIsCompiling(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#1e1e1e] text-white font-sans overflow-hidden">
            {/* Custom Titlebar Region */}
            <div className="h-9 custom-drag flex items-center justify-between px-4 bg-[#181818] border-b border-[#2d2d2d] z-50">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <FileText size={16} className="text-[#c678dd]" />
                    <span>Quanta Studio</span>
                    <span className="text-gray-500 mx-1">-</span>
                    <span className="text-gray-400">{fileName}</span>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 px-4 py-2 bg-[#252526] border-b border-[#333]">
                <button onClick={handleOpenFile} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#3c3c3c] rounded text-sm transition-colors text-gray-300 hover:text-white">
                    <FolderOpen size={16} /> Open
                </button>
                <button onClick={handleSaveFile} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#3c3c3c] rounded text-sm transition-colors text-gray-300 hover:text-white">
                    <Save size={16} /> Save
                </button>
                <div className="w-px h-5 bg-[#444] mx-2"></div>
                <button
                    onClick={handleRunCompiler}
                    disabled={isCompiling}
                    className="flex items-center gap-2 px-4 py-1.5 bg-[#4CAF50] hover:bg-[#45a049] text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                    <Play size={16} fill="currentColor" />
                    {isCompiling ? 'Running...' : 'Run Code'}
                </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col h-full bg-[#1e1e1e]">

                {/* Editor Pane */}
                <div className="flex-1 relative border-b border-[#333]">
                    <Editor
                        height="100%"
                        language="quanta"
                        theme="quantaTheme"
                        value={code}
                        onChange={handleEditorChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                            padding: { top: 16 },
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            cursorBlinking: "smooth",
                            cursorSmoothCaretAnimation: "on",
                            formatOnPaste: true,
                        }}
                    />
                </div>

                {/* Terminal / Output Pane */}
                <div className="h-64 bg-[#181818] flex flex-col">
                    <div className="flex items-center px-4 py-2 bg-[#252526] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Terminal Output
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap text-gray-300 selection:bg-[#264f78]">
                        {output || <span className="text-gray-600 italic">No output yet...</span>}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default App;
