import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Package, Home, Sparkles, Wrench, Heart, MapPin, Lightbulb } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeaturedTags } from "@/components/FeaturedTags";
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
      <Helmet>
        <title>{content["home.seo.title"] || "Custom 3D Printing & Original Designs | Dr3amToReal Portugal"}</title>
        <meta name="description" content={content["home.seo.description"] || "Design-led custom 3D printing studio in Portugal. Original designs, personalised parts, and small-batch prints — from dream to real object."} />
        <meta name="keywords" content={content["home.seo.keywords"] || "custom 3D printing Portugal, 3D printing studio Portugal, custom 3D prints, personalised 3D printing, bespoke 3D printing, original 3D designs, small batch 3D printing, 3D printed parts Portugal, design-led 3D printing"} />
        <link rel="canonical" href="https://dr3amtoreal.com/" />
        <meta property="og:title" content={content["home.seo.og_title"] || content["home.seo.title"] || "Custom 3D Printing & Original Designs | Dr3amToReal Portugal"} />
        <meta property="og:description" content={content["home.seo.og_description"] || content["home.seo.description"] || "Design-led custom 3D printing studio in Portugal. Original designs, personalised parts, and small-batch prints — from dream to real object."} />
        <meta property="og:url" content="https://dr3amtoreal.com/" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Header />

      {/* 1️⃣ Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold">
                {(() => {
                  const title = content["home.hero.title"] || "Restore Your Classic. Enhance Your Home";
                  const parts = title.split(/\.\s+/);
                  if (parts.length >= 2) {
                    return (
                      <>
                        {parts[0]}.{" "}
                        <span className="bg-gradient-primary bg-clip-text text-transparent">
                          {parts.slice(1).join(" ")}
                        </span>
                      </>
                    );
                  }
                  return title;
                })()}
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                {content["home.hero.subtitle"] || "Thoughtfully designed and carefully printed objects — from functional parts to personalised home décor — made in Portugal."}
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button size="lg" onClick={() => navigate("/shop")}>
                  {content["home.hero.cta_primary"] || "Explore the collection"}
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/contact")}>
                  {content["home.hero.cta_secondary"] || "Request custom work"}
                </Button>
              </div>
              <div className="flex gap-4 flex-wrap text-sm">
                <a href="/about" className="text-primary hover:underline">{content["home.hero.link_about"] || "About Dr3amToReal"}</a>
                <span className="text-muted-foreground">•</span>
                <a href="/contact" className="text-primary hover:underline">{content["home.hero.link_custom_work"] || "Custom Work Services"}</a>
              </div>
              <p className="text-sm text-muted-foreground">
                {content["home.hero.trust_line"] || "Small-batch. Made to order. Quality-driven."}
              </p>
            </div>
            <div className="flex-1">
              <div className="bg-muted/50 rounded-lg overflow-hidden aspect-video">
                <img 
                  src={heroCarParts} 
                  alt="Dr3amToReal 3D Printing" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tags Section */}
      <FeaturedTags 
        title={content["home.featuredTags.title"] || "Browse by "}
        subtitle={content["home.featuredTags.subtitle"] || "Explore our curated collections"}
      />

      {/* 2️⃣ What Dr3amToReal Is */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-center">
              {(() => {
                const title = content["home.whatIs.title"] || "What is Dr3amToReal?";
                const parts = title.split(" ");
                if (parts.length >= 2) {
                  return (
                    <>
                      {parts.slice(0, -1).join(" ")}{" "}
                      <span className="bg-gradient-primary bg-clip-text text-transparent">
                        {parts[parts.length - 1]}
                      </span>
                    </>
                  );
                }
                return title;
              })()}
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>{content["home.whatIs.paragraph1"] || "Dr3amToReal is a design-led 3D printing studio based in Portugal, creating custom parts, original objects, and personalised prints."}</p>
              <p className="font-semibold text-foreground">{content["home.whatIs.paragraph2"] || "This is not mass production."}</p>
              <p>{content["home.whatIs.paragraph3"] || "Every piece is designed, tested, and refined before it's made available."}</p>
              <p>{content["home.whatIs.paragraph4"] || "Some designs start as functional solutions — others as creative experiments — but all of them are built with the same attention to detail."}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3️⃣ What You Can Find Here */}
      <section className="py-20 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {(() => {
                const title = content["home.whatYouCanFind.title"] || "What I Create";
                const parts = title.split(" ");
                if (parts.length >= 2) {
                  return (
                    <>
                      {parts.slice(0, -1).join(" ")}{" "}
                      <span className="bg-gradient-primary bg-clip-text text-transparent">
                        {parts[parts.length - 1]}
                      </span>
                    </>
                  );
                }
                return title;
              })()}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">
                  {content["home.whatYouCanFind.column1.title"] || "Functional & Replacement Parts"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {content["home.whatYouCanFind.column1.description"] || "Custom or hard-to-find components, especially for older or discontinued models."}
                </p>
              </CardContent>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Home className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg">
                  {content["home.whatYouCanFind.column2.title"] || "Home Décor & Everyday Objects"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {content["home.whatYouCanFind.column2.description"] || "Original designs created to be both useful and visually meaningful."}
                </p>
              </CardContent>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">
                  {content["home.whatYouCanFind.column3.title"] || "Personalised Prints"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {content["home.whatYouCanFind.column3.description"] || "Objects adapted to your taste, size, or use case — no generic solutions."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 4️⃣ Why This Exists */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-center">
              {(() => {
                const title = content["home.whyExists.title"] || "Why Dr3amToReal Exists";
                const parts = title.split(" ");
                if (parts.length >= 2) {
                  return (
                    <>
                      {parts.slice(0, -1).join(" ")}{" "}
                      <span className="bg-gradient-primary bg-clip-text text-transparent">
                        {parts[parts.length - 1]}
                      </span>
                    </>
                  );
                }
                return title;
              })()}
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>{content["home.whyExists.paragraph1"] || "Dr3amToReal started with a simple frustration: needing a part that no longer existed."}</p>
              <p>{content["home.whyExists.paragraph2"] || "That frustration turned into designing replacements, improving them, and eventually creating entirely new objects — first for old cars, then for everyday life."}</p>
              <p>{content["home.whyExists.paragraph3"] || "Backed by years of experience in quality engineering and testing, this studio applies the same mindset to physical objects:"}</p>
              <p className="font-semibold text-foreground">{content["home.whyExists.paragraph4"] || "test, refine, improve — then share."}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5️⃣ How This Is Different */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
              {(() => {
                const title = content["home.howDifferent.title"] || "Not a Print Farm";
                const parts = title.split(" ");
                if (parts.length >= 2) {
                  return (
                    <>
                      {parts.slice(0, -2).join(" ")}{" "}
                      <span className="bg-gradient-primary bg-clip-text text-transparent">
                        {parts.slice(-2).join(" ")}
                      </span>
                    </>
                  );
                }
                return title;
              })()}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6 border-green-500/20 bg-green-500/5">
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-semibold text-lg mb-4">{content["home.howDifferent.positive.title"] || "What we do:"}</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{content["home.howDifferent.positive.point1"] || "Designed, not just printed"}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{content["home.howDifferent.positive.point2"] || "Small batches and one-off pieces"}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{content["home.howDifferent.positive.point3"] || "Collaboration instead of anonymous orders"}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{content["home.howDifferent.positive.point4"] || "Material and function considered first"}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="p-6 border-red-500/20 bg-red-500/5">
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-semibold text-lg mb-4">{content["home.howDifferent.negative.title"] || "What we don't do:"}</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{content["home.howDifferent.negative.point1"] || "No mass production"}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{content["home.howDifferent.negative.point2"] || "No rushed jobs"}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{content["home.howDifferent.negative.point3"] || "No \"print anything instantly\" promises"}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 6️⃣ Custom Work CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 max-w-4xl mx-auto">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">
                {(() => {
                  const title = content["home.customWork.title"] || "Have an Idea That Doesn't Exist Yet?";
                  const words = title.split(" ");
                  if (words.length >= 3) {
                    return (
                      <>
                        {words.slice(0, -3).join(" ")}{" "}
                        <span className="bg-gradient-primary bg-clip-text text-transparent">
                          {words.slice(-3).join(" ")}
                        </span>
                      </>
                    );
                  }
                  return title;
                })()}
              </h2>
              <p className="text-lg font-semibold text-foreground">
                {content["home.customWork.description"] || "Some projects don't belong in a catalogue."}
              </p>
              <div className="space-y-4 text-muted-foreground">
                <p>{content["home.customWork.paragraph"] || "If you have an idea, a problem to solve, or an object you want adapted to your needs, Dr3amToReal offers select custom design and 3D printing services."}</p>
                <p>{content["home.customWork.paragraph2"] || "Custom work is collaborative, intentional, and quoted based on complexity — not rushed or automated."}</p>
              </div>
              <div className="space-y-2">
                <Button size="lg" onClick={() => navigate("/contact")}>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  {content["home.customWork.cta"] || "Request custom work"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {content["home.customWork.cta_note"] || "Please include as much detail as possible for a meaningful response."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 7️⃣ Manifesto */}
      <section id="manifesto" className="py-20 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
              {(() => {
                const title = content["home.manifesto.title"] || "What This Studio Believes In";
                const words = title.split(" ");
                if (words.length >= 3) {
                  return (
                    <>
                      {words.slice(0, -3).join(" ")}{" "}
                      <span className="bg-gradient-primary bg-clip-text text-transparent">
                        {words.slice(-3).join(" ")}
                      </span>
                    </>
                  );
                }
                return title;
              })()}
            </h2>
            <Card className="p-8">
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{content["home.manifesto.point1"] || "Objects should exist for a reason"}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{content["home.manifesto.point2"] || "Quality comes from iteration, not speed"}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{content["home.manifesto.point3"] || "Custom means listening first"}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{content["home.manifesto.point4"] || "Small-batch beats mass production"}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{content["home.manifesto.point5"] || "Well-made things are meant to last"}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 8️⃣ Founder Note */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-center">
              {(() => {
                const title = content["home.founderNote.title"] || "From the Founder";
                const parts = title.split(" ");
                if (parts.length >= 2) {
                  return (
                    <>
                      {parts.slice(0, -1).join(" ")}{" "}
                      <span className="bg-gradient-primary bg-clip-text text-transparent">
                        {parts[parts.length - 1]}
                      </span>
                    </>
                  );
                }
                return title;
              })()}
            </h2>
            <Card className="p-8">
              <CardContent className="pt-6 space-y-4 text-muted-foreground text-lg">
                <p>{content["home.founderNote.paragraph1"] || "Dr3amToReal began as a personal dream."}</p>
                <p>{content["home.founderNote.paragraph2"] || "After years working in quality engineering — testing systems before they reached people — I found myself applying the same discipline to physical creation."}</p>
                <p>{content["home.founderNote.paragraph3"] || "Designing, testing, refining, and improving objects until they feel right."}</p>
                <p>{content["home.founderNote.paragraph4"] || "This studio is my way of combining engineering precision with creativity — and sharing that process with others who care about how things are made."}</p>
                <p className="font-semibold text-foreground">{content["home.founderNote.paragraph5"] || "Thank you for being here at the very beginning."}</p>
                <div className="pt-4 border-t">
                  <p className="font-semibold text-foreground">{content["home.founderNote.signature"] || "— Ana"}</p>
                  <p className="text-sm">{content["home.founderNote.signature_title"] || "Founder, Dr3amToReal"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 9️⃣ Location & Shipping */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              {(() => {
                const title = content["home.locationShipping.title"] || "Based in Portugal, Shipping Worldwide";
                const parts = title.split(",");
                if (parts.length >= 2) {
                  return (
                    <>
                      {parts[0]},
                      <span className="bg-gradient-primary bg-clip-text text-transparent">
                        {" " + parts.slice(1).join(",")}
                      </span>
                    </>
                  );
                }
                return title;
              })()}
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>{content["home.locationShipping.paragraph1"] || "Dr3amToReal is proudly based in Portugal."}</p>
              <p>{content["home.locationShipping.paragraph2"] || "Orders are produced locally and shipped with care."}</p>
              <p>{content["home.locationShipping.paragraph3"] || "Availability and shipping options depend on the product and destination and are confirmed during checkout."}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🔚 Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 max-w-4xl mx-auto">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold">
                {(() => {
                  const title = content["home.finalCta.title"] || "Every Object Starts as an Idea";
                  const words = title.split(" ");
                  if (words.length >= 3) {
                    return (
                      <>
                        {words.slice(0, -3).join(" ")}{" "}
                        <span className="bg-gradient-primary bg-clip-text text-transparent">
                          {words.slice(-3).join(" ")}
                        </span>
                      </>
                    );
                  }
                  return title;
                })()}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {content["home.finalCta.description"] || "Whether you're looking for a finished design or want to bring something new to life, Dr3amToReal exists to turn ideas into real, well-made objects."}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" onClick={() => navigate("/shop")}>
                  {content["home.finalCta.button_primary"] || "Explore the collection"}
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/contact")}>
                  {content["home.finalCta.button_secondary"] || "Request custom work"}
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
