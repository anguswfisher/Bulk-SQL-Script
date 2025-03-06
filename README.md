# Bulk License Expiry Update Tool

A simple web application that allows you to update license expiry dates for multiple order numbers at once.

## Features

- Input multiple order numbers (one per line)
- Preview order information before making changes
- Select specific orders to update (single or multi-select)
- Set a new expiry date for selected orders
- Add required comments for audit trail purposes
- View SQL statements that would be executed
- See status updates for each order number

## How to Use

1. Open `index.html` in your web browser
2. Enter order numbers in the text area (one per line)
3. Click "Preview Orders" to see current license information
4. Select the orders you want to update (using checkboxes)
5. Select the new expiry date
6. Enter a comment explaining the reason for the update (required for audit trail)
7. Click "Execute Script for Selected Orders" to process the updates
8. View the results and SQL statements

## Implementation Notes

This is a frontend demonstration that simulates database updates. In a production environment, you would need to:

1. Implement a backend service (e.g., Node.js, PHP, Python) to handle the actual database connections
2. Add proper error handling and validation
3. Implement authentication and authorization
4. Add logging and audit trails for all updates

## Database Schema

The application assumes a database schema with the following columns:
- `order_number`: The unique identifier for each order
- `expiry_date`: The license expiry date
- `comment`: Comments explaining why the update was made (for audit purposes)
- `last_updated`: Timestamp of when the record was last updated

## Customization

You can modify the SQL statement format in the `script.js` file to match your specific database schema.
