const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Database connection file

// Add Schedule
router.post("/add", (req, res) => {
  const { clinic_id, doctor_id, available_days, time } = req.body;

  const query = `INSERT INTO schedules (clinic_id, doctor_id, available_days, time) VALUES (?, ?, ?, ?)`;
  db.query(query, [clinic_id, doctor_id, available_days, time], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Failed to add schedule" });
    } else {
      res.status(201).json({ message: "Schedule added successfully", schedule_id: result.insertId });
    }
  });
});

// Update Schedule
router.put("/update/:id", (req, res) => {
  const { id } = req.params;
  const { clinic_id, doctor_id, available_days, time } = req.body;

  const query = `UPDATE schedules SET clinic_id = ?, doctor_id = ?, available_days = ?, time = ? WHERE id = ?`;
  db.query(query, [clinic_id, doctor_id, available_days, time, id], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Failed to update schedule" });
    } else {
      res.status(200).json({ message: "Schedule updated successfully" });
    }
  });
});

// Delete Schedule
router.delete("/delete/:id", (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM schedules WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Failed to delete schedule" });
    } else {
      res.status(200).json({ message: "Schedule deleted successfully" });
    }
  });
});

// Fetch Schedules with Clinic and Doctor Names
router.get("/list", (req, res) => {
  const query = `
    SELECT schedules.id, clinics.name AS clinic_name, doctors.name AS doctor_name, schedules.available_days, schedules.time
    FROM schedules
    JOIN clinics ON schedules.clinic_id = clinics.id
    JOIN doctors ON schedules.doctor_id = doctors.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: "Failed to fetch schedules" });
    } else {
      res.status(200).json({ schedules: results });
    }
  });
});

// Count Total Schedules
router.get("/count", (req, res) => {
  const query = `SELECT COUNT(*) AS total_schedules FROM schedules`;

  db.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Failed to count schedules" });
    } else {
      res.status(200).json({ total_schedules: result[0].total_schedules });
    }
  });
});

module.exports = router;
