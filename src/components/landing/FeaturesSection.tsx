import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Globe, 
  BarChart3, 
  DollarSign, 
  Award, 
  MessageSquare,
  Shield,
  Clock,
  Star,
  TrendingUp,
  Zap,
  Heart
} from "lucide-react";
export const FeaturesSection = () => {

  const features = [
    {
      icon: Users,
      title: "Reach Arabic-Speaking Customers",
      description: "Connect with Kigali's growing Arabic community and expatriate market seeking authentic cuisine.",
      color: "#FF6B35",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Globe,
      title: "Professional Online Presence",
      description: "Get a beautiful, mobile-optimized restaurant profile with bilingual Arabic-English support.",
      color: "#1976D2",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      icon: Shield,
      title: "Secure & Reliable Platform",
      description: "Enterprise-grade security with 99.9% uptime guarantee and encrypted payment processing.",
      color: "#4CAF50",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: DollarSign,
      title: "No Upfront Costs",
      description: "Start earning immediately with our transparent pricing and no hidden setup fees.",
      color: "#FFD700",
      gradient: "from-yellow-500 to-amber-500"
    },
    {
      icon: TrendingUp,
      title: "Boost Your Revenue",
      description: "Average 40% increase in orders within the first month of joining our platform.",
      color: "#9C27B0",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Clock,
      title: "Quick Setup & Support",
      description: "Get online in 24 hours with our dedicated onboarding team and 24/7 customer support.",
      color: "#FF5722",
      gradient: "from-red-500 to-orange-500"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Why Partner With Talabat Rwanda?
          </h2>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed text-muted-foreground">
            Join Rwanda's premier Arabic food delivery platform and unlock new opportunities to grow your restaurant business
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group text-center border-0 bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden"
            >
              <CardHeader className="pb-4 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r" style={{ background: `linear-gradient(90deg, ${feature.color}, ${feature.color}80)` }} />
                <div 
                  className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon 
                    className="h-10 w-10 text-white drop-shadow-md" 
                  />
                </div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};