import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart, Users, MapPin } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-16">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-4">About Talabat Rwanda</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Connecting communities across Rwanda with local businesses and services
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To empower local businesses in Rwanda by providing them with a digital platform 
                to reach customers, while making it easy for people to discover and support 
                their local community.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Our Story
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Founded in 2024, Talabat Rwanda started with a simple idea: to bridge the gap 
                between local businesses and their communities. We believe in the power of 
                local commerce and digital innovation.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Join Our Community</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/customer-register">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started as Customer
              </Button>
            </Link>
            <Link to="/supplier-register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Join as Business Partner
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;