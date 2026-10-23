require('dotenv').config();
const mongoose = require('mongoose');
const Lesson = require('../models/Lesson');

const sampleLessons = [
  // =================== LEVEL 1: HÀNG PHÍM CƠ SỞ ===================
  {
    level: 1,
    stage: 1,
    title: 'Phím định vị F và J',
    targetKeys: ['f', 'j', ' '],
    content: 'fjfjfj jfjfjf fff jjj fj jf ff jj fjf jfj fff jjj fj jf ff jj fff jjj',
    description: 'Hai phím có gờ nổi định vị cho 2 ngón trỏ của bàn tay trái và phải.'
  },
  {
    level: 1,
    stage: 2,
    title: 'Mở rộng hàng cơ sở D, K, S, L, A, ;',
    targetKeys: ['d', 'k', 's', 'l', 'a', ';', ' '],
    content: 'asdf jkl; asdfjkl; sdf jkl dak las sal fad kad lad fall dad ask glad',
    description: 'Luyện tập các ngón áp út, ngón giữa và ngón út trên hàng phím cơ sở.'
  },
  {
    level: 1,
    stage: 3,
    title: 'Hàng cơ sở toàn diện G và H',
    targetKeys: ['g', 'h', 'f', 'j', 'd', 'k', 's', 'l', 'a', ';'],
    content: 'fghj gfhj ghf jhg asdfghjkl; flag half flash dash glad shall hall half',
    description: 'Vươn ngón trỏ sang 2 phím trung tâm G và H, kết hợp trọn vẹn hàng cơ sở.'
  },

  // =================== LEVEL 2: HÀNG TRÊN VÀ HÀNG DƯỚI ===================
  {
    level: 2,
    stage: 1,
    title: 'Hàng phím trên: Q, W, E, R, T, Y, U, I, O, P',
    targetKeys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    content: 'qwerty uiop qwert yuiop we try out your power pure tree write quote equip wire',
    description: 'Vươn các ngón tay lên hàng phím trên một cách chuẩn xác mà không nhấc cổ tay.'
  },
  {
    level: 2,
    stage: 2,
    title: 'Hàng phím dưới: Z, X, C, V, B, N, M',
    targetKeys: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    content: 'zxcvb nm zxc vbn mzn cbv scan zoom calm van bank exam climb buzz mix pack',
    description: 'Hạ các ngón tay xuống hàng phím dưới, giữ cổ tay luôn cố định nhẹ nhàng.'
  },
  {
    level: 2,
    stage: 3,
    title: 'Kết hợp cả 3 hàng phím',
    targetKeys: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
    content: 'the quick brown fox jumps over the lazy dog pack my box with five dozen liquor jugs',
    description: 'Bài tập kinh điển chứa toàn bộ 26 chữ cái trên bàn phím chuẩn ANSI.'
  },

  // =================== LEVEL 3: DẤU TIẾNG VIỆT (TELEX / VNI) ===================
  {
    level: 3,
    stage: 1,
    title: 'Nguyên âm có mũ và móc: ă, â, ê, ô, ơ, ư, đ',
    targetKeys: ['ă', 'â', 'ê', 'ô', 'ơ', 'ư', 'đ'],
    content: 'ăn cơm đi đò quả mơ cây dừa cô giáo quả lê giấc mơ tươi đẹp đất nước ấm êm',
    description: 'Luyện các ký tự đặc trưng của Tiếng Việt với quy tắc gõ đúp hoặc phím w.'
  },
  {
    level: 3,
    stage: 2,
    title: 'Luyện 5 thanh điệu Tiếng Việt: Sắc, Huyền, Hỏi, Ngã, Nặng',
    targetKeys: ['s', 'f', 'r', 'x', 'j'],
    content: 'má mà mả mã mạ cá cà cả cá cạ lá là lả lã lạ bé bè bẻ bẽ bẹ chú ý dấu thanh',
    description: 'Tập nhuần nhuyễn 5 phím thanh điệu s, f, r, x, j (hoặc 1, 2, 3, 4, 5 trong VNI).'
  },
  {
    level: 3,
    stage: 3,
    title: 'Từ ngữ Tiếng Việt có dấu hoàn chỉnh',
    targetKeys: ['tiếng', 'việt', 'dấu'],
    content: 'học tập chăm chỉ thành công rạng rỡ quê hương tươi đẹp đất nước hòa bình ấm no hạnh phúc',
    description: 'Kết hợp nguyên âm có mũ và thanh điệu vào các từ ngữ tiếng Việt trọn vẹn.'
  },

  // =================== LEVEL 4: ÂM TIẾT & TỪ GHÉP TIẾNG VIỆT ===================
  {
    level: 4,
    stage: 1,
    title: 'Cụm phụ âm đầu: ng, ngh, nh, ch, tr, th, ph, kh',
    targetKeys: ['ng', 'ngh', 'nh', 'ch', 'tr', 'th', 'ph', 'kh'],
    content: 'nghiêng ngả nhẹ nhàng chắt chiu trong trẻo thao thức phong phanh khúc khích nghiêng nghiêng',
    description: 'Luyện các cụm phụ âm ghép phổ biến và có tần suất cao nhất trong Tiếng Việt.'
  },
  {
    level: 4,
    stage: 2,
    title: 'Các vần dài thông dụng: inh, ương, uyên, oang, uông',
    targetKeys: ['inh', 'ương', 'uyên', 'oang', 'uông'],
    content: 'lung linh quê hương khuyên nhủ rộn ràng hoàng hôn cuống quýt yêu thương dòng suối trong vắt',
    description: 'Thực hành các vần ghép nhiều nguyên âm phức tạp trong tiếng Việt.'
  },
  {
    level: 4,
    stage: 3,
    title: 'Văn bản và Thơ ca Việt Nam hoàn chỉnh',
    targetKeys: ['văn', 'bản', 'thơ'],
    content: 'Việt Nam đất nước ta ơi, mênh mông biển lúa đâu trời đẹp hơn. Cánh cò bay lả rập rờn, mây mờ che đỉnh Trường Sơn sớm chiều.',
    description: 'Trải nghiệm cảm giác gõ mượt mà như đàn trên phím với những vần thơ bất hủ.'
  }
];

async function seed() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vn_typing_db';
  console.log(`Kết nối MongoDB tại ${mongoUri}...`);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB Connected!');

    // Xóa bài học cũ để cập nhật mới nhất
    await Lesson.deleteMany({});
    console.log('Đã làm sạch dữ liệu bài học cũ.');

    // Chèn dữ liệu mới
    await Lesson.insertMany(sampleLessons);
    console.log(`Đã nạp thành công ${sampleLessons.length} bài học mẫu vào cơ sở dữ liệu!`);

    mongoose.connection.close();
    console.log('Hoàn tất Seeding.');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu bài học:', error.message);
    process.exit(1);
  }
}

seed();
