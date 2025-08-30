const express = require('express');
const { seedExpenses, seedMultipleUsers } = require('../utils/seedData');
const { triggerBalanceCheck } = require('../utils/checkBalance');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/expenses', protect, async (req, res) => {
  try {
    await seedExpenses(req.user._id);
    res.json({ message: 'Sample expenses added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/all-users', protect, async (req, res) => {
  try {
    await seedMultipleUsers();
    res.json({ message: 'Sample expenses added for all users' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/check-balance', protect, async (req, res) => {
  try {
    await triggerBalanceCheck();
    res.json({ message: 'Balance check triggered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;