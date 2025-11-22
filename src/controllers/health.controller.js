const healthService = require('../services/health.service');
const { successResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

class HealthController {
  async getAllHealthRecords(req, res, next) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const options = { page: parseInt(page), limit: parseInt(limit) };
      const filters = status ? { status } : {};
      const result = await healthService.getAllHealthRecords(filters, options);
      return successResponse(res, result, 'Health records retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getHealthRecordsByTree(req, res, next) {
    try {
      const records = await healthService.getHealthRecordsByTree(req.params.treeId);
      return successResponse(res, records, 'Health records retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getHealthRecordById(req, res, next) {
    try {
      const record = await healthService.getHealthRecordById(req.params.id);
      return successResponse(res, record, 'Health record retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createHealthRecord(req, res, next) {
    try {
      const recordData = { ...req.body, inspectedBy: req.user.id };
      const record = await healthService.createHealthRecord(recordData);
      logger.info(`Health record created for tree: ${req.body.treeId} by user: ${req.user.email}`);
      return successResponse(res, record, 'Health record created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateHealthRecord(req, res, next) {
    try {
      const record = await healthService.updateHealthRecord(req.params.id, req.body);
      logger.info(`Health record updated: ${req.params.id} by user: ${req.user.email}`);
      return successResponse(res, record, 'Health record updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteHealthRecord(req, res, next) {
    try {
      await healthService.deleteHealthRecord(req.params.id);
      logger.info(`Health record deleted: ${req.params.id} by user: ${req.user.email}`);
      return successResponse(res, null, 'Health record deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HealthController();
