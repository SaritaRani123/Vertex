"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const ACCENT = "#4C1D95"; /* dark purple - violet-900 */

type Mode = "signin" | "signup";

interface AuthPanelsProps {
  initialMode?: Mode;
}

export function AuthPanels({ initialMode = "signin" }: AuthPanelsProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const registered = searchParams.get("registered") === "1";

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email: signInEmail,
      password: signInPassword,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid credentials");
      return;
    }
    if (res?.url) window.location.href = res.url;
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (signUpPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signUpEmail,
          password: signUpPassword,
          name: signUpName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign up failed");
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl shadow-xl"
        style={{ minHeight: 480 }}
      >
        {/* Sliding track: [Hello | Sign up form | Sign in form | Welcome] - each panel 50% of card */}
        <div
          className="flex h-full min-h-[480px] shrink-0 transition-transform duration-500 ease-in-out"
          style={{
            width: "200%",
            transform: mode === "signup" ? "translateX(0)" : "translateX(-50%)",
          }}
        >
          {/* Panel 1: Hello Friend (left, purple) - shown with Sign up form */}
          <div
            className="flex shrink-0 flex-col items-center justify-center px-12 py-8 text-center"
            style={{ background: ACCENT, flex: "0 0 25%" }}
          >
            <h2 className="text-3xl font-bold text-white">Hello, Friend!</h2>
            <p className="mt-4 text-white/90">
              Enter your personal details and start your journey with us
            </p>
          </div>

          {/* Panel 2: Sign up form (right, white) - shown with Hello */}
          <div className="flex shrink-0 flex-col justify-center bg-white px-12 py-8" style={{ flex: "0 0 25%" }}>
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              or use your email for registration
            </p>
            <form onSubmit={handleSignUp} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="sr-only">
                  Name
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Name"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  className="border-gray-300 bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="sr-only">
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="border-gray-300 bg-gray-50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="sr-only">
                  Password
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="border-gray-300 bg-gray-50"
                  required
                  minLength={6}
                />
              </div>
              {error && mode === "signup" && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full font-semibold uppercase"
                style={{ background: ACCENT }}
                disabled={loading}
              >
                {loading && mode === "signup" ? "Creating account..." : "SIGN UP"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-medium text-[#4C1D95] hover:underline"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                  }}
                >
                  Sign in
                </button>
              </p>
            </form>
          </div>

          {/* Panel 3: Sign in form (left, white) - shown with Welcome */}
          <div className="flex shrink-0 flex-col justify-center bg-white px-12 py-8" style={{ flex: "0 0 25%" }}>
            <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              or use your account
            </p>
            <form onSubmit={handleSignIn} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="sr-only">
                  Email
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="border-gray-300 bg-gray-50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password" className="sr-only">
                  Password
                </Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="border-gray-300 bg-gray-50"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="cursor-default">Forgot your password?</span>
              </p>
              {error && mode === "signin" && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              {registered && mode === "signin" && (
                <p className="text-sm text-green-600">
                  Account created. Sign in below.
                </p>
              )}
              <Button
                type="submit"
                className="w-full font-semibold uppercase"
                style={{ background: ACCENT }}
                disabled={loading}
              >
                {loading && mode === "signin" ? "Signing in..." : "SIGN IN"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="font-medium text-[#4C1D95] hover:underline"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                >
                  Sign up
                </button>
              </p>
            </form>
          </div>

          {/* Panel 4: Welcome Back (right, purple) - shown with Sign in form */}
          <div
            className="flex shrink-0 flex-col items-center justify-center px-12 py-8 text-center"
            style={{ background: ACCENT, flex: "0 0 25%" }}
          >
            <h2 className="text-3xl font-bold text-white">Welcome Back!</h2>
            <p className="mt-4 text-white/90">
              To keep connected with us please login with your personal info
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
