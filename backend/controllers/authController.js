const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendTestEmail, sendWelcomeEmail } = require('../utils/mailer');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      class_id: user.class_id
    },
    process.env.JWT_SECRET,
    {
    expiresIn: '7d'
    }
  );
};

exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, class_id } = req.body;

    if (!first_name || !last_name || !email || !phone || !password || !class_id) {
      return res.status(400).json({ message: 'Missing required registration fields' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,
      password: hashedPassword,
      class_id,
      role: 'student'
    });

    const token = generateToken(user);

    try {
      console.log(`[AUTH] Sending welcome email to: ${user.email}`);
      await sendWelcomeEmail({
        to: user.email,
        fullName: `${user.first_name} ${user.last_name}`.trim()
      });
      console.log(`[AUTH] Welcome email sent successfully to: ${user.email}`);
    } catch (mailError) {
      console.error(`[AUTH] Welcome email failed for ${user.email}: ${mailError.message}`);
      console.error('[AUTH] Error details:', mailError);
    }

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        class_id: user.class_id,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        class_id: user.class_id,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch profile', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone, class_id } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      first_name: first_name ?? user.first_name,
      last_name: last_name ?? user.last_name,
      phone: phone ?? user.phone,
      class_id: class_id ?? user.class_id
    });

    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        class_id: user.class_id,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update profile', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to change password', error: error.message });
  }
};

exports.sendTestMail = async (req, res) => {
  try {
    console.log(`[TEST-MAIL] Request from user ID: ${req.user.id}`);
    
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'first_name', 'last_name', 'email']
    });

    if (!user) {
      console.log(`[TEST-MAIL] User not found: ${req.user.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`[TEST-MAIL] Sending test email to: ${user.email}`);
    
    const result = await sendTestEmail({
      to: user.email,
      fullName: `${user.first_name} ${user.last_name}`.trim()
    });

    console.log(`[TEST-MAIL] Result: ${JSON.stringify(result)}`);

    if (result?.skipped) {
      console.log('[TEST-MAIL] Email was skipped - SMTP not configured');
      return res.status(400).json({
        message: 'SMTP is not configured properly. Please check backend .env mail variables.'
      });
    }

    console.log(`[TEST-MAIL] Successfully sent to: ${user.email}`);
    return res.json({ message: `Test email sent to ${user.email}` });
  } catch (error) {
    console.error(`[TEST-MAIL] Error: ${error.message}`);
    console.error('[TEST-MAIL] Full error:', error);
    return res.status(500).json({ message: 'Test email failed', error: error.message });
  }
};
