const userService = require('../services/user.service');
const { successResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, role, isActive } = req.query;
      const options = { page: parseInt(page), limit: parseInt(limit) };
      const filters = {};
      
      if (role) filters.role = role;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const result = await userService.getAllUsers(filters, options);
      return successResponse(res, result, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return successResponse(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await userService.getUserById(req.user.id);
      return successResponse(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      logger.info(`User created: ${user.email} by admin: ${req.user.email}`);
      return successResponse(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateUser(req.user.id, req.body);
      logger.info(`Profile updated: ${req.user.email}`);
      return successResponse(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      logger.info(`User updated: ${req.params.id} by admin: ${req.user.email}`);
      return successResponse(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await userService.deleteUser(req.params.id);
      logger.info(`User deleted: ${req.params.id} by admin: ${req.user.email}`);
      return successResponse(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const { role } = req.body;
      const user = await userService.updateUserRole(req.params.id, role);
      logger.info(`User role updated: ${req.params.id} to ${role}`);
      return successResponse(res, user, 'User role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      const { isActive } = req.body;
      const user = await userService.updateUserStatus(req.params.id, isActive);
      logger.info(`User status updated: ${req.params.id} to ${isActive}`);
      return successResponse(res, user, 'User status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
