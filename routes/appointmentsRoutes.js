const express = require('express');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// ✅ Book an Appointment
router.post('/book', async (req, res) => {
    try {
        const { patient_id, doctor_id, appointment_date } = req.body;

        if (!patient_id || !doctor_id || !appointment_date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Insert appointment into the database
        db.query(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date) VALUES (?, ?, ?)',
            [patient_id, doctor_id, appointment_date],
            (err, result) => {
                if (err) return res.status(500).json({ message: "Database error", error: err.message });

                res.status(201).json({ message: "Appointment booked successfully", appointment_id: result.insertId });
            }
        );
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Cancel Appointment
router.put('/cancel/:id', async (req, res) => {
    try {
        const { id } = req.params;

        db.query(
            'UPDATE appointments SET status = "Cancelled" WHERE id = ?',
            [id],
            (err, result) => {
                if (err) return res.status(500).json({ message: "Database error", error: err.message });

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Appointment not found" });
                }

                res.json({ message: "Appointment cancelled successfully" });
            }
        );
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Fetch Appointments (with doctor name)
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                a.id AS appointment_id,
                a.appointment_date,
                a.status,
                p.name AS patient_name,
                d.doctor_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
            ORDER BY a.appointment_date DESC
        `;

        db.query(query, (err, results) => {
            if (err) return res.status(500).json({ message: "Database error", error: err.message });

            res.json(results);
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
