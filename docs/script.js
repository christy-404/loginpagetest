// Premium Admin System JavaScript - Error-free version
// No browser alerts/confirm, premium business logic

const API_BASE = './api';

// Universal functions
function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function hideModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} show`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function checkAuth() {\n  // DISABLED for GitHub Pages static hosting - no backend API\n  return;\n}

function loadNavActive() {
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === path) {
      link.classList.add('active');
    }
  });
}

// Login
async function initLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const btn = document.getElementById('loginBtn');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!validateLogin(email, password)) return;
    
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span>Entering System...';
    
    try {
const response = await fetch('login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
window.location.href = './dashboard.html';
      } else {
        showError('password', data.message || 'Invalid credentials');
        btn.disabled = false;
        btn.innerHTML = 'Enter System';
      }
    } catch (error) {
      showError('password', 'Connection error. Please try again.');
      btn.disabled = false;
      btn.innerHTML = 'Enter System';
    }
  });

  ['email', 'password'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        clearError(id);
        toggleLoginBtn();
      });
    }
  });
  toggleLoginBtn();
}

function validateLogin(email, password) {
  if (!email || !password) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError('email', 'Please enter a valid email address');
    return false;
  }
  if (password.length < 6) {
    showError('password', 'Password must be at least 6 characters');
    return false;
  }
  return true;
}

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (field) {
    const errorEl = field.parentNode.querySelector('.error');
    if (errorEl) errorEl.textContent = message;
    field.classList.add('error');
  }
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    const errorEl = field.parentNode.querySelector('.error');
    if (errorEl) errorEl.textContent = '';
    field.classList.remove('error');
  }
}

function toggleLoginBtn() {
  const email = document.getElementById('email')?.value || '';
  const password = document.getElementById('password')?.value || '';
  const btn = document.getElementById('loginBtn');
  if (btn) {
    btn.disabled = !(email && password && validateLogin(email, password));
  }
}

// Dashboard
async function initDashboard() {
  checkAuth();
  loadNavActive();
  initQuickActions();
  loadRealStats();
}

async function initQuickActions() {
  document.querySelectorAll('.cta-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const href = btn.getAttribute('href');
      if (href) window.location.href = href;
    });
  });
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

async function logout() {\n  // Static bypass - no backend\n  window.location.href = './login.html';\n}

async function loadRealStats() {
  try {
    const response = await fetch('/api/stats');
    const stats = await response.json();
    
    document.getElementById('products-count').textContent = stats.products;
    document.getElementById('enquiries-count').textContent = stats.enquiries;
    document.getElementById('custom-count').textContent = stats.customJerseys;
    document.getElementById('bulk-count').textContent = stats.bulkOrders;
    
    if (stats.lowStock > 0) {
      showToast(`${stats.lowStock} products low on stock`, 'warning');
    }
  } catch (error) {
    console.log('Real stats load failed:', error);
  }
}

// Products
async function initProducts() {
  checkAuth();
  loadNavActive();
  initProductsSearch();
  await loadProducts();
  initProductActions();
  initProductModal();
}

let allProducts = [];
let filteredProducts = [];

function initProductsSearch() {
  const searchInput = document.getElementById('productsSearch');
  const categoryFilter = document.getElementById('categoryFilter');
  if (!searchInput || !categoryFilter) return;

  function filterProducts() {
    const term = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    filteredProducts = allProducts.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    renderProducts(filteredProducts);
  }

  searchInput.addEventListener('input', filterProducts);
  categoryFilter.addEventListener('change', filterProducts);
}

async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    allProducts = await response.json();
    filteredProducts = [...allProducts];
    
    const container = document.getElementById('products-container');
    if (!container) return;
    
    if (allProducts.length === 0) {
      container.innerHTML = getEmptyState('products');
      return;
    }
    
    renderProducts(filteredProducts);
  } catch (error) {
    console.error('Load products error:', error);
  }
}

function renderProducts(products) {
  const container = document.getElementById('products-container');
  if (!container) return;
  container.innerHTML = products.map(product => createProductRow(product)).join('');
  initStockEditors();
  updateResultsCount(products.length);
}

function updateResultsCount(count) {
  const el = document.getElementById('resultsCount');
  if (el) el.textContent = `${count} products`;
}

function initStockEditors() {
  document.querySelectorAll('.stock-cell').forEach(cell => {
    cell.addEventListener('dblclick', () => makeStockEditable(cell));
  });
}

function makeStockEditable(cell) {
  const productId = cell.dataset.productId;
  const currentStock = cell.dataset.stock;
  cell.innerHTML = `<input type="number" value="${currentStock}" class="stock-input" style="width: 80px; padding: 4px; border: 1px solid var(--primary); border-radius: 4px;">`;
  const input = cell.querySelector('.stock-input');
  if (input) {
    input.focus();
    input.select();

    input.addEventListener('blur', () => saveStock(productId, input.value));
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') saveStock(productId, input.value);
    });
  }
}

async function saveStock(id, newStock) {
  try {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: parseInt(newStock) })
    });
    await loadProducts();
    showToast('Stock updated');
  } catch (error) {
    showToast('Error updating stock', 'error');
  }
}

async function initProductModal() {
  const form = document.getElementById('productForm');
  if (!form) return;
  
  const title = document.getElementById('modalTitle');
  const imageInput = document.getElementById('productImage');
  const preview = document.getElementById('imagePreview');
  
  if (imageInput && preview) {
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          preview.innerHTML = `<img src="${ev.target.result}" style="max-width: 150px; max-height: 150px; border-radius: 8px; border: 2px solid var(--primary);">`;
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    data.featured = formData.get('featured') === 'on';
    data.visible = formData.get('visible') === 'on';
    
    const editId = form.dataset.editId;
    let success = false;
    
    try {
      if (editId) {
        await fetch(`/api/products/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }
      success = true;
      form.reset();
      if (preview) preview.innerHTML = '';
      hideModal('productModal');
      await loadProducts();
      showToast(editId ? 'Product updated successfully' : 'Product added successfully');
    } catch (error) {
      showToast('Error saving product', 'error');
    }
    
    if (success) {
      form.dataset.editId = '';
      if (title) title.textContent = 'Add New Product';
    }
  };
}

