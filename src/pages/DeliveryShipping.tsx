import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";

const DeliveryShipping = () => {
  const navigate = useNavigate();
  const { content } = useContent("delivery");

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <Header
        pageTitle={content["delivery.header.pageTitle"] || "Delivery & Shipping"}
        pageSubtitle={content["delivery.header.subtitle"] || "Shipping Information"}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mb-4">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold">
              {(() => {
                const title = content["delivery.hero.title"] || "Fast & Reliable Delivery";
                const words = title.split(/\s+/);
                if (words.length >= 2) {
                  const lastWords = words.slice(-2).join(" ");
                  const firstWords = words.slice(0, -2).join(" ");
                  return (
                    <>
                      {firstWords}{" "}
                      <span className="bg-gradient-primary bg-clip-text text-transparent">
                        {lastWords}
                      </span>
                    </>
                  );
                }
                return title;
              })()}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {content["delivery.hero.subtitle"] || "Get your 3D printed parts delivered quickly and safely"}
            </p>
          </div>

          {/* Delivery Times Card */}
          <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-tertiary/5 hover:scale-105 hover:shadow-glow hover:border-primary/50 transition-all duration-300">
            <CardHeader>
              <CardTitle>{content["delivery.times.title"] || "Delivery Times"}</CardTitle>
              <CardDescription>
                {content["delivery.times.subtitle"] || "When will you receive your order"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {content["delivery.times.portugal_continental"] || "24h/48h delivery to Portugal Continental for all 3D printed car parts and home decor items"}
              </p>
              <p className="text-muted-foreground">
                {content["delivery.times.cutoff"] || "Orders placed and paid before 15:45 are dispatched the same day"}
              </p>
              <p className="text-muted-foreground">
                {content["delivery.times.processing"] || "Custom AI-generated models may require 1-2 additional days for processing and printing"}
              </p>
              <p className="text-muted-foreground">
                {content["delivery.times.business_days"] || "Delivery times are calculated in business days (Monday to Friday)"}
              </p>
            </CardContent>
          </Card>

          {/* Shipping Costs Card */}
          <Card className="hover:scale-105 hover:shadow-glow hover:border-primary/50 transition-all duration-300">
            <CardHeader>
              <CardTitle>{content["delivery.costs.title"] || "Shipping Costs"}</CardTitle>
              <CardDescription>
                {content["delivery.costs.subtitle"] || "Transparent pricing"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>{content["delivery.costs.portugal_standard"] || "Portugal Continental: €2.99 for standard delivery (1-5 business days)"}</li>
                <li>{content["delivery.costs.portugal_express"] || "Express delivery (24h/48h): €4.99 for urgent orders"}</li>
                <li>{content["delivery.costs.pickup"] || "Pickup point option: €1.99 (collect at your convenience)"}</li>
                <li>{content["delivery.costs.free_shipping"] || "Free shipping on orders over €50"}</li>
                <li>{content["delivery.costs.islands"] || "Azores and Madeira: Additional costs apply, calculated at checkout"}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Order Tracking Card */}
          <Card className="hover:scale-105 hover:shadow-glow hover:border-primary/50 transition-all duration-300">
            <CardHeader>
              <CardTitle>{content["delivery.tracking.title"] || "Order Tracking"}</CardTitle>
              <CardDescription>
                {content["delivery.tracking.subtitle"] || "Follow your order"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {content["delivery.tracking.email"] || "You'll receive a shipping confirmation email with a tracking number when your 3D printed parts are dispatched"}
              </p>
              <p className="text-muted-foreground">
                {content["delivery.tracking.dashboard"] || "Track your order status in real-time through your user dashboard"}
              </p>
              <p className="text-muted-foreground">
                {content["delivery.tracking.updates"] || "Receive automatic updates via email at each delivery milestone"}
              </p>
              <p className="text-muted-foreground">
                {content["delivery.tracking.estimated"] || "Estimated delivery dates are provided at checkout and in your order confirmation"}
              </p>
            </CardContent>
          </Card>

          {/* International Shipping Card */}
          <Card className="hover:scale-105 hover:shadow-glow hover:border-primary/50 transition-all duration-300">
            <CardHeader>
              <CardTitle>{content["delivery.international.title"] || "International Shipping"}</CardTitle>
              <CardDescription>
                {content["delivery.international.subtitle"] || "Worldwide delivery"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {content["delivery.international.eu"] || "European Union: 3-7 business days, starting at €9.99"}
              </p>
              <p className="text-muted-foreground">
                {content["delivery.international.europe"] || "Rest of Europe: 5-10 business days, starting at €14.99"}
              </p>
              <p className="text-muted-foreground">
                {content["delivery.international.worldwide"] || "Worldwide shipping: 7-15 business days, costs calculated at checkout"}
              </p>
              <p className="text-muted-foreground">
                {content["delivery.international.customs"] || "International orders may be subject to customs duties and taxes in the destination country"}
              </p>
              <p className="text-muted-foreground">
                {content["delivery.international.contact"] || "For large or custom orders, contact us for special shipping arrangements"}
              </p>
            </CardContent>
          </Card>

          {/* CTA Card */}
          <Card className="bg-gradient-primary text-primary-foreground hover:scale-105 hover:shadow-glow hover:border-primary/50 transition-all duration-300">
            <CardHeader className="text-center">
              <CardTitle>{content["delivery.cta.title"] || "Questions About Shipping?"}</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                {content["delivery.cta.description"] || "Our support team is here to help with any delivery questions"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/contact")}
              >
                {content["delivery.cta.button"] || "Contact Support"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DeliveryShipping;