require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const workerRoutes = require('./routes/workerRoutes');
const adminRoutes = require('./routes/adminRoutes');

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] },
});

app.use('/api/customer/payment/webhook', express.raw({ type: 'application/json' }));

// Make io accessible in controllers via req.app.get('io') if needed for live status updates
app.set('io', io);

io.on('connection', (socket) => {
  socket.on('joinRoom', (userId) => socket.join(userId));
  socket.on('disconnect', () => {});
});

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'LaborLink API is running' }));

app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`LaborLink API listening on port ${PORT}`));

module.exports = { app, io };
