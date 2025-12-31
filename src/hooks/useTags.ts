import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

export interface Tag {
  id: string;
  slug: string;
  name_en: string;
  name_pt: string;
  description_en: string | null;
  description_pt: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface TagInsert {
  slug: string;
  name_en: string;
  name_pt: string;
  description_en?: string | null;
  description_pt?: string | null;
  is_featured?: boolean;
}

async function fetchTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name_en", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }

  return data || [];
}

async function fetchProductTags(productId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("product_tags")
    .select("tag_id")
    .eq("product_id", productId);

  if (error) {
    throw new Error(`Failed to fetch product tags: ${error.message}`);
  }

  return data?.map((pt) => pt.tag_id) || [];
}

async function createTag(tag: TagInsert): Promise<Tag> {
  const { data, error } = await supabase
    .from("tags")
    .insert(tag)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create tag: ${error.message}`);
  }

  return data;
}

async function updateTag(id: string, tag: Partial<TagInsert>): Promise<Tag> {
  const { data, error } = await supabase
    .from("tags")
    .update(tag)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update tag: ${error.message}`);
  }

  return data;
}

async function deleteTag(id: string): Promise<void> {
  const { error } = await supabase.from("tags").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete tag: ${error.message}`);
  }
}

async function setProductTags(productId: string, tagIds: string[]): Promise<void> {
  // Delete existing tags for this product
  const { error: deleteError } = await supabase
    .from("product_tags")
    .delete()
    .eq("product_id", productId);

  if (deleteError) {
    throw new Error(`Failed to clear product tags: ${deleteError.message}`);
  }

  // Insert new tags
  if (tagIds.length > 0) {
    const inserts = tagIds.map((tagId) => ({
      product_id: productId,
      tag_id: tagId,
    }));

    const { error: insertError } = await supabase
      .from("product_tags")
      .insert(inserts);

    if (insertError) {
      throw new Error(`Failed to set product tags: ${insertError.message}`);
    }
  }
}

export function useTags() {
  return useQuery<Tag[], Error>({
    queryKey: ["tags"],
    queryFn: fetchTags,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useProductTags(productId: string | undefined) {
  return useQuery<string[], Error>({
    queryKey: ["product-tags", productId],
    queryFn: () => fetchProductTags(productId!),
    enabled: !!productId,
  });
}

export function useLocalizedTagName() {
  const { i18n } = useTranslation();
  const isPT = i18n.language?.startsWith("pt");

  return (tag: { name_en: string; name_pt: string }) => (isPT ? tag.name_pt : tag.name_en);
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tag }: { id: string; tag: Partial<TagInsert> }) =>
      updateTag(id, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useSetProductTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      tagIds,
    }: {
      productId: string;
      tagIds: string[];
    }) => setProductTags(productId, tagIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product-tags", variables.productId],
      });
    },
  });
}
