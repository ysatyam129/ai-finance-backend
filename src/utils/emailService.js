const { sendLowBalanceAlert } = require('../config/mail');
const User = require('../models/User');
const Expense = require('../models/Expense');

const sendLowBalanceEmail = async (userEmail, userName, remainingBalance, percentage, totalExpenses, salary) => {
  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fee; border-left: 4px solid #f56565; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .stats { display: flex; justify-content: space-between; margin: 20px 0; }
            .stat { text-align: center; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
            .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⚠️ Low Balance Alert</h1>
                <p>AI Finance - Smart Financial Management</p>
            </div>
            <div class="content">
                <h2>Hi ${userName},</h2>
                
                <div class="alert-box">
                    <strong>Critical Alert:</strong> Your account balance is running low!<br>
                    You have only <strong>₹${remainingBalance.toLocaleString()}</strong> remaining from your monthly salary.<br>
                    This is below the recommended threshold of ₹10,000.
                </div>

                <div class="stats">
                    <div class="stat">
                        <div class="stat-value">₹${salary.toLocaleString()}</div>
                        <div class="stat-label">Monthly Salary</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">₹${totalExpenses.toLocaleString()}</div>
                        <div class="stat-label">Total Spent</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">₹${remainingBalance.toLocaleString()}</div>
                        <div class="stat-label">Remaining</div>
                    </div>
                </div>

                <h3>💡 Recommendations:</h3>
                <ul>
                    <li>Review your recent expenses in the dashboard</li>
                    <li>Consider reducing non-essential spending</li>
                    <li>Set up budget limits for different categories</li>
                    <li>Track daily expenses more closely</li>
                </ul>

                <p><strong>Take action now to avoid overspending this month!</strong></p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/dashboard" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; padding: 12px 30px; text-decoration: none; 
                              border-radius: 25px; display: inline-block;">
                        View Dashboard
                    </a>
                </div>
            </div>
            <div class="footer">
                <p>This is an automated alert from AI Finance.<br>
                   Stay on top of your finances with smart insights!</p>
            </div>
        </div>
    </body>
    </html>
  `;

  try {
    await sendLowBalanceAlert(userEmail, userName, remainingBalance, percentage, emailHTML);
    console.log(`Low balance email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending low balance email:', error);
  }
};

const checkAndSendAlerts = async () => {
  try {
    const users = await User.find({});
    
    for (const user of users) {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const totalExpenses = await Expense.aggregate([
        {
          $match: {
            user: user._id,
            createdAt: {
              $gte: new Date(currentYear, currentMonth, 1),
              $lt: new Date(currentYear, currentMonth + 1, 1)
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

      const monthlyExpenses = totalExpenses[0]?.total || 0;
      const remainingBalance = user.salary - monthlyExpenses;
      const balancePercentage = (remainingBalance / user.salary) * 100;

      // Send alert if balance is less than ₹10,000 and no notification sent today
      if (remainingBalance < 10000) {
        const today = new Date().toDateString();
        const lastNotification = user.lastNotificationSent?.toDateString();

        if (lastNotification !== today) {
          await sendLowBalanceEmail(
            user.email,
            user.name,
            remainingBalance,
            balancePercentage.toFixed(1),
            monthlyExpenses,
            user.salary
          );

          // Update last notification date
          await User.findByIdAndUpdate(user._id, {
            lastNotificationSent: new Date()
          });

          console.log(`Low balance alert sent to ${user.email} - Balance: ₹${remainingBalance}`);
        } else {
          console.log(`Alert already sent today to ${user.email}`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking and sending alerts:', error);
  }
};

module.exports = { sendLowBalanceEmail, checkAndSendAlerts };