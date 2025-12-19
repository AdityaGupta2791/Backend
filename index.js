require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 4000;

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
