import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Camera, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrintImageUploadProps {
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
  disabled?: boolean;
}

export function PrintImageUpload({ imageUrl, onImageChange, disabled }: PrintImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please select an image file', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image must be less than 5MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `print-${Date.now()}.${fileExt}`;
      const filePath = `prints/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      onImageChange(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: 'Error uploading image', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onImageChange(null);
  };

  if (imageUrl) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted">
        <img 
          src={imageUrl} 
          alt="Print photo" 
          className="w-full h-full object-cover"
        />
        {!disabled && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <label className={`
      flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed 
      border-border bg-muted/50 cursor-pointer hover:bg-muted transition-colors
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={disabled || uploading}
      />
      {uploading ? (
        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
      ) : (
        <>
          <Camera className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">Add photo</span>
        </>
      )}
    </label>
  );
}