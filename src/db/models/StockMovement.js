// StockMovement model
const db = require('../index');

class StockMovement {
  static tableName = 'stock_movements';
  
  // Get all movements with optional filtering
  static async getAll(filters = {}) {
    const query = db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'stock_batches.batch_number',
        'stock_batches.item_id',
        'items.name as item_name',
        'items.sku as item_sku'
      )
      .join('stock_batches', `${this.tableName}.batch_id`, 'stock_batches.id')
      .join('items', 'stock_batches.item_id', 'items.id');
    
    // Apply filters
    if (filters.batchId) {
      query.where(`${this.tableName}.batch_id`, filters.batchId);
    }
    
    if (filters.itemId) {
      query.where('stock_batches.item_id', filters.itemId);
    }
    
    if (filters.movementType) {
      query.where(`${this.tableName}.movement_type`, filters.movementType);
    }
    
    if (filters.startDate) {
      query.where(`${this.tableName}.created_at`, '>=', filters.startDate);
    }
    
    if (filters.endDate) {
      // Add 1 day to include the end date
      const endDate = new Date(filters.endDate);
      endDate.setDate(endDate.getDate() + 1);
      query.where(`${this.tableName}.created_at`, '<', endDate);
    }
    
    if (filters.reference) {
      query.where(`${this.tableName}.reference`, 'like', `%${filters.reference}%`);
    }
    
    // Apply sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortDirection = filters.sortDirection || 'desc';
    
    query.orderBy(sortBy, sortDirection);
    
    return query;
  }
  
  // Get movement by ID
  static async getById(id) {
    return db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'stock_batches.batch_number',
        'stock_batches.item_id',
        'items.name as item_name',
        'items.sku as item_sku'
      )
      .join('stock_batches', `${this.tableName}.batch_id`, 'stock_batches.id')
      .join('items', 'stock_batches.item_id', 'items.id')
      .where(`${this.tableName}.id`, id)
      .first();
  }
  
  // Get movements by batch ID
  static async getByBatchId(batchId) {
    return db(this.tableName)
      .where('batch_id', batchId)
      .orderBy('created_at', 'desc');
  }
  
  // Create a new movement
  static async create(movement) {
    const result = await db(this.tableName)
      .insert(movement)
      .returning('id');
    
    // Extract the ID properly, handling both array and object formats
    let id;
    if (typeof result[0] === 'object') {
      id = result[0].id;
    } else {
      id = result[0];
    }
    
    return this.getById(id);
  }
  
  // Summarize movements by period (day, week, month)
  static async summarize(period = 'day', startDate, endDate) {
    // Define the date grouping based on the period
    let dateFormat;
    
    switch (period.toLowerCase()) {
      case 'week':
        dateFormat = 'YYYY-WW'; // Year and week number
        break;
      case 'month':
        dateFormat = 'YYYY-MM'; // Year and month
        break;
      case 'day':
      default:
        dateFormat = 'YYYY-MM-DD'; // Year, month, and day
    }
    
    const query = db(this.tableName)
      .select(
        db.raw(`to_char(created_at, '${dateFormat}') as period`),
        'movement_type',
        db.raw('sum(quantity) as total_quantity'),
        db.raw('count(*) as count')
      )
      .join('stock_batches', `${this.tableName}.batch_id`, 'stock_batches.id');
    
    // Apply date filters
    if (startDate) {
      query.where(`${this.tableName}.created_at`, '>=', startDate);
    }
    
    if (endDate) {
      // Add 1 day to include the end date
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      query.where(`${this.tableName}.created_at`, '<', end);
    }
    
    // Group by period and movement type
    query.groupBy(
      db.raw(`to_char(created_at, '${dateFormat}')`),
      'movement_type'
    );
    
    // Order by period
    query.orderBy('period', 'asc');
    
    return query;
  }
}

module.exports = StockMovement;