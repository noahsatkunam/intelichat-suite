import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  redirectTo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, redirectTo }: PasswordResetRequest = await req.json();
    
    console.log("Password reset requested for:", email);

    const emailResponse = await resend.emails.send({
      from: "Zyria <noreply@zyria.ai>",
      to: [email],
      subject: "Reset Your Zyria Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; font-size: 24px; margin: 0;">Zyria</h1>
          </div>
          
          <h2 style="color: #333; font-size: 20px; margin-bottom: 20px;">Reset Your Password</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
            We received a request to reset the password for your Zyria account associated with this email address.
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
            If you made this request, please follow the instructions sent to you separately via the Supabase authentication system.
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              <strong>Security Notice:</strong> This password reset request was initiated from your Zyria account. 
              If you believe this was done in error or without your authorization, please contact our support team immediately.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            The Zyria Team
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This email was sent from Zyria Enterprise AI Platform. 
            If you have questions, contact our support team.
          </p>
        </div>
      `,
    });

    console.log("Password reset notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Password reset notification sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send password reset notification",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);