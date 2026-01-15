require('dotenv').config();

// Validate critical environment variables on startup
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ ERROR: GEMINI_API_KEY is missing from environment variables');
  console.error('Please set GEMINI_API_KEY in your .env file');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI is missing from environment variables');
  console.error('Please set MONGODB_URI in your .env file');
  process.exit(1);
}

// Initialize Gemini config (will throw if API key is invalid)
try {
  require('./config/gemini');
  console.log('✅ Gemini AI configured successfully');
} catch (error) {
  console.error('❌ ERROR: Gemini configuration failed:', error.message);
  process.exit(1);
}

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
