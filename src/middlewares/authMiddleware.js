const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received:', token ? 'Present' : 'Missing');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully, user ID:', decoded.id);
      
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.error('User not found for ID:', decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }
      
      console.log('User authenticated:', req.user._id);
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.error('No authorization header or Bearer token');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };