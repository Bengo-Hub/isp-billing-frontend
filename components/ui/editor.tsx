"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface EditorProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function Editor({ label, value = "", onChange, placeholder }: EditorProps) {
  const [content, setContent] = useState(value);

  const handleChange = (val: string) => {
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
          <ReactQuill
            theme="snow"
            value={content}
            onChange={handleChange}
            placeholder={placeholder || "Write something..."}
            className="[&_.ql-container]:min-h-[150px] [&_.ql-editor]:p-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
