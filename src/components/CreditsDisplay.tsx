import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Coins, Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export const CreditsDisplay = () => {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setCredits(data?.credits_remaining || 0);
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCredits = async () => {
    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('buy-credits');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.info("Complete your purchase in the new tab");
      }
    } catch (error) {
      console.error("Error purchasing credits:", error);
      toast.error("Failed to start purchase");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-secondary/30 shadow-glow-green bg-gradient-to-br from-card via-card to-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-secondary" />
          <span className="bg-gradient-secondary bg-clip-text text-transparent">Your Credits</span>
        </CardTitle>
        <CardDescription>
          Use credits to generate 3D models with AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-success">{credits}</div>
            <p className="text-sm text-muted-foreground">Credits remaining</p>
          </div>
          <Button 
            onClick={handleBuyCredits}
            disabled={purchasing}
            className="gap-2 shadow-glow-yellow"
            variant="tertiary"
          >
            {purchasing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            Buy 5 Credits - $9.90
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Each credit allows you to generate one 3D model. New users get 5 free credits!
        </p>
      </CardContent>
    </Card>
  );
};
