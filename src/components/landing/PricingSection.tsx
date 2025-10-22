import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Star, Crown } from "lucide-react";
import { Link } from 'react-router-dom';

export const PricingSection = () => {
  const plans = [
    {
      name: "Basic Plan",
      price: "25,000",
      currency: "RWF",
      period: "/month",
      description: "Perfect for small restaurants getting started",
      icon: Zap,
      iconBg: "#E74C3C",
      popular: false,
      features: [
        "Online menu & restaurant listing",
        "Order management system",
        "Customer reach in Arabic community",
        "Email support",
        "Basic analytics dashboard",
        "Mobile app notifications"
      ]
    },
    {
      name: "Professional Plan", 
      price: "35,000",
      currency: "RWF",
      period: "/month",
      description: "Most popular choice for growing restaurants",
      icon: Star,
      iconBg: "#F1C40F",
      popular: true,
      features: [
        "Everything in Basic Plan",
        "Priority listing in search results", 
        "Advanced analytics dashboard",
        "WhatsApp notifications",
        "Phone support",
        "Custom restaurant branding",
        "Promotional campaigns support",
        "Customer reviews management"
      ]
    },
    {
      name: "Enterprise Plan",
      price: "50,000",
      currency: "RWF", 
      period: "/month",
      description: "Complete solution for established restaurants",
      icon: Crown,
      iconBg: "#8B4513",
      popular: false,
      features: [
        "Everything in Professional Plan",
        "Full business management software",
        "Inventory management system", 
        "Advanced sales reporting & analytics",
        "All future feature updates",
        "Dedicated account manager",
        "Priority customer support",
        "Custom integrations available",
        "Multi-location management"
      ]
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-amber-900">
            Choose Your Partnership Plan
          </h2>
          <p className="text-xl max-w-3xl mx-auto text-amber-700/80">
            Flexible pricing options designed to grow with your restaurant business
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                plan.popular 
                  ? 'border-4 border-yellow-400 scale-105 bg-gradient-to-b from-yellow-50 to-orange-50' 
                  : 'border border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <>
                  <div className="absolute -top-3 -right-3 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rotate-12 transform origin-center">
                    POPULAR
                  </div>
                </>
              )}

              <CardHeader className="text-center pb-6 pt-8">
                <div 
                  className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: plan.iconBg }}
                >
                  <plan.icon className="h-8 w-8 text-white" />
                </div>
                
                <CardTitle className="text-2xl font-bold mb-2 text-amber-900">
                  {plan.name}
                </CardTitle>
                
                <div className="text-center mb-4">
                  <span className="text-5xl font-bold text-amber-900">
                    {plan.price}
                  </span>
                  <span className="text-lg ml-2 text-amber-700">
                    {plan.currency} {plan.period}
                  </span>
                </div>
                
                <p className="text-base text-amber-700/80">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6 px-6 pb-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-yellow-500" />
                      <span className="text-sm text-amber-800 leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth" className="block">
                  <Button 
                    size="lg" 
                    className={`w-full font-semibold py-3 mt-6 transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-amber-900 hover:bg-amber-800 text-white shadow-lg' 
                        : 'bg-amber-900 hover:bg-amber-800 text-white'
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};