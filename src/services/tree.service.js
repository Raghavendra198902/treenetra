const Tree = require('../models/tree.model');
const { ApiError } = require('../utils/apiError');

class TreeService {
  async getAllTrees(filters = {}, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.speciesId) query.speciesId = filters.speciesId;

    const [trees, total] = await Promise.all([
      Tree.find(query)
        .populate('speciesId', 'commonName scientificName')
        .populate('createdBy', 'username fullName')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Tree.countDocuments(query)
    ]);

    return {
      trees,
      pagination: {
        page,
        limit,
        total
      }
    };
  }

  async searchTrees(searchParams) {
    const { 
      q, 
      status, 
      minHeight, 
      maxHeight, 
      page = 1, 
      limit = 20 
    } = searchParams;
    const skip = (page - 1) * limit;

    const query = {};
    
    if (q) {
      query.$or = [
        { treeId: { $regex: q, $options: 'i' } },
        { 'location.address': { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    if (status) query.status = status;
    if (minHeight) query.height = { $gte: parseFloat(minHeight) };
    if (maxHeight) query.height = { ...query.height, $lte: parseFloat(maxHeight) };

    const [trees, total] = await Promise.all([
      Tree.find(query)
        .populate('speciesId', 'commonName scientificName')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Tree.countDocuments(query)
    ]);

    return { trees, pagination: { page, limit, total } };
  }

  async getNearbyTrees(latitude, longitude, radius = 1000) {
    const trees = await Tree.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius
        }
      }
    })
    .populate('speciesId', 'commonName scientificName')
    .limit(50);

    return trees;
  }

  async getTreeById(treeId) {
    const tree = await Tree.findById(treeId)
      .populate('speciesId')
      .populate('createdBy', 'username fullName email')
      .populate('images.uploadedBy', 'username fullName');

    if (!tree) {
      throw new ApiError(404, 'Tree not found');
    }

    return tree;
  }

  async createTree(treeData) {
    const tree = new Tree({
      ...treeData,
      location: {
        type: 'Point',
        coordinates: [treeData.location.longitude, treeData.location.latitude],
        address: treeData.location.address,
        city: treeData.location.city,
        state: treeData.location.state,
        country: treeData.location.country
      }
    });

    await tree.save();
    await tree.populate('speciesId createdBy');
    return tree;
  }

  async updateTree(treeId, updateData, userId) {
    const tree = await Tree.findById(treeId);
    
    if (!tree) {
      throw new ApiError(404, 'Tree not found');
    }

    if (updateData.location) {
      updateData.location = {
        ...tree.location,
        ...updateData.location,
        coordinates: [
          updateData.location.longitude || tree.location.coordinates[0],
          updateData.location.latitude || tree.location.coordinates[1]
        ]
      };
    }

    Object.assign(tree, updateData);
    await tree.save();
    await tree.populate('speciesId createdBy');

    return tree;
  }

  async deleteTree(treeId) {
    const tree = await Tree.findByIdAndDelete(treeId);
    
    if (!tree) {
      throw new ApiError(404, 'Tree not found');
    }

    return tree;
  }

  async uploadImages(treeId, files, userId) {
    const tree = await Tree.findById(treeId);
    
    if (!tree) {
      throw new ApiError(404, 'Tree not found');
    }

    const images = files.map(file => ({
      url: `/uploads/${file.filename}`,
      uploadedBy: userId,
      uploadedAt: new Date()
    }));

    tree.images.push(...images);
    await tree.save();

    return images;
  }

  async deleteImage(treeId, imageId) {
    const tree = await Tree.findById(treeId);
    
    if (!tree) {
      throw new ApiError(404, 'Tree not found');
    }

    tree.images = tree.images.filter(img => img._id.toString() !== imageId);
    await tree.save();
  }

  async addTags(treeId, tags) {
    const tree = await Tree.findById(treeId);
    
    if (!tree) {
      throw new ApiError(404, 'Tree not found');
    }

    tree.tags = [...new Set([...tree.tags, ...tags])];
    await tree.save();

    return tree;
  }

  async removeTag(treeId, tag) {
    const tree = await Tree.findById(treeId);
    
    if (!tree) {
      throw new ApiError(404, 'Tree not found');
    }

    tree.tags = tree.tags.filter(t => t !== tag);
    await tree.save();

    return tree;
  }

  async getStatistics() {
    const [
      totalTrees,
      healthyTrees,
      diseasedTrees,
      deadTrees,
      speciesCount
    ] = await Promise.all([
      Tree.countDocuments(),
      Tree.countDocuments({ status: 'healthy' }),
      Tree.countDocuments({ status: 'diseased' }),
      Tree.countDocuments({ status: 'dead' }),
      Tree.distinct('speciesId').then(ids => ids.length)
    ]);

    return {
      totalTrees,
      healthyTrees,
      diseasedTrees,
      deadTrees,
      speciesCount,
      healthPercentage: totalTrees > 0 ? ((healthyTrees / totalTrees) * 100).toFixed(2) : 0
    };
  }
}

module.exports = new TreeService();
