import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  token: string;
  role: 'admin' | 'moderator' | 'user';
  inviterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, token, role, inviterName }: InvitationRequest = await req.json();

    if (!email || !token || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const inviteUrl = `${Deno.env.get("SUPABASE_URL")?.replace('/supabase', '')}/invite/${token}`;
    
    // Generate HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to Join Zyria</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
          }
          .tagline {
            opacity: 0.9;
            font-size: 16px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #2c3e50;
          }
          .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #555;
          }
          .role-badge {
            display: inline-block;
            padding: 6px 12px;
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 6px;
            font-weight: 600;
            color: #495057;
            margin: 10px 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
          }
          .cta-button:hover {
            transform: translateY(-2px);
          }
          .security-note {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin: 30px 0;
            font-size: 14px;
            color: #666;
          }
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #e9ecef;
          }
          .help-link {
            color: #667eea;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Zyria</div>
            <div class="tagline">Enterprise AI Platform</div>
          </div>
          
          <div class="content">
            <div class="greeting">You're Invited to Join Zyria!</div>
            
            <div class="message">
              ${inviterName ? `<strong>${inviterName}</strong> has` : 'You have been'} invited to join Zyria as a team member. 
              Click the button below to create your account and get started.
            </div>
            
            <div>
              <strong>Your Role:</strong> 
              <span class="role-badge">${role.charAt(0).toUpperCase() + role.slice(1)}</span>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" class="cta-button">Accept Invitation & Create Account</a>
            </div>
            
            <div class="security-note">
              <strong>Security Note:</strong> This invitation is valid for 7 days and can only be used once. 
              If you didn't expect this invitation or have concerns, please contact your administrator.
            </div>
          </div>
          
          <div class="footer">
            <p>Need help? Contact <a href="mailto:support@zyria.com" class="help-link">support@zyria.com</a></p>
            <p>This invitation was sent from Zyria's secure invitation system.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Zyria <noreply@zyria.com>",
      to: [email],
      subject: `You're invited to join Zyria as a ${role}`,
      html: htmlContent,
      text: `You've been invited to join Zyria as a ${role}. Visit ${inviteUrl} to accept your invitation and create your account. This invitation expires in 7 days.`
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send invitation" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);