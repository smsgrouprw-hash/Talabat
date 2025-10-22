import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Clock, Users, Heart } from 'lucide-react';

const Careers = () => {
  const positions = [
    {
      title: "Frontend Developer",
      department: "Engineering",
      location: "Kigali, Rwanda",
      type: "Full-time",
      level: "Mid-level",
      description: "Join our engineering team to build amazing user experiences for our growing platform."
    },
    {
      title: "Customer Success Manager",
      department: "Customer Experience",
      location: "Kigali, Rwanda", 
      type: "Full-time",
      level: "Entry-level",
      description: "Help our customers succeed and grow their businesses on our platform."
    },
    {
      title: "Business Development Specialist",
      department: "Sales",
      location: "Kigali, Rwanda",
      type: "Full-time", 
      level: "Mid-level",
      description: "Drive growth by partnering with local businesses across Rwanda."
    },
    {
      title: "Marketing Intern",
      department: "Marketing",
      location: "Kigali, Rwanda",
      type: "Internship",
      level: "Entry-level", 
      description: "Support our marketing initiatives and learn digital marketing in a fast-growing startup."
    }
  ];

  const benefits = [
    "Competitive salary and equity",
    "Health insurance coverage", 
    "Professional development budget",
    "Flexible working arrangements",
    "Team building activities",
    "Modern office in Kigali"
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
          <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Help us build the future of local commerce in Rwanda
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Company Culture */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Why Work With Us?</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Make a real difference in the lives of local business owners and communities across Rwanda.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Join a fast-growing startup where you can learn, develop your skills, and advance your career.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Local
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Work with a team that understands and is passionate about the Rwandan market and culture.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Benefits & Perks</CardTitle>
              <CardDescription>We take care of our team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-primary rounded-full" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Open Positions */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8">Open Positions</h2>
          <div className="space-y-6">
            {positions.map((position, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="mb-2">{position.title}</CardTitle>
                      <CardDescription className="mb-4">
                        {position.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{position.department}</Badge>
                        <Badge variant="outline">
                          <MapPin className="h-3 w-3 mr-1" />
                          {position.location}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {position.type}
                        </Badge>
                        <Badge variant="outline">{position.level}</Badge>
                      </div>
                    </div>
                    <Link to="/contact">
                      <Button>Apply Now</Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* No Position Found */}
          <Card className="mt-8">
            <CardContent className="text-center py-8">
              <h3 className="text-xl font-semibold mb-2">Don't see the right position?</h3>
              <p className="text-muted-foreground mb-4">
                We're always looking for talented people to join our team. Send us your resume!
              </p>
              <Link to="/contact">
                <Button variant="outline">Get in Touch</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Careers;