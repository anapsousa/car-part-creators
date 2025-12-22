import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle } from "lucide-react";
import { Footer } from "@/components/Footer";
import pompousweekLogo from "@/assets/pompousweek-logo.png";
import { useUserRole } from "@/hooks/useUserRole";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductWithMargin {
  id: string;
  name: string;
  category: string;
  price: number;
  cost_price: number | null;
  base_price: number | null;
  discount_enabled: boolean;
  discount_percent: number | null;
  stock_quantity: number;
  is_active: boolean;
  profit: number;
  margin_percent: number;
  final_price: number;
}

export default function AdminProfitMargins() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const [products, setProducts] = useState<ProductWithMargin[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'margin' | 'profit' | 'name'>('margin');

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/');
      return;
    }
    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin, roleLoading, navigate]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      const productsWithMargin = (data || []).map(product => {
        const basePrice = product.base_price || product.price;
        const finalPrice = product.discount_enabled && product.discount_percent
          ? basePrice * (1 - (product.discount_percent / 100))
          : basePrice;
        const costPrice = product.cost_price || 0;
        const profit = finalPrice - costPrice;
        const marginPercent = costPrice > 0 ? ((profit / finalPrice) * 100) : 0;

        return {
          ...product,
          profit,
          margin_percent: marginPercent,
          final_price: finalPrice,
        } as ProductWithMargin;
      });

      setProducts(productsWithMargin);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'margin':
        return b.margin_percent - a.margin_percent;
      case 'profit':
        return b.profit - a.profit;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const totalRevenue = products.reduce((sum, p) => sum + p.final_price, 0);
  const totalCost = products.reduce((sum, p) => sum + (p.cost_price || 0), 0);
  const totalProfit = products.reduce((sum, p) => sum + p.profit, 0);
  const avgMargin = products.length > 0 
    ? products.reduce((sum, p) => sum + p.margin_percent, 0) / products.length 
    : 0;
  const lowMarginCount = products.filter(p => p.margin_percent < 20 && p.cost_price).length;

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh">
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-10 w-48" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <img src={pompousweekLogo} alt="Logo" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold">Profit Margins</h1>
                <p className="text-xs text-muted-foreground">Product cost analysis</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={sortBy === 'margin' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSortBy('margin')}
              >
                By Margin
              </Button>
              <Button 
                variant={sortBy === 'profit' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSortBy('profit')}
              >
                By Profit
              </Button>
              <Button 
                variant={sortBy === 'name' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSortBy('name')}
              >
                By Name
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{products.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{avgMargin.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit (per unit)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-500" />
                <span className="text-2xl font-bold">{formatCurrency(totalProfit)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className={lowMarginCount > 0 ? 'border-red-500/50' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Margin Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${lowMarginCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                <span className="text-2xl font-bold">{lowMarginCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Margins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Product</th>
                    <th className="text-left py-3 px-2 font-medium">Category</th>
                    <th className="text-right py-3 px-2 font-medium">Cost</th>
                    <th className="text-right py-3 px-2 font-medium">Sell Price</th>
                    <th className="text-right py-3 px-2 font-medium">Discount</th>
                    <th className="text-right py-3 px-2 font-medium">Final Price</th>
                    <th className="text-right py-3 px-2 font-medium">Profit</th>
                    <th className="text-right py-3 px-2 font-medium">Margin</th>
                    <th className="text-center py-3 px-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map(product => (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div className="font-medium">{product.name}</div>
                        {!product.cost_price && (
                          <span className="text-xs text-muted-foreground">No cost set</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline">{product.category}</Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        {product.cost_price ? formatCurrency(product.cost_price) : '-'}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {formatCurrency(product.base_price || product.price)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {product.discount_enabled && product.discount_percent ? (
                          <Badge variant="destructive">-{product.discount_percent}%</Badge>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-2 text-right font-medium">
                        {formatCurrency(product.final_price)}
                      </td>
                      <td className={`py-3 px-2 text-right font-medium ${product.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(product.profit)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {product.margin_percent >= 30 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : product.margin_percent < 20 && product.cost_price ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : null}
                          <span className={
                            product.margin_percent >= 30 ? 'text-green-600' : 
                            product.margin_percent < 20 && product.cost_price ? 'text-red-600' : ''
                          }>
                            {product.cost_price ? `${product.margin_percent.toFixed(1)}%` : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
