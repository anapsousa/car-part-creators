import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";

const About = () => {
  const navigate = useNavigate();
  const { content } = useContent("about");
  
  return <div className="min-h-screen bg-gradient-mesh">
      <Helmet>
        <title>About Dr3amToReal | Design-Led 3D Printing Studio in Portugal</title>
        <meta name="description" content="Dr3amToReal is a design-led 3D printing studio based in Portugal, creating custom parts, original designs, and personalised objects with care." />
        <link rel="canonical" href="https://dr3amtoreal.com/about" />
        <meta property="og:title" content="About Dr3amToReal | Design-Led 3D Printing Studio in Portugal" />
        <meta property="og:description" content="Dr3amToReal is a design-led 3D printing studio based in Portugal, creating custom parts, original designs, and personalised objects with care." />
        <meta property="og:url" content="https://dr3amtoreal.com/about" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section - Short Version */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">
              {(() => {
                const title = content["about.hero.title"] || "From dream to real object";
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
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {content["about.hero.subtitle"] || "Dr3amToReal was born from a long-standing passion for building things that matter — objects that solve a problem, carry meaning, or simply feel right in your hands."}
            </p>
            <p className="text-sm text-muted-foreground">
              <a href="/#manifesto" className="text-primary hover:underline">Learn more about our values and approach</a>
            </p>
          </div>

          {/* About Dr3amToReal Section */}
          <Card className="border-2 bg-gradient-to-br from-primary/5 via-secondary/5 to-tertiary/5">
            <CardHeader>
              <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
                {content["about.intro.title"] || "About Dr3amToReal"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                {content["about.intro.paragraph1"] || "Dr3amToReal is a creative 3D-printing studio based in Portugal, focused on custom parts, original designs, and personalised objects — from functional components to decorative pieces."}
              </p>
              <p>
                {content["about.intro.paragraph2"] || "This brand started as a dream: the desire to design the right object, print it properly, test it thoroughly, and make it available for others who care about quality and detail as much as I do."}
              </p>
              <p>
                {content["about.intro.paragraph3"] || "Behind Dr3amToReal is PompousWeek Unipessoal Lda, a company originally founded around Quality Assurance, engineering services, and training. Quality has always been the foundation — and it naturally carried over into physical creation."}
              </p>
              <p>
                {content["about.intro.paragraph4"] || "What began with a love for old cars and hard-to-find replacement parts quickly grew into something broader: a space to design and produce objects that are functional, beautiful, and personal."}
              </p>
            </CardContent>
          </Card>

          {/* What I Create Section */}
          <Card className="border-2 bg-gradient-to-br from-primary/5 via-secondary/5 to-tertiary/5">
            <CardHeader>
              <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
                {content["about.whatICreate.title"] || "What I create"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                {content["about.whatICreate.description"] || "Dr3amToReal focuses on:"}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{content["about.whatICreate.item1"] || "Custom and replacement parts, especially for older or discontinued models"}</li>
                <li>{content["about.whatICreate.item2"] || "Home décor and functional objects, designed in-house"}</li>
                <li>{content["about.whatICreate.item3"] || "Personalised prints, adapted to your taste, dimensions, or use case"}</li>
                <li>{content["about.whatICreate.item4"] || "Small-batch and one-off pieces — not mass production"}</li>
              </ul>
              <p className="mt-4">
                {content["about.whatICreate.note"] || "Every design goes through iteration, testing, and refinement before it's offered for sale."}
              </p>
            </CardContent>
          </Card>

          {/* How This Is Different Section */}
          <Card className="border-2 bg-gradient-to-br from-primary/5 via-secondary/5 to-tertiary/5">
            <CardHeader>
              <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
                {content["about.howDifferent.title"] || "How this is different"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-semibold">
                {content["about.howDifferent.description"] || "Dr3amToReal is not a print farm."}
              </p>
              <p>
                {content["about.howDifferent.subtitle"] || "It's a design-first, quality-driven studio, where:"}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{content["about.howDifferent.point1"] || "materials are chosen intentionally"}</li>
                <li>{content["about.howDifferent.point2"] || "prints are tested, adjusted, and improved"}</li>
                <li>{content["about.howDifferent.point3"] || "and customers can collaborate instead of just \"ordering a file\""}</li>
              </ul>
              <p className="mt-4">
                {content["about.howDifferent.note"] || "Some pieces are available as finished prints. Others are created together with you."}
              </p>
            </CardContent>
          </Card>

          {/* Where This Is Going Section */}
          <Card className="border-2 bg-gradient-to-br from-primary/5 via-secondary/5 to-tertiary/5">
            <CardHeader>
              <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
                {content["about.whereGoing.title"] || "Where this is going"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-semibold">
                {content["about.whereGoing.description"] || "This is just the beginning."}
              </p>
              <p>
                {content["about.whereGoing.paragraph"] || "Dr3amToReal is growing step by step — expanding its design catalogue, refining production, and exploring new materials and techniques — always with the same goal:"}
              </p>
              <p className="font-semibold text-foreground">
                {content["about.whereGoing.goal"] || "Turn ideas, memories, and needs into well-made objects that last."}
              </p>
            </CardContent>
          </Card>

          {/* Signature Line */}
          <div className="text-center space-y-2 py-8">
            <p className="text-lg font-semibold">
              {content["about.signature.line1"] || "Designed with care. Printed with intention."}
            </p>
            <p className="text-lg bg-gradient-primary bg-clip-text text-transparent font-bold">
              {content["about.signature.line2"] || "From dream to real."}
            </p>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-tertiary/10 border-2 border-transparent shadow-glow">
            <CardHeader className="text-center">
              <CardTitle>
                {(() => {
                  const title = content["about.cta.title"] || "Join Our Community";
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
              </CardTitle>
              <CardDescription>
                {content["about.cta.description"] || "Start creating amazing 3D models today"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/")}
                className="transition-all duration-300 hover:scale-105 hover:shadow-glow"
              >
                {content["about.cta.button_get_started"] || "Get Started"}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/contact")}
                className="transition-all duration-300 hover:scale-105 hover:shadow-glow"
              >
                {content["about.cta.button_contact"] || "Contact Us"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

    </div>;
};
export default About;
