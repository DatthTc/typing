/**
 * typing-engine.js (All-in-One Client Bundle)
 * Tích hợp toàn bộ: Sound Manager + Virtual Hands + Vietnamese IME + Typing Engine
 * Chạy độc lập 100% trên mọi trình duyệt, không phụ thuộc bundler, không lo lỗi exports/require.
 */

// ====================================================================
// 1. SOUND MANAGER (Web Audio API)
// ====================================================================
let audioCtx = null;
let currentSoundTheme = 'blue';

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

function playKeySound(theme = currentSoundTheme) {
  if (theme === 'off') return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  switch (theme) {
    case 'blue': {
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
      createNoiseBurst(ctx, now, 0.015, 0.25, 4500);
      break;
    }
    case 'brown': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.055);
      createNoiseBurst(ctx, now, 0.02, 0.15, 2200);
      break;
    }
    case 'red': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.065);
      createNoiseBurst(ctx, now, 0.025, 0.08, 1200);
      break;
    }
    case 'typewriter': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.075);
      createNoiseBurst(ctx, now, 0.035, 0.35, 3000);
      break;
    }
  }
}

function playErrorSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.setValueAtTime(120, now + 0.06);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.13);
}

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

// ====================================================================
// 2. VIRTUAL KEYBOARD & HANDS (Highlight & ANSI mapping)
// ====================================================================
const KEY_TO_FINGER = {
  '`': { hand: 'left', finger: 'pinky', keyId: 'key-backquote' },
  '~': { hand: 'left', finger: 'pinky', keyId: 'key-backquote', shift: true },
  '1': { hand: 'left', finger: 'pinky', keyId: 'key-1' },
  '!': { hand: 'left', finger: 'pinky', keyId: 'key-1', shift: true },
  '2': { hand: 'left', finger: 'ring', keyId: 'key-2' },
  '@': { hand: 'left', finger: 'ring', keyId: 'key-2', shift: true },
  '3': { hand: 'left', finger: 'middle', keyId: 'key-3' },
  '#': { hand: 'left', finger: 'middle', keyId: 'key-3', shift: true },
  '4': { hand: 'left', finger: 'index', keyId: 'key-4' },
  '$': { hand: 'left', finger: 'index', keyId: 'key-4', shift: true },
  '5': { hand: 'left', finger: 'index', keyId: 'key-5' },
  '%': { hand: 'left', finger: 'index', keyId: 'key-5', shift: true },
  '6': { hand: 'right', finger: 'index', keyId: 'key-6' },
  '^': { hand: 'right', finger: 'index', keyId: 'key-6', shift: true },
  '7': { hand: 'right', finger: 'index', keyId: 'key-7' },
  '&': { hand: 'right', finger: 'index', keyId: 'key-7', shift: true },
  '8': { hand: 'right', finger: 'middle', keyId: 'key-8' },
  '*': { hand: 'right', finger: 'middle', keyId: 'key-8', shift: true },
  '9': { hand: 'right', finger: 'ring', keyId: 'key-9' },
  '(': { hand: 'right', finger: 'ring', keyId: 'key-9', shift: true },
  '0': { hand: 'right', finger: 'pinky', keyId: 'key-0' },
  ')': { hand: 'right', finger: 'pinky', keyId: 'key-0', shift: true },
  '-': { hand: 'right', finger: 'pinky', keyId: 'key-minus' },
  '_': { hand: 'right', finger: 'pinky', keyId: 'key-minus', shift: true },
  '=': { hand: 'right', finger: 'pinky', keyId: 'key-equal' },
  '+': { hand: 'right', finger: 'pinky', keyId: 'key-equal', shift: true },
  'Backspace': { hand: 'right', finger: 'pinky', keyId: 'key-backspace' },
  'q': { hand: 'left', finger: 'pinky', keyId: 'key-q' },
  'Q': { hand: 'left', finger: 'pinky', keyId: 'key-q', shift: true },
  'w': { hand: 'left', finger: 'ring', keyId: 'key-w' },
  'W': { hand: 'left', finger: 'ring', keyId: 'key-w', shift: true },
  'e': { hand: 'left', finger: 'middle', keyId: 'key-e' },
  'E': { hand: 'left', finger: 'middle', keyId: 'key-e', shift: true },
  'r': { hand: 'left', finger: 'index', keyId: 'key-r' },
  'R': { hand: 'left', finger: 'index', keyId: 'key-r', shift: true },
  't': { hand: 'left', finger: 'index', keyId: 'key-t' },
  'T': { hand: 'left', finger: 'index', keyId: 'key-t', shift: true },
  'y': { hand: 'right', finger: 'index', keyId: 'key-y' },
  'Y': { hand: 'right', finger: 'index', keyId: 'key-y', shift: true },
  'u': { hand: 'right', finger: 'index', keyId: 'key-u' },
  'U': { hand: 'right', finger: 'index', keyId: 'key-u', shift: true },
  'i': { hand: 'right', finger: 'middle', keyId: 'key-i' },
  'I': { hand: 'right', finger: 'middle', keyId: 'key-i', shift: true },
  'o': { hand: 'right', finger: 'ring', keyId: 'key-o' },
  'O': { hand: 'right', finger: 'ring', keyId: 'key-o', shift: true },
  'p': { hand: 'right', finger: 'pinky', keyId: 'key-p' },
  'P': { hand: 'right', finger: 'pinky', keyId: 'key-p', shift: true },
  '[': { hand: 'right', finger: 'pinky', keyId: 'key-bracket-left' },
  '{': { hand: 'right', finger: 'pinky', keyId: 'key-bracket-left', shift: true },
  ']': { hand: 'right', finger: 'pinky', keyId: 'key-bracket-right' },
  '}': { hand: 'right', finger: 'pinky', keyId: 'key-bracket-right', shift: true },
  '\\': { hand: 'right', finger: 'pinky', keyId: 'key-backslash' },
  '|': { hand: 'right', finger: 'pinky', keyId: 'key-backslash', shift: true },
  'a': { hand: 'left', finger: 'pinky', keyId: 'key-a' },
  'A': { hand: 'left', finger: 'pinky', keyId: 'key-a', shift: true },
  's': { hand: 'left', finger: 'ring', keyId: 'key-s' },
  'S': { hand: 'left', finger: 'ring', keyId: 'key-s', shift: true },
  'd': { hand: 'left', finger: 'middle', keyId: 'key-d' },
  'D': { hand: 'left', finger: 'middle', keyId: 'key-d', shift: true },
  'f': { hand: 'left', finger: 'index', keyId: 'key-f' },
  'F': { hand: 'left', finger: 'index', keyId: 'key-f', shift: true },
  'g': { hand: 'left', finger: 'index', keyId: 'key-g' },
  'G': { hand: 'left', finger: 'index', keyId: 'key-g', shift: true },
  'h': { hand: 'right', finger: 'index', keyId: 'key-h' },
  'H': { hand: 'right', finger: 'index', keyId: 'key-h', shift: true },
  'j': { hand: 'right', finger: 'index', keyId: 'key-j' },
  'J': { hand: 'right', finger: 'index', keyId: 'key-j', shift: true },
  'k': { hand: 'right', finger: 'middle', keyId: 'key-k' },
  'K': { hand: 'right', finger: 'middle', keyId: 'key-k', shift: true },
  'l': { hand: 'right', finger: 'ring', keyId: 'key-l' },
  'L': { hand: 'right', finger: 'ring', keyId: 'key-l', shift: true },
  ';': { hand: 'right', finger: 'pinky', keyId: 'key-semicolon' },
  ':': { hand: 'right', finger: 'pinky', keyId: 'key-semicolon', shift: true },
  "'": { hand: 'right', finger: 'pinky', keyId: 'key-quote' },
  '"': { hand: 'right', finger: 'pinky', keyId: 'key-quote', shift: true },
  'Enter': { hand: 'right', finger: 'pinky', keyId: 'key-enter' },
  'z': { hand: 'left', finger: 'pinky', keyId: 'key-z' },
  'Z': { hand: 'left', finger: 'pinky', keyId: 'key-z', shift: true },
  'x': { hand: 'left', finger: 'ring', keyId: 'key-x' },
  'X': { hand: 'left', finger: 'ring', keyId: 'key-x', shift: true },
  'c': { hand: 'left', finger: 'middle', keyId: 'key-c' },
  'C': { hand: 'left', finger: 'middle', keyId: 'key-c', shift: true },
  'v': { hand: 'left', finger: 'index', keyId: 'key-v' },
  'V': { hand: 'left', finger: 'index', keyId: 'key-v', shift: true },
  'b': { hand: 'left', finger: 'index', keyId: 'key-b' },
  'B': { hand: 'left', finger: 'index', keyId: 'key-b', shift: true },
  'n': { hand: 'right', finger: 'index', keyId: 'key-n' },
  'N': { hand: 'right', finger: 'index', keyId: 'key-n', shift: true },
  'm': { hand: 'right', finger: 'index', keyId: 'key-m' },
  'M': { hand: 'right', finger: 'index', keyId: 'key-m', shift: true },
  ',': { hand: 'right', finger: 'middle', keyId: 'key-comma' },
  '<': { hand: 'right', finger: 'middle', keyId: 'key-comma', shift: true },
  '.': { hand: 'right', finger: 'ring', keyId: 'key-period' },
  '>': { hand: 'right', finger: 'ring', keyId: 'key-period', shift: true },
  '/': { hand: 'right', finger: 'pinky', keyId: 'key-slash' },
  '?': { hand: 'right', finger: 'pinky', keyId: 'key-slash', shift: true },
  ' ': { hand: 'left', finger: 'thumb', keyId: 'key-space' }
};

function clearHighlights() {
  document.querySelectorAll('.key.active').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.finger.active').forEach(el => el.classList.remove('active'));
}

function highlightKey(keyChar) {
  clearHighlights();
  if (!keyChar) return;
  const mapping = KEY_TO_FINGER[keyChar] || KEY_TO_FINGER[keyChar.toLowerCase()];
  if (!mapping) return;

  const keyEl = document.getElementById(mapping.keyId);
  if (keyEl) keyEl.classList.add('active');

  const handSide = mapping.hand;
  const fingerName = mapping.finger;
  let fingerSvgId = `finger-${handSide}-${fingerName}`;
  if (fingerName === 'thumb') fingerSvgId = `finger-${handSide}-thumb`;
  const fingerEl = document.getElementById(fingerSvgId);
  if (fingerEl) fingerEl.classList.add('active');

  if (mapping.shift) {
    const shiftKeyId = (handSide === 'left') ? 'key-shift-right' : 'key-shift-left';
    const shiftEl = document.getElementById(shiftKeyId);
    if (shiftEl) shiftEl.classList.add('active');
    const oppHand = (handSide === 'left') ? 'right' : 'left';
    const oppPinky = document.getElementById(`finger-${oppHand}-pinky`);
    if (oppPinky) oppPinky.classList.add('active');
  }
}

function flashErrorKey(keyChar) {
  if (!keyChar) return;
  const mapping = KEY_TO_FINGER[keyChar] || KEY_TO_FINGER[keyChar.toLowerCase()];
  if (mapping && mapping.keyId) {
    const keyEl = document.getElementById(mapping.keyId);
    if (keyEl) {
      keyEl.classList.add('error');
      setTimeout(() => keyEl.classList.remove('error'), 250);
    }
  }
}

// ====================================================================
// 3. VIETNAMESE IME ENGINE (Smart Telex & VNI)
// ====================================================================
const VOWEL_TABLE = {
  'a': ['a', 'á', 'à', 'ả', 'ã', 'ạ'],
  'ă': ['ă', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ'],
  'â': ['â', 'ấ', 'ầ', 'ẩ', 'ẫ', 'ậ'],
  'e': ['e', 'é', 'è', 'ẻ', 'ẽ', 'ẹ'],
  'ê': ['ê', 'ế', 'ề', 'ể', 'ễ', 'ệ'],
  'i': ['i', 'í', 'ì', 'ỉ', 'ĩ', 'ị'],
  'o': ['o', 'ó', 'ò', 'ỏ', 'õ', 'ọ'],
  'ô': ['ô', 'ố', 'ồ', 'ổ', 'ỗ', 'ộ'],
  'ơ': ['ơ', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ'],
  'u': ['u', 'ú', 'ù', 'ủ', 'ũ', 'ụ'],
  'ư': ['ư', 'ứ', 'ừ', 'ử', 'ữ', 'ự'],
  'y': ['y', 'ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ'],
};

const CHAR_TO_VOWEL_INFO = {};
for (const [base, forms] of Object.entries(VOWEL_TABLE)) {
  forms.forEach((form, toneIdx) => {
    CHAR_TO_VOWEL_INFO[form] = { base, toneIdx };
    CHAR_TO_VOWEL_INFO[form.toUpperCase()] = { base: base.toUpperCase(), toneIdx };
  });
}
CHAR_TO_VOWEL_INFO['đ'] = { base: 'đ', toneIdx: 0 };
CHAR_TO_VOWEL_INFO['Đ'] = { base: 'Đ', toneIdx: 0 };

const TELEX_TONE_MAP = { 's': 1, 'f': 2, 'r': 3, 'x': 4, 'j': 5, 'z': 0 };
const VNI_TONE_MAP = { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '0': 0 };
const TELEX_CIRCUMFLEX = { 'a': 'â', 'â': 'a', 'e': 'ê', 'ê': 'e', 'o': 'ô', 'ô': 'o', 'd': 'đ', 'đ': 'd' };
const TELEX_HORN = { 'a': 'ă', 'ă': 'a', 'o': 'ơ', 'ơ': 'o', 'u': 'ư', 'ư': 'u' };

function findTonePosition(chars) {
  const vowelIndices = [];
  chars.forEach((c, idx) => {
    const info = CHAR_TO_VOWEL_INFO[c.toLowerCase()];
    if (info && info.base.toLowerCase() !== 'đ') {
      vowelIndices.push(idx);
    }
  });

  if (vowelIndices.length === 0) return -1;
  if (vowelIndices.length === 1) return vowelIndices[0];

  const lastVowelIdx = vowelIndices[vowelIndices.length - 1];
  const hasEndingConsonant = lastVowelIdx < chars.length - 1;
  const vowelBases = vowelIndices.map(i => {
    const c = chars[i].toLowerCase();
    return CHAR_TO_VOWEL_INFO[c]?.base.toLowerCase() || c;
  });
  const vowelSeq = vowelBases.join('');

  if (vowelSeq === 'ươ' || vowelSeq.startsWith('ươ')) return vowelIndices[1];
  if (['iê', 'yê', 'uô'].some(seq => vowelSeq.startsWith(seq))) return vowelIndices[1];

  if (hasEndingConsonant) {
    return vowelIndices[vowelIndices.length - 1];
  } else {
    if (['oa', 'oe', 'uy'].includes(vowelSeq)) return vowelIndices[1];
    return vowelIndices[0];
  }
}

function parseTelex(keys) {
  let chars = [];
  for (let i = 0; i < keys.length; i++) {
    const rawKey = keys[i];
    const key = rawKey.toLowerCase();

    // 1. Phím dấu thanh
    if (TELEX_TONE_MAP[key] !== undefined) {
      const toneIdx = TELEX_TONE_MAP[key];
      const tonePos = findTonePosition(chars);
      if (tonePos !== -1) {
        const targetChar = chars[tonePos];
        const isCharUpper = targetChar === targetChar.toUpperCase() && targetChar !== targetChar.toLowerCase();
        const baseVowel = CHAR_TO_VOWEL_INFO[targetChar.toLowerCase()]?.base || targetChar.toLowerCase();
        if (VOWEL_TABLE[baseVowel]) {
          const newVowel = VOWEL_TABLE[baseVowel][toneIdx];
          chars[tonePos] = isCharUpper ? newVowel.toUpperCase() : newVowel;
          continue;
        }
      }
    }

    // 2. Phím mũ
    if (TELEX_CIRCUMFLEX[key]) {
      let modified = false;
      for (let j = chars.length - 1; j >= 0; j--) {
        const c = chars[j];
        const cLower = c.toLowerCase();
        const info = CHAR_TO_VOWEL_INFO[cLower];
        const base = info ? info.base : cLower;
        if (base === key) {
          const targetBase = TELEX_CIRCUMFLEX[base];
          const isCharUpper = c === c.toUpperCase() && c !== c.toLowerCase();
          const currentTone = info ? info.toneIdx : 0;
          if (targetBase === 'đ') {
            chars[j] = isCharUpper ? 'Đ' : 'đ';
          } else if (VOWEL_TABLE[targetBase]) {
            const newChar = VOWEL_TABLE[targetBase][currentTone];
            chars[j] = isCharUpper ? newChar.toUpperCase() : newChar;
          }
          modified = true;
          break;
        }
      }
      if (modified) continue;
    }

    // 3. Phím móc
    if (key === 'w') {
      let modified = false;
      let uIdx = -1, oIdx = -1;
      for (let j = chars.length - 1; j >= 1; j--) {
        const prev = chars[j - 1].toLowerCase();
        const curr = chars[j].toLowerCase();
        const prevBase = CHAR_TO_VOWEL_INFO[prev]?.base || prev;
        const currBase = CHAR_TO_VOWEL_INFO[curr]?.base || curr;
        if ((prevBase === 'u' || prevBase === 'ư') && (currBase === 'o' || currBase === 'ơ')) {
          uIdx = j - 1;
          oIdx = j;
          break;
        }
      }

      if (uIdx !== -1 && oIdx !== -1) {
        const uChar = chars[uIdx];
        const oChar = chars[oIdx];
        const uTone = CHAR_TO_VOWEL_INFO[uChar.toLowerCase()]?.toneIdx || 0;
        const oTone = CHAR_TO_VOWEL_INFO[oChar.toLowerCase()]?.toneIdx || 0;
        chars[uIdx] = (uChar === uChar.toUpperCase() && uChar !== uChar.toLowerCase()) ? VOWEL_TABLE['ư'][uTone].toUpperCase() : VOWEL_TABLE['ư'][uTone];
        chars[oIdx] = (oChar === oChar.toUpperCase() && oChar !== oChar.toLowerCase()) ? VOWEL_TABLE['ơ'][oTone].toUpperCase() : VOWEL_TABLE['ơ'][oTone];
        modified = true;
      } else {
        for (let j = chars.length - 1; j >= 0; j--) {
          const c = chars[j];
          const cLower = c.toLowerCase();
          const info = CHAR_TO_VOWEL_INFO[cLower];
          const base = info ? info.base : cLower;
          if (TELEX_HORN[base]) {
            const targetBase = TELEX_HORN[base];
            const isCharUpper = c === c.toUpperCase() && c !== c.toLowerCase();
            const currentTone = info ? info.toneIdx : 0;
            const newChar = VOWEL_TABLE[targetBase][currentTone];
            chars[j] = isCharUpper ? newChar.toUpperCase() : newChar;
            modified = true;
            break;
          }
        }
      }
      if (modified) continue;
    }

    chars.push(rawKey);
  }
  return chars.join('');
}

function parseVNI(keys) {
  let chars = [];
  for (let i = 0; i < keys.length; i++) {
    const rawKey = keys[i];
    const key = rawKey;

    if (VNI_TONE_MAP[key] !== undefined) {
      const toneIdx = VNI_TONE_MAP[key];
      const tonePos = findTonePosition(chars);
      if (tonePos !== -1) {
        const targetChar = chars[tonePos];
        const isCharUpper = targetChar === targetChar.toUpperCase() && targetChar !== targetChar.toLowerCase();
        const baseVowel = CHAR_TO_VOWEL_INFO[targetChar.toLowerCase()]?.base || targetChar.toLowerCase();
        if (VOWEL_TABLE[baseVowel]) {
          const newVowel = VOWEL_TABLE[baseVowel][toneIdx];
          chars[tonePos] = isCharUpper ? newVowel.toUpperCase() : newVowel;
          continue;
        }
      }
    }

    if (key === '6') {
      let modified = false;
      for (let j = chars.length - 1; j >= 0; j--) {
        const c = chars[j];
        const cLower = c.toLowerCase();
        const info = CHAR_TO_VOWEL_INFO[cLower];
        const base = info ? info.base : cLower;
        if (['a', 'e', 'o'].includes(base)) {
          const targetBase = TELEX_CIRCUMFLEX[base];
          const isCharUpper = c === c.toUpperCase() && c !== c.toLowerCase();
          const currentTone = info ? info.toneIdx : 0;
          const newChar = VOWEL_TABLE[targetBase][currentTone];
          chars[j] = isCharUpper ? newChar.toUpperCase() : newChar;
          modified = true;
          break;
        }
      }
      if (modified) continue;
    }

    if (key === '7') {
      let modified = false;
      for (let j = chars.length - 1; j >= 0; j--) {
        const c = chars[j];
        const cLower = c.toLowerCase();
        const info = CHAR_TO_VOWEL_INFO[cLower];
        const base = info ? info.base : cLower;
        if (['o', 'u'].includes(base)) {
          const targetBase = TELEX_HORN[base];
          const isCharUpper = c === c.toUpperCase() && c !== c.toLowerCase();
          const currentTone = info ? info.toneIdx : 0;
          const newChar = VOWEL_TABLE[targetBase][currentTone];
          chars[j] = isCharUpper ? newChar.toUpperCase() : newChar;
          modified = true;
          break;
        }
      }
      if (modified) continue;
    }

    if (key === '8') {
      let modified = false;
      for (let j = chars.length - 1; j >= 0; j--) {
        const c = chars[j];
        const cLower = c.toLowerCase();
        const info = CHAR_TO_VOWEL_INFO[cLower];
        const base = info ? info.base : cLower;
        if (base === 'a') {
          const isCharUpper = c === c.toUpperCase() && c !== c.toLowerCase();
          const currentTone = info ? info.toneIdx : 0;
          const newChar = VOWEL_TABLE['ă'][currentTone];
          chars[j] = isCharUpper ? newChar.toUpperCase() : newChar;
          modified = true;
          break;
        }
      }
      if (modified) continue;
    }

    if (key === '9') {
      let modified = false;
      for (let j = chars.length - 1; j >= 0; j--) {
        const c = chars[j];
        if (c.toLowerCase() === 'd') {
          chars[j] = (c === 'D') ? 'Đ' : 'đ';
          modified = true;
          break;
        }
      }
      if (modified) continue;
    }

    chars.push(rawKey);
  }
  return chars.join('');
}

function removeTone(word) {
  let res = '';
  for (const c of word) {
    const info = CHAR_TO_VOWEL_INFO[c];
    if (info && VOWEL_TABLE[info.base]) {
      const isUpper = c === c.toUpperCase() && c !== c.toLowerCase();
      const baseChar = VOWEL_TABLE[info.base][0];
      res += isUpper ? baseChar.toUpperCase() : baseChar;
    } else {
      res += c;
    }
  }
  return res;
}

function removeAllAccents(word) {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, m => m === 'Đ' ? 'D' : 'd');
}

function checkWordMatch(typedKeys, targetWord, method = 'TELEX') {
  if (typedKeys.length === 0) {
    return { status: 'partial', currentWord: '' };
  }
  const currentWord = method === 'TELEX' ? parseTelex(typedKeys) : parseVNI(typedKeys);

  if (currentWord === targetWord) {
    return { status: 'complete', currentWord };
  }
  if (targetWord.startsWith(currentWord)) {
    return { status: 'partial', currentWord };
  }
  const targetWithoutTone = removeTone(targetWord);
  if (targetWithoutTone === currentWord || targetWithoutTone.startsWith(currentWord)) {
    return { status: 'partial', currentWord };
  }
  const targetRaw = removeAllAccents(targetWord);
  const currentRaw = removeAllAccents(currentWord);
  if (targetRaw === currentRaw || targetRaw.startsWith(currentRaw)) {
    return { status: 'partial', currentWord };
  }
  return { status: 'wrong', currentWord };
}

function getSuggestedNextKey(currentWord, targetWord, method = 'TELEX') {
  if (!targetWord) return null;
  if (currentWord === targetWord) return ' ';
  const isTelex = method === 'TELEX';

  if (!currentWord) return targetWord[0];

  const targetWithoutTone = removeTone(targetWord);
  if (currentWord === targetWithoutTone) {
    for (const c of targetWord) {
      const info = CHAR_TO_VOWEL_INFO[c];
      if (info && info.toneIdx > 0) {
        if (isTelex) {
          const telexTones = ['', 's', 'f', 'r', 'x', 'j'];
          return telexTones[info.toneIdx];
        } else {
          return String(info.toneIdx);
        }
      }
    }
  }

  const targetRaw = removeAllAccents(targetWord);
  const currentRaw = removeAllAccents(currentWord);

  if (targetRaw === currentRaw && currentWord !== targetWord) {
    if (isTelex) {
      if (['ư', 'ơ', 'ă'].some(c => targetWord.toLowerCase().includes(c))) return 'w';
      if (['ê'].some(c => targetWord.toLowerCase().includes(c))) return 'e';
      if (['â'].some(c => targetWord.toLowerCase().includes(c))) return 'a';
      if (['ô'].some(c => targetWord.toLowerCase().includes(c))) return 'o';
      if (['đ'].some(c => targetWord.toLowerCase().includes(c))) return 'd';
    }
  }

  const nextCharIdx = currentRaw.length;
  if (nextCharIdx < targetRaw.length) {
    return targetRaw[nextCharIdx];
  }
  return targetWord[0];
}

function tokenizeText(text) {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === ' ' || ch === '\n' || ch === '\t') {
      tokens.push({ type: 'space', value: ch, chars: [ch] });
      i++;
    } else {
      let j = i + 1;
      while (j < text.length && text[j] !== ' ' && text[j] !== '\n' && text[j] !== '\t') {
        j++;
      }
      const word = text.slice(i, j);
      tokens.push({ type: 'word', value: word, chars: Array.from(word) });
      i = j;
    }
  }
  return tokens;
}

