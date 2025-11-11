import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Download, Loader2, FileText, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Design {
  id: string;
  prompt_text: string;
  status: string;
  stl_file_url: string | null;
  blend_file_url: string | null;
  created_at: string;
}

interface DesignHistoryProps {
  refreshTrigger: number;
}

const DesignHistory = ({ refreshTrigger }: DesignHistoryProps) => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDesigns();
  }, [refreshTrigger]);

  const fetchDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from("designs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
    } catch (error: any) {
      console.error("Error fetching designs:", error);
      toast.error("Failed to load designs");
    } finally {
      setIsLoading(false);
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
    <Card className="border-border/50 backdrop-blur-sm bg-card/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Your Designs
        </CardTitle>
        <CardDescription>
          View and download your generated 3D models
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {designs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No designs yet. Create your first 3D model above!
          </div>
        ) : (
          designs.map((design) => (
            <Card key={design.id} className="border-border/30">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium line-clamp-2">
                        {design.prompt_text}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(design.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    {getStatusBadge(design.status)}
                  </div>
                  
                  {design.status === "completed" && (
                    <div className="flex gap-2 pt-2">
                      {design.stl_file_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(design.stl_file_url!, `model-${design.id}.stl`)}
                          className="flex-1"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download STL
                        </Button>
                      )}
                      {design.blend_file_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(design.blend_file_url!, `model-${design.id}.blend`)}
                          className="flex-1"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download BLEND
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
  );
};

export default DesignHistory;
