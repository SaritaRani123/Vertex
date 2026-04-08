import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

type Provider = "google" | "github";

const OAUTH_STATE_COOKIE = "programs_oauth_state";
const OAUTH_RETURN_TO_COOKIE = "programs_oauth_return_to";

function normalizeProvider(value: string): Provider | null {
  if (value === "google" || value === "github") return value;
  return null;
}

function safeReturnTo(value: string | null): string {
  if (!value) return "/dashboard";
  if (!value.startsWith("/")) return "/dashboard";
  if (value.startsWith("//")) return "/dashboard";
  return value;
}

function getBaseUrl(request: NextRequest): string {
  const appUrl = process.env.APP_URL?.trim();
  if (appUrl) return appUrl.replace(/\/$/, "");
  return request.nextUrl.origin;
}

function missingProviderConfig(provider: Provider): boolean {
  if (provider === "google") {
    return !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET;
  }
  return !process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: providerParam } = await params;
  const provider = normalizeProvider(providerParam);
  const returnTo = safeReturnTo(request.nextUrl.searchParams.get("returnTo"));

  if (!provider) {
    return NextResponse.redirect(new URL("/sign-in.html?error=Unsupported+provider", request.url));
  }
  if (missingProviderConfig(provider)) {
    return NextResponse.redirect(
      new URL(`/sign-in.html?error=${provider}+oauth+is+not+configured`, request.url)
    );
  }

  const state = randomBytes(24).toString("hex");
  const redirectUri = `${getBaseUrl(request)}/api/auth/oauth/${provider}/callback`;

  const authUrl = new URL(
    provider === "google"
      ? "https://accounts.google.com/o/oauth2/v2/auth"
      : "https://github.com/login/oauth/authorize"
  );

  if (provider === "google") {
    authUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("prompt", "select_account");
  } else {
    authUrl.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID!);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", "read:user user:email");
    authUrl.searchParams.set("state", state);
  }

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, `${provider}:${state}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  response.cookies.set(OAUTH_RETURN_TO_COOKIE, returnTo, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
