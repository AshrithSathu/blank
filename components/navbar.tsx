"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { NavbarUserIcon } from "./navbar-user-icon";
import { useWriting } from "./writing-context";
import { toast } from "sonner";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";

interface NavbarProps {
  content: string;
  title: string;
  onTitleChange: (title: string) => void;
}

export default function Navbar({ content, title, onTitleChange }: NavbarProps) {
  const [toggleCount, setToggleCount] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  const { isWriting } = useWriting();

  // Sync localTitle with title prop
  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  const handleTitleClick = () => {
    setLocalTitle(title);
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    const finalTitle =
      localTitle.trim() === "" ? "Untitled Document" : localTitle.trim();
    setLocalTitle(finalTitle);
    onTitleChange(finalTitle);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard", {
        description: "Your document content has been copied to the clipboard.",
      });
    } catch (error) {
      toast.error("Failed to copy", {
        description: "Could not copy content to clipboard.",
      });
    }
  };

  const wordCount = content
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const charCount = content.length;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-500 ${
        isWriting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
        {/* Left side - Editable title */}
        <div className="flex items-center">
          {isEditingTitle ? (
            <input
              type="text"
              value={localTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="text-lg font-semibold bg-transparent border-none outline-none focus:ring-0 text-foreground"
              autoFocus
            />
          ) : (
            <h1
              onClick={handleTitleClick}
              className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors"
            >
              {title}
            </h1>
          )}
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-3 pr-2">
          {/* Word/Character count */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setToggleCount(!toggleCount)}
          >
            {toggleCount ? (
              <span>{wordCount} words</span>
            ) : (
              <span>{charCount} characters</span>
            )}
          </Button>

          {/* Share button (dummy) */}
          {/* <Button variant="ghost" size="sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16,6 12,2 8,6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </Button> */}

          {/* Copy button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            disabled={content.length === 0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          </Button>

          {/* Theme toggle */}
          <ThemeToggleButton />

          {/* User profile */}
          <NavbarUserIcon />
        </div>
      </div>
    </nav>
  );
}
