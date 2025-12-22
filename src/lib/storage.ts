import { supabase } from "@/integrations/supabase/client";

/**
 * Storage utility functions for handling signed URLs and file paths
 */

// Check if a URL is a legacy public URL or a new file path
export const isFilePath = (urlOrPath: string | null): boolean => {
  if (!urlOrPath) return false;
  // File paths don't start with http/https
  return !urlOrPath.startsWith('http://') && !urlOrPath.startsWith('https://');
};

// Check if URL is a valid file (not example.com placeholder)
export const isFileAvailable = (urlOrPath: string | null): boolean => {
  if (!urlOrPath) return false;
  if (urlOrPath.includes('example.com')) return false;
  return true;
};

/**
 * Get a signed URL for a file in a private bucket
 * @param bucket - The storage bucket name
 * @param filePath - The file path within the bucket
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Signed URL or null if error
 */
export const getSignedUrl = async (
  bucket: string,
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data?.signedUrl || null;
  } catch (error) {
    console.error('Error in getSignedUrl:', error);
    return null;
  }
};

/**
 * Get a signed URL for a user design file
 * Handles both legacy public URLs and new file paths
 */
export const getDesignFileUrl = async (
  urlOrPath: string | null
): Promise<string | null> => {
  if (!urlOrPath || !isFileAvailable(urlOrPath)) return null;

  // Legacy public URL - return as-is
  if (!isFilePath(urlOrPath)) {
    return urlOrPath;
  }

  // New file path - generate signed URL
  return getSignedUrl('user-designs', urlOrPath);
};

/**
 * Get a signed URL for a calculator print image
 * Handles both legacy public URLs and new file paths
 */
export const getCalcPrintImageUrl = async (
  urlOrPath: string | null
): Promise<string | null> => {
  if (!urlOrPath || !isFileAvailable(urlOrPath)) return null;

  // Legacy public URL - return as-is
  if (!isFilePath(urlOrPath)) {
    return urlOrPath;
  }

  // New file path - generate signed URL
  return getSignedUrl('calc-prints', urlOrPath);
};

/**
 * Get a signed URL for a reference image
 * Handles both legacy public URLs and new file paths
 */
export const getReferenceImageUrl = async (
  urlOrPath: string | null
): Promise<string | null> => {
  if (!urlOrPath || !isFileAvailable(urlOrPath)) return null;

  // Legacy public URL - return as-is
  if (!isFilePath(urlOrPath)) {
    return urlOrPath;
  }

  // New file path - generate signed URL
  return getSignedUrl('user-references', urlOrPath);
};
