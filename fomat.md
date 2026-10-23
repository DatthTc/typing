# ĐẶC TẢ KỸ THUẬT & KIẾN TRÚC HỆ THỐNG: WEB LUYỆN GÕ 10 NGÓN TIẾNG VIỆT (NODE.JS + PUG + MVC)

## 1. Ngăn xếp Công nghệ (Tech Stack)

Dự án được xây dựng theo kiến trúc **MVC (Model - View - Controller)** truyền thống kết hợp xử lý bất đồng bộ (AJAX/WebSockets) ở phía Client để đảm bảo tốc độ phản hồi phím bấm bằng 0ms.

* **Backend Runtime & Framework:** Node.js + Express.js (JavaScript ES6+).
* **View Engine (Template):** **Pug (Jade)** – Tận dụng `extends`, `block`, và `mixin` để tái sử dụng giao diện bàn phím ảo và thẻ bài học.
* **Database (Models):** MongoDB + Mongoose ODM (Hoặc SQLite/PostgreSQL qua Sequelize tùy chọn, ưu tiên MongoDB để lưu JSON thống kê phím lỗi dễ dàng).
* **Frontend (Client-side):** HTML5/Pug, CSS3 (TailwindCSS hoặc Bootstrap 5), **Vanilla JavaScript (ES6 Modules)** xử lý DOM, bộ gõ Telex/VNI và Web Audio API.
* **Tính năng mở rộng (Sáng tạo):**
  * **Socket.io:** Đua gõ 10 ngón thời gian thực (Real-time PvP Typing Race).
  * **Chart.js:** Vẽ biểu đồ tăng trưởng WPM và độ chính xác trong trang Hồ sơ.
* **Quản lý cấu hình & Bảo mật:** `dotenv`, `bcrypt` (mã hóa mật khẩu), `express-session` / `jsonwebtoken` (JWT), `.gitignore`.

---

## 2. Cấu trúc Thư mục Chuẩn MVC (Folder Structure)

Yêu cầu lập trình viên tổ chức mã nguồn đúng theo chuẩn MVC dưới đây:

```text
vietnamese-typing-mvc/
│
├── config/
│   └── db.js                  # Kết nối MongoDB bằng biến môi trường từ .env
│
├── models/                    # Tầng M (Models) - Cấu trúc dữ liệu Database
│   ├── User.js                # Lưu thông tin người dùng, cài đặt (Telex/VNI, âm thanh)
│   ├── Lesson.js              # Các bài tập từ cơ bản (f, j) đến nâng cao (gõ dấu)
│   ├── CustomText.js          # Các đoạn văn bản do người dùng tự import
│   └── TypingLog.js           # Lịch sử mỗi lần gõ (WPM, KCPM, Accuracy, mảng phím gõ sai)
│
├── views/                     # Tầng V (Views) - Giao diện viết bằng Pug
│   ├── layouts/
│   │   └── main.pug           # Khung HTML chung (Header, Footer, nhúng CSS/JS)
│   ├── partials/
│   │   ├── navbar.pug         # Thanh điều hướng
│   │   ├── keyboard.pug       # Giao diện bàn phím ảo ANSI
│   │   └── hands-svg.pug      # File vector SVG 2 bàn tay 10 ngón
│   ├── pages/
│   │   ├── home.pug           # Trang chủ & Danh sách lộ trình bài học
│   │   ├── practice.pug       # Màn hình gõ chính (nhúng keyboard.pug & hands-svg.pug)
│   │   ├── custom-import.pug  # Trang nhập/upload văn bản tự do
│   │   ├── stats.pug          # Trang thống kê biểu đồ WPM & Heatmap bàn phím
│   │   └── arena.pug          # Phòng đua gõ chữ trực tuyến (Socket.io)
│
├── controllers/               # Tầng C (Controllers) - Xử lý nghiệp vụ
│   ├── authController.js      # Đăng ký, đăng nhập, quản lý session
│   ├── lessonController.js    # Lấy danh sách bài học, mở khóa bài mới
│   ├── customTextController.js# Nhận text từ người dùng, lọc ký tự lạ (Sanitize) & lưu DB
│   └── statsController.js     # Nhận kết quả gõ qua API, tính toán Heatmap & lưu TypingLog
│
├── routes/                    # Định tuyến URL
│   ├── index.routes.js        # Các route trả về trang giao diện Pug
│   └── api.routes.js          # Các route RESTful API nhận/trả JSON (lưu điểm, lấy bài)
│
├── public/                    # Tài nguyên tĩnh (Static files phục vụ cho trình duyệt)
│   ├── css/
│   │   └── style.css          # CSS cho hiệu ứng sáng phím, màu ngón tay, Dark mode
│   ├── js/
│   │   ├── typing-engine.js   # Core xử lý sự kiện gõ phím, đếm giờ, tính WPM/KCPM
│   │   ├── vn-decomposer.js   # Thuật toán tách chữ Tiếng Việt thành phím vật lý Telex/VNI
│   │   ├── virtual-hands.js   # Điều khiển class CSS làm sáng phím ảo & ngón tay SVG
│   │   └── sound-manager.js   # Phát âm thanh bàn phím cơ (Blue/Brown/Red switch)
│   └── sounds/                # Chứa các file âm thanh .mp3 / .wav siêu nhẹ
│
├── utils/
│   └── textSanitizer.js       # Hàm chuẩn hóa Unicode NFC và lọc ký tự rác khi import text
│
├── .env                       # Lưu biến môi trường nhạy cảm (KHÔNG đẩy lên Git)
├── .env.example               # File mẫu cấu hình biến môi trường cho dev khác
├── .gitignore                 # Danh sách file/thư mục bỏ qua khi dùng Git
├── package.json               # Khai báo các thư viện (express, pug, mongoose, dotenv...)
└── server.js                  # Điểm khởi chạy ứng dụng (Entry point)
```

