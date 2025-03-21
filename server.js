const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes'); 
const appointmentRoutes = require('./routes/appointmentsRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/admin', adminRoutes); // ✅ Ensure this route is correct
app.use('/api/clinic', clinicRoutes); // Use clinic routes
app.use('/api/doctor', doctorRoutes); // Use Doctor routes
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
