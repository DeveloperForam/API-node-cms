const express = require('express');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Function to generate a 4-digit random reference ID
const generateReferenceID = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// ✅ Register Clinic
router.post('/register', async (req, res) => {
    try {
        const { clinic_name, mobile_no, address, email, password } = req.body;
        const reference_id = generateReferenceID(); // Generate unique 4-digit ID

        // Check if email already exists
        db.query('SELECT * FROM clinics WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (results.length > 0) return res.status(400).json({ message: 'Clinic already registered' });

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert into database
            db.query(
                'INSERT INTO clinics (clinic_name, mobile_no, address, email, reference_id, password) VALUES (?, ?, ?, ?, ?, ?)',
                [clinic_name, mobile_no, address, email, reference_id, hashedPassword],
                (err, result) => {
                    if (err) return res.status(500).json({ message: 'Database error' });

                    res.status(201).json({ message: 'Clinic registered successfully', reference_id });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// ✅ Clinic Login
router.post('/login', async (req, res) => {
    try {
        const { clinic_name, reference_id, password } = req.body;

        db.query(
            'SELECT * FROM clinics WHERE clinic_name = ? AND reference_id = ?',
            [clinic_name, reference_id],
            async (err, results) => {
                if (err) return res.status(500).json({ message: 'Database error' });
                if (results.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

                const clinic = results[0];

                // Compare password
                const isMatch = await bcrypt.compare(password, clinic.password);
                if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

                // Generate token
                const token = jwt.sign(
                    { id: clinic.id, clinic_name: clinic.clinic_name, reference_id: clinic.reference_id },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                // Store token in database
                db.query('UPDATE clinics SET token = ? WHERE id = ?', [token, clinic.id], (updateErr) => {
                    if (updateErr) return res.status(500).json({ message: 'Error storing token' });

                    return res.status(200).json({ token, message: 'Login Successful' });
                });
            }
        );
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// ✅ Fetch Clinic List
router.get('/', (req, res) => {
    db.query('SELECT id ,clinic_name, mobile_no, address, email, reference_id FROM clinics', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results);
    });
});

//count clinics
router.get('/count', (req, res) => {
    const sql = "SELECT COUNT(*) AS total_clinics FROM clinics";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results[0]); // Sending count as JSON response
    });
});


// ✅ Update Clinic Details
router.put('/update/:reference_id', async (req, res) => {
    try {
        const { clinic_name, mobile_no, address, email, password } = req.body;
        const { reference_id } = req.params;

        // Check if clinic exists
        db.query('SELECT * FROM clinics WHERE reference_id = ?', [reference_id], async (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (results.length === 0) return res.status(404).json({ message: 'Clinic not found' });

            // Hash password if provided
            let hashedPassword = results[0].password;
            if (password) {
                hashedPassword = await bcrypt.hash(password, 10);
            }

            // Update clinic details
            db.query(
                'UPDATE clinics SET clinic_name = ?, mobile_no = ?, address = ?, email = ?, password = ? WHERE reference_id = ?',
                [clinic_name, mobile_no, address, email, hashedPassword, reference_id],
                (err, result) => {
                    if (err) return res.status(500).json({ message: 'Database error' });
                    res.json({ message: 'Clinic updated successfully' });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// ✅ Delete Clinic by Reference ID
router.delete('/delete/:reference_id', async (req, res) => {
    try {
        const { reference_id } = req.params;

        // Check if clinic exists
        db.query('SELECT * FROM clinics WHERE reference_id = ?', [reference_id], (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (results.length === 0) return res.status(404).json({ message: 'Clinic not found' });

            // Delete clinic
            db.query('DELETE FROM clinics WHERE reference_id = ?', [reference_id], (err, result) => {
                if (err) return res.status(500).json({ message: 'Database error' });

                res.json({ message: 'Clinic deleted successfully' });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// ✅ Clinic Logout
router.post('/logout', async (req, res) => {
    try {
        // Clear the token on the client side (handled in frontend)
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// ✅ Fetch Patients Clinic Wise
router.get('/patients/:reference_id', (req, res) => {
    const { reference_id } = req.params;
    
    db.query(
        'SELECT * FROM patients WHERE clinic_reference_id = ?', 
        [reference_id], 
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (results.length === 0) return res.status(404).json({ message: 'No patients found for this clinic' });
            res.json(results);
        }
    );
});



module.exports = router;
