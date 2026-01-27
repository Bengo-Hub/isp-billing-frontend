'use client';

import { Image as ImageIcon, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface FileUploadProps {
  name: string;
  accept?: string;
  maxSize?: number; // in MB
  onFileChange?: (file: File | null) => void;
  previewUrl?: string;
  className?: string;
  disabled?: boolean;
}

export default function FileUpload({ 
  name, 
  accept = 'image/*', 
  maxSize = 5, 
  onFileChange,
  previewUrl,
  className = '',
  disabled = false,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (disabled) return;

    if (selectedFile.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);

    onFileChange?.(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileChange?.(null);
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-pink-500 bg-pink-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={disabled ? undefined : handleDrag}
        onDragLeave={disabled ? undefined : handleDrag}
        onDragOver={disabled ? undefined : handleDrag}
        onDrop={disabled ? undefined : handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="max-h-32 max-w-32 object-contain rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={removeFile}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {file ? file.name : 'Current file'}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <ImageIcon className="h-12 w-12" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-pink-600 hover:text-pink-500 cursor-pointer">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {accept.includes('image') ? 'PNG, JPG, GIF up to' : 'File up to'} {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {file && (
        <div className="mt-2 text-xs text-gray-500">
          Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </div>
      )}
    </div>
  );
}
