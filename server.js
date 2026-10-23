require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const session = require('express-session');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const indexRoutes = require('./routes/index.routes');
const apiRoutes = require('./routes/api.routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Kết nối cơ sở dữ liệu MongoDB
connectDB();

// Thiết lập View Engine là Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware xử lý dữ liệu và static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Thiết lập Express Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'vn_touch_typing_session_secret_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 ngày
    }
  })
);

// Global view variables (truyền thông tin người dùng vào tất cả template pug)
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.currentPath = req.path;
  next();
});

// Đảm bảo kết nối MongoDB sẵn sàng trước khi xử lý request
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('DB connect warning:', err.message);
  }
  next();
});

// Mount Routes
app.use('/', indexRoutes);
app.use('/api', apiRoutes);

// Xử lý 404
app.use((req, res) => {
  res.status(404).render('pages/home', {
    title: '404 - Không tìm thấy trang',
    error: 'Trang bạn yêu cầu không tồn tại!'
  });
});

// Xử lý Socket.io cho phòng đua gõ chữ (PvP Arena)
const rooms = new Map(); // roomId => { text, players: { socketId => { username, progress, wpm, isFinished } } }

const ARENA_PROMPTS = [
  'Đất nước ta với ngàn năm văn hiến, non sông gấm vóc rạng ngời qua từng trang sử vẻ vang của dân tộc.',
  'Học tập không bao giờ là muộn. Sự kiên trì và nỗ lực bền bỉ mỗi ngày sẽ đưa bạn đến đỉnh vinh quang.',
  'Bàn phím là công cụ của tư duy hiện đại. Gõ nhanh và chính xác giúp bạn làm chủ tương lai công nghệ số.',
  'Trời thu trong xanh, gió heo may nhè nhẹ thổi qua những con phố rợp bóng cây cổ thụ của thủ đô ngàn năm văn vật.'
];

io.on('connection', (socket) => {
  let currentRoom = null;
  let currentUser = null;

  socket.on('join_room', ({ roomId, username }) => {
    currentRoom = roomId || 'public-arena';
    currentUser = username || `Người chơi ${socket.id.substring(0, 4)}`;

    socket.join(currentRoom);

    if (!rooms.has(currentRoom)) {
      const randomText = ARENA_PROMPTS[Math.floor(Math.random() * ARENA_PROMPTS.length)];
      rooms.set(currentRoom, {
        text: randomText,
        players: new Map()
      });
    }

    const roomData = rooms.get(currentRoom);
    roomData.players.set(socket.id, {
      id: socket.id,
      username: currentUser,
      progress: 0,
      wpm: 0,
      isFinished: false
    });

    const playerList = Array.from(roomData.players.values());

    // Gửi thông tin phòng và danh sách người chơi cho tất cả người trong phòng
    io.to(currentRoom).emit('room_update', {
      roomId: currentRoom,
      text: roomData.text,
      players: playerList
    });
  });

  socket.on('typing_progress', ({ progress, wpm }) => {
    if (!currentRoom || !rooms.has(currentRoom)) return;

    const roomData = rooms.get(currentRoom);
    const player = roomData.players.get(socket.id);
    if (player) {
      player.progress = Math.min(100, Math.max(0, progress));
      player.wpm = wpm;

      if (player.progress >= 100 && !player.isFinished) {
        player.isFinished = true;
        io.to(currentRoom).emit('player_finished', {
          id: socket.id,
          username: player.username,
          wpm: player.wpm
        });
      }

      io.to(currentRoom).emit('progress_update', {
        id: socket.id,
        progress: player.progress,
        wpm: player.wpm
      });
    }
  });

  socket.on('restart_race', () => {
    if (!currentRoom || !rooms.has(currentRoom)) return;
    const roomData = rooms.get(currentRoom);
    const newText = ARENA_PROMPTS[Math.floor(Math.random() * ARENA_PROMPTS.length)];
    roomData.text = newText;
    for (const player of roomData.players.values()) {
      player.progress = 0;
      player.wpm = 0;
      player.isFinished = false;
    }
    io.to(currentRoom).emit('race_restarted', {
      text: newText,
      players: Array.from(roomData.players.values())
    });
  });

  socket.on('disconnect', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      const roomData = rooms.get(currentRoom);
      roomData.players.delete(socket.id);
      if (roomData.players.size === 0) {
        rooms.delete(currentRoom);
      } else {
        io.to(currentRoom).emit('player_left', {
          id: socket.id,
          players: Array.from(roomData.players.values())
        });
      }
    }
  });
});

// Khởi chạy server khi chạy standalone (local hoặc VPS)
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Vietnamese Touch Typing Server is running!    `);
    console.log(` URL: http://localhost:${PORT}                 `);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`===============================================`);
  });
}

// Export app để Vercel Serverless Function có thể nhận diện và xử lý requests
module.exports = app;
