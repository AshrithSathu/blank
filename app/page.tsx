"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useWriting } from "@/components/writing-context";
import SignInAuthButton from "@/components/signinauthbutton";
import Navbar from "@/components/navbar";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function Home() {
  const { data: session, status } = useSession();
  const { isWriting, setIsWriting } = useWriting();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("Untitled Document");
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [showEscHint, setShowEscHint] = useState(false);
  const escHintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Convex hooks
  const userDocument = useQuery(
    api.documents.getUserDocument,
    session?.user?.email ? { userEmail: session.user.email } : "skip"
  );
  const createDocument = useMutation(api.documents.createUserDocument);
  const updateDocument = useMutation(api.documents.updateUserDocument);

  // Handle typing - hide UI when typing starts
  const handleTyping = () => {
    setIsWriting(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timeout to keep UI hidden while typing
    timeoutRef.current = setTimeout(() => {
      // UI will show again when mouse moves or after period of inactivity
    }, 1000);
  };

  // Save document to Convex
  const saveDocument = useCallback(async () => {
    if (session?.user?.email) {
      try {
        await updateDocument({
          userEmail: session.user.email,
          title,
          content,
        });
        toast.success("Document saved", {
          description: "Your changes have been saved automatically.",
        });
      } catch (error) {
        console.error("Failed to save document:", error);
        toast.error("Failed to save", {
          description: "Could not save your document. Please try again.",
        });
      }
    }
  }, [session?.user?.email, title, content, updateDocument]);

  // Handle escape key - exit writing mode and save to Convex
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isWriting) {
        setIsWriting(false);
        saveDocument();
      }
    },
    [isWriting, setIsWriting, saveDocument]
  );

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    handleTyping();

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  // Load document data when it becomes available
  useEffect(() => {
    if (userDocument) {
      setContent(userDocument.content);
      setTitle(userDocument.title);
      setIsDocumentLoaded(true);
    }
  }, [userDocument]);

  // Create document if it doesn't exist
  useEffect(() => {
    if (session?.user?.email && userDocument === null) {
      createDocument({ userEmail: session.user.email }).then(() => {
        // Document will be created, but we need to wait for the query to refresh
        // The query will automatically refresh and trigger the effect above
      });
    }
  }, [session?.user?.email, userDocument, createDocument]);

  useEffect(() => {
    // Add escape key listener to document
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Ensure escHintTimeout is also cleared on unmount
      if (escHintTimeoutRef.current) {
        clearTimeout(escHintTimeoutRef.current);
      }
    };
  }, [isWriting, handleKeyDown]);

  // Effect to manage the visibility of the "Esc" hint with a delay
  useEffect(() => {
    if (isWriting) {
      setShowEscHint(false); // Hide immediately when entering writing mode
      if (escHintTimeoutRef.current) {
        clearTimeout(escHintTimeoutRef.current);
      }
      escHintTimeoutRef.current = setTimeout(() => {
        // Only show if still in writing mode after delay
        if (isWriting) {
          setShowEscHint(true);
        }
      }, 3500);
    } else {
      setShowEscHint(false); // Hide if not in writing mode
      if (escHintTimeoutRef.current) {
        clearTimeout(escHintTimeoutRef.current);
        escHintTimeoutRef.current = null;
      }
    }

    // Cleanup timeout when isWriting changes or component unmounts
    return () => {
      if (escHintTimeoutRef.current) {
        clearTimeout(escHintTimeoutRef.current);
      }
    };
  }, [isWriting]);

  // Show loading while session is loading or document is being fetched/created
  if (status === "loading" || (session && !isDocumentLoaded)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Blank Space</h1>
          <p className="text-muted-foreground mb-8">
            A distraction-free writing experience.
          </p>
          <SignInAuthButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Navbar content={content} title={title} onTitleChange={setTitle} />
      {/* Main writing area */}
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-20">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing your thoughts here..."
          className="w-full min-h-[60vh] p-6 text-lg leading-relaxed resize-none border-none outline-none bg-transparent focus:ring-0 placeholder:text-muted-foreground/50"
          style={{
            fontFamily: "var(--font-serif)",
            lineHeight: "1.8",
          }}
        />

        {/* Escape key hint */}
        {showEscHint && (
          <div className="fixed bottom-6 right-6 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-2 rounded-md border animate-in fade-in duration-300">
            Press{" "}
            <kbd className="px-1 py-0.5 bg-muted rounded text-foreground font-mono text-xs">
              Esc
            </kbd>{" "}
            to exit focus mode
          </div>
        )}

        {/* Word count */}
        {/* <div
          className={`fixed bottom-4 left-4 flex text-sm text-muted-foreground transition-all duration-500 ${
            isWriting ? "opacity-0" : "opacity-100"
          }`}
        >
          <span>
            {content.split(/\s+/).filter((word) => word.length > 0).length}{" "}
            words
          </span>
        </div>
        <div
          className={`fixed bottom-4 right-4 flex text-sm text-muted-foreground transition-all duration-500 ${
            isWriting ? "opacity-0" : "opacity-100"
          }`}
        >
          <span>{content.length} characters</span>
        </div> */}
      </div>

      {/* Subtle gradient overlay when writing */}
      <div
        className={`fixed inset-0 pointer-events-none transition-all duration-1000 ${
          isWriting
            ? "bg-gradient-to-b from-background/50 via-transparent to-background/50"
            : "bg-transparent"
        }`}
      />
    </div>
  );
}
