import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { initFacebookSDK } from "@/utils/facebook-sdk";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import UserDashboard from "./pages/UserDashboard";
import Generator from "./pages/Generator";
import AdminStats from "./pages/AdminStats";
import Contact from "./pages/Contact";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import TermsAndConditions from "./pages/TermsAndConditions";
import DeliveryShipping from "./pages/DeliveryShipping";
import ReturnsRefunds from "./pages/ReturnsRefunds";
import ComplaintsBook from "./pages/ComplaintsBook";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfitMargins from "./pages/AdminProfitMargins";
import AdminProducts from "./pages/AdminProducts";
import AdminProductForm from "./pages/AdminProductForm";
import AdminOrders from "./pages/AdminOrders";
import AdminContentManager from "./pages/AdminContentManager";
import AdminTags from "./pages/AdminTags";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import PriceCalculator from "./pages/PriceCalculator";
import CostCalculator from "./pages/CostCalculator";
import NotFound from "./pages/NotFound";
// Calculator pages
import CalcDashboard from "./pages/calculator/CalcDashboard";
import CalcPrinters from "./pages/calculator/CalcPrinters";
import CalcFilaments from "./pages/calculator/CalcFilaments";
import CalcPrints from "./pages/calculator/CalcPrints";
import CalcSettings from "./pages/calculator/CalcSettings";
import { SetupWizard } from "./components/calculator/onboarding/SetupWizard";

const queryClient = new QueryClient();

const App = () => {
  // Optionally initialize Facebook SDK if VITE_FACEBOOK_APP_ID is set
  useEffect(() => {
    if (import.meta.env.VITE_FACEBOOK_APP_ID) {
      initFacebookSDK().catch((error) => {
        console.warn('Facebook SDK initialization failed (this is optional):', error);
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WishlistProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/products" element={<Navigate to="/shop" replace />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/generator" element={<Generator />} />
            <Route path="/admin/stats" element={<AdminStats />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/delivery-shipping" element={<DeliveryShipping />} />
            <Route path="/returns-refunds" element={<ReturnsRefunds />} />
            <Route path="/livro-reclamacoes" element={<ComplaintsBook />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/new" element={<AdminProductForm />} />
            <Route path="/admin/products/edit/:id" element={<AdminProductForm />} />
            <Route path="/admin/content" element={<AdminContentManager />} />
            <Route path="/admin/profit-margins" element={<AdminProfitMargins />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/tags" element={<AdminTags />} />
            <Route path="/price-calculator" element={<PriceCalculator />} />
            <Route path="/costcalculator" element={<CostCalculator />} />
            {/* Calculator routes - Protected for creators and admins only */}
            <Route path="/calculator" element={<ProtectedRoute requiredRole="creator"><CalcDashboard /></ProtectedRoute>} />
            <Route path="/calculator/printers" element={<ProtectedRoute requiredRole="creator"><CalcPrinters /></ProtectedRoute>} />
            <Route path="/calculator/filaments" element={<ProtectedRoute requiredRole="creator"><CalcFilaments /></ProtectedRoute>} />
            <Route path="/calculator/prints" element={<ProtectedRoute requiredRole="creator"><CalcPrints /></ProtectedRoute>} />
            <Route path="/calculator/settings" element={<ProtectedRoute requiredRole="creator"><CalcSettings /></ProtectedRoute>} />
            <Route path="/calculator/setup" element={<ProtectedRoute requiredRole="creator"><SetupWizard /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </CartProvider>
      </WishlistProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
