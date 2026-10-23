# TÀI LIỆU ĐẶC TẢ DỰ ÁN: WEB LUYỆN GÕ 10 NGÓN TIẾNG VIỆT (VIETNAMESE TOUCH TYPING)

## 1. Tổng quan dự án (Project Overview)
Xây dựng ứng dụng web giúp người dùng học và rèn luyện kỹ năng gõ 10 ngón (Touch Typing) chuyên biệt cho **Tiếng Việt** (hỗ trợ kiểu gõ Telex và VNI). 
* **Điểm khác biệt cốt lõi:** Phân tách được ký tự tiếng Việt có dấu thành **chuỗi phím bấm vật lý** theo thời gian thực để hiển thị hướng dẫn trực quan trên bàn phím ảo và bàn tay 10 ngón.

---

## 2. Các phân hệ chức năng cốt lõi (Core Features)

### 2.1. Phân hệ 1: Lộ trình học gõ 10 ngón từ cơ bản (Structured Lessons)
Chia thành các cấp độ (Levels) và bài học nhỏ (Stages), mở khóa tuần tự hoặc cho phép chọn tự do:
* **Level 1 - Hàng phím cơ sở (Home Row):** 
  * Bài 1: Phím định vị `f` và `j`.
  * Bài 2: Mở rộng `d`, `k`, `s`, `l`, `a`, `;`.
  * Bài 3: Mở rộng `g`, `h` và tổng hợp hàng cơ sở.
* **Level 2 - Hàng phím trên (Top Row) & Hàng phím dưới (Bottom Row):**
  * Luyện từng cặp ngón tay vươn lên hàng trên (`q, w, e, r, t, y, u, i, o, p`) và hàng dưới (`z, x, c, v, b, n, m`).
* **Level 3 - Kỹ thuật gõ dấu Tiếng Việt (Telex / VNI):**
  * Bài tập gõ nguyên âm có mũ/móc: `ă (aw/a8)`, `â (aa/a6)`, `ê (ee/e6)`, `ô (oo/o6)`, `ơ (ow/o7)`, `ư (uw/u7)` và chữ `đ (dd/d9)`.
  * Bài tập 5 thanh điệu: Sắc (`s/1`), Huyền (`f/2`), Hỏi (`r/3`), Ngã (`x/4`), Nặng (`j/5`).
* **Level 4 - Luyện âm tiết & Từ ghép Tiếng Việt:**
  * Luyện cụm phụ âm đầu phổ biến: `ng`, `ngh`, `nh`, `ch`, `tr`, `th`, `ph`, `kh`, `gh`, `gi`, `qu`.
  * Luyện các vần thông dụng: `inh`, `ương`, `uyên`, `oang`, `uông`, `iêng`...

### 2.2. Phân hệ 2: Luyện tập tự do & Nhập văn bản (Custom Text Practice)
* **Trình nhập văn bản (Import/Paste Text):**
  * Cho phép người dùng dán (paste) đoạn văn bản bất kỳ hoặc tải lên file `.txt`.
  * Có tuỳ chọn lưu lại các đoạn văn bản yêu thích vào bộ nhớ trình duyệt (LocalStorage) hoặc tài khoản.
* **Bộ lọc chuẩn hóa văn bản tự động (Text Sanitizer - BẮT BUỘC):**
  * Tự động chuẩn hóa bảng mã Unicode về chuẩn **NFC** (Unicode dựng sẵn).
  * Tự động chuyển đổi các ký tự đặc biệt không có trên bàn phím chuẩn khi copy từ web/Word:
    * Ngoặc kép cong `“ ”` $\rightarrow$ Ngoặc kép thẳng `" "`
    * Ngoặc đơn cong `‘ ’` $\rightarrow$ Ngoặc đơn thẳng `' '`
    * Gạch ngang dài `—` hoặc `–` $\rightarrow$ Dấu trừ `-`
    * Khoảng trắng không ngắt (`\u00A0`) $\rightarrow$ Khoảng trắng thường (` `)
    * Loại bỏ khoảng trắng thừa (multiple spaces) và chuẩn hóa dấu xuống dòng.

