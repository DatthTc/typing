const express = require('express');
const router = express.Router();

const lessonController = require('../controllers/lessonController');
const customTextController = require('../controllers/customTextController');
const statsController = require('../controllers/statsController');
const authController = require('../controllers/authController');

// Trang chủ & Danh sách lộ trình bài học
router.get('/', lessonController.index);

// Chi tiết bài học
router.get('/lesson/:id', lessonController.show);

// Luyện tập tự do hoặc theo Custom ID
router.get('/practice', lessonController.practiceCustom);

// Quản lý văn bản tùy chọn (Custom Text)
router.get('/custom', customTextController.index);
router.post('/custom', customTextController.create);

// Thống kê & Phân tích Heatmap
router.get('/stats', statsController.getStats);

// Đấu trường gõ nhanh trực tuyến (Multiplayer Arena)
router.get('/arena', (req, res) => {
  res.render('pages/arena', {
    title: 'Đấu trường Gõ Nhanh Realtime - VN Typing',
    user: req.session.user || null
  });
});

// Xác thực & Tài khoản
router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.get('/register', authController.showRegister);
router.post('/register', authController.register);
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

module.exports = router;
