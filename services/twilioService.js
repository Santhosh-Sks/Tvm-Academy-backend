const twilio = require('twilio');

class TwilioService {
  constructor() {
    this.client = null;
    this.initError = null;
    this.verifyServiceSid = null;
    this.initialize();
  }

  initialize() {
    try {
      console.log('📱 Initializing Twilio SMS Service...');
      
      // Check required environment variables
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_VERIFY_SERVICE_SID) {
        this.initError = 'Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_VERIFY_SERVICE_SID environment variables';
        console.error('❌ Missing Twilio credentials');
        return;
      }

      console.log('Twilio Config:', {
        accountSid: process.env.TWILIO_ACCOUNT_SID ? process.env.TWILIO_ACCOUNT_SID.substring(0, 6) + '***' : 'not set',
        authToken: process.env.TWILIO_AUTH_TOKEN ? 'SET' : 'not set',
        verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID ? process.env.TWILIO_VERIFY_SERVICE_SID.substring(0, 6) + '***' : 'not set'
      });

      // Initialize Twilio client
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      this.verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

      console.log('✅ Twilio SMS service initialized successfully');
      this.initError = null;
    } catch (error) {
      console.error('❌ Twilio initialization error:', error.message);
      this.initError = error.message;
      this.client = null;
    }
  }

  async verifyConnection() {
    console.log('🔍 Verifying Twilio connection...');
    
    if (!this.client) {
      console.error('❌ No Twilio client available. Error:', this.initError);
      return false;
    }

    try {
      // Test connection by fetching account info
      const account = await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      console.log('✅ Twilio connection verified:', {
        accountSid: account.sid,
        status: account.status,
        friendlyName: account.friendlyName
      });
      return true;
    } catch (error) {
      console.error('❌ Twilio verification failed:', {
        message: error.message,
        code: error.code,
        status: error.status
      });
      return false;
    }
  }

  async sendOTP(phoneNumber, firstName) {
    console.log(`📱 Attempting to send SMS OTP to ${phoneNumber}`);
    
    if (!this.client) {
      const errorMsg = `Twilio service not available: ${this.initError}`;
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    // Ensure phone number is in international format
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    
    try {
      console.log('📱 Sending SMS OTP via Twilio Verify...');
      
      // Use Twilio Verify service to send OTP
      const verification = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verifications
        .create({
          to: formattedPhone,
          channel: 'sms'
        });
      
      console.log('✅ SMS OTP sent successfully:', {
        sid: verification.sid,
        to: verification.to,
        status: verification.status,
        channel: verification.channel
      });
      
      return {
        sid: verification.sid,
        status: verification.status,
        to: verification.to
      };
    } catch (error) {
      console.error('❌ Failed to send SMS OTP:', {
        error: error.message,
        code: error.code,
        status: error.status,
        moreInfo: error.moreInfo
      });
      
      // Provide more specific error messages
      let userFriendlyMessage = 'Failed to send SMS OTP';
      if (error.code === 20003) {
        userFriendlyMessage = 'Invalid phone number format';
      } else if (error.code === 20404) {
        userFriendlyMessage = 'Twilio service not found';
      } else if (error.code === 20008) {
        userFriendlyMessage = 'Phone number not verified in Twilio trial account';
      }
      
      throw new Error(`${userFriendlyMessage}: ${error.message}`);
    }
  }

  async verifyOTP(phoneNumber, otpCode) {
    console.log(`🔍 Verifying OTP for ${phoneNumber}`);
    
    if (!this.client) {
      const errorMsg = `Twilio service not available: ${this.initError}`;
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    
    try {
      console.log('🔍 Verifying OTP via Twilio...');
      
      const verificationCheck = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks
        .create({
          to: formattedPhone,
          code: otpCode
        });
      
      console.log('✅ OTP verification result:', {
        sid: verificationCheck.sid,
        status: verificationCheck.status,
        valid: verificationCheck.valid
      });
      
      return {
        valid: verificationCheck.status === 'approved',
        status: verificationCheck.status,
        sid: verificationCheck.sid
      };
    } catch (error) {
      console.error('❌ OTP verification failed:', {
        error: error.message,
        code: error.code,
        status: error.status
      });
      
      // Most verification failures are invalid codes
      if (error.code === 20404) {
        return { valid: false, status: 'invalid', error: 'Invalid or expired OTP' };
      }
      
      throw new Error(`OTP verification failed: ${error.message}`);
    }
  }

  formatPhoneNumber(phoneNumber) {
    // Remove any non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it starts with country code, use as is
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return `+${cleaned}`;
    }
    
    // If it's 10 digits, assume it's Indian number
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    // If it already has +, return as is
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    // Default: add +91 prefix for Indian numbers
    return `+91${cleaned}`;
  }

  // Keep email methods for backward compatibility but make them optional
  async sendWelcomeEmail(email, firstName) {
    console.log('📧 Welcome email skipped (using SMS for notifications)');
    return null;
  }

  async sendPasswordResetOTP(phoneNumber, firstName) {
    console.log(`📱 Sending password reset OTP via SMS to ${phoneNumber}`);
    return await this.sendOTP(phoneNumber, firstName);
  }
}

module.exports = new TwilioService();
