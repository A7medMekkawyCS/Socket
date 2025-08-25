const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const { connectToDatabase } = require('./config/db');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
		methods: ['GET', 'POST']
	}
});

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Health route
app.get('/health', (req, res) => {
	return res.json({ status: 'ok', time: new Date().toISOString() });
});

// Basic API route example
app.get('/api/hello', (req, res) => {
	res.json({ message: 'Hello from Express + Socket.IO backend' });
});

// Socket.IO handlers
io.on('connection', (socket) => {
	console.log('Client connected:', socket.id);

	socket.on('message', (data) => {
		// Broadcast to all clients
		io.emit('message', { from: socket.id, data });
	});

	socket.on('disconnect', (reason) => {
		console.log('Client disconnected:', socket.id, reason);
	});
});

const PORT = process.env.PORT || 4000;

(async () => {
	await connectToDatabase();
	server.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}`);
	});
})(); 