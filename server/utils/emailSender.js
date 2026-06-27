export const sendCredentialsEmail = async (email, name, rollNumber) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL || 'yukesh785.in@gmail.com';
  const logoUrl = process.env.LOGO_URL || (process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/logo.png` : 'https://raw.githubusercontent.com/sdlcskills/assets/main/logo.png');

  if (!apiKey) {
    throw new Error('Brevo API key is not configured');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'SDLC Platform', email: senderEmail },
      to: [{ email: email, name: name }],
      subject: 'Your SDLC Platform Credentials',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your SDLC Platform Credentials</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
            @media only screen and (max-width: 600px) {
              .outer-wrapper { padding: 16px 8px !important; }
              .main-card { border-radius: 12px !important; }
              .header-cell { padding: 24px 20px !important; }
              .content-cell { padding: 28px 20px 24px 20px !important; }
              .card-box { padding: 18px 16px !important; margin-bottom: 20px !important; }
              .footer-cell { padding: 20px 16px !important; }
              .cta-button { width: 100% !important; box-sizing: border-box !important; display: block !important; padding: 14px 16px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
          <div class="outer-wrapper" style="background-color: #f1f5f9; padding: 48px 16px; min-height: 100%;">
            <table cellpadding="0" cellspacing="0" border="0" class="main-card" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0, 79, 144, 0.03); width: 100%; border-collapse: collapse;">
              <!-- Header Section -->
              <tr>
                <td class="header-cell" style="background-color: #ffffff; padding: 32px 40px; text-align: center; border-bottom: 1px solid #eef2f6;">
                  <img src="${logoUrl}" alt="SDLC Platform" style="height: 48px; max-width: 100%; display: inline-block; border: 0; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 800; color: #004f90;" />
                </td>
              </tr>

              <!-- Content Section -->
              <tr>
                <td class="content-cell" style="padding: 40px 40px 32px 40px; color: #334155;">
                  <h2 style="margin-top: 0; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 14px; line-height: 1.3;">Welcome, ${name}!</h2>
                  <p style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 28px 0;">Your student account has been successfully created. You can now log in to the portal and access your scheduled assessments.</p>
                  
                  <!-- Credentials Card -->
                  <div class="card-box" style="background-color: #f8fafc; border: 1px solid #eef2f6; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <h3 style="margin-top: 0; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #004f90; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 18px; font-weight: 700;">Account Details</h3>
                    
                    <div style="margin-bottom: 16px;">
                      <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;">Username / Email</div>
                      <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 14px; font-weight: 600; color: #0f172a; word-break: break-all; background-color: #ffffff; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0;">${email}</div>
                    </div>

                    <div>
                      <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;">Password</div>
                      <div>
                        <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 700; background-color: #ffffff; padding: 8px 14px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px; color: #004f90; display: inline-block; box-shadow: 0 1px 2px rgba(0,0,0,0.02); word-break: break-all;">${rollNumber}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Call to Action Button -->
                  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 32px 0 8px 0;">
                    <tr>
                      <td align="center">
                        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" target="_blank" class="cta-button" style="display: inline-block; background-color: #F7931A; color: #ffffff; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; font-size: 15px; padding: 14px 32px; text-decoration: none; border-radius: 10px; text-align: center; border: 1px solid #F7931A; box-shadow: 0 4px 14px rgba(247, 147, 26, 0.2); transition: all 0.2s ease;">Launch Test Portal</a>
                      </td>
                    </tr>
                  </table>

                  <!-- Regards Section -->
                  <div style="margin-top: 32px; border-top: 1px solid #eef2f6; padding-top: 24px; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #475569; line-height: 22px;">
                    <p style="margin: 0 0 4px 0;">Regards,</p>
                    <p style="margin: 0; font-weight: 700; color: #004f90; font-size: 15px;">SDLC Platform</p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer Section -->
              <tr style="background-color: #f8fafc; border-top: 1px solid #eef2f6;">
                <td class="footer-cell" style="padding: 24px 40px; text-align: center; border-radius: 0 0 16px 16px;">
                  <p style="margin: 0 0 6px 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #64748b; line-height: 18px; font-weight: 550;">This is an automated system email. Please do not reply directly to this message.</p>
                  <p style="margin: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #94a3b8; font-weight: 600;">&copy; 2026 SDLC Platform. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </div>
        </body>
        </html>
      `
    })
  });

  const responseData = await response.json();
  if (!response.ok) {
    console.error('Brevo API response error:', responseData);
    throw new Error(responseData.message || 'Failed to send transactional email');
  }

  return responseData;
};

