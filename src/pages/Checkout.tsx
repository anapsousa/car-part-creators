import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import pompousweekLogo from "@/assets/pompousweek-logo.png";
import { Footer } from "@/components/Footer";

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const designId = searchParams.get("design");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!designId) {
      toast.error("No design selected");
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to continue");
        navigate("/auth");
        return;
      }

      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { designId },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to initiate payment. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={pompousweekLogo} alt="Pompousweek" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-bold">Checkout</h1>
              <p className="text-xs text-muted-foreground">Complete Your Purchase</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>3D Model Generation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">€9.99</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Secure payment powered by Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">Accepted Payment Methods</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Credit & Debit Cards (Visa, Mastercard, Amex)</li>
                      <li>• PayPal</li>
                      <li>• Multibanco (Portugal)</li>
                      <li>• MB WAY available through Multibanco</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handlePayment} 
                className="w-full" 
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting to Stripe...
                  </>
                ) : (
                  `Pay €9.99 with Stripe`
                )}
              </Button>

              <div className="text-xs text-muted-foreground space-y-1 text-center">
                <p>🔒 Your payment is secured by Stripe</p>
                <p>💳 All major payment methods accepted</p>
                <p>🇵🇹 Portuguese payment methods supported</p>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                By completing this purchase, you agree to our Terms of Service
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
