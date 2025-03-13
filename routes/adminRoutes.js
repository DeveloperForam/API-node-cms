const express = require('express');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register Admin
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        db.query('SELECT * FROM admins WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (results.length > 0) return res.status(400).json({ message: 'Admin already exists' });

            const hashedPassword = await bcrypt.hash(password, 10);

            db.query('INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword],
                (err, result) => {
                    if (err) return res.status(500).json({ message: 'Database error' });
                    res.status(201).json({ message: 'Admin registered successfully' });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Login Admin
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM admins WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

        const admin = results[0];

        bcrypt.compare(password, admin.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error checking password' });
            if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

            const token = jwt.sign(
                { id: admin.id, email: admin.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({ token });
        });
    });
});

router.post('/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});


// Protected Route
router.get('/dashboard', authMiddleware, (req, res) => {
    res.json({ message: 'Welcome to the Admin Dashboard', admin: req.admin });
});

module.exports = router;
