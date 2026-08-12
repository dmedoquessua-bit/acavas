import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/security";
import { useAuth } from "@/hooks/useAuth";

export const TERMS_VERSION = "1.0";
export const COOKIE_STORAGE_KEY = "worscoi.cookie-consent.v1";

export type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export function readCookiePreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CookiePreferences) : null;
  } catch {
    return null;
  }
}

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(() => readCookiePreferences());

  const save = useCallback((prefs: Omit<CookiePreferences, "necessary">) => {
    const value: CookiePreferences = { necessary: true, ...prefs };
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(value));
    setPreferences(value);
    void logAudit("cookie_consent", { metadata: value as unknown as Record<string, unknown> });
    window.dispatchEvent(new CustomEvent("worscoi:cookie-consent", { detail: value }));
  }, []);

  return { preferences, decided: preferences !== null, save };
}

export function useTermsConsent() {
  const { user, loading: authLoading } = useAuth();
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (authLoading) return;
    if (!user) {
      setAccepted(null);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("user_consents")
        .select("terms_accepted, privacy_accepted, terms_version")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .maybeSingle();
      if (cancelled) return;
      setAccepted(
        !!data?.terms_accepted && !!data?.privacy_accepted && data?.terms_version === TERMS_VERSION,
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const accept = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("user_consents").upsert(
      {
        user_id: user.id,
        email: user.email ?? null,
        terms_accepted: true,
        privacy_accepted: true,
        terms_version: TERMS_VERSION,
        accepted_at: new Date().toISOString(),
        cookie_preferences: (readCookiePreferences() ?? {}) as never,
      },
      { onConflict: "user_id" },
    );
    setSaving(false);
    if (!error) {
      setAccepted(true);
      void logAudit("terms_accepted", { metadata: { version: TERMS_VERSION } });
    }
  }, [user]);

  return { needsAcceptance: !!user && accepted === false, accept, saving };
}
