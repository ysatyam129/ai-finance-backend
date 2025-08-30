require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('cron');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const seedRoutes = require('./routes/seedRoutes');
const { checkLowBalance } = require('./utils/checkBalance');

// CORS configuration
const allowedOrigins = [
  'https://ai-finance-website-sage.vercel.app',
  'https://ai-finance-website-git-main-satyams-projects-f93b7ccf.vercel.app',
  'http://localhost:3000'
];

// Add any additional origins from environment variables
if (process.env.ADDITIONAL_ORIGINS) {
  const additionalOrigins = process.env.ADDITIONAL_ORIGINS.split(',').map(origin => origin.trim());
  allowedOrigins.push(...additionalOrigins);
}

// Dynamic CORS function
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ Allowed request from origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ Blocked request from origin: ${origin}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Connect to database
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/seed', seedRoutes);
app.get('/test',(req,res)=>{
  return res.send("API is running....")
})

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    allowedOrigins: allowedOrigins,
    requestOrigin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Schedule balance check every day at 9 AM
const job = new cron.CronJob('0 9 * * *', checkLowBalance);
job.start();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});