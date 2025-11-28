import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";

const ReturnsRefunds = () => {
  const navigate = useNavigate();
  const { content } = useContent("returns");

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <Header
        pageTitle={content["returns.header.pageTitle"] || "Returns & Refunds"}
        pageSubtitle={content["returns.header.subtitle"] || "Return Policy"}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mb-4">
              <RotateCcw className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold">
              {(() => {
                const title = content["returns.hero.title"] || "Easy Returns & Refunds";
                const words = title.split(/\s+/);
                if (words.length >= 3) {
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
              {content["returns.hero.subtitle"] || "We want you to be completely satisfied with your 3D printed products"}
            </p>
          </div>

          {/* Return Policy Section */}
          <Card>
            <CardHeader>
              <CardTitle>{content["returns.policy.title"] || "Return Policy"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {content["returns.policy.period"] || "15-day return period from delivery date"}
              </p>
              <p className="text-muted-foreground">
                {content["returns.policy.condition"] || "Products must be in original condition, unused, and in original packaging"}
              </p>
              <p className="text-muted-foreground">
                {content["returns.policy.applicable"] || "Applies to all 3D printed car parts and home decor items"}
              </p>
            </CardContent>
          </Card>

          {/* Return Process Section */}
          <Card>
            <CardHeader>
              <CardTitle>{content["returns.process.title"] || "How to Return"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>{content["returns.process.step1"] || "Contact our support team via the contact form, selecting 'Returns & Refunds'"}</li>
                <li>{content["returns.process.step2"] || "Receive return authorization and detailed instructions via email"}</li>
                <li>{content["returns.process.step3"] || "Pack items carefully in original packaging to prevent damage"}</li>
                <li>{content["returns.process.step4"] || "Ship with tracking number and keep proof of shipment"}</li>
                <li>{content["returns.process.step5"] || "Receive confirmation and refund once we process your return"}</li>
              </ol>
              <p className="text-muted-foreground">
                {content["returns.process.shipping_costs"] || "Return shipping costs are the customer's responsibility unless the item is defective or incorrect"}
              </p>
            </CardContent>
          </Card>

          {/* Refund Timeline Section */}
          <Card>
            <CardHeader>
              <CardTitle>{content["returns.refund.title"] || "Refund Process"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {content["returns.refund.processing_time"] || "Refunds are processed within 5-7 business days after receiving the returned item"}
              </p>
              <p className="text-muted-foreground">
                {content["returns.refund.method"] || "Refunds are issued to the original payment method (credit card, MB Way, PayPal)"}
              </p>
              <p className="text-muted-foreground">
                {content["returns.refund.voucher_option"] || "Alternatively, you can request a store voucher for the same amount"}
              </p>
              <p className="text-muted-foreground">
                {content["returns.refund.confirmation"] || "You'll receive an email confirmation once the refund is processed"}
              </p>
            </CardContent>
          </Card>

          {/* Damaged/Defective Items Section */}
          <Card>
            <CardHeader>
              <CardTitle>{content["returns.damaged.title"] || "Damaged or Defective Items"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {content["returns.damaged.report"] || "If you receive a damaged or defective 3D printed item, contact us immediately"}
              </p>
              <p className="text-muted-foreground">
                {content["returns.damaged.contact"] || "Use the contact form and select 'Returns & Refunds' with photos of the issue"}
              </p>
              <p className="text-muted-foreground">
                {content["returns.damaged.replacement"] || "We'll arrange a free replacement or full refund at no cost to you"}
              </p>
              <p className="text-muted-foreground">
                {content["returns.damaged.shipping_covered"] || "Return shipping costs are covered by us for damaged or defective items"}
              </p>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card className="bg-gradient-primary text-primary-foreground">
            <CardHeader className="text-center">
              <CardTitle>{content["returns.cta.title"] || "Need to Return Something?"}</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                {content["returns.cta.description"] || "Our support team is ready to assist you with your return"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/contact")}
              >
                {content["returns.cta.button"] || "Contact Support"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnsRefunds;