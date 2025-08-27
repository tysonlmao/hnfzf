#!/usr/bin/env node

/**
 * Validation script for HNFZF development setup
 * Checks that database and API are working correctly
 */

const axios = require('axios');
const { testConnection, checkStatus } = require('./db-utils');

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
    log(`❌ ${message}`, 'red');
}

function success(message) {
    log(`✅ ${message}`, 'green');
}

function info(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

// Test database connection
async function testDatabase() {
    try {
        info('Testing database connection...');
        const isConnected = await testConnection('development');
        if (isConnected) {
            success('Database connection successful');
            return true;
        } else {
            error('Database connection failed');
            return false;
        }
    } catch (err) {
        error(`Database test failed: ${err.message}`);
        return false;
    }
}

// Test API server
async function testAPI() {
    try {
        info('Testing API server...');
        const response = await axios.get('http://localhost:1337/health', { timeout: 5000 });

        if (response.status === 200) {
            success('API server is running');
            info(`API response: ${JSON.stringify(response.data, null, 2)}`);
            return true;
        } else {
            error(`API server returned status: ${response.status}`);
            return false;
        }
    } catch (err) {
        error(`API server test failed: ${err.message}`);
        warning('Make sure the backend server is running with: npm run dev:server');
        return false;
    }
}

// Test product API with sample data
async function testProductAPI() {
    try {
        info('Testing product API with sample SKU...');
        const response = await axios.get('http://localhost:1337/api/product/5921875', { timeout: 10000 });

        if (response.status === 200 && response.data) {
            success('Product API is working');

            const products = Array.isArray(response.data) ? response.data : [response.data];

            // Check if any products have flags
            const flaggedProducts = products.filter(p => p.hasFlags);

            if (flaggedProducts.length > 0) {
                success(`Found ${flaggedProducts.length} products with flags`);
                flaggedProducts.forEach((product, index) => {
                    info(`Product ${index + 1}: ${product.productName || product.productID}`);
                    if (product.flags) {
                        product.flags.forEach(flag => {
                            log(`  - Flag: ${flag.flagType} = ${flag.flagValue || flag.description}`);
                        });
                    }
                });
            } else {
                warning('No flagged products found - flags system may not be working');
            }

            return true;
        } else {
            error('Product API returned invalid response');
            return false;
        }
    } catch (err) {
        error(`Product API test failed: ${err.message}`);
        return false;
    }
}

// Test flag management API
async function testFlagAPI() {
    try {
        info('Testing flag management API...');

        // Test getting flags for a product
        const response = await axios.get('http://localhost:1337/api/product/5921875/flags', { timeout: 5000 });

        if (response.status === 200) {
            success('Flag API is working');

            if (response.data && response.data.length > 0) {
                success(`Found ${response.data.length} flags for product 5921875`);
                response.data.forEach(flag => {
                    log(`  - ${flag.flagType}: ${flag.flagValue || flag.description}`);
                });
            } else {
                warning('No flags found for product 5921875 - sample data may not be loaded');
            }

            return true;
        } else {
            error(`Flag API returned status: ${response.status}`);
            return false;
        }
    } catch (err) {
        error(`Flag API test failed: ${err.message}`);
        return false;
    }
}

// Main validation function
async function validateSetup() {
    console.log('\n🔍 HNFZF Development Setup Validation\n');

    const results = {
        database: false,
        api: false,
        productAPI: false,
        flagAPI: false,
    };

    // Test database
    results.database = await testDatabase();
    console.log('');

    // Test API server
    results.api = await testAPI();
    console.log('');

    // Test product API (only if API server is working)
    if (results.api) {
        results.productAPI = await testProductAPI();
        console.log('');

        // Test flag API (only if product API is working)
        if (results.productAPI) {
            results.flagAPI = await testFlagAPI();
            console.log('');
        }
    }

    // Show database status
    if (results.database) {
        info('Database status:');
        await checkStatus('development');
        console.log('');
    }

    // Summary
    console.log('📊 Validation Summary:');
    console.log('');

    Object.entries(results).forEach(([test, passed]) => {
        if (passed) {
            success(`${test}: PASSED`);
        } else {
            error(`${test}: FAILED`);
        }
    });

    console.log('');

    const allPassed = Object.values(results).every(result => result);

    if (allPassed) {
        success('🎉 All tests passed! Your development environment is ready.');
    } else {
        error('❌ Some tests failed. Please check the issues above.');
        console.log('');
        console.log('💡 Troubleshooting tips:');

        if (!results.database) {
            warning('Database issue: Run `npm run db:setup` to set up the database');
        }

        if (!results.api) {
            warning('API issue: Run `npm run dev:server` to start the backend server');
        }

        if (!results.productAPI) {
            warning('Product API issue: Check if the ingest service is working');
        }

        if (!results.flagAPI) {
            warning('Flag API issue: Run `npm run db:seed` to ensure sample data is loaded');
        }
    }

    return allPassed;
}

// Export for use as module
module.exports = { validateSetup };

// Run validation if called directly
if (require.main === module) {
    validateSetup()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(err => {
            error(`Validation failed: ${err.message}`);
            process.exit(1);
        });
}
