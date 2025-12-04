import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, Package, DollarSign, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import pompousweekLogo from "@/assets/pompousweek-logo.png";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalDesigns: number;
  recentPayments: any[];
  popularCategories: { category: string; count: number }[];
  totalCosts: number;
  monthlyProjection: number;
  aiCosts: any[];
}

const AdminStats = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  const { content } = useContent("admin");

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
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
      return;
    }

    await fetchStats();
  };

  const fetchStats = async () => {
    try {
      const [paymentsRes, designsRes, usersRes, costsRes] = await Promise.all([
        supabase.from("payments").select("*"),
        supabase.from("designs").select("*"),
        supabase.from("profiles").select("*"),
        supabase.from("generation_costs").select("*")
      ]);

      const payments = paymentsRes.data || [];
      const designs = designsRes.data || [];
      const users = usersRes.data || [];
      const costs = costsRes.data || [];

      const totalRevenue = payments
        .filter(p => p.payment_status === "completed")
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalCosts = costs
        .filter(c => c.status === "completed")
        .reduce((sum, c) => sum + Number(c.cost_usd), 0);

      // Calculate monthly projection
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentCosts = costs.filter(c => 
        new Date(c.created_at) >= thirtyDaysAgo && c.status === "completed"
      );
      const last30DaysCost = recentCosts.reduce((sum, c) => sum + Number(c.cost_usd), 0);
      const monthlyProjection = last30DaysCost; // 30 days average

      const categoryCount = designs.reduce((acc: Record<string, number>, d) => {
        acc[d.category || "other"] = (acc[d.category || "other"] || 0) + 1;
        return acc;
      }, {});

      const popularCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count: count as number }))
        .sort((a, b) => b.count - a.count);

      setStats({
        totalRevenue,
        totalOrders: payments.length,
        totalUsers: users.length,
        totalDesigns: designs.length,
        recentPayments: payments.slice(0, 10),
        popularCategories: popularCategories.slice(0, 5),
        totalCosts,
        monthlyProjection,
        aiCosts: costs
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={pompousweekLogo} alt="Dr3am ToReal" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold">{content["admin.stats.title"] || "Business Statistics"}</h1>
                <p className="text-xs text-muted-foreground">{content["admin.stats.subtitle"] || "Overview & Analytics"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/admin")}>
                Review Designs
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-success/30 shadow-glow-green">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{content["admin.stats.revenue"] || "Total Revenue"}</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">€{stats?.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From completed orders</p>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats?.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time payments</p>
            </CardContent>
          </Card>

          <Card className="border-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats?.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>

          <Card className="border-warning/30 shadow-glow-yellow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Designs</CardTitle>
              <TrendingUp className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats?.totalDesigns}</div>
              <p className="text-xs text-muted-foreground">Models generated</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="border-destructive/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Generation Costs</CardTitle>
              <TrendingUp className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">${stats?.totalCosts.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total spent on AI services</p>
              <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Lovable AI:</span>
                  <span className="font-medium">${stats?.aiCosts.filter(c => c.service === 'lovable_ai' && c.status === 'completed').reduce((s, c) => s + Number(c.cost_usd), 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Replicate:</span>
                  <span className="font-medium">${stats?.aiCosts.filter(c => c.service === 'replicate' && c.status === 'completed').reduce((s, c) => s + Number(c.cost_usd), 0).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-warning/30 shadow-glow-yellow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Projection</CardTitle>
              <DollarSign className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">${stats?.monthlyProjection.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Est. monthly AI cost (based on last 30 days)</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
              <CardDescription>Most requested design types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.popularCategories.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <span className="capitalize font-medium">{cat.category}</span>
                    <span className="text-muted-foreground">{cat.count} designs</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{payment.currency} {payment.amount}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payment.payment_status === 'completed' 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {payment.payment_status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminStats;
