const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');

// Import Models for Sync
require('./models/User');
require('./models/Mess');
require('./models/MessMember');
require('./models/Expense');
require('./models/Settlement');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const messRoutes = require('./routes/messRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const settlementRoutes = require('./routes/settlementRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Serve static files from the public folder
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route to serve the frontend for any non-API requests
app.get('/:path*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await sequelize.authenticate();
        console.log('Database connected!');
    } catch (err) {
        console.log(err);
    }
});
