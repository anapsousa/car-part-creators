import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Calendar, CreditCard, User, MapPin } from "lucide-react";
import DesignHistory from "@/components/DesignHistory";
import pompousweekLogo from "@/assets/pompousweek-logo.png";
import { Footer } from "@/components/Footer";
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

const UserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

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
      const [paymentsRes, profileRes] = await Promise.all([
        supabase
          .from("payments")
          .select("*, designs(prompt_text, category)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single()
      ]);

      if (paymentsRes.data) setPayments(paymentsRes.data);
      if (profileRes.data) setProfile(profileRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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
                <h1 className="text-xl font-bold">My Dashboard</h1>
                <p className="text-xs text-muted-foreground">Manage your account</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="designs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="designs">My Designs</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="profile">Personal Info</TabsTrigger>
            <TabsTrigger value="billing">Billing & Address</TabsTrigger>
          </TabsList>

          <TabsContent value="designs">
            <DesignHistory refreshTrigger={0} />
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment History
                </CardTitle>
                <CardDescription>View all your past transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No payments yet</p>
                  ) : (
                    payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{payment.designs?.prompt_text || "3D Model"}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString()} • {payment.designs?.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {payment.currency} {payment.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">{payment.payment_status}</p>
                        </div>
                      </div>
                    ))
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
                  Personal Information
                </CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePersonalInfoUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
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
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="first_name"
                        value={profile?.first_name || ""}
                        onChange={(e) => setProfile({ ...profile!, first_name: e.target.value })}
                        placeholder="John"
                        required
                      />
                      <p className="text-xs text-muted-foreground">Required for shipping</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">
                        Last Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="last_name"
                        value={profile?.last_name || ""}
                        onChange={(e) => setProfile({ ...profile!, last_name: e.target.value })}
                        placeholder="Doe"
                        required
                      />
                      <p className="text-xs text-muted-foreground">Required for shipping</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-destructive">*</span>
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
                      Required for order updates. Use international format (e.g., +1234567890)
                    </p>
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
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
                  Billing & Address Information
                </CardTitle>
                <CardDescription>Manage your invoicing details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBillingAddressUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name (Optional)</Label>
                    <Input
                      id="company_name"
                      value={profile?.company_name || ""}
                      onChange={(e) => setProfile({ ...profile!, company_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vat_number">VAT Number (Optional)</Label>
                    <Input
                      id="vat_number"
                      value={profile?.vat_number || ""}
                      onChange={(e) => setProfile({ ...profile!, vat_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Street Address <span className="text-destructive">*</span>
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
                    <p className="text-xs text-muted-foreground">Required for product shipping</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        City <span className="text-destructive">*</span>
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
                        Postal Code <span className="text-destructive">*</span>
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
                        Country <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="country"
                        value={profile?.country || ""}
                        onChange={(e) => setProfile({ ...profile!, country: e.target.value })}
                        placeholder="United Kingdom"
                        autoComplete="country-name"
                        required
                      />
                      <p className="text-xs text-muted-foreground">Use 2-letter code (e.g., GB, US, DE)</p>
                    </div>
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Billing Info
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