// ====================================================================
// 4. CORE TYPING ENGINE CLASS
// ====================================================================
const IGNORE_KEYS = new Set([
  'Alt', 'Control', 'Meta', 'CapsLock', 'Tab',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'Home', 'End', 'PageUp', 'PageDown',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'Insert', 'PrintScreen', 'ScrollLock', 'Pause', 'ContextMenu'
]);

class TypingEngine {
  constructor() {
    this.textDisplay = document.getElementById('text-display');
    this.wpmDisplay = document.getElementById('stat-wpm');
    this.kcpmDisplay = document.getElementById('stat-kcpm');
    this.accuracyDisplay = document.getElementById('stat-accuracy');
    this.timerDisplay = document.getElementById('stat-timer');
    this.resultModal = document.getElementById('result-modal');
    this.restartBtn = document.getElementById('btn-restart');
    this.inputMethodToggle = document.getElementById('toggle-input-method');
    this.soundThemeSelect = document.getElementById('select-sound-theme');
    this.imeModeToggle = document.getElementById('toggle-ime-mode');

    this.rawContent = this.textDisplay?.getAttribute('data-content') || '';
    this.lessonId = this.textDisplay?.getAttribute('data-lesson-id') || null;
    this.inputMethod = this.textDisplay?.getAttribute('data-input-method') || 'TELEX';
    this.soundTheme = this.textDisplay?.getAttribute('data-sound-theme') || 'blue';
    this.imeMode = 'INTERNAL';

    this.tokens = [];
    this.tokenIndex = 0;
    this.currentKeys = [];
    this.currentTypedWord = '';

    this.isStarted = false;
    this.isFinished = false;
    this.startTime = null;
    this.timerInterval = null;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.missedKeys = {};

    this.init();
  }