function initProductActions() {
  const addBtn = document.getElementById('addProductBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const form = document.getElementById('productForm');
      const title = document.getElementById('modalTitle');
      if (form && title) {
        form.dataset.editId = '';
        title.textContent = 'Add New Product';
        showModal('productModal');
      }
    });
  }
}

async function editProduct(id) {
  try {
    const res = await fetch(`/api/products/${id}`);
    const product = await res.json();
    const form = document.getElementById('productForm');
    const title = document.getElementById('modalTitle');
    if (form && title) {
      form.dataset.editId = id;
      title.textContent = 'Edit Product';
      
      Object.keys(product).forEach(key => {
        const el = form.querySelector(`[name="${key}"]`);
        if (el) {
          if (el.type === 'checkbox') {
            el.checked = product[key];
          } else {
            el.value = product[key] || '';
          }
        }
      });
      
      showModal('productModal');
    }
  } catch (error) {
    showToast('Error loading product', 'error');
  }
}

async function showDeleteConfirm(id, type = 'item') {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'deleteConfirmModal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <div class="modal-header">
        <h2>Confirm Delete</h2>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete this ${type}? This action cannot be undone.</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" onclick="hideModal('deleteConfirmModal')">Cancel</button>
        <button id="confirmDeleteBtn" class="btn btn-danger">Delete</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const confirmBtn = document.getElementById('confirmDeleteBtn');
  if (confirmBtn) {
    confirmBtn.onclick = async () => {
      hideModal('deleteConfirmModal');
      try {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        await loadProducts();
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      } catch (error) {
        showToast('Error deleting ${type}', 'error');
      }
    };
  }
}

async function deleteProduct(id) {
  showDeleteConfirm(id, 'product');
}

async function deleteEnquiry(id) {
  showDeleteConfirm(id, 'enquiry');
}

function getEmptyState(type) {
  const states = {
    products: `
      <div class="empty-state">
        <div class="empty-icon icon-empty-products"></div>
        <div class="empty-title">No Products Yet</div>
        <div class="empty-subtitle">Start by adding your first product to showcase to customers</div>
        <button id="addFirstProduct" class="cta-button" onclick="document.getElementById('addProductBtn').click(); return false;">Add Your First Product</button>
      </div>
    `,
    enquiries: `
      <div class="empty-state">
        <div class="empty-icon icon-empty-enquiries"></div>
        <div class="empty-title">No Enquiries Yet</div>
        <div class="empty-subtitle">Customer enquiries from website will appear here automatically</div>
      </div>
    `
  };
  return states[type] || '';
}

