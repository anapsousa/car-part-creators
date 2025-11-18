import { useNavigate } from "react-router-dom";
import pompousweekLogo from "@/assets/pompousweek-logo.png";

export const Footer = () => {
  const navigate = useNavigate();

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
              Custom 3D printed solutions for car enthusiasts and home decorators. Quality, precision, and innovation in every design.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Products</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigate("/shop")} className="hover:text-primary transition-colors">
                  All Products
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/generator")} className="hover:text-primary transition-colors">
                  3D Models
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/shop?category=car_parts")} className="hover:text-primary transition-colors">
                  Car Parts
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/shop?category=home_decor")} className="hover:text-primary transition-colors">
                  Home Decor
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigate("/generator")} className="hover:text-primary transition-colors">
                  AI Model Generator
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/shop")} className="hover:text-primary transition-colors">
                  Custom Printing
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/contact")} className="hover:text-primary transition-colors">
                  Restoration Services
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/contact")} className="hover:text-primary transition-colors">
                  Design Consultation
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigate("/about")} className="hover:text-primary transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/contact")} className="hover:text-primary transition-colors">
                  Contact
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/faq")} className="hover:text-primary transition-colors">
                  FAQ
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/about")} className="hover:text-primary transition-colors">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Pompousweek. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
