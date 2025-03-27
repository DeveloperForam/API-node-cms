const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Create a schedule
router.post("/add", (req, res) => {
    console.log(req.body);  // Debugging
    const { clinic_id, doctor_id, available_days, available_time } = req.body;
    if (!clinic_id || !doctor_id || !available_days || !available_time) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const sql = "INSERT INTO schedules (clinic_id, doctor_id, available_days, available_time) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [clinic_id, doctor_id, available_days, available_time], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, ...req.body });
    });
  });
  

// Get all schedules
router.get("/", (req, res) => {
  const sql = "SELECT * FROM schedules";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
});

// Update a schedule
router.put("/update/:id", (req, res) => {
  const { available_days, available_time } = req.body;
  const { id } = req.params;
  const sql = "UPDATE schedules SET available_days = ?, available_time = ? WHERE id = ?";

  db.query(sql, [available_days, available_time, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: "Schedule updated successfully" });
  });
});

// Delete a schedule
router.delete("/delete/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM schedules WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: "Schedule deleted successfully" });
  });
});

module.exports = router;
