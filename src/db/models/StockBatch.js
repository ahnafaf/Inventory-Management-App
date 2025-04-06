// StockBatch model
const db = require('../index');

class StockBatch {
  static tableName = 'stock_batches';
  
  // Get all batches with optional filtering
  static async getAll(filters = {}) {
    const query = db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'items.name as item_name',
        'items.sku as item_sku'
      )
      .join('items', `${this.tableName}.item_id`, 'items.id');
    
    // Apply filters
    if (filters.itemId) {
      query.where(`${this.tableName}.item_id`, filters.itemId);
    }
    
    if (filters.batchNumber) {
      query.where(`${this.tableName}.batch_number`, 'like', `%${filters.batchNumber}%`);
    }
    
    if (filters.hasStock !== undefined) {
      if (filters.hasStock === true) {
        query.where(`${this.tableName}.current_quantity`, '>', 0);
      } else if (filters.hasStock === false) {
        query.where(`${this.tableName}.current_quantity`, '=', 0);
      }
    }
    
    // Apply sorting
    const sortBy = filters.sortBy || 'expiry_date';
    const sortDirection = filters.sortDirection || 'asc';
    
    query.orderBy(sortBy, sortDirection);
    
    return query;
  }
  
  // Get batch by ID
  static async getById(id) {
    return db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'items.name as item_name',
        'items.sku as item_sku'
      )
      .join('items', `${this.tableName}.item_id`, 'items.id')
      .where(`${this.tableName}.id`, id)
      .first();
  }
  
  // Get batches by item ID
  static async getByItemId(itemId) {
    return db(this.tableName)
      .where('item_id', itemId)
      .orderBy('expiry_date', 'asc');
  }
  
  // Get batch by item ID and batch number
  static async getByItemAndBatch(itemId, batchNumber) {
    return db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'items.name as item_name',
        'items.sku as item_sku'
      )
      .join('items', `${this.tableName}.item_id`, 'items.id')
      .where({
        [`${this.tableName}.item_id`]: itemId,
        [`${this.tableName}.batch_number`]: batchNumber
      })
      .first();
  }
  
  // Get batches that are expiring soon
  static async getExpiring(days = 30) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    
    return db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'items.name as item_name',
        'items.sku as item_sku'
      )
      .join('items', `${this.tableName}.item_id`, 'items.id')
      .where('expiry_date', '<=', expiryDate)
      .where('current_quantity', '>', 0)
      .orderBy('expiry_date', 'asc');
  }
  
  // Create a new batch
  static async create(batch) {
    const result = await db(this.tableName)
      .insert(batch)
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
  
  // Update a batch
  static async update(id, data) {
    await db(this.tableName)
      .where('id', id)
      .update({
        ...data,
        updated_at: db.fn.now()
      });
      
    return this.getById(id);
  }
  
  // Update the quantity of a batch
  static async updateQuantity(id, newQuantity) {
    await db(this.tableName)
      .where('id', id)
      .update({
        current_quantity: newQuantity,
        updated_at: db.fn.now()
      });
      
    return this.getById(id);
  }
  
  // Check if a batch exists with the given batch number for an item
  static async batchExists(itemId, batchNumber) {
    const result = await db(this.tableName)
      .where({
        item_id: itemId,
        batch_number: batchNumber
      })
      .first();
      
    return !!result;
  }
}

module.exports = StockBatch;