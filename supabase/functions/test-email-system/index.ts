import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestResult {
  testName: string;
  status: "passed" | "failed";
  message: string;
  error?: string;
  responseData?: any;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testEmail } = await req.json();

    console.log("Starting email system test for:", testEmail);

    // Validate email format
    if (!validateEmail(testEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: TestResult[] = [];
    let passedCount = 0;
    let failedCount = 0;

    // Test 1: Send Invitation Email
    console.log("Testing invitation email...");
    try {
      // Generate a test token for the invitation
      const testToken = crypto.randomUUID();
      
      const inviteResponse = await supabase.functions.invoke("send-invitation", {
        body: {
          email: testEmail,
          token: testToken,
          role: "user",
          inviterName: "Email Test System",
        },
      });

      if (inviteResponse.error) {
        throw inviteResponse.error;
      }

      results.push({
        testName: "Invitation Email",
        status: "passed",
        message: "Invitation email sent successfully",
        responseData: inviteResponse.data,
      });
      passedCount++;
    } catch (error: any) {
      results.push({
        testName: "Invitation Email",
        status: "failed",
        message: "Failed to send invitation email",
        error: error.message || String(error),
      });
      failedCount++;
    }

    // Wait 2 seconds to avoid rate limiting
    await delay(2000);

    // Test 2: Password Reset Email
    console.log("Testing password reset email...");
    try {
      const resetResponse = await supabase.functions.invoke("send-password-reset", {
        body: {
          email: testEmail,
        },
      });

      if (resetResponse.error) {
        throw resetResponse.error;
      }

      results.push({
        testName: "Password Reset Email",
        status: "passed",
        message: "Password reset email sent successfully",
        responseData: resetResponse.data,
      });
      passedCount++;
    } catch (error: any) {
      results.push({
        testName: "Password Reset Email",
        status: "failed",
        message: "Failed to send password reset email",
        error: error.message || String(error),
      });
      failedCount++;
    }

    // Generate troubleshooting hints
    const troubleshootingHints: string[] = [];
    
    if (failedCount > 0) {
      troubleshootingHints.push("Some tests failed. Check the following:");
      
      const hasResendError = results.some(r => 
        r.error?.toLowerCase().includes("resend") || 
        r.error?.toLowerCase().includes("api key")
      );
      
      if (hasResendError) {
        troubleshootingHints.push("• Verify RESEND_API_KEY is configured correctly");
        troubleshootingHints.push("• Check if your Resend domain is verified at https://resend.com/domains");
      }

      const hasNetworkError = results.some(r => 
        r.error?.toLowerCase().includes("network") || 
        r.error?.toLowerCase().includes("timeout")
      );
      
      if (hasNetworkError) {
        troubleshootingHints.push("• Check your internet connection");
        troubleshootingHints.push("• Verify edge function URLs are correct");
      }

      troubleshootingHints.push("• Review edge function logs in Supabase dashboard");
      troubleshootingHints.push("• Ensure all environment variables are set");
    } else {
      troubleshootingHints.push("All tests passed! Email system is working correctly.");
    }

    const summary = {
      totalTests: results.length,
      passed: passedCount,
      failed: failedCount,
      successRate: `${Math.round((passedCount / results.length) * 100)}%`,
    };

    console.log("Test summary:", summary);

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        results,
        troubleshootingHints,
        testedEmail: testEmail,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in test-email-system function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
        details: String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
