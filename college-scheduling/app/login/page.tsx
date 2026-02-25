"use client";

import { useSearchParams } from "next/navigation";
import { AuthPanels } from "@/components/AuthPanels";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const initialMode = mode === "signup" ? "signup" : "signin";

  return <AuthPanels initialMode={initialMode} />;
}
