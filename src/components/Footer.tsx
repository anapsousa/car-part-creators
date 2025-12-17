import { useState } from "react";
import { useNavigate } from "react-router-dom";
import pompousweekLogo from "@/assets/pompousweek-logo.png";
import dr3amtorealLogo from "@/assets/dr3amtoreal-logo.png";
import { useContent } from "@/hooks/useContent";
import { Instagram, Youtube, Facebook, MapPin, Mail, Phone } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { supabase } from '@/integrations/supabase/client';

const VisaIcon = () => (
  <svg width="80" height="24" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="24" rx="2" fill="#1A1F71"/>
    <text x="40" y="16" textAnchor="middle" fill="white" fontSize="14" fontFamily="sans-serif">VISA</text>
  </svg>
);

const MastercardIcon = () => (
  <svg width="80" height="24" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="24" rx="2" fill="#EB001B"/>
    <circle cx="30" cy="12" r="8" fill="#F79E1B"/>
    <circle cx="50" cy="12" r="8" fill="#FF5F00"/>
    <text x="40" y="18" textAnchor="middle" fill="white" fontSize="8" fontFamily="sans-serif">MASTERCARD</text>
  </svg>
);

const PaypalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-labelledby="title" aria-describedby="desc" role="img" xmlnsXlink="http://www.w3.org/1999/xlink">
    <title>PayPal</title>
    <desc>PayPal logo icon</desc>
    <path data-name="layer2" d="M59.777 14.977a13.284 13.284 0 0 0-2.081-2 27.4 27.4 0 0 1-.5 6.19 25.386 25.386 0 0 1-8.72 14.577 24.969 24.969 0 0 1-15.954 5.491h-8.815l-2.873 13.383a5.823 5.823 0 0 1-5.549 4.593h-3.964l-.694 3.295a2.639 2.639 0 0 0 .595 2.4A2.762 2.762 0 0 0 13.4 64h9.711a2.772 2.772 0 0 0 2.775-2.3l3.369-15.775h11.1a22.022 22.022 0 0 0 14.17-4.892 23.185 23.185 0 0 0 7.729-12.98c1.09-5.289.297-9.682-2.477-13.076z" fill="#0070BA"/>
    <path data-name="layer1" d="M18.059 52.019l3.369-15.676h11.1A22.022 22.022 0 0 0 46.7 31.451a23.185 23.185 0 0 0 7.729-12.98c1.09-5.292.3-9.785-2.378-13.179A15.293 15.293 0 0 0 40.256 0H16.077A2.772 2.772 0 0 0 13.3 2.3L2.8 50.721a2.639 2.639 0 0 0 .595 2.4 2.762 2.762 0 0 0 2.18 1.1h9.711a2.705 2.705 0 0 0 2.773-2.202zm8.918-40.936h7.63a5.437 5.437 0 0 1 4.36 2.1 6.073 6.073 0 0 1 .892 5.292v.1c-.991 4.094-4.955 7.388-8.819 7.388h-7.333z" fill="#0070BA"/>
  </svg>
);

const MbwayIcon = () => (
  <svg width="80" height="24" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="24" rx="2" fill="#FF6B35"/>
    <text x="40" y="16" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif">MB WAY</text>
  </svg>
);

const GooglePayIcon = () => (
  <svg width="80" height="24" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="24" rx="2" fill="#4285F4"/>
    <text x="40" y="16" textAnchor="middle" fill="white" fontSize="10" fontFamily="sans-serif">GOOGLE PAY</text>
  </svg>
);

const ApplePayIcon = () => (
  <svg width="80" height="24" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="24" rx="2" fill="#000000"/>
    <text x="40" y="16" textAnchor="middle" fill="white" fontSize="10" fontFamily="sans-serif">APPLE PAY</text>
  </svg>
);

const MbIcon = () => (
  <svg width="80" height="24" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="24" rx="2" fill="#005CA9"/>
    <text x="40" y="16" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif">MULTIBANCO</text>
  </svg>
);

