import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Box, Sparkles, Users, Package } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <Badge className="w-fit">
                <Package className="mr-2 h-3 w-3" />
                Premium 3D Printing Services
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold">
                Restore Your Classic.{" "}
                <span className="text-primary">Enhance Your Home.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Precision 3D printed classic car parts and custom home decor. From vintage restoration components to modern interior accents, we bring your vision to life with cutting-edge technology.
              </p>
              <div className="flex gap-4">
                <Button size="lg" onClick={() => navigate("/shop")}>
                  Browse Catalog
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/generator")}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Try AI Generator
                </Button>
              </div>
              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Parts Printed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">24h</div>
                  <div className="text-sm text-muted-foreground">Fast Turnaround</div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-muted/50 rounded-lg p-8 aspect-video flex items-center justify-center">
                <Package className="h-32 w-32 text-muted-foreground/30" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Box className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-1">5000+</div>
                <p className="text-muted-foreground">Parts Available</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-1">100%</div>
                <p className="text-muted-foreground">Quality Guarantee</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-1">24/7</div>
                <p className="text-muted-foreground">Customer Support</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Pompousweek?</h2>
            <p className="text-muted-foreground">Specialized expertise in classic automotive and home decor 3D printing</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 space-y-2">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Vintage Expertise</h3>
                <p className="text-sm text-muted-foreground">Specialized in reproducing hard-to-find classic car parts with museum-quality accuracy</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 space-y-2">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Box className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Custom Home Decor</h3>
                <p className="text-sm text-muted-foreground">Transform your living space with bespoke 3D printed decorative pieces and functional art</p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 flex flex-col">
              <CardContent className="space-y-4 flex-1">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">AI-Powered Generation</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Our cutting-edge AI technology transforms your descriptions into precise 3D models. Simply describe what you need, and watch as our AI brings your vision to life with remarkable accuracy.
                </p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 flex flex-col">
              <CardContent className="space-y-4 flex-1">
                <div className="flex items-center gap-2">
                  <Box className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Premium Quality</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Every piece is crafted with precision using industrial-grade materials. Our rigorous quality control ensures perfect fitment and durability for both automotive and decorative applications.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-3xl font-bold">Ready to Create Something Amazing?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of satisfied customers who've brought their visions to life with our precision 3D printing services.
              </p>
              <Button size="lg" onClick={() => navigate("/shop")}>
                Browse Catalog
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
