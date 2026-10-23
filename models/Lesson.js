const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  stage: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  targetKeys: [{
    type: String,
    trim: true
  }],
  content: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index to ensure unique level + stage pair and fast lookup
lessonSchema.index({ level: 1, stage: 1 }, { unique: true });

module.exports = mongoose.model('Lesson', lessonSchema);
