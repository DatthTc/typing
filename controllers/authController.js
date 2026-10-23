const User = require('../models/User');
const bcrypt = require('bcrypt');

// Render trang đăng nhập
exports.showLogin = (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('pages/auth/login', {
    title: 'Đăng nhập - VN Typing',
    error: req.session.authError || null
  });
  req.session.authError = null;
};

// Render trang đăng ký
exports.showRegister = (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('pages/auth/register', {
    title: 'Đăng ký tài khoản - VN Typing',
    error: req.session.authError || null
  });
  req.session.authError = null;
};

// Xử lý đăng ký
exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password) {
      req.session.authError = 'Vui lòng điền đầy đủ các trường thông tin!';
      return res.redirect('/register');
    }

    if (password !== confirmPassword) {
      req.session.authError = 'Mật khẩu xác nhận không khớp!';
      return res.redirect('/register');
    }

    if (password.length < 6) {
      req.session.authError = 'Mật khẩu phải có độ dài tối thiểu 6 ký tự!';
      return res.redirect('/register');
    }

    // Kiểm tra xem username hoặc email đã tồn tại chưa
    const existingUser = await User.findOne({
      $or: [{ username: username.trim() }, { email: email.trim().toLowerCase() }]
    });

    if (existingUser) {
      req.session.authError = 'Tên người dùng hoặc email đã tồn tại!';
      return res.redirect('/register');
    }

    // Mã hóa mật khẩu
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Tạo người dùng mới
    const newUser = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      settings: {
        inputMethod: 'TELEX',
        soundTheme: 'blue'
      }
    });

    await newUser.save();

    // Thiết lập session người dùng
    req.session.user = {
      id: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email,
      settings: newUser.settings
    };

    res.redirect('/');
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    req.session.authError = 'Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại!';
    res.redirect('/register');
  }
};

// Xử lý đăng nhập
exports.login = async (req, res) => {
  try {
    const { account, password } = req.body;

    if (!account || !password) {
      req.session.authError = 'Vui lòng nhập tên đăng nhập/email và mật khẩu!';
      return res.redirect('/login');
    }

    const trimmedAccount = account.trim();
    // Cho phép đăng nhập bằng cả username hoặc email
    const user = await User.findOne({
      $or: [
        { username: trimmedAccount },
        { email: trimmedAccount.toLowerCase() }
      ]
    });

    if (!user) {
      req.session.authError = 'Tài khoản hoặc mật khẩu không chính xác!';
      return res.redirect('/login');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.session.authError = 'Tài khoản hoặc mật khẩu không chính xác!';
      return res.redirect('/login');
    }

    // Thiết lập session người dùng
    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      settings: user.settings
    };

    res.redirect('/');
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    req.session.authError = 'Đã có lỗi xảy ra khi đăng nhập. Vui lòng thử lại!';
    res.redirect('/login');
  }
};

// Xử lý đăng xuất
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Lỗi khi đăng xuất:', err);
    }
    res.redirect('/');
  });
};

// Cập nhật cài đặt người dùng (TELEX/VNI, soundTheme)
exports.updateSettings = async (req, res) => {
  try {
    const { inputMethod, soundTheme } = req.body;
    if (req.session.user) {
      const updateData = {};
      if (inputMethod) updateData['settings.inputMethod'] = inputMethod;
      if (soundTheme) updateData['settings.soundTheme'] = soundTheme;

      await User.findByIdAndUpdate(req.session.user.id, { $set: updateData });
      if (inputMethod) req.session.user.settings.inputMethod = inputMethod;
      if (soundTheme) req.session.user.settings.soundTheme = soundTheme;
    }
    res.json({ success: true, settings: req.session.user?.settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
