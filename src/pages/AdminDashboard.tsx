import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle, XCircle, Loader2, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import pompousweekLogo from "@/assets/pompousweek-logo.png";
import ModelViewer from "@/components/ModelViewer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";

interface Design {
  id: string;
  prompt_text: string;
  category: string;
  material: string;
  status: string;
  review_status: string;
  review_notes: string | null;
  stl_file_url: string | null;
  blend_file_url: string | null;
  created_at: string;
  user_id: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reviewNotes, setReviewNotes] = useState<{ [key: string]: string }>({});
  const [previewDesign, setPreviewDesign] = useState<Design | null>(null);
  const { content } = useContent("admin");

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (error || !roles) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchPendingDesigns();
    } catch (error) {
      toast.error("Failed to verify admin access");
      navigate("/");
    }
  };

  const fetchPendingDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from("designs")
        .select("*")
        .eq("review_status", "pending")
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
    } catch (error) {
      toast.error("Failed to load designs");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (designId: string, status: "approved" | "rejected") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("designs")
        .update({
          review_status: status,
          review_notes: reviewNotes[designId] || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", designId);

      if (error) throw error;

      toast.success(`Design ${status} successfully`);
      setDesigns(designs.filter(d => d.id !== designId));
      setReviewNotes({ ...reviewNotes, [designId]: "" });
    } catch (error) {
      toast.error(`Failed to ${status} design`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={pompousweekLogo} alt="Dr3am ToReal" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold">{content["admin.dashboard.title"] || "Admin Dashboard"}</h1>
                <p className="text-xs text-muted-foreground">{content["admin.dashboard.subtitle"] || "Model Review & Management"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/admin/profit-margins")}>
                Profit Margins
              </Button>
              <Button variant="outline" onClick={() => navigate("/admin/stats")}>
                View Stats
              </Button>
              <Badge variant="secondary">
                {designs.length} Pending
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {designs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{content["admin.dashboard.empty.title"] || "All Caught Up!"}</h3>
                <p className="text-muted-foreground">{content["admin.dashboard.empty.description"] || "No pending designs to review"}</p>
              </CardContent>
            </Card>
          ) : (
            designs.map((design) => (
              <Card key={design.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{design.prompt_text}</CardTitle>
                      <CardDescription>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">{design.category}</Badge>
                          <Badge variant="outline">{design.material}</Badge>
                          <Badge variant="secondary">
                            {new Date(design.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    {design.stl_file_url && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewDesign(design)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview Model
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(design.stl_file_url!, '_blank')}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download GLB
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{content["admin.dashboard.review_notes"] || "Review Notes (Optional)"}</label>
                    <Textarea
                      placeholder="Add notes about this review..."
                      value={reviewNotes[design.id] || ""}
                      onChange={(e) => setReviewNotes({ ...reviewNotes, [design.id]: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleReview(design.id, "approved")}
                      className="flex-1"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReview(design.id, "rejected")}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Preview Dialog */}
      <Dialog open={!!previewDesign} onOpenChange={() => setPreviewDesign(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewDesign?.prompt_text}</DialogTitle>
          </DialogHeader>
          {previewDesign?.stl_file_url && (
            <div className="h-[500px]">
              <ModelViewer modelUrl={previewDesign.stl_file_url} />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
