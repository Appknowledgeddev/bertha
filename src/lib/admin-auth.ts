import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseAuthClient } from "@/lib/supabase/server";

const ADMIN_COOKIE_NAME = "birtha_admin_session";
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

function getAdminSessionSecret() {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!sessionSecret) {
    throw new Error(
      "Admin auth is not configured yet. Add ADMIN_SESSION_SECRET to .env.local.",
    );
  }

  return sessionSecret;
}

function createSignature(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export async function authenticateAdminWithSupabase(
  email: string,
  password: string,
) {
  const supabase = createSupabaseAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user?.email) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email,
  };
}

export function buildAdminSessionValue(input: { id: string; email: string }) {
  const sessionSecret = getAdminSessionSecret();
  const payload = `${input.id}:${input.email.trim().toLowerCase()}:${Date.now()}`;
  const signature = createSignature(payload, sessionSecret);
  return `${payload}.${signature}`;
}

export function isAdminSessionValid(value?: string) {
  if (!value) {
    return false;
  }

  const sessionSecret = getAdminSessionSecret();
  const lastDotIndex = value.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return false;
  }

  const payload = value.slice(0, lastDotIndex);
  const signature = value.slice(lastDotIndex + 1);
  const expectedSignature = createSignature(payload, sessionSecret);
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  if (!timingSafeEqual(expectedBuffer, actualBuffer)) {
    return false;
  }

  const [storedUserId, storedEmail, timestampValue] = payload.split(":");

  if (!storedUserId || !storedEmail) {
    return false;
  }

  const timestamp = Number(timestampValue);

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  return Date.now() - timestamp < THIRTY_DAYS_IN_SECONDS * 1000;
}

export async function setAdminSessionCookie(sessionValue: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS_IN_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function requireAdminSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!isAdminSessionValid(sessionValue)) {
    redirect("/admin/login");
  }
}

export async function getIsAdminAuthenticated() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return isAdminSessionValid(sessionValue);
}