  init() {
    if (!this.textDisplay || !this.rawContent) return;
    setSoundTheme(this.soundTheme);
    this.tokens = tokenizeText(this.rawContent);
    this.renderTokenSpans();
    this.bindEvents();
    this.reset();
  }

  renderTokenSpans() {
    this.textDisplay.innerHTML = '';
    const frag = document.createDocumentFragment();

    this.tokens.forEach((token, ti) => {
      const tokenSpan = document.createElement('span');
      tokenSpan.className = 'token token-pending';
      tokenSpan.id = `token-${ti}`;

      if (token.type === 'space') {
        tokenSpan.textContent = token.value === '\n' ? '↵\n' : token.value;
      } else {
        token.chars.forEach((ch, ci) => {
          const charSpan = document.createElement('span');
          charSpan.className = 'char char-pending';
          charSpan.id = `char-${ti}-${ci}`;
          charSpan.textContent = ch;
          tokenSpan.appendChild(charSpan);
        });
      }
      frag.appendChild(tokenSpan);
    });

    this.textDisplay.appendChild(frag);
  }

  reset() {
    this.tokenIndex = 0;
    this.currentKeys = [];
    this.currentTypedWord = '';
    this.isStarted = false;
    this.isFinished = false;
    this.startTime = null;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.missedKeys = {};

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.tokens.forEach((_, ti) => {
      const el = document.getElementById(`token-${ti}`);
      if (el) el.className = 'token token-pending';
    });
    document.querySelectorAll('.char').forEach(el => el.className = 'char char-pending');

    if (this.wpmDisplay) this.wpmDisplay.textContent = '0';
    if (this.kcpmDisplay) this.kcpmDisplay.textContent = '0';
    if (this.accuracyDisplay) this.accuracyDisplay.textContent = '100%';
    if (this.timerDisplay) this.timerDisplay.textContent = '00:00';
    if (this.resultModal) this.resultModal.classList.add('hidden');

    clearHighlights();
    this.updateCursor();
    this.highlightNextExpectedKey();
  }

