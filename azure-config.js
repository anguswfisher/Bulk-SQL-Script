/**
 * Azure SQL Database Configuration
 * 
 * This file contains configuration settings for connecting to Azure SQL Database.
 * In a production environment, these values should be stored securely and not exposed in client-side code.
 * This is a simplified example for demonstration purposes.
 */

const AzureConfig = {
    // Connection configurations for different environments
    environments: {
        dev: {
            server: 'your-dev-server.database.windows.net',
            database: 'your-dev-database',
            // Authentication settings would be handled securely in a real application
            authentication: {
                type: 'azure-active-directory',
                // In a real app, tokens would be obtained securely through proper authentication flows
            }
        },
        test: {
            server: 'your-test-server.database.windows.net',
            database: 'your-test-database',
            authentication: {
                type: 'azure-active-directory',
            }
        },
        prod: {
            server: 'your-prod-server.database.windows.net',
            database: 'your-prod-database',
            authentication: {
                type: 'azure-active-directory',
            }
        }
    },

    // Table and column names
    schema: {
        licenseTable: 'licenses',
        columns: {
            orderNumber: 'order_number',
            expiryDate: 'expiry_date',
            comment: 'comment',
            lastUpdated: 'last_updated',
            updatedBy: 'updated_by'
        }
    }
};

// Initialize connection status indicator
document.addEventListener('DOMContentLoaded', function() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const environmentSelect = document.getElementById('environment');
    
    // Update connection status based on selected environment
    function updateConnectionStatus() {
        const selectedEnv = environmentSelect.value;
        
        // In a real application, this would check the actual connection status
        statusIndicator.className = 'status-indicator status-disconnected';
        statusText.textContent = `Not connected to Azure SQL Database (${selectedEnv})`;
        
        // Simulate connection attempt when environment changes
        statusIndicator.className = 'status-indicator status-connecting';
        statusText.textContent = `Connecting to Azure SQL Database (${selectedEnv})...`;
        
        setTimeout(() => {
            // This would be a real connection check in a production app
            if (Math.random() > 0.3) { // 70% chance of successful connection for demo
                statusIndicator.className = 'status-indicator status-connected';
                statusText.textContent = `Connected to Azure SQL Database (${selectedEnv})`;
            } else {
                statusIndicator.className = 'status-indicator status-disconnected';
                statusText.textContent = `Failed to connect to Azure SQL Database (${selectedEnv})`;
            }
        }, 1500);
    }
    
    // Update status when environment changes
    environmentSelect.addEventListener('change', updateConnectionStatus);
    
    // Initial status update
    updateConnectionStatus();
});
