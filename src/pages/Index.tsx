import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Box, Sparkles, Users, Package } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import heroCarParts from "@/assets/hero-car-parts.jpg";
import { useContent } from "@/hooks/useContent";

export default function Index() {
  const navigate = useNavigate();
  const { content, isLoading } = useContent("home");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

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
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Enhance Your Home.
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                {content["home.hero.subtitle"] || "Preserve automotive heritage with precision 3D-printed restoration parts"}
              </p>
              <div className="flex gap-4">
                <Button size="lg" onClick={() => navigate("/shop")}>
                  {content["home.hero.cta"] || "Browse Catalog"}
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/generator")}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Custom Part
                </Button>
              </div>
              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {content["home.stats.parts_printed.number"] || "5000+"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {content["home.stats.parts_printed.label"] || "Parts Printed"}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {content["home.stats.satisfaction.number"] || "98%"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {content["home.stats.satisfaction.label"] || "Satisfaction Rate"}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {content["home.stats.turnaround.number"] || "48h"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {content["home.stats.turnaround.label"] || "Fast Turnaround"}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-muted/50 rounded-lg overflow-hidden aspect-video">
                <img 
                  src={heroCarParts} 
                  alt="Car Parts Collection" 
                  className="w-full h-full object-cover"
                />
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
                <p className="text-muted-foreground">
                  {content["home.features.available_parts.title"] || "Parts Available"}
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div className="text-3xl font-bold mb-1">100%</div>
                <p className="text-muted-foreground">
                  {content["home.features.quality.title"] || "Quality Guarantee"}
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Cpu className="h-6 w-6 text-accent" />
                </div>
                <div className="text-3xl font-bold mb-1">AI</div>
                <p className="text-muted-foreground">
                  {content["home.usp.ai.title"] || "Powered"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {content["home.how_it_works.title"] || "Why Choose Us"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Premium quality 3D-printed parts for classic car restoration and custom home decor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">
                  {content["home.usp.vintage.title"] || "Vintage Expertise"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {content["home.usp.vintage.description"] || "Specialized in classic car parts from the 1950s-1980s era"}
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg">
                  {content["home.usp.quality.title"] || "Premium Quality"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {content["home.usp.quality.description"] || "Professional-grade materials and precision manufacturing"}
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg">
                  {content["home.usp.ai.title"] || "AI-Powered"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {content["home.usp.ai.description"] || "Use our advanced AI to generate custom 3D models from descriptions"}
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Box className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">
                  {content["home.usp.decor.title"] || "Custom Decor"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {content["home.usp.decor.description"] || "Transform your space with automotive-inspired decorative pieces"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {content["home.how_it_works.title"] || "How It Works"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple steps to get your custom parts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-primary">
                1
              </div>
              <h3 className="font-semibold text-lg">
                {content["home.how_it_works.step1.title"] || "Browse Our Catalog"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {content["home.how_it_works.step1.description"] || "Search our extensive collection of classic car parts and home decorations"}
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-secondary">
                2
              </div>
              <h3 className="font-semibold text-lg">
                {content["home.how_it_works.step2.title"] || "Place Your Order"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {content["home.how_it_works.step2.description"] || "Select your part, specify any customizations, and complete checkout"}
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-accent">
                3
              </div>
              <h3 className="font-semibold text-lg">
                {content["home.how_it_works.step3.title"] || "Receive Your Part"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {content["home.how_it_works.step3.description"] || "We 3D print and deliver your part with quality assurance"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                {content["home.cta.title"] || "Start Your Restoration Journey"}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                {content["home.cta.description"] || "Browse our catalog of authentic parts or generate custom designs"}
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" onClick={() => navigate("/shop")}>
                  {content["home.cta.button"] || "Browse Catalog"}
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/generator")}>
                  <Cpu className="mr-2 h-4 w-4" />
                  Try AI Generator
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
