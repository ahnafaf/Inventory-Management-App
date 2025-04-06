// Stock routes
const express = require('express');
const router = express.Router();
const StockService = require('../../services/StockService');

// GET /api/stock/batches - Get all batches with optional filters
router.get('/batches', async (req, res) => {
  try {
    const filters = {
      itemId: req.query.itemId,
      expiryBefore: req.query.expiryBefore,
      expiryAfter: req.query.expiryAfter,
      batchNumber: req.query.batchNumber,
      hasStock: req.query.hasStock === 'true',
      sortBy: req.query.sortBy,
      sortDirection: req.query.sortDirection
    };
    
    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });
    
    const batches = await StockService.getBatches(filters);
    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stock/expiring - Get batches expiring soon
router.get('/expiring', async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days, 10) : 30;
    const batches = await StockService.getExpiringBatches(days);
    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stock/movements - Get stock movements with optional filters
router.get('/movements', async (req, res) => {
  try {
    const filters = {
      batchId: req.query.batchId,
      itemId: req.query.itemId,
      movementType: req.query.movementType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      sortBy: req.query.sortBy,
      sortDirection: req.query.sortDirection
    };
    
    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });
    
    const movements = await StockService.getMovements(filters);
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/stock/receive - Receive new stock
router.post('/receive', async (req, res) => {
  try {
    const receiveData = {
      itemId: req.body.itemId,
      batchNumber: req.body.batchNumber,
      expiryDate: req.body.expiryDate,
      quantity: req.body.quantity,
      reference: req.body.reference,
      notes: req.body.notes
    };
    
    // Validate required fields
    if (!receiveData.itemId) {
      return res.status(400).json({ error: 'Item ID is required' });
    }
    
    if (!receiveData.batchNumber) {
      return res.status(400).json({ error: 'Batch number is required' });
    }
    
    if (!receiveData.quantity || receiveData.quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }
    
    const result = await StockService.receiveStock(receiveData);
    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// POST /api/stock/issue - Issue stock from a batch
router.post('/issue', async (req, res) => {
  try {
    const issueData = {
      batchId: req.body.batchId,
      quantity: req.body.quantity,
      reference: req.body.reference,
      notes: req.body.notes
    };
    
    // Validate required fields
    if (!issueData.batchId) {
      return res.status(400).json({ error: 'Batch ID is required' });
    }
    
    if (!issueData.quantity || issueData.quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }
    
    const result = await StockService.issueStock(issueData);
    res.json(result);
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('Not enough stock')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// POST /api/stock/adjust - Adjust stock quantity
router.post('/adjust', async (req, res) => {
  try {
    const adjustData = {
      batchId: req.body.batchId,
      adjustmentQuantity: req.body.adjustmentQuantity,
      reference: req.body.reference,
      notes: req.body.notes
    };
    
    // Validate required fields
    if (!adjustData.batchId) {
      return res.status(400).json({ error: 'Batch ID is required' });
    }
    
    if (!adjustData.adjustmentQuantity || adjustData.adjustmentQuantity === 0) {
      return res.status(400).json({ error: 'Adjustment quantity must be a non-zero number' });
    }
    
    const result = await StockService.adjustStock(adjustData);
    res.json(result);
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('negative stock')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;