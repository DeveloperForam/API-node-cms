const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Database connection file

// Book an appointment
router.post("/book", (req, res) => {
    const { patient_id, doctor_id, clinic_id, appointment_time, date, mobile_no, status } = req.body;

    const query = `
        INSERT INTO appointments (patient_id, doctor_id, clinic_id, appointment_time, date, mobile_no, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [patient_id, doctor_id, clinic_id, appointment_time, date, mobile_no, status], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Appointment booked successfully", appointmentId: result.insertId });
    });
});

// Edit an appointment
router.put("/edit/:id", (req, res) => {
    const { appointment_time, date, status } = req.body;
    const appointmentId = req.params.id;

    const query = `UPDATE appointments SET appointment_time = ?, date = ?, status = ? WHERE id = ?`;

    db.query(query, [appointment_time, date, status, appointmentId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: "Appointment updated successfully" });
    });
});

// Delete an appointment
router.delete("/delete/:id", (req, res) => {
    const appointmentId = req.params.id;

    const query = `DELETE FROM appointments WHERE id = ?`;

    db.query(query, [appointmentId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: "Appointment deleted successfully" });
    });
});

// List all appointments
router.get("/list", (req, res) => {
    const sql = `
        SELECT 
            a.id AS appointment_id,
            p.name AS patient_name, 
            d.doctor_name, 
            c.clinic_name, 
            a.appointment_time, 
            a.date, 
            a.status
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN clinics c ON a.clinic_id = c.id;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

//count api
router.get("/count", (req, res) => {
    const sql = "SELECT COUNT(*) AS total_appointments FROM appointments";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results[0]); // Sending the count as a response
    });
});


//book slot
router.get("/booked-slots", (req, res) => {
    const { doctor_id, date } = req.query;
  
    if (!doctor_id || !date) {
      return res.status(400).json({ error: "Doctor ID and date are required" });
    }
  
    // Query to fetch booked appointment times
    const sql = `SELECT appointment_time FROM appointments WHERE doctor_id = ? AND date = ? AND status = 'booked'`;
  
    db.query(sql, [doctor_id, date], (err, results) => {
      if (err) {
        console.error("Error fetching booked slots:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
  
      res.json(results.map((row) => row.appointment_time));
    });
  });
  

module.exports = router;
