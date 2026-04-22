const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'abd-sports-admin-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
const productsFile = path.join(dataDir, 'products.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readJSON(filePath, defaultValue = []) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return defaultValue;
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

// Routes
app.get('/', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/dashboard.html');
  } else {
    res.redirect('/login.html');
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@abdsports.com' && password === 'admin123') {
    req.session.loggedIn = true;
    req.session.user = { email };
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Protected routes middleware
const requireLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login.html');
  }
};

app.get('/api/products', requireLogin, (req, res) => {
  const products = readJSON(productsFile);
  res.json(products);
});

// Add product
app.post('/api/products', requireLogin, (req, res) => {
  let products = readJSON(productsFile);
  const newProduct = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  products.unshift(newProduct);
  writeJSON(productsFile, products);
  res.json({ success: true, product: newProduct });
});

// Update product
app.put('/api/products/:id', requireLogin, (req, res) => {
  let products = readJSON(productsFile);
  const id = req.params.id;
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...req.body, updatedAt: new Date().toISOString() };
    writeJSON(productsFile, products);
    res.json({ success: true, product: products[index] });
  } else {
    res.status(404).json({ success: false, message: 'Product not found' });
  }
});

// Delete product
app.delete('/api/products/:id', requireLogin, (req, res) => {
  let products = readJSON(productsFile);
  const id = req.params.id;
  const filtered = products.filter(p => p.id !== id);
  writeJSON(productsFile, filtered);
  res.json({ success: true });
});

// === ENQUIRIES APIs ===
const enquiriesFile = path.join(dataDir, 'enquiries.json');

app.get('/api/enquiries', requireLogin, (req, res) => {
  const enquiries = readJSON(enquiriesFile);
  res.json(enquiries);
});

app.post('/api/enquiries', requireLogin, (req, res) => {
  let enquiries = readJSON(enquiriesFile);
  const newEnquiry = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  enquiries.unshift(newEnquiry);
  writeJSON(enquiriesFile, enquiries);
  res.json({ success: true, enquiry: newEnquiry });
});

app.put('/api/enquiries/:id', requireLogin, (req, res) => {
  let enquiries = readJSON(enquiriesFile);
  const id = req.params.id;
  const index = enquiries.findIndex(e => e.id === id);
  if (index !== -1) {
    enquiries[index] = { ...enquiries[index], ...req.body };
    writeJSON(enquiriesFile, enquiries);
    res.json({ success: true, enquiry: enquiries[index] });
  } else {
    res.status(404).json({ success: false });
  }
});

app.delete('/api/enquiries/:id', requireLogin, (req, res) => {
  let enquiries = readJSON(enquiriesFile);
  const id = req.params.id;
  const filtered = enquiries.filter(e => e.id !== id);
  writeJSON(enquiriesFile, filtered);
  res.json({ success: true });
});

// Products search
app.get('/api/products', requireLogin, (req, res) => {
  let products = readJSON(productsFile);
  const { q, category } = req.query;
  
  if (q) {
    const term = q.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term)
    );
  }
  
  if (category) {
    products = products.filter(p => p.category === category);
  }
  
  res.json(products);
});

// === CUSTOM JERSEYS APIs ===
const customJerseysFile = path.join(dataDir, 'custom-jerseys.json');

app.get('/api/custom-jerseys', requireLogin, (req, res) => {
  const customJerseys = readJSON(customJerseysFile);
  res.json(customJerseys);
});

app.post('/api/custom-jerseys', requireLogin, (req, res) => {
  let customJerseys = readJSON(customJerseysFile);
  const newJersey = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  customJerseys.unshift(newJersey);
  writeJSON(customJerseysFile, customJerseys);
  res.json({ success: true, jersey: newJersey });
});

app.put('/api/custom-jerseys/:id', requireLogin, (req, res) => {
  let customJerseys = readJSON(customJerseysFile);
  const id = req.params.id;
  const index = customJerseys.findIndex(j => j.id === id);
  if (index !== -1) {
    customJerseys[index] = { ...customJerseys[index], ...req.body, updatedAt: new Date().toISOString() };
    writeJSON(customJerseysFile, customJerseys);
    res.json({ success: true, jersey: customJerseys[index] });
  } else {
    res.status(404).json({ success: false, message: 'Custom jersey not found' });
  }
});

app.delete('/api/custom-jerseys/:id', requireLogin, (req, res) => {
  let customJerseys = readJSON(customJerseysFile);
  const id = req.params.id;
  const filtered = customJerseys.filter(j => j.id !== id);
  writeJSON(customJerseysFile, filtered);
  res.json({ success: true });
});

// === SETTINGS API ===
const settingsFile = path.join(dataDir, 'settings.json');

app.get('/api/settings', requireLogin, (req, res) => {
  const settings = readJSON(settingsFile, {});
  res.json(settings);
});

app.put('/api/settings', requireLogin, (req, res) => {
  const settings = { ...readJSON(settingsFile, {}), ...req.body };
  writeJSON(settingsFile, settings);
  res.json({ success: true, settings });
});

// Stats endpoint for dashboard
app.get('/api/stats', requireLogin, (req, res) => {
  const products = readJSON(productsFile);
  const enquiries = readJSON(path.join(dataDir, 'enquiries.json'));
  const customJerseys = readJSON(path.join(dataDir, 'custom-jerseys.json'));
  const bulkOrders = readJSON(path.join(dataDir, 'bulk-orders.json'));
  
  const lowStock = products.filter(p => p.stock != null && p.stock < 10).length;
  
  res.json({
    products: products.length,
    enquiries: enquiries.filter(e => e.status === 'pending').length,
    customJerseys: customJerseys.length,
    bulkOrders: bulkOrders.length,
    lowStock
  });
});

app.listen(PORT, () => {
  console.log(`ABD Sports Admin running on http://localhost:${PORT}`);
});


