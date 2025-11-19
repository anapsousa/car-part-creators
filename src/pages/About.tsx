import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, Users, Heart } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";

const About = () => {
  const navigate = useNavigate();
  const { content } = useContent("about");
  
  const values = [{
    icon: Zap,
    title: content["about.values.innovation.title"] || "Innovation",
    description: content["about.values.innovation.description"] || "Leveraging cutting-edge AI technology to make 3D modeling accessible to everyone"
  }, {
    icon: Shield,
    title: content["about.values.quality.title"] || "Quality",
    description: content["about.values.quality.description"] || "Delivering high-quality, print-ready models that meet professional standards"
  }, {
    icon: Users,
    title: content["about.values.community.title"] || "Community",
    description: content["about.values.community.description"] || "Building a community of makers, designers, and 3D printing enthusiasts"
  }, {
    icon: Heart,
    title: content["about.values.passion.title"] || "Passion",
    description: content["about.values.passion.description"] || "Driven by our love for innovation, design, and helping others create"
  }];
  return <div className="min-h-screen bg-gradient-mesh">
      <Header pageTitle="About Us" pageSubtitle="Our Story" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">
              {(() => {
                const title = content["about.hero.title"] || "Empowering Creators";
                const parts = title.split(/\s+/);
                if (parts.length >= 2) {
                  return (
                    <>
                      {parts[0]}{" "}
                      <span className="bg-gradient-primary bg-clip-text text-transparent">
                        {parts.slice(1).join(" ")}
                      </span>
                    </>
                  );
                }
                return title;
              })()}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {content["about.hero.subtitle"] || "We're on a mission to democratize 3D design and make custom manufacturing accessible to everyone"}
            </p>
          </div>

          {/* Story Section */}
          <Card className="border-2 bg-gradient-to-br from-primary/5 via-secondary/5 to-tertiary/5">
            <CardHeader>
              <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
                {content["about.story.title"] || "Our Story"}
              </CardTitle>
              <CardDescription>{content["about.story.subtitle"] || "How it all began"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                {content["about.story.paragraph1"] || "Founded in 2021, Pompousweek started with a simple idea around Quality Assurance. Then we decided to grow as company and had this idea: what if anyone could create professional-quality 3D models without years of CAD training? We saw the rise of 3D printing and AI technology converging, creating a unique opportunity to bridge the gap between imagination and reality."}
              </p>
              <p>
                {content["about.story.paragraph2"] || "Our team of engineers, designers, and AI specialists came together to build a platform that understands your needs and translates them into print-ready 3D models. Whether you're a hobbyist looking to create custom car parts or a designer crafting unique home decorations, we're here to help you bring your ideas to life."}
              </p>
              <p>
                {content["about.story.paragraph3"] || "Today, we're proud to serve a growing community of makers, DIY enthusiasts, and professional designers who use our platform to create everything from functional prototypes to artistic masterpieces."}
              </p>
            </CardContent>
          </Card>

          {/* Values Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">
                {(() => {
                  const title = content["about.values.heading"] || "Our Values";
                  const parts = title.split(/\s+/);
                  if (parts.length >= 2) {
                    return (
                      <>
                        {parts[0]}{" "}
                        <span className="bg-gradient-primary bg-clip-text text-transparent">
                          {parts.slice(1).join(" ")}
                        </span>
                      </>
                    );
                  }
                  return title;
                })()}
              </h3>
              <p className="text-muted-foreground">{content["about.values.subtitle"] || "What drives us every day"}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => {
              const Icon = value.icon;
              const bgColors = ['bg-primary/10', 'bg-secondary/10', 'bg-tertiary/10', 'bg-primary/10'];
              const textColors = ['text-primary', 'text-secondary', 'text-tertiary', 'text-primary'];
              return <Card 
                key={index}
                className="transition-all duration-300 hover:scale-105 hover:shadow-glow hover:border-primary/50 bg-gradient-to-br from-card via-card to-primary/5"
              >
                    <CardHeader>
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${bgColors[index]} mb-2 transition-all duration-300 hover:scale-110`}>
                        <Icon className={`h-6 w-6 ${textColors[index]}`} />
                      </div>
                      <CardTitle>{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>;
            })}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-tertiary/10 border-2 border-transparent shadow-glow">
            <CardHeader className="text-center">
              <CardTitle>Join Our <span className="bg-gradient-primary bg-clip-text text-transparent">Community</span></CardTitle>
              <CardDescription>
                Start creating amazing 3D models today
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center gap-4">
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => navigate("/")} 
                className="transition-all duration-300 hover:scale-105 hover:shadow-glow"
              >
                Get Started
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => navigate("/contact")} 
                className="transition-all duration-300 hover:scale-105 hover:shadow-glow"
              >
                Contact Us
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>;
};
export default About;