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
      question: content["faq.q1.question"] || "What file formats do you provide?",
      answer: content["faq.q1.answer"] || "We generate both STL and BLEND files for all 3D models. STL files are ready for 3D printing, while BLEND files can be edited in Blender."
    },
    {
      question: content["faq.q2.question"] || "How long does it take to generate a model?",
      answer: content["faq.q2.answer"] || "Most models are generated within 2-5 minutes. Complex designs may take up to 10 minutes. You'll receive a notification when your model is ready."
    },
    {
      question: content["faq.q3.question"] || "Can I customize the dimensions?",
      answer: content["faq.q3.answer"] || "Yes! You can specify custom width, height, and depth dimensions when creating your model. We also offer predefined sizes for common use cases."
    },
    {
      question: content["faq.q4.question"] || "What payment methods do you accept?",
      answer: content["faq.q4.answer"] || "We accept MB Way, PayPal, and major credit cards. All payments are processed securely."
    },
    {
      question: content["faq.q5.question"] || "Can I request revisions to my model?",
      answer: content["faq.q5.answer"] || "Yes! After receiving your initial model, you can request modifications. Additional charges may apply for major redesigns."
    },
    {
      question: content["faq.q6.question"] || "What materials can I choose from?",
      answer: content["faq.q6.answer"] || "We optimize models for PLA, ABS, PETG, Resin, and TPU materials. Each material has different properties suitable for various applications."
    },
    {
      question: content["faq.q7.question"] || "Do you offer refunds?",
      answer: content["faq.q7.answer"] || "We offer refunds within 7 days if you're not satisfied with your model and haven't downloaded the files yet. Please contact support for assistance."
    },
    {
      question: content["faq.q8.question"] || "How do I use the generated files?",
      answer: content["faq.q8.answer"] || "Download the STL file and import it into your preferred slicing software (like Cura or PrusaSlicer) to prepare it for printing. BLEND files can be edited in Blender."
    }
  ];

  return <div className="min-h-screen bg-gradient-mesh">
      <Header
        pageTitle={content["faq.header.pageTitle"] || "FAQ"}
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
                const title = content["faq.hero.title"] || "How Can We Help You?";
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
              {content["faq.hero.subtitle"] || "Find answers to common questions about our 3D model generation service"}
            </p>
          </div>

          {/* FAQ Accordion */}
          <Card>
            <CardHeader>
              <CardTitle>{content["faq.section.title"] || "Frequently Asked Questions"}</CardTitle>
              <CardDescription>
                {content["faq.section.description"] || "Everything you need to know about our service"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
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
    </div>;
};

export default FAQ;
