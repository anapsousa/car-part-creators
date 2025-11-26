import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import GenerateForm from "@/components/GenerateForm";
import DesignHistory from "@/components/DesignHistory";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";

export default function Generator() {
  const navigate = useNavigate();
  const { content } = useContent("generator");
  const [user, setUser] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      subscription = await checkAuth();
    };

    initAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return subscription;
  };

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <Header pageTitle="3D Model Generator" pageSubtitle="AI-Powered Design Creation" />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-card/80 via-card/90 to-card/80 backdrop-blur-md border border-primary/20 rounded-lg p-6 shadow-glow">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              {content["generator.form.title"] || "Create Your 3D Model"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {content["generator.form.subtitle"] || "Describe your vision and let our AI bring it to life"}
            </p>
            <GenerateForm 
              onGenerate={() => setRefreshTrigger(prev => prev + 1)}
            />
          </div>

          <DesignHistory refreshTrigger={refreshTrigger} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
