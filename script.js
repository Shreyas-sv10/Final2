// --- EVENT LISTENER FOR WHEN THE HTML IS FULLY LOADED ---
document.addEventListener('DOMContentLoaded', () => {

    // --- INITIAL DATA (DEMO) ---
    // In a real application, this would come from a database.
    let products = [
        { id: 1, name: 'Rice', price: 60.00, weight: '1kg' },
        { id: 2, name: 'Sugar', price: 45.50, weight: '1kg' },
        { id: 3, name: 'Toor Dal', price: 120.00, weight: '1kg' },
        { id: 4, name: 'Sunflower Oil', price: 150.00, weight: '1L' },
        { id: 5, name: 'Milk', price: 30.00, weight: '500ml' },
    ];
    
    let bill = [];

    // --- DOM ELEMENT REFERENCES ---
    // We get references to all the HTML elements we need to interact with.
    const productListEl = document.getElementById('productList');
    const addItemForm = document.getElementById('addItemForm');
    const billItemsEl = document.getElementById('billItems');
    const billTotalEl = document.getElementById('billTotal');
    const generateBillBtn = document.getElementById('generateBillBtn');
    const billModal = document.getElementById('billModal');
    const modalBillDetails = document.getElementById('modalBillDetails');
    const modalTotal = document.getElementById('modalTotal');
    const closeModalBtn = document.getElementById('closeModalBtn');


    // --- CORE FUNCTIONS ---

    /**
     * Renders the list of all products in the main section.
     * It creates an HTML element for each product with fields to edit price/weight
     * and a button to add it to the bill.
     */
    function renderProducts() {
        productListEl.innerHTML = ''; // Clear the list first
        if (products.length === 0) {
            productListEl.innerHTML = `<p>No products available. Add one above!</p>`;
            return;
        }
        products.forEach(product => {
            const productDiv = document.createElement('div');
            // We'll use a simple div structure for layout. In the CSS, this could be styled with flexbox or grid.
            productDiv.style.display = 'flex';
            productDiv.style.justifyContent = 'space-between';
            productDiv.style.alignItems = 'center';
            productDiv.style.padding = '10px';
            productDiv.style.border = '1px solid #eee';
            productDiv.style.borderRadius = '8px';
            productDiv.style.marginBottom = '10px';
            
            productDiv.innerHTML = `
                <span>${product.name}</span>
                <div>
                    <span>₹</span>
                    <input type="number" value="${product.price.toFixed(2)}" data-id="${product.id}" data-field="price" style="width: 80px; padding: 5px;">
                    <input type="text" value="${product.weight}" data-id="${product.id}" data-field="weight" style="width: 80px; padding: 5px; margin-left: 10px;">
                    <button data-id="${product.id}" class="add-to-bill-btn" style="margin-left: 10px; padding: 5px 10px;">Add</button>
                </div>
            `;
            productListEl.appendChild(productDiv);
        });
    }
    
    /**
     * Renders the items currently in the bill on the right-hand side.
     */
    function renderBill() {
        billItemsEl.innerHTML = '';
        if (bill.length === 0) {
            billItemsEl.innerHTML = `<p>No items added yet.</p>`;
            generateBillBtn.disabled = true; // Disable button if bill is empty
        } else {
            bill.forEach(item => {
                const billItemDiv = document.createElement('div');
                billItemDiv.style.display = 'flex';
                billItemDiv.style.justifyContent = 'space-between';
                billItemDiv.style.padding = '5px 0';

                billItemDiv.innerHTML = `
                    <span>${item.name} (x${item.quantity})</span>
                    <span>₹${(item.quantity * item.price).toFixed(2)}</span>
                    <button data-id="${item.id}" class="remove-from-bill-btn" style="color: red; background: none; border: none; cursor: pointer;">X</button>
                `;
                billItemsEl.appendChild(billItemDiv);
            });
            generateBillBtn.disabled = false; // Enable button if bill has items
        }
        updateBillTotal();
    }

    /**
     * Calculates and updates the total amount for the current bill.
     */
    function updateBillTotal() {
        const total = bill.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        billTotalEl.textContent = `₹${total.toFixed(2)}`;
    }

    /**
     * Adds a product to the bill. If it already exists, increments the quantity.
     * @param {number} productId - The ID of the product to add.
     */
    function addToBill(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = bill.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            bill.push({ ...product, quantity: 1 });
        }
        renderBill();
    }

    /**
     * Removes an item from the bill completely.
     * @param {number} productId - The ID of the product to remove.
     */
    function removeFromBill(productId) {
        bill = bill.filter(item => item.id !== productId);
        renderBill();
    }

    /**
     * Updates a product's details (price or weight) in the main products array.
     * @param {number} productId - The ID of the product to update.
     * @param {string} field - The property to update ('price' or 'weight').
     * @param {string|number} value - The new value.
     */
    function updateProduct(productId, field, value) {
        const product = products.find(p => p.id === productId);
        if (product) {
            if (field === 'price') {
                product.price = parseFloat(value) || 0;
            } else {
                product.weight = value;
            }
            // In a real app, you would save this change to the database here.
            console.log(`Updated product ${productId}: ${field} to ${value}`);
        }
    };

    // --- EVENT LISTENERS ---

    // Listener for the "Add New Item" form submission
    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevents the page from reloading
        const name = document.getElementById('newItemName').value;
        const price = parseFloat(document.getElementById('newItemPrice').value);
        const weight = document.getElementById('newItemWeight').value;

        if (name && price > 0 && weight) {
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push({ id: newId, name, price, weight });
            renderProducts();
            addItemForm.reset();
        } else {
            alert("Please fill all fields correctly.");
        }
    });

    // Listener for clicks within the product list (for adding items or updating values)
    productListEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-bill-btn')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            addToBill(productId);
        }
    });

    productListEl.addEventListener('change', (e) => {
        if(e.target.tagName === 'INPUT'){
            const productId = parseInt(e.target.getAttribute('data-id'));
            const field = e.target.getAttribute('data-field');
            const value = e.target.value;
            updateProduct(productId, field, value);
        }
    });

    // Listener for clicks within the bill list (for removing items)
    billItemsEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-from-bill-btn')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            removeFromBill(productId);
        }
    });

    // Listener for the "Generate Bill" button
    generateBillBtn.addEventListener('click', () => {
        if (bill.length > 0) {
            modalBillDetails.innerHTML = bill.map(item => 
                `<div style="display:flex; justify-content: space-between;">
                    <span>${item.name} (x${item.quantity})</span>
                    <span>₹${(item.quantity * item.price).toFixed(2)}</span>
                </div>`
            ).join('');
            modalTotal.textContent = billTotalEl.textContent;
            billModal.classList.add('visible'); // Use CSS class to show modal
        }
    });
    
    // Listener for the "Close" button on the modal
    closeModalBtn.addEventListener('click', () => {
         billModal.classList.remove('visible');
         // Clear the bill after generating it for the next customer
         bill = [];
         renderBill();
    });


    // --- INITIAL RENDER ---
    // This is the first thing that happens when the script runs.
    renderProducts();
});