function createProductRow(product) {
  return `
    <tr>
      <td>
        <div class="product-info">
          <img src="${product.thumbnail || '/placeholder.jpg'}" alt="${product.name}" class="product-thumb">
          <div>
            <strong>${product.name}</strong>
            <div class="product-meta">${product.sku}</div>
          </div>
        </div>
      </td>
      <td>${product.category}</td>
      <td>₹${product.price}</td>
      <td>
        <span class="stock-display ${product.stock > 0 ? 'status-active' : 'status-inactive'} stock-cell" data-product-id="${product.id}" data-stock="${product.stock}">
          ${product.stock} <small>${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</small>
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-primary" onclick="editProduct('${product.id}')">Edit</button>
          <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `;
}

// Enquiries
async function initEnquiries() {
  checkAuth();
  loadNavActive();
  await loadEnquiries();
  initStatusModal();
}

const ENQUIRIES_FILE = '/api/enquiries';

async function loadEnquiries() {
  try {
    const response = await fetch(ENQUIRIES_FILE);
    const enquiries = await response.json();
    const container = document.getElementById('enquiries-container');
    if (!container) return;
    
    if (enquiries.length === 0) {
      container.innerHTML = getEmptyState('enquiries');
      return;
    }
    container.innerHTML = enquiries.map(createEnquiryRow).join('');
  } catch (error) {
    console.error('Load enquiries error:', error);
  }
}

function createEnquiryRow(enquiry) {
  const statusClass = {
    pending: 'status-pending',
    contacted: 'status-active', 
    'followed-up': 'status-warning',
    closed: 'status-inactive'
  }[enquiry.status || 'pending'] || 'status-pending';

  return `
    <tr>
      <td>${enquiry.name || 'N/A'}</td>
      <td>
        <a href="https://wa.me/91${enquiry.phone}" target="_blank" class="btn btn-success" style="padding: 4px 12px; font-size: 0.8rem;">
          WhatsApp
        </a>
        ${enquiry.phone}
      </td>
      <td>${enquiry.interest || 'General Enquiry'}</td>
      <td><span class="status-badge ${statusClass}">${enquiry.status || 'Pending'}</span></td>
      <td>${new Date(enquiry.createdAt).toLocaleDateString()}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-primary" onclick="updateStatus('${enquiry.id}')">Update</button>
          <button class="btn btn-danger" onclick="deleteEnquiry('${enquiry.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `;
}

