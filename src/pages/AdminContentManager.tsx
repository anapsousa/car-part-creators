import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, Save, Trash2, Plus, RefreshCw } from "lucide-react";
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
import { useContent } from "@/hooks/useContent";

interface ContentItem {
  id: string;
  content_key: string;
  content_type: string;
  page: string;
  section: string;
  english_text: string;
  portuguese_text: string | null;
  description: string | null;
}

export default function AdminContentManager() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredContentItems, setFilteredContentItems] = useState<ContentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newContent, setNewContent] = useState({
    content_key: "",
    content_type: "text",
    page: "",
    section: "",
    english_text: "",
    portuguese_text: "",
    description: "",
  });

  const { content } = useContent("admin");

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    const hasAdminRole = roles?.some((r) => r.role === "admin");

    if (!hasAdminRole) {
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchContent();
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("content_translations")
        .select("*")
        .order("page")
        .order("section")
        .order("content_key");

      if (error) {
        console.error("Error fetching content:", error);
        toast({
          title: "Error",
          description: `Failed to load content: ${error.message}`,
          variant: "destructive",
        });
        setContentItems([]);
        setFilteredContentItems([]);
      } else {
        const items = data || [];
        console.log(`Loaded ${items.length} content items`);
        setContentItems(items);
        setFilteredContentItems(items);
        
        if (items.length === 0) {
          toast({
            title: "No Content Found",
            description: "No content translations found in the database. Make sure the content has been imported.",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading content",
        variant: "destructive",
      });
      setContentItems([]);
      setFilteredContentItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredContentItems(contentItems);
      return;
    }

    const filtered = contentItems.filter(
      (item) =>
        item.content_key.toLowerCase().includes(term.toLowerCase()) ||
        item.english_text.toLowerCase().includes(term.toLowerCase()) ||
        item.page.toLowerCase().includes(term.toLowerCase()) ||
        item.section.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredContentItems(filtered);
  };

  const handleUpdate = async (item: ContentItem) => {
    const { error } = await supabase
      .from("content_translations")
      .update({
        english_text: item.english_text,
        portuguese_text: item.portuguese_text,
      })
      .eq("id", item.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Content updated successfully",
      });
      setEditingId(null);
      fetchContent();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("content_translations")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Content deleted successfully",
      });
      setDeleteId(null);
      fetchContent();
    }
  };

  const handleAdd = async () => {
    const { error } = await supabase
      .from("content_translations")
      .insert([newContent]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add content",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Content added successfully",
      });
      setShowAddDialog(false);
      setNewContent({
        content_key: "",
        content_type: "text",
        page: "",
        section: "",
        english_text: "",
        portuguese_text: "",
        description: "",
      });
      fetchContent();
    }
  };

  const pages = Array.from(new Set(contentItems.map((item) => item.page))).sort();
  const allPages = ["all", ...pages];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <Header pageTitle="Content Manager" pageSubtitle="Manage translations" showCart={false} />

      <main className="container mx-auto px-4 py-8">
        <Card className="p-6 bg-card/90 backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">{content["admin.content.title"] || "Content Translations"}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Total: {contentItems.length} items | Filtered: {filteredContentItems.length} items
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchContent} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {content["admin.content.add_button"] || "Add Content"}
              </Button>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by key, text, page, or section..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-4 flex flex-wrap w-full h-auto">
              {allPages.map((page) => (
                <TabsTrigger key={page} value={page} className="capitalize">
                  {page}
                </TabsTrigger>
              ))}
            </TabsList>

            {allPages.map((page) => {
              const pageItems = page === "all" 
                ? filteredContentItems 
                : filteredContentItems.filter((item) => item.page === page);
              
              return (
              <TabsContent key={page} value={page} className="space-y-4">
                {pageItems.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      {page === "all" 
                        ? "No content found. Use the search bar or check if content has been imported." 
                        : `No content found for page "${page}".`}
                    </p>
                  </Card>
                ) : (
                  pageItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            {item.page} / {item.section} / {item.content_type}
                          </p>
                          <p className="font-mono text-sm font-semibold">{item.content_key}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground italic">{item.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {editingId === item.id ? (
                            <Button size="sm" onClick={() => handleUpdate(item)}>
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => setEditingId(item.id)}>
                              Edit
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">English</label>
                          {editingId === item.id ? (
                            item.content_type === "text" || item.content_type === "button" ? (
                              <Input
                                value={item.english_text}
                                onChange={(e) => {
                                  const updated = contentItems.map((c) =>
                                    c.id === item.id ? { ...c, english_text: e.target.value } : c
                                  );
                                  setContentItems(updated);
                                  setFilteredContentItems(updated);
                                }}
                              />
                            ) : (
                              <Textarea
                                value={item.english_text}
                                onChange={(e) => {
                                  const updated = contentItems.map((c) =>
                                    c.id === item.id ? { ...c, english_text: e.target.value } : c
                                  );
                                  setContentItems(updated);
                                  setFilteredContentItems(updated);
                                }}
                                rows={3}
                              />
                            )
                          ) : (
                            <p className="text-sm p-2 bg-muted rounded">{item.english_text}</p>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Portuguese</label>
                          {editingId === item.id ? (
                            item.content_type === "text" || item.content_type === "button" ? (
                              <Input
                                value={item.portuguese_text || ""}
                                onChange={(e) => {
                                  const updated = contentItems.map((c) =>
                                    c.id === item.id ? { ...c, portuguese_text: e.target.value } : c
                                  );
                                  setContentItems(updated);
                                  setFilteredContentItems(updated);
                                }}
                                placeholder="Add Portuguese translation..."
                              />
                            ) : (
                              <Textarea
                                value={item.portuguese_text || ""}
                                onChange={(e) => {
                                  const updated = contentItems.map((c) =>
                                    c.id === item.id ? { ...c, portuguese_text: e.target.value } : c
                                  );
                                  setContentItems(updated);
                                  setFilteredContentItems(updated);
                                }}
                                placeholder="Add Portuguese translation..."
                                rows={3}
                              />
                            )
                          ) : (
                            <p className="text-sm p-2 bg-muted rounded">
                              {item.portuguese_text || (
                                <span className="text-muted-foreground italic">Not translated yet</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                  ))
                )}
              </TabsContent>
            );
            })}
          </Tabs>
        </Card>
      </main>

      <Footer />

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this content translation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add content dialog */}
      <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Content</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Content Key</label>
                <Input
                  value={newContent.content_key}
                  onChange={(e) => setNewContent({ ...newContent, content_key: e.target.value })}
                  placeholder="e.g., home.hero.title"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Content Type</label>
                <Input
                  value={newContent.content_type}
                  onChange={(e) => setNewContent({ ...newContent, content_type: e.target.value })}
                  placeholder="text, heading, button"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Page</label>
                <Input
                  value={newContent.page}
                  onChange={(e) => setNewContent({ ...newContent, page: e.target.value })}
                  placeholder="e.g., home, shop"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Section</label>
                <Input
                  value={newContent.section}
                  onChange={(e) => setNewContent({ ...newContent, section: e.target.value })}
                  placeholder="e.g., hero, features"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Input
                value={newContent.description}
                onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                placeholder="What is this content for?"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">English Text</label>
              <Textarea
                value={newContent.english_text}
                onChange={(e) => setNewContent({ ...newContent, english_text: e.target.value })}
                placeholder="Enter English text"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Portuguese Text</label>
              <Textarea
                value={newContent.portuguese_text}
                onChange={(e) => setNewContent({ ...newContent, portuguese_text: e.target.value })}
                placeholder="Enter Portuguese text"
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAdd}>Add Content</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
