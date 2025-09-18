import React from 'react';
import { ArrowRight, Shield, Zap, Users, Building, CheckCircle, Globe, Lock, Cpu, Target, Heart, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ZyriaLogo } from '@/components/branding/ZyriaLogo';
import { Link, useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Every feature is built with enterprise-grade security at its core, ensuring your data remains protected and compliant.',
      color: 'text-blue-500'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We continuously push the boundaries of AI technology to deliver cutting-edge solutions that drive business value.',
      color: 'text-purple-500'
    },
    {
      icon: Award,
      title: 'Enterprise Reliability',
      description: 'Built for scale with 99.9% uptime SLA, ensuring your business operations never skip a beat.',
      color: 'text-green-500'
    },
    {
      icon: Heart,
      title: 'Customer Success',
      description: 'Your success is our success. We partner with you to ensure maximum value from your AI automation investment.',
      color: 'text-red-500'
    }
  ];

  const differentiators = [
    {
      icon: Building,
      title: 'Multi-Tenant Architecture',
      description: 'Purpose-built for enterprises serving multiple organizations with isolated data and custom configurations.',
      benefits: ['Data isolation', 'Custom branding per tenant', 'Centralized management', 'Scalable infrastructure']
    },
    {
      icon: Cpu,
      title: 'Knowledge Integration',
      description: 'Advanced RAG technology that seamlessly integrates with your existing knowledge bases and documentation.',
      benefits: ['Document processing', 'Real-time learning', 'Context-aware responses', 'Multi-source integration']
    },
    {
      icon: Zap,
      title: 'Workflow Automation',
      description: 'Intelligent process automation that goes beyond chatbots to orchestrate complex business workflows.',
      benefits: ['Process orchestration', 'Smart routing', 'Escalation management', 'Performance analytics']
    },
    {
      icon: Globe,
      title: 'White-Label Ready',
      description: 'Complete customization capabilities allowing you to deliver AI solutions under your own brand.',
      benefits: ['Custom branding', 'Domain mapping', 'UI customization', 'API white-labeling']
    }
  ];

  const techHighlights = [
    {
      title: 'Cloud-Native Architecture',
      description: 'Built on modern microservices architecture for maximum scalability and reliability.'
    },
    {
      title: 'AI Model Flexibility',
      description: 'Support for multiple AI models with seamless switching based on use case requirements.'
    },
    {
      title: 'Real-Time Processing',
      description: 'Sub-second response times with real-time analytics and monitoring capabilities.'
    },
    {
      title: 'API-First Design',
      description: 'Comprehensive REST and GraphQL APIs for seamless enterprise system integration.'
    },
    {
      title: 'Security Monitoring',
      description: 'Continuous security monitoring with automated threat detection and response.'
    },
    {
      title: 'Compliance Ready',
      description: 'SOC 2 Type II certified with GDPR, CCPA, and industry-specific compliance features.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <ZyriaLogo className="w-8 h-8" />
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link to="/#solutions" className="text-muted-foreground hover:text-foreground transition-colors">Solutions</Link>
            <Link to="/#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Customers</Link>
            <Link to="/about" className="text-foreground font-medium">About</Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/contact')} className="bg-gradient-primary hover:shadow-glow">
              Request Demo
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-background via-accent/5 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              🏢 Developed by Northstar
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Transforming Enterprise Communication with AI
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Zyria empowers enterprises with secure, intelligent chatbot solutions that scale across multiple tenants while maintaining the highest standards of security and compliance.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                SOC 2 Type II Certified
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                GDPR Compliant
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Enterprise Focused
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Built for the Future of Enterprise AI
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                At Northstar, we recognized that enterprises needed more than just chatbots—they needed intelligent, secure, and scalable AI solutions that could grow with their business while maintaining the highest standards of security and compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  To empower enterprises with secure, intelligent chatbot solutions that transform customer engagement and streamline business operations. We believe in democratizing AI-powered automation while never compromising on security or reliability.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Every feature we build is designed with enterprise needs in mind—from multi-tenant architecture to advanced security controls, we ensure that Zyria scales with your business.
                </p>
              </div>
              <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">Our Vision</h4>
                  <p className="text-muted-foreground">
                    To be the leading platform for enterprise AI automation, enabling businesses to deliver exceptional customer experiences at scale.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center border-border bg-card hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 mb-4 mx-auto">
                    <value.icon className={`h-6 w-6 ${value.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {value.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Sets Zyria Apart
            </h2>
            <p className="text-xl text-muted-foreground">
              Purpose-built for enterprise success with advanced capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {differentiators.map((diff, index) => (
              <Card key={index} className="border-border bg-card hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10">
                      <diff.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-foreground mb-2">
                        {diff.title}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        {diff.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {diff.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Leadership */}
      <section className="py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Technology Leadership
            </h2>
            <p className="text-xl text-muted-foreground">
              Built on cutting-edge technology for enterprise-grade performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {techHighlights.map((tech, index) => (
              <Card key={index} className="border-border bg-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {tech.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {tech.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Focus */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Designed for Enterprise Success
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Zyria isn't just another chatbot platform—it's a comprehensive enterprise solution designed specifically for B2B and enterprise use cases.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="text-left">
                <h3 className="text-xl font-semibold text-foreground mb-4">Professional Services</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Implementation support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Custom development</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Training and onboarding</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Ongoing optimization</span>
                  </li>
                </ul>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-foreground mb-4">Enterprise Support</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Dedicated account management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-muted-foreground">99.9% uptime SLA</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-muted-foreground">24/7 technical support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Priority feature requests</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-purple-500/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Customer Engagement?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Contact our team to learn how Zyria can enhance your business operations and deliver exceptional customer experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:shadow-glow text-lg px-8 py-6"
              onClick={() => navigate('/contact')}
            >
              Schedule a Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6"
              onClick={() => navigate('/contact')}
            >
              Contact Our Team
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <ZyriaLogo className="w-8 h-8" />
              </div>
              <p className="text-muted-foreground mb-4">
                Enterprise AI chatbot platform for intelligent automation and customer engagement.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link to="/#solutions" className="text-muted-foreground hover:text-foreground transition-colors">Solutions</Link></li>
                <li><Link to="/integrations" className="text-muted-foreground hover:text-foreground transition-colors">Integrations</Link></li>
                <li><Link to="/api" className="text-muted-foreground hover:text-foreground transition-colors">API Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link to="/careers" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link to="/status" className="text-muted-foreground hover:text-foreground transition-colors">Status</Link></li>
                <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Zyria by Northstar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;