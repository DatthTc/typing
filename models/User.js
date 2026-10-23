const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Tên người dùng là bắt buộc'],
    unique: true,
    trim: true,
    minlength: [3, 'Tên người dùng phải có ít nhất 3 ký tự'],
    maxlength: [30, 'Tên người dùng tối đa 30 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  passwordHash: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc']
  },
  settings: {
    inputMethod: {
      type: String,
      enum: ['TELEX', 'VNI'],
      default: 'TELEX'
    },
    soundTheme: {
      type: String,
      enum: ['blue', 'brown', 'red', 'typewriter', 'off'],
      default: 'blue'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
