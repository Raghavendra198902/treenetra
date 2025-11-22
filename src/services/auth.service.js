const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const { ApiError } = require('../utils/apiError');
const config = require('../../config');
const emailService = require('./email.service');

class AuthService {
  async register(userData) {
    const { email, username } = userData;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new ApiError(409, 'User with this email or username already exists');
    }

    // Create user
    const user = new User(userData);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(user.email, emailVerificationToken);

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user._id);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }

  async login(email, password, ip, userAgent) {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new ApiError(423, 'Account is locked. Please try again later.');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      user.loginAttempts += 1;
      
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
      }
      
      await user.save();
      throw new ApiError(401, 'Invalid credentials');
    }

    // Reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user._id, ip, userAgent);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }

  async logout(userId, token) {
    // Invalidate refresh token
    await RefreshToken.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date() }
    );
  }

  async refreshAccessToken(refreshToken) {
    const tokenDoc = await RefreshToken.findOne({ 
      token: refreshToken,
      revokedAt: null 
    }).populate('userId');

    if (!tokenDoc || !tokenDoc.isActive) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = tokenDoc.userId;
    if (!user || !user.isActive) {
      throw new ApiError(401, 'User not found or inactive');
    }

    // Generate new access token
    const accessToken = this.generateAccessToken(user);

    return { accessToken };
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal that user doesn't exist
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await emailService.sendPasswordResetEmail(email, resetToken);
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
  }

  async verifyEmail(token) {
    const user = await User.findOne({ 
      emailVerificationToken: token 
    }).select('+emailVerificationToken');

    if (!user) {
      throw new ApiError(400, 'Invalid verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
  }

  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return this.sanitizeUser(user);
  }

  generateAccessToken(user) {
    return jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiration }
    );
  }

  async generateRefreshToken(userId, ip = null, userAgent = null) {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const refreshToken = new RefreshToken({
      userId,
      token,
      expiresAt,
      createdByIp: ip,
      deviceInfo: {
        userAgent: userAgent
      }
    });

    await refreshToken.save();
    return token;
  }

  sanitizeUser(user) {
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.emailVerificationToken;
    delete userObj.passwordResetToken;
    delete userObj.passwordResetExpires;
    return userObj;
  }
}

module.exports = new AuthService();
