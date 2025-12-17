import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Palette, Calculator, Settings, Plus, ArrowRight, Loader2, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/calculator/calculations';

export default function CalcDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    printers: 0,
    filaments: 0,
    electricity: 0,
    prints: 0,
    totalCost: 0,
    totalRevenue: 0,
    totalProfit: 0,
  });
  const [recentPrints, setRecentPrints] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      setIsAuthenticated(true);
      
      try {
        const [printersRes, filamentsRes, electricityRes, printsRes] = await Promise.all([
          supabase.from('calc_printers').select('id', { count: 'exact' }),
          supabase.from('calc_filaments').select('id', { count: 'exact' }),
          supabase.from('calc_electricity_settings').select('id', { count: 'exact' }),
          supabase.from('calc_prints').select('*').order('created_at', { ascending: false }).limit(5),
        ]);

        const totalCost = printsRes.data?.reduce((sum, p) => sum + (p.total_cost || 0), 0) || 0;
        const totalRevenue = printsRes.data?.reduce((sum, p) => sum + ((p.sell_price || 0) * (p.quantity || 1)), 0) || 0;
        const totalProfit = printsRes.data?.reduce((sum, p) => sum + (p.profit || 0), 0) || 0;

        setStats({
          printers: printersRes.count || 0,
          filaments: filamentsRes.count || 0,
          electricity: electricityRes.count || 0,
          prints: printsRes.data?.length || 0,
          totalCost,
          totalRevenue,
          totalProfit,
        });
        
        setRecentPrints(printsRes.data || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetch();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-mesh">
        <Header pageTitle="Price Calculator" pageSubtitle="Calculate your 3D printing costs" />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-mesh">
        <Header pageTitle="Price Calculator" pageSubtitle="Calculate your 3D printing costs" />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Calculator className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to access the Price Calculator</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const needsSetup = stats.printers === 0 || stats.filaments === 0 || stats.electricity === 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-mesh">
      <Header pageTitle="Price Calculator" pageSubtitle="Calculate your 3D printing costs" />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <CalculatorLayout>
          <div className="space-y-6">
            {/* Setup Prompt */}
            {needsSetup && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Complete Your Setup</h3>
                  <p className="text-muted-foreground mb-4">
                    To start calculating print costs, you need to add a printer, filament, and electricity settings.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${stats.printers > 0 ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                      <Printer className="h-4 w-4" />
                      {stats.printers > 0 ? 'Printer added' : 'Add printer'}
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${stats.filaments > 0 ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                      <Palette className="h-4 w-4" />
                      {stats.filaments > 0 ? 'Filament added' : 'Add filament'}
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${stats.electricity > 0 ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                      <Zap className="h-4 w-4" />
                      {stats.electricity > 0 ? 'Electricity configured' : 'Set electricity'}
                    </div>
                  </div>
                  <Button onClick={() => navigate('/calculator/setup')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start Setup Wizard
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Printer className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.printers}</p>
                      <p className="text-sm text-muted-foreground">Printers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-secondary/10">
                      <Palette className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.filaments}</p>
                      <p className="text-sm text-muted-foreground">Filaments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-accent/10">
                      <Calculator className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.prints}</p>
                      <p className="text-sm text-muted-foreground">Calculations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <div>
                    <p className="text-2xl font-bold text-green-500">
                      {formatCurrency(stats.totalProfit)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Profit</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Link to="/calculator/prints">
                      <Calculator className="h-5 w-5" />
                      <span>New Calculation</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Link to="/calculator/printers">
                      <Printer className="h-5 w-5" />
                      <span>Manage Printers</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Link to="/calculator/filaments">
                      <Palette className="h-5 w-5" />
                      <span>Manage Filaments</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Link to="/calculator/settings">
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Calculations */}
            {recentPrints.length > 0 && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Recent Calculations</CardTitle>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/calculator/prints">
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentPrints.map((print) => (
                      <div
                        key={print.id}
                        className="flex items-center justify-between p-3 bg-background/50 rounded-md"
                      >
                        <div>
                          <p className="font-medium">{print.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Cost: {formatCurrency(print.total_cost || 0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(print.sell_price || 0)}</p>
                          <p className={`text-sm ${(print.profit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {(print.profit_margin_percent || 0).toFixed(1)}% margin
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CalculatorLayout>
      </main>
      
      <Footer />
    </div>
  );
}
