const express = require('express');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// ✅ Add Doctor to a Clinic
router.post('/add', async (req, res) => {
    try {
        const { clinic_id, doctor_name, email, mobile_no, specialization, experience, gender, schedule, dob, address } = req.body;

        // Validate required fields
        if (!clinic_id || !doctor_name || !email || !mobile_no || !specialization || !experience || !gender || !dob || !address) {
            return res.status(400).json({ message: "All fields are required" });
        }

        db.query('SELECT * FROM doctors WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: 'Database error' });
            }
            if (results.length > 0) return res.status(400).json({ message: 'Doctor already exists' });

            const scheduleJSON = JSON.stringify(schedule || []);

            db.query(
                'INSERT INTO doctors (clinic_id, doctor_name, email, mobile_no, specialization, experience, gender, schedule, dob, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [clinic_id, doctor_name, email, mobile_no, specialization, experience, gender, scheduleJSON, dob, address],
                (err, result) => {
                    if (err) {
                        console.error("Insert error:", err);
                        return res.status(500).json({ message: 'Database error' });
                    }
                    res.status(201).json({ message: 'Doctor added successfully' });
                }
            );
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// ✅ Update Doctor
router.put('/update/:doctor_id', async (req, res) => {
    try {
        const { doctor_name, email, mobile_no, specialization, experience, gender, schedule, dob, address } = req.body;
        const scheduleJSON = JSON.stringify(schedule);

        db.query(
            'UPDATE doctors SET doctor_name=?, email=?, mobile_no=?, specialization=?, experience=?, gender=?, schedule=?, dob=?, address=? WHERE id=?',
            [doctor_name, email, mobile_no, specialization, experience, gender, scheduleJSON, dob, address, req.params.doctor_id],
            (err, result) => {
                if (err) return res.status(500).json({ message: 'Database error' });
                res.json({ message: 'Doctor updated successfully' });
            }
        );
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// ✅ Fetch All Doctors in a Clinic
router.get('/list/:clinic_id', (req, res) => {
    db.query('SELECT * FROM doctors WHERE clinic_id = ?', [req.params.clinic_id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results);
    });
});

// ✅ Delete Doctor
router.delete('/delete/:doctor_id', (req, res) => {
    db.query('DELETE FROM doctors WHERE id = ?', [req.params.doctor_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Doctor deleted successfully' });
    });
});

// ✅ Doctor Login
router.post('/clinic/login', async (req, res) => {
    try {
        const { clinic_name, reference_id, password } = req.body;

        db.query('SELECT * FROM clinics WHERE clinic_name = ? AND reference_id = ?', 
            [clinic_name, reference_id], async (err, results) => {
            
            if (err) return res.status(500).json({ message: 'Database error' });
            if (results.length === 0) return res.status(400).json({ message: 'Clinic not found' });

            const clinic = results[0];

            // Verify password (assuming you store hashed passwords)
            const validPassword = await bcrypt.compare(password, clinic.password);
            if (!validPassword) return res.status(401).json({ message: 'Invalid password' });

            // Generate token
            const token = jwt.sign(
                { id: clinic.id, clinic_name: clinic.clinic_name },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({ message: 'Login successful', token });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


// ✅ Doctor Logout
router.post('/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});

// ✅ Get All Doctors Clinic-Wise
router.get('/clinic-wise', (req, res) => {
    const query = `
        SELECT 
            c.id AS clinic_id, 
            c.clinic_name, 
            d.id AS doctor_id, 
            d.doctor_name, 
            d.email, 
            d.mobile_no, 
            d.specialization, 
            d.experience, 
            d.gender, 
            d.dob,
            d.address
        FROM clinics c
        LEFT JOIN doctors d ON c.id = d.clinic_id
        ORDER BY c.id, d.id;
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });

        // Return results directly instead of grouping by clinic
        res.json(results);
    });
});



module.exports = router;
 