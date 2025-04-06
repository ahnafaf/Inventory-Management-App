// Item model
const db = require('../index');

class Item {
  static tableName = 'items';

  // Get all items
  static async getAll() {
    return db(this.tableName)
      .where('active', true)
      .orderBy('name');
  }

  // Get item by ID
  static async getById(id) {
    return db(this.tableName)
      .where('id', id)
      .first();
  }

  // Create a new item
  static async create(item) {
    // Set default active status and timestamps if not provided
    const itemData = {
      ...item,
      active: item.active !== undefined ? item.active : true,
      created_at: item.created_at || db.fn.now(),
      updated_at: db.fn.now()
    };
    
    // Begin a transaction to ensure data integrity
    const trx = await db.transaction();
    
    try {
      // Insert the item and return the ID
      const result = await trx(this.tableName)
        .insert(itemData)
        .returning('*');
      
      // Extract the created item, handling different result formats
      const createdItem = Array.isArray(result) ? result[0] : result;
      
      // Commit the transaction
      await trx.commit();
      
      return createdItem;
    } catch (error) {
      // Rollback in case of error
      await trx.rollback();
      throw error;
    }
  }

  // Update an item
  static async update(id, item) {
    // Begin a transaction to ensure data integrity
    const trx = await db.transaction();
    
    try {
      await trx(this.tableName)
        .where('id', id)
        .update({
          ...item,
          updated_at: db.fn.now()
        });

      // Get the updated item
      const updatedItem = await trx(this.tableName)
        .where('id', id)
        .first();
      
      // Commit the transaction
      await trx.commit();
      
      return updatedItem;
    } catch (error) {
      // Rollback in case of error
      await trx.rollback();
      throw error;
    }
  }

  // Delete an item (soft delete)
  static async delete(id) {
    // Begin a transaction to ensure data integrity
    const trx = await db.transaction();
    
    try {
      await trx(this.tableName)
        .where('id', id)
        .update({
          active: false,
          updated_at: db.fn.now()
        });
      
      // Commit the transaction
      await trx.commit();
      
      return true;
    } catch (error) {
      // Rollback in case of error
      await trx.rollback();
      throw error;
    }
  }
}

module.exports = Item;