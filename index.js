require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const mainRouter = require('./routes/index.js');  

// Validate env
const requiredEnv = ['MONGO_URI', 'PORT', 'JWT_SECRET', 'JWT_EXPIRES'];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const app = express();

const port = parseInt(process.env.PORT, 10);
if (Number.isNaN(port) || port <= 0) {
  console.error('Invalid PORT environment variable. It must be a positive integer');
  process.exit(1);
}

app.use(express.json());
app.use(cors());

connectDB();

// Static images
app.use('/images', express.static(path.join(__dirname, 'upload', 'images')));

// Mount ALL API routes 
app.use('/api/v1', mainRouter);

// Start server
app.listen(port, (err) => {
  if (!err) console.log(`Server running on port ${port}`);
  else console.error('Error:', err);
});
