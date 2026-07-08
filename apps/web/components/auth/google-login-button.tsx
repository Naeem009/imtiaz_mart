"use client";

import { useEffect, useState, useTransition } from "react";
import { googleLoginAction } from "@/lib/auth/actions";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            ux_mode?: "popup" | "redirect";
          }) => void;
          renderButton: (
            element: HTMLElement | null,
            options: {
              theme?: "outline" | "filled_blue";
              size?: "large" | "medium" | "small";
              text?: string;
              shape?: string;
              logo_alignment?: string;
            },
          ) => void;
        };
      };
    };
  }
}

interface GoogleLoginButtonProps {
  redirect?: string;
}

export function GoogleLoginButton({ redirect = "/account" }: GoogleLoginButtonProps) {
  const [isReady, setIsReady] = useState(false);
  const [isPending, startTransition] = useTransition();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          ux_mode: "popup",
        });
        setIsReady(true);
      }
    };

    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [clientId]);

  useEffect(() => {
    if (!isReady || !window.google?.accounts?.id) return;

    const container = document.getElementById("google-signin-button");
    if (!container) return;

    window.google.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      logo_alignment: "left",
    });
  }, [isReady]);

  const handleCredentialResponse = (response: { credential: string }) => {
    const formData = new FormData();
    formData.append("idToken", response.credential);
    formData.append("redirect", redirect);

    startTransition(() => {
      void googleLoginAction(formData);
    });
  };

  if (!clientId) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div id="google-signin-button" className="flex justify-center" />
      {isPending && <p className="text-center text-sm text-muted">Signing you in…</p>}
    </div>
  );
}
