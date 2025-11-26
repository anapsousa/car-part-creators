import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import pompousweekLogo from "@/assets/pompousweek-logo.png";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const [isLoading, setIsLoading] = useState(true);
  const [design, setDesign] = useState<any>(null);
  const { content } = useContent("checkout");

  useEffect(() => {
    const checkPayment = async () => {
      if (!paymentId) {
        navigate("/");
        return;
      }

      try {
        // Get payment record
        const { data: payment, error: paymentError } = await supabase
          .from("payments")
          .select("*, designs(*)")
          .eq("id", paymentId)
          .single();

        if (paymentError) throw paymentError;

        if (payment.payment_status === "completed" && payment.designs) {
          setDesign(payment.designs);
        }
      } catch (error) {
        console.error("Error checking payment:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPayment();
  }, [paymentId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <img src={pompousweekLogo} alt="Pompousweek" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-bold">{content["checkout.success.title"] || "Payment Successful"}</h1>
              <p className="text-xs text-muted-foreground">{content["checkout.success.subtitle"] || "Your Model is Ready"}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
              <CardDescription>
                Your payment has been processed and your 3D model is ready to download.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {design?.stl_file_url && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Download Your Model</h3>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => window.open(design.stl_file_url, "_blank")}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download GLB
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold text-sm">Order Details</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product:</span>
                    <span>3D Model Generation</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span>€9.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-primary font-medium">Completed</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  View All Designs
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  Create Another Model
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