  updateCursor() {
    document.querySelectorAll('.token-current').forEach(el => el.classList.remove('token-current'));
    if (this.tokenIndex < this.tokens.length) {
      const el = document.getElementById(`token-${this.tokenIndex}`);
      if (el) {
        el.classList.add('token-current');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  highlightNextExpectedKey() {
    if (this.tokenIndex >= this.tokens.length) {
      clearHighlights();
      return;
    }
    const token = this.tokens[this.tokenIndex];
    if (token.type === 'space') {
      highlightKey(' ');
      return;
    }
    const nextKey = getSuggestedNextKey(this.currentTypedWord, token.value, this.inputMethod);
    if (nextKey) {
      highlightKey(nextKey);
    } else {
      clearHighlights();
    }
  }

  handleKeyDown(e) {
    if (this.isFinished) return;
    if (IGNORE_KEYS.has(e.key)) return;
    if (e.key === 'Shift') return;

    e.preventDefault();

    if (!this.isStarted) {
      this.startTimer();
    }

    if (e.key === 'Escape') {
      this.resetCurrentWord();
      return;
    }

    if (e.key === 'Backspace') {
      if (e.ctrlKey) {
        this.resetCurrentWord();
      } else {
        this.handleBackspace();
      }
      return;
    }

    if (this.imeMode === 'INTERNAL') {
      this.processInternalKey(e.key);
    } else {
      this.processSystemKey(e.key);
    }
  }

  resetCurrentWord() {
    this.currentKeys = [];
    this.currentTypedWord = '';
    const token = this.tokens[this.tokenIndex];
    if (token && token.type === 'word') {
      token.chars.forEach((_, ci) => {
        const el = document.getElementById(`char-${this.tokenIndex}-${ci}`);
        if (el) el.className = 'char char-pending';
      });
    }
    this.highlightNextExpectedKey();
  }

  handleBackspace() {
    if (this.currentKeys.length > 0) {
      this.currentKeys.pop();
      const token = this.tokens[this.tokenIndex];
      if (token && token.type === 'word') {
        const check = checkWordMatch(this.currentKeys, token.value, this.inputMethod);
        this.currentTypedWord = check.currentWord;
        this.updateWordProgress(token, check.currentWord);
      }
      this.highlightNextExpectedKey();
    }
  }

  processInternalKey(pressedKey) {
    const token = this.tokens[this.tokenIndex];
    if (!token) return;

    this.totalKeystrokes++;

    // 1. Space token
    if (token.type === 'space') {
      if (pressedKey === ' ' || pressedKey === 'Enter') {
        this.correctKeystrokes++;
        playKeySound(this.soundTheme);
        this.markTokenSuccess(this.tokenIndex);
        this.tokenIndex++;
        this.currentKeys = [];
        this.currentTypedWord = '';
        this.updateCursor();
        this.highlightNextExpectedKey();
      } else {
        this.recordMissedKey(pressedKey);
        flashErrorKey(pressedKey);
        playErrorSound();
        this.markTokenError(this.tokenIndex);
      }
      this.updateStats();
      return;
    }

    // 2. Phím Space khi đang ở token Word
    if (pressedKey === ' ') {
      if (this.currentTypedWord === token.value) {
        this.correctKeystrokes++;
        playKeySound(this.soundTheme);
        this.markTokenSuccess(this.tokenIndex);
        this.tokenIndex++;
        this.currentKeys = [];
        this.currentTypedWord = '';

        if (this.tokenIndex < this.tokens.length && this.tokens[this.tokenIndex].type === 'space') {
          this.markTokenSuccess(this.tokenIndex);
          this.tokenIndex++;
        }
        this.updateCursor();
        this.highlightNextExpectedKey();
      } else {
        this.recordMissedKey(' ');
        flashErrorKey(' ');
        playErrorSound();
        this.markTokenFail(this.tokenIndex);
        this.tokenIndex++;
        this.currentKeys = [];
        this.currentTypedWord = '';

        if (this.tokenIndex < this.tokens.length && this.tokens[this.tokenIndex].type === 'space') {
          this.tokenIndex++;
        }
        this.updateCursor();
        this.highlightNextExpectedKey();
      }
      this.updateStats();
      return;
    }

    // 3. Cơ chế tự reset nếu gõ lại phím đầu tiên
    const firstChar = token.chars[0];
    if (pressedKey === firstChar && this.currentKeys.length > 0 && this.currentTypedWord !== token.value) {
      this.currentKeys = [pressedKey];
      const check = checkWordMatch(this.currentKeys, token.value, this.inputMethod);
      if (check.status !== 'wrong') {
        this.correctKeystrokes++;
        playKeySound(this.soundTheme);
        this.currentTypedWord = check.currentWord;
        this.updateWordProgress(token, check.currentWord);
        this.highlightNextExpectedKey();
        this.updateStats();
        return;
      }
    }

    // 4. Gõ ký tự bình thường
    this.currentKeys.push(pressedKey);
    const check = checkWordMatch(this.currentKeys, token.value, this.inputMethod);

    if (check.status === 'complete') {
      this.correctKeystrokes++;
      playKeySound(this.soundTheme);
      this.currentTypedWord = check.currentWord;
      this.markTokenSuccess(this.tokenIndex);

      this.tokenIndex++;
      this.currentKeys = [];
      this.currentTypedWord = '';
      this.updateCursor();
      this.highlightNextExpectedKey();
    } else if (check.status === 'partial') {
      this.correctKeystrokes++;
      playKeySound(this.soundTheme);
      this.currentTypedWord = check.currentWord;
      this.updateWordProgress(token, check.currentWord);
      this.highlightNextExpectedKey();
    } else {
      this.currentKeys.pop();
      this.recordMissedKey(pressedKey);
      flashErrorKey(pressedKey);
      playErrorSound();
      this.markTokenError(this.tokenIndex);
    }

    this.updateStats();
  }

  updateWordProgress(token, currentWord) {
    if (!token || !token.chars) return;
    token.chars.forEach((_, ci) => {
      const el = document.getElementById(`char-${this.tokenIndex}-${ci}`);
      if (!el) return;
      if (ci < currentWord.length) {
        el.className = 'char char-typing';
      } else {
        el.className = 'char char-pending';
      }
    });
  }

  processSystemKey(pressedKey) {
    const token = this.tokens[this.tokenIndex];
    if (!token) return;

    this.totalKeystrokes++;

    if (token.type === 'space') {
      if (pressedKey === ' ' || pressedKey === 'Enter') {
        this.correctKeystrokes++;
        playKeySound(this.soundTheme);
        this.markTokenSuccess(this.tokenIndex);
        this.tokenIndex++;
        this.updateCursor();
        this.highlightNextExpectedKey();
      } else {
        this.recordMissedKey(pressedKey);
        flashErrorKey(pressedKey);
        playErrorSound();
        this.markTokenError(this.tokenIndex);
      }
      this.updateStats();
      return;
    }

    const expectedChar = token.chars[this.currentKeys.length];
    if (pressedKey === expectedChar) {
      this.correctKeystrokes++;
      playKeySound(this.soundTheme);
      this.currentKeys.push(pressedKey);

      const el = document.getElementById(`char-${this.tokenIndex}-${this.currentKeys.length - 1}`);
      if (el) el.className = 'char char-correct';

      if (this.currentKeys.length >= token.chars.length) {
        this.markTokenSuccess(this.tokenIndex);
        this.tokenIndex++;
        this.currentKeys = [];
        this.updateCursor();
      }
      this.highlightNextExpectedKey();
    } else {
      this.recordMissedKey(expectedChar || pressedKey);
      flashErrorKey(pressedKey);
      playErrorSound();
      this.markTokenError(this.tokenIndex);
    }

    this.updateStats();
  }

  markTokenSuccess(ti) {
    const el = document.getElementById(`token-${ti}`);
    if (el) el.className = 'token token-correct';
    const token = this.tokens[ti];
    if (token && token.chars) {
      token.chars.forEach((_, ci) => {
        const charEl = document.getElementById(`char-${ti}-${ci}`);
        if (charEl) charEl.className = 'char char-correct';
      });
    }
    if (ti + 1 >= this.tokens.length) {
      this.finish();
    }
  }

  markTokenFail(ti) {
    const el = document.getElementById(`token-${ti}`);
    if (el) el.className = 'token token-wrong';
    const token = this.tokens[ti];
    if (token && token.chars) {
      token.chars.forEach((_, ci) => {
        const charEl = document.getElementById(`char-${ti}-${ci}`);
        if (charEl && charEl.className !== 'char char-correct') {
          charEl.className = 'char char-wrong';
        }
      });
    }
    if (ti + 1 >= this.tokens.length) {
      this.finish();
    }
  }

  markTokenError(ti) {
    const el = document.getElementById(`token-${ti}`);
    if (el) {
      el.classList.add('token-error-flash');
      setTimeout(() => el.classList.remove('token-error-flash'), 250);
    }
  }

  recordMissedKey(key) {
    if (!key) return;
    const k = key.toLowerCase();
    this.missedKeys[k] = (this.missedKeys[k] || 0) + 1;
  }

  startTimer() {
    if (this.isStarted) return;
    this.isStarted = true;
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => this.updateStats(), 1000);
  }

  updateStats() {
    if (!this.startTime) return;
    const elapsed = Math.max(1, Math.floor((Date.now() - this.startTime) / 1000));
    const mins = elapsed / 60;
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    if (this.timerDisplay) {
      this.timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    const kcpm = Math.round(this.correctKeystrokes / mins);
    const wpm = Math.round((this.correctKeystrokes / 5) / mins);
    const acc = this.totalKeystrokes > 0 ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100) : 100;
    if (this.kcpmDisplay) this.kcpmDisplay.textContent = String(kcpm);
    if (this.wpmDisplay) this.wpmDisplay.textContent = String(wpm);
    if (this.accuracyDisplay) this.accuracyDisplay.textContent = `${acc}%`;
  }

  finish() {
    if (this.isFinished) return;
    this.isFinished = true;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    clearHighlights();
    const elapsed = Math.max(1, Math.floor((Date.now() - (this.startTime || Date.now())) / 1000));
    const mins = elapsed / 60;
    const finalWpm = Math.round((this.correctKeystrokes / 5) / mins);
    const finalKcpm = Math.round(this.correctKeystrokes / mins);
    const finalAcc = this.totalKeystrokes > 0 ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100) : 100;
    this.saveResult(finalWpm, finalKcpm, finalAcc, elapsed);
    this.showResultModal(finalWpm, finalKcpm, finalAcc, elapsed);
  }

  async saveResult(wpm, kcpm, accuracy, duration) {
    try {
      await fetch('/api/stats/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wpm, kcpm, accuracy, missedKeys: this.missedKeys, duration, lessonId: this.lessonId })
      });
    } catch (err) {
      console.warn('Save result warning:', err.message);
    }
  }

