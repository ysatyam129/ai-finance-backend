const mongoose = require('mongoose');
require('dotenv').config();

// Test database connection
async function testDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully');
    
    // Test basic operations
    const Expense = require('./src/models/Expense');
    const User = require('./src/models/User');
    
    // Check if collections exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Test aggregation query
    const testUser = await User.findOne();
    if (testUser) {
      console.log('Test user found:', testUser._id);
      
      const stats = await Expense.aggregate([
        { $match: { user: testUser._id } },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);
      
      console.log('Stats query successful:', stats);
    } else {
      console.log('No users found in database');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Test environment variables
function testEnv() {
  console.log('\n🔧 Environment Variables:');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Missing');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
}

testEnv();
testDB();
