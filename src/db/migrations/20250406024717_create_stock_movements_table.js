/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('stock_movements', function(table) {
    table.increments('id').primary();
    table.integer('batch_id').unsigned().notNullable();
    table.foreign('batch_id').references('id').inTable('stock_batches').onDelete('CASCADE');
    table.enum('movement_type', ['receive', 'issue', 'adjust', 'write_off']).notNullable();
    table.integer('quantity').notNullable();
    table.text('reference').nullable();
    table.text('notes').nullable();
    table.timestamps(true, true);
    
    // Index for faster queries when searching by movement_type
    table.index('movement_type');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('stock_movements');
};
