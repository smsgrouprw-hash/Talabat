import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Star } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      description: "Perfect for small businesses getting started",
      features: [
        "List your business",
        "Up to 10 products/services",
        "Basic analytics",
        "Email support",
        "Standard commission rate"
      ],
      isPopular: false,
      ctaText: "Get Started",
      ctaLink: "/supplier-register"
    },
    {
      name: "Premium", 
      price: "25,000 RWF/month",
      description: "For growing businesses that need more features",
      features: [
        "Everything in Basic",
        "Unlimited products/services", 
        "Advanced analytics",
        "Priority support",
        "Reduced commission rate",
        "Featured placement",
        "Custom branding"
      ],
      isPopular: true,
      ctaText: "Start Premium",
      ctaLink: "/supplier-register"
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large businesses with specific needs",
      features: [
        "Everything in Premium",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 phone support",
        "Custom commission rates",
        "API access",
        "White-label options"
      ],
      isPopular: false,
      ctaText: "Contact Sales",
      ctaLink: "/contact"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-16">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-4">Pricing Plans</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Choose the perfect plan for your business needs
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.isPopular ? 'border-primary shadow-lg' : ''}`}>
              {plan.isPopular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-primary mb-2">
                  {plan.price}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to={plan.ctaLink} className="block">
                  <Button 
                    className={`w-full ${plan.isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={plan.isPopular ? 'default' : 'outline'}
                  >
                    {plan.ctaText}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold mb-2">What's included in the commission rate?</h3>
              <p className="text-muted-foreground text-sm">
                Our commission covers payment processing, customer support, marketing exposure, and platform maintenance.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a setup fee?</h3>
              <p className="text-muted-foreground text-sm">
                No setup fees for any plan. You only pay the monthly subscription fee (if applicable).
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground text-sm">
                We accept mobile money, bank transfers, and credit cards for premium subscriptions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;