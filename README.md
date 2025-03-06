# Bulk License Expiry Update Tool - Azure Edition

A web application that allows you to update license expiry dates for multiple order numbers at once, integrated with Azure SQL Database.

## Features

- Input multiple order numbers (one per line)
- Preview order information before making changes
- Select specific orders to update (single or multi-select)
- Set a new expiry date for selected orders
- Add required comments for audit trail purposes
- View SQL statements that would be executed
- See status updates for each order number
- Integration with Azure SQL Database
- Support for multiple environments (Development, Test, Production)

## Prerequisites

- Node.js 14.x or higher
- Azure SQL Database
- Azure Active Directory for authentication

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure the `.env` file with your Azure SQL Database connection details:
   ```
   # Development Environment
   DEV_DB_SERVER=your-dev-server.database.windows.net
   DEV_DB_NAME=your-dev-database

   # Test Environment
   TEST_DB_SERVER=your-test-server.database.windows.net
   TEST_DB_NAME=your-test-database

   # Production Environment
   PROD_DB_SERVER=your-prod-server.database.windows.net
   PROD_DB_NAME=your-prod-database

   # Azure AD Authentication
   AZURE_CLIENT_ID=your-azure-client-id
   ```
4. Update the `azure-config.js` file with your specific configuration if needed

## Running the Application

### Local Development

1. Start the backend server:
   ```
   npm start
   ```
2. Open `http://localhost:3000` in your web browser

### Azure Deployment

To deploy this application to Azure:

1. Create an Azure App Service
2. Deploy the code to the App Service
3. Configure the App Service settings with the same environment variables as in the `.env` file
4. Set up Azure AD authentication for the App Service
5. Configure CORS settings if needed

## How to Use

1. Open the application in your web browser
2. Select the database environment (Development, Test, Production)
3. Enter order numbers in the text area (one per line)
4. Click "Preview Orders" to see current license information
5. Select the orders you want to update (using checkboxes)
6. Select the new expiry date
7. Enter a comment explaining the reason for the update (required for audit trail)
8. Click "Execute Script for Selected Orders" to process the updates
9. View the results and SQL statements

## Azure SQL Database Schema

The application assumes an Azure SQL Database schema with the following columns:
- `order_number`: The unique identifier for each order
- `expiry_date`: The license expiry date
- `comment`: Comments explaining why the update was made (for audit purposes)
- `last_updated`: Timestamp of when the record was last updated
- `updated_by`: The user who made the update

## Security Considerations

- The application uses Azure Active Directory for authentication
- Sensitive connection information is stored in environment variables
- SQL parameters are properly escaped to prevent SQL injection
- In a production environment, consider implementing additional security measures:
  - Use Azure Key Vault for storing secrets
  - Implement role-based access control
  - Enable SSL/TLS for all connections
  - Set up audit logging for all database operations

## Customization

You can modify the SQL statement format in the `script.js` file to match your specific database schema. The backend API endpoints in `server.js` can also be customized to fit your specific requirements.
