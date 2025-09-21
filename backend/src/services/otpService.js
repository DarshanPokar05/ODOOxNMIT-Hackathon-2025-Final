const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
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
    console.log('Testing SMTP connection...');
    await transporter.verify();
    console.log('SMTP verified successfully');
    
    const info = await transporter.sendMail({
      from: `"Manufacturing ERP" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text,
      html: `<div style="font-family: Arial; padding: 20px;"><h2>Manufacturing ERP</h2><p>Your OTP: <strong style="font-size: 24px; color: #0d9488;">${otp}</strong></p><p>Valid for 10 minutes.</p></div>`
    });
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email error:', error.message);
    console.log(`\n=== OTP FALLBACK ===`);
    console.log(`Email: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log(`====================\n`);
    return true;
  }
};

module.exports = { generateOTP, sendOTP };