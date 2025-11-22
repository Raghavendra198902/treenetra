const Tree = require('../models/tree.model');
const HealthRecord = require('../models/health.model');
const Species = require('../models/species.model');
const User = require('../models/user.model');

class AnalyticsService {
  async getOverview() {
    const [
      totalTrees,
      totalSpecies,
      totalUsers,
      healthyTrees,
      recentInspections
    ] = await Promise.all([
      Tree.countDocuments(),
      Species.countDocuments(),
      User.countDocuments(),
      Tree.countDocuments({ status: 'healthy' }),
      HealthRecord.countDocuments({
        inspectionDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    return {
      totalTrees,
      totalSpecies,
      totalUsers,
      healthyTrees,
      healthPercentage: totalTrees > 0 ? ((healthyTrees / totalTrees) * 100).toFixed(2) : 0,
      recentInspections
    };
  }

  async getTreeGrowth(startDate, endDate) {
    const matchStage = {};
    
    if (startDate) matchStage.createdAt = { $gte: new Date(startDate) };
    if (endDate) matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(endDate) };

    const growth = await Tree.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return growth;
  }

  async getTreeDistribution() {
    const [statusDistribution, speciesDistribution] = await Promise.all([
      Tree.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Tree.aggregate([
        {
          $group: {
            _id: '$speciesId',
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'species',
            localField: '_id',
            foreignField: '_id',
            as: 'species'
          }
        },
        {
          $project: {
            count: 1,
            speciesName: { $arrayElemAt: ['$species.commonName', 0] }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    return {
      byStatus: statusDistribution,
      bySpecies: speciesDistribution
    };
  }

  async getHealthTrends(startDate, endDate) {
    const matchStage = {};
    
    if (startDate) matchStage.inspectionDate = { $gte: new Date(startDate) };
    if (endDate) matchStage.inspectionDate = { ...matchStage.inspectionDate, $lte: new Date(endDate) };

    const trends = await HealthRecord.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$inspectionDate' },
            month: { $month: '$inspectionDate' },
            status: '$status'
          },
          count: { $sum: 1 },
          avgHealthScore: { $avg: '$healthScore' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return trends;
  }

  async getPopularSpecies(limit = 10) {
    const species = await Tree.aggregate([
      {
        $group: {
          _id: '$speciesId',
          treeCount: { $sum: 1 },
          healthyCount: {
            $sum: { $cond: [{ $eq: ['$status', 'healthy'] }, 1, 0] }
          },
          avgHeight: { $avg: '$height' },
          avgDiameter: { $avg: '$diameter' }
        }
      },
      {
        $lookup: {
          from: 'species',
          localField: '_id',
          foreignField: '_id',
          as: 'speciesInfo'
        }
      },
      {
        $project: {
          speciesInfo: { $arrayElemAt: ['$speciesInfo', 0] },
          treeCount: 1,
          healthyCount: 1,
          avgHeight: { $round: ['$avgHeight', 2] },
          avgDiameter: { $round: ['$avgDiameter', 2] },
          healthPercentage: {
            $round: [{ $multiply: [{ $divide: ['$healthyCount', '$treeCount'] }, 100] }, 2]
          }
        }
      },
      { $sort: { treeCount: -1 } },
      { $limit: limit }
    ]);

    return species;
  }

  async getUserActivity(startDate, endDate) {
    const matchStage = {};
    
    if (startDate) matchStage.createdAt = { $gte: new Date(startDate) };
    if (endDate) matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(endDate) };

    const [treeActivity, healthActivity] = await Promise.all([
      Tree.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$createdBy',
            treesAdded: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $project: {
            user: { $arrayElemAt: ['$user', 0] },
            treesAdded: 1
          }
        },
        { $sort: { treesAdded: -1 } },
        { $limit: 10 }
      ]),
      HealthRecord.aggregate([
        { $match: { ...matchStage, inspectionDate: matchStage.createdAt } },
        {
          $group: {
            _id: '$inspectedBy',
            inspections: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $project: {
            user: { $arrayElemAt: ['$user', 0] },
            inspections: 1
          }
        },
        { $sort: { inspections: -1 } },
        { $limit: 10 }
      ])
    ]);

    return {
      topTreeContributors: treeActivity,
      topInspectors: healthActivity
    };
  }

  async getMonthlyReport(year, month) {
    const startDate = new Date(year || new Date().getFullYear(), month ? month - 1 : 0, 1);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + (month ? 1 : 12));

    const [treesAdded, inspectionsCompleted, healthStatus] = await Promise.all([
      Tree.countDocuments({
        createdAt: { $gte: startDate, $lt: endDate }
      }),
      HealthRecord.countDocuments({
        inspectionDate: { $gte: startDate, $lt: endDate }
      }),
      Tree.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    return {
      period: { start: startDate, end: endDate },
      treesAdded,
      inspectionsCompleted,
      healthStatus
    };
  }

  async exportReport(format, startDate, endDate) {
    const data = await this.getMonthlyReport(
      startDate ? new Date(startDate).getFullYear() : undefined,
      startDate ? new Date(startDate).getMonth() + 1 : undefined
    );

    if (format === 'csv') {
      let csv = 'Metric,Value\n';
      csv += `Trees Added,${data.treesAdded}\n`;
      csv += `Inspections Completed,${data.inspectionsCompleted}\n`;
      data.healthStatus.forEach(status => {
        csv += `${status._id} Trees,${status.count}\n`;
      });
      return csv;
    }

    return JSON.stringify(data, null, 2);
  }
}

module.exports = new AnalyticsService();
