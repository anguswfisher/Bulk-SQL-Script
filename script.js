document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const orderNumbersTextarea = document.getElementById('orderNumbers');
    const expiryDateInput = document.getElementById('expiryDate');
    const commentsTextarea = document.getElementById('comments');
    const previewButton = document.getElementById('previewButton');
    const executeButton = document.getElementById('executeButton');
    const statusContainer = document.getElementById('statusContainer');
    const sqlStatement = document.getElementById('sqlStatement');
    const previewContainer = document.getElementById('previewContainer');
    const resultsContainer = document.getElementById('resultsContainer');
    const orderTableBody = document.getElementById('orderTableBody');
    const selectAllCheckbox = document.getElementById('selectAll');
    const selectAllButton = document.getElementById('selectAllButton');
    const deselectAllButton = document.getElementById('deselectAllButton');

    // Set default date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    expiryDateInput.value = formattedDate;

    // Preview button click handler
    previewButton.addEventListener('click', function() {
        // Get values from inputs
        const orderNumbers = orderNumbersTextarea.value.trim().split('\n').filter(line => line.trim() !== '');

        // Validate inputs
        if (orderNumbers.length === 0) {
            alert('Please enter at least one order number.');
            return;
        }

        // Clear previous preview
        orderTableBody.innerHTML = '';
        
        // Generate preview data
        generateOrderPreview(orderNumbers);
        
        // Show preview container
        previewContainer.style.display = 'block';
        resultsContainer.style.display = 'none';
        
        // Enable execute button if at least one order is selected
        updateExecuteButtonState();
    });

    // Function to generate order preview
    function generateOrderPreview(orderNumbers) {
        orderNumbers.forEach(orderNumber => {
            const trimmedOrderNumber = orderNumber.trim();
            if (trimmedOrderNumber) {
                // Create a random expiry date for demonstration (in a real app, this would come from the database)
                const randomDate = generateRandomDate();
                
                // Create table row
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" class="order-checkbox" data-order="${trimmedOrderNumber}"></td>
                    <td>${trimmedOrderNumber}</td>
                    <td>${randomDate}</td>
                `;
                orderTableBody.appendChild(row);
                
                // Add click event to the row for selection
                row.addEventListener('click', function(e) {
                    if (e.target.type !== 'checkbox') {
                        const checkbox = row.querySelector('.order-checkbox');
                        checkbox.checked = !checkbox.checked;
                        updateRowSelection(row, checkbox.checked);
                        updateExecuteButtonState();
                    }
                });
                
                // Add change event to the checkbox
                const checkbox = row.querySelector('.order-checkbox');
                checkbox.addEventListener('change', function() {
                    updateRowSelection(row, this.checked);
                    updateExecuteButtonState();
                });
            }
        });
    }
    
    // Function to generate a random date for demonstration
    function generateRandomDate() {
        const start = new Date(2024, 0, 1);
        const end = new Date(2026, 11, 31);
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return randomDate.toISOString().split('T')[0];
    }
    
    // Function to update row selection styling
    function updateRowSelection(row, isSelected) {
        if (isSelected) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    }
    
    // Function to update execute button state
    function updateExecuteButtonState() {
        const checkedBoxes = document.querySelectorAll('.order-checkbox:checked');
        executeButton.disabled = checkedBoxes.length === 0;
    }
    
    // Select All checkbox handler
    selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.order-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
            updateRowSelection(checkbox.closest('tr'), this.checked);
        });
        updateExecuteButtonState();
    });
    
    // Select All button handler
    selectAllButton.addEventListener('click', function() {
        const checkboxes = document.querySelectorAll('.order-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            updateRowSelection(checkbox.closest('tr'), true);
        });
        selectAllCheckbox.checked = true;
        updateExecuteButtonState();
    });
    
    // Deselect All button handler
    deselectAllButton.addEventListener('click', function() {
        const checkboxes = document.querySelectorAll('.order-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            updateRowSelection(checkbox.closest('tr'), false);
        });
        selectAllCheckbox.checked = false;
        updateExecuteButtonState();
    });

    // Execute button click handler
    executeButton.addEventListener('click', function() {
        // Get selected order numbers
        const selectedOrders = [];
        const checkboxes = document.querySelectorAll('.order-checkbox:checked');
        checkboxes.forEach(checkbox => {
            selectedOrders.push(checkbox.getAttribute('data-order'));
        });
        
        // Get values from inputs
        const expiryDate = expiryDateInput.value;
        const comments = commentsTextarea.value.trim();

        // Validate inputs
        if (selectedOrders.length === 0) {
            alert('Please select at least one order.');
            return;
        }

        if (!expiryDate) {
            alert('Please select an expiry date.');
            return;
        }

        if (!comments) {
            alert('Please enter a comment for the audit trail.');
            return;
        }

        // Clear previous results
        statusContainer.innerHTML = '';
        
        // Show results container
        resultsContainer.style.display = 'block';
        
        // Generate SQL statements and display results
        generateSqlAndDisplayResults(selectedOrders, expiryDate, comments);
    });

    // Function to generate SQL and display results
    function generateSqlAndDisplayResults(orderNumbers, expiryDate, comments) {
        // Format date for SQL (YYYY-MM-DD)
        const formattedDate = expiryDate;
        
        // Generate SQL statements
        let sqlStatements = [];
        
        orderNumbers.forEach(orderNumber => {
            const trimmedOrderNumber = orderNumber.trim();
            if (trimmedOrderNumber) {
                // Escape single quotes in comments for SQL
                const escapedComments = comments.replace(/'/g, "''");
                
                // Update SQL to include comment column
                const sql = `UPDATE licenses SET expiry_date = '${formattedDate}', comment = '${escapedComments}', last_updated = CURRENT_TIMESTAMP WHERE order_number = '${trimmedOrderNumber}';`;
                sqlStatements.push(sql);
                
                // Create status item
                const statusItem = document.createElement('div');
                statusItem.className = 'status-item status-pending';
                statusItem.innerHTML = `
                    <span>Order #${trimmedOrderNumber}</span>
                    <span>Pending...</span>
                `;
                statusContainer.appendChild(statusItem);
                
                // Simulate SQL execution (in a real app, this would be an actual database call)
                setTimeout(() => {
                    // Randomly succeed or fail for demonstration purposes
                    const success = Math.random() > 0.2; // 80% success rate for demo
                    
                    if (success) {
                        statusItem.className = 'status-item status-success';
                        statusItem.innerHTML = `
                            <span>Order #${trimmedOrderNumber}</span>
                            <span>Success</span>
                        `;
                    } else {
                        statusItem.className = 'status-item status-error';
                        statusItem.innerHTML = `
                            <span>Order #${trimmedOrderNumber}</span>
                            <span>Fail</span>
                        `;
                    }
                }, 500 + Math.random() * 1000); // Random delay for demonstration
            }
        });
        
        // Display SQL preview
        sqlStatement.textContent = sqlStatements.join('\n');
    }
});
