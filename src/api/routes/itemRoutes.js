// Item routes
const express = require('express');
const router = express.Router();
const ItemService = require('../../services/ItemService');

// GET /api/items - Get all items
router.get('/', async (req, res) => {
  try {
    const items = await ItemService.getAll();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/items/:id - Get an item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await ItemService.getById(req.params.id);
    res.json(item);
  } catch (error) {
    if (error.message === 'Item not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// POST /api/items - Create a new item
router.post('/', async (req, res) => {
  try {
    const item = await ItemService.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/items/:id - Update an item
router.put('/:id', async (req, res) => {
  try {
    const item = await ItemService.update(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    if (error.message === 'Item not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// DELETE /api/items/:id - Delete an item (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    await ItemService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'Item not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;