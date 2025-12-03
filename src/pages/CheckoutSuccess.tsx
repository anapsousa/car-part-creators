import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import pompousweekLogo from "@/assets/pompousweek-logo.png";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";
import { Tables } from "@/integrations/supabase/types";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const orderId = searchParams.get("order_id");
  const [isLoading, setIsLoading] = useState(true);
  const [design, setDesign] = useState<any>(null);
  const [order, setOrder] = useState<Tables<'orders'> | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [isGuestOrder, setIsGuestOrder] = useState(false);
  const { content } = useContent("checkout");

  useEffect(() => {
    const checkPayment = async () => {
      if (!paymentId && !orderId) {
        navigate("/");
        return;
      }

      try {
        if (paymentId) {
          // Get payment record for designs
          const { data: payment, error: paymentError } = await supabase
            .from("payments")
            .select("*, designs(*)")
            .eq("id", paymentId)
            .single();

          if (paymentError) throw paymentError;

          if (payment.payment_status === "completed" && payment.designs) {
            setDesign(payment.designs);
          }
        } else if (orderId) {
          // Get order record for products
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('*, order_items(*, product:products(*))')
            .eq('id', orderId)
            .single();

          if (orderError) throw orderError;

          setOrder(orderData);
          setOrderItems(orderData.order_items || []);
          setIsGuestOrder(orderData.is_guest_order || false);
        }
      } catch (error) {
        console.error("Error checking payment/order:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkPayment();
  }, [paymentId, orderId, navigate]);

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
              <h1 className="text-xl font-bold">
                {orderId ? (content["checkout.success.order_title"] || "Order Successful") : (content["checkout.success.title"] || "Payment Successful")}
              </h1>
              <p className="text-xs text-muted-foreground">
                {orderId ? (content["checkout.success.order_subtitle"] || "Your Order is Confirmed") : (content["checkout.success.subtitle"] || "Your Model is Ready")}
              </p>
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

              {order && (
                <div className="space-y-4">
                  <h3 className="font-semibold">{content['checkout.success.order_details.title'] || 'Order Details'}</h3>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">{content['checkout.success.order_details.items'] || 'Items'}</h4>
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.product?.name} x{item.quantity}</span>
                        <span>€{(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>{content['checkout.success.order_details.total'] || 'Total'}</span>
                    <span>€{order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="text-sm">
                    <h4 className="font-medium">{content['checkout.success.order_details.shipping'] || 'Shipping Address'}</h4>
                    <p className="text-muted-foreground">
                      {typeof order.shipping_address === 'object' ? JSON.stringify(order.shipping_address, null, 2) : order.shipping_address}
                    </p>
                  </div>
                </div>
              )}

              {isGuestOrder && (
                <Card>
                  <CardHeader>
                    <CardTitle>{content['checkout.success.guest_prompt.title'] || 'Create an Account?'}</CardTitle>
                    <CardDescription>{content['checkout.success.guest_prompt.description'] || 'Save your order history and enjoy faster checkouts in the future'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => navigate(`/auth?email=${encodeURIComponent(order?.guest_email || '')}`)}
                      className="w-full">
                      {content['checkout.success.guest_prompt.button'] || 'Create Account'}
                    </Button>
                  </CardContent>
                </Card>
              )}

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
