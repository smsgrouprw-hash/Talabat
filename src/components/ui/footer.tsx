import { Link } from "react-router-dom";
import { Logo } from "./logo";
import { Button } from "./button";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { RwandaFlag } from "./rwanda-flag";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Logo variant="vertical" size="lg" />
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Rwanda's Premier Food & Business Marketplace connecting communities with authentic flavors and trusted businesses.
            </p>
            <div className="flex items-center gap-2">
              <RwandaFlag className="w-6 h-4" />
              <span className="text-sm font-medium">Proudly Serving Rwanda</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <nav className="space-y-2">
              <Link to="/customer-suppliers" className="block text-primary-foreground/80 hover:text-secondary transition-colors text-sm">
                Browse Restaurants
              </Link>
              <Link to="/auth?tab=business" className="block text-primary-foreground/80 hover:text-secondary transition-colors text-sm">
                Join as Partner
              </Link>
              <Link to="/about" className="block text-primary-foreground/80 hover:text-secondary transition-colors text-sm">
                About Us
              </Link>
              <Link to="/careers" className="block text-primary-foreground/80 hover:text-secondary transition-colors text-sm">
                Careers
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Support</h3>
            <nav className="space-y-2">
              <Link to="/contact" className="block text-primary-foreground/80 hover:text-secondary transition-colors text-sm">
                Contact Us
              </Link>
              <Link to="/privacy" className="block text-primary-foreground/80 hover:text-secondary transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/pricing" className="block text-primary-foreground/80 hover:text-secondary transition-colors text-sm">
                Pricing
              </Link>
              <Button variant="link" className="p-0 h-auto text-primary-foreground/80 hover:text-secondary text-sm">
                Help Center
              </Button>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-secondary" />
                <div className="text-sm text-primary-foreground/80">
                  <p>Kigali, Rwanda</p>
                  <p>Downtown Business District</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-secondary" />
                <span className="text-sm text-primary-foreground/80">+250 788 123 456</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-secondary" />
                <span className="text-sm text-primary-foreground/80">hello@talabat.rw</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-primary-foreground/80">Follow us:</span>
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-primary-foreground/80 hover:text-secondary hover:bg-secondary/10"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-primary-foreground/80 hover:text-secondary hover:bg-secondary/10"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-primary-foreground/80 hover:text-secondary hover:bg-secondary/10"
                >
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-primary-foreground/80 hover:text-secondary hover:bg-secondary/10"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-primary-foreground/60">
              © 2024 Talabat Rwanda. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};