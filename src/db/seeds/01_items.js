/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  try {
    // First delete all dependent data - stock movements
    await knex('stock_movements').del();
    
    // Then delete stock batches
    await knex('stock_batches').del();
    
    // Finally delete items
    await knex('items').del();
    
    // Insert seed items
    await knex('items').insert([
      {
        name: 'Paracetamol',
        sku: 'MED-PCM-001',
        description: 'Pain reliever and fever reducer',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Amoxicillin',
        sku: 'MED-AMX-001',
        description: 'Antibiotic medication',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Ibuprofen',
        sku: 'MED-IBU-001',
        description: 'Nonsteroidal anti-inflammatory drug',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Cetirizine',
        sku: 'MED-CTZ-001',
        description: 'Antihistamine for allergies',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Aspirin',
        sku: 'MED-ASP-001',
        description: 'Blood thinner and pain reliever',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  } catch (error) {
    console.error('Error seeding items:', error);
    throw error;
  }
};