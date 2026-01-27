"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface EditorProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

/**
 * Simple rich text editor using contentEditable
 * TODO: Consider using @tiptap/react for a full-featured React 19 compatible editor
 */
export function Editor({
  label,
  value = "",
  onChange,
  placeholder,
  minHeight = "150px"
}: EditorProps) {
  const [content, setContent] = useState(value);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const val = e.currentTarget.innerHTML;
    setContent(val);
    onChange?.(val);
  };

  return (
    <Card className="w-full border rounded-2xl shadow-sm">
      {label && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="prose dark:prose-invert max-w-none">
          <div
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            dangerouslySetInnerHTML={{ __html: content }}
            className="min-h-[150px] p-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            style={{ minHeight }}
            data-placeholder={placeholder || "Write something..."}
          />
        </div>
      </CardContent>
    </Card>
  );
}