export const Footer = () => {
  const navigate = useNavigate();
  const { content } = useContent("footer");
  const { i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !consent) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email, language: i18n.language, consent_given: true }
      });
      if (error) {
        if (error.message?.includes("Already subscribed") || error.status === 409) {
          toast.info(content["footer.newsletter.already_subscribed"] || "You are already subscribed!");
        } else {
          toast.error(content["footer.newsletter.error"] || "Error subscribing. Please try again.");
        }
      } else {
        toast.success(content["footer.newsletter.success"] || "Thank you for subscribing!");
        setEmail('');
        setConsent(false);
      }
    } catch (err) {
      console.error('Network error:', err);
      toast.error(content["footer.newsletter.error"] || "Error subscribing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_2fr] gap-8">
          {/* Brand */}
          <div>
            <img
              src={dr3amtorealLogo}
              alt="From Dream To Real 3D"
              className="h-12 w-auto mb-4 cursor-pointer"
              onClick={() => navigate("/")}
            />
            <p className="text-sm text-muted-foreground">
              {content["footer.brand.description"] || "Custom 3D printed solutions for car enthusiasts and home decorators. Quality, precision, and innovation in every design."}
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {content["footer.brand.address"] || "Travessa Cabo Luis N9, 3800-294 Aveiro, Portugal"}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {content["footer.brand.email"] || "dr3amtoreal@gmail.com"}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {content["footer.brand.phone"] || "+351 963 007 377"}
                </span>
              </div>
            </div>
          </div>

          {/* Ajuda & Suporte */}
          <div>
            <h3 className="font-semibold text-foreground mb-6">{content["footer.help.title"] || "Help & Support"}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigate("/dashboard?tab=orders")} className="hover:text-primary transition-colors">
                  {content["footer.help.my_order"] || "My Order"}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/delivery-shipping")} className="hover:text-primary transition-colors">
                  {content["footer.help.delivery"] || "Delivery and Shipping"}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/returns-refunds")} className="hover:text-primary transition-colors">
                  {content["footer.help.returns"] || "Returns and Refunds"}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/terms")} className="hover:text-primary transition-colors">
                  {content["footer.help.terms"] || "Terms and Conditions"}
                </button>
              </li>
            </ul>
          </div>

          {/* Informação Útil */}
          <div>
            <h3 className="font-semibold text-foreground mb-6">{content["footer.info.title"] || "Informação Útil"}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigate("/livro-reclamacoes")} className="hover:text-primary transition-colors">
                  {content["footer.info.complaints"] || "Complaints Book"}
                </button>
              </li>
{/*               <li>
                <button onClick={() => navigate("/blog")} className="hover:text-primary transition-colors">
                  {content["footer.info.blog"] || "Blog"}
                </button>
              </li> */}
            </ul>
          </div>

        {/* Newsletter */}
        <div>
            <h3 className="font-semibold text-foreground mb-6">{content["footer.newsletter.title"] || "Receber ofertas e descontos por e-mail:"}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {content["footer.newsletter.description"] || "Subscribe to our newsletter to get the latest news and offers."}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-5">
              <div>
                <Label htmlFor="newsletter-email">{content["footer.newsletter.email_label"] || "Email"}</Label>
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder={content["footer.newsletter.placeholder"] || "your@email.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="newsletter-consent"
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked === "indeterminate" ? false : checked)}
                />
                <Label htmlFor="newsletter-consent" className="text-sm text-muted-foreground leading-relaxed">
                  {(() => {
                    const consentText = content["footer.newsletter.consent"] || "By confirming your registration, you agree that your data will be processed by us, in accordance with the Data Protection Policy.";
                    const parts = consentText.split("Data Protection Policy");
                    return (
                      <>
                        {parts[0]}
                        <button
                          type="button"
                          onClick={() => navigate("/terms")}
                          className="underline hover:text-primary transition-colors"
                        >
                          Data Protection Policy
                        </button>
                        {parts[1]}
                      </>
                    );
                  })()}
                </Label>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !consent || !email}
                className="w-full"
              >
                {content["footer.newsletter.button"] || "Subscribe"}
              </Button>
            </form>

        {/* Social Media */}
        <div className="mt-8">
            <h3 className="font-semibold text-foreground mb-6">{content["footer.social.title"] || "Follow us!"}</h3>
            <div className="flex space-x-4">
              <a
                href={content["footer.social.instagram_url"] || "https://instagram.com/dr3amtoreal"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={content["footer.social.instagram_label"] || "Follow us on Instagram"}
                className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-300"
              >
                <Instagram className="h-6 w-6" />
              </a>
              {/* <a
                href={content["footer.social.youtube_url"] || "https://youtube.com/@pompousweek"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={content["footer.social.youtube_label"] || "Follow us on YouTube"}
                className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-300"
              >
                <Youtube className="h-6 w-6" />
              </a> */}
              <a
                href={content["footer.social.facebook_url"] || "https://facebook.com/dr3amtoreal"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={content["footer.social.facebook_label"] || "Follow us on Facebook"}
                className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-300"
              >
                <Facebook className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        </div>
        <div className="border-t border-border mt-12 pt-10 text-center text-sm text-muted-foreground">
          <p>{content["footer.copyright"] || "© 2025 Pompousweek Unipessoal Lda. All rights reserved."}</p>
        </div>
        <div className="mt-8 pt-8 border-t border-border">
          <h3 className="font-semibold text-foreground mb-6 text-center">{content["footer.payment.title"] || "Payment Methods"}</h3>
          <div className="flex flex-wrap justify-center gap-4 items-center">
            <div className="h-8 w-auto text-muted-foreground" aria-label={content["footer.payment.visa_label"] || "Visa"}>
              <VisaIcon />
            </div>
            <div className="h-8 w-auto text-muted-foreground" aria-label={content["footer.payment.mastercard_label"] || "Mastercard"}>
              <MastercardIcon />
            </div>
            <div className="h-8 w-auto text-muted-foreground" aria-label={content["footer.payment.paypal_label"] || "PayPal"}>
              <PaypalIcon />
            </div>
            <div className="h-8 w-auto text-muted-foreground" aria-label={content["footer.payment.mbway_label"] || "MBWay"}>
              <MbwayIcon />
            </div>
            <div className="h-8 w-auto text-muted-foreground" aria-label={content["footer.payment.googlepay_label"] || "Google Pay"}>
              <GooglePayIcon />
            </div>
            <div className="h-8 w-auto text-muted-foreground" aria-label={content["footer.payment.applepay_label"] || "Apple Pay"}>
              <ApplePayIcon />
            </div>
            <div className="h-8 w-auto text-muted-foreground" aria-label={content["footer.payment.mb_label"] || "Multibanco"}>
              <MbIcon />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
