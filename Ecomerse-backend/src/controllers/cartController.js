const { Product } = require('../models');
const { sequelize } = require('../config/postgres');

exports.getCart = async (req, res) => {
  try {
    
    // Get cart from database
    const [results] = await sequelize.query(
      'SELECT * FROM "Carts" WHERE "userId" = ?',
      { replacements: [req.user.id] }
    );
    
    let cartData;
    if (results.length === 0) {
      const [newCart] = await sequelize.query(
        'INSERT INTO "Carts" ("userId", items, "totalPrice", "createdAt", "updatedAt") VALUES (?, ?, ?, NOW(), NOW()) RETURNING *',
        { replacements: [req.user.id, JSON.stringify([]), 0] }
      );
      cartData = newCart[0];
    } else {
      cartData = results[0];
    }
    
    
    // Parse items
    let items = [];
    if (cartData.items) {
  
      if (typeof cartData.items === 'string') {
        try {
          items = JSON.parse(cartData.items);

        } catch (e) {
        
          items = [];
        }
      } else if (Array.isArray(cartData.items)) {
        items = cartData.items;
      
      } else if (typeof cartData.items === 'object') {
        items = [cartData.items]; 
        
      }
    }
   
    // Build response with full product details
    const populatedItems = [];
    let calculatedTotal = 0;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item && item.productId) {
       
        const product = await Product.findByPk(item.productId);
        
        if (product) {
          const productImage = product.images && product.images.length > 0 
            ? product.images[0] 
            : null;
          
          const itemTotal = item.quantity * product.price;
          calculatedTotal += itemTotal;
          
          const populatedItem = {
            productId: item.productId,
            quantity: item.quantity,
            name: product.name,
            price: product.price,
            stock: product.stock,
            category: product.category || 'Uncategorized',
            image: productImage
          };
          
          populatedItems.push(populatedItem);
        } else {
        }
      } else {
      }
    }
    
    const response = {
      id: cartData.id,
      userId: cartData.userId,
      items: populatedItems,
      totalPrice: calculatedTotal,
      createdAt: cartData.createdAt,
      updatedAt: cartData.updatedAt
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ GET CART ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get current cart
    const [results] = await sequelize.query(
      'SELECT * FROM "Carts" WHERE "userId" = ?',
      { replacements: [req.user.id] }
    );
    
    let items = [];
    let cartId;
    
    if (results.length === 0) {
      // Create new cart
      const [newCart] = await sequelize.query(
        'INSERT INTO "Carts" ("userId", items, "totalPrice", "createdAt", "updatedAt") VALUES (?, ?, ?, NOW(), NOW()) RETURNING id',
        { replacements: [req.user.id, JSON.stringify([]), 0] }
      );
      cartId = newCart[0].id;
      items = [];
    } else {
      cartId = results[0].id;
      try {
        // Parse existing items
        items = typeof results[0].items === 'string' 
          ? JSON.parse(results[0].items) 
          : (results[0].items || []);
      } catch (e) {
        console.error('Error parsing items:', e);
        items = [];
      }
    }
    
    // Check if product already in cart
    const existingItemIndex = items.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      items.push({ productId, quantity });
    }
    
    // Calculate total price
    let totalPrice = 0;
    for (const item of items) {
      const prod = await Product.findByPk(item.productId);
      if (prod) {
        totalPrice += item.quantity * prod.price;
      }
    }
    
    // Update cart in database
    await sequelize.query(
      'UPDATE "Carts" SET items = ?, "totalPrice" = ?, "updatedAt" = NOW() WHERE id = ?',
      { replacements: [JSON.stringify(items), totalPrice, cartId] }
    );
    
    // Fetch and return updated cart
    const [updatedCart] = await sequelize.query(
      'SELECT * FROM "Carts" WHERE id = ?',
      { replacements: [cartId] }
    );
    
    // Get full product details for response
    const cartData = updatedCart[0];
    let responseItems = [];
    
    for (const item of items) {
      const prod = await Product.findByPk(item.productId);
      if (prod) {
        responseItems.push({
          productId: item.productId,
          quantity: item.quantity,
          name: prod.name,
          price: prod.price,
          stock: prod.stock,
          category: prod.category || 'Uncategorized',
          image: prod.images && prod.images.length > 0 ? prod.images[0] : null
        });
      }
    }
    
    const response = {
      id: cartData.id,
      userId: cartData.userId,
      items: responseItems,
      totalPrice: totalPrice,
      createdAt: cartData.createdAt,
      updatedAt: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ message: error.message });
  }
};



exports.updateItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = parseInt(req.params.id);
    
    const [results] = await sequelize.query(
      'SELECT * FROM "Carts" WHERE "userId" = ?',
      { replacements: [req.user.id] }
    );
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const cartData = results[0];
    
    let items = [];
    try {
      items = typeof cartData.items === 'string' 
        ? JSON.parse(cartData.items) 
        : (cartData.items || []);
    } catch (e) {
      items = [];
    }
    
    const itemIndex = items.findIndex(i => i.productId === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not in cart' });
    }
    
    // Check stock
    const product = await Product.findByPk(productId);
    if (product && quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} items available` });
    }
    
    items[itemIndex].quantity = quantity;
    
    // Recalculate total
    let totalPrice = 0;
    for (const item of items) {
      const prod = await Product.findByPk(item.productId);
      if (prod) {
        totalPrice += item.quantity * prod.price;
      }
    }
    
    await sequelize.query(
      'UPDATE "Carts" SET items = ?, "totalPrice" = ?, "updatedAt" = NOW() WHERE id = ?',
      { replacements: [JSON.stringify(items), totalPrice, cartData.id] }
    );
    
    const result = await exports.getCart(req, res);
    
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    const [results] = await sequelize.query(
      'SELECT * FROM "Carts" WHERE "userId" = ?',
      { replacements: [req.user.id] }
    );
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const cartData = results[0];
    
    let items = [];
    try {
      items = typeof cartData.items === 'string' 
        ? JSON.parse(cartData.items) 
        : (cartData.items || []);
    } catch (e) {
      items = [];
    }
    
    const filteredItems = items.filter(i => i.productId !== productId);
    
    // Recalculate total
    let totalPrice = 0;
    for (const item of filteredItems) {
      const prod = await Product.findByPk(item.productId);
      if (prod) {
        totalPrice += item.quantity * prod.price;
      }
    }
    
    await sequelize.query(
      'UPDATE "Carts" SET items = ?, "totalPrice" = ?, "updatedAt" = NOW() WHERE id = ?',
      { replacements: [JSON.stringify(filteredItems), totalPrice, cartData.id] }
    );
    
    const result = await exports.getCart(req, res);
    
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    
    await sequelize.query(
      'UPDATE "Carts" SET items = ?, "totalPrice" = ?, "updatedAt" = NOW() WHERE "userId" = ?',
      { replacements: [JSON.stringify([]), 0, req.user.id] }
    );
    
    res.json({ 
      items: [], 
      totalPrice: 0 
    });
    
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: error.message });
  }
};