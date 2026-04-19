// Premium ABD Sports Dashboard Logic
// Clean, fast, business-focused - no bloat, realistic functionality

// Sample data (realistic placeholders - backend CRUD next phase)
const PRODUCTS_DATA = [
    { id: 1, name: 'Pro Running Shoes Elite', category: 'Footwear', price: '$129.99', stock: 24, status: 'In Stock' },
    { id: 2, name: 'Performance Track Jacket', category: 'Apparel', price: '$89.99', stock: 12, status: 'Low Stock' },
    { id: 3, name: 'Carbon Fiber Training Poles', category: 'Equipment', price: '$199.99', stock: 8, status: 'In Stock' },
    { id: 4, name: 'Elite Gym Bag Pro', category: 'Accessories', price: '$69.99', stock: 18, status: 'In Stock' },
    { id: 5, name: 'Speed Training Bands Set', category: 'Training', price: '$49.99', stock: 32, status: 'In Stock' },
    { id: 6, name: 'Pro Football Cleats', category: 'Footwear', price: '$149.99', stock: 6, status: 'Low Stock' },
    { id: 7, name: 'Weighted Training Vest', category: 'Training', price: '$79.99', stock: 14, status: 'In Stock' },
    { id: 8, name: 'Premium Yoga Mat Pro', category: 'Equipment', price: '$39.99', stock: 28, status: 'In Stock' },
    { id: 9, name: 'Athletic Compression Socks', category: 'Apparel', price: '$24.99', stock: 42, status: 'In Stock' },
    { id: 10, name: 'Custom Team Water Bottles', category: 'Accessories', price: '$19.99', stock: 56, status: 'In Stock' },
    { id: 11, name: 'Heavy Duty Jump Rope', category: 'Training', price: '$29.99', stock: 36, status: 'In Stock' },
    { id: 12, name: 'Pro Speed Agility Ladder', category: 'Equipment', price: '$44.99', stock: 22, status: 'In Stock' }
];

const ENQUIRIES_DATA = [
    { id: 1, customer: 'Rahul Sharma', phone: '+91 98765 43210', interest: 'Bulk Running Shoes', status: 'Pending', date: '2024-01-15' },
    { id: 2, customer: 'Priya Patel', phone: '+91 87654 32109', interest: 'Custom Team Jerseys', status: 'Contacted', date: '2024-01-16' },
    { id: 3, customer: 'Vikram Singh', phone: '+91 76543 21098', interest: 'Gym Equipment Package', status: 'Pending', date: '2024-01-17' }
];

const STATS_DATA = {
    totalProducts: 12,
    pendingEnquiries: 3,
    bulkOrders: 7,
    monthlyRevenue: 28400
};

// DOM ready
document.addEventListener('DOMContentLoaded', initDashboard);

function initDashboard() {
    setupNavigation();
    setupStats();
    renderProductsTable();
    renderEnquiriesTable();
    setupModals();
    setupLogout();
}

function setupNavigation() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            document.body.classList.toggle('sidebar-collapsed');
        });
    }

    // Nav links (smooth scroll + active state)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
            // Set active
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function setupStats() {
    document.getElementById('totalProducts').textContent = STATS_DATA.totalProducts;
    document.getElementById('pendingEnquiries').textContent = STATS_DATA.pendingEnquiries;
    document.getElementById('bulkOrders').textContent = STATS_DATA.bulkOrders;
    document.getElementById('monthlyRevenue').textContent = `$${STATS_DATA.monthlyRevenue.toLocaleString()}`;
}

function renderProductsTable() {
    const tbody = document.querySelector('#productsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = PRODUCTS_DATA.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price}</td>
            <td class="stock-${product.status.toLowerCase().replace(' ', '-')}">${product.stock}</td>
            <td>
                <button class="btn-small btn-edit" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn-small btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function renderEnquiriesTable() {
    const tbody = document.querySelector('#enquiriesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = ENQUIRIES_DATA.map(enquiry => `
        <tr>
            <td>${enquiry.customer}</td>
            <td>${enquiry.phone}</td>
            <td>${enquiry.interest}</td>
            <td><span class="status-${enquiry.status.toLowerCase()}">${enquiry.status}</span></td>
            <td>${enquiry.date}</td>
            <td>
                <button class="btn-small btn-edit" onclick="updateEnquiryStatus(${enquiry.id})">Update</button>
            </td>
        </tr>
    `).join('');
}

function setupModals() {
    // Add Product Modal
    document.getElementById('addProductBtn')?.addEventListener('click', () => {
        document.getElementById('addProductModal').classList.add('active');
    });

    // Close modals
    document.querySelectorAll('.modal .close, .modal-overlay').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.classList.contains('close') || e.target.classList.contains('modal-overlay')) {
                document.querySelectorAll('.modal.active').forEach(modal => modal.classList.remove('active'));
            }
        });
    });

    // Form handlers
    document.getElementById('addProductForm')?.addEventListener('submit', addProduct);
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = 'login.html';
            }
        });
    }
}

// Product Management
function addProduct(e) {
    e.preventDefault();
    // Simulate add (backend next)
    alert('Product added successfully! (Backend CRUD coming in Phase 3)');
    document.getElementById('addProductModal').classList.remove('active');
    document.getElementById('addProductForm').reset();
}

function editProduct(id) {
    alert(`Edit Product ID: ${id} (Full edit form in Phase 3)`);
}

function deleteProduct(id) {
    if (confirm(`Delete Product ID: ${id}?`)) {
        alert('Product deleted! (Backend persistence next)');
    }
}

// Enquiry Management
function updateEnquiryStatus(id) {
    alert(`Update Status for Enquiry ${id} (Full workflow in Phase 3)`);
}

// Export for global access (table buttons)
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.updateEnquiryStatus = updateEnquiryStatus;