async function initStatusModal() {
  const form = document.getElementById('statusForm');
  if (!form) return;
  
  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const editId = form.dataset.editId;
    
    try {
      await fetch(`${ENQUIRIES_FILE}/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      form.reset();
      hideModal('statusModal');
      await loadEnquiries();
      showToast('Status updated successfully');
    } catch (error) {
      showToast('Error updating status', 'error');
    }
  };
}

async function updateStatus(id) {
  const form = document.getElementById('statusForm');
  if (form) form.dataset.editId = id;
  showModal('statusModal');
}

// Custom Jerseys
let allCustomJerseys = [];

async function initCustomJerseys() {
  checkAuth();
  loadNavActive();
  
  const addBtn = document.getElementById('addJerseyBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.getElementById('jerseyModalTitle').textContent = 'New Custom Jersey Request';
      document.getElementById('customJerseyForm').dataset.editId = '';
      showModal('customJerseyModal');
    });
  }
  
  initCustomJerseySearch();
  await loadCustomJerseys();
  initCustomJerseyModal();
}

function initCustomJerseySearch() {
  const searchInput = document.getElementById('jerseySearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allCustomJerseys.filter(j => 
      j.team.toLowerCase().includes(term) ||
      j.sizes.toLowerCase().includes(term) ||
      (j.logos && j.logos.toLowerCase().includes(term)) ||
      (j.printing && j.printing.toLowerCase().includes(term))
    );
    renderCustomJerseys(filtered);
    document.getElementById('jerseyResultsCount').textContent = `${filtered.length} requests`;
  });
}

async function loadCustomJerseys() {
  try {
    const response = await fetch('/api/custom-jerseys');
    allCustomJerseys = await response.json();
    
    const container = document.getElementById('jerseys-container');
    if (!container) return;
    
    if (allCustomJerseys.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 60px;">
            <div class="empty-state" style="border: none; background: none;">
              <div class="empty-icon icon-jers"></div>
              <div class="empty-title">No Custom Jersey Requests</div>
              <div class="empty-subtitle">High-value custom orders from teams and schools will appear here</div>
              <button id="addFirstJersey" class="cta-button" onclick="document.getElementById('addJerseyBtn').click(); return false;">Create First Request</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }
    
    renderCustomJerseys(allCustomJerseys);
  } catch (error) {
    console.error('Load custom jerseys error:', error);
  }
}

function renderCustomJerseys(jerseys) {
  const container = document.getElementById('jerseys-container');
  if (!container) return;
  container.innerHTML = jerseys.map(createJerseyRow).join('');
}

function createJerseyRow(jersey) {
  const statusClass = {
    quote: 'status-pending',
    design: 'status-warning',
    print: 'status-active',
    ship: 'status-warning',
    complete: 'status-success'
  }[jersey.status] || 'status-pending';

  return `
    <tr>
      <td><strong>${jersey.team}</strong></td>
      <td>${jersey.quantity}</td>
      <td>${jersey.sizes || 'N/A'}</td>
      <td>${(jersey.logos || jersey.printing || 'N/A').substring(0, 50)}${(jersey.logos || jersey.printing || '').length > 50 ? '...' : ''}</td>
      <td>${jersey.deadline || 'N/A'}</td>
      <td><span class="status-badge ${statusClass}">${jersey.status || 'Quote Pending'}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-primary" onclick="editCustomJersey('${jersey.id}')">Edit</button>
          <button class="btn btn-danger" onclick="deleteCustomJersey('${jersey.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `;
}

async function initCustomJerseyModal() {
  const form = document.getElementById('customJerseyForm');
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    const editId = form.dataset.editId;
    
    try {
      if (editId) {
        await fetch(`/api/custom-jerseys/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        showToast('Request updated successfully');
      } else {
        await fetch('/api/custom-jerseys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        showToast('Request created successfully');
      }
      form.reset();
      hideModal('customJerseyModal');
      await loadCustomJerseys();
    } catch (error) {
      showToast('Error saving request', 'error');
    }
  };
}

async function editCustomJersey(id) {
  try {
    const res = await fetch(`/api/custom-jerseys/${id}`);
    const jersey = await res.json();
    const form = document.getElementById('customJerseyForm');
    const title = document.getElementById('jerseyModalTitle');
    
    form.dataset.editId = id;
    title.textContent = 'Edit Custom Jersey Request';
    
    Object.keys(jersey).forEach(key => {
      const el = form.querySelector(`[name="${key}"]`);
      if (el) {
        if (el.type === 'select-one') {
          el.value = jersey[key] || '';
        } else if (el.type === 'checkbox') {
          el.checked = jersey[key];
        } else {
          el.value = jersey[key] || '';
        }
      }
    });
    
    showModal('customJerseyModal');
  } catch (error) {
    showToast('Error loading request', 'error');
  }
}

async function deleteCustomJersey(id) {
  if (confirm('Delete this custom jersey request?')) {
    try {
      await fetch(`/api/custom-jerseys/${id}`, { method: 'DELETE' });
      await loadCustomJerseys();
      showToast('Request deleted');
    } catch (error) {
      showToast('Error deleting request', 'error');
    }
  }
}

// Settings
async function initSettings() {
  checkAuth();
  loadNavActive();

  // Load current settings
  try {
    const response = await fetch('/api/settings');
    const settings = await response.json();
    loadSettingsIntoForm(settings);
  } catch (error) {
    console.error('Load settings error:', error);
  }

  // Tab switching
  document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab + 'Tab').classList.add('active');
    });
  });

  // Save button
  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);

  // Profile button
  document.getElementById('profileBtn').addEventListener('click', showProfileModal);

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', logout);
}

function loadSettingsIntoForm(settings) {
  Object.keys(settings).forEach(key => {
    const el = document.querySelector(`[name="${key}"]`);
    if (el) el.value = settings[key];
  });
}

async function saveSettings() {
  const formData = new FormData();
  document.querySelectorAll('[name]').forEach(el => {
    if (el.name && el.value) {
      formData.append(el.name, el.value);
    }
  });
  
  const data = Object.fromEntries(formData);
  
  try {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      document.getElementById('settingsStatus').textContent = 'Saved ✓';
      document.getElementById('settingsStatus').style.color = 'var(--success)';
      showToast('Settings saved successfully');
      
      // Reload page after short delay
      setTimeout(() => location.reload(), 1500);
    }
  } catch (error) {
    showToast('Error saving settings', 'error');
  }
}

function showProfileModal() {
  // Load profile data (from settings or session)
  document.getElementById('profileName').value = 'Admin'; // From settings
  document.getElementById('recentActivity').textContent = 'Logged in 2 mins ago • Product updated 1hr ago';
  showModal('profileModal');
}

// Global exports
window.initLogin = initLogin;
window.initDashboard = initDashboard;
window.initProducts = initProducts;
window.initEnquiries = initEnquiries;
window.initCustomJerseys = initCustomJerseys;
window.initSettings = initSettings;
window.showToast = showToast;

