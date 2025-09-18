import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  MessageSquare, 
  Search, 
  BookOpen, 
  Settings,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  icon: React.ComponentType<any>;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Zyria',
    description: 'Your enterprise AI assistant platform. Let\'s take a quick tour to get you started with the key features.',
    icon: Sparkles,
  },
  {
    id: 'chat',
    title: 'Start Conversations',
    description: 'Click here to start new conversations with Zyria. Ask questions, get help with tasks, and access your knowledge base.',
    target: '[data-onboarding="new-chat"]',
    icon: MessageSquare,
    action: {
      label: 'Try starting a chat',
      onClick: () => console.log('Navigate to chat')
    }
  },
  {
    id: 'knowledge',
    title: 'Knowledge Base Integration',
    description: 'Toggle this to use your enterprise documents and knowledge base for more accurate, contextual responses.',
    target: '[data-onboarding="knowledge-toggle"]',
    icon: BookOpen,
  },
  {
    id: 'search',
    title: 'Search Everything',
    description: 'Use the search bar to quickly find past conversations, documents, or knowledge base content.',
    target: '[data-onboarding="search"]',
    icon: Search,
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Press Ctrl+K (or Cmd+K) for quick actions, Ctrl+/ for help, and Enter to send messages quickly.',
    icon: Zap,
  },
  {
    id: 'settings',
    title: 'Customize Your Experience',
    description: 'Visit Settings to personalize Zyria, configure data sources, and manage your preferences.',
    target: '[data-onboarding="settings"]',
    icon: Settings,
  }
];

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  // Highlight target element
  useEffect(() => {
    if (step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight class
        element.classList.add('onboarding-highlight');
        
        return () => {
          element.classList.remove('onboarding-highlight');
        };
      }
    }
    return () => setHighlightedElement(null);
  }, [step.target]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('zyria-onboarding-completed', 'true');
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem('zyria-onboarding-skipped', 'true');
    onSkip();
  };

  if (!isVisible) return null;

  const Icon = step.icon;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-fade-in" />
      
      {/* Tour Card */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4">
        <Card className="shadow-large animate-fade-in-scale border-2 border-primary/20">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="text-xs">
                Step {currentStep + 1} of {onboardingSteps.length}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon className="w-6 h-6 text-white" />
            </div>
            
            <CardTitle className="text-xl font-display">{step.title}</CardTitle>
            <Progress value={progress} className="w-full mt-3" />
          </CardHeader>
          
          <CardContent className="space-y-6">
            <CardDescription className="text-center leading-relaxed text-base">
              {step.description}
            </CardDescription>
            
            {step.action && (
              <div className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={step.action.onClick}
                  className="gap-2"
                >
                  <Target className="w-4 h-4" />
                  {step.action.label}
                </Button>
              </div>
            )}
            
            <div className="flex justify-between gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex-1 gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                className="flex-1 gap-2 btn-primary"
              >
                {isLastStep ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip tour
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('zyria-onboarding-completed');
    const hasSkippedOnboarding = localStorage.getItem('zyria-onboarding-skipped');
    
    if (!hasCompletedOnboarding && !hasSkippedOnboarding) {
      // Delay showing onboarding to let the app load
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const startOnboarding = () => {
    localStorage.removeItem('zyria-onboarding-completed');
    localStorage.removeItem('zyria-onboarding-skipped');
    setShowOnboarding(true);
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    startOnboarding,
    completeOnboarding,
    skipOnboarding
  };
}