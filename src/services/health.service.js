const HealthRecord = require('../models/health.model');
const Tree = require('../models/tree.model');
const { ApiError } = require('../utils/apiError');

class HealthService {
  async getAllHealthRecords(filters = {}, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const query = {};
    if (filters.status) query.status = filters.status;

    const [records, total] = await Promise.all([
      HealthRecord.find(query)
        .populate('treeId', 'treeId location status')
        .populate('inspectedBy', 'username fullName')
        .skip(skip)
        .limit(limit)
        .sort({ inspectionDate: -1 }),
      HealthRecord.countDocuments(query)
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total
      }
    };
  }

  async getHealthRecordsByTree(treeId) {
    const records = await HealthRecord.find({ treeId })
      .populate('inspectedBy', 'username fullName')
      .sort({ inspectionDate: -1 });

    return records;
  }

  async getHealthRecordById(recordId) {
    const record = await HealthRecord.findById(recordId)
      .populate('treeId')
      .populate('inspectedBy', 'username fullName email');

    if (!record) {
      throw new ApiError(404, 'Health record not found');
    }

    return record;
  }

  async createHealthRecord(recordData) {
    // Verify tree exists
    const tree = await Tree.findById(recordData.treeId);
    if (!tree) {
      throw new ApiError(404, 'Tree not found');
    }

    const record = new HealthRecord(recordData);
    await record.save();

    // Update tree's health score and last inspection date
    tree.healthScore = recordData.healthScore;
    tree.status = recordData.status;
    tree.lastInspectionDate = recordData.inspectionDate;
    
    if (recordData.followUpRequired && recordData.followUpDate) {
      tree.nextInspectionDate = recordData.followUpDate;
    }

    await tree.save();

    await record.populate('treeId inspectedBy');
    return record;
  }

  async updateHealthRecord(recordId, updateData) {
    const record = await HealthRecord.findByIdAndUpdate(
      recordId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('treeId inspectedBy');

    if (!record) {
      throw new ApiError(404, 'Health record not found');
    }

    // Update tree if health score or status changed
    if (updateData.healthScore || updateData.status) {
      await Tree.findByIdAndUpdate(record.treeId, {
        healthScore: updateData.healthScore || record.healthScore,
        status: updateData.status || record.status
      });
    }

    return record;
  }

  async deleteHealthRecord(recordId) {
    const record = await HealthRecord.findByIdAndDelete(recordId);
    
    if (!record) {
      throw new ApiError(404, 'Health record not found');
    }

    return record;
  }
}

module.exports = new HealthService();
