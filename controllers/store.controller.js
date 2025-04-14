import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import { ValidationError } from '../utils/errors.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    // Apply filters
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sortOptions = {};
    if (sortBy === 'price') {
      sortOptions.price = order === 'desc' ? -1 : 1;
    } else if (sortBy === 'rating') {
      sortOptions['rating.average'] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    }

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        products,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name profilePicture');

    if (!product) {
      throw new ValidationError('Product not found');
    }

    res.json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    // Validate products and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new ValidationError(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for product ${product.name}`);
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });

      totalAmount += product.price * item.quantity;

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod
    });

    await order.populate('items.product', 'name images');

    res.status(201).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images');

    res.json({
      status: 'success',
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};
