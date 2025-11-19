import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Shield, Headphones, Sparkles, Home as HomeIcon, Cpu, Award } from "lucide-react";
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
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl mx-auto">
            <div className="flex-1 text-center lg:text-left space-y-6">
              <div className="w-20 h-20 mx-auto lg:mx-0 mb-6 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center">
                <img 
                  src={heroCarParts} 
                  alt="Car Parts" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent leading-tight">
            {content["home.hero.title"] || "Authentic Classic Car Parts"}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl">
            {content["home.hero.subtitle"] || "Preserve automotive heritage with precision 3D-printed restoration parts"}
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/shop")}
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-glow"
          >
            {content["home.hero.cta"] || "Browse Catalog"}
          </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mt-16">
            <div className="space-y-2">
              <p className="text-4xl font-bold text-primary">{content["home.stats.parts_printed.number"] || "5000+"}</p>
              <p className="text-muted-foreground">{content["home.stats.parts_printed.label"] || "Parts Printed"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-primary">{content["home.stats.satisfaction.number"] || "98%"}</p>
              <p className="text-muted-foreground">{content["home.stats.satisfaction.label"] || "Satisfaction Rate"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-primary">{content["home.stats.turnaround.number"] || "48h"}</p>
              <p className="text-muted-foreground">{content["home.stats.turnaround.label"] || "Fast Turnaround"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all">
              <CardHeader>
                <Wrench className="w-12 h-12 text-primary mb-4" />
                <CardTitle>{content["home.features.available_parts.title"] || "Available Parts"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {content["home.features.available_parts.description"] || "From dashboard components to door handles, we specialize in hard-to-find parts"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all">
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>{content["home.features.quality.title"] || "Quality Guarantee"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {content["home.features.quality.description"] || "Premium materials and precise manufacturing ensure perfect fit and durability"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all">
              <CardHeader>
                <Headphones className="w-12 h-12 text-primary mb-4" />
                <CardTitle>{content["home.features.support.title"] || "Expert Support"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {content["home.features.support.description"] || "Our team helps you find the exact part for your classic vehicle restoration"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-primary bg-clip-text text-transparent">
            {content["home.how_it_works.title"] || "How It Works"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((step) => (
              <Card key={step} className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-md border-primary/20">
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{step}</span>
                </div>
                <CardHeader className="pt-8">
                  <CardTitle className="text-xl">{content[`home.how_it_works.step${step}.title`] || `Step ${step}`}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {content[`home.how_it_works.step${step}.description`] || "Description"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Award, key: "vintage" },
              { icon: HomeIcon, key: "decor" },
              { icon: Cpu, key: "ai" },
              { icon: Sparkles, key: "quality" }
            ].map(({ icon: Icon, key }) => (
              <Card key={key} className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <Icon className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-lg">{content[`home.usp.${key}.title`] || "Feature"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {content[`home.usp.${key}.description`] || "Description"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            {content["home.cta.title"] || "Start Your Restoration Journey"}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {content["home.cta.description"] || "Browse our catalog of authentic parts or generate custom designs"}
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/shop")}
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-glow"
          >
            {content["home.cta.button"] || "Browse Catalog"}
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