### 2.3. Phân hệ 3: Bàn phím ảo & Bàn tay hướng dẫn (Virtual Keyboard & Hand Overlay)
Hiển thị trực tiếp bên dưới khu vực gõ chữ ở cả chế độ Học theo bài và Luyện tập tự do:
* **Bàn phím ảo (ANSI Layout chuẩn):**
  * Phân vùng màu sắc (Color-coded zones) theo 8 ngón tay (ngón cái dùng cho phím Space).
  * Highlight (làm sáng) phím vật lý tiếp theo cần nhấn.
  * Hiển thị hiệu ứng nhấp nháy đỏ nếu người dùng nhấn sai phím.
* **Bàn tay 10 ngón minh họa (SVG Hand Overlay):**
  * Sử dụng vector SVG đặt dưới/trên bàn phím ảo.
  * Tự động làm sáng **ngón tay tương ứng** với phím đang được yêu cầu nhấn (bao gồm cả tổ hợp phím Shift trái/phải khi cần viết hoa).

---

## 3. Các tính năng nâng cao & Tối ưu trải nghiệm (Advanced & UX Features)

1. **Hệ thống đo lường kép (Dual Metrics):**
   * **WPM (Words Per Minute):** Tốc độ từ/phút (1 từ chuẩn tính bằng 5 ký tự hoặc tính theo khoảng trắng).
   * **KCPM / KPM (Keystrokes Per Minute):** Số lần nhấn phím vật lý/phút (Phản ánh chính xác tốc độ gõ tiếng Việt vì 1 chữ tiếng Việt cần nhiều lần nhấn phím tạo dấu).
   * **Accuracy (%):** Tỷ lệ gõ chính xác.
2. **Bản đồ nhiệt bàn phím (Keyboard Heatmap) & Khắc phục điểm yếu:**
   * Lưu lịch sử các phím gõ sai hoặc có độ trễ (latency) cao.
   * Hiển thị Heatmap màu (Xanh $\rightarrow$ Vàng $\rightarrow$ Đỏ) trên sơ đồ bàn phím ở trang Thống kê.
   * Nút **"Luyện các phím yếu"**: Tự động lấy các từ chứa chữ cái hay sai để tạo bài tập.
3. **Âm thanh bàn phím cơ (Mechanical Keyboard Sound Effects):**
   * Sử dụng Web Audio API phát âm thanh độ trễ bằng 0 khi gõ (Tuỳ chọn: Blue Switch, Brown Switch, Red Switch, Typewriter, hoặc Tắt âm).
4. **Kho văn bản mẫu có sẵn (Preset Library):**
   * Tích hợp sẵn danh sách Tục ngữ, Ca dao, Thơ văn Việt Nam, các đoạn trích tác phẩm văn học để người dùng chọn nhanh không cần tự tìm text.

---

## 4. Giải pháp Kỹ thuật Cốt lõi (Technical Architecture - Dành cho Developer)

### 4.1. Thuật toán Tách chữ Tiếng Việt thành Chuỗi phím Vật lý (Decomposer Engine)
Để bàn phím ảo và bàn tay SVG biết phải sáng phím nào tiếp theo, cần viết một hàm `decomposeVietnameseChar(char, inputMethod)`:
* **Input:** Ký tự hoặc từ tiếng Việt (VD: `"để"`, kiểu gõ `"TELEX"`).
* **Output:** Mảng các phím vật lý cần nhấn theo thứ tự: `['d', 'd', 'e', 'e', 'r']` (hoặc hỗ trợ cả thứ tự gõ dấu tự do ở cuối từ: `['d', 'd', 'e', 'r', 'e']`).
* **Bảng quy chiếu Telex chuẩn:**
  * Mũ/Móc: `ă` = `a+w`, `â` = `a+a`, `đ` = `d+d`, `ê` = `e+e`, `ô` = `o+o`, `ơ` = `o+w`, `ư` = `u+w`.
  * Thanh điệu: Sắc = `s`, Huyền = `f`, Hỏi = `r`, Ngã = `x`, Nặng = `j`.
  * Viết hoa: Thêm cờ `Shift_Left` hoặc `Shift_Right` (ngược bên với bàn tay gõ phím chính).

