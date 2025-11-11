import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GenerateFormProps {
  onGenerate: () => void;
}

const GenerateForm = ({ onGenerate }: GenerateFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [category, setCategory] = useState("custom");
  const [material, setMaterial] = useState("PLA");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [depth, setDepth] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in");
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
        body: { prompt, designId: design.id },
      });

      if (error) throw error;

      toast.success("3D model generation started!");
      setPrompt("");
      onGenerate();
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to start generation");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-border/50 backdrop-blur-sm bg-card/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Generate 3D Model
        </CardTitle>
        <CardDescription>
          Describe the 3D model you want to create. Be specific about details, dimensions, and purpose.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory} disabled={isGenerating}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="car_parts">Car Parts</SelectItem>
              <SelectItem value="home_decorations">Home Decorations</SelectItem>
              <SelectItem value="custom">Custom Design</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">Design Description</Label>
          <Textarea
            id="prompt"
            placeholder="Example: A front bumper for a 2020 Honda Civic, with mounting holes for standard headlights..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="material">Material Type</Label>
            <Select value={material} onValueChange={setMaterial} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLA">PLA (Standard)</SelectItem>
                <SelectItem value="ABS">ABS (Durable)</SelectItem>
                <SelectItem value="PETG">PETG (Strong)</SelectItem>
                <SelectItem value="TPU">TPU (Flexible)</SelectItem>
                <SelectItem value="Nylon">Nylon (Industrial)</SelectItem>
                <SelectItem value="Resin">Resin (High Detail)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Dimensions (mm) - Optional</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                placeholder="Width"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                disabled={isGenerating}
              />
              <Input
                type="number"
                placeholder="Height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                disabled={isGenerating}
              />
              <Input
                type="number"
                placeholder="Depth"
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
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Model...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Model
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GenerateForm;
