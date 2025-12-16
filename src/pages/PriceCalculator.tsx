import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PriceCalculator = () => {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const setupIframe = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token && session?.refresh_token) {
        setIsAuthenticated(true);
        const baseUrl = "https://print3dpricecalculator.lovable.app/";
        const url = new URL(baseUrl);
        url.searchParams.set('access_token', session.access_token);
        url.searchParams.set('refresh_token', session.refresh_token);
        setIframeUrl(url.toString());
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
    
    setupIframe();

    // Listen for auth changes to update tokens
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token && session?.refresh_token) {
        setIsAuthenticated(true);
        const baseUrl = "https://print3dpricecalculator.lovable.app/";
        const url = new URL(baseUrl);
        url.searchParams.set('access_token', session.access_token);
        url.searchParams.set('refresh_token', session.refresh_token);
        setIframeUrl(url.toString());
      } else {
        setIsAuthenticated(false);
        setIframeUrl(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-mesh">
      <Header pageTitle="Cost Calculator" pageSubtitle="3D Printing Price Calculator" />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-card/80 backdrop-blur-md border border-primary/20 rounded-lg shadow-glow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-[calc(100vh-250px)]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isAuthenticated && iframeUrl ? (
            <iframe
              src={iframeUrl}
              title="3D Printing Cost Calculator"
              className="w-full h-[calc(100vh-250px)] border-0"
              allow="clipboard-write"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] gap-4">
              <Lock className="h-12 w-12 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Authentication Required</h2>
              <p className="text-muted-foreground text-center max-w-md">
                Please sign in to access the Price Calculator.
              </p>
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PriceCalculator;
