"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface WritingContextType {
  isWriting: boolean;
  setIsWriting: (writing: boolean) => void;
}

const WritingContext = createContext<WritingContextType | undefined>(undefined);

export function WritingProvider({ children }: { children: ReactNode }) {
  const [isWriting, setIsWriting] = useState(false);

  return (
    <WritingContext.Provider value={{ isWriting, setIsWriting }}>
      {children}
    </WritingContext.Provider>
  );
}

export function useWriting() {
  const context = useContext(WritingContext);
  if (context === undefined) {
    throw new Error("useWriting must be used within a WritingProvider");
  }
  return context;
}
