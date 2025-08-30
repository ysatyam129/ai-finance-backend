const nodemailer = require('nodemailer');

// Primary configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  }
});

// Alternative configuration for testing
const alternativeTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test both configurations
const testEmailConfig = async () => {
  console.log('🔧 Testing email configurations...');
  
  try {
    await transporter.verify();
    console.log('✅ Primary email configuration working!');
    return transporter;
  } catch (error) {
    console.log('❌ Primary config failed:', error.message);
    
    try {
      await alternativeTransporter.verify();
      console.log('✅ Alternative email configuration working!');
      return alternativeTransporter;
    } catch (altError) {
      console.log('❌ Alternative config failed:', altError.message);
      console.log('📧 Please ensure you have:');
      console.log('   1. Enabled 2-Factor Authentication on your Gmail account');
      console.log('   2. Generated an App Password (not your regular password)');
      console.log('   3. Used the App Password in EMAIL_PASS environment variable');
      console.log('   4. Try format: EMAIL_PASS=abcdefghijklmnop (no spaces)');
      return null;
    }
  }
};

// Initialize working transporter
let workingTransporter = transporter;
testEmailConfig().then((result) => {
  if (result) {
    workingTransporter = result;
  }
});

const sendLowBalanceAlert = async (userEmail, userName, remainingBalance, percentage, htmlContent) => {
  const mailOptions = {
    from: `"AI Finance" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `⚠️ Critical: Low Balance Alert - ${percentage}% Remaining`,
    html: htmlContent || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1>⚠️ Low Balance Alert</h1>
          <p>AI Finance - Smart Financial Management</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hi ${userName},</h2>
          <div style="background: #fee; border-left: 4px solid #f56565; padding: 15px; margin: 20px 0;">
            <p><strong>Your account balance is running low!</strong></p>
            <p>You have only <strong>${percentage}%</strong> of your salary remaining this month.</p>
            <p>Remaining Balance: <strong>₹${remainingBalance.toLocaleString()}</strong></p>
          </div>
          <p>Please review your expenses and plan accordingly.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 12px 30px; text-decoration: none; 
                      border-radius: 25px; display: inline-block;">
              View Dashboard
            </a>
          </div>
          <p>Best regards,<br><strong>AI Finance Team</strong></p>
        </div>
      </div>
    `
  };

  try {
    const info = await workingTransporter.sendMail(mailOptions);
    console.log('✅ Enhanced low balance alert sent successfully to:', userEmail);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending low balance email:', error.message);
    return { success: false, error: error.message };
  }
};

// Send welcome email to new users
const sendWelcomeEmail = async (userEmail, userName) => {
  const mailOptions = {
    from: `"AI Finance" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: '🎉 Welcome to AI Finance - Your Smart Financial Journey Begins!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1>🎉 Welcome to AI Finance!</h1>
          <p>Smart Financial Management Made Easy</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hi ${userName},</h2>
          <p>Welcome to AI Finance! We're excited to help you take control of your financial future.</p>
          
          <h3>🚀 Get Started:</h3>
          <ul>
            <li>📊 View your personalized dashboard</li>
            <li>💰 Add your first expense</li>
            <li>📈 Track your spending patterns</li>
            <li>🔔 Set up budget alerts</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 12px 30px; text-decoration: none; 
                      border-radius: 25px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          
          <p>Happy budgeting!<br><strong>The AI Finance Team</strong></p>
        </div>
      </div>
    `
  };

  try {
    const info = await workingTransporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully to:', userEmail);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    // Don't throw error to prevent registration failure
    return { success: false, error: error.message };
  }
};

const sendTestEmail = async (toEmail) => {
  const mailOptions = {
    from: `"AI Finance Test" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🧪 Test Email from AI Finance',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>✅ Email Configuration Test</h2>
        <p>If you're seeing this email, your nodemailer configuration is working correctly!</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p><small>This is a test email from AI Finance application.</small></p>
      </div>
    `
  };

  try {
    const info = await workingTransporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendLowBalanceAlert, sendWelcomeEmail, sendTestEmail };