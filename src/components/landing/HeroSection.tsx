import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import heroImage from "@/assets/hero-food-spread.jpg";
import talabatLogo from "@/assets/talabat-logo.png";

export const HeroSection = () => {

  const stats = [
    { label: "Partner Restaurants", value: "20+", color: "hsl(var(--accent))" },
    { label: "Monthly Orders", value: "1,580+", color: "hsl(var(--secondary))" },
    { label: "Partner Satisfaction", value: "98%", color: "hsl(var(--primary))" }
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Content */}
          <div className="text-white space-y-8">
            <div className="space-y-6">
              {/* Talabat Logo */}
              <div className="mb-8">
                <img 
                  src={talabatLogo} 
                  alt="Talabat Rwanda" 
                  className="h-16 md:h-20 lg:h-24 w-auto"
                />
              </div>
              
              <Badge 
                variant="secondary" 
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
                Rwanda's Premier Food & Business Marketplace
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Grow Your Business
                <br />
                <span className="text-secondary">
                  with Rwanda's Premier Platform
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 max-w-2xl">
                Join 20+ restaurants and businesses already serving Rwanda's growing marketplace
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button 
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
                >
                  Join as Partner
                </Button>
              </Link>
              <Link to="/customer-suppliers">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg"
                >
                  Explore Restaurants
                </Button>
              </Link>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div 
                    className="text-3xl md:text-4xl font-bold mb-2"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-gray-300 text-sm md:text-base">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-yellow-400">
              <div className="flex items-center">
                <span className="text-sm">📍</span>
                <span className="ml-2 text-white">Serving Kigali Market</span>
              </div>
              <Button variant="link" className="text-yellow-400 p-0 h-auto">
                Learn More
              </Button>
            </div>
          </div>

          {/* Right Column - Success Stories Card */}
          <div className="relative">
            <div 
              className="bg-gradient-to-br from-primary/95 to-secondary/90 p-8 rounded-3xl border border-white/20 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Join Our Success Stories
                </h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-white/70 hover:text-white">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white/70 hover:text-white">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-white">Partner Restaurant</h4>
                <p className="text-white/90 leading-relaxed">
                  "Be part of Rwanda's premier Arabic food delivery platform"
                </p>

                <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                        <Star className="h-5 w-5 text-yellow-800" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Your Restaurant Name</div>
                        <div className="text-white/70 text-sm">Arabic Cuisine • Premium Location</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-yellow-400 text-yellow-900">Featured</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <span>📍</span>
                    <span>Kigali Location</span>
                    <Badge variant="outline" className="border-yellow-400 text-yellow-400 ml-auto">
                      Premium Listing
                    </Badge>
                  </div>
                </div>

                {/* Pagination dots */}
                <div className="flex justify-center gap-2 pt-4">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};