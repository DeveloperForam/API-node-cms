const express = require('express');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ 1️⃣ Register (Insert Patient)
router.post('/register', async (req, res) => {
    try {
        const { name, birthdate, mobileno, address, email, gender, age, status, password } = req.body;

        // Check if email already exists
        const [existingPatient] = await db.promise().query('SELECT * FROM patients WHERE email = ?', [email]);
        if (existingPatient.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert patient
        const query = `
            INSERT INTO patients (name, birthdate, mobileno, address, email, gender, age, status, password) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await db.promise().query(query, [name, birthdate, mobileno, address, email, gender, age, status, hashedPassword]);

        res.status(201).json({ message: "Patient registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Database error", error: error.message });
    }
});

// ✅ 2️⃣ Update Patient
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, birthdate, mobileno, address, email, gender, age, status, password } = req.body;

        // Hash the password before updating
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            UPDATE patients 
            SET name=?, birthdate=?, mobileno=?, address=?, email=?, gender=?, age=?, status=?, password=?
            WHERE id=?`;

        const [result] = await db.promise().query(query, [
            name, birthdate, mobileno, address, email, gender, age, status, hashedPassword, id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.json({ message: "Patient updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Database error", error: error.message });
    }
});

// ✅ 3️⃣ Delete Patient
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.promise().query('DELETE FROM patients WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.json({ message: "Patient deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Database error", error: error.message });
    }
});

// ✅ 4️⃣ Patient Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [patient] = await db.promise().query('SELECT * FROM patients WHERE email = ?', [email]);

        if (patient.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, patient[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: patient[0].id, email: patient[0].email }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Database error", error: error.message });
    }
});

// ✅ 5️⃣ Patient Logout (Client-side Token Removal)
router.post('/logout', (req, res) => {
    res.json({ message: "Logout successful (remove token on client-side)" });
});

// ✅ Fetch All Patients
router.get('/', async (req, res) => {
    try {
        const [patients] = await db.promise().query('SELECT id, name, birthdate, mobileno, address, email, gender, age, status FROM patients');
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: "Database error", error: error.message });
    }
});

//count patient
router.get('/count', async (req, res) => {
    try {
        const [result] = await db.promise().query("SELECT COUNT(*) AS total_patients FROM patients");
        res.json(result[0]); // Returns total count of patients
    } catch (error) {
        res.status(500).json({ message: "Database error", error: error.message });
    }
});

// ✅ Fetch Single Patient by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [patient] = await db.promise().query('SELECT id, name, birthdate, mobileno, address, email, gender, age, status FROM patients WHERE id = ?', [id]);

        if (patient.length === 0) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.json(patient[0]);
    } catch (error) {
        res.status(500).json({ message: "Database error", error: error.message });
    }
});


module.exports = router;
