import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import pompousweekLogo from "@/assets/pompousweek-logo.png";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";
import { useCart } from "@/contexts/CartContext";
import { validateShippingAddress } from "@/lib/validation";

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const designId = searchParams.get("design");
  const type = searchParams.get("type");
  const [isProcessing, setIsProcessing] = useState(false);
  const { content } = useContent("checkout");
  const { cartItems } = useCart();

  // New state for guest checkout
  const [isGuest, setIsGuest] = useState(false);
  const [checkoutType, setCheckoutType] = useState<'design' | 'products'>('design');
  const [guestInfo, setGuestInfo] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Portugal',
  });
  const [gdprConsent, setGdprConsent] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkAuthAndType = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsGuest(!session);
      setCheckoutType(designId ? 'design' : type === 'products' ? 'products' : 'design');
    };
    checkAuthAndType();
  }, [designId, type]);

  const handleGuestInfoChange = (field: string, value: string) => {
    setGuestInfo(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setValidationErrors({});

    if (checkoutType === 'products') {
      if (isGuest) {
        // Validate guest form
        const requiredFields = ['email', 'name', 'phone', 'address', 'city', 'postalCode', 'country'];
        const missingFields = requiredFields.filter(field => !guestInfo[field as keyof typeof guestInfo].trim());
        if (missingFields.length > 0) {
          setValidationErrors(prev => ({
            ...prev,
            ...Object.fromEntries(missingFields.map(field => [field, content["checkout.validation.required"] || "This field is required"]))
          }));
          toast.error(content["checkout.validation.form_errors"] || "Please correct the errors in the form");
          setIsProcessing(false);
          return;
        }
        if (!gdprConsent) {
          toast.error(content["checkout.validation.gdpr_required"] || "You must agree to the privacy policy to continue");
          setIsProcessing(false);
          return;
        }
        const validation = validateShippingAddress(guestInfo.address, guestInfo.city, guestInfo.postalCode, guestInfo.country, guestInfo.phone);
        if (!validation.isValid) {
          setValidationErrors(validation.errors);
          toast.error(content["checkout.validation.form_errors"] || "Please correct the errors in the form");
          setIsProcessing(false);
          return;
        }
      }

      if (cartItems.length === 0) {
        toast.error(content["checkout.product.cart_empty"] || "Your cart is empty");
        setIsProcessing(false);
        return;
      }

      const shippingInfo = isGuest ? guestInfo : {}; // For authenticated users, use profile data (assumed handled in edge function)

      try {
        const { data, error } = await supabase.functions.invoke('create-product-checkout', {
          body: { cartItems, shippingInfo, guestInfo: isGuest ? guestInfo : undefined },
        });

        if (error) throw error;

        if (data?.url) {
          window.location.href = data.url;
        } else {
          throw new Error("No checkout URL returned");
        }
      } catch (error: any) {
        console.error("Payment error:", error);
        toast.error(error.message || "Failed to initiate payment. Please try again.");
        setIsProcessing(false);
      }
    } else {
      // Design checkout (existing logic)
      if (!designId) {
        toast.error("No design selected");
        setIsProcessing(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Please login to continue");
          navigate("/auth");
          setIsProcessing(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: { designId },
        });

        if (error) throw error;

        if (data?.url) {
          window.location.href = data.url;
        } else {
          throw new Error("No checkout URL returned");
        }
      } catch (error: any) {
        console.error("Payment error:", error);
        toast.error(error.message || "Failed to initiate payment. Please try again.");
        setIsProcessing(false);
      }
    }
  };

  const calculateTotal = () => {
    if (checkoutType === 'products') {
      return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }
    return 9.99;
  };

  const isFormValid = () => {
    if (checkoutType === 'products' && isGuest) {
      return gdprConsent && Object.values(guestInfo).every(value => value.trim()) && Object.keys(validationErrors).length === 0;
    }
    return true;
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
            <img src={pompousweekLogo} alt="From Dream To Real 3D" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-bold">{content["checkout.title"] || "Checkout"}</h1>
              <p className="text-xs text-muted-foreground">{content["checkout.subtitle"] || "Complete Your Purchase"}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Guest Information Form */}
          {isGuest && checkoutType === 'products' && (
            <Card>
              <CardHeader>
                <CardTitle>{content["checkout.guest.title"] || "Guest Checkout Information"}</CardTitle>
                <CardDescription>{content["checkout.guest.description"] || "Complete your purchase without creating an account"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{content["checkout.guest.email"] || "Email Address"} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={guestInfo.email}
                      onChange={(e) => handleGuestInfoChange('email', e.target.value)}
                      disabled={isProcessing}
                    />
                    {validationErrors.email && <p className="text-sm text-destructive">{validationErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">{content["checkout.guest.name"] || "Full Name"} *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={guestInfo.name}
                      onChange={(e) => handleGuestInfoChange('name', e.target.value)}
                      disabled={isProcessing}
                    />
                    {validationErrors.name && <p className="text-sm text-destructive">{validationErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{content["checkout.guest.phone"] || "Phone Number"} *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={guestInfo.phone}
                      onChange={(e) => handleGuestInfoChange('phone', e.target.value)}
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-muted-foreground">{content["checkout.guest.phone_hint"] || "Include country code (e.g., +351 912 345 678)"}</p>
                    {validationErrors.phone && <p className="text-sm text-destructive">{validationErrors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">{content["checkout.guest.address"] || "Street Address"} *</Label>
                    <Input
                      id="address"
                      type="text"
                      value={guestInfo.address}
                      onChange={(e) => handleGuestInfoChange('address', e.target.value)}
                      disabled={isProcessing}
                    />
                    {validationErrors.address && <p className="text-sm text-destructive">{validationErrors.address}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{content["checkout.guest.city"] || "City"} *</Label>
                    <Input
                      id="city"
                      type="text"
                      value={guestInfo.city}
                      onChange={(e) => handleGuestInfoChange('city', e.target.value)}
                      disabled={isProcessing}
                    />
                    {validationErrors.city && <p className="text-sm text-destructive">{validationErrors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">{content["checkout.guest.postal_code"] || "Postal Code"} *</Label>
                    <Input
                      id="postalCode"
                      type="text"
                      value={guestInfo.postalCode}
                      onChange={(e) => handleGuestInfoChange('postalCode', e.target.value)}
                      placeholder="1000-001"
                      disabled={isProcessing}
                    />
                    {validationErrors.postal_code && <p className="text-sm text-destructive">{validationErrors.postal_code}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="country">{content["checkout.guest.country"] || "Country"} *</Label>
                    <Input
                      id="country"
                      type="text"
                      value={guestInfo.country}
                      onChange={(e) => handleGuestInfoChange('country', e.target.value)}
                      disabled={isProcessing}
                    />
                    {validationErrors.country && <p className="text-sm text-destructive">{validationErrors.country}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gdpr"
                    checked={gdprConsent}
                    onCheckedChange={(checked) => setGdprConsent(checked === true)}
                    disabled={isProcessing}
                  />
                  <Label htmlFor="gdpr" className="text-sm">
                    {content["checkout.guest.gdpr_consent"] || "I agree to the processing of my personal data in accordance with the"}{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      {content["checkout.guest.privacy_policy"] || "Privacy Policy"}
                    </Link>
                  </Label>
                </div>
                <div className="text-sm text-muted-foreground">
                  {content["checkout.guest.have_account"] || "Already have an account?"}{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/auth?returnUrl=" + encodeURIComponent(window.location.pathname + window.location.search))}>
                    {content["checkout.guest.login"] || "Log in"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{content["checkout.summary.title"] || "Order Summary"}</CardTitle>
              <CardDescription>
                {checkoutType === 'products' ? (content["checkout.product.title"] || "Product Checkout") : (content["checkout.summary.description"] || "3D Model Generation")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkoutType === 'products' ? (
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.product.name} (x{item.quantity})</span>
                      <span>€{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between items-center text-lg font-semibold">
                    <span>{content["checkout.summary.total"] || "Total"}</span>
                    <span className="text-primary">€{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>{content["checkout.summary.total"] || "Total"}</span>
                  <span className="text-primary">€9.99</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>{content["checkout.payment.title"] || "Payment Method"}</CardTitle>
              <CardDescription>
                {content["checkout.payment.subtitle"] || "Secure payment powered by Stripe"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{content["checkout.payment.methods.title"] || "Accepted Payment Methods"}</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>{content["checkout.payment.methods.cards"] || "• Credit & Debit Cards (Visa, Mastercard, Amex)"}</li>
                      <li>{content["checkout.payment.methods.paypal"] || "• PayPal"}</li>
                      <li>{content["checkout.payment.methods.multibanco"] || "• Multibanco (Portugal)"}</li>
                      <li>{content["checkout.payment.methods.mbway"] || "• MB WAY available through Multibanco"}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                className="w-full"
                size="lg"
                disabled={isProcessing || !isFormValid()}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {content["checkout.payment.processing"] || "Redirecting to Stripe..."}
                  </>
                ) : (
                  checkoutType === 'products'
                    ? `Pay €${calculateTotal().toFixed(2)} with Stripe`
                    : (content["checkout.payment.button"] || "Pay €9.99 with Stripe")
                )}
              </Button>

              <div className="text-xs text-muted-foreground space-y-1 text-center">
                <p>{content["checkout.security.stripe"] || "🔒 Your payment is secured by Stripe"}</p>
                <p>{content["checkout.security.methods"] || "💳 All major payment methods accepted"}</p>
                <p>{content["checkout.security.portuguese"] || "🇵🇹 Portuguese payment methods supported"}</p>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                {content["checkout.terms"] || "By completing this purchase, you agree to our Terms of Service"}
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
