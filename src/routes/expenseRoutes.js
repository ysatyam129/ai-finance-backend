const express = require('express');
const { getExpenses, addExpense, getExpenseStats } = require('../controllers/expenseController');
const { protect } = require('../middlewares/authMiddleware');
const { checkAndSendAlerts } = require('../utils/emailService');
const { sendTestEmail } = require('../config/mail');

const router = express.Router();

router.use(protect);

router.route('/').get(getExpenses).post(addExpense);
router.get('/stats', getExpenseStats);

// Test route to manually trigger balance check
router.post('/check-balance', async (req, res) => {
  try {
    await checkAndSendAlerts();
    res.json({ message: 'Balance check completed successfully' });
  } catch (error) {
    console.error('Balance check error:', error);
    res.status(500).json({ message: 'Error checking balance', error: error.message });
  }
});

// Test route for email functionality
router.post('/test-email', async (req, res) => {
  try {
    const userEmail = req.user.email;
    const result = await sendTestEmail(userEmail);
    
    if (result.success) {
      res.json({ 
        message: 'Test email sent successfully!', 
        messageId: result.messageId,
        sentTo: userEmail
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to send test email', 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ message: 'Error sending test email', error: error.message });
  }
});

module.exports = router;