### 4.2. Xử lý bộ gõ Tiếng Việt (IME / Input Handling)
Để tránh xung đột với Unikey/EVKey trên máy người dùng và kiểm soát chính xác từng phím bấm cho bàn tay ảo, hệ thống nên hỗ trợ **2 chế độ nhận phím**:
* **Chế độ 1 - Tích hợp bộ gõ nội bộ (Khuyên dùng khi học gõ ngón):**
  * Yêu cầu người dùng tắt Unikey (chuyển về EN).
  * Web bắt trực tiếp sự kiện `keydown` (`event.key` / `event.code`), tự ghép chữ thông qua engine Telex/VNI nội bộ và cập nhật từng bước lên Bàn phím ảo + Bàn tay SVG.
* **Chế độ 2 - Dùng bộ gõ hệ thống (Unikey/EVKey/macOS IME):**
  * Xử lý các sự kiện `compositionstart`, `compositionupdate`, và `compositionend` trên thẻ `<input>` ẩn để không bị lỗi nhảy chữ hoặc đúp ký tự khi đang gõ dấu.

### 4.3. Gợi ý Tech Stack (Ngăn xếp công nghệ)
* **Frontend Framework:** React.js (Next.js hoặc Vite) hoặc Vue.js + TypeScript.
* **Styling:** Tailwind CSS (hỗ trợ làm giao diện Dark/Light mode và custom theme giống Monkeytype rất nhanh).
* **State Management:** Zustand hoặc Redux Toolkit (quản lý trạng thái gõ theo từng mili-giây mà không gây re-render giật lag).
* **Âm thanh:** Thư viện `Howler.js` hoặc `Web Audio API` thuần.
* **Biểu đồ thống kê:** `Recharts` hoặc `Chart.js` (vẽ biểu đồ tốc độ WPM theo thời gian thực sau mỗi bài gõ).
* **Lưu trữ (Database):**
  * Giai đoạn đầu (MVP): Dùng `LocalStorage` / `IndexedDB` để lưu tiến độ học và lịch sử WPM ngay trên trình duyệt mà không cần đăng nhập.
  * Giai đoạn mở rộng: Dùng `Supabase` hoặc `Firebase` để làm tính năng Đăng nhập, Đồng bộ dữ liệu và Bảng xếp hạng (Leaderboard).

---

## 5. Nguồn tài nguyên mở để tích hợp (Resources)
Developer có thể sử dụng ngay các nguồn sau để tiết kiệm thời gian:
1. **Từ điển & Danh sách từ vựng Tiếng Việt:**
   * GitHub: `duyet/vietnamese-wordlist` (74K từ tiếng Việt) hoặc `undertheseanlp/dictionary`.
2. **Câu văn mẫu Tiếng Việt:**
   * Dự án mở `Tatoeba.org` (Lọc ngôn ngữ: Vietnamese) để lấy hàng ngàn câu giao tiếp/văn học ngắn gọn.
3. **Thư viện bộ gõ Tiếng Việt bằng JS (Tham khảo logic ghép chữ):**
   * Tìm kiếm thư viện `bogo-js` hoặc `vn-telex` trên npm/GitHub.
4. **Giao diện Bàn phím & Bàn tay SVG:**
   * Tham khảo cấu trúc SVG bàn phím + bàn tay từ mã nguồn mở của `keybr.com` (trên GitHub) hoặc tìm file vector `"Touch Typing Hands SVG"` trên Figma Community.

---

## 6. Lộ trình triển khai đề xuất (Development Phases)
* **Phase 1 (MVP - Sản phẩm cốt lõi):** 
  * Xây dựng giao diện gõ chữ + Bộ tách phím Telex/VNI + Bàn phím ảo & Bàn tay SVG hoạt động mượt mà.
  * Hoàn thiện tính năng Import Text tự do (kèm bộ lọc ký tự lạ).
* **Phase 2 (Nội dung & Bài học):** 
  * Thiết kế dữ liệu cho các bài học từ Hàng phím cơ sở đến Luyện gõ dấu.
  * Thêm hiệu ứng âm thanh bàn phím cơ và tính toán WPM/KCPM/Accuracy.
* **Phase 3 (Phân tích & Cá nhân hóa):** 
  * Làm trang Thống kê, Bản đồ nhiệt bàn phím (Heatmap) và thuật toán tự sinh bài tập cho các phím hay gõ sai.