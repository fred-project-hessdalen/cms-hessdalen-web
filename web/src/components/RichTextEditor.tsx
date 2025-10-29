"use client";

import { useState, useRef, useEffect } from "react";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Initialize editor with HTML content
    useEffect(() => {
        if (editorRef.current && !isFocused) {
            editorRef.current.innerHTML = value || "";
        }
    }, [value, isFocused]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    };

    const formatBlock = (tag: string) => {
        execCommand("formatBlock", tag);
    };

    const ToolbarButton = ({
        onClick,
        title,
        children,
        isActive = false
    }: {
        onClick: () => void;
        title: string;
        children: React.ReactNode;
        isActive?: boolean;
    }) => (
        <button
            type="button"
            onMouseDown={(e) => {
                e.preventDefault();
                onClick();
            }}
            title={title}
            className={`px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isActive ? "bg-gray-200 dark:bg-gray-600" : "bg-white dark:bg-gray-800"
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className={className}>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-t-md border-b-0">
                <ToolbarButton onClick={() => formatBlock("h1")} title="Heading 1">
                    H1
                </ToolbarButton>
                <ToolbarButton onClick={() => formatBlock("h2")} title="Heading 2">
                    H2
                </ToolbarButton>
                <ToolbarButton onClick={() => formatBlock("h3")} title="Heading 3">
                    H3
                </ToolbarButton>
                <ToolbarButton onClick={() => formatBlock("p")} title="Paragraph">
                    P
                </ToolbarButton>

                <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

                <ToolbarButton onClick={() => execCommand("bold")} title="Bold">
                    <strong>B</strong>
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand("italic")} title="Italic">
                    <em>I</em>
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand("underline")} title="Underline">
                    <u>U</u>
                </ToolbarButton>

                <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

                <ToolbarButton onClick={() => execCommand("insertUnorderedList")} title="Bullet List">
                    • List
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand("insertOrderedList")} title="Numbered List">
                    1. List
                </ToolbarButton>

                <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

                <ToolbarButton onClick={() => execCommand("removeFormat")} title="Clear Formatting">
                    Clear
                </ToolbarButton>
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="min-h-[200px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-b-md focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white prose prose-sm dark:prose-invert max-w-none"
                data-placeholder={placeholder}
                suppressContentEditableWarning
                style={{
                    ...((!value || value === "") && {
                        position: "relative",
                    }),
                }}
            />

            <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] p {
          margin: 0.5em 0;
        }
        [contenteditable] ul,
        [contenteditable] ol {
          margin: 0.5em 0;
          padding-left: 2em;
        }
        [contenteditable] li {
          margin: 0.25em 0;
        }
      `}</style>
        </div>
    );
}
