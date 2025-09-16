import express from 'express';

const router = express.Router();

// Simulamos un catálogo de productos
let products = [
  { id: 1, name: 'Laptop HP', price: 1299.99, category: 'electronics', stock: 15 },
  { id: 2, name: 'Mouse Logitech', price: 29.99, category: 'electronics', stock: 50 },
  { id: 3, name: 'Teclado Mecánico', price: 89.99, category: 'electronics', stock: 25 },
  { id: 4, name: 'Monitor 4K', price: 399.99, category: 'electronics', stock: 8 },
  { id: 5, name: 'Café Colombiano', price: 12.99, category: 'food', stock: 100 }
];

// GET /products - Obtener todos los productos con filtros opcionales
router.get('/', (req, res) => {
  const { category, minPrice, maxPrice, search } = req.query;
  let filteredProducts = [...products];

  // Filtrar por categoría
  if (category) {
    filteredProducts = filteredProducts.filter(p =>
      p.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Filtrar por precio mínimo
  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
  }

  // Filtrar por precio máximo
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
  }

  // Búsqueda por nombre
  if (search) {
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Simular delay variable para testing
  setTimeout(() => {
    res.json({
      success: true,
      data: filteredProducts,
      total: filteredProducts.length,
      filters: { category, minPrice, maxPrice, search }
    });
  }, Math.random() * 300 + 100);
});

// GET /products/:id - Obtener producto por ID
router.get('/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Producto no encontrado'
    });
  }

  setTimeout(() => {
    res.json({
      success: true,
      data: product
    });
  }, Math.random() * 150 + 50);
});

// POST /products - Crear nuevo producto
router.post('/', (req, res) => {
  const { name, price, category, stock = 0 } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({
      success: false,
      error: 'Nombre, precio y categoría son requeridos'
    });
  }

  const newProduct = {
    id: products.length + 1,
    name,
    price: parseFloat(price),
    category,
    stock: parseInt(stock)
  };

  products.push(newProduct);

  setTimeout(() => {
    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Producto creado exitosamente'
    });
  }, Math.random() * 400 + 150);
});

// PUT /products/:id/stock - Actualizar stock
router.put('/:id/stock', (req, res) => {
  const productId = parseInt(req.params.id);
  const { quantity } = req.body;
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Producto no encontrado'
    });
  }

  if (typeof quantity !== 'number') {
    return res.status(400).json({
      success: false,
      error: 'Cantidad debe ser un número'
    });
  }

  product.stock = quantity;

  setTimeout(() => {
    res.json({
      success: true,
      data: product,
      message: 'Stock actualizado exitosamente'
    });
  }, Math.random() * 200 + 75);
});

// GET /products/categories/list - Obtener lista de categorías
router.get('/categories/list', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];

  setTimeout(() => {
    res.json({
      success: true,
      data: categories,
      total: categories.length
    });
  }, Math.random() * 100 + 25);
});

export default router;