import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Calendar, CreditCard, User, MapPin, ChevronDown } from "lucide-react";
import DesignHistory from "@/components/DesignHistory";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import OrderStatusTimeline from '@/components/OrderStatusTimeline';
import pompousweekLogo from "@/assets/pompousweek-logo.png";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";
import { 
  validatePhone, 
  validateShippingAddress, 
  formatPhoneNumber,
  validatePostalCode 
} from "@/lib/validation";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  payment_status: string;
  created_at: string;
  designs: {
    prompt_text: string;
    category: string;
  };
}

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  vat_number?: string;
  company_name?: string;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  shipping_address: string;
  tracking_number?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  product: {
    name: string;
    images: string[];
  };
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { content } = useContent("dashboard");
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const activeTab = searchParams.get('tab') || 'designs';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    await fetchData(user.id);
  };

  const fetchData = async (userId: string) => {
    try {
      const [paymentsRes, profileRes, ordersRes] = await Promise.all([
        supabase
          .from("payments")
          .select("*, designs(prompt_text, category)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single(),
        supabase
          .from('orders')
          .select('*, order_items(*, products(name, images))')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
      ]);

      if (paymentsRes.data) setPayments(paymentsRes.data);
      if (profileRes.data) setProfile(profileRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'paid': return 'default';
      case 'shipped': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
    return nameRegex.test(name.trim());
  };

  const handlePersonalInfoUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate first and last name
    if (!profile?.first_name?.trim() || !profile?.last_name?.trim()) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required for shipping addresses.",
        variant: "destructive",
      });
      return;
    }

    if (!validateName(profile.first_name)) {
      toast({
        title: "Invalid First Name",
        description: "First name should only contain letters, spaces, hyphens, and apostrophes (2-50 characters).",
        variant: "destructive",
      });
      return;
    }

    if (!validateName(profile.last_name)) {
      toast({
        title: "Invalid Last Name",
        description: "Last name should only contain letters, spaces, hyphens, and apostrophes (2-50 characters).",
        variant: "destructive",
      });
      return;
    }

    // Validate phone if provided
    if (profile.phone && profile.phone.trim()) {
      const phoneValidation = validatePhone(profile.phone, profile.country || undefined);
      if (!phoneValidation.isValid) {
        toast({
          title: "Invalid Phone Number",
          description: phoneValidation.error,
          variant: "destructive",
        });
        return;
      }
    }

    setSaving(true);

    try {
      const formattedPhone = profile.phone ? formatPhoneNumber(profile.phone, profile.country || undefined) : null;

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name.trim(),
          last_name: profile.last_name.trim(),
          phone: formattedPhone,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Personal info updated",
        description: "Your personal information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update personal info. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBillingAddressUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profile) return;

    // Validate address fields if any are provided
    const hasAnyAddressField = profile.address || profile.city || profile.postal_code || profile.country;
    
    if (hasAnyAddressField) {
      const addressValidation = validateShippingAddress(
        profile.address || '',
        profile.city || '',
        profile.postal_code || '',
        profile.country || '',
        profile.phone || ''
      );

      if (!addressValidation.isValid) {
        const firstError = Object.values(addressValidation.errors)[0];
        toast({
          title: "Validation Error",
          description: firstError,
          variant: "destructive",
        });
        return;
      }
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          address: profile.address?.trim() || null,
          city: profile.city?.trim() || null,
          postal_code: profile.postal_code?.trim() || null,
          country: profile.country?.trim() || null,
          vat_number: profile.vat_number?.trim() || null,
          company_name: profile.company_name?.trim() || null,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Billing info updated",
        description: "Your billing and address information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update billing info. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
              <img src={pompousweekLogo} alt="Pompousweek" className="h-10 w-auto cursor-pointer" onClick={() => navigate("/")} />
              <div>
                <h1 className="text-xl font-bold">{content["dashboard.title"] || "My Dashboard"}</h1>
                <p className="text-xs text-muted-foreground">{content["dashboard.subtitle"] || "Manage your account"}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>
              {content["dashboard.back_home"] || "Back to Home"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(newTab) => navigate(`/dashboard?tab=${newTab}`, { replace: true })} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="designs">{content["dashboard.tabs.designs"] || "My Designs"}</TabsTrigger>
            <TabsTrigger value="orders">{content["dashboard.tabs.orders"] || "Order History"}</TabsTrigger>
            <TabsTrigger value="profile">{content["dashboard.tabs.profile"] || "Personal Info"}</TabsTrigger>
            <TabsTrigger value="billing">{content["dashboard.tabs.billing"] || "Billing & Address"}</TabsTrigger>
          </TabsList>

          <TabsContent value="designs">
            <DesignHistory refreshTrigger={0} />
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {content["dashboard.orders.title"] || "Order History"}
                </CardTitle>
                <CardDescription>{content["dashboard.orders.description"] || "Track your physical product orders"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">{content["dashboard.orders.empty"] || "No orders yet"}</p>
                      <Button onClick={() => navigate("/products")}>{content["dashboard.orders.empty.cta"] || "Browse Products"}</Button>
                    </div>
                  ) : (
                    orders.map((order) => {
                      const address = JSON.parse(order.shipping_address);
                      return (
                        <Card key={order.id} className="mb-4">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle>{content["dashboard.orders.order_id"] || "Order ID"}: {order.id.slice(-8)}</CardTitle>
                                <CardDescription>{content["dashboard.orders.placed_on"] || "Placed on"} {new Date(order.created_at).toLocaleDateString()}</CardDescription>
                              </div>
                              <Badge variant={getStatusColor(order.status)}>{content[`dashboard.orders.status.${order.status}`]}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between">
                              <span className="font-semibold">{content["dashboard.orders.total"] || "Total"}: €{order.total_amount.toFixed(2)}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">{content["dashboard.orders.items.title"] || "Order Items"}</h4>
                              <div className="space-y-2">
                                {order.order_items?.map((item) => (
                                  <div key={item.id} className="flex items-center gap-4 p-2 border rounded">
                                    <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 object-cover rounded" />
                                    <div>
                                      <p className="font-medium">{item.product.name}</p>
                                      <p className="text-sm text-muted-foreground">Qty: {item.quantity} x €{item.price_at_purchase.toFixed(2)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <OrderStatusTimeline
                              status={order.status}
                              createdAt={order.created_at}
                              estimatedDelivery={order.estimated_delivery}
                              trackingNumber={order.tracking_number}
                              content={content}
                            />
                            <Button
                              variant="outline"
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className="w-full"
                            >
                              {expandedOrder === order.id ? 'Hide Details' : 'Show Details'}
                              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                            </Button>
                            {expandedOrder === order.id && (
                              <div className="mt-4 p-4 bg-muted/30 rounded">
                                <h4 className="font-semibold mb-2">{content["dashboard.orders.shipping.title"] || "Shipping Address"}</h4>
                                <p>{address.street}, {address.city}, {address.postal_code}, {address.country}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {content["dashboard.profile.title"] || "Personal Information"}
                </CardTitle>
                <CardDescription>{content["dashboard.profile.description"] || "Update your personal details"}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePersonalInfoUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{content["dashboard.profile.email"] || "Email"}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ""}
                      disabled
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">
                        {content["dashboard.profile.first_name"] || "First Name"} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="first_name"
                        value={profile?.first_name || ""}
                        onChange={(e) => setProfile({ ...profile!, first_name: e.target.value })}
                        placeholder={content["dashboard.profile.first_name.placeholder"] || "John"}
                        required
                      />
                      <p className="text-xs text-muted-foreground">{content["dashboard.profile.first_name.required"] || "Required for shipping"}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">
                        {content["dashboard.profile.last_name"] || "Last Name"} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="last_name"
                        value={profile?.last_name || ""}
                        onChange={(e) => setProfile({ ...profile!, last_name: e.target.value })}
                        placeholder={content["dashboard.profile.last_name.placeholder"] || "Doe"}
                        required
                      />
                      <p className="text-xs text-muted-foreground">{content["dashboard.profile.first_name.required"] || "Required for shipping"}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      {content["dashboard.profile.phone"] || "Phone Number"} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile?.phone || ""}
                      onChange={(e) => setProfile({ ...profile!, phone: e.target.value })}
                      placeholder="+1234567890"
                      autoComplete="tel"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {content["dashboard.profile.phone.help"] || "Required for order updates. Use international format (e.g., +1234567890)"}
                    </p>
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {content["dashboard.profile.save"] || "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {content["dashboard.billing.title"] || "Billing & Address Information"}
                </CardTitle>
                <CardDescription>{content["dashboard.billing.description"] || "Manage your invoicing details"}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBillingAddressUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">{content["dashboard.billing.company"] || "Company Name (Optional)"}</Label>
                    <Input
                      id="company_name"
                      value={profile?.company_name || ""}
                      onChange={(e) => setProfile({ ...profile!, company_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vat_number">{content["dashboard.billing.vat"] || "VAT Number (Optional)"}</Label>
                    <Input
                      id="vat_number"
                      value={profile?.vat_number || ""}
                      onChange={(e) => setProfile({ ...profile!, vat_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">
                      {content["dashboard.billing.address"] || "Street Address"} <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="address"
                      value={profile?.address || ""}
                      onChange={(e) => setProfile({ ...profile!, address: e.target.value })}
                      placeholder="123 Main Street, Apt 4B"
                      autoComplete="street-address"
                      required
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground">{content["dashboard.billing.address.required"] || "Required for product shipping"}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        {content["dashboard.billing.city"] || "City"} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        value={profile?.city || ""}
                        onChange={(e) => setProfile({ ...profile!, city: e.target.value })}
                        placeholder="London"
                        autoComplete="address-level2"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">
                        {content["dashboard.billing.postal_code"] || "Postal Code"} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="postal_code"
                        value={profile?.postal_code || ""}
                        onChange={(e) => setProfile({ ...profile!, postal_code: e.target.value })}
                        placeholder="SW1A 1AA"
                        autoComplete="postal-code"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">
                        {content["dashboard.billing.country"] || "Country"} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="country"
                        value={profile?.country || ""}
                        onChange={(e) => setProfile({ ...profile!, country: e.target.value })}
                        placeholder="United Kingdom"
                        autoComplete="country-name"
                        required
                      />
                      <p className="text-xs text-muted-foreground">{content["dashboard.billing.country.help"] || "Use 2-letter code (e.g., GB, US, DE)"}</p>
                    </div>
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {content["dashboard.billing.save"] || "Save Billing Info"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;
