const analyticsService = require('../services/analytics.service');
const { successResponse } = require('../utils/apiResponse');

class AnalyticsController {
  async getOverview(req, res, next) {
    try {
      const overview = await analyticsService.getOverview();
      return successResponse(res, overview, 'Overview retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTreeGrowth(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const growth = await analyticsService.getTreeGrowth(startDate, endDate);
      return successResponse(res, growth, 'Tree growth data retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTreeDistribution(req, res, next) {
    try {
      const distribution = await analyticsService.getTreeDistribution();
      return successResponse(res, distribution, 'Tree distribution retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getHealthTrends(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const trends = await analyticsService.getHealthTrends(startDate, endDate);
      return successResponse(res, trends, 'Health trends retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPopularSpecies(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const species = await analyticsService.getPopularSpecies(parseInt(limit));
      return successResponse(res, species, 'Popular species retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUserActivity(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const activity = await analyticsService.getUserActivity(startDate, endDate);
      return successResponse(res, activity, 'User activity retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyReport(req, res, next) {
    try {
      const { year, month } = req.query;
      const report = await analyticsService.getMonthlyReport(year, month);
      return successResponse(res, report, 'Monthly report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async exportReport(req, res, next) {
    try {
      const { format = 'csv', startDate, endDate } = req.query;
      const report = await analyticsService.exportReport(format, startDate, endDate);
      res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=report.${format}`);
      return res.send(report);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
