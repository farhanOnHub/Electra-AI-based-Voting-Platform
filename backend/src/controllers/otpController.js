import OTP from '../models/OTP.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import config from '../config/index.js';

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: config.smtpService,
      auth: {
        user: config.smtpEmail,
        pass: config.smtpPassword
      }
    });

    const mailOptions = {
      from: config.smtpEmail,
      to: email,
      subject: 'Electra - Your OTP Code',
      html: `
        <h2>Welcome to Electra</h2>
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>Do not share this code with anyone.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

export const sendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!['registration', 'password_reset', 'voting'].includes(purpose)) {
      return res.status(400).json({ message: 'Invalid OTP purpose' });
    }

    // Delete old OTP if exists
    await OTP.deleteOne({ email, purpose });

    const otp = generateOTP();
    
    const otpRecord = new OTP({
      email,
      otp,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    await otpRecord.save();

    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP' });
    }

    res.json({
      message: 'OTP sent to email',
      expiresIn: 600 // 10 minutes in seconds
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    const otpRecord = await OTP.findOne({
      email,
      purpose,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or invalid' });
    }

    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({ message: 'Too many attempts. Request new OTP' });
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    res.json({
      message: 'OTP verified successfully',
      verified: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    const otpRecord = await OTP.findOne({ email, purpose });

    if (!otpRecord) {
      return res.status(404).json({ message: 'OTP not found' });
    }

    const otp = generateOTP();
    otpRecord.otp = otp;
    otpRecord.attempts = 0;
    otpRecord.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await otpRecord.save();

    await sendOTPEmail(email, otp);

    res.json({
      message: 'OTP resent to email',
      expiresIn: 600
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
