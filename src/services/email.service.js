const nodemailer = require('nodemailer');
const config = require('../../config');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: config.email.from,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${config.app.url}/api/v1/auth/verify-email/${token}`;
    const subject = 'Verify Your Email - TreeNetra';
    const html = `
      <h1>Welcome to TreeNetra!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>If you didn't create an account, please ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${config.app.url}/reset-password/${token}`;
    const subject = 'Password Reset Request - TreeNetra';
    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendWelcomeEmail(email, name) {
    const subject = 'Welcome to TreeNetra!';
    const html = `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining TreeNetra.</p>
      <p>You can now start managing and monitoring trees in your area.</p>
      <p>If you have any questions, feel free to contact our support team.</p>
    `;

    return this.sendEmail(email, subject, html);
  }
}

module.exports = new EmailService();
