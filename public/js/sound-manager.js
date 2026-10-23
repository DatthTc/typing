/**
 * sound-manager.js
 * Quản lý hiệu ứng âm thanh bàn phím cơ bằng Web Audio API thuần (Zero Latency)
 */

let audioCtx = null;
let currentSoundTheme = 'blue';

// Khởi tạo AudioContext (kích hoạt sau lần chạm/click đầu tiên của người dùng để tuân thủ chính sách trình duyệt)
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Phát âm thanh phím cơ theo chủ đề đã chọn
 * @param {'blue'|'brown'|'red'|'typewriter'|'off'} theme 
 */
function playKeySound(theme = currentSoundTheme) {
  if (theme === 'off') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  switch (theme) {
    case 'blue': {
      // Blue Switch: Tiếng click đanh gọn, âm vực cao kết hợp bottom-out
      // 1. Click âm cao
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);

      // 2. White noise burst cho tiếng clicky cơ học
      createNoiseBurst(ctx, now, 0.015, 0.25, 4500);
      break;
    }

    case 'brown': {
      // Brown Switch: Xúc giác nhẹ (Tactile), tiếng gõ ấm và trầm hơn
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.065);
      break;
    }

    case 'red': {
      // Red Switch: Linear êm ái, âm thanh thud mềm mại
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.07);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.085);
      break;
    }

    case 'typewriter': {
      // Máy đánh chữ cổ điển: Tiếng kim loại đập + tiếng vang
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);

      createNoiseBurst(ctx, now, 0.025, 0.3, 3000);
      break;
    }

    default:
      break;
  }
}

/**
 * Âm thanh cảnh báo gõ sai phím
 */
function playErrorSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.linearRampToValueAtTime(90, now + 0.1);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.12);
}

// Hàm bổ trợ tạo tiếng noise ngẫu nhiên cho switch click
function createNoiseBurst(ctx, startTime, duration, volume, filterFreq) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = filterFreq;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(startTime);
  noise.stop(startTime + duration);
}

function setSoundTheme(theme) {
  currentSoundTheme = theme;
}

function getSoundTheme() {
  return currentSoundTheme;
}

export {
  playKeySound,
  playErrorSound,
  setSoundTheme,
  getSoundTheme
};
