import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Download, Loader2, FileText, Clock, Heart, Eye, Filter } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import ModelViewer from "./ModelViewer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Design {
  id: string;
  prompt_text: string;
  status: string;
  stl_file_url: string | null;
  blend_file_url: string | null;
  created_at: string;
  category: string;
  material: string | null;
  width: number | null;
  height: number | null;
  depth: number | null;
  is_favorited: boolean;
}

interface DesignHistoryProps {
  refreshTrigger: number;
}

const DesignHistory = ({ refreshTrigger }: DesignHistoryProps) => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [previewDesign, setPreviewDesign] = useState<Design | null>(null);

  useEffect(() => {
    fetchDesigns();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('designs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'designs'
        },
        (payload) => {
          console.log('Design updated:', payload);
          fetchDesigns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categoryFilter, refreshTrigger]);

  const fetchDesigns = async () => {
    try {
      let query = supabase
        .from("designs")
        .select("*")
        .order("created_at", { ascending: false });

      if (categoryFilter !== "all") {
        if (categoryFilter === "favorites") {
          query = query.eq("is_favorited", true);
        } else {
          query = query.eq("category", categoryFilter);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setDesigns(data || []);
    } catch (error: any) {
      console.error("Error fetching designs:", error);
      toast.error("Failed to load designs");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (designId: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from("designs")
        .update({ is_favorited: !currentFavorite })
        .eq("id", designId);

      if (error) throw error;
      
      toast.success(currentFavorite ? "Removed from favorites" : "Added to favorites");
      fetchDesigns();
    } catch (error: any) {
      console.error("Error updating favorite:", error);
      toast.error("Failed to update favorite");
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-primary/20 text-primary border-primary/50">Completed</Badge>;
      case "generating":
        return <Badge className="bg-accent/20 text-accent border-accent/50">Generating</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 backdrop-blur-sm bg-card/95">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/50 backdrop-blur-sm bg-card/95">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Your Designs
              </CardTitle>
              <CardDescription>
                View and download your generated 3D models
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="favorites">
                <Heart className="h-4 w-4 mr-1" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="car_parts">Car Parts</TabsTrigger>
              <TabsTrigger value="home_decorations">Home Decor</TabsTrigger>
            </TabsList>
          </Tabs>

          {designs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {categoryFilter === "all" 
                ? "No designs yet. Create your first 3D model above!"
                : `No ${categoryFilter === "favorites" ? "favorite" : categoryFilter.replace("_", " ")} designs yet.`
              }
            </div>
          ) : (
            designs.map((design) => (
              <Card key={design.id} className="border-border/30">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-2">
                          <p className="text-sm font-medium line-clamp-2 flex-1">
                            {design.prompt_text}
                          </p>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 shrink-0"
                            onClick={() => toggleFavorite(design.id, design.is_favorited)}
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                design.is_favorited
                                  ? "fill-destructive text-destructive"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {design.category.replace("_", " ")}
                          </Badge>
                          {design.material && (
                            <Badge variant="secondary" className="text-xs">
                              {design.material}
                            </Badge>
                          )}
                          {(design.width || design.height || design.depth) && (
                            <Badge variant="secondary" className="text-xs">
                              {[design.width, design.height, design.depth]
                                .filter(Boolean)
                                .join(" × ")} mm
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(design.created_at), { addSuffix: true })}
                        </div>
                      </div>
                      {getStatusBadge(design.status)}
                    </div>
                    
                    {design.status === "completed" && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewDesign(design)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                        {design.stl_file_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(design.stl_file_url!, `model-${design.id}.stl`)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            STL
                          </Button>
                        )}
                        {design.blend_file_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(design.blend_file_url!, `model-${design.id}.blend`)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            BLEND
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={!!previewDesign} onOpenChange={() => setPreviewDesign(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>3D Model Preview</DialogTitle>
            <DialogDescription>
              {previewDesign?.prompt_text}
            </DialogDescription>
          </DialogHeader>
          {previewDesign?.stl_file_url && (
            <ModelViewer modelUrl={previewDesign.stl_file_url} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DesignHistory;
