"use server";

import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";

export async function newsletterAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    redirect("/?newsletter=error");
  }

  const res = await fetch(`${siteConfig.apiUrl}/newsletter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    redirect("/?newsletter=error");
  }

  redirect("/?newsletter=ok");
}
