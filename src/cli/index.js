#!/usr/bin/env node

// Stock Management CLI
const { program } = require('commander');
const axios = require('axios');
require('dotenv').config();

// Configure API client
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

// Define CLI version and description
program
  .version('1.0.0')
  .description('Stock Management CLI (cline)');

// ==================== ITEM COMMANDS ====================

// List all items
program
  .command('list-items')
  .description('List all items in the inventory')
  .action(async () => {
    try {
      const response = await apiClient.get('/items');
      if (response.data.length === 0) {
        console.log('No items found.');
        return;
      }
      
      console.table(response.data.map(item => ({
        ID: item.id,
        Name: item.name,
        SKU: item.sku || 'N/A',
        Description: item.description ? item.description.substring(0, 30) + '...' : 'N/A'
      })));
    } catch (error) {
      console.error('Error listing items:', error.response?.data?.error || error.message);
    }
  });

// Add a new item
program
  .command('add-item')
  .description('Add a new item to the inventory')
  .requiredOption('--name <name>', 'Item name')
  .option('--sku <sku>', 'Item SKU')
  .option('--desc <description>', 'Item description')
  .action(async (options) => {
    try {
      const itemData = {
        name: options.name,
        sku: options.sku,
        description: options.desc
      };
      
      const response = await apiClient.post('/items', itemData);
      console.log('Item added successfully:');
      console.table([{
        ID: response.data.id,
        Name: response.data.name,
        SKU: response.data.sku || 'N/A',
        Description: response.data.description || 'N/A'
      }]);
    } catch (error) {
      console.error('Error adding item:', error.response?.data?.error || error.message);
    }
  });

// ==================== STOCK COMMANDS ====================

// Receive stock
program
  .command('receive')
  .description('Receive new stock')
  .requiredOption('--item-id <id>', 'Item ID')
  .requiredOption('--batch-number <batchNumber>', 'Batch number')
  .requiredOption('--quantity <qty>', 'Quantity to receive', parseInt)
  .option('--expiry-date <date>', 'Expiry date (YYYY-MM-DD)')
  .option('--reference <ref>', 'Reference information')
  .option('--notes <notes>', 'Additional notes')
  .action(async (options) => {
    try {
      if (options.quantity <= 0) {
        console.error('Quantity must be a positive number');
        return;
      }
      
      const receiveData = {
        itemId: options.itemId,
        batchNumber: options.batchNumber,
        quantity: options.quantity,
        expiryDate: options.expiryDate,
        reference: options.reference,
        notes: options.notes
      };
      
      const response = await apiClient.post('/stock/receive', receiveData);
      console.log('Stock received successfully:');
      console.log('Batch Details:');
      console.table([{
        ID: response.data.batch.id,
        'Item ID': response.data.batch.item_id,
        'Item Name': response.data.batch.item_name,
        'Batch Number': response.data.batch.batch_number,
        'Expiry Date': response.data.batch.expiry_date || 'N/A',
        'Current Quantity': response.data.batch.current_quantity
      }]);
      
      console.log('Movement Details:');
      console.table([{
        ID: response.data.movement.id,
        Type: response.data.movement.movement_type,
        Quantity: response.data.movement.quantity,
        Reference: response.data.movement.reference || 'N/A',
        Notes: response.data.movement.notes || 'N/A',
        'Created At': new Date(response.data.movement.created_at).toLocaleString()
      }]);
    } catch (error) {
      console.error('Error receiving stock:', error.response?.data?.error || error.message);
    }
  });

// List stock batches
program
  .command('list-batches')
  .description('List stock batches')
  .option('--item-id <id>', 'Filter by item ID')
  .option('--batch-number <batchNumber>', 'Filter by batch number')
  .option('--has-stock', 'Show only batches with stock')
  .option('--sort-by <field>', 'Sort by field (default: expiry_date)')
  .option('--sort-dir <direction>', 'Sort direction (asc/desc)')
  .action(async (options) => {
    try {
      const params = {};
      
      if (options.itemId) params.itemId = options.itemId;
      if (options.batchNumber) params.batchNumber = options.batchNumber;
      if (options.hasStock) params.hasStock = true;
      if (options.sortBy) params.sortBy = options.sortBy;
      if (options.sortDir) params.sortDirection = options.sortDir;
      
      const response = await apiClient.get('/stock/batches', { params });
      
      if (response.data.length === 0) {
        console.log('No batches found.');
        return;
      }
      
      console.table(response.data.map(batch => ({
        ID: batch.id,
        'Item Name': batch.item_name,
        'Batch Number': batch.batch_number,
        'Expiry Date': batch.expiry_date || 'N/A',
        'Initial Qty': batch.initial_quantity,
        'Current Qty': batch.current_quantity
      })));
    } catch (error) {
      console.error('Error listing batches:', error.response?.data?.error || error.message);
    }
  });

