import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, hashPassword, setSessionCookie } from "@/lib/auth";

type Provider = "google" | "github";

const OAUTH_STATE_COOKIE = "programs_oauth_state";
const OAUTH_RETURN_TO_COOKIE = "programs_oauth_return_to";

type OAuthIdentity = {
  email: string;
  name: string;
};

function normalizeProvider(value: string): Provider | null {
  if (value === "google" || value === "github") return value;
  return null;
}

function clearOauthCookies(response: NextResponse) {
  response.cookies.set(OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(OAUTH_RETURN_TO_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

function safeReturnTo(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function getBaseUrl(request: NextRequest): string {
  const appUrl = process.env.APP_URL?.trim();
  if (appUrl) return appUrl.replace(/\/$/, "");
  return request.nextUrl.origin;
}

async function exchangeGoogleCode(code: string, redirectUri: string): Promise<string> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) throw new Error("Failed to exchange Google code");
  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) throw new Error("Google access token missing");
  return tokenData.access_token;
}

async function fetchGoogleIdentity(accessToken: string): Promise<OAuthIdentity> {
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!profileRes.ok) throw new Error("Failed to fetch Google profile");
  const profile = (await profileRes.json()) as {
    email?: string;
    name?: string;
    given_name?: string;
  };
  const email = profile.email?.trim().toLowerCase();
  if (!email) throw new Error("Google account email is unavailable");
  return {
    email,
    name: profile.name?.trim() || profile.given_name?.trim() || email.split("@")[0],
  };
}

async function exchangeGithubCode(code: string, redirectUri: string): Promise<string> {
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!tokenRes.ok) throw new Error("Failed to exchange GitHub code");
  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) throw new Error("GitHub access token missing");
  return tokenData.access_token;
}

async function fetchGithubIdentity(accessToken: string): Promise<OAuthIdentity> {
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "programs-scheduling-app",
    },
  });
  if (!userRes.ok) throw new Error("Failed to fetch GitHub profile");
  const user = (await userRes.json()) as { name?: string; login?: string; email?: string | null };

  let email = user.email?.trim().toLowerCase();
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "programs-scheduling-app",
      },
    });
    if (!emailsRes.ok) throw new Error("Failed to fetch GitHub email");
    const emails = (await emailsRes.json()) as Array<{
      email: string;
      primary: boolean;
      verified: boolean;
    }>;
    const primaryVerified = emails.find((e) => e.primary && e.verified);
    const anyVerified = emails.find((e) => e.verified);
    email = (primaryVerified ?? anyVerified)?.email?.trim().toLowerCase();
  }

  if (!email) throw new Error("GitHub account email is unavailable");

  return {
    email,
    name: user.name?.trim() || user.login?.trim() || email.split("@")[0],
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: providerParam } = await params;
  const provider = normalizeProvider(providerParam);

  if (!provider) {
    return NextResponse.redirect(new URL("/sign-in.html?error=Unsupported+provider", request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const returnTo = safeReturnTo(request.cookies.get(OAUTH_RETURN_TO_COOKIE)?.value);

  if (!code || !state || storedState !== `${provider}:${state}`) {
    const response = NextResponse.redirect(new URL("/sign-in.html?error=OAuth+validation+failed", request.url));
    clearOauthCookies(response);
    return response;
  }

  try {
    const redirectUri = `${getBaseUrl(request)}/api/auth/oauth/${provider}/callback`;
    const identity =
      provider === "google"
        ? await fetchGoogleIdentity(await exchangeGoogleCode(code, redirectUri))
        : await fetchGithubIdentity(await exchangeGithubCode(code, redirectUri));

    let user = await prisma.programsUsers.findUnique({ where: { Email: identity.email } });

    if (!user) {
      const usersCount = await prisma.programsUsers.count();
      user = await prisma.programsUsers.create({
        data: {
          Name: identity.name,
          Email: identity.email,
          PasswordHash: hashPassword(randomBytes(32).toString("hex")),
          Role: usersCount === 0 ? "ADMIN" : "STAFF",
        },
      });
    }

    if (!user.IsActive) {
      const response = NextResponse.redirect(new URL("/sign-in.html?error=Account+is+inactive", request.url));
      clearOauthCookies(response);
      return response;
    }

    const token = await createSession(user.Id);
    const response = NextResponse.redirect(new URL(returnTo, request.url));
    clearOauthCookies(response);
    setSessionCookie(response, token);
    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/sign-in.html?error=OAuth+sign+in+failed", request.url));
    clearOauthCookies(response);
    return response;
  }
}
