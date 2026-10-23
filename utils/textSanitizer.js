/**
 * textSanitizer.js
 * Utility chuẩn hóa Unicode NFC và làm sạch ký tự rác cho văn bản luyện gõ Tiếng Việt
 */

function sanitizeText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return '';
  }

  // 1. Chuẩn hóa về bảng mã Unicode chuẩn NFC (Unicode dựng sẵn)
  let text = rawText.normalize('NFC');

  // 2. Chuyển đổi ngoặc kép cong, ngoặc kép pháp sang ngoặc kép thẳng "
  text = text.replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"');

  // 3. Chuyển đổi ngoặc đơn cong, dấu nháy đơn lạ sang nháy đơn thẳng '
  text = text.replace(/[\u2018\u2019\u201A\u201B\u2039\u203A]/g, "'");

  // 4. Chuyển gạch ngang dài (em-dash, en-dash, figure dash, horizontal bar) sang dấu trừ -
  text = text.replace(/[\u2012\u2013\u2014\u2015\u2212]/g, '-');

  // 5. Chuyển các loại khoảng trắng đặc biệt (Non-breaking space, zero-width, em-space, v.v.) thành space thông thường
  text = text.replace(/[\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ');

  // 6. Chuẩn hóa dấu xuống dòng: \r\n hoặc \r thành \n
  text = text.replace(/\r\n|\r/g, '\n');

  // 7. Xóa bỏ các ký tự điều khiển ẩn không in được (ngoại trừ \n và \t)
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 8. Chuẩn hóa khoảng trắng: thay tab bằng 4 khoảng trắng, gộp nhiều khoảng trắng liên tiếp thành 1
  text = text.replace(/\t/g, '    ');
  text = text.split('\n').map(line => line.replace(/ +/g, ' ').trim()).join('\n');

  // 9. Giới hạn không quá 2 dòng trống liên tiếp
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

module.exports = {
  sanitizeText
};
