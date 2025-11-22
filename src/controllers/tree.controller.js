const treeService = require('../services/tree.service');
const { successResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

class TreeController {
  async getAllTrees(req, res, next) {
    try {
      const { page = 1, limit = 20, status, speciesId } = req.query;
      const options = { page: parseInt(page), limit: parseInt(limit) };
      const filters = {};
      
      if (status) filters.status = status;
      if (speciesId) filters.speciesId = speciesId;

      const result = await treeService.getAllTrees(filters, options);
      return successResponse(res, result, 'Trees retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async searchTrees(req, res, next) {
    try {
      const result = await treeService.searchTrees(req.query);
      return successResponse(res, result, 'Search completed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getNearbyTrees(req, res, next) {
    try {
      const { latitude, longitude, radius = 1000 } = req.query;
      const result = await treeService.getNearbyTrees(
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(radius)
      );
      return successResponse(res, result, 'Nearby trees retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTreeById(req, res, next) {
    try {
      const tree = await treeService.getTreeById(req.params.id);
      return successResponse(res, tree, 'Tree retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createTree(req, res, next) {
    try {
      const treeData = { ...req.body, createdBy: req.user.id };
      const tree = await treeService.createTree(treeData);
      logger.info(`Tree created: ${tree.id} by user: ${req.user.email}`);
      return successResponse(res, tree, 'Tree created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateTree(req, res, next) {
    try {
      const tree = await treeService.updateTree(req.params.id, req.body, req.user.id);
      logger.info(`Tree updated: ${req.params.id} by user: ${req.user.email}`);
      return successResponse(res, tree, 'Tree updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteTree(req, res, next) {
    try {
      await treeService.deleteTree(req.params.id);
      logger.info(`Tree deleted: ${req.params.id} by user: ${req.user.email}`);
      return successResponse(res, null, 'Tree deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async uploadImages(req, res, next) {
    try {
      const images = await treeService.uploadImages(req.params.id, req.files, req.user.id);
      logger.info(`Images uploaded for tree: ${req.params.id}`);
      return successResponse(res, images, 'Images uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req, res, next) {
    try {
      await treeService.deleteImage(req.params.id, req.params.imageId);
      logger.info(`Image deleted: ${req.params.imageId} from tree: ${req.params.id}`);
      return successResponse(res, null, 'Image deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async addTags(req, res, next) {
    try {
      const { tags } = req.body;
      const tree = await treeService.addTags(req.params.id, tags);
      return successResponse(res, tree, 'Tags added successfully');
    } catch (error) {
      next(error);
    }
  }

  async removeTag(req, res, next) {
    try {
      const tree = await treeService.removeTag(req.params.id, req.params.tag);
      return successResponse(res, tree, 'Tag removed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const stats = await treeService.getStatistics();
      return successResponse(res, stats, 'Statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TreeController();
