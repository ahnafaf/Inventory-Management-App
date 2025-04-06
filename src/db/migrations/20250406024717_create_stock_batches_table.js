/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('stock_batches', function(table) {
    table.increments('id').primary();
    table.integer('item_id').unsigned().notNullable();
    table.foreign('item_id').references('id').inTable('items').onDelete('RESTRICT');
    table.string('batch_number').notNullable();
    table.date('expiry_date');
    table.integer('initial_quantity').notNullable();
    table.integer('current_quantity').notNullable();
    table.timestamps(true, true);

    // Composite unique constraint to prevent duplicate batch numbers for same item
    table.unique(['item_id', 'batch_number']);
    
    // Index for faster expiry queries
    table.index('expiry_date');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('stock_batches');
};
