import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";

const FAQ = () => {
  const navigate = useNavigate();
  const { content } = useContent("faq");

  const faqs = [
    {
      question: content["faq.questions.q1.question"] || "Is Dr3amToReal a new business?",
      answer: content["faq.questions.q1.answer"] || "Yes. Dr3amToReal is a young brand, currently growing under PompousWeek Unipessoal Lda, a Portuguese company.\n\nWhile the 3D-printing studio is new, it builds on years of experience in engineering, testing, and quality-focused work."
    },
    {
      question: content["faq.questions.q2.question"] || "Do you only sell what's in the shop?",
      answer: content["faq.questions.q2.answer"] || "Not always.\n\nSome designs are available as ready-to-order prints, but custom requests and personalisation are a big part of what I do.\n\nIf you have:\n• a part that's hard to find\n• an idea you want to bring to life\n• or an object you'd like adapted\n\nYou can contact me to discuss feasibility."
    },
    {
      question: content["faq.questions.q3.question"] || "Can you design a custom part for me?",
      answer: content["faq.questions.q3.answer"] || "Yes — depending on complexity, purpose, and timeframe.\n\nCustom design work may include:\n• measurements or reference photos\n• iteration and testing\n• material selection guidance\n\nNot every request will be a fit, but I'm always happy to explore possibilities."
    },
    {
      question: content["faq.questions.q4.question"] || "Do you sell digital files (STL)?",
      answer: content["faq.questions.q4.answer"] || "At the moment, Dr3amToReal focuses primarily on printed objects.\n\nDigital files may be offered in the future for selected designs, but the priority right now is delivering tested, physical results."
    },
    {
      question: content["faq.questions.q5.question"] || "What materials do you use?",
      answer: content["faq.questions.q5.answer"] || "Material choice depends on the object's purpose.\n\nThis can include:\n• durable functional plastics\n• materials suitable for decorative or indoor use\n• finishes chosen for strength, feel, or aesthetics\n\nIf you're ordering a custom piece, material options will be discussed with you."
    },
    {
      question: content["faq.questions.q6.question"] || "Are these mass-produced items?",
      answer: content["faq.questions.q6.answer"] || "No.\n\nMost pieces are:\n• made to order\n• produced in small batches\n• or created as one-offs\n\nThis allows for better quality control and personalisation."
    },
    {
      question: content["faq.questions.q7.question"] || "Where are you based? Do you ship internationally?",
      answer: content["faq.questions.q7.answer"] || "Dr3amToReal is based in Portugal.\n\nInternational shipping may be available depending on the product and destination.\n\nDetails are confirmed at order time."
    },
    {
      question: content["faq.questions.q8.question"] || "I have an idea but don't know if it's possible. What should I do?",
      answer: content["faq.questions.q8.answer"] || "That's perfectly fine — many projects start that way.\n\nYou can get in touch with:\n• a description of the idea\n• photos, sketches, or references (if available)\n• what you want the object to do\n\nWe'll take it from there."
    }
  ];

  return <div className="min-h-screen bg-gradient-mesh">
      <Header
        pageTitle={content["faq.header.pageTitle"] || "FAQ – Dr3amToReal"}
        pageSubtitle={content["faq.header.subtitle"] || "Frequently Asked Questions"}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mb-4">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold">
              {(() => {
                const title = content["faq.hero.title"] || "FAQ – Dr3amToReal";
                const words = title.split(/\s+/);
                if (words.length >= 2) {
                  const lastWord = words.slice(-1).join(" ");
                  const firstWords = words.slice(0, -1).join(" ");
                  return (
                    <>
                      {firstWords}{" "}
                      <span className="bg-gradient-primary bg-clip-text text-transparent">
                        {lastWord}
                      </span>
                    </>
                  );
                }
                return title;
              })()}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {content["faq.hero.subtitle"] || "Find answers to common questions about Dr3amToReal"}
            </p>
          </div>

          {/* FAQ Accordion */}
          <Card>
            <CardHeader>
              <CardTitle>{content["faq.section.title"] || "Frequently Asked Questions"}</CardTitle>
              <CardDescription>
                {content["faq.section.description"] || "Everything you need to know about Dr3amToReal"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground whitespace-pre-line">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <Card className="bg-gradient-primary text-primary-foreground">
            <CardHeader className="text-center">
              <CardTitle>{content["faq.cta.title"] || "Still Have Questions?"}</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                {content["faq.cta.description"] || "Our support team is here to help"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/contact")}
              >
                {content["faq.cta.button"] || "Contact Support"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>;
};

export default FAQ;
