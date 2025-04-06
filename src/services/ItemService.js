// Item service to handle business logic for items
const Item = require('../db/models/Item');

class ItemService {
  // Get all items
  async getAll() {
    return Item.getAll();
  }

  // Get item by ID
  async getById(id) {
    const item = await Item.getById(id);
    if (!item) {
      throw new Error('Item not found');
    }
    return item;
  }

  // Create a new item
  async create(itemData) {
    // Basic validation
    if (!itemData.name) {
      throw new Error('Item name is required');
    }

    return Item.create(itemData);
  }

  // Update an item
  async update(id, itemData) {
    // Check if item exists
    await this.getById(id);
    
    return Item.update(id, itemData);
  }

  // Delete an item (soft delete)
  async delete(id) {
    // Check if item exists
    await this.getById(id);
    
    return Item.delete(id);
  }
}

module.exports = new ItemService();