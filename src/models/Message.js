const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  body: { type: String, required: true },
  sender: { type: String },
  room: { type: String, default: 'عام' }, // خاصية الغرفة
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
