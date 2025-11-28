import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ExternalLink, Shield, AlertCircle, Clock, Building } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";

const ComplaintsBook = () => {
  const navigate = useNavigate();
  const { content } = useContent("complaints");

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <Header
        pageTitle={content["complaints.header.pageTitle"] || "Complaints Book"}
        pageSubtitle={content["complaints.header.subtitle"] || "Consumer Rights"}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold">
              {(() => {
                const title = content["complaints.hero.title"] || "Portuguese Complaints Book";
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
              {content["complaints.hero.subtitle"] || "Your right to complain and be heard as a consumer"}
            </p>
          </div>

          {/* What is Livro de Reclamações Section */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-glow transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 mb-2">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{content["complaints.what.title"] || "What is the Livro de Reclamações?"}</CardTitle>
              <CardDescription>
                {content["complaints.what.subtitle"] || "Understanding your rights"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {content["complaints.what.description"] || "The Complaints Book is a legal instrument in Portugal that protects consumer rights and regulates complaints about goods and services"}
              </p>
              <p className="text-muted-foreground">
                {content["complaints.what.legal_requirement"] || "All businesses providing goods or services to consumers in Portugal are legally required to have a Complaints Book available"}
              </p>
              <p className="text-muted-foreground">
                {content["complaints.what.purpose"] || "It ensures businesses are accountable and consumer rights are protected through formal complaint channels"}
              </p>
            </CardContent>
          </Card>

          {/* Your Rights Section */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-glow transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 mb-2">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{content["complaints.rights.title"] || "Your Consumer Rights"}</CardTitle>
              <CardDescription>
                {content["complaints.rights.subtitle"] || "What you need to know"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-muted-foreground">
                <li>• {content["complaints.rights.right_to_complain"] || "You have the legal right to file a complaint about any product or service"}</li>
                <li>• {content["complaints.rights.response_time"] || "Businesses must respond to your complaint within 15 working days"}</li>
                <li>• {content["complaints.rights.authority"] || "Complaints are overseen by ASAE (Economic and Food Safety Authority)"}</li>
              </ul>
            </CardContent>
          </Card>

          {/* How to File a Complaint Section */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-glow transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 mb-2">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{content["complaints.howto.title"] || "How to File a Complaint"}</CardTitle>
              <CardDescription>
                {content["complaints.howto.subtitle"] || "Step-by-step process"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                <li>{content["complaints.howto.step1"] || "Access the Electronic Complaints Book at www.livroreclamacoes.pt"}</li>
                <li>{content["complaints.howto.step2"] || "Click on 'Make a Complaint' and fill in the required information"}</li>
                <li>{content["complaints.howto.step3"] || "Provide our company details (listed below) and describe your complaint"}</li>
                <li>{content["complaints.howto.step4"] || "Submit your complaint - you'll receive confirmation and we'll respond within 15 days"}</li>
              </ol>
              <p className="text-muted-foreground italic">
                {content["complaints.howto.note"] || "Electronic complaints have the same legal validity as paper complaints"}
              </p>
            </CardContent>
          </Card>

          {/* Company Details Section */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-glow transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 mb-2">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{content["complaints.company.title"] || "Pompousweek Company Details"}</CardTitle>
              <CardDescription>
                {content["complaints.company.subtitle"] || "Information needed for complaints"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="space-y-2 text-muted-foreground">
                <div>
                  <dt className="font-medium">{content["complaints.company.name"] || "Company Name: Pompousweek - 3D Printing Solutions"}</dt>
                </div>
                <div>
                  <dt className="font-medium">{content["complaints.company.nif"] || "Tax ID (NIF): [To be provided]"}</dt>
                </div>
                <div>
                  <dt className="font-medium">{content["complaints.company.address"] || "Address: [Company address to be provided]"}</dt>
                </div>
                <div>
                  <dt className="font-medium">{content["complaints.company.email"] || "Email: support@pompousweek.com"}</dt>
                </div>
                <div>
                  <dt className="font-medium">{content["complaints.company.phone"] || "Phone: [To be provided]"}</dt>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card className="bg-gradient-primary text-primary-foreground">
            <CardHeader className="text-center">
              <CardTitle>{content["complaints.cta.title"] || "File a Complaint"}</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                {content["complaints.cta.description"] || "Access the official Electronic Complaints Book platform"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                variant="secondary"
                size="lg"
                asChild
              >
                <a
                  href="https://www.livroreclamacoes.pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={content["complaints.cta.button"] || "Go to Livro de Reclamações"}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {content["complaints.cta.button"] || "Go to Livro de Reclamações"}
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ComplaintsBook;