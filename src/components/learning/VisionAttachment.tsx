"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Image as ImageIcon,
  X,
  Eye,
  AlertCircle,
  Sparkles,
  HelpCircle,
  FileCode,
  Layers,
} from "lucide-react";

interface VisionAttachmentProps {
  onImageSelected: (base64: string, mimeType: string, fileName: string) => void;
  onImageRemoved: () => void;
  currentImage?: string | null;
  disabled?: boolean;
  onQuickPrompt?: (prompt: string) => void;
  compact?: boolean;
}

export function VisionAttachment({
  onImageSelected,
  onImageRemoved,
  currentImage,
  disabled = false,
  onQuickPrompt,
  compact = false,
}: VisionAttachmentProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [fileName, setFileName] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentImage) {
      setPreviewUrl(currentImage);
    } else {
      setPreviewUrl(null);
      setFileName("");
    }
  }, [currentImage]);

  const handleFile = (file: File) => {
    setErrorMsg(null);

    // 1. Supported image formats
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMsg("Please upload a supported image format (PNG, JPG, WEBP, GIF).");
      return;
    }

    // 2. Max size 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg("Image size exceeds 5MB limit. Please upload a smaller screenshot or diagram.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      setFileName(file.name);
      onImageSelected(result, file.type, file.name);
    };
    reader.onerror = () => {
      setErrorMsg("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setFileName("");
    setErrorMsg(null);
    onImageRemoved();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const quickVisualPrompts = [
    "Explain this diagram in relation to our current topic",
    "What is wrong in this diagram or screenshot?",
    "Explain this code screenshot step-by-step",
    "What does this flowchart or memory layout mean?",
  ];

  return (
    <div className="space-y-2">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Trigger Button when no preview */}
      {!previewUrl && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Upload diagram, flowchart, code screenshot, or visual notes for AI analysis"
          className={`flex items-center gap-1.5 transition-all text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50 ${
            compact
              ? "p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200"
              : "w-full py-2.5 px-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-700 hover:bg-blue-100/60 shadow-2xs"
          }`}
        >
          <ImageIcon size={compact ? 15 : 16} className="text-blue-600 shrink-0" />
          {!compact && (
            <div className="text-left flex-1">
              <span className="block text-xs font-extrabold text-blue-900">
                📷 Vision AI: Upload Diagram / Screenshot
              </span>
              <span className="block text-[10px] text-blue-600/80 font-medium">
                Analyze flowcharts, memory layouts, architecture & code visuals
              </span>
            </div>
          )}
        </button>
      )}

      {/* Error display */}
      {errorMsg && (
        <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-700 flex items-center gap-1.5 animate-in fade-in">
          <AlertCircle size={13} className="shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preview Card with Image & Quick Prompts */}
      {previewUrl && (
        <div className="p-3 rounded-2xl bg-white border border-blue-200 shadow-sm space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                👁️
              </div>
              <span className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                {fileName || "Visual Material Attached"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>

          {/* Thumbnail preview */}
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-36 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Visual Learning Material"
              className="max-h-36 w-auto object-contain"
            />
          </div>

          {/* Quick action chips */}
          {onQuickPrompt && (
            <div className="pt-1 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Suggested Visual Questions:
              </span>
              <div className="flex flex-wrap gap-1">
                {quickVisualPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onQuickPrompt(prompt)}
                    disabled={disabled}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 transition cursor-pointer text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
