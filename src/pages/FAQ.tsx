import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle } from "lucide-react";
import pompousweekLogo from "@/assets/pompousweek-logo.png";

const FAQ = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "What file formats do you provide?",
      answer: "We generate both STL and BLEND files for all 3D models. STL files are ready for 3D printing, while BLEND files can be edited in Blender."
    },
    {
      question: "How long does it take to generate a model?",
      answer: "Most models are generated within 2-5 minutes. Complex designs may take up to 10 minutes. You'll receive a notification when your model is ready."
    },
    {
      question: "Can I customize the dimensions?",
      answer: "Yes! You can specify custom width, height, and depth dimensions when creating your model. We also offer predefined sizes for common use cases."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept MB Way, PayPal, and major credit cards. All payments are processed securely."
    },
    {
      question: "Can I request revisions to my model?",
      answer: "Yes! After receiving your initial model, you can request modifications. Additional charges may apply for major redesigns."
    },
    {
      question: "What materials can I choose from?",
      answer: "We optimize models for PLA, ABS, PETG, Resin, and TPU materials. Each material has different properties suitable for various applications."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer refunds within 7 days if you're not satisfied with your model and haven't downloaded the files yet. Please contact support for assistance."
    },
    {
      question: "How do I use the generated files?",
      answer: "Download the STL file and import it into your preferred slicing software (like Cura or PrusaSlicer) to prepare it for printing. BLEND files can be edited in Blender."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <img src={pompousweekLogo} alt="Pompousweek" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold">FAQ</h1>
                <p className="text-xs text-muted-foreground">Frequently Asked Questions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mb-4">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold">
              How Can We{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Help You?
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our 3D model generation service
            </p>
          </div>

          {/* FAQ Accordion */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Everything you need to know about our service
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
              <CardTitle>Still Have Questions?</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Our support team is here to help
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => navigate("/contact")}
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FAQ;
