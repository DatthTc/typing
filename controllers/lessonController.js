const Lesson = require('../models/Lesson');

// Lấy tất cả bài học, gom nhóm theo Level và render home.pug
exports.index = async (req, res) => {
  try {
    let lessons = [];
    try {
      lessons = await Lesson.find().sort({ level: 1, stage: 1 }).lean();
    } catch (dbErr) {
      console.warn('MongoDB query warning in lessonController.index:', dbErr.message);
    }

    // Gom nhóm theo Level 1 -> 4
    const levelsMap = {
      1: {
        title: 'Level 1: Hàng phím cơ sở (Home Row)',
        description: 'Luyện các phím trung tâm nơi đặt 8 ngón tay: F, J, D, K, S, L, A, ;, G, H.',
        lessons: []
      },
      2: {
        title: 'Level 2: Hàng phím trên & Hàng phím dưới',
        description: 'Vươn ngón lên hàng trên (Q-P) và hàng dưới (Z-M) với sự phối hợp nhịp nhàng.',
        lessons: []
      },
      3: {
        title: 'Level 3: Dấu Tiếng Việt (Telex & VNI)',
        description: 'Luyện các nguyên âm có mũ/móc (ă, â, ê, ô, ơ, ư, đ) và 5 thanh điệu tiếng Việt.',
        lessons: []
      },
      4: {
        title: 'Level 4: Âm tiết, Vần & Từ ghép Tiếng Việt',
        description: 'Thực hành các cụm phụ âm đầu (ngh, tr, ph, kh) và vần dài (oang, uyên, ương).',
        lessons: []
      }
    };

    lessons.forEach((l) => {
      if (levelsMap[l.level]) {
        levelsMap[l.level].lessons.push(l);
      }
    });

    res.render('pages/home', {
      title: 'Luyện Gõ 10 Ngón Tiếng Việt - VN Typing',
      levels: levelsMap,
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Lỗi khi tải danh sách bài học:', error);
    res.status(500).render('pages/home', {
      title: 'Luyện Gõ 10 Ngón Tiếng Việt',
      levels: {},
      error: 'Không thể kết nối đến cơ sở dữ liệu. Vui lòng chạy npm run seed!'
    });
  }
};

// Lấy chi tiết một bài học và render practice.pug
exports.show = async (req, res) => {
  try {
    const { id } = req.params;
    let lesson = null;

    try {
      lesson = await Lesson.findById(id).lean();
    } catch (err) {
      console.warn('Lesson findById error:', err.message);
    }

    if (!lesson) {
      return res.redirect('/');
    }

    // Tìm bài học tiếp theo (nếu có)
    let nextLesson = null;
    try {
      nextLesson = await Lesson.findOne({
        $or: [
          { level: lesson.level, stage: lesson.stage + 1 },
          { level: lesson.level + 1, stage: 1 }
        ]
      }).sort({ level: 1, stage: 1 }).lean();
    } catch (err) {
      console.warn('Next lesson lookup error:', err.message);
    }

    res.render('pages/practice', {
      title: `Bài học: ${lesson.title} - VN Typing`,
      lesson,
      nextLesson,
      inputMethod: req.session.user?.settings?.inputMethod || 'TELEX',
      soundTheme: req.session.user?.settings?.soundTheme || 'blue',
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Lỗi khi mở bài học:', error);
    res.redirect('/');
  }
};

// Practice mode chung (hỗ trợ query param customId hoặc custom text)
exports.practiceCustom = async (req, res) => {
  try {
    const { customId, text, title } = req.query;
    let customData = null;

    if (customId) {
      try {
        const CustomText = require('../models/CustomText');
        customData = await CustomText.findById(customId).lean();
      } catch (dbErr) {
        console.warn('Lỗi đọc customId từ DB:', dbErr.message);
      }
    }

    // Lấy nội dung từ query hoặc session fallback
    const resolvedContent = (customData && customData.content) ||
      (text ? decodeURIComponent(text) : null) ||
      (req.session && req.session.tempCustomText && req.session.tempCustomText.content) ||
      'Việt Nam đất nước ta ơi, mênh mông biển lúa đâu trời đẹp hơn. Cánh cò bay lả rập rờn, mây mờ che đỉnh Trường Sơn sớm chiều.';

    const resolvedTitle = (customData && customData.title) ||
      (title ? decodeURIComponent(title) : null) ||
      (req.session && req.session.tempCustomText && req.session.tempCustomText.title) ||
      'Luyện tập văn bản tùy chọn';

    const lesson = {
      _id: customData ? customData._id : 'custom-session',
      title: resolvedTitle,
      content: resolvedContent,
      description: 'Luyện tập tự do với đoạn văn bản tiếng Việt',
      targetKeys: []
    };

    res.render('pages/practice', {
      title: `${lesson.title} - VN Typing`,
      lesson,
      nextLesson: null,
      inputMethod: req.session.user?.settings?.inputMethod || 'TELEX',
      soundTheme: req.session.user?.settings?.soundTheme || 'blue',
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Lỗi practiceCustom:', error);
    // Kể cả có lỗi bất ngờ, render luôn trang practice với bài mẫu thay vì redirect về home
    res.render('pages/practice', {
      title: 'Luyện tập tự do - VN Typing',
      lesson: {
        _id: 'default',
        title: 'Luyện tập tự do',
        content: 'Học gõ mười ngón tiếng Việt phản xạ nhanh nhạy và chính xác mỗi ngày.',
        targetKeys: []
      },
      nextLesson: null,
      inputMethod: 'TELEX',
      soundTheme: 'blue',
      user: null
    });
  }
};
