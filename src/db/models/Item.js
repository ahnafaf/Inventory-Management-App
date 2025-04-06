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
    // Insert the item and return the ID
    const result = await db(this.tableName)
      .insert(item)
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

  // Update an item
  static async update(id, item) {
    await db(this.tableName)
      .where('id', id)
      .update({
        ...item,
        updated_at: db.fn.now()
      });

    return this.getById(id);
  }

  // Delete an item (soft delete)
  static async delete(id) {
    return db(this.tableName)
      .where('id', id)
      .update({
        active: false,
        updated_at: db.fn.now()
      });
  }
}

module.exports = Item;