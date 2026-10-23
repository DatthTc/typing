const express = require('express');
const router = express.Router();

const statsController = require('../controllers/statsController');
const customTextController = require('../controllers/customTextController');
const authController = require('../controllers/authController');
const Lesson = require('../models/Lesson');

// Lưu kết quả gõ phím
router.post('/stats/save', statsController.saveResult);

// Tạo bài luyện cho các phím yếu
router.get('/stats/weak-keys-lesson', statsController.generateWeakKeysLesson);

// Lưu văn bản tùy chọn qua API
router.post('/custom/save', customTextController.createApi);

// Lấy danh sách bài học
router.get('/lessons', async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ level: 1, stage: 1 });
    res.json({ success: true, data: lessons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cập nhật cài đặt người dùng (TELEX/VNI, âm thanh)
router.post('/settings/update', authController.updateSettings);

module.exports = router;
