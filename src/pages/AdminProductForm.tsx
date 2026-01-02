import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ImageUpload";
import { ArrowLeft, Calculator, Percent, Tag, X, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContent } from "@/hooks/useContent";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useTags, useLocalizedTagName, Tag as TagType } from "@/hooks/useTags";
import { ColorManager, ProductColor } from "@/components/admin/ColorManager";

interface CalcPrint {
  id: string;
  name: string;
  sell_price: number | null;
  total_cost: number | null;
  image_url: string | null;
  filament_cost: number | null;
}

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
    calc_print_id: "",
    base_price: "",
    discount_enabled: false,
    discount_percent: "0",
    cost_price: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [calcPrints, setCalcPrints] = useState<CalcPrint[]>([]);
  const [isLoadingCalcPrints, setIsLoadingCalcPrints] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  
  const { data: allTags, isLoading: isLoadingTags } = useTags();
  const getTagName = useLocalizedTagName();

  useEffect(() => {
    fetchCalcPrints();
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchCalcPrints = async () => {
    setIsLoadingCalcPrints(true);
    const { data, error } = await supabase
      .from("calc_prints")
      .select("id, name, sell_price, total_cost, image_url, filament_cost")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching calc prints:", error);
    } else {
      setCalcPrints(data || []);
    }
    setIsLoadingCalcPrints(false);
  };

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
      calc_print_id: data.calc_print_id || "",
      base_price: data.base_price?.toString() || "",
      discount_enabled: data.discount_enabled || false,
      discount_percent: data.discount_percent?.toString() || "0",
      cost_price: data.cost_price?.toString() || "",
    });
    setImages(data.images || []);
    
    // Parse colors from JSONB
    if (data.colors && Array.isArray(data.colors)) {
      setColors(data.colors as unknown as ProductColor[]);
    }
    
    // Fetch product tags
    const { data: productTags, error: tagsError } = await supabase
      .from("product_tags")
      .select("tag_id")
      .eq("product_id", id);
    
    if (!tagsError && productTags) {
      setSelectedTagIds(productTags.map(pt => pt.tag_id));
    }
  };
  
  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleCalcPrintSelect = (printId: string) => {
    if (printId === "none") {
      setFormData(prev => ({ ...prev, calc_print_id: "" }));
      return;
    }

    const selectedPrint = calcPrints.find(p => p.id === printId);
    if (selectedPrint) {
      const sellPrice = selectedPrint.sell_price?.toString() || "";
      const costPrice = selectedPrint.total_cost?.toString() || "";
      
      setFormData(prev => ({
        ...prev,
        calc_print_id: printId,
        price: sellPrice,
        base_price: sellPrice,
        cost_price: costPrice,
        name: prev.name || selectedPrint.name,
      }));

      // Add image if available and no images exist
      if (selectedPrint.image_url && images.length === 0) {
        setImages([selectedPrint.image_url]);
      }

      toast({
        title: "Calculator data imported",
        description: `Price set to €${parseFloat(sellPrice).toFixed(2)} from ${selectedPrint.name}`,
      });
    }
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
      colors: JSON.parse(JSON.stringify(colors)) as Json,
      is_active: formData.is_active,
      calc_print_id: formData.calc_print_id || null,
      base_price: formData.base_price ? parseFloat(formData.base_price) : null,
      discount_enabled: formData.discount_enabled,
      discount_percent: formData.discount_percent ? parseFloat(formData.discount_percent) : 0,
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
    };

    let productId = id;
    
    if (isEditMode) {
      const { error } = await supabase.from("products").update(productData).eq("id", id);
      if (error) {
        console.error("Error updating product:", error);
        toast({ title: "Error", description: "Failed to update product", variant: "destructive" });
        setIsLoading(false);
        return;
      }
    } else {
      const { data, error } = await supabase.from("products").insert(productData).select("id").single();
      if (error || !data) {
        console.error("Error creating product:", error);
        toast({ title: "Error", description: "Failed to create product", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      productId = data.id;
    }

    // Update product tags
    if (productId) {
      // Remove existing tags
      await supabase.from("product_tags").delete().eq("product_id", productId);
      
      // Add new tags
      if (selectedTagIds.length > 0) {
        const tagInserts = selectedTagIds.map(tagId => ({
          product_id: productId!,
          tag_id: tagId,
        }));
        const { error: tagError } = await supabase.from("product_tags").insert(tagInserts);
        if (tagError) {
          console.error("Error saving product tags:", tagError);
        }
      }
    }

    toast({
      title: "Success",
      description: `Product ${isEditMode ? "updated" : "created"} successfully`,
    });
    navigate("/admin/products");
    setIsLoading(false);
  };

  // Calculate final price preview
  const basePrice = parseFloat(formData.price) || 0;
  const discountPercent = parseFloat(formData.discount_percent) || 0;
  const finalPrice = formData.discount_enabled 
    ? basePrice * (1 - discountPercent / 100) 
    : basePrice;

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
          {/* Calculator Import Section */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Import from Price Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.calc_print_id || "none"}
                onValueChange={handleCalcPrintSelect}
                disabled={isLoadingCalcPrints}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a calculation to import pricing..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None - Manual pricing</SelectItem>
                  {calcPrints.map((print) => (
                    <SelectItem key={print.id} value={print.id}>
                      {print.name} - €{(print.sell_price || 0).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.calc_print_id && (
                <p className="text-sm text-muted-foreground mt-2">
                  Cost: €{parseFloat(formData.cost_price || "0").toFixed(2)} | 
                  Sell Price: €{parseFloat(formData.base_price || "0").toFixed(2)}
                </p>
              )}
            </CardContent>
          </Card>

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

          {/* Discount Settings Section */}
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Percent className="h-5 w-5 text-accent" />
                Discount Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="discount_enabled" className="text-base">
                    Enable Discount on Website
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show discounted price in shop
                  </p>
                </div>
                <Switch
                  id="discount_enabled"
                  checked={formData.discount_enabled}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, discount_enabled: checked })
                  }
                />
              </div>
              
              {formData.discount_enabled && (
                <>
                  <div>
                    <Label htmlFor="discount_percent">Discount Percentage (%)</Label>
                    <Input
                      id="discount_percent"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.discount_percent}
                      onChange={(e) => 
                        setFormData({ ...formData, discount_percent: e.target.value })
                      }
                    />
                  </div>
                  
                  <div className="p-4 bg-background rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Price Preview:</p>
                    <div className="flex items-center gap-3">
                      <span className="text-lg line-through text-muted-foreground">
                        €{basePrice.toFixed(2)}
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        €{finalPrice.toFixed(2)}
                      </span>
                      <span className="text-sm bg-destructive text-destructive-foreground px-2 py-1 rounded">
                        -{discountPercent}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

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

          {/* Tags Section */}
          <Card className="border-secondary/20 bg-secondary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5 text-secondary-foreground" />
                Product Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTags ? (
                <div className="text-sm text-muted-foreground">Loading tags...</div>
              ) : allTags && allTags.length > 0 ? (
                <div className="space-y-4">
                  {/* Selected tags */}
                  {selectedTagIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-3 border-b">
                      {selectedTagIds.map(tagId => {
                        const tag = allTags.find(t => t.id === tagId);
                        if (!tag) return null;
                        return (
                          <Badge key={tagId} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                            {getTagName(tag)}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 hover:bg-destructive/20"
                              onClick={() => handleTagToggle(tagId)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Tag selection list */}
                  <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
                    {allTags.map(tag => (
                      <label
                        key={tag.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedTagIds.includes(tag.id)}
                          onCheckedChange={() => handleTagToggle(tag.id)}
                        />
                        <span className="text-sm">{getTagName(tag)}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{tag.slug}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tags available. <a href="/admin/tags" className="text-primary underline">Create some tags first.</a>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Colors Section */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Product Colors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Add available color options for this product. Customers will be able to select their preferred color.
              </p>
              <ColorManager colors={colors} onChange={setColors} />
            </CardContent>
          </Card>

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
