import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ZyriaLogo } from '@/components/branding/ZyriaLogo';
import { welcomeContent } from '@/data/mockData';
import { demoService } from '@/services/demoService';
import { 
  BookOpen, 
  Shield, 
  Building, 
  BarChart, 
  Play, 
  Sparkles, 
  ArrowRight,
  MessageSquare,
  Users,
  TrendingUp
} from 'lucide-react';

interface WelcomeScreenProps {
  onStartDemo: (scenario: string) => void;
  onSkipToChat: () => void;
}

const iconMap = {
  BookOpen,
  Shield,
  Building,
  BarChart,
};

export function WelcomeScreen({ onStartDemo, onSkipToChat }: WelcomeScreenProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const demoScenarios = [
    {
      id: 'customer-service',
      title: 'Customer Support Excellence',
      description: 'See how Zyria handles customer inquiries with intelligent responses and knowledge base integration.',
      icon: MessageSquare,
      metrics: '67% faster resolution',
      color: 'bg-blue-500',
    },
    {
      id: 'technical-support',
      title: 'Technical Problem Solving',
      description: 'Watch Zyria provide code examples, debug errors, and reference technical documentation.',
      icon: Users,
      metrics: '89% accuracy rate',
      color: 'bg-purple-500',
    },
    {
      id: 'sales-enablement',
      title: 'Sales Team Support',
      description: 'Experience how Zyria empowers sales with product knowledge and competitive insights.',
      icon: TrendingUp,
      metrics: '28% higher close rate',
      color: 'bg-green-500',
    },
  ];

  const handleStartDemo = (scenarioId: string) => {
    demoService.toggleDemoMode(true);
    demoService.setCurrentScenario(scenarioId);
    onStartDemo(scenarioId);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col items-center justify-center p-8">
      <div className="max-w-6xl w-full space-y-12 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4">
            <ZyriaLogo size="xl" showText={true} variant="full" className="animate-fade-in-scale" />
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {welcomeContent.hero.description}
          </p>
          
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            Interactive Demo Available
          </Badge>
        </div>

        {/* Demo Scenarios */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold font-display mb-2">
              Choose Your Demo Experience
            </h2>
            <p className="text-muted-foreground">
              See Zyria in action with realistic scenarios from your industry
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {demoScenarios.map((scenario) => {
              const Icon = scenario.icon;
              const isSelected = selectedScenario === scenario.id;
              
              return (
                <Card 
                  key={scenario.id}
                  className={`cursor-pointer transition-all duration-300 interactive-element hover:shadow-large ${
                    isSelected ? 'ring-2 ring-primary shadow-glow' : ''
                  }`}
                  onClick={() => setSelectedScenario(scenario.id)}
                >
                  <CardHeader className="text-center">
                    <div className={`w-12 h-12 ${scenario.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{scenario.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {scenario.metrics}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center leading-relaxed">
                      {scenario.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={() => selectedScenario && handleStartDemo(selectedScenario)}
              disabled={!selectedScenario}
              size="lg"
              className="btn-primary px-8"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Interactive Demo
            </Button>
            
            <Button
              variant="outline"
              onClick={onSkipToChat}
              size="lg"
              className="interactive-element"
            >
              Skip to Chat
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {welcomeContent.features.map((feature, index) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];
            
            return (
              <Card key={index} className="text-center interactive-element">
                <CardHeader>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Use Cases */}
        <div className="bg-card border rounded-xl p-8 shadow-soft">
          <h3 className="text-xl font-semibold font-display mb-6 text-center">
            Proven Results Across Industries
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {welcomeContent.useCases.map((useCase, index) => (
              <div key={index} className="text-center space-y-3">
                <h4 className="font-semibold">{useCase.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {useCase.description}
                </p>
                <Badge variant="secondary" className="text-xs font-medium">
                  {useCase.metrics}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            This is a demonstration environment with realistic mock data. 
            All conversations and documents are simulated for showcase purposes.
          </p>
        </div>
      </div>
    </div>
  );
}