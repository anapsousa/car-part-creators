import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CreditCard, Smartphone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import pompousweekLogo from "@/assets/pompousweek-logo.png";

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const designId = searchParams.get("design");
  
  const [paymentMethod, setPaymentMethod] = useState<"mbway" | "paypal">("mbway");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to continue");
        navigate("/auth");
        return;
      }

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          design_id: designId,
          amount: 9.99,
          currency: "EUR",
          payment_method: paymentMethod,
          payment_status: "pending",
          metadata: {
            phone: paymentMethod === "mbway" ? phoneNumber : null
          }
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      if (paymentMethod === "mbway") {
        // Simulate MB Way flow
        toast.success("MB Way request sent! Check your phone to approve the payment.");
        
        // Simulate payment confirmation after 3 seconds
        setTimeout(async () => {
          const { error: updateError } = await supabase
            .from("payments")
            .update({ 
              payment_status: "completed",
              payment_reference: `MBWAY-${Date.now()}`
            })
            .eq("id", payment.id);

          if (!updateError) {
            toast.success("Payment confirmed! Your model is ready.");
            navigate("/");
          }
        }, 3000);
      } else {
        // Simulate PayPal redirect
        toast.info("Redirecting to PayPal...");
        // In production, redirect to PayPal checkout
        setTimeout(() => {
          toast.success("Payment completed via PayPal!");
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
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

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Select your preferred payment option</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "mbway" | "paypal")}>
                <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value="mbway" id="mbway" />
                  <Label htmlFor="mbway" className="flex-1 cursor-pointer flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">MB Way</div>
                      <div className="text-xs text-muted-foreground">Pay with your phone number</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex-1 cursor-pointer flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">PayPal</div>
                      <div className="text-xs text-muted-foreground">Pay securely with PayPal</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === "mbway" && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+351 912 345 678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    You'll receive a payment request on your MB Way app
                  </p>
                </div>
              )}

              <Button 
                onClick={handlePayment} 
                className="w-full" 
                size="lg"
                disabled={isProcessing || (paymentMethod === "mbway" && !phoneNumber)}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay €9.99 with ${paymentMethod === "mbway" ? "MB Way" : "PayPal"}`
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By completing this purchase, you agree to our Terms of Service
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
