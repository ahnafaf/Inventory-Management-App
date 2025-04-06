/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Get the inserted batches to reference their IDs
  const batches = await knex('stock_batches')
    .select('stock_batches.id', 'item_id', 'batch_number')
    .join('items', 'stock_batches.item_id', 'items.id')
    .select('items.name as item_name');
  
  if (batches.length === 0) {
    console.log('No batches found. Please run the batches seed first.');
    return;
  }
  
  // Instead of deleting, we'll skip inserting if records already exist
  const existingMovements = await knex('stock_movements').select('id').limit(1);
  
  if (existingMovements.length > 0) {
    console.log('Stock movements already exist, skipping seed');
    return;
  }
  
  // Create dates for movements
  const now = new Date();
  
  // 30 days ago
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  // 20 days ago
  const twentyDaysAgo = new Date(now);
  twentyDaysAgo.setDate(now.getDate() - 20);
  
  // 10 days ago
  const tenDaysAgo = new Date(now);
  tenDaysAgo.setDate(now.getDate() - 10);
  
  // 5 days ago
  const fiveDaysAgo = new Date(now);
  fiveDaysAgo.setDate(now.getDate() - 5);
  
  // 2 days ago
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(now.getDate() - 2);
  
  // Find batches by item name and batch number
  const findBatchByItemAndNumber = (itemName, batchNumber) => {
    const batch = batches.find(b => b.item_name === itemName && b.batch_number === batchNumber);
    if (!batch) throw new Error(`Batch not found for ${itemName} with batch number: ${batchNumber}`);
    return batch.id;
  };
  
  try {
    const paracetamolBatch1 = findBatchByItemAndNumber('Paracetamol', 'PCM-BATCH-001');
    const paracetamolBatch2 = findBatchByItemAndNumber('Paracetamol', 'PCM-BATCH-002');
    const amoxicillinBatch = findBatchByItemAndNumber('Amoxicillin', 'AMX-BATCH-001');
    const ibuprofenBatch = findBatchByItemAndNumber('Ibuprofen', 'IBU-BATCH-001');
    
    // Insert seed movements
    await knex('stock_movements').insert([
      // Paracetamol Batch 1 movements
      {
        batch_id: paracetamolBatch1,
        movement_type: 'receive',
        quantity: 100,
        reference: 'INITIAL-RECEIVE',
        notes: 'Initial stock receipt',
        created_at: thirtyDaysAgo,
        updated_at: thirtyDaysAgo
      },
      {
        batch_id: paracetamolBatch1,
        movement_type: 'issue',
        quantity: 10,
        reference: 'ORDER-001',
        notes: 'Issued to customer',
        created_at: twentyDaysAgo,
        updated_at: twentyDaysAgo
      },
      {
        batch_id: paracetamolBatch1,
        movement_type: 'issue',
        quantity: 15,
        reference: 'ORDER-005',
        notes: 'Issued to pharmacy department',
        created_at: tenDaysAgo,
        updated_at: tenDaysAgo
      },
      
      // Paracetamol Batch 2 movements
      {
        batch_id: paracetamolBatch2,
        movement_type: 'receive',
        quantity: 200,
        reference: 'RESTOCK-001',
        notes: 'Restocking shipment',
        created_at: twentyDaysAgo,
        updated_at: twentyDaysAgo
      },
      
      // Amoxicillin movements
      {
        batch_id: amoxicillinBatch,
        movement_type: 'receive',
        quantity: 150,
        reference: 'INITIAL-RECEIVE',
        notes: 'Initial stock receipt',
        created_at: thirtyDaysAgo,
        updated_at: thirtyDaysAgo
      },
      {
        batch_id: amoxicillinBatch,
        movement_type: 'issue',
        quantity: 30,
        reference: 'ORDER-002',
        notes: 'Issued to customer',
        created_at: twentyDaysAgo,
        updated_at: twentyDaysAgo
      },
      {
        batch_id: amoxicillinBatch,
        movement_type: 'issue',
        quantity: 20,
        reference: 'ORDER-008',
        notes: 'Issued to pharmacy department',
        created_at: fiveDaysAgo,
        updated_at: fiveDaysAgo
      },
      
      // Ibuprofen movements
      {
        batch_id: ibuprofenBatch,
        movement_type: 'receive',
        quantity: 300,
        reference: 'INITIAL-RECEIVE',
        notes: 'Initial stock receipt',
        created_at: thirtyDaysAgo,
        updated_at: thirtyDaysAgo
      },
      {
        batch_id: ibuprofenBatch,
        movement_type: 'issue',
        quantity: 25,
        reference: 'ORDER-003',
        notes: 'Issued to customer',
        created_at: twoDaysAgo,
        updated_at: twoDaysAgo
      },
      {
        batch_id: ibuprofenBatch,
        movement_type: 'issue',
        quantity: 15,
        reference: 'ORDER-006',
        notes: 'Issued to pharmacy department',
        created_at: fiveDaysAgo,
        updated_at: fiveDaysAgo
      },
      {
        batch_id: ibuprofenBatch,
        movement_type: 'issue',
        quantity: 10,
        reference: 'ORDER-010',
        notes: 'Issued to customer',
        created_at: now,
        updated_at: now
      }
    ]);
    
    console.log('Successfully seeded stock movements');
  } catch (error) {
    console.error('Error seeding stock movements:', error);
    throw error;
  }
};