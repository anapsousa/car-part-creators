import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, Users, Heart } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
const About = () => {
  const navigate = useNavigate();
  const values = [{
    icon: Zap,
    title: "Innovation",
    description: "Leveraging cutting-edge AI technology to make 3D modeling accessible to everyone"
  }, {
    icon: Shield,
    title: "Quality",
    description: "Delivering high-quality, print-ready models that meet professional standards"
  }, {
    icon: Users,
    title: "Community",
    description: "Building a community of makers, designers, and 3D printing enthusiasts"
  }, {
    icon: Heart,
    title: "Passion",
    description: "Driven by our love for innovation, design, and helping others create"
  }];
  return <div className="min-h-screen bg-gradient-mesh">
      <Header pageTitle="About Us" pageSubtitle="Our Story" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">
              Empowering{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Creators
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're on a mission to democratize 3D design and make custom manufacturing accessible to everyone
            </p>
          </div>

          {/* Story Section */}
          <Card>
            <CardHeader>
              <CardTitle>Our Story</CardTitle>
              <CardDescription>How it all began</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Founded in 2021, Pompousweek started with a simple idea around Quality Assurance. Then we decided to grow as company and had this idea: what if anyone could create professional-quality 3D models without years of CAD training? We saw the rise of 3D printing and AI technology converging, creating a unique opportunity to bridge the gap between imagination and reality.
              </p>
              <p>
                Our team of engineers, designers, and AI specialists came together to build a platform that 
                understands your needs and translates them into print-ready 3D models. Whether you're a hobbyist 
                looking to create custom car parts or a designer crafting unique home decorations, we're here to 
                help you bring your ideas to life.
              </p>
              <p>
                Today, we're proud to serve a growing community of makers, DIY enthusiasts, and professional 
                designers who use our platform to create everything from functional prototypes to artistic masterpieces.
              </p>
            </CardContent>
          </Card>

          {/* Values Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Our Values</h3>
              <p className="text-muted-foreground">What drives us every day</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => {
              const Icon = value.icon;
              return <Card 
                key={index}
                className="transition-all duration-300 hover:scale-105 hover:shadow-glow hover:border-primary/50"
              >
                    <CardHeader>
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 mb-2 transition-all duration-300 group-hover:bg-primary/30">
                        <Icon className="h-6 w-6 text-primary" />
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
          <Card className="bg-gradient-primary text-primary-foreground">
            <CardHeader className="text-center">
              <CardTitle>Join Our Community</CardTitle>
              <CardDescription className="text-primary-foreground/80">
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