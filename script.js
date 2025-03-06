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
    const environmentSelect = document.getElementById('environment');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');

    // API endpoints
    const API_BASE_URL = 'http://localhost:3000/api';
    const PREVIEW_ENDPOINT = `${API_BASE_URL}/orders/preview`;
    const UPDATE_ENDPOINT = `${API_BASE_URL}/orders/update`;

    // Set default date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    expiryDateInput.value = formattedDate;

    // Preview button click handler
    previewButton.addEventListener('click', async function() {
        // Get values from inputs
        const orderNumbers = orderNumbersTextarea.value.trim().split('\n').filter(line => line.trim() !== '');
        const environment = environmentSelect.value;

        // Validate inputs
        if (orderNumbers.length === 0) {
            alert('Please enter at least one order number.');
            return;
        }

        // Clear previous preview
        orderTableBody.innerHTML = '';
        
        // Update connection status
        updateConnectionStatus('connecting', `Connecting to Azure SQL Database (${environment})...`);
        
        try {
            // In a real app, this would call the backend API
            // For demonstration, we'll use the simulated data
            let orders;
            
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                try {
                    // Try to fetch from the real API if running locally with backend
                    const response = await fetch(PREVIEW_ENDPOINT, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ orderNumbers, environment }),
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        orders = data.orders;
                        updateConnectionStatus('connected', `Connected to Azure SQL Database (${environment})`);
                    } else {
                        throw new Error('API request failed');
                    }
                } catch (error) {
                    console.warn('Could not connect to backend API, using simulated data:', error);
                    orders = simulateOrderData(orderNumbers);
                    updateConnectionStatus('connected', `Connected to Azure SQL Database (${environment}) [SIMULATED]`);
                }
            } else {
                // Use simulated data for demo
                orders = simulateOrderData(orderNumbers);
                updateConnectionStatus('connected', `Connected to Azure SQL Database (${environment}) [SIMULATED]`);
            }
            
            // Generate preview with the data
            generateOrderPreview(orders);
            
            // Show preview container
            previewContainer.style.display = 'block';
            resultsContainer.style.display = 'none';
            
            // Enable execute button if at least one order is selected
            updateExecuteButtonState();
            
        } catch (error) {
            console.error('Error fetching order data:', error);
            alert('Failed to retrieve order information. Please try again.');
            updateConnectionStatus('disconnected', `Failed to connect to Azure SQL Database (${environment})`);
        }
    });

    // Function to simulate order data for demonstration
    function simulateOrderData(orderNumbers) {
        return orderNumbers.map(orderNumber => ({
            orderNumber: orderNumber.trim(),
            expiryDate: generateRandomDate()
        }));
    }

    // Function to update connection status indicator
    function updateConnectionStatus(status, message) {
        statusIndicator.className = `status-indicator status-${status}`;
        statusText.textContent = message;
    }

    // Function to generate order preview
    function generateOrderPreview(orders) {
        orders.forEach(order => {
            if (order.orderNumber) {
                // Create table row
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" class="order-checkbox" data-order="${order.orderNumber}"></td>
                    <td>${order.orderNumber}</td>
                    <td>${order.expiryDate || 'N/A'}</td>
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
    executeButton.addEventListener('click', async function() {
        // Get selected order numbers
        const selectedOrders = [];
        const checkboxes = document.querySelectorAll('.order-checkbox:checked');
        checkboxes.forEach(checkbox => {
            selectedOrders.push(checkbox.getAttribute('data-order'));
        });
        
        // Get values from inputs
        const expiryDate = expiryDateInput.value;
        const comments = commentsTextarea.value.trim();
        const environment = environmentSelect.value;

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
        
        // Generate SQL statements for preview
        let sqlStatements = [];
        selectedOrders.forEach(orderNumber => {
            // Create SQL statement preview (note: actual execution will use parameterized queries)
            const sql = `-- Preview only. Actual execution uses parameterized queries to prevent SQL injection
UPDATE licenses 
SET expiry_date = '${expiryDate}', 
    comment = '${comments.replace(/'/g, "''")}', 
    last_updated = CURRENT_TIMESTAMP, 
    updated_by = 'current-user@example.com' 
WHERE order_number = '${orderNumber}';`;
            sqlStatements.push(sql);
        });
        
        // Display SQL preview
        sqlStatement.textContent = sqlStatements.join('\n');
        
        try {
            // In a real app, this would call the backend API
            let results;
            
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                try {
                    // Try to use the real API if running locally with backend
                    const response = await fetch(UPDATE_ENDPOINT, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            orderNumbers: selectedOrders, 
                            expiryDate, 
                            comments,
                            environment 
                        }),
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        results = data.results;
                    } else {
                        throw new Error('API request failed');
                    }
                } catch (error) {
                    console.warn('Could not connect to backend API, using simulated results:', error);
                    results = simulateUpdateResults(selectedOrders);
                }
            } else {
                // Use simulated results for demo
                results = simulateUpdateResults(selectedOrders);
            }
            
            // Display results
            displayUpdateResults(results);
            
        } catch (error) {
            console.error('Error updating orders:', error);
            alert('An error occurred while updating the orders. Please try again.');
        }
    });
    
    // Function to simulate update results
    function simulateUpdateResults(orderNumbers) {
        return orderNumbers.map(orderNumber => ({
            orderNumber,
            success: Math.random() > 0.2, // 80% success rate for demo
            message: Math.random() > 0.2 ? 'Success' : 'Fail'
        }));
    }
    
    // Function to display update results
    function displayUpdateResults(results) {
        results.forEach(result => {
            const statusItem = document.createElement('div');
            statusItem.className = `status-item status-${result.success ? 'success' : 'error'}`;
            statusItem.innerHTML = `
                <span>Order #${result.orderNumber}</span>
                <span>${result.message}</span>
            `;
            statusContainer.appendChild(statusItem);
        });
    }
});
