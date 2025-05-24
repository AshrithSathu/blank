"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";

export default function WordCharCount({
  content,
  isWriting,
}: {
  content: string;
  isWriting: boolean;
}) {
  const [toggle, setToggle] = useState(false);

  if (isWriting) return null;

  return (
    <div className="fixed top-4 left-4 flex items-center gap-2">
      <Button
        size="sm"
        onClick={() => setToggle(!toggle)}
        className="text-muted-foreground"
      >
        {toggle ? (
          <span>{content.length} characters</span>
        ) : (
          <span>
            {content.split(/\s+/).filter((word) => word.length > 0).length}{" "}
            words
          </span>
        )}
      </Button>
    </div>
  );
}
