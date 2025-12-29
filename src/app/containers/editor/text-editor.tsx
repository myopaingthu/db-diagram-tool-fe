import { type FC, useEffect, useRef } from "react";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { useSchemaStore } from "@/app/store";

interface TextEditorProps {
  onBlur?: (text: string) => void;
}

export const TextEditor: FC<TextEditorProps> = ({ onBlur }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { dbmlText, setDbmlText } = useSchemaStore();
  const onBlurRef = useRef(onBlur);

  useEffect(() => {
    onBlurRef.current = onBlur;
  }, [onBlur]);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: dbmlText || "",
      extensions: [
        basicSetup,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const text = update.state.doc.toString();
            setDbmlText(text);
          }
        }),
        EditorView.domEventHandlers({
          blur: () => {
            if (viewRef.current) {
              const text = viewRef.current.state.doc.toString();
              onBlurRef.current?.(text);
            }
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  useEffect(() => {
    if (
      viewRef.current &&
      dbmlText !== viewRef.current.state.doc.toString()
    ) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: dbmlText,
        },
      });
    }
  }, [dbmlText]);

  return (
    <div className="h-full w-full">
      <div ref={editorRef} className="h-full w-full" />
    </div>
  );
};

