import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import enTranslations from "@/i18n/locales/en.json";
import ptTranslations from "@/i18n/locales/pt.json";

let hasLoggedFallbackWarning = false;

function flattenObject(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  if (obj === null || Array.isArray(obj)) {
    return result;
  }

  if (typeof obj === 'object') {
    for (const key in obj) {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      Object.assign(result, flattenObject(obj[key], newPrefix));
    }
  } else {
    // Primitive value: add it to the result
    result[prefix] = String(obj);
  }

  return result;
}

export interface ContentTranslation {
  content_key: string;
  english_text: string;
  portuguese_text: string | null;
}

export function useContent(page?: string) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const { data: translations = [], isLoading, error } = useQuery({
    queryKey: ["content-translations", page, currentLanguage],
    queryFn: async () => {
      try {
        let query = supabase
          .from("content_translations")
          .select("*")
          .order("content_key");

        if (page) {
          query = query.eq("page", page);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching content translations:", error);
          
          // Check if it's a network/configuration error
          if (error.message?.includes("Failed to fetch") || error.message?.includes("ERR_NAME_NOT_RESOLVED")) {
            console.error("❌ Supabase connection failed. Please check your .env file:");
            console.error("   1. Ensure VITE_SUPABASE_URL is set to your actual Supabase project URL");
            console.error("   2. Ensure VITE_SUPABASE_PUBLISHABLE_KEY is set to your anon key");
            console.error("   3. Get your credentials from: https://supabase.com/dashboard/project/_/settings/api");
          }
          
          // Don't throw - return empty array to allow app to continue with fallbacks
          return [];
        }

        return (data || []) as ContentTranslation[];
      } catch (err) {
        console.error("Unexpected error in useContent:", err);
        // Return empty array instead of throwing to prevent app crash
        return [];
      }
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale to refetch on language change
    retry: 1, // Retry once on failure
  });

  const isFallback = translations.length === 0;

  // Create a content object with keys mapped to translated text
  const content = useMemo(() => {
    if (isFallback) {
      const selectedJSON = currentLanguage === "pt" ? ptTranslations : enTranslations;
      if (!hasLoggedFallbackWarning) {
        console.warn(`⚠️ Using fallback translations from JSON files. Supabase content_translations table is empty.
Run: SUPABASE_SERVICE_ROLE_KEY=... npm run migrate:db
Language: ${currentLanguage}`);
        hasLoggedFallbackWarning = true;
      }
      return flattenObject(selectedJSON);
    }

    const contentObj: Record<string, string> = {};

    translations.forEach((translation) => {
      const text =
        currentLanguage === "pt" && translation.portuguese_text
          ? translation.portuguese_text
          : translation.english_text;

      contentObj[translation.content_key] = text;
    });

    return contentObj;
  }, [translations, currentLanguage, isFallback]);

  return { content, isLoading, translations, isFallback };
}
