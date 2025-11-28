import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Eye, Edit, Trash, Download, X, Shield } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";

const TermsAndConditions = () => {
  const { content } = useContent('terms');

  const userRights = [
    {
      icon: Eye,
      title: content["terms.user_rights.access"] || "Right to access your personal data",
      description: "You have the right to request a copy of the personal information we hold about you."
    },
    {
      icon: Edit,
      title: content["terms.user_rights.rectification"] || "Right to rectification",
      description: "You can request correction of inaccurate or incomplete personal data."
    },
    {
      icon: Trash,
      title: content["terms.user_rights.erasure"] || "Right to erasure",
      description: "You can request deletion of your personal data under certain circumstances."
    },
    {
      icon: Download,
      title: content["terms.user_rights.portability"] || "Right to data portability",
      description: "You can request your data in a structured, commonly used format."
    },
    {
      icon: X,
      title: content["terms.user_rights.objection"] || "Right to object",
      description: "You can object to processing of your personal data for certain purposes."
    },
    {
      icon: Shield,
      title: content["terms.user_rights.withdraw"] || "Right to withdraw consent",
      description: "You can withdraw consent for data processing at any time."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <Header
        pageTitle={content["terms.header.pageTitle"] || "Terms & Conditions"}
        pageSubtitle={content["terms.header.subtitle"] || "Legal Information"}
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
                const title = content["terms.hero.title"] || "Terms and Conditions";
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
              {content["terms.hero.subtitle"] || "Please read these terms carefully before using our services"}
            </p>
            <p className="text-sm text-muted-foreground">
              {content["terms.hero.last_updated"] || "Last updated: November 2024"}
            </p>
          </div>

          {/* Introduction Section */}
          <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-tertiary/5 hover:scale-105 hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
                {content["terms.intro.title"] || "Introduction"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                {content["terms.intro.paragraph1"] || "Welcome to Pompousweek. By accessing and using our 3D printing services, you agree to comply with and be bound by these Terms and Conditions. These terms govern your use of our website, services, and any interactions with Pompousweek."}
              </p>
              <p>
                {content["terms.intro.paragraph2"] || "We are committed to protecting your privacy and ensuring compliance with all applicable data protection laws. Please read these terms carefully before proceeding with any purchase or service request."}
              </p>
            </CardContent>
          </Card>

          {/* Data Protection & Privacy Section */}
          <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-tertiary/5 hover:scale-105 hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
                {content["terms.privacy.title"] || "Data Protection & Privacy"}
              </CardTitle>
              <CardDescription>
                {content["terms.privacy.subtitle"] || "How we protect your information"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong>{content["terms.privacy.company_info"] || "Company Information:"}</strong> Pompousweek, Lda. is registered in Portugal with NIPC 123456789. Our registered address is Rua Example 123, 1000-001 Lisbon, Portugal.
              </p>
              <p>
                <strong>{content["terms.privacy.purpose"] || "Purpose of Data Collection:"}</strong> We collect personal data to provide our 3D printing services, process orders, and improve our customer experience.
              </p>
              <p>
                <strong>{content["terms.privacy.security"] || "Data Security:"}</strong> We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p>
                <strong>{content["terms.privacy.compliance"] || "Legal Compliance:"}</strong> We comply with the General Data Protection Regulation (GDPR) and Portuguese Law 67/98 on the Protection of Personal Data.
              </p>
            </CardContent>
          </Card>

          {/* Data Collection Section */}
          <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-tertiary/5 hover:scale-105 hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
                {content["terms.data_collection.title"] || "Information We Collect"}
              </CardTitle>
              <CardDescription>
                {content["terms.data_collection.subtitle"] || "Types of data we collect"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ul className="list-disc list-inside space-y-2">
                <li>{content["terms.data_collection.account_data"] || "Account Data: Name, email address, postal address, phone number, and tax identification number"}</li>
                <li>{content["terms.data_collection.billing_data"] || "Billing Data: Payment information, billing address, and invoice details"}</li>
                <li>{content["terms.data_collection.order_data"] || "Order Data: Order history, product preferences, and customization details"}</li>
                <li>{content["terms.data_collection.technical_data"] || "Technical Data: IP address, browser type, operating system, and device information"}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Usage Section */}
          <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-tertiary/5 hover:scale-105 hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
                {content["terms.data_usage.title"] || "How We Use Your Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ul className="list-disc list-inside space-y-2">
                <li>{content["terms.data_usage.service_provision"] || "Service Provision: To process orders, manage deliveries, and provide customer support"}</li>
                <li>{content["terms.data_usage.communication"] || "Communication: To send order updates, service notifications, and respond to inquiries"}</li>
                <li>{content["terms.data_usage.improvement"] || "Service Improvement: To analyze usage patterns and improve our 3D printing services"}</li>
                <li>{content["terms.data_usage.marketing"] || "Marketing: To send promotional offers and product updates (only with your explicit consent)"}</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Rights Section */}
          <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-tertiary/5 hover:scale-105 hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
                {content["terms.user_rights.title"] || "Your Rights (GDPR)"}
              </CardTitle>
              <CardDescription>
                {content["terms.user_rights.subtitle"] || "Rights you have regarding your data"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {userRights.map((right, index) => {
                const Icon = right.icon;
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{right.title}</h4>
                      <p className="text-muted-foreground">{right.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Cookies Policy Section */}
          <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-tertiary/5 hover:scale-105 hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
                {content["terms.cookies.title"] || "Cookies Policy"}
              </CardTitle>
              <CardDescription>
                {content["terms.cookies.subtitle"] || "How we use cookies"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                {content["terms.cookies.description"] || "We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content."}
              </p>
              <p>
                <strong>{content["terms.cookies.types"] || "Types of Cookies:"}</strong> Essential cookies for site functionality, analytics cookies for usage insights, functionality cookies for preferences, and marketing cookies for targeted advertising.
              </p>
              <p>
                {content["terms.cookies.control"] || "You can control cookie settings through your browser preferences. However, disabling certain cookies may affect site functionality."}
              </p>
            </CardContent>
          </Card>

          {/* Data Retention Section */}
          <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-tertiary/5 hover:scale-105 hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
                {content["terms.retention.title"] || "Data Retention"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                {content["terms.retention.description"] || "We retain your personal data for as long as necessary to provide our services and comply with legal obligations. Account data is kept for 7 years for tax purposes, while other data may be retained for up to 3 years after account closure unless legal requirements dictate otherwise."}
              </p>
            </CardContent>
          </Card>

          {/* Third Party Sharing Section */}
          <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-tertiary/5 hover:scale-105 hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
                {content["terms.third_party.title"] || "Third Party Sharing"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                {content["terms.third_party.description"] || "We may share your data with trusted third parties such as shipping companies for delivery and payment processors for transactions. We do not sell your personal data to third parties for marketing purposes."}
              </p>
            </CardContent>
          </Card>

          {/* Contact Information Section */}
          <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-tertiary/5 hover:scale-105 hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
                {content["terms.contact.title"] || "Contact Us"}
              </CardTitle>
              <CardDescription>
                {content["terms.contact.subtitle"] || "Exercise your rights"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong>Email:</strong> {content["terms.contact.email"] || "support@pompousweek.com"}
              </p>
              <p>
                <strong>Address:</strong> {content["terms.contact.address"] || "Rua Example 123, 1000-001 Lisbon, Portugal"}
              </p>
              <p>
                <strong>Phone:</strong> {content["terms.contact.phone"] || "+351 123 456 789"}
              </p>
              <p>
                {content["terms.contact.rights_form"] || "To exercise your data protection rights, please contact us using the details above or fill out our rights exercise form available on our website."}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;