const jwt = require('jsonwebtoken');

// Test token generation
const testUserId = '507f1f77bcf86cd799439011'; // Sample MongoDB ObjectId
const token = jwt.sign({ id: testUserId }, 'your_jwt_secret_key_here', { expiresIn: '30d' });

console.log('Generated Token:', token);

// Test token verification
try {
  const decoded = jwt.verify(token, 'your_jwt_secret_key_here');
  console.log('Decoded Token:', decoded);
  console.log('User ID from token:', decoded.id);
} catch (error) {
  console.error('Token verification error:', error.message);
}
