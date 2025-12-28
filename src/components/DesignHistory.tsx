import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Download, Loader2, FileText, Clock, Heart, Eye, Filter, Trash2, Box } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { getDesignFileUrl, isFileAvailable } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const handleRegenerate = async (design: Design) => {
    try {
      toast.info("Regenerating model...");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to regenerate models");
        return;
      }

      // Update status to generating
      const { error: updateError } = await supabase
        .from("designs")
        .update({ status: "generating" })
        .eq("id", design.id);

      if (updateError) throw updateError;

      // Call the generate-model function
      const { data, error: functionError } = await supabase.functions.invoke('generate-model', {
        body: {
          designId: design.id,
          prompt: design.prompt_text,
          category: design.category,
          material: design.material,
          width: design.width,
          height: design.height,
          depth: design.depth,
        }
      });

      if (functionError) {
        // Check error codes
        if (data?.code === "INSUFFICIENT_CREDITS") {
          toast.error("You don't have enough credits. Please purchase more to continue.", {
            duration: 5000,
            action: {
              label: "Buy Credits",
              onClick: () => window.location.href = "/dashboard?tab=credits"
            }
          });
          return;
        }
        if (data?.code === "SERVICE_UNAVAILABLE") {
          toast.error("Service temporarily unavailable. Your credit has been refunded.");
          return;
        }
        throw functionError;
      }

      toast.success("Model regeneration started! This may take a few minutes.");
      fetchDesigns();
    } catch (error: any) {
      console.error("Error regenerating model:", error);
      toast.error(error.message || "Failed to regenerate model");
    }
  };

  const handlePreview = async (design: Design) => {
    if (!isFileAvailable(design.stl_file_url)) {
      toast.error("Preview not available. File may be missing.");
      return;
    }

    setPreviewDesign(design);
    setPreviewUrl(null);

    // Get signed URL for preview
    const signedUrl = await getDesignFileUrl(design.stl_file_url);
    if (signedUrl) {
      setPreviewUrl(signedUrl);
    } else {
      toast.error("Failed to load preview. Please try again.");
    }
  };

  const handleDownload = async (urlOrPath: string, filename: string) => {
    try {
      // Check if file is available
      if (!isFileAvailable(urlOrPath)) {
        toast.error("File not available. Please regenerate this design.");
        return;
      }

      // Get signed URL if needed
      const downloadUrl = await getDesignFileUrl(urlOrPath);
      if (!downloadUrl) {
        toast.error("Failed to get download URL. Please try again.");
        return;
      }

      // Download the file
      const response = await fetch(downloadUrl, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Download started");
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error(error.message || "Failed to download file. The file may not exist or be accessible.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("designs")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast.success("Design deleted successfully");
      fetchDesigns();
    } catch (error: any) {
      toast.error("Failed to delete design");
      console.error("Delete error:", error);
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "generating":
        return <Badge variant="warning">Generating</Badge>;
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
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {design.status === "completed" && (
                        <>
                          <Button
                            size="sm"
                            variant={isFileAvailable(design.stl_file_url) ? "outline" : "ghost"}
                            disabled={!isFileAvailable(design.stl_file_url)}
                            className={!isFileAvailable(design.stl_file_url) ? "opacity-50 cursor-not-allowed" : ""}
                            onClick={() => handlePreview(design)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            variant={isFileAvailable(design.stl_file_url) ? "outline" : "ghost"}
                            disabled={!isFileAvailable(design.stl_file_url)}
                            className={!isFileAvailable(design.stl_file_url) ? "opacity-50 cursor-not-allowed" : ""}
                            onClick={() => {
                              if (isFileAvailable(design.stl_file_url)) {
                                handleDownload(design.stl_file_url!, `${design.prompt_text.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}-${design.id.slice(0, 8)}.glb`);
                              } else {
                                toast.error("STL file not available. Please regenerate this design.");
                              }
                            }}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            GLB
                          </Button>
                          <Button
                            size="sm"
                            variant={isFileAvailable(design.blend_file_url) ? "outline" : "ghost"}
                            disabled={!isFileAvailable(design.blend_file_url)}
                            className={!isFileAvailable(design.blend_file_url) ? "opacity-50 cursor-not-allowed" : ""}
                            onClick={() => {
                              if (isFileAvailable(design.blend_file_url)) {
                                handleDownload(design.blend_file_url!, `${design.prompt_text.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}-${design.id.slice(0, 8)}.blend`);
                              } else {
                                toast.error("BLEND file not available. Please regenerate this design.");
                              }
                            }}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            BLEND
                          </Button>
                          {(!isFileAvailable(design.stl_file_url) || !isFileAvailable(design.blend_file_url)) && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleRegenerate(design)}
                            >
                              <Loader2 className="mr-2 h-4 w-4" />
                              Regenerate
                            </Button>
                          )}
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteId(design.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={!!previewDesign} onOpenChange={() => { setPreviewDesign(null); setPreviewUrl(null); }}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>3D Model Preview</DialogTitle>
            <DialogDescription className="line-clamp-2">
              {previewDesign?.prompt_text}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-muted/30 rounded-lg">
            <Box className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-center">3D Preview</p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              Download the file to view in your preferred 3D software
            </p>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            {previewDesign?.stl_file_url && isFileAvailable(previewDesign.stl_file_url) && (
              <Button
                variant="outline"
                onClick={() => handleDownload(previewDesign.stl_file_url!, `${previewDesign.prompt_text.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}-${previewDesign.id.slice(0, 8)}.glb`)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download GLB
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Design</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this design? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DesignHistory;
