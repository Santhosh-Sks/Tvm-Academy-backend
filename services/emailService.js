const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  }

  async sendOTP(email, otp, userName = 'User') {
    const mailOptions = {
      from: `"TVM Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Login OTP - TVM Academy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">TVM Academy</h1>
            <p style="color: #e8e8e8; margin: 5px 0 0 0;">Professional Learning Platform</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              You have requested to login to your TVM Academy account. Please use the following One-Time Password (OTP) to complete your authentication:
            </p>
            
            <div style="background: #f8f9ff; border: 2px dashed #667eea; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;">Your OTP Code:</p>
              <h1 style="color: #667eea; margin: 10px 0; font-size: 36px; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⚠️ Security Notice:</strong><br>
                • This OTP is valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes only<br>
                • Do not share this code with anyone<br>
                • If you didn't request this, please ignore this email
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-top: 25px;">
              If you have any questions or need assistance, please contact our support team.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Best regards,<br>
                <strong>TVM Academy Team</strong>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #999; font-size: 11px; margin: 0;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent successfully to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendRegistrationOTP(email, otp, userName = 'User') {
    const mailOptions = {
      from: `"TVM Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Complete Registration | TVM Academy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to TVM Academy!</h1>
            <p style="color: #e8e8e8; margin: 5px 0 0 0;">Complete Your Registration</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}! 👋</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Thank you for joining TVM Academy! To complete your registration and verify your email address, please use the verification code below:
            </p>
            
            <div style="background: #e8f5e8; border: 2px dashed #28a745; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;">Email Verification Code:</p>
              <h1 style="color: #28a745; margin: 10px 0; font-size: 36px; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
            </div>
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #1976d2; font-size: 14px;">
                <strong>📝 What's Next:</strong><br>
                • Enter this verification code to complete registration<br>
                • This code expires in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes<br>
                • After verification, you can start exploring our courses<br>
                • Access professional learning resources and certifications
              </p>
            </div>
            
            <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #f57f17; font-size: 14px;">
                <strong>🔒 Security Notice:</strong><br>
                • Keep this code confidential<br>
                • Do not share with anyone<br>
                • If you didn't sign up for TVM Academy, please ignore this email
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
              <h3 style="color: #333; margin-bottom: 15px;">🚀 Ready to Start Learning?</h3>
              <p style="color: #666; margin: 0; font-size: 14px;">
                After verification, you'll have access to our comprehensive course catalog,<br>
                expert instructors, and hands-on learning experiences.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Welcome aboard! 🎓<br>
                <strong>TVM Academy Team</strong>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #999; font-size: 11px; margin: 0;">
              This is an automated email for account verification. Please do not reply.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Registration verification email sent successfully to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send registration verification email:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Email service configuration error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
