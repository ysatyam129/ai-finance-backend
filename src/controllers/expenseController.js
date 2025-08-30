const Expense = require('../models/Expense');
const mongoose = require('mongoose');
const { checkAndSendAlerts } = require('../utils/emailService');

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Error fetching expenses' });
  }
};

const getExpenseStats = async (req, res) => {
  try {
    console.log('Getting expense stats for user:', req.user._id);
    
    // Check if user exists and has valid ObjectId
    if (!req.user || !req.user._id) {
      console.error('Invalid user object:', req.user);
      return res.status(400).json({ message: 'Invalid user information' });
    }

    // Validate that the user ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      console.error('Invalid ObjectId format:', req.user._id);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Get current month start and end dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Get monthly expenses (category-wise for current month)
    const monthlyExpenses = await Expense.aggregate([
      { 
        $match: { 
          user: userId,
          createdAt: {
            $gte: currentMonthStart,
            $lt: nextMonthStart
          }
        } 
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total expenses for current month
    const totalExpensesResult = await Expense.aggregate([
      { 
        $match: { 
          user: userId,
          createdAt: {
            $gte: currentMonthStart,
            $lt: nextMonthStart
          }
        } 
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalExpenses = totalExpensesResult.length > 0 ? totalExpensesResult[0].total : 0;
    const salary = req.user.salary || 0;
    const remainingBalance = salary - totalExpenses;
    const balancePercentage = salary > 0 ? (remainingBalance / salary) * 100 : 0;

    const stats = {
      monthlyExpenses,
      totalExpenses,
      remainingBalance,
      balancePercentage,
      salary
    };

    console.log('Stats retrieved successfully:', stats);
    res.json({ data: stats });
  } catch (error) {
    console.error('Get stats error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      user: req.user ? req.user._id : 'undefined'
    });
    res.status(500).json({ 
      message: 'Error fetching expense statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const addExpense = async (req, res) => {
  try {
    const { category, amount, description } = req.body;
    
    if (!category || !amount) {
      return res.status(400).json({ message: 'Category and amount are required' });
    }

    const expense = await Expense.create({
      user: req.user._id,
      category,
      amount: Number(amount),
      description
    });

    // Check balance after adding expense and send alert if needed
    try {
      await checkAndSendAlerts();
    } catch (emailError) {
      console.error('Error checking balance for email alerts:', emailError);
      // Don't fail the expense creation if email fails
    }

    res.status(201).json(expense);
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ message: 'Error adding expense' });
  }
};

module.exports = { getExpenses, addExpense, getExpenseStats };