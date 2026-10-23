const TypingLog = require('../models/TypingLog');
const Lesson = require('../models/Lesson');

// Lưu kết quả gõ (POST /api/stats/save)
exports.saveResult = async (req, res) => {
  try {
    const { wpm, kcpm, accuracy, missedKeys, duration, lessonId, customTitle } = req.body;

    const logData = {
      userId: req.session.user ? req.session.user.id : null,
      lessonId: lessonId && lessonId.length === 24 ? lessonId : null,
      customTitle: customTitle || '',
      wpm: Number(wpm) || 0,
      kcpm: Number(kcpm) || 0,
      accuracy: Number(accuracy) || 0,
      missedKeys: missedKeys || {},
      duration: Number(duration) || 0
    };

    const newLog = new TypingLog(logData);
    await newLog.save();

    res.json({
      success: true,
      logId: newLog._id,
      message: 'Kết quả đã được lưu thành công!'
    });
  } catch (error) {
    console.error('Lỗi khi lưu kết quả gõ:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Hiển thị trang Thống kê & Phân tích Heatmap (GET /stats)
exports.getStats = async (req, res) => {
  try {
    let logs = [];
    const userId = req.session.user ? req.session.user.id : null;

    try {
      if (userId) {
        logs = await TypingLog.find({ userId })
          .populate('lessonId', 'title level stage')
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
      } else {
        // Cho khách vãng lai: lấy 10 log gần nhất
        logs = await TypingLog.find()
          .populate('lessonId', 'title level stage')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();
      }
    } catch (dbErr) {
      console.warn('Lỗi query TypingLog:', dbErr.message);
    }

    // Tính toán chỉ số tổng hợp
    let totalWpm = 0;
    let maxWpm = 0;
    let totalAccuracy = 0;
    const heatmap = {}; // { 'a': 12, 's': 4, ... }

    logs.forEach(log => {
      totalWpm += log.wpm || 0;
      if (log.wpm > maxWpm) maxWpm = log.wpm;
      totalAccuracy += log.accuracy || 0;

      // Gom phím gõ sai
      if (log.missedKeys) {
        const keysObj = log.missedKeys instanceof Map ? Object.fromEntries(log.missedKeys) : log.missedKeys;
        for (const [key, count] of Object.entries(keysObj)) {
          const lowerKey = key.toLowerCase();
          heatmap[lowerKey] = (heatmap[lowerKey] || 0) + Number(count);
        }
      }
    });

    const count = logs.length;
    const avgWpm = count > 0 ? Math.round(totalWpm / count) : 0;
    const avgAccuracy = count > 0 ? Math.round(totalAccuracy / count) : 0;

    // Chuẩn bị dữ liệu cho Chart.js (đảo ngược để hiển thị từ cũ đến mới)
    const reversedLogs = [...logs].reverse();
    const chartLabels = reversedLogs.map((log, index) => {
      const date = new Date(log.createdAt);
      return `#${index + 1} (${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')})`;
    });
    const chartWpmData = reversedLogs.map(log => log.wpm);
    const chartAccuracyData = reversedLogs.map(log => log.accuracy);

    // Xác định top các phím hay gõ sai nhất
    const sortedMissed = Object.entries(heatmap).sort((a, b) => b[1] - a[1]);
    const weakKeys = sortedMissed.slice(0, 5).map(item => item[0]);

    res.render('pages/stats', {
      title: 'Thống kê Kỹ năng Gõ 10 Ngón - VN Typing',
      logs,
      avgWpm,
      maxWpm,
      avgAccuracy,
      totalCompleted: count,
      heatmapJSON: JSON.stringify(heatmap),
      chartLabelsJSON: JSON.stringify(chartLabels),
      chartWpmDataJSON: JSON.stringify(chartWpmData),
      chartAccuracyDataJSON: JSON.stringify(chartAccuracyData),
      weakKeys,
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Lỗi khi tải trang stats:', error);
    res.redirect('/');
  }
};

// API tạo bài luyện riêng cho các phím yếu (GET /api/stats/weak-keys-lesson)
exports.generateWeakKeysLesson = async (req, res) => {
  try {
    const userId = req.session.user ? req.session.user.id : null;
    const logs = await TypingLog.find(userId ? { userId } : {}).limit(30).lean();

    const heatmap = {};
    logs.forEach(log => {
      if (log.missedKeys) {
        const keysObj = log.missedKeys instanceof Map ? Object.fromEntries(log.missedKeys) : log.missedKeys;
        for (const [key, count] of Object.entries(keysObj)) {
          const lowerKey = key.toLowerCase();
          heatmap[lowerKey] = (heatmap[lowerKey] || 0) + Number(count);
        }
      }
    });

    const topKeys = Object.entries(heatmap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(k => k[0]);

    const activeKeys = topKeys.length > 0 ? topKeys : ['f', 'j', 'd', 'k'];

    // Tạo các chuỗi luyện tập tập trung vào các phím này
    const patterns = [];
    for (let i = 0; i < activeKeys.length; i++) {
      const k1 = activeKeys[i];
      const k2 = activeKeys[(i + 1) % activeKeys.length];
      patterns.push(`${k1}${k2}${k1} ${k2}${k1}${k2} ${k1}${k1} ${k2}${k2}`);
    }
    const generatedContent = patterns.join(' ') + ' ' + activeKeys.join('') + ' ' + activeKeys.reverse().join('');

    res.json({
      success: true,
      weakKeys: activeKeys,
      content: generatedContent
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
