const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initError = null;
    this.initialize();
  }

  initialize() {
    try {
      console.log('📧 Initializing Email Service...');
      console.log('Email Config:', {
        host: process.env.EMAIL_HOST || 'not set',
        port: process.env.EMAIL_PORT || 'not set',
        user: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 3) + '***' : 'not set',
        password: process.env.EMAIL_APP_PASSWORD ? 'SET' : 'not set'
      });

      // Check required environment variables
      if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        this.initError = 'Missing EMAIL_USER or EMAIL_APP_PASSWORD environment variables';
        console.error('❌ Missing email credentials');
        return;
      }

      // Clean the app password (remove any spaces)
      const cleanPassword = process.env.EMAIL_APP_PASSWORD.replace(/\s+/g, '');
      console.log('🔑 Gmail app password length:', cleanPassword.length);

      // Create Gmail transporter
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: cleanPassword,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log('✅ Email service initialized successfully');
      this.initError = null;
    } catch (error) {
      console.error('❌ Email initialization error:', error.message);
      this.initError = error.message;
      this.transporter = null;
    }
  }

  async verifyConnection() {
    console.log('🔍 Verifying email connection...');
    
    if (!this.transporter) {
      console.error('❌ No transporter available. Error:', this.initError);
      return false;
    }

    try {
      // Test connection with timeout
      const verifyPromise = this.transporter.verify();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000)
      );

      await Promise.race([verifyPromise, timeoutPromise]);
      console.log('✅ Email connection verified successfully');
      return true;
    } catch (error) {
      console.error('❌ Email verification failed:', {
        message: error.message,
        code: error.code,
        response: error.response
      });
      return false;
    }
  }

  async sendOTP(email, otp, firstName) {
    console.log(`📤 Attempting to send OTP to ${email}`);
    
    if (!this.transporter) {
      const errorMsg = `Email service not available: ${this.initError}`;
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    const mailOptions = {
      from: `"TVM Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for TVM Academy Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #007bff; margin: 0;">🎓 TVM Academy</h1>
          </div>
          
          <h2 style="color: #333; text-align: center;">Welcome ${firstName}!</h2>
          
          <p style="font-size: 16px; color: #666; line-height: 1.5;">
            Thank you for registering with TVM Academy. To complete your registration, 
            please use the following One-Time Password (OTP):
          </p>
          
          <div style="background: linear-gradient(135deg, #007bff, #0056b3); padding: 30px; text-align: center; border-radius: 10px; margin: 30px 0;">
            <h1 style="color: white; font-size: 48px; margin: 0; letter-spacing: 5px; font-family: 'Courier New', monospace;">${otp}</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #007bff;">
            <p style="margin: 0; color: #666;">
              <strong>⏰ This OTP will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes</strong>
            </p>
            <p style="margin: 10px 0 0 0; color: #666;">
              If you didn't request this registration, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px;">
              Best regards,<br>
              <strong>TVM Academy Team</strong>
            </p>
          </div>
        </div>
      `,
    };

    try {
      // Send email with timeout
      const sendPromise = this.transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout after 30 seconds')), 30000)
      );

      const info = await Promise.race([sendPromise, timeoutPromise]);
      
      console.log('✅ OTP email sent successfully:', {
        messageId: info.messageId,
        to: email,
        response: info.response
      });
      
      return info;
    } catch (error) {
      console.error('❌ Failed to send OTP email:', {
        error: error.message,
        code: error.code,
        response: error.response
      });
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(email, firstName) {
    console.log(`📤 Sending welcome email to ${email}`);
    
    if (!this.transporter) {
      console.log('⚠️ Email service not available, skipping welcome email');
      return null;
    }

    const mailOptions = {
      from: `"TVM Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to TVM Academy - Registration Complete!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #007bff; margin: 0;">🎓 TVM Academy</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="margin: 0; font-size: 28px;">Welcome ${firstName}!</h2>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Your registration is complete!</p>
          </div>
          
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Congratulations! Your TVM Academy account has been successfully created. 
            You can now access all our educational resources and start your learning journey.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #007bff; margin-top: 0;">What you can do now:</h3>
            <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
              <li>📚 Browse our comprehensive course catalog</li>
              <li>📝 Enroll in courses that match your interests</li>
              <li>📊 Track your learning progress on your dashboard</li>
              <li>🎯 Set learning goals and achievements</li>
              <li>🤝 Connect with instructors and fellow students</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://tvm-academy-frontend.vercel.app/login" 
               style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              🚀 Start Learning Now
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px;">
              If you have any questions, feel free to contact our support team.<br>
              <strong>Happy Learning!</strong><br>
              TVM Academy Team
            </p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully');
      return info;
    } catch (error) {
      console.error('❌ Welcome email failed:', error.message);
      return null; // Don't throw error for welcome email - it's not critical
    }
  }

  async sendPasswordResetOTP(email, otp, firstName) {
    console.log(`📤 Sending password reset OTP to ${email}`);
    
    if (!this.transporter) {
      const errorMsg = `Email service not available: ${this.initError}`;
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    const mailOptions = {
      from: `"TVM Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Password Reset OTP - TVM Academy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc3545; margin: 0;">🔐 TVM Academy</h1>
          </div>
          
          <h2 style="color: #dc3545; text-align: center;">Password Reset Request</h2>
          
          <p style="font-size: 16px; color: #666; line-height: 1.5;">
            Hello ${firstName},<br><br>
            You requested to reset your password for TVM Academy. 
            Use the following OTP to complete your password reset:
          </p>
          
          <div style="background: linear-gradient(135deg, #dc3545, #c82333); padding: 30px; text-align: center; border-radius: 10px; margin: 30px 0;">
            <h1 style="color: white; font-size: 48px; margin: 0; letter-spacing: 5px; font-family: 'Courier New', monospace;">${otp}</h1>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Security Notice:</strong><br>
              • This OTP will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes<br>
              • If you didn't request this reset, please ignore this email<br>
              • Never share your OTP with anyone
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px;">
              Best regards,<br>
              <strong>TVM Academy Security Team</strong>
            </p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset OTP sent successfully');
      return info;
    } catch (error) {
      console.error('❌ Failed to send password reset OTP:', error.message);
      throw new Error(`Failed to send password reset OTP: ${error.message}`);
    }
  }
}

module.exports = new EmailService();
