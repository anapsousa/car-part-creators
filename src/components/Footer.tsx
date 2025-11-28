import { useState } from "react";
import { useNavigate } from "react-router-dom";
import pompousweekLogo from "@/assets/pompousweek-logo.png";
import { useContent } from "@/hooks/useContent";
import { Instagram, Youtube, Facebook } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { supabase } from '@/integrations/supabase/client';

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
          toast.info(content["footer.newsletter.already_subscribed"] || "Já está subscrito!");
        } else {
          toast.error(content["footer.newsletter.error"] || "Erro ao subscrever. Tente novamente.");
        }
      } else {
        toast.success(content["footer.newsletter.success"] || "Obrigado por subscrever!");
        setEmail('');
        setConsent(false);
      }
    } catch (err) {
      console.error('Network error:', err);
      toast.error(content["footer.newsletter.error"] || "Erro ao subscrever. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div>
            <img 
              src={pompousweekLogo} 
              alt="Pompousweek" 
              className="h-12 w-auto mb-4 cursor-pointer" 
              onClick={() => navigate("/")}
            />
            <p className="text-sm text-muted-foreground">
              {content["footer.brand.description"] || "Custom 3D printed solutions for car enthusiasts and home decorators. Quality, precision, and innovation in every design."}
            </p>
          </div>

          {/* Ajuda & Suporte */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{content["footer.help.title"] || "Ajuda & Suporte"}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigate("/dashboard?tab=orders")} className="hover:text-primary transition-colors">
                  {content["footer.help.my_order"] || "A minha encomenda"}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/delivery-shipping")} className="hover:text-primary transition-colors">
                  {content["footer.help.delivery"] || "Entrega e Envio"}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/returns-refunds")} className="hover:text-primary transition-colors">
                  {content["footer.help.returns"] || "Devoluções e Reembolsos"}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/terms")} className="hover:text-primary transition-colors">
                  {content["footer.help.terms"] || "Termos e Condições"}
                </button>
              </li>
            </ul>
          </div>

          {/* Informação Útil */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{content["footer.info.title"] || "Informação Útil"}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigate("/livro-reclamacoes")} className="hover:text-primary transition-colors">
                  {content["footer.info.complaints"] || "Livro de Reclamações"}
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
            <h3 className="font-semibold text-foreground mb-4">{content["footer.newsletter.title"] || "Receber ofertas e descontos por e-mail:"}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {content["footer.newsletter.description"] || "Assine a newsletter e fique por dentro de nossas ofertas incríveis e das últimas novidades."}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
              <div>
                <Label htmlFor="newsletter-email">{content["footer.newsletter.email_label"] || "Email"}</Label>
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder={content["footer.newsletter.placeholder"] || "seu@email.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="newsletter-consent"
                  checked={consent}
                  onCheckedChange={setConsent}
                />
                <Label htmlFor="newsletter-consent" className="text-sm text-muted-foreground leading-relaxed">
                  {(() => {
                    const consentText = content["footer.newsletter.consent"] || "Ao confirmar o registo, aceitas que os teus dados sejam processados por nós, conforme a Política de Proteção de Dados.";
                    const parts = consentText.split("Política de Proteção de Dados");
                    return (
                      <>
                        {parts[0]}
                        <button
                          type="button"
                          onClick={() => navigate("/terms")}
                          className="underline hover:text-primary transition-colors"
                        >
                          Política de Proteção de Dados
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
                {content["footer.newsletter.button"] || "Subscrever"}
              </Button>
            </form>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{content["footer.social.title"] || "Segue-nos!"}</h3>
            <div className="flex space-x-4">
              <a
                href={content["footer.social.instagram_url"] || "https://instagram.com/pompousweek"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={content["footer.social.instagram_label"] || "Follow us on Instagram"}
                className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-300"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href={content["footer.social.youtube_url"] || "https://youtube.com/@pompousweek"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={content["footer.social.youtube_label"] || "Follow us on YouTube"}
                className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-300"
              >
                <Youtube className="h-6 w-6" />
              </a>
              <a
                href={content["footer.social.facebook_url"] || "https://facebook.com/pompousweek"}
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

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>{content["footer.copyright"] || "© 2025 Pompousweek. All rights reserved."}</p>
        </div>
      </div>
    </footer>
  );
};
