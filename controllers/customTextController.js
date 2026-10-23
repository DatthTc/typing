const CustomText = require('../models/CustomText');
const { sanitizeText } = require('../utils/textSanitizer');

// Danh sách văn bản mẫu có sẵn (Presets)
const PRESET_TEXTS = [
  {
    title: 'Bài ca Đất Nước (Nguyễn Khoa Điềm)',
    content: 'Khi ta lớn lên Đất Nước đã có rồi. Đất Nước có trong những cái ngày xửa ngày xưa mẹ thường hay kể. Đất Nước bắt đầu với miếng trầu bây giờ bà ăn. Đất Nước lớn lên khi dân mình biết trồng tre mà đánh giặc.'
  },
  {
    title: 'Ca dao Dân ca Việt Nam',
    content: 'Công cha như núi Thái Sơn, nghĩa mẹ như nước trong nguồn chảy ra. Một lòng thờ mẹ kính cha, cho tròn chữ hiếu mới là đạo con.'
  },
  {
    title: 'Luyện câu đủ dấu tiếng Việt',
    content: 'Hoàng hôn buông xuống trên mặt hồ phẳng lặng, từng gợn sóng lăn tăn phản chiếu ánh chiều tà rực rỡ sắc vàng cam.'
  },
  {
    title: 'Tục ngữ về học tập & cuộc sống',
    content: 'Học thầy không tày học bạn. Có công mài sắt có ngày nên kim. Đi một ngày đàng học một sàng khôn. Luyện tập đều đặn mỗi ngày sẽ giúp đôi tay bạn trở nên thuần thục.'
  }
];

// Hiển thị trang Custom Import
exports.index = async (req, res) => {
  try {
    let savedTexts = [];
    if (req.session.user) {
      try {
        savedTexts = await CustomText.find({ userId: req.session.user.id })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean();
      } catch (err) {
        console.warn('Lỗi query customText:', err.message);
      }
    }

    res.render('pages/custom-import', {
      title: 'Nhập & Quản lý Văn bản Luyện gõ - VN Typing',
      savedTexts,
      presets: PRESET_TEXTS,
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Lỗi khi tải trang custom:', error);
    res.redirect('/');
  }
};

// Xử lý tạo văn bản mới từ Form (POST /custom)
exports.create = async (req, res) => {
  try {
    let { title, content } = req.body;

    if (!content || !content.trim()) {
      return res.redirect('/custom');
    }

    const cleanContent = sanitizeText(content);
    const cleanTitle = (title && title.trim()) || 'Văn bản tự nhập';

    let customRecord = null;
    try {
      customRecord = new CustomText({
        userId: req.session.user ? req.session.user.id : null,
        title: cleanTitle,
        content: cleanContent
      });
      await customRecord.save();
    } catch (saveErr) {
      console.warn('Lưu DB thất bại, fallback session:', saveErr.message);
    }

    if (customRecord && customRecord._id) {
      return res.redirect(`/practice?customId=${customRecord._id}`);
    } else {
      // Fallback khi DB nghẽn hoặc serverless: chuyển thẳng nội dung vào query để gõ ngay lập tức!
      const encodedTitle = encodeURIComponent(cleanTitle);
      const encodedText = encodeURIComponent(cleanContent);
      return res.redirect(`/practice?title=${encodedTitle}&text=${encodedText}`);
    }
  } catch (error) {
    console.error('Lỗi khi tạo custom text:', error);
    res.redirect('/custom');
  }
};

// API tạo văn bản (POST /api/custom/save)
exports.createApi = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });
    }

    const cleanContent = sanitizeText(content);
    const cleanTitle = (title && title.trim()) || 'Văn bản tùy chọn';

    const customRecord = new CustomText({
      userId: req.session.user ? req.session.user.id : null,
      title: cleanTitle,
      content: cleanContent
    });

    await customRecord.save();
    res.json({ success: true, customId: customRecord._id, content: cleanContent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