  showResultModal(wpm, kcpm, accuracy, duration) {
    if (!this.resultModal) return;
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set('res-wpm', String(wpm));
    set('res-kcpm', String(kcpm));
    set('res-accuracy', `${accuracy}%`);
    set('res-time', `${duration}s`);
    this.resultModal.classList.remove('hidden');
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) &&
          document.activeElement.id !== 'typing-input') {
        return;
      }
      this.handleKeyDown(e);
    });

    this.textDisplay?.addEventListener('click', () => {
      const inp = document.getElementById('typing-input');
      inp?.focus();
    });

    this.restartBtn?.addEventListener('click', () => this.reset());
    document.getElementById('btn-modal-restart')?.addEventListener('click', () => this.reset());

    this.inputMethodToggle?.addEventListener('change', (e) => {
      this.inputMethod = e.target.value;
      this.currentKeys = [];
      this.currentTypedWord = '';
      this.highlightNextExpectedKey();
    });

    this.soundThemeSelect?.addEventListener('change', (e) => {
      this.soundTheme = e.target.value;
      setSoundTheme(this.soundTheme);
      playKeySound(this.soundTheme);
    });

    this.imeModeToggle?.addEventListener('change', (e) => {
      this.imeMode = e.target.checked ? 'INTERNAL' : 'SYSTEM';
      const label = document.getElementById('ime-mode-label');
      if (label) {
        label.textContent = this.imeMode === 'INTERNAL' ? 'Bộ gõ Web (Khuyên dùng)' : 'Dùng Unikey ngoài';
      }
      this.currentKeys = [];
      this.currentTypedWord = '';
      this.highlightNextExpectedKey();
    });
  }
}

// Khởi chạy ngay lập tức khi tải xong
function initEngine() {
  if (document.getElementById('text-display') && !window.typingEngine) {
    window.typingEngine = new TypingEngine();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEngine);
} else {
  initEngine();
}

window.TypingEngine = TypingEngine;
