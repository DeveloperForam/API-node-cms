const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes'); 
const appointmentRoutes = require('./routes/appointmentsRoutes');
const scheduleRoutes = require("./routes/scheduleRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/admin', adminRoutes); 
app.use('/api/clinic', clinicRoutes); 
app.use('/api/doctor', doctorRoutes); 
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use("/api/schedules", scheduleRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