// List expiring batches
program
  .command('expiring')
  .description('List batches expiring soon')
  .option('--days <days>', 'Days until expiry (default: 30)', parseInt)
  .action(async (options) => {
    try {
      const params = {};
      if (options.days) params.days = options.days;
      
      const response = await apiClient.get('/stock/expiring', { params });
      
      if (response.data.length === 0) {
        console.log('No expiring batches found.');
        return;
      }
      
      console.table(response.data.map(batch => ({
        ID: batch.id,
        'Item Name': batch.item_name,
        'Batch Number': batch.batch_number,
        'Expiry Date': batch.expiry_date,
        'Current Qty': batch.current_quantity,
        'Days Left': Math.ceil((new Date(batch.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
      })));
    } catch (error) {
      console.error('Error listing expiring batches:', error.response?.data?.error || error.message);
    }
  });

// List movements
program
  .command('list-movements')
  .description('List stock movements')
  .option('--batch-id <batchId>', 'Filter by batch ID')
  .option('--item-id <itemId>', 'Filter by item ID')
  .option('--type <type>', 'Filter by movement type (receive, issue, adjust, write_off)')
  .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
  .option('--end-date <date>', 'End date (YYYY-MM-DD)')
  .action(async (options) => {
    try {
      const params = {};
      
      if (options.batchId) params.batchId = options.batchId;
      if (options.itemId) params.itemId = options.itemId;
      if (options.type) params.movementType = options.type;
      if (options.startDate) params.startDate = options.startDate;
      if (options.endDate) params.endDate = options.endDate;
      
      const response = await apiClient.get('/stock/movements', { params });
      
      if (response.data.length === 0) {
        console.log('No movements found.');
        return;
      }
      
      console.table(response.data.map(movement => ({
        ID: movement.id,
        'Item': movement.item_name,
        'Batch': movement.batch_number,
        'Type': movement.movement_type,
        'Quantity': movement.quantity,
        'Reference': movement.reference || 'N/A',
        'Created At': new Date(movement.created_at).toLocaleString()
      })));
    } catch (error) {
      console.error('Error listing movements:', error.response?.data?.error || error.message);
    }
  });

// Issue stock
program
  .command('issue')
  .description('Issue stock from a batch')
  .requiredOption('--batch-id <id>', 'Batch ID')
  .requiredOption('--quantity <qty>', 'Quantity to issue', parseInt)
  .option('--reference <ref>', 'Reference information')
  .option('--notes <notes>', 'Additional notes')
  .action(async (options) => {
    try {
      if (options.quantity <= 0) {
        console.error('Quantity must be a positive number');
        return;
      }
      
      const issueData = {
        batchId: options.batchId,
        quantity: options.quantity,
        reference: options.reference,
        notes: options.notes
      };
      
      const response = await apiClient.post('/stock/issue', issueData);
      console.log('Stock issued successfully:');
      
      console.log('Updated Batch:');
      console.table([{
        ID: response.data.batch.id,
        'Item Name': response.data.batch.item_name,
        'Batch Number': response.data.batch.batch_number,
        'Current Quantity': response.data.batch.current_quantity
      }]);
      
      console.log('Movement Details:');
      console.table([{
        ID: response.data.movement.id,
        Type: response.data.movement.movement_type,
        Quantity: response.data.movement.quantity,
        Reference: response.data.movement.reference || 'N/A',
        Notes: response.data.movement.notes || 'N/A',
        'Created At': new Date(response.data.movement.created_at).toLocaleString()
      }]);
    } catch (error) {
      console.error('Error issuing stock:', error.response?.data?.error || error.message);
    }
  });

// Adjust stock
program
  .command('adjust')
  .description('Adjust stock quantity (positive or negative)')
  .requiredOption('--batch-id <id>', 'Batch ID')
  .requiredOption('--quantity <qty>', 'Adjustment quantity (can be negative)', parseInt)
  .option('--reference <ref>', 'Reference information')
  .option('--notes <notes>', 'Additional notes')
  .action(async (options) => {
    try {
      if (options.quantity === 0) {
        console.error('Quantity must be non-zero');
        return;
      }
      
      const adjustData = {
        batchId: options.batchId,
        adjustmentQuantity: options.quantity,
        reference: options.reference,
        notes: options.notes
      };
      
      const response = await apiClient.post('/stock/adjust', adjustData);
      console.log('Stock adjusted successfully:');
      
      console.log('Updated Batch:');
      console.table([{
        ID: response.data.batch.id,
        'Item Name': response.data.batch.item_name,
        'Batch Number': response.data.batch.batch_number,
        'Current Quantity': response.data.batch.current_quantity
      }]);
      
      console.log('Movement Details:');
      console.table([{
        ID: response.data.movement.id,
        Type: response.data.movement.movement_type,
        Quantity: response.data.movement.quantity,
        Reference: response.data.movement.reference || 'N/A',
        Notes: response.data.movement.notes || 'N/A',
        'Created At': new Date(response.data.movement.created_at).toLocaleString()
      }]);
    } catch (error) {
      console.error('Error adjusting stock:', error.response?.data?.error || error.message);
    }
  });

// Parse command-line arguments
program.parse(process.argv);

// Display help if no command is provided
if (process.argv.length <= 2) {
  program.help();
}