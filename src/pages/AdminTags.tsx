import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Tag, X, Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTags, useCreateTag, useUpdateTag, useDeleteTag, Tag as TagType } from "@/hooks/useTags";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function AdminTags() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    slug: "",
    name_en: "",
    name_pt: "",
    description_en: "",
    description_pt: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: tags, isLoading, error } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      navigate("/");
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = "Slug must be lowercase with hyphens only";
    }

    if (!formData.name_en.trim()) {
      errors.name_en = "English name is required";
    }

    if (!formData.name_pt.trim()) {
      errors.name_pt = "Portuguese name is required";
    }

    // Check for duplicate slug (excluding current tag when editing)
    const existingSlug = tags?.find(
      (t) => t.slug === formData.slug && t.id !== editingTag?.id
    );
    if (existingSlug) {
      errors.slug = "This slug is already in use";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreate = () => {
    setFormData({
      slug: "",
      name_en: "",
      name_pt: "",
      description_en: "",
      description_pt: "",
    });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (tag: TagType) => {
    setEditingTag(tag);
    setFormData({
      slug: tag.slug,
      name_en: tag.name_en,
      name_pt: tag.name_pt,
      description_en: tag.description_en || "",
      description_pt: tag.description_pt || "",
    });
    setFormErrors({});
  };

  const handleCloseDialog = () => {
    setIsCreateOpen(false);
    setEditingTag(null);
    setFormErrors({});
  };

  const handleNameChange = (field: "name_en" | "name_pt", value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug from English name if slug is empty or was auto-generated
      if (field === "name_en" && (!prev.slug || prev.slug === slugify(prev.name_en))) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingTag) {
        await updateTag.mutateAsync({
          id: editingTag.id,
          tag: formData,
        });
        toast({
          title: "Tag updated",
          description: `"${formData.name_en}" has been updated successfully.`,
        });
      } else {
        await createTag.mutateAsync(formData);
        toast({
          title: "Tag created",
          description: `"${formData.name_en}" has been created successfully.`,
        });
      }
      handleCloseDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteTag.mutateAsync(deleteId);
      toast({
        title: "Tag deleted",
        description: "The tag has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  const isDialogOpen = isCreateOpen || !!editingTag;

  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="Manage Tags" pageSubtitle="Admin Dashboard" />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Tag className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Tag Management</h2>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading tags...</div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error.message}</div>
        ) : !tags || tags.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-4">No tags found</p>
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Tag
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>English Name</TableHead>
                <TableHead>Portuguese Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-mono text-sm">{tag.slug}</TableCell>
                  <TableCell>{tag.name_en}</TableCell>
                  <TableCell>{tag.name_pt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenEdit(tag)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteId(tag.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTag ? "Edit Tag" : "Create Tag"}</DialogTitle>
            <DialogDescription>
              {editingTag
                ? "Update the tag details below."
                : "Enter the tag details in both languages."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="name_en">English Name *</Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => handleNameChange("name_en", e.target.value)}
                  placeholder="e.g., Christmas"
                />
                {formErrors.name_en && (
                  <p className="text-sm text-destructive mt-1">{formErrors.name_en}</p>
                )}
              </div>

              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="name_pt">Portuguese Name *</Label>
                <Input
                  id="name_pt"
                  value={formData.name_pt}
                  onChange={(e) => handleNameChange("name_pt", e.target.value)}
                  placeholder="e.g., Natal"
                />
                {formErrors.name_pt && (
                  <p className="text-sm text-destructive mt-1">{formErrors.name_pt}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))
                }
                placeholder="e.g., christmas"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL-safe identifier (lowercase, hyphens allowed)
              </p>
              {formErrors.slug && (
                <p className="text-sm text-destructive mt-1">{formErrors.slug}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="description_en">English Description</Label>
                <Textarea
                  id="description_en"
                  value={formData.description_en}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description_en: e.target.value }))
                  }
                  placeholder="Optional description..."
                  rows={2}
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="description_pt">Portuguese Description</Label>
                <Textarea
                  id="description_pt"
                  value={formData.description_pt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description_pt: e.target.value }))
                  }
                  placeholder="Descrição opcional..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createTag.isPending || updateTag.isPending}
            >
              {createTag.isPending || updateTag.isPending ? (
                "Saving..."
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {editingTag ? "Update" : "Create"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tag? Products with this tag will have
              it removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}
