const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const router = express.Router();

// Get menu items from MongoDB
router.get('/menu', authMiddleware, async (req, res) => {
  try {
    const menuItems = await MenuItem.find(); // Fetch menu items
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu data', error });
  }
});


router.post('/order', authMiddleware, async (req, res) => {
  const { items, totalCost } = req.body;

  try {
    const newOrder = new Order({
      userId: req.user.id, // check
      items,
      totalAmount: totalCost,
      status: 'Pending',
    });

    await newOrder.save(); 
    res.status(201).json({ message: 'Order placed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error placing order', error });
  }
});


router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().populate('items.menuItemId'); 
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
});


router.patch('/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status; 
    await order.save(); 
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error });
  }
});

module.exports = router;
