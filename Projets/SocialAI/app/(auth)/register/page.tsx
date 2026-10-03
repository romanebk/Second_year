import type { Metadata } from "next";
import { Suspense } from "react";
import { isGoogleEnabled } from "@/lib/auth";
import { AuthPortal } from "../auth-portal";

export const metadata: Metadata = { title: "Inscription" };

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthPortal googleEnabled={isGoogleEnabled} initialMode="signup" />
    </Suspense>
  );
}
