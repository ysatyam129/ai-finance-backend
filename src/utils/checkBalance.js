const User = require('../models/User');
const Expense = require('../models/Expense');
const { checkAndSendAlerts } = require('./emailService');

const checkLowBalance = async () => {
  try {
    await checkAndSendAlerts();
    console.log('Balance check completed successfully');
  } catch (error) {
    console.error('Error in balance check:', error);
  }
};

// Manual trigger for testing
const triggerBalanceCheck = async () => {
  console.log('Manually triggering balance check...');
  await checkLowBalance();
};

module.exports = { checkLowBalance, triggerBalanceCheck };