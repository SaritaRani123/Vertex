"use client";

import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/auth";

export function useSessionUser() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }
        const data = (await res.json()) as SessionUser;
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
}