---

## 3. Cấu hình Bảo mật: `.env` và `.gitignore`

Lập trình viên bắt buộc phải thiết lập 2 file này ngay khi khởi tạo dự án (`npm init`):

### 3.1. Nội dung file `.gitignore`
```gitignore
# Thư mục thư viện Node.js
node_modules/
npm-debug.log*
yarn-error.log*

# File biến môi trường chứa mật khẩu & API Key
.env
.env.local
.env.production

# File hệ điều hành & IDE
.DS_Store
Thumbs.db
.vscode/
.idea/

# Thư mục file tạm khi người dùng upload file .txt
uploads/temp/*
```

### 3.2. Nội dung file `.env` (Mẫu chuẩn)
```env
# Cấu hình Server
NODE_ENV=development
PORT=3000

# Bảo mật cơ sở dữ liệu (MongoDB Atlas hoặc Local)
MONGODB_URI=mongodb://127.0.0.1:27017/vn_typing_db

# Khóa bí mật cho Phiên đăng nhập (Session / JWT)
SESSION_SECRET=chuoi_ky_tu_bi_mat_sieu_dai_bao_ve_ung_dung_2026
JWT_SECRET=khoa_bi_mat_jwt_token_luyen_go_10_ngon

# (Tuỳ chọn mở rộng) API Key của AI để tạo văn bản luyện gõ tự động
GEMINI_API_KEY=your_api_key_here
```

---

## 4. Chi tiết Triển khai Các Tính năng theo Mô hình MVC

### 4.1. Tính năng 1: Lộ trình luyện ngón cơ bản đến nâng cao (`Lesson` MVC)
* **Model (`Lesson.js`):** Lưu trữ các trường: `level` (Cấp độ 1-4), `stage` (Bài số mấy), `title` (Tên bài, VD: *"Phím cơ sở F và J"*), `targetKeys` (Mảng phím mục tiêu: `['f', 'j']`), `content` (Nội dung chuỗi ký tự cần gõ).
* **Controller (`lessonController.js`):** Truy vấn bài học theo ID và truyền dữ liệu xuống View Pug.
* **View (`practice.pug`):** Render giao diện gõ chữ. Sử dụng thuộc tính `data-content="#{lesson.content}"` trên thẻ HTML để file `public/js/typing-engine.js` đọc được nội dung bài học và bắt đầu hướng dẫn từng phím.

### 4.2. Tính năng 2: Luyện tập tự do & Import văn bản (`CustomText` MVC)
* **View (`custom-import.pug`):** Cung cấp 1 ô `<textarea>` lớn để dán văn bản, 1 nút tải file `.txt` lên, và danh sách các bài đã lưu.
* **Utility (`utils/textSanitizer.js`):** Khi người dùng gửi form lên Server, hàm này ở Backend sẽ tự động:
  1. Đưa chuỗi về chuẩn Unicode dựng sẵn: `text.normalize('NFC')`.
  2. Thay thế toàn bộ ngoặc kép cong `“ ”` thành `" "`, gạch ngang dài `—` thành `-`, khoảng trắng lạ thành khoảng trắng thường.
* **Controller (`customTextController.js`):** Lưu văn bản sạch vào DB hoặc Session, sau đó chuyển hướng (`res.redirect`) người dùng sang màn hình `practice.pug` kèm theo đoạn văn vừa nhập.

