'use client';

import { useMemo, useRef } from 'react';
import CodeMirror, { EditorView, keymap } from '@uiw/react-codemirror';
import { sql, SQLite } from '@codemirror/lang-sql';

export interface SqlEditorProps {
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
  dark: boolean;
}

export default function SqlEditor({ value, onChange, onRun, dark }: SqlEditorProps) {
  // Keep the run handler fresh without rebuilding the CodeMirror keymap.
  const runRef = useRef(onRun);
  runRef.current = onRun;

  const extensions = useMemo(
    () => [
      sql({ dialect: SQLite, upperCaseKeywords: true }),
      EditorView.lineWrapping,
      keymap.of([
        {
          key: 'Mod-Enter',
          preventDefault: true,
          run: () => {
            runRef.current();
            return true;
          },
        },
      ]),
    ],
    [],
  );

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme={dark ? 'dark' : 'light'}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        autocompletion: false,
        searchKeymap: false,
      }}
      minHeight="7rem"
      maxHeight="30rem"
      className="text-[13px] [&_.cm-editor]:bg-transparent [&_.cm-gutters]:bg-transparent [&_.cm-editor.cm-focused]:outline-none"
    />
  );
}
