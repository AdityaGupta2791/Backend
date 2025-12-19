require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Validate required environment variables at startup
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

// Connect to database
connectDB();

// Serve uploaded images
app.use('/images', express.static(path.join(__dirname, 'upload', 'images')));

// Health check
app.get('/', (req, res) => res.send('Express App is Running'));

// Routes
app.use('/', productRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.listen(port, (err) => {
  if (!err) console.log(`Server Running on Port ${port}`);
  else console.error('Error :', err);
});
