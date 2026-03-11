const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    try {
      console.log('📧 Initializing email service with config:', {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 3) + '***' : 'NOT_SET',
        password: process.env.EMAIL_APP_PASSWORD ? 'SET' : 'NOT_SET'
      });

      // Check required environment variables
      const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_APP_PASSWORD'];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        console.error('❌ Missing required email environment variables:', missingVars);
        this.transporter = null;
        this.initError = `Missing environment variables: ${missingVars.join(', ')}`;
        return;
      }

      // Clean and validate the app password
      const cleanPassword = process.env.EMAIL_APP_PASSWORD?.replace(/\s+/g, '');
      if (!cleanPassword || cleanPassword.length < 10) {
        console.error('❌ Invalid Gmail app password format');
        this.transporter = null;
        this.initError = 'Gmail app password appears to be invalid';
        return;
      }

      console.log('🔐 Gmail app password length:', cleanPassword.length);

      // Try Gmail service first, then fallback to SMTP
      this.transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: cleanPassword,
        },
        tls: {
          rejectUnauthorized: false
        },
        debug: true,
        logger: true
      });

      console.log('✅ Email transporter created successfully');
      this.initError = null;
    } catch (error) {
      console.error('❌ Email service initialization error:', error.message);
      this.transporter = null;
      this.initError = error.message;
    }
  }

  async verifyConnection() {
    console.log('🔍 Verifying email connection...');
    
    if (!this.transporter) {
      console.error('❌ No transporter available. Init error:', this.initError);
      return false;
    }

    try {
      console.log('📡 Testing SMTP connection...');
      await this.transporter.verify();
      console.log('✅ Email connection verified successfully');
      return true;
    } catch (error) {
      console.error('❌ Email connection verification failed:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      });
      
      // Try alternative SMTP configuration if Gmail service fails
      if (error.code === 'EAUTH' || error.responseCode === 535) {
        console.log('🔄 Trying alternative SMTP configuration...');
        try {
          this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_APP_PASSWORD?.replace(/\s+/g, ''),
            },
            tls: {
              rejectUnauthorized: false
            }
          });
          
          await this.transporter.verify();
          console.log('✅ Alternative SMTP connection successful');
          return true;
        } catch (altError) {
          console.error('❌ Alternative SMTP also failed:', altError.message);
          return false;
        }
      }
      
      return false;
    }
  }

  async sendOTP(email, otp, firstName) {
    console.log(`📤 Attempting to send OTP to ${email}`);
    
    if (!this.transporter) {
      throw new Error(`Email service not initialized: ${this.initError}`);
    }

    const mailOptions = {
      from: `"TVM Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for TVM Academy Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to TVM Academy!</h2>
          <p>Hello ${firstName},</p>
          <p>Your One-Time Password (OTP) for completing your registration is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 36px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this registration, please ignore this email.</p>
          <p>Best regards,<br>TVM Academy Team</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
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
        command: error.command,
        response: error.response
      });
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(email, firstName) {
    console.log(`📤 Attempting to send welcome email to ${email}`);
    
    if (!this.transporter) {
      throw new Error(`Email service not initialized: ${this.initError}`);
    }

    const mailOptions = {
      from: `"TVM Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to TVM Academy - Registration Complete!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Welcome to TVM Academy!</h2>
          <p>Dear ${firstName},</p>
          <p>Congratulations! Your registration has been successfully completed.</p>
          <p>You can now:</p>
          <ul>
            <li>Browse our available courses</li>
            <li>Enroll in courses that interest you</li>
            <li>Track your learning progress</li>
            <li>Access course materials and resources</li>
          </ul>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Happy learning!<br>TVM Academy Team</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully:', {
        messageId: info.messageId,
        to: email,
        response: info.response
      });
      return info;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      // Don't throw error for welcome email - it's not critical
      console.log('⚠️ Welcome email failed but continuing with registration');
      return null;
    }
  }

  async sendPasswordResetOTP(email, otp, firstName) {
    console.log(`📤 Attempting to send password reset OTP to ${email}`);
    
    if (!this.transporter) {
      throw new Error(`Email service not initialized: ${this.initError}`);
    }

    const mailOptions = {
      from: `"TVM Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP - TVM Academy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Password Reset Request</h2>
          <p>Hello ${firstName},</p>
          <p>You requested to reset your password for TVM Academy. Your OTP is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #dc3545; font-size: 36px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>TVM Academy Team</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset OTP sent successfully:', {
        messageId: info.messageId,
        to: email,
        response: info.response
      });
      return info;
    } catch (error) {
      console.error('❌ Failed to send password reset OTP:', {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      throw new Error(`Failed to send password reset OTP: ${error.message}`);
    }
  }

  async sendEnquiryConfirmation(email, firstName, enquiryDetails) {
    console.log(`📤 Attempting to send enquiry confirmation to ${email}`);
    
    if (!this.transporter) {
      throw new Error(`Email service not initialized: ${this.initError}`);
    }

    const mailOptions = {
      from: `"TVM Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Enquiry Received - TVM Academy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Thank You for Your Enquiry!</h2>
          <p>Dear ${firstName},</p>
          <p>We have received your enquiry and our team will get back to you shortly.</p>
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h3>Your Enquiry Details:</h3>
            <p><strong>Course:</strong> ${enquiryDetails.courseName || 'General Enquiry'}</p>
            <p><strong>Message:</strong> ${enquiryDetails.message}</p>
          </div>
          <p>Our team typically responds within 24-48 hours.</p>
          <p>Best regards,<br>TVM Academy Team</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Enquiry confirmation sent successfully:', {
        messageId: info.messageId,
        to: email,
        response: info.response
      });
      return info;
    } catch (error) {
      console.error('❌ Failed to send enquiry confirmation:', {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      // Don't throw error for confirmation email - it's not critical
      console.log('⚠️ Enquiry confirmation failed but continuing');
      return null;
    }
  }
}

module.exports = new EmailService();
