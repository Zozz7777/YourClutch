/**
 * Query Optimizer for High-Traffic Production
 * Replaces populate() calls with efficient aggregation pipelines
 */

const { optimizedLogger } = require('./optimized-logger');

class QueryOptimizer {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Optimize populate calls with aggregation pipeline
   * @param {Object} model - Mongoose model
   * @param {Object} filter - Query filter
   * @param {Array} populateFields - Fields to populate
   * @param {Object} options - Query options (sort, limit, skip)
   */
  async optimizeQuery(model, filter = {}, populateFields = [], options = {}) {
    const startTime = Date.now();
    
    try {
      // Build aggregation pipeline
      const pipeline = [
        { $match: filter }
      ];

      // Add lookups for populated fields
      for (const field of populateFields) {
        const { path, select, model: refModel } = field;
        
        pipeline.push({
          $lookup: {
            from: this.getCollectionName(refModel),
            localField: path,
            foreignField: '_id',
            as: path,
            pipeline: select ? [{ $project: this.buildProjection(select) }] : []
          }
        });

        // Unwind if single reference
        if (!field.multiple) {
          pipeline.push({
            $unwind: {
              path: `$${path}`,
              preserveNullAndEmptyArrays: true
            }
          });
        }
      }

      // Add sorting
      if (options.sort) {
        pipeline.push({ $sort: options.sort });
      }

      // Add pagination
      if (options.skip) {
        pipeline.push({ $skip: options.skip });
      }
      if (options.limit) {
        pipeline.push({ $limit: options.limit });
      }

      // Execute aggregation
      const results = await model.aggregate(pipeline);
      
      const queryTime = Date.now() - startTime;
      optimizedLogger.performance(`Query optimized: ${queryTime}ms`, {
        model: model.modelName,
        pipeline: pipeline.length,
        results: results.length
      });

      return results;
    } catch (error) {
      optimizedLogger.error('Query optimization failed:', error);
      throw error;
    }
  }

  /**
   * Get collection name from model
   */
  getCollectionName(model) {
    if (typeof model === 'string') return model;
    return model.collection.name;
  }

  /**
   * Build projection object from select string
   */
  buildProjection(select) {
    const projection = {};
    const fields = select.split(' ');
    
    for (const field of fields) {
      if (field.startsWith('-')) {
        projection[field.substring(1)] = 0;
      } else {
        projection[field] = 1;
      }
    }
    
    return projection;
  }

  /**
   * Optimize single document query
   */
  async optimizeFindById(model, id, populateFields = []) {
    const startTime = Date.now();
    
    try {
      const pipeline = [
        { $match: { _id: id } }
      ];

      // Add lookups
      for (const field of populateFields) {
        const { path, select, model: refModel } = field;
        
        pipeline.push({
          $lookup: {
            from: this.getCollectionName(refModel),
            localField: path,
            foreignField: '_id',
            as: path,
            pipeline: select ? [{ $project: this.buildProjection(select) }] : []
          }
        });

        if (!field.multiple) {
          pipeline.push({
            $unwind: {
              path: `$${path}`,
              preserveNullAndEmptyArrays: true
            }
          });
        }
      }

      const results = await model.aggregate(pipeline);
      const queryTime = Date.now() - startTime;
      
      optimizedLogger.performance(`Single query optimized: ${queryTime}ms`, {
        model: model.modelName,
        id: id.toString()
      });

      return results[0] || null;
    } catch (error) {
      optimizedLogger.error('Single query optimization failed:', error);
      throw error;
    }
  }

  /**
   * Optimize count query
   */
  async optimizeCount(model, filter = {}) {
    const startTime = Date.now();
    
    try {
      const count = await model.countDocuments(filter);
      const queryTime = Date.now() - startTime;
      
      optimizedLogger.performance(`Count query optimized: ${queryTime}ms`, {
        model: model.modelName,
        count
      });

      return count;
    } catch (error) {
      optimizedLogger.error('Count query optimization failed:', error);
      throw error;
    }
  }

  /**
   * Create optimized query builder
   */
  createOptimizedQuery(model) {
    return {
      find: (filter = {}) => ({
        populate: (fields) => ({
          sort: (sort) => ({
            limit: (limit) => ({
              skip: (skip) => this.optimizeQuery(model, filter, fields, { sort, limit, skip })
            })
          })
        })
      }),
      
      findById: (id) => ({
        populate: (fields) => this.optimizeFindById(model, id, fields)
      }),
      
      count: (filter = {}) => this.optimizeCount(model, filter)
    };
  }
}

// Create singleton instance
const queryOptimizer = new QueryOptimizer();

// Helper function to replace common populate patterns
const optimizeSupplierRiskAssessment = async (filter = {}, options = {}) => {
  const SupplierRiskAssessment = require('../models/SupplierRiskAssessment');
  
  const populateFields = [
    { path: 'assessedBy', select: 'name email', model: 'User' },
    { path: 'approvedBy', select: 'name email', model: 'User' },
    { path: 'mitigationPlan.priorityActions.assignedTo', select: 'name email', model: 'User', multiple: true },
    { path: 'recommendations.assignedTo', select: 'name email', model: 'User', multiple: true }
  ];

  return await queryOptimizer.optimizeQuery(
    SupplierRiskAssessment,
    filter,
    populateFields,
    options
  );
};

const optimizeUserQuery = async (filter = {}, options = {}) => {
  const User = require('../models/User');
  
  const populateFields = [
    { path: 'role', select: 'name permissions', model: 'Role' },
    { path: 'department', select: 'name', model: 'Department' }
  ];

  return await queryOptimizer.optimizeQuery(
    User,
    filter,
    populateFields,
    options
  );
};

module.exports = {
  QueryOptimizer,
  queryOptimizer,
  optimizeSupplierRiskAssessment,
  optimizeUserQuery
};
