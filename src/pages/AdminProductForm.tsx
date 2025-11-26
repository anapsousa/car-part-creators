import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ImageUpload";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContent } from "@/hooks/useContent";
import { Footer } from "@/components/Footer";

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { content } = useContent("admin");
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "car_parts",
    price: "",
    stock_quantity: "",
    material: "",
    width: "",
    height: "",
    depth: "",
    is_active: true,
  });
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to fetch product",
        variant: "destructive",
      });
      navigate("/admin/products");
      return;
    }

    setFormData({
      name: data.name,
      description: data.description || "",
      category: data.category,
      price: data.price.toString(),
      stock_quantity: data.stock_quantity.toString(),
      material: data.material || "",
      width: data.width?.toString() || "",
      height: data.height?.toString() || "",
      depth: data.depth?.toString() || "",
      is_active: data.is_active,
    });
    setImages(data.images || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const productData = {
      name: formData.name,
      description: formData.description || null,
      category: formData.category,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
      material: formData.material || null,
      width: formData.width ? parseFloat(formData.width) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      depth: formData.depth ? parseFloat(formData.depth) : null,
      images,
      is_active: formData.is_active,
    };

    const { error } = isEditMode
      ? await supabase.from("products").update(productData).eq("id", id)
      : await supabase.from("products").insert(productData);

    if (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Product ${isEditMode ? "updated" : "created"} successfully`,
      });
      navigate("/admin/products");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">
          {isEditMode ? "Edit Product" : "Add New Product"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car_parts">Car Parts</SelectItem>
                  <SelectItem value="home_decor">Home Decor</SelectItem>
                  <SelectItem value="custom_designs">Custom Designs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                placeholder={content["admin.product_form.material.placeholder"] || "e.g., PLA, ABS, PETG"}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Dimensions (cm)</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder={content["admin.product_form.width.placeholder"] || "Width"}
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                />
              </div>
              <div>
                <Input
                  placeholder={content["admin.product_form.height.placeholder"] || "Height"}
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                />
              </div>
              <div>
                <Input
                  placeholder={content["admin.product_form.depth.placeholder"] || "Depth"}
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.depth}
                  onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Product Images</Label>
            <ImageUpload images={images} onImagesChange={setImages} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : isEditMode ? "Update Product" : "Create Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/products")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
      
      <Footer />
    </div>
  );
}
