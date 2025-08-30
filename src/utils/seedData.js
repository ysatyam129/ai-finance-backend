const mongoose = require('mongoose');
const User = require('../models/User');
const Expense = require('../models/Expense');

// Categories with their typical amount ranges
const EXPENSE_CATEGORIES = {
  Food: { range: [200, 800], descriptions: ['Groceries', 'Restaurant meal', 'Food delivery', 'Snacks', 'Coffee'] },
  Transport: { range: [100, 600], descriptions: ['Fuel', 'Public transport', 'Cab ride', 'Parking', 'Vehicle maintenance'] },
  Entertainment: { range: [300, 1200], descriptions: ['Movie tickets', 'Streaming subscription', 'Concert', 'Gaming', 'Books'] },
  Shopping: { range: [500, 2500], descriptions: ['Clothing', 'Electronics', 'Home items', 'Accessories', 'Gifts'] },
  Bills: { range: [800, 3000], descriptions: ['Electricity bill', 'Internet bill', 'Phone bill', 'Water bill', 'Gas bill'] },
  Healthcare: { range: [500, 2000], descriptions: ['Doctor visit', 'Medicines', 'Health checkup', 'Dental care', 'Insurance'] },
  Other: { range: [200, 1000], descriptions: ['Miscellaneous', 'Personal care', 'Education', 'Charity', 'Repairs'] }
};

// Helper to generate random amount within a range
function getRandomAmount(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// Helper to get random category with amount and description
function getRandomExpense() {
  const categories = Object.keys(EXPENSE_CATEGORIES);
  const category = categories[Math.floor(Math.random() * categories.length)];
  const categoryData = EXPENSE_CATEGORIES[category];
  const amount = getRandomAmount(categoryData.range[0], categoryData.range[1]);
  const description = categoryData.descriptions[Math.floor(Math.random() * categoryData.descriptions.length)];
  
  return { category, amount, description };
}

const seedExpenses = async (userId) => {
  try {
    // Delete existing expenses for this user
    await Expense.deleteMany({ userId });

    // Generate 30-45 expenses over the last 30 days
    const expenses = [];
    const numberOfExpenses = Math.floor(Math.random() * 16) + 30; // 30-45 expenses

    for (let i = 0; i < numberOfExpenses; i++) {
      const { category, amount, description } = getRandomExpense();
      const daysAgo = Math.floor(Math.random() * 30); // Random day within last 30 days
      const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      
      expenses.push({
        category,
        amount,
        description,
        userId,
        date
      });
    }

    await Expense.insertMany(expenses);
    console.log(`Successfully added ${expenses.length} sample expenses`);
    
    // Calculate and log total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    console.log(`Total expenses: ₹${totalExpenses.toLocaleString()}`);
    
  } catch (error) {
    console.error('Error seeding expenses:', error);
  }
};

// Additional utility to seed expenses for multiple users
const seedMultipleUsers = async () => {
  try {
    const users = await User.find({}).select('_id');
    
    for (const user of users) {
      await seedExpenses(user._id);
    }
    
    console.log(`Seeded expenses for ${users.length} users`);
  } catch (error) {
    console.error('Error seeding multiple users:', error);
  }
};

module.exports = { seedExpenses, seedMultipleUsers };