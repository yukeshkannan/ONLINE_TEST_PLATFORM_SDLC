export const handleContactSubmit = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL || 'yukesh785.in@gmail.com';
    const receiverEmail = process.env.RECEIVER_EMAIL || 'yukesh785.in@gmail.com';
    const logoUrl = process.env.LOGO_URL || `${process.env.CLIENT_URL || 'http://localhost:5173'}/logo.png`;

    if (!apiKey) {
      console.error('Brevo API key is not configured');
      return res.status(500).json({ success: false, message: 'Mail server configuration is missing' });
    }

    // Call Brevo Transactions API v3 using global fetch (Node 18+)
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'SDLC Platform', email: senderEmail },
        to: [{ email: receiverEmail, name: 'Admin' }],
        replyTo: { email: email, name: name },
        subject: `[SDLC Platform] New Contact Form Message from ${name}`,
        htmlContent: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 48px 20px; margin: 0; min-height: 100%; width: 100%; box-sizing: border-box;">
            <table cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0, 79, 144, 0.03); width: 100%; border-collapse: collapse;">
              <!-- Header Section -->
              <tr>
                <td style="background-color: #ffffff; padding: 32px 40px; text-align: center; border-bottom: 1px solid #eef2f6;">
                  <img src="${logoUrl}" alt="SDLC Platform" style="height: 50px; display: inline-block; border: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 800; color: #004f90;" />
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 40px 32px 40px; color: #334155;">
                  <h2 style="margin-top: 0; font-size: 20px; color: #0f172a; font-weight: 600; margin-bottom: 16px;">Inquiry Received</h2>
                  <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 24px 0;">You have received a new contact submission from the SDLC Platform contact page.</p>
                  
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <h3 style="margin-top: 0; font-size: 12px; color: #004f90; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 18px; font-weight: 700; border-bottom: 1px solid #eef2f6; padding-bottom: 8px;">Submission Details</h3>
                    
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; font-size: 14px; line-height: 22px;">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; width: 100px; vertical-align: top;"><strong>Name:</strong></td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 600; vertical-align: top;">${name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; vertical-align: top;"><strong>Email:</strong></td>
                        <td style="padding: 6px 0; vertical-align: top;"><a href="mailto:${email}" style="color: #004f90; text-decoration: none; font-weight: 600;">${email}</a></td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; vertical-align: top;"><strong>Message:</strong></td>
                        <td style="padding: 6px 0; color: #334155; vertical-align: top; white-space: pre-line; line-height: 22px;">${message}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- Regards Section -->
                  <div style="margin-top: 32px; border-top: 1px solid #eef2f6; padding-top: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #475569; line-height: 22px;">
                    <p style="margin: 0 0 4px 0;">Regards,</p>
                    <p style="margin: 0; font-weight: 700; color: #004f90; font-size: 15px;">SDLC Platform</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #eef2f6;">
                  <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; line-height: 18px;">This is a form submission notification from the SDLC Platform.</p>
                  <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 600;">&copy; 2026 SDLC Platform. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </div>
        `
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Brevo API error response:', responseData);
      
      // Map 401 (Unauthorized) or other external errors to 500 Internal Server Error
      // to prevent client-side authentication middleware from misinterpreting it.
      return res.status(500).json({
        success: false,
        message: 'Mail server configuration issue. Please contact support.',
        error: process.env.NODE_ENV === 'development' ? responseData : undefined
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully!',
      data: responseData
    });
  } catch (error) {
    console.error('Error in handleContactSubmit:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message due to an internal error',
      error: error.message
    });
  }
};
