/**
 * Codevertex SSO (auth-api) helpers — Phase 1c, ADDITIVE / DUAL-RUN.
 *
 * This module implements the minimal PKCE authorization-code flow against the
 * central SSO (auth-api). It is layered ALONGSIDE the existing local
 * email/password login — none of the local-login code is touched. The proven
 * pattern is mirrored from pos-service/pos-ui (src/lib/auth/{pkce,api}.ts).
 *
 * Tokens obtained here are written into the SAME storage keys the existing
 * api-client + middleware already read ("auth-token" / "refresh-token" +
 * cookies), so the rest of the app works unchanged for both session types.
 */

export const SSO_BASE_URL =
  process.env.NEXT_PUBLIC_SSO_URL || "https://sso.codevertexitsolutions.com";

export const SSO_CLIENT_ID =
  process.env.NEXT_PUBLIC_SSO_CLIENT_ID || "isp-billing-ui";

export const SSO_SCOPE =
  process.env.NEXT_PUBLIC_SSO_SCOPE || "openid profile email offline_access";

/** Marks the active session as SSO-issued so refresh routes to SSO, not the local backend. */
export const SSO_SESSION_FLAG = "auth-source-sso";
/** sessionStorage keys for the in-flight PKCE handshake. */
const PKCE_VERIFIER_KEY = "isp_pkce_verifier";
const PKCE_STATE_KEY = "isp_pkce_state";
const SSO_RETURN_TO_KEY = "isp_sso_return_to";

// ── PKCE primitives (mirrors pos-ui/src/lib/auth/pkce.ts) ──────────────────

function b64urlEncode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode.apply(null, Array.from(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return b64urlEncode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const hash = await window.crypto.subtle.digest("SHA-256", data);
  return b64urlEncode(new Uint8Array(hash));
}

export function generateState(): string {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return b64urlEncode(array);
}

// ── Handshake storage helpers ──────────────────────────────────────────────

export function storeVerifier(verifier: string): void {
  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
}
export function consumeVerifier(): string | null {
  const v = sessionStorage.getItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  return v;
}
export function storeState(state: string): void {
  sessionStorage.setItem(PKCE_STATE_KEY, state);
}
export function consumeState(): string | null {
  const s = sessionStorage.getItem(PKCE_STATE_KEY);
  sessionStorage.removeItem(PKCE_STATE_KEY);
  return s;
}
export function storeReturnTo(path: string): void {
  sessionStorage.setItem(SSO_RETURN_TO_KEY, path);
}
export function consumeReturnTo(): string | null {
  const p = sessionStorage.getItem(SSO_RETURN_TO_KEY);
  sessionStorage.removeItem(SSO_RETURN_TO_KEY);
  return p;
}

/** The redirect URI registered for this client (origin-derived so dev + prod both work). */
export function getRedirectUri(): string {
  return `${window.location.origin}/auth/callback`;
}

// ── SSO endpoints ───────────────────────────────────────────────────────────

export interface SSOTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

/**
 * Build the SSO /authorize URL and begin the PKCE handshake.
 * Generates verifier/challenge/state, persists the verifier+state, then returns
 * the URL the caller should navigate to.
 */
export async function buildAuthorizeUrl(
  returnTo?: string,
  opts?: { screenHint?: "signup" | "login" },
): Promise<string> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();

  storeVerifier(verifier);
  storeState(state);
  if (returnTo) storeReturnTo(returnTo);

  const url = new URL("/api/v1/authorize", SSO_BASE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", SSO_CLIENT_ID);
  url.searchParams.set("redirect_uri", getRedirectUri());
  url.searchParams.set("scope", SSO_SCOPE);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  // A "signup" hint routes new users to the SSO signup wizard (auth-api honours
  // prompt=create / screen_hint=signup). The PKCE verifier is stored on THIS
  // origin above, so the post-signup authorize redirect lands back on our
  // /auth/callback with a code we can exchange.
  if (opts?.screenHint === "signup") {
    url.searchParams.set("prompt", "create");
    url.searchParams.set("screen_hint", "signup");
  }
  return url.toString();
}

/** Start the SSO login by redirecting the browser to the authorize endpoint. */
export async function startSSOLogin(returnTo?: string): Promise<void> {
  const authorizeUrl = await buildAuthorizeUrl(returnTo);
  window.location.href = authorizeUrl;
}

/**
 * Start the SSO sign-up flow. Mirrors startSSOLogin but asks the SSO to show the
 * signup wizard first. After signup → login the flow returns here via the OIDC
 * authorize redirect, so a brand-new ISP provider lands straight on their
 * dashboard with a session — no manual "go back to the service" step.
 */
export async function startSSOSignup(returnTo?: string): Promise<void> {
  const authorizeUrl = await buildAuthorizeUrl(returnTo, { screenHint: "signup" });
  window.location.href = authorizeUrl;
}

/** Exchange an authorization code for tokens (PKCE — confidential secret not required). */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<SSOTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri(),
    client_id: SSO_CLIENT_ID,
    code_verifier: codeVerifier,
  });

  const response = await fetch(`${SSO_BASE_URL}/api/v1/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error_description || err.error || "SSO token exchange failed"
    );
  }
  return response.json();
}

/** Refresh an SSO-issued access token against the SSO refresh endpoint. */
export async function refreshSSOTokens(
  refreshToken: string
): Promise<SSOTokenResponse> {
  const response = await fetch(`${SSO_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refresh_token: refreshToken,
      client_id: SSO_CLIENT_ID,
    }),
  });
  if (!response.ok) throw new Error("SSO token refresh failed");
  return response.json();
}

/**
 * Persist SSO tokens into the SAME storage the api-client + middleware read.
 * This is what makes both local and SSO sessions look identical to the rest of
 * the app (Authorization header attachment is unchanged). Also stamps the
 * SSO_SESSION_FLAG so the refresh path knows to use the SSO endpoint.
 */
export function persistSSOSession(tokens: SSOTokenResponse): void {
  if (typeof window === "undefined") return;
  const accessToken = tokens.access_token;
  const refreshToken = tokens.refresh_token || "";

  localStorage.setItem("auth-token", accessToken);
  if (refreshToken) localStorage.setItem("refresh-token", refreshToken);
  localStorage.setItem(SSO_SESSION_FLAG, "1");

  if (typeof document !== "undefined") {
    document.cookie = `auth-token=${accessToken}; path=/; max-age=${
      7 * 24 * 60 * 60
    }; SameSite=Lax`;
    if (refreshToken) {
      document.cookie = `refresh-token=${refreshToken}; path=/; max-age=${
        30 * 24 * 60 * 60
      }; SameSite=Lax`;
    }
  }
}

/** True when the active session was issued by the central SSO (vs local login). */
export function isSSOSession(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SSO_SESSION_FLAG) === "1";
}
