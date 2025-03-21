const express = require('express');
const db = require('../config/db');

const router = express.Router();

// ✅ Book an Appointment
router.post('/book', (req, res) => {
    console.log("Received request at /api/appointments/book"); // Debugging log
    const { patient_id, doctor_id, appointment_date } = req.body;

    if (!patient_id || !doctor_id || !appointment_date) {
        return res.status(400).json({ message: "All fields are required" });
    }

    db.query(
        'INSERT INTO appointments (patient_id, doctor_id, appointment_date) VALUES (?, ?, ?)',
        [patient_id, doctor_id, appointment_date],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err.message });

            res.status(201).json({ message: "Appointment booked successfully", appointment_id: result.insertId });
        }
    );
});

// ✅ Delete an Appointment
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.query(
        'DELETE FROM appointments WHERE id = ?',
        [id],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err.message });

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Appointment not found" });
            }

            res.json({ message: "Appointment deleted successfully" });
        }
    );
});

// ✅ Fetch All Appointments
router.get('/', (req, res) => {
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
});


module.exports = router;
