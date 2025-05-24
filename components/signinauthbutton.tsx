"use client";
import { signIn } from "next-auth/react";
import React from "react";
import { Button } from "./ui/button";

export default function SignInAuthButton() {
  return (
    <Button onClick={() => signIn("google")}>Sign In to Start Writing</Button>
  );
}