### 4.3. Tính năng 3: Bàn phím ảo & Bàn tay 10 ngón SVG (`keyboard.pug` & `vn-decomposer.js`)
* **Thiết kế Pug Mixin (`views/partials/keyboard.pug`):**
  * Dùng vòng lặp của Pug để render 5 hàng phím tiêu chuẩn, mỗi phím gắn `id="key-f"`, `id="key-j"` và class màu sắc theo vùng ngón tay (`finger-left-index`, `finger-right-pinky`...).
* **Tích hợp SVG (`views/partials/hands-svg.pug`):**
  * Nhúng trực tiếp code `<svg>` của 2 bàn tay vào Pug. Mỗi ngón tay trên hình vẽ là một thẻ `<path>` hoặc `<g>` có ID rõ ràng: `id="hand-left-index"`, `id="hand-right-index"`, `id="hand-thumbs"`...
* **Thuật toán tách phím ở Client (`public/js/vn-decomposer.js`):**
  * Khi đến từ `"việt"`, bộ tách phím sẽ dịch ra mảng phím vật lý theo kiểu gõ người dùng chọn:
    * **Telex:** `['v', 'i', 'e', 'e', 'j', 't']` (hoặc `['v', 'i', 'e', 'e', 't', 'j']`).
    * **VNI:** `['v', 'i', 'e', '6', '5', 't']`.
  * File `virtual-hands.js` đọc mảng này theo từng bước gõ của người dùng để bật class `.active` làm sáng đúng phím trên `keyboard.pug` và đúng ngón tay trên `hands-svg.pug`.

---

## 5. Các Tính năng Sáng tạo Bổ sung (Tối ưu cho Node.js)

1. **Chế độ "Tắt Unikey - Gõ bằng Engine của Web" vs "Bật Unikey":**
   * Có nút gạt trên giao diện: Nếu người dùng chọn **"Bộ gõ tích hợp (Khuyên dùng)"**, người dùng chỉ cần để bàn phím máy tính ở chế độ Tiếng Anh (EN), script của web sẽ tự ghép `a + a = â`, giúp bàn tay SVG sáng chuẩn xác 100% từng mili-giây mà không bao giờ bị lỗi đúp chữ của Unikey.
2. **Lưu điểm ngầm bằng Fetch API & Bản đồ nhiệt (Heatmap):**
   * Khi gõ xong 1 bài, trình duyệt gọi `fetch('/api/stats/save', { method: 'POST', body: JSON.stringify(result) })` gửi ngầm về `statsController.js` các thông số: `wpm`, `kcpm` (số phím bấm/phút), `accuracy`, và `missedKeys` (VD: `{'s': 5, 'x': 3, 'e': 2}`).
   * Trang `stats.pug` lấy dữ liệu này để tô màu bàn phím từ Xanh (gõ chuẩn) sang Đỏ (hay gõ sai) và có nút **"Tạo bài luyện riêng cho các phím màu đỏ"** (Backend tự lọc từ điển tiếng Việt lấy các từ chứa nhiều chữ cái người dùng hay sai để ghép thành bài tập mới).
3. **Đấu trường Gõ Nhanh (Socket.io Multiplayer Arena):**
   * Tận dụng lợi thế của Node.js, tích hợp thư viện `socket.io`.
   * Hai hoặc nhiều người dùng vào trang `/arena` sẽ cùng nhận một đoạn văn bản Tiếng Việt giống hệt nhau. Khi mỗi người gõ đúng 1 từ, thanh tiến độ (Progress Bar / Hình chiếc xe đua) của họ trên màn hình đối phương sẽ nhích lên theo thời gian thực.
4. **Tạo văn bản tự động bằng AI (Tuỳ chọn qua `.env`):**
   * Trong trang Luyện tập tự do, ngoài việc tự copy-paste, người dùng có thể gõ yêu cầu (VD: *"Tạo đoạn văn 50 từ về lịch sử Việt Nam"*) $\rightarrow$ Backend dùng `GEMINI_API_KEY` trong file `.env` gọi API tạo đoạn văn chuẩn tiếng Việt trả về cho người dùng gõ ngay lập tức.

---

## 6. Hướng dẫn Cài đặt & Khởi chạy (Dành cho Developer bàn giao)

Khi hoàn thiện dự án, lập trình viên cần đảm bảo dự án chạy được chỉ với các lệnh chuẩn sau:

```bash
# 1. Cài đặt toàn bộ thư viện
npm install express pug mongoose dotenv express-session bcrypt socket.io

# 2. Cài đặt công cụ tự động khởi động lại server khi code
npm install --save-dev nodemon

# 3. Tạo file .env từ file .env.example và điền thông số
cp .env.example .env

# 4. Chạy file khởi tạo dữ liệu bài học mẫu (Seed data cho các bài f-j, gõ dấu...)
npm run seed

# 5. Khởi chạy ứng dụng
npm run dev
```