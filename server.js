/**
 * Azure SQL Database Bulk Update Server
 * 
 * This Node.js server provides API endpoints to interact with Azure SQL Database
 * for the Bulk License Expiry Update application.
 */

const express = require('express');
const cors = require('cors');
const { Connection, Request, TYPES } = require('tedious');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Azure Key Vault for secure credential storage
const getDbConfig = async (environment) => {
    try {
        // In a production app, you would retrieve these from Azure Key Vault
        // This is a simplified example
        const envConfigs = {
            dev: {
                server: process.env.DEV_DB_SERVER || 'your-dev-server.database.windows.net',
                database: process.env.DEV_DB_NAME || 'your-dev-database',
            },
            test: {
                server: process.env.TEST_DB_SERVER || 'your-test-server.database.windows.net',
                database: process.env.TEST_DB_NAME || 'your-test-database',
            },
            prod: {
                server: process.env.PROD_DB_SERVER || 'your-prod-server.database.windows.net',
                database: process.env.PROD_DB_NAME || 'your-prod-database',
            }
        };

        return envConfigs[environment] || envConfigs.dev;
    } catch (error) {
        console.error('Error retrieving database configuration:', error);
        throw error;
    }
};

// Create a connection to Azure SQL Database using Azure AD authentication
const createConnection = async (environment) => {
    try {
        const dbConfig = await getDbConfig(environment);
        
        // Use DefaultAzureCredential for authentication (requires proper setup)
        const credential = new DefaultAzureCredential();
        
        const connectionConfig = {
            server: dbConfig.server,
            authentication: {
                type: 'azure-active-directory-msi-app-service',
                options: {
                    clientId: process.env.AZURE_CLIENT_ID
                }
            },
            options: {
                database: dbConfig.database,
                encrypt: true,
                trustServerCertificate: false,
                connectTimeout: 30000,
                requestTimeout: 30000,
                rowCollectionOnRequestCompletion: true
            }
        };

        const connection = new Connection(connectionConfig);
        
        return new Promise((resolve, reject) => {
            connection.on('connect', (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(connection);
                }
            });
            
            connection.connect();
        });
    } catch (error) {
        console.error('Error creating database connection:', error);
        throw error;
    }
};

// API endpoint to fetch order information
app.post('/api/orders/preview', async (req, res) => {
    const { orderNumbers, environment } = req.body;
    
    if (!orderNumbers || !Array.isArray(orderNumbers) || orderNumbers.length === 0) {
        return res.status(400).json({ error: 'Invalid order numbers provided' });
    }
    
    let connection;
    try {
        // Get database connection
        connection = await createConnection(environment);
        
        // Create parameterized query with table value parameter
        const orderResults = [];
        
        // Process each order number with a parameterized query
        for (const orderNumber of orderNumbers) {
            try {
                const result = await new Promise((resolve, reject) => {
                    // Using parameterized query to prevent SQL injection
                    const query = `
                        SELECT order_number, expiry_date
                        FROM licenses
                        WHERE order_number = @orderNumber
                    `;
                    
                    const request = new Request(query, (err, rowCount, rows) => {
                        if (err) {
                            reject(err);
                        } else {
                            // Format results
                            const orderInfo = rows.length > 0 ? {
                                orderNumber: rows[0][0].value,
                                expiryDate: rows[0][1].value ? new Date(rows[0][1].value).toISOString().split('T')[0] : null
                            } : {
                                orderNumber: orderNumber,
                                expiryDate: null
                            };
                            
                            resolve(orderInfo);
                        }
                    });
                    
                    // Add parameter
                    request.addParameter('orderNumber', TYPES.NVarChar, orderNumber);
                    
                    connection.execSql(request);
                });
                
                orderResults.push(result);
            } catch (error) {
                console.error(`Error fetching order ${orderNumber}:`, error);
                // Include the order in the results even if there was an error
                orderResults.push({
                    orderNumber,
                    expiryDate: null,
                    error: 'Failed to retrieve order information'
                });
            }
        }
        
        res.json({ orders: orderResults });
    } catch (error) {
        console.error('Error in preview endpoint:', error);
        res.status(500).json({ error: 'Failed to retrieve order information' });
    } finally {
        if (connection) {
            connection.close();
        }
    }
});

// API endpoint to update license expiry dates
app.post('/api/orders/update', async (req, res) => {
    const { orderNumbers, expiryDate, comments, environment } = req.body;
    
    if (!orderNumbers || !Array.isArray(orderNumbers) || orderNumbers.length === 0) {
        return res.status(400).json({ error: 'Invalid order numbers provided' });
    }
    
    if (!expiryDate) {
        return res.status(400).json({ error: 'Expiry date is required' });
    }
    
    if (!comments) {
        return res.status(400).json({ error: 'Comments are required for audit trail' });
    }
    
    let connection;
    try {
        // Get database connection
        connection = await createConnection(environment);
        
        // Process each order update
        const results = [];
        
        for (const orderNumber of orderNumbers) {
            try {
                // Get current user from Azure AD (simplified)
                const currentUser = 'current-user@example.com'; // In a real app, get from authentication context
                
                // Execute the update with parameterized query
                const result = await new Promise((resolve, reject) => {
                    const query = `
                        UPDATE licenses 
                        SET expiry_date = @expiryDate, 
                            comment = @comment, 
                            last_updated = CURRENT_TIMESTAMP,
                            updated_by = @updatedBy
                        WHERE order_number = @orderNumber
                    `;
                    
                    const request = new Request(query, (err, rowCount) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ rowCount });
                        }
                    });
                    
                    // Add parameters
                    request.addParameter('expiryDate', TYPES.Date, new Date(expiryDate));
                    request.addParameter('comment', TYPES.NVarChar, comments);
                    request.addParameter('updatedBy', TYPES.NVarChar, currentUser);
                    request.addParameter('orderNumber', TYPES.NVarChar, orderNumber);
                    
                    connection.execSql(request);
                });
                
                results.push({
                    orderNumber,
                    success: result.rowCount > 0,
                    message: result.rowCount > 0 ? 'Success' : 'No matching order found'
                });
            } catch (error) {
                console.error(`Error updating order ${orderNumber}:`, error);
                results.push({
                    orderNumber,
                    success: false,
                    message: 'Failed to update'
                });
            }
        }
        
        res.json({ results });
    } catch (error) {
        console.error('Error in update endpoint:', error);
        res.status(500).json({ error: 'Failed to update license expiry dates' });
    } finally {
        if (connection) {
            connection.close();
        }
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Open http://localhost:${port} in your browser`);
});
