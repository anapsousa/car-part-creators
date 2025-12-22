import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles, Upload, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useContent } from "@/hooks/useContent";
import { getReferenceImageUrl } from "@/lib/storage";

interface GenerateFormProps {
  onGenerate: () => void;
}

const GenerateForm = ({ onGenerate }: GenerateFormProps) => {
  const { content } = useContent("generator");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [category, setCategory] = useState("custom");
  const [material, setMaterial] = useState("PLA");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [depth, setDepth] = useState("");
  const [referenceImages, setReferenceImages] = useState<{ path: string; displayUrl: string }[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (referenceImages.length + files.length > 3) {
      toast.error(content["generator.form.error_max_images"] || "You can only upload up to 3 reference images");
      return;
    }

    setUploadingImages(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to upload images");
        return;
      }

      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        // Use user ID folder for RLS compliance
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('user-references')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get signed URL for display
        const signedUrl = await getReferenceImageUrl(filePath);

        return { path: filePath, displayUrl: signedUrl || '' };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setReferenceImages([...referenceImages, ...uploadedImages.filter(img => img.displayUrl)]);
      toast.success(content["generator.form.success_images_uploaded"] || "Reference images uploaded");
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error(content["generator.form.error_upload_failed"] || "Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error(content["generator.form.error_empty_prompt"] || "Please enter a prompt");
      return;
    }

    setIsGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error(content["generator.form.error_not_logged_in"] || "You must be logged in");
        return;
      }

      // Create design record
      const { data: design, error: designError } = await supabase
        .from("designs")
        .insert({
          user_id: user.id,
          prompt_text: prompt,
          status: "generating",
          category,
          material,
          width: width ? parseFloat(width) : null,
          height: height ? parseFloat(height) : null,
          depth: depth ? parseFloat(depth) : null,
        })
        .select()
        .single();

      if (designError) throw designError;

      // Call edge function for AI generation
      const { data, error } = await supabase.functions.invoke("generate-model", {
        body: { 
          prompt, 
          designId: design.id,
          referenceImages: referenceImages.length > 0 ? referenceImages.map(img => img.path) : undefined
        },
      });

      if (error) {
        // Check error codes
        if (data?.code === "INSUFFICIENT_CREDITS") {
          toast.error(content["generator.form.error_insufficient_credits"] || "You don't have enough credits. Please purchase more to continue.", {
            duration: 5000,
            action: {
              label: content["generator.form.action_buy_credits"] || "Buy Credits",
              onClick: () => window.location.href = "/dashboard?tab=credits"
            }
          });
          return;
        }
        if (data?.code === "SERVICE_UNAVAILABLE") {
          toast.error(content["generator.form.error_service_unavailable"] || "Service temporarily unavailable. Your credit has been refunded.");
          return;
        }
        throw error;
      }

      toast.success(content["generator.form.success_generation_started"] || "3D model generation started!");
      setPrompt("");
      setReferenceImages([]);
      onGenerate();
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || (content["generator.form.error_generation_failed"] || "Failed to start generation"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-border/50 backdrop-blur-sm bg-card/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {content["generator.form.card_title"] || "Generate 3D Model"}
        </CardTitle>
        <CardDescription>
          {content["generator.form.card_description"] || "Describe the 3D model you want to create. Be specific about details, dimensions, and purpose."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="category">{content["generator.form.category_label"] || "Category"}</Label>
          <Select value={category} onValueChange={setCategory} disabled={isGenerating}>
            <SelectTrigger>
              <SelectValue placeholder={content["generator.form.category_placeholder"] || "Select category"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="car_parts">{content["generator.form.category_car_parts"] || "Car Parts"}</SelectItem>
              <SelectItem value="home_decorations">{content["generator.form.category_home_decorations"] || "Home Decorations"}</SelectItem>
              <SelectItem value="custom">{content["generator.form.category_custom"] || "Custom Design"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">{content["generator.form.description_label"] || "Design Description"}</Label>
          <Textarea
            id="prompt"
            placeholder={content["generator.form.description_placeholder"] || "Example: A front bumper for a 2020 Honda Civic, with mounting holes for standard headlights..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label>{content["generator.form.reference_images_label"] || "Reference Images (Optional)"}</Label>
          <p className="text-xs text-muted-foreground mb-2">{content["generator.form.reference_images_help"] || "Upload up to 3 reference images to guide the AI generation"}</p>
          <div className="grid grid-cols-3 gap-3">
            {referenceImages.map((img, index) => (
              <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
                <img src={img.displayUrl} alt={`Reference ${index + 1}`} className="w-full h-full object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                  disabled={isGenerating}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {referenceImages.length < 3 && (
              <label className="aspect-square bg-muted rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex items-center justify-center transition-colors">
                <div className="text-center">
                  {uploadingImages ? (
                    <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <ImageIcon className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{content["generator.form.upload_button"] || "Upload"}</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={isGenerating || uploadingImages}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="material">{content["generator.form.material_label"] || "Material Type"}</Label>
            <Select value={material} onValueChange={setMaterial} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue placeholder={content["generator.form.material_placeholder"] || "Select material"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLA">{content["generator.form.material_pla"] || "PLA (Standard)"}</SelectItem>
                <SelectItem value="ABS">{content["generator.form.material_abs"] || "ABS (Durable)"}</SelectItem>
                <SelectItem value="PETG">{content["generator.form.material_petg"] || "PETG (Strong)"}</SelectItem>
                <SelectItem value="TPU">{content["generator.form.material_tpu"] || "TPU (Flexible)"}</SelectItem>
                <SelectItem value="Nylon">{content["generator.form.material_nylon"] || "Nylon (Industrial)"}</SelectItem>
                <SelectItem value="Resin">{content["generator.form.material_resin"] || "Resin (High Detail)"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{content["generator.form.dimensions_label"] || "Dimensions (mm) - Optional"}</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                placeholder={content["generator.form.dimension_width"] || "Width"}
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                disabled={isGenerating}
              />
              <Input
                type="number"
                placeholder={content["generator.form.dimension_height"] || "Height"}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                disabled={isGenerating}
              />
              <Input
                type="number"
                placeholder={content["generator.form.dimension_depth"] || "Depth"}
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full shadow-glow-yellow"
          size="lg"
          variant="tertiary"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {content["generator.form.button_generating"] || "Generating Model..."}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              {content["generator.form.button_generate"] || "Generate Model"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GenerateForm;
