#!/usr/bin/env node

/**
 * Database Utilities for HNFZF Development
 * Node.js script for database operations
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    development: {
        host: 'localhost',
        port: 5433,
        database: 'hnfzf_dev',
        user: 'postgres',
        password: 'postgres',
    },
    production: {
        host: 'localhost',
        port: 5432,
        database: 'hnfzf',
        user: 'postgres',
        password: 'postgres',
    }
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
    log(`[ERROR] ${message}`, 'red');
}

function success(message) {
    log(`[SUCCESS] ${message}`, 'green');
}

function info(message) {
    log(`[INFO] ${message}`, 'blue');
}

function warning(message) {
    log(`[WARNING] ${message}`, 'yellow');
}

// Database connection
async function createConnection(env = 'development') {
    const dbConfig = config[env];
    const pool = new Pool(dbConfig);

    try {
        await pool.query('SELECT 1');
        return pool;
    } catch (err) {
        error(`Failed to connect to database: ${err.message}`);
        throw err;
    }
}

// Test database connection
async function testConnection(env = 'development') {
    try {
        info(`Testing connection to ${env} database...`);
        const pool = await createConnection(env);

        const result = await pool.query('SELECT version()');
        success(`Connected successfully to ${env} database`);
        info(`PostgreSQL version: ${result.rows[0].version}`);

        await pool.end();
        return true;
    } catch (err) {
        error(`Connection test failed: ${err.message}`);
        return false;
    }
}

// Initialize database schema
async function initializeSchema(env = 'development') {
    try {
        info('Initializing database schema...');
        const pool = await createConnection(env);

        // Read and execute init.sql
        const initSqlPath = path.join(__dirname, '..', 'init.sql');
        if (!fs.existsSync(initSqlPath)) {
            error('init.sql file not found');
            return false;
        }

        const initSql = fs.readFileSync(initSqlPath, 'utf8');
        await pool.query(initSql);

        success('Database schema initialized successfully');
        await pool.end();
        return true;
    } catch (err) {
        error(`Schema initialization failed: ${err.message}`);
        return false;
    }
}

// Insert sample data
async function insertSampleData(env = 'development') {
    try {
        info('Inserting sample data...');
        const pool = await createConnection(env);

        const sampleData = `
      -- Sample product flags for testing
      INSERT INTO product_flags (sku, flag_type, flag_value, additional_data, description) VALUES
      ('5921875', 'special_offer', 'Limited Time', '{"discount": "20%", "expires": "2024-12-31"}', 'Special promotional pricing available'),
      ('5921875', 'featured', 'homepage', '{"position": "banner", "priority": "high"}', 'Featured product on homepage'),
      ('5921875', 'warranty_extended', '3_years', '{"original": "1 year", "extended": "3 years"}', 'Extended warranty available'),
      ('TEST123', 'clearance', 'final_sale', '{"original_price": "$299", "sale_price": "$199"}', 'Clearance item - final sale'),
      ('TEST123', 'stock_alert', 'low_stock', '{"quantity": 5, "threshold": 10}', 'Low stock warning'),
      ('DEMO456', 'new_arrival', 'this_month', '{"arrival_date": "2024-01-15", "category": "electronics"}', 'New product this month'),
      ('DEMO456', 'best_seller', 'top_10', '{"rank": 3, "sales_last_month": 150}', 'Top selling product')
      ON CONFLICT (sku) DO NOTHING;
    `;

        await pool.query(sampleData);
        success('Sample data inserted successfully');

        await pool.end();
        return true;
    } catch (err) {
        error(`Sample data insertion failed: ${err.message}`);
        return false;
    }
}

// Check database status
async function checkStatus(env = 'development') {
    try {
        info(`Checking ${env} database status...`);
        const pool = await createConnection(env);

        // Check tables
        const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

        info(`Found ${tablesResult.rows.length} tables:`);
        tablesResult.rows.forEach(row => {
            log(`  - ${row.table_name}`);
        });

        // Check product flags
        if (tablesResult.rows.find(row => row.table_name === 'product_flags')) {
            const flagsResult = await pool.query('SELECT COUNT(*) as count FROM product_flags');
            info(`Product flags: ${flagsResult.rows[0].count} records`);

            const flagTypesResult = await pool.query(`
        SELECT flag_type, COUNT(*) as count 
        FROM product_flags 
        GROUP BY flag_type 
        ORDER BY count DESC
      `);

            if (flagTypesResult.rows.length > 0) {
                info('Flag types:');
                flagTypesResult.rows.forEach(row => {
                    log(`  - ${row.flag_type}: ${row.count} records`);
                });
            }
        }

        await pool.end();
        return true;
    } catch (err) {
        error(`Status check failed: ${err.message}`);
        return false;
    }
}

// Clean database (remove all data)
async function cleanDatabase(env = 'development') {
    try {
        warning(`This will remove ALL data from the ${env} database!`);

        // In a real script, you might want to add a confirmation prompt
        // For now, we'll just proceed

        info('Cleaning database...');
        const pool = await createConnection(env);

        // Drop and recreate tables
        await pool.query('DROP TABLE IF EXISTS product_flags CASCADE');
        await pool.query('DROP TABLE IF EXISTS products CASCADE');

        success('Database cleaned successfully');

        await pool.end();
        return true;
    } catch (err) {
        error(`Database cleaning failed: ${err.message}`);
        return false;
    }
}

// Add a flag to a product
async function addFlag(sku, flagType, flagValue, additionalData, description, env = 'development') {
    try {
        info(`Adding flag '${flagType}' to product ${sku}...`);
        const pool = await createConnection(env);

        const query = `
      INSERT INTO product_flags (sku, flag_type, flag_value, additional_data, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

        const values = [sku, flagType, flagValue, additionalData, description];
        const result = await pool.query(query, values);

        success(`Flag added successfully with ID: ${result.rows[0].id}`);

        await pool.end();
        return result.rows[0];
    } catch (err) {
        error(`Adding flag failed: ${err.message}`);
        return null;
    }
}

// Remove all flags for a product
async function removeFlags(sku, env = 'development') {
    try {
        info(`Removing all flags for product ${sku}...`);
        const pool = await createConnection(env);

        const result = await pool.query('DELETE FROM product_flags WHERE sku = $1', [sku]);
        success(`Removed ${result.rowCount} flags for product ${sku}`);

        await pool.end();
        return result.rowCount;
    } catch (err) {
        error(`Removing flags failed: ${err.message}`);
        return 0;
    }
}

// Main CLI handler
function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';
    const env = args.includes('--prod') ? 'production' : 'development';

    switch (command) {
        case 'test':
            testConnection(env);
            break;

        case 'init':
            initializeSchema(env);
            break;

        case 'seed':
            insertSampleData(env);
            break;

        case 'status':
            checkStatus(env);
            break;

        case 'clean':
            cleanDatabase(env);
            break;

        case 'setup':
            (async () => {
                if (await testConnection(env)) {
                    await initializeSchema(env);
                    await insertSampleData(env);
                    await checkStatus(env);
                }
            })();
            break;

        case 'add-flag':
            if (args.length < 5) {
                error('Usage: node db-utils.js add-flag <sku> <type> <value> <description> [--prod]');
                process.exit(1);
            }
            addFlag(args[1], args[2], args[3], null, args[4], env);
            break;

        case 'remove-flags':
            if (args.length < 2) {
                error('Usage: node db-utils.js remove-flags <sku> [--prod]');
                process.exit(1);
            }
            removeFlags(args[1], env);
            break;

        case 'help':
        default:
            console.log(`
HNFZF Database Utilities

Usage: node db-utils.js <command> [options]

Commands:
  test              Test database connection
  init              Initialize database schema
  seed              Insert sample data
  status            Show database status
  clean             Clean database (remove all data)
  setup             Complete setup (init + seed)
  add-flag          Add flag to product
  remove-flags      Remove all flags from product
  help              Show this help

Options:
  --prod            Use production database (default: development)

Examples:
  node db-utils.js setup
  node db-utils.js add-flag 5921875 special_offer "20% Off" "Limited time offer"
  node db-utils.js status --prod
      `);
            break;
    }
}

// Export functions for use as module
module.exports = {
    createConnection,
    testConnection,
    initializeSchema,
    insertSampleData,
    checkStatus,
    cleanDatabase,
    addFlag,
    removeFlags,
};

// Run CLI if called directly
if (require.main === module) {
    main();
}
