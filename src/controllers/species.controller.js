const speciesService = require('../services/species.service');
const { successResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

class SpeciesController {
  async getAllSpecies(req, res, next) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const options = { page: parseInt(page), limit: parseInt(limit) };
      const result = await speciesService.getAllSpecies(options);
      return successResponse(res, result, 'Species retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async searchSpecies(req, res, next) {
    try {
      const { q } = req.query;
      const result = await speciesService.searchSpecies(q);
      return successResponse(res, result, 'Search completed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getSpeciesById(req, res, next) {
    try {
      const species = await speciesService.getSpeciesById(req.params.id);
      return successResponse(res, species, 'Species retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createSpecies(req, res, next) {
    try {
      const species = await speciesService.createSpecies(req.body);
      logger.info(`Species created: ${species.commonName} by user: ${req.user.email}`);
      return successResponse(res, species, 'Species created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateSpecies(req, res, next) {
    try {
      const species = await speciesService.updateSpecies(req.params.id, req.body);
      logger.info(`Species updated: ${req.params.id} by user: ${req.user.email}`);
      return successResponse(res, species, 'Species updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteSpecies(req, res, next) {
    try {
      await speciesService.deleteSpecies(req.params.id);
      logger.info(`Species deleted: ${req.params.id} by user: ${req.user.email}`);
      return successResponse(res, null, 'Species deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SpeciesController();
