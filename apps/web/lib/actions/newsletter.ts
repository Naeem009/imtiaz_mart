"use server";

export async function newsletterAction(formData: FormData) {
  const email = formData.get("email");
  // TODO: integrate with marketing automation / CMS
  console.info("[newsletter] subscription:", email);
}
