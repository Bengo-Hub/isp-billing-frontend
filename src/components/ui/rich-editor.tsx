"use client";

import { cn } from "@/lib/utils";
import { useState, useRef, useCallback } from "react";

interface RichEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

/**
 * Simple rich text editor using contentEditable
 * TODO: Consider using @tiptap/react for a full-featured React 19 compatible editor
 */
export default function RichEditor({
  value = "",
  onChange,
  placeholder = "Write something...",
  className,
  minHeight = "150px"
}: RichEditorProps) {
  const [content, setContent] = useState(value);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const val = e.currentTarget.innerHTML;
    setContent(val);
    onChange?.(val);
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className="p-1.5 rounded hover:bg-muted text-sm font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          className="p-1.5 rounded hover:bg-muted text-sm italic"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          className="p-1.5 rounded hover:bg-muted text-sm underline"
          title="Underline"
        >
          U
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          className="p-1.5 rounded hover:bg-muted text-xs"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          className="p-1.5 rounded hover:bg-muted text-xs"
          title="Numbered List"
        >
          1. List
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: content }}
        className="p-3 focus:outline-none prose dark:prose-invert max-w-none"
        style={{ minHeight }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
