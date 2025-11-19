import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

export interface ContentTranslation {
  content_key: string;
  english_text: string;
  portuguese_text: string | null;
}

export function useContent(page?: string) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const { data: translations = [], isLoading } = useQuery({
    queryKey: ["content-translations", page],
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
        throw error;
      }

      return data as ContentTranslation[];
    },
  });

  // Create a content object with keys mapped to translated text
  const content: Record<string, string> = {};
  
  translations.forEach((translation) => {
    const text =
      currentLanguage === "pt" && translation.portuguese_text
        ? translation.portuguese_text
        : translation.english_text;
    
    content[translation.content_key] = text;
  });

  return { content, isLoading, translations };
}
