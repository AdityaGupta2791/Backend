const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'changeme', {
    expiresIn: process.env.JWT_EXPIRES || '1d',
  });

const getProfile = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, password } = req.body;

    // Disallow changing email via profile update
    if (typeof email !== 'undefined' && email !== user.email) {
      return res.status(400).json({ message: 'Email cannot be changed' });
    }

    if (name) user.name = name;
    if (password) user.password = password; // will be hashed by pre('save')

    await user.save();

    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile };