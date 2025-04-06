/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Get the inserted items to reference their IDs
  const items = await knex('items').select('id', 'name');
  
  if (items.length === 0) {
    console.log('No items found. Please run the items seed first.');
    return;
  }
  
  // Instead of deleting, we'll skip inserting if records already exist
  const existingBatches = await knex('stock_batches').select('id').limit(1);
  
  if (existingBatches.length > 0) {
    console.log('Stock batches already exist, skipping seed');
    return;
  }
  
  // Create expiry dates
  const now = new Date();
  
  const threeMonthsFromNow = new Date(now);
  threeMonthsFromNow.setMonth(now.getMonth() + 3);
  
  const sixMonthsFromNow = new Date(now);
  sixMonthsFromNow.setMonth(now.getMonth() + 6);
  
  const oneYearFromNow = new Date(now);
  oneYearFromNow.setFullYear(now.getFullYear() + 1);
  
  const twoYearsFromNow = new Date(now);
  twoYearsFromNow.setFullYear(now.getFullYear() + 2);
  
  // Find items by name
  const findItemByName = (name) => {
    const item = items.find(i => i.name === name);
    if (!item) throw new Error(`Item not found with name: ${name}`);
    return item.id;
  };
  
  const paracetamolId = findItemByName('Paracetamol');
  const amoxicillinId = findItemByName('Amoxicillin');
  const ibuprofenId = findItemByName('Ibuprofen');
  const cetirizineId = findItemByName('Cetirizine');
  const aspirinId = findItemByName('Aspirin');
  
  // Insert seed batches with proper item IDs
  await knex('stock_batches').insert([
    {
      item_id: paracetamolId,
      batch_number: 'PCM-BATCH-001',
      expiry_date: threeMonthsFromNow,
      initial_quantity: 100,
      current_quantity: 75,
      created_at: now,
      updated_at: now
    },
    {
      item_id: paracetamolId,
      batch_number: 'PCM-BATCH-002',
      expiry_date: oneYearFromNow,
      initial_quantity: 200,
      current_quantity: 200,
      created_at: now,
      updated_at: now
    },
    {
      item_id: amoxicillinId,
      batch_number: 'AMX-BATCH-001',
      expiry_date: sixMonthsFromNow,
      initial_quantity: 150,
      current_quantity: 100,
      created_at: now,
      updated_at: now
    },
    {
      item_id: ibuprofenId,
      batch_number: 'IBU-BATCH-001',
      expiry_date: twoYearsFromNow,
      initial_quantity: 300,
      current_quantity: 250,
      created_at: now,
      updated_at: now
    },
    {
      item_id: cetirizineId,
      batch_number: 'CTZ-BATCH-001',
      expiry_date: oneYearFromNow,
      initial_quantity: 120,
      current_quantity: 120,
      created_at: now,
      updated_at: now
    }
  ]);
};