export const sendOTPEmail = async (email, name, otp) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL || 'yukesh785.in@gmail.com';
  const logoUrl = process.env.LOGO_URL || (process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/logo.png` : 'https://raw.githubusercontent.com/sdlcskills/assets/main/logo.png');

  if (!apiKey) {
    throw new Error('Brevo API key is not configured');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'SDLC Platform', email: senderEmail },
      to: [{ email: email, name: name }],
      subject: 'SDLC Platform - Password Reset Verification Code',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>SDLC Platform - Password Reset Request</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
            @media only screen and (max-width: 600px) {
              .outer-wrapper { padding: 16px 8px !important; }
              .main-card { border-radius: 12px !important; }
              .header-cell { padding: 24px 20px !important; }
              .content-cell { padding: 28px 20px 24px 20px !important; }
              .otp-box { padding: 20px 16px !important; margin: 20px 0 !important; }
              .otp-code { font-size: 26px !important; letter-spacing: 3px !important; padding: 8px 18px !important; }
              .footer-cell { padding: 20px 16px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
          <div class="outer-wrapper" style="background-color: #f1f5f9; padding: 48px 16px; min-height: 100%;">
            <table cellpadding="0" cellspacing="0" border="0" class="main-card" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0, 79, 144, 0.03); width: 100%; border-collapse: collapse;">
              <!-- Header Section -->
              <tr>
                <td class="header-cell" style="background-color: #ffffff; padding: 32px 40px; text-align: center; border-bottom: 1px solid #eef2f6;">
                  <img src="${logoUrl}" alt="SDLC Platform" style="height: 48px; max-width: 100%; display: inline-block; border: 0; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 800; color: #004f90;" />
                </td>
              </tr>

              <!-- Content Section -->
              <tr>
                <td class="content-cell" style="padding: 40px 40px 32px 40px; color: #334155;">
                  <h2 style="margin-top: 0; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 14px; line-height: 1.3;">Password Reset Request</h2>
                  <p style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 16px 0;">Hello <strong>${name}</strong>,</p>
                  <p style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 28px 0;">We received a request to reset your administrator password. Use the verification code below to confirm your identity. This code is valid for <strong>5 minutes</strong>.</p>
                  
                  <!-- OTP Card -->
                  <div class="otp-box" style="background-color: #f8fafc; border: 1px solid #eef2f6; border-radius: 12px; padding: 28px; text-align: center; margin: 28px 0;">
                    <p style="margin: 0 0 12px 0; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b;">Verification Code</p>
                    <span class="otp-code" style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #004f90; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; display: inline-block; padding: 10px 28px; background-color: #ffffff; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">${otp}</span>
                  </div>

                  <div style="border-top: 1px solid #eef2f6; padding-top: 20px; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #64748b; line-height: 20px;">
                    <p style="margin: 0;">If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized access.</p>
                  </div>

                  <!-- Regards Section -->
                  <div style="margin-top: 32px; border-top: 1px solid #eef2f6; padding-top: 24px; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #475569; line-height: 22px;">
                    <p style="margin: 0 0 4px 0;">Regards,</p>
                    <p style="margin: 0; font-weight: 700; color: #004f90; font-size: 15px;">SDLC Platform</p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer Section -->
              <tr style="background-color: #f8fafc; border-top: 1px solid #eef2f6;">
                <td class="footer-cell" style="padding: 24px 40px; text-align: center; border-radius: 0 0 16px 16px;">
                  <p style="margin: 0 0 6px 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #64748b; line-height: 18px; font-weight: 550;">This is an automated security email. Please do not reply directly to this message.</p>
                  <p style="margin: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #94a3b8; font-weight: 600;">&copy; 2026 SDLC Platform. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </div>
        </body>
        </html>
      `
    })
  });

  const responseData = await response.json();
  if (!response.ok) {
    console.error('Brevo SMTP error:', responseData);
    throw new Error(responseData.message || 'Failed to send OTP email');
  }

  return responseData;
};
