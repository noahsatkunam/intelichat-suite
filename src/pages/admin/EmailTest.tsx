import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, CheckCircle2, XCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface TestResult {
  testName: string;
  status: "passed" | "failed";
  message: string;
  error?: string;
  responseData?: any;
}

interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  successRate: string;
}

interface EmailTestResponse {
  success: boolean;
  summary: TestSummary;
  results: TestResult[];
  troubleshootingHints: string[];
  testedEmail: string;
  timestamp: string;
}

const EmailTest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [singleTestEmail, setSingleTestEmail] = useState("");
  const [fullTestEmail, setFullTestEmail] = useState("");
  const [loadingSingle, setLoadingSingle] = useState(false);
  const [loadingFull, setLoadingFull] = useState(false);
  const [testResults, setTestResults] = useState<EmailTestResponse | null>(null);

  // Check if user is global admin
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user) {
        setIsAuthorized(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsAuthorized(profile?.role === "global_admin");
    };

    checkAuthorization();
  }, [user]);

  if (isAuthorized === false) {
    return <Navigate to="/" replace />;
  }

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSingleTest = async () => {
    if (!validateEmail(singleTestEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoadingSingle(true);
    try {
      // Test by sending a single invitation email
      const { error } = await supabase.functions.invoke("send-invitation", {
        body: {
          email: singleTestEmail,
          role: "user",
          tenantId: "test",
          invitedBy: user?.id,
        },
      });

      if (error) throw error;

      toast({
        title: "Test Email Sent",
        description: `A test invitation email has been sent to ${singleTestEmail}`,
      });
    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setLoadingSingle(false);
    }
  };

  const handleFullTest = async () => {
    if (!validateEmail(fullTestEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoadingFull(true);
    setTestResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("test-email-system", {
        body: { testEmail: fullTestEmail },
      });

      if (error) throw error;

      setTestResults(data);

      toast({
        title: "Test Suite Complete",
        description: `${data.summary.passed} of ${data.summary.totalTests} tests passed`,
        variant: data.summary.failed > 0 ? "destructive" : "default",
      });
    } catch (error: any) {
      toast({
        title: "Test Suite Failed",
        description: error.message || "Failed to run email tests",
        variant: "destructive",
      });
    } finally {
      setLoadingFull(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email System Testing Dashboard</h1>
        <p className="text-muted-foreground">
          Test and validate email functionality for your application
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Single Email Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Single Email Test
            </CardTitle>
            <CardDescription>
              Send a single test invitation email to verify basic functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="email"
              placeholder="test@example.com"
              value={singleTestEmail}
              onChange={(e) => setSingleTestEmail(e.target.value)}
              className={
                singleTestEmail && !validateEmail(singleTestEmail)
                  ? "border-destructive"
                  : ""
              }
            />
            {singleTestEmail && !validateEmail(singleTestEmail) && (
              <p className="text-sm text-destructive">Invalid email format</p>
            )}
            <Button
              onClick={handleSingleTest}
              disabled={!validateEmail(singleTestEmail) || loadingSingle}
              className="w-full"
            >
              {loadingSingle ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Test Email"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Full Test Suite */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Full Test Suite
            </CardTitle>
            <CardDescription>
              Run comprehensive tests on all email functions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="email"
              placeholder="test@example.com"
              value={fullTestEmail}
              onChange={(e) => setFullTestEmail(e.target.value)}
              className={
                fullTestEmail && !validateEmail(fullTestEmail)
                  ? "border-destructive"
                  : ""
              }
            />
            {fullTestEmail && !validateEmail(fullTestEmail) && (
              <p className="text-sm text-destructive">Invalid email format</p>
            )}
            <Button
              onClick={handleFullTest}
              disabled={!validateEmail(fullTestEmail) || loadingFull}
              className="w-full"
              variant="default"
            >
              {loadingFull ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                "Run All Tests"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      {testResults && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Tested on {testResults.testedEmail} at{" "}
              {new Date(testResults.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{testResults.summary.totalTests}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {testResults.summary.passed}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {testResults.summary.failed}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {testResults.summary.successRate}
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>

            {/* Individual Test Results */}
            <div className="space-y-3">
              <h3 className="font-semibold">Individual Tests</h3>
              {testResults.results.map((result, index) => (
                <Alert
                  key={index}
                  variant={result.status === "passed" ? "default" : "destructive"}
                >
                  <div className="flex items-start gap-3">
                    {result.status === "passed" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold">{result.testName}</h4>
                      <AlertDescription>{result.message}</AlertDescription>
                      {result.error && (
                        <p className="mt-2 text-sm font-mono bg-muted p-2 rounded">
                          {result.error}
                        </p>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>

            {/* Troubleshooting Hints */}
            {testResults.troubleshootingHints.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {testResults.troubleshootingHints.map((hint, index) => (
                      <p key={index} className="text-sm">
                        {hint}
                      </p>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Raw Data */}
            <details className="space-y-2">
              <summary className="cursor-pointer font-semibold">
                View Raw Test Data
              </summary>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup & Troubleshooting</CardTitle>
          <CardDescription>Configuration and common issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Email Configuration</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Email provider: Resend
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Edge functions: send-invitation, send-password-reset
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Common Issues</h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Verify RESEND_API_KEY is set in edge function secrets</li>
              <li>Ensure your domain is verified in Resend dashboard</li>
              <li>Check edge function logs for detailed error messages</li>
              <li>Confirm sender email is authorized in Resend</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://resend.com/domains"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Resend Dashboard
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://supabase.com/dashboard/project/onvnvlnxmilotkxkfddu/functions/test-email-system/logs`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Function Logs
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTest;
