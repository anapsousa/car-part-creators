import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

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
        
        throw error;
      }

      return data as ContentTranslation[];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale to refetch on language change
    retry: false, // Don't retry on network errors to avoid spam
  });

  // Create a content object with keys mapped to translated text
  const content = useMemo(() => {
    const contentObj: Record<string, string> = {};

    translations.forEach((translation) => {
      const text =
        currentLanguage === "pt" && translation.portuguese_text
          ? translation.portuguese_text
          : translation.english_text;

      contentObj[translation.content_key] = text;
    });

    return contentObj;
  }, [translations, currentLanguage]);

  return { content, isLoading, translations };
}
