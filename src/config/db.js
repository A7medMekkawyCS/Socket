const mongoose = require('mongoose');

const connectToDatabase = async () => {
	const mongoUri = process.env.MONGODB_URI;
	if (!mongoUri) {
		throw new Error('MONGODB_URI is not set');
	}
	try {
		await mongoose.connect(mongoUri, {
			serverSelectionTimeoutMS: 10000
		});
		console.log('MongoDB connected');
	} catch (error) {
		console.error('MongoDB connection error:', error.message);
		process.exit(1);
	}
};

module.exports = { connectToDatabase }; 