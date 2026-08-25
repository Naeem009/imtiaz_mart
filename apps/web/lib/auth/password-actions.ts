"use server";

import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";

export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const res = await fetch(`${siteConfig.apiUrl}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    redirect("/forgot-password?error=Could not send reset instructions");
  }

  const data = (await res.json()) as { message?: string; resetUrl?: string };
  const params = new URLSearchParams({ sent: "1" });
  if (data.resetUrl) params.set("resetUrl", data.resetUrl);
  redirect(`/forgot-password?${params.toString()}`);
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token) {
    redirect("/reset-password?error=Missing reset token");
  }
  if (password !== confirm) {
    redirect(
      `/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent("Passwords do not match")}`,
    );
  }

  const res = await fetch(`${siteConfig.apiUrl}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message =
      (err as { message?: string | string[] }).message;
    const text = Array.isArray(message)
      ? message[0]
      : message ?? "This reset link is invalid or has expired";
    redirect(
      `/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent(text)}`,
    );
  }

  redirect(
    `/login?notice=${encodeURIComponent("Password updated. Sign in with your new password.")}`,
  );
}