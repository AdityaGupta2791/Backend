const express = require('express');
const { signup, signin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const router = require('express').Router();

router.post('/signup', signup);
router.post('/signin', signin);

// Get current logged in user
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
