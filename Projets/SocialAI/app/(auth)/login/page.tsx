import type { Metadata } from "next";
import { Suspense } from "react";
import { isGoogleEnabled } from "@/lib/auth";
import { AuthPortal } from "../auth-portal";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <Suspense>
      <AuthPortal googleEnabled={isGoogleEnabled} initialMode="login" />
    </Suspense>
  );
}
