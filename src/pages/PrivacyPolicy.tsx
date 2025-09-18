import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZyriaLogo } from '@/components/branding/ZyriaLogo';
import { ArrowLeft, Shield, Eye, Users, FileText, Clock, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <Link to="/" className="flex items-center">
              <ZyriaLogo className="w-6 h-6 mr-2" />
              <span className="font-semibold">Zyria</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background via-accent/5 to-primary/5">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Shield className="h-3 w-3 mr-1" />
              Privacy & Data Protection
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground">
              Your privacy and data security are our top priorities. Learn how we protect and handle your information.
            </p>
            <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last updated: January 1, 2025
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-8">
            
            {/* Overview */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  At Zyria, we are committed to protecting your privacy and ensuring the security of your personal information. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                  enterprise AI chatbot platform and related services.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Personal Information</h3>
                  <p className="text-muted-foreground mb-3">
                    We may collect personal information that you voluntarily provide when using our services, including:
                  </p>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li>• Name, email address, and contact information</li>
                    <li>• Account credentials and authentication data</li>
                    <li>• Company information and organizational details</li>
                    <li>• Communication preferences and settings</li>
                    <li>• Support requests and feedback</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Usage Information</h3>
                  <p className="text-muted-foreground mb-3">
                    We automatically collect certain information about your use of our platform:
                  </p>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li>• Device and browser information</li>
                    <li>• IP addresses and location data</li>
                    <li>• Platform usage patterns and analytics</li>
                    <li>• Performance metrics and error logs</li>
                    <li>• Chat interactions and conversation data</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We use the collected information for legitimate business purposes, including:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Service Delivery</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                      <li>• Providing and maintaining our platform</li>
                      <li>• Processing your requests and transactions</li>
                      <li>• Customizing your user experience</li>
                      <li>• Enabling AI chatbot functionality</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Communication</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                      <li>• Sending service updates and notifications</li>
                      <li>• Responding to customer support inquiries</li>
                      <li>• Sharing product improvements</li>
                      <li>• Marketing communications (with consent)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Data Security & Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We implement industry-leading security measures to protect your information:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-accent/10 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Encryption</h4>
                    <p className="text-sm text-muted-foreground">
                      End-to-end encryption for all data in transit and at rest using AES-256 standards
                    </p>
                  </div>
                  <div className="text-center p-4 bg-accent/10 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Access Control</h4>
                    <p className="text-sm text-muted-foreground">
                      Multi-factor authentication and role-based access controls for all users
                    </p>
                  </div>
                  <div className="text-center p-4 bg-accent/10 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Compliance</h4>
                    <p className="text-sm text-muted-foreground">
                      SOC 2 Type II certified with GDPR and CCPA compliance standards
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Information Sharing & Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We do not sell, trade, or rent your personal information. We may share information only in these limited circumstances:
                </p>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-foreground">Service Providers</h4>
                    <p className="text-sm text-muted-foreground">
                      Trusted third-party vendors who assist in platform operations, subject to strict confidentiality agreements
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Legal Requirements</h4>
                    <p className="text-sm text-muted-foreground">
                      When required by law, regulation, or court order, or to protect our rights and safety
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Business Transfers</h4>
                    <p className="text-sm text-muted-foreground">
                      In connection with mergers, acquisitions, or asset sales, with appropriate data protection measures
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Your Privacy Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You have the following rights regarding your personal information:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-foreground">Access & Portability</h4>
                      <p className="text-sm text-muted-foreground">Request copies of your personal data</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Correction</h4>
                      <p className="text-sm text-muted-foreground">Update or correct inaccurate information</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Deletion</h4>
                      <p className="text-sm text-muted-foreground">Request deletion of your personal data</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-foreground">Restriction</h4>
                      <p className="text-sm text-muted-foreground">Limit how we process your information</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Objection</h4>
                      <p className="text-sm text-muted-foreground">Object to certain data processing activities</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Opt-out</h4>
                      <p className="text-sm text-muted-foreground">Unsubscribe from marketing communications</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong className="text-foreground">Email:</strong> <span className="text-primary">privacy@zyria.com</span></p>
                  <p><strong className="text-foreground">Mail:</strong> Zyria Privacy Team, 123 Enterprise Blvd, Suite 100, Tech City, TC 12345</p>
                  <p><strong className="text-foreground">Phone:</strong> +1 (555) 123-4567</p>
                </div>
                <div className="mt-6">
                  <Button onClick={() => navigate('/contact')} className="w-full sm:w-auto">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Privacy Team
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/50 border-t border-border mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Zyria. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;