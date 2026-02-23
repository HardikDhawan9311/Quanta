import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Configure Monaco to use the locally-installed monaco-editor package
// instead of loading from CDN. This is required in packaged Electron apps
// where there is no internet access to load from jsDelivr/CDN.
import { loader } from '@monaco-editor/react'
import * as monacoLib from 'monaco-editor'
loader.config({ monaco: monacoLib })

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
