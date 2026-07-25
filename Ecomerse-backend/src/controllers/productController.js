const { Product, Review } = require('../models');
const { Op, Sequelize } = require('sequelize');
const { sequelize } = require('../config/postgres');

const attachReviewStats = async (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  const productIds = products.map((product) => product.id).filter(Boolean);
  if (productIds.length === 0) {
    return products.map((product) => ({
      ...(product.toJSON ? product.toJSON() : product),
      reviewCount: 0,
      averageRating: Number(product.averageRating || 0),
    }));
  }

  const reviewStats = await Review.findAll({
    attributes: [
      'productId',
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'reviewCount'],
      [Sequelize.fn('AVG', Sequelize.col('rating')), 'averageRating'],
    ],
    where: { productId: productIds },
    group: ['productId'],
    raw: true,
  });

  const statsByProductId = Object.fromEntries(
    reviewStats.map((stat) => [
      stat.productId,
      {
        reviewCount: Number(stat.reviewCount || 0),
        averageRating: stat.averageRating ? Number(stat.averageRating) : 0,
      },
    ])
  );

  return products.map((product) => {
    const plainProduct = product.toJSON ? product.toJSON() : product;
    const stats = statsByProductId[plainProduct.id] || { reviewCount: 0, averageRating: 0 };

    return {
      ...plainProduct,
      reviewCount: stats.reviewCount,
      averageRating: Number(plainProduct.averageRating ?? stats.averageRating ?? 0),
    };
  });
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const requestedPage = Math.max(1, parseInt(req.query.page || 1, 10));
    const requestedLimit = Math.max(1, parseInt(req.query.limit || 100, 10));
    const { search, category, minPrice, maxPrice, sort = 'newest' } = req.query;
    const where = {};
    let order = [['createdAt', 'DESC']];
    
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }
    
    if (category && category !== 'all' && category !== 'All Categories') {
      where.category = category;
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    
    // Apply sorting
    switch(sort) {
      case 'price_low':
        order = [['price', 'ASC']];
        break;
      case 'price_high':
        order = [['price', 'DESC']];
        break;
      case 'popular':
        order = [['averageRating', 'DESC']];
        break;
      case 'newest':
      default:
        order = [['createdAt', 'DESC']];
        break;
    }
    
    const products = await Product.findAll({
      where,
      offset: (requestedPage - 1) * requestedLimit,
      limit: requestedLimit,
      order
    });
    
    const totalCount = await Product.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalCount / requestedLimit));
    const productsWithStats = await attachReviewStats(products);
    
    res.json({
      products: productsWithStats,
      totalCount,
      currentPage: requestedPage,
      totalPages
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query parameter q required' });
    const products = await Product.findAll({
      where: { 
        name: { [Op.iLike]: `%${q}%` } 
      },
    });
    const productsWithStats = await attachReviewStats(products);
    res.json(productsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      const productsWithStats = await attachReviewStats([product]);
      res.json(productsWithStats[0]);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      const updated = await product.update(req.body);
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Soft delete - just mark as inactive
    product.isActive = false;
    product.deletedAt = new Date();
    await product.save();
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
