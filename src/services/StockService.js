// Stock service for batch and movement operations
const db = require('../db/index');
const StockBatch = require('../db/models/StockBatch');
const StockMovement = require('../db/models/StockMovement');
const ItemService = require('./ItemService');

class StockService {
  // Get all batches with optional filtering
  async getBatches(filters = {}) {
    return StockBatch.getAll(filters);
  }

  // Get batches that are expiring within the specified days
  async getExpiringBatches(days = 30) {
    return StockBatch.getExpiring(days);
  }

  // Get batch by ID
  async getBatchById(id) {
    const batch = await StockBatch.getById(id);
    if (!batch) {
      throw new Error('Batch not found');
    }
    return batch;
  }

  // Get all stock movements with optional filtering
  async getMovements(filters = {}) {
    return StockMovement.getAll(filters);
  }

  // Receive new stock
  async receiveStock(receiveData) {
    // Validate item exists
    await ItemService.getById(receiveData.itemId);

    // Start a transaction
    return db.transaction(async (trx) => {
      try {
        // Check if batch already exists for this item
        let batch = await StockBatch.getByItemAndBatch(receiveData.itemId, receiveData.batchNumber);
        
        let batchId;
        
        if (batch) {
          // Update existing batch
          const newQuantity = batch.current_quantity + receiveData.quantity;
          batch = await StockBatch.updateQuantity(batch.id, newQuantity);
          batchId = batch.id;
        } else {
          // Create new batch
          const batchData = {
            item_id: receiveData.itemId,
            batch_number: receiveData.batchNumber,
            expiry_date: receiveData.expiryDate,
            initial_quantity: receiveData.quantity,
            current_quantity: receiveData.quantity
          };
          
          batch = await StockBatch.create(batchData);
          batchId = batch.id;
        }
        
        // Create movement record
        const movementData = {
          batch_id: batchId,
          movement_type: 'receive',
          quantity: receiveData.quantity,
          reference: receiveData.reference,
          notes: receiveData.notes
        };
        
        const movement = await StockMovement.create(movementData);
        
        return { batch, movement };
      } catch (error) {
        throw error;
      }
    });
  }

  // Issue stock from a batch
  async issueStock(issueData) {
    // Validate batch exists
    const batch = await this.getBatchById(issueData.batchId);
    
    // Check if batch has enough stock
    if (batch.current_quantity < issueData.quantity) {
      throw new Error('Not enough stock in batch');
    }
    
    // Start a transaction
    return db.transaction(async (trx) => {
      try {
        // Update batch quantity
        const newQuantity = batch.current_quantity - issueData.quantity;
        const updatedBatch = await StockBatch.updateQuantity(batch.id, newQuantity);
        
        // Create movement record
        const movementData = {
          batch_id: batch.id,
          movement_type: 'issue',
          quantity: -issueData.quantity, // Negative value for issue
          reference: issueData.reference,
          notes: issueData.notes
        };
        
        const movement = await StockMovement.create(movementData);
        
        return { batch: updatedBatch, movement };
      } catch (error) {
        throw error;
      }
    });
  }

  // Adjust stock quantity (for corrections, write-offs, etc.)
  async adjustStock(adjustData) {
    // Validate batch exists
    const batch = await this.getBatchById(adjustData.batchId);
    
    // Check if adjustment would result in negative stock
    const newQuantity = batch.current_quantity + adjustData.adjustmentQuantity;
    if (newQuantity < 0) {
      throw new Error('Adjustment would result in negative stock');
    }
    
    // Start a transaction
    return db.transaction(async (trx) => {
      try {
        // Update batch quantity
        const updatedBatch = await StockBatch.updateQuantity(batch.id, newQuantity);
        
        // Create movement record
        const movementData = {
          batch_id: batch.id,
          movement_type: adjustData.adjustmentQuantity < 0 ? 'write_off' : 'adjust',
          quantity: adjustData.adjustmentQuantity,
          reference: adjustData.reference,
          notes: adjustData.notes
        };
        
        const movement = await StockMovement.create(movementData);
        
        return { batch: updatedBatch, movement };
      } catch (error) {
        throw error;
      }
    });
  }
}

module.exports = new StockService();