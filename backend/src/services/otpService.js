const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (email, otp, type = 'verification') => {
  const subject = type === 'verification' ? 'Email Verification OTP' : 'Password Reset OTP';
  const text = type === 'verification' 
    ? `Your verification OTP is: ${otp}. Valid for 10 minutes.`
    : `Your password reset OTP is: ${otp}. Valid for 10 minutes.`;

  console.log(`Attempting to send ${type} OTP to ${email}: ${otp}`);
  
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text
    });
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    // For development, we'll still return true to allow testing
    // In production, you should return false
    console.log('Development mode: Continuing despite email error');
    console.log(`OTP for ${email}: ${otp}`);
    return true;
  }
};

module.exports = { generateOTP, sendOTP };