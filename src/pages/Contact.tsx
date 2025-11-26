import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";
const Contact = () => {
  const navigate = useNavigate();
  const { content } = useContent("contact");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(content["contact.form.success"] || "Message sent successfully! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
    setIsSubmitting(false);
  };
  return <div className="min-h-screen bg-gradient-mesh">
      <Header pageTitle="Contact Us" pageSubtitle="Get in Touch" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold">
              {(() => {
                const title = content["contact.hero.title"] || "Let's Connect";
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
              {content["contact.hero.subtitle"] || "Have a question or need support? We're here to help you create amazing 3D models"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Contact Info Cards */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-glow transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 mb-2 mx-auto hover:bg-primary/30 transition-all duration-300">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{content["contact.info.email.title"] || "Email"}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">{content["contact.info.email.value"] || "support@pompousweek.com"}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 hover:shadow-glow-green transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20 mb-2 mx-auto hover:bg-secondary/30 transition-all duration-300">
                  <MessageSquare className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-lg">{content["contact.info.chat.title"] || "Live Chat"}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">{content["contact.info.chat.value"] || "Available 9AM - 6PM GMT"}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-tertiary/5 to-tertiary/10 hover:shadow-glow-yellow transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-tertiary/20 mb-2 mx-auto hover:bg-tertiary/30 transition-all duration-300">
                  <Send className="h-6 w-6 text-tertiary" />
                </div>
                <CardTitle className="text-lg">{content["contact.info.response.title"] || "Response Time"}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">{content["contact.info.response.value"] || "Within 24/48 hours"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-tertiary/5 border-2">
            <CardHeader>
              <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
                {content["contact.form.title"] || "Send Us a Message"}
              </CardTitle>
              <CardDescription>
                {content["contact.form.description"] || "Fill out the form below and we'll get back to you as soon as possible"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{content["contact.form.name"] || "Name"}</Label>
                    <Input id="name" placeholder={content["contact.form.name.placeholder"] || "Your name"} value={formData.name} onChange={e => setFormData({
                    ...formData,
                    name: e.target.value
                  })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{content["contact.form.email"] || "Email"}</Label>
                    <Input id="email" type="email" placeholder={content["contact.form.email.placeholder"] || "your@email.com"} value={formData.email} onChange={e => setFormData({
                    ...formData,
                    email: e.target.value
                  })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{content["contact.form.subject"] || "Subject"}</Label>
                  <Input id="subject" placeholder={content["contact.form.subject.placeholder"] || "What is this about?"} value={formData.subject} onChange={e => setFormData({
                  ...formData,
                  subject: e.target.value
                })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{content["contact.form.message"] || "Message"}</Label>
                  <Textarea id="message" placeholder={content["contact.form.message.placeholder"] || "Tell us more about your inquiry..."} value={formData.message} onChange={e => setFormData({
                  ...formData,
                  message: e.target.value
                })} required rows={6} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? content["contact.form.sending"] || "Sending..." : content["contact.form.send"] || "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>;
};
export default Contact;