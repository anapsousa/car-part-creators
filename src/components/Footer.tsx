import { useNavigate } from "react-router-dom";
import pompousweekLogo from "@/assets/pompousweek-logo.png";
import { useContent } from "@/hooks/useContent";

export const Footer = () => {
  const navigate = useNavigate();
  const { content } = useContent("footer");

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

          {/* Products */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{content["footer.products.title"] || "Products"}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigate("/shop")} className="hover:text-primary transition-colors">
                  {content["footer.products.all"] || "All Products"}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/generator")} className="hover:text-primary transition-colors">
                  {content["footer.products.models"] || "3D Models"}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/shop?category=car_parts")} className="hover:text-primary transition-colors">
                  {content["footer.products.car_parts"] || "Car Parts"}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/shop?category=home_decor")} className="hover:text-primary transition-colors">
                  {content["footer.products.home_decor"] || "Home Decor"}
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{content["footer.services.title"] || "Services"}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
{/*               <li>
                <button onClick={() => navigate("/generator")} className="hover:text-primary transition-colors">
                  {content["footer.services.ai_generator"] || "AI Model Generator"}
                </button>
              </li> */}
              <li>
                <button onClick={() => navigate("/shop")} className="hover:text-primary transition-colors">
                  {content["footer.services.custom_printing"] || "Custom Printing"}
                </button>
              </li>
{/*               <li>
                <button onClick={() => navigate("/contact")} className="hover:text-primary transition-colors">
                  {content["footer.services.restoration"] || "Restoration Services"}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/contact")} className="hover:text-primary transition-colors">
                  {content["footer.services.consultation"] || "Design Consultation"}
                </button>
              </li> */}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{content["footer.company.title"] || "Company"}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigate("/about")} className="hover:text-primary transition-colors">
                  {content["footer.company.about"] || "About Us"}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/contact")} className="hover:text-primary transition-colors">
                  {content["footer.company.contact"] || "Contact"}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/faq")} className="hover:text-primary transition-colors">
                  {content["footer.company.faq"] || "FAQ"}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/about")} className="hover:text-primary transition-colors">
                  {content["footer.company.terms"] || "Terms of Service"}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>{content["footer.copyright"] || "© 2025 Pompousweek. All rights reserved."}</p>
        </div>
      </div>
    </footer>
  );
};
