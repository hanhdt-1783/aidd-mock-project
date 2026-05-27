"use client";

import { useFormStatus } from "react-dom";
import { t, type Language } from "@/lib/i18n/dictionary";
import { signInWithGoogle } from "../actions";
import GoogleLoginButton from "./google-login-button";

function SubmitButton({ lang }: { lang: Language }) {
  const { pending } = useFormStatus();
  return (
    <GoogleLoginButton
      pending={pending}
      label={pending ? t(lang, "login.button.loading") : t(lang, "login.button.google")}
    />
  );
}

export default function LoginActions({ lang }: { lang: Language }) {
  return (
    <form action={signInWithGoogle} className="inline-block">
      <SubmitButton lang={lang} />
    </form>
  );
}
