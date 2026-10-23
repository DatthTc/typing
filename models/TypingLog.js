const mongoose = require('mongoose');

const typingLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    default: null
  },
  customTitle: {
    type: String,
    default: ''
  },
  wpm: {
    type: Number,
    required: true
  },
  kcpm: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    required: true
  },
  missedKeys: {
    type: Map,
    of: Number,
    default: () => new Map()
  },
  duration: {
    type: Number, // In seconds
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TypingLog', typingLogSchema);
