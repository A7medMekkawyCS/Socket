const mongoose = require('mongoose');

const connectToDatabase = async () => {
	const mongoUri = process.env.MONGODB_URI;
	if (!mongoUri) {
		console.log('MONGODB_URI is not set');
	}
	try {
		await mongoose.connect(mongoUri);
		console.log('MongoDB connected');
	} catch (error) {
		console.error('MongoDB connection error:', error.message);
		process.exit(1);
	}
};

module.exports = { connectToDatabase }; 