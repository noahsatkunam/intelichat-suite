import React, { useState } from 'react';
import { ArrowRight, MessageCircle, Brain, Shield, Zap, Users, Building, ChevronDown, Menu, X, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ZyriaLogo } from '@/components/branding/ZyriaLogo';
import { DarkVeilBackground } from '@/components/ui/DarkVeilBackground';
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageCircle,
      title: 'AI-Powered Conversations',
      description: 'Deploy intelligent chatbots that understand context and provide accurate responses using your knowledge base.',
      color: 'text-blue-500'
    },
    {
      icon: Building,
      title: 'Multi-Tenant Architecture',
      description: 'Serve multiple organizations with isolated data, custom branding, and tenant-specific configurations.',
      color: 'text-purple-500'
    },
    {
      icon: Brain,
      title: 'Knowledge Integration',
      description: 'Connect your documents, databases, and APIs to create context-aware AI assistants.',
      color: 'text-green-500'
    },
    {
      icon: Zap,
      title: 'Workflow Automation',
      description: 'Automate business processes with AI-driven workflows and intelligent task routing.',
      color: 'text-yellow-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with encryption, compliance certifications, and audit trails.',
      color: 'text-red-500'
    },
    {
      icon: Users,
      title: 'White-Label Ready',
      description: 'Complete customization with your branding, domain, and user experience.',
      color: 'text-indigo-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CTO, TechFlow Solutions',
      content: 'Zyria transformed our customer support. 85% reduction in response time and 40% increase in satisfaction.',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Operations, GlobalCorp',
      content: 'The multi-tenant architecture allowed us to serve all our subsidiaries from one platform. Game changer.',
      rating: 5
    },
    {
      name: 'Lisa Thompson',
      role: 'VP Engineering, DataSync',
      content: 'Implementation was seamless. The knowledge integration capabilities are exactly what we needed.',
      rating: 5
    }
  ];

  const solutions = [
    {
      name: 'Customer Support',
      description: 'AI-powered customer service automation',
      icon: MessageCircle,
      features: [
        '24/7 automated responses',
        'Multi-channel integration',
        'Escalation workflows',
        'Performance analytics',
        'Knowledge base integration'
      ],
      useCases: ['Help desk automation', 'FAQ management', 'Ticket routing']
    },
    {
      name: 'Internal Operations',
      description: 'Streamline internal processes and workflows',
      icon: Building,
      features: [
        'Employee self-service',
        'Process automation',
        'Document retrieval',
        'Policy guidance',
        'Training assistance'
      ],
      useCases: ['HR automation', 'IT support', 'Compliance guidance'],
      highlighted: true
    },
    {
      name: 'Multi-Tenant Deployment',
      description: 'Serve multiple organizations from one platform',
      icon: Users,
      features: [
        'Isolated tenant data',
        'Custom branding per tenant',
        'Centralized management',
        'Scalable architecture',
        'White-label options'
      ],
      useCases: ['SaaS providers', 'Franchise operations', 'Partner networks']
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Dark Veil Background */}
      <DarkVeilBackground />
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <ZyriaLogo className="w-8 h-8" />
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#solutions" className="text-muted-foreground hover:text-foreground transition-colors">Solutions</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Customers</a>
              <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="container mx-auto px-4 py-4 space-y-4">
              <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#solutions" className="block text-muted-foreground hover:text-foreground transition-colors">Solutions</a>
              <a href="#testimonials" className="block text-muted-foreground hover:text-foreground transition-colors">Customers</a>
              <Link to="/about" className="block text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              <div className="pt-4">
                <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                  Login
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 relative bg-gradient-to-br from-background/80 via-accent/5 to-primary/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              🚀 Now supporting multi-tenant deployments
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Enterprise AI Chatbot Platform
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Deploy intelligent, knowledge-powered chatbots across multiple tenants. 
              Automate customer support, internal processes, and business workflows with enterprise-grade security.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:shadow-glow text-lg px-8 py-6"
                onClick={() => navigate('/contact')}
              >
                Request Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/contact')}
              >
                Contact Sales
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                SOC 2 Compliant
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                99.9% Uptime SLA
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Enterprise Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background/90 backdrop-blur-sm relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to deploy AI at scale
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From single deployments to enterprise-wide rollouts, Zyria adapts to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-accent/5 backdrop-blur-sm relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by industry leaders
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our customers are saying about Zyria
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 bg-background/90 backdrop-blur-sm relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Solutions for every use case
            </h2>
            <p className="text-xl text-muted-foreground">
              Deploy Zyria across different scenarios and business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {solutions.map((solution, index) => (
              <Card key={index} className={`relative ${solution.highlighted ? 'border-primary shadow-lg scale-105' : 'border-border'}`}>
                {solution.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 mb-4 mx-auto">
                    <solution.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{solution.name}</CardTitle>
                  <p className="text-muted-foreground mt-2">{solution.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {solution.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3">Use Cases:</h4>
                    <div className="flex flex-wrap gap-2">
                      {solution.useCases.map((useCase, caseIndex) => (
                        <Badge key={caseIndex} variant="secondary" className="text-xs">
                          {useCase}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate('/contact')}
                  >
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-purple-500/10 backdrop-blur-sm relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to transform your business with AI?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Contact our sales team to discuss your enterprise AI automation needs and get a customized solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:shadow-glow text-lg px-8 py-6"
              onClick={() => navigate('/contact')}
            >
              Request Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6"
              onClick={() => navigate('/contact')}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/90 border-t border-border backdrop-blur-sm relative">
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
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#solutions" className="text-muted-foreground hover:text-foreground transition-colors">Solutions</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 Zyria. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;