import React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

interface MonacoCodeEditorProps {
  language: 'javascript' | 'python';
  code: string;
  onChange: (value: string | undefined) => void;
  readOnly?: boolean;
}

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  language,
  code,
  onChange,
  readOnly = false,
}) => {
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Define custom dark charcoal editor theme
    monaco.editor.defineTheme('interviewLabDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: '38bdf8' },
        { token: 'identifier', foreground: 'e2e8f0' },
      ],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#f8fafc',
        'editor.lineHighlightBackground': '#1e293b50',
        'editorCursor.foreground': '#a855f7',
        'editorWhitespace.foreground': '#334155',
        'editorIndentGuide.background': '#1e293b',
        'editorIndentGuide.activeBackground': '#334155',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#cbd5e1',
      },
    });

    monaco.editor.setTheme('interviewLabDark');
    editor.focus();
  };

  return (
    <div className="w-full h-full min-h-[320px] bg-[#0f172a] relative overflow-hidden flex flex-col">
      <Editor
        height="100%"
        width="100%"
        language={language}
        value={code}
        onChange={onChange}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        loading={
          <div className="h-full flex items-center justify-center gap-2 text-slate-400 text-sm bg-[#0f172a]">
            <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
            <span>Loading Monaco Editor...</span>
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
          fontLigatures: true,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 12, bottom: 12 },
          suggestOnTriggerCharacters: true,
        }}
      />
    </div>
  );
};
