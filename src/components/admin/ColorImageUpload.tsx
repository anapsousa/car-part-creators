import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface ColorImageUploadProps {
  /** Current image URL */
  imageUrl?: string;
  /** Callback when image is uploaded or removed */
  onChange: (imageUrl: string | undefined) => void;
  /** Color name for alt text */
  colorName: string;
  /** Hex color for fallback display */
  hexColor?: string;
  /** Size variant */
  size?: "sm" | "md";
}

/**
 * Compact image upload component for color variant images
 * Uses the same storage bucket as product images (design-files)
 */
export function ColorImageUpload({ 
  imageUrl, 
  onChange, 
  colorName,
  hexColor,
  size = "sm" 
}: ColorImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `color-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `color-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('design-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('design-files')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: t("admin.colors.image.invalidType"),
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t("admin.colors.image.tooLarge"),
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast({
        title: t("admin.colors.image.uploaded"),
      });
    } catch (error) {
      console.error("Error uploading color image:", error);
      toast({
        title: t("admin.colors.image.uploadFailed"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset input so the same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  const handleClick = () => {
    if (!uploading) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className={cn(
          sizeClasses[size],
          "rounded-lg border-2 border-dashed transition-all",
          "flex items-center justify-center overflow-hidden",
          "hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          imageUrl ? "border-border" : "border-muted-foreground/30",
          uploading && "opacity-50 cursor-wait"
        )}
        style={!imageUrl && hexColor ? { backgroundColor: hexColor } : undefined}
        title={imageUrl 
          ? t("admin.colors.image.change") 
          : t("admin.colors.image.upload")
        }
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt={colorName} 
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
        )}
      </button>

      {/* Remove button */}
      {imageUrl && !uploading && (
        <button
          type="button"
          onClick={handleRemove}
          className={cn(
            "absolute -top-1 -right-1 p-0.5 rounded-full",
            "bg-destructive text-destructive-foreground",
            "hover:bg-destructive/90 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-destructive"
          )}
          title={t("admin.colors.image.remove")}
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
