/**
 * virtual-hands.js
 * Quản lý highlight bàn phím ảo ANSI và bàn tay SVG 10 ngón
 */

// Bảng ánh xạ phím vật lý → bàn tay (left/right) và ngón tay (pinky, ring, middle, index, thumb)
const KEY_TO_FINGER = {
  // Hàng số & ký tự đặc biệt hàng 1
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

  // Hàng 2: Tab, Q, W, E, R, T, Y, U, I, O, P, [, ], \
  'Tab': { hand: 'left', finger: 'pinky', keyId: 'key-tab' },
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

  // Hàng 3: Caps, A, S, D, F, G, H, J, K, L, ;, ', Enter
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

  // Hàng 4: Shift, Z, X, C, V, B, N, M, ,, ., /, Shift
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

  // Hàng 5: Phím cách Space
  ' ': { hand: 'right', finger: 'thumb', keyId: 'key-space' }
};

/**
 * Xóa toàn bộ trạng thái highlight trên bàn phím và bàn tay
 */
function clearHighlights() {
  // Xóa active trên tất cả các phím
  const activeKeys = document.querySelectorAll('.key.active');
  activeKeys.forEach(el => el.classList.remove('active'));

  // Xóa active trên các ngón tay SVG
  const activeFingers = document.querySelectorAll('.finger-active');
  activeFingers.forEach(el => el.classList.remove('finger-active'));
}

/**
 * Làm sáng phím và ngón tay tương ứng
 * @param {string} keyStr Phím cần bấm (VD: 'f', 'A', ' ', 'Enter')
 */
function highlightKey(keyStr) {
  clearHighlights();

  if (!keyStr) return;

  const keyInfo = KEY_TO_FINGER[keyStr];
  if (!keyInfo) {
    // Thử tìm phím dạng lowercase nếu không tìm thấy
    const fallback = KEY_TO_FINGER[keyStr.toLowerCase()];
    if (!fallback) return;
    applyHighlight(fallback);
    return;
  }

  applyHighlight(keyInfo);
}

function applyHighlight(keyInfo) {
  // 1. Highlight phím chính trên bàn phím
  const keyEl = document.getElementById(keyInfo.keyId);
  if (keyEl) {
    keyEl.classList.add('active');
  }

  // 2. Highlight ngón tay tương ứng trên SVG
  const fingerId = `hand-${keyInfo.hand}-${keyInfo.finger}`;
  const fingerEl = document.getElementById(fingerId);
  if (fingerEl) {
    fingerEl.classList.add('finger-active');
  }

  // 3. Nếu phím yêu cầu Shift (ký tự viết hoa hoặc ký tự hàng trên)
  if (keyInfo.shift) {
    // Nguyên tắc công thái học: Dùng Shift của bàn tay NGƯỢC LẠI
    const oppositeHand = keyInfo.hand === 'left' ? 'right' : 'left';
    const shiftKeyId = oppositeHand === 'left' ? 'key-shift-left' : 'key-shift-right';
    const oppositeShiftEl = document.getElementById(shiftKeyId);
    if (oppositeShiftEl) {
      oppositeShiftEl.classList.add('active');
    }

    // Highlight ngón út của bàn tay ngược lại
    const shiftFingerId = `hand-${oppositeHand}-pinky`;
    const shiftFingerEl = document.getElementById(shiftFingerId);
    if (shiftFingerEl) {
      shiftFingerEl.classList.add('finger-active');
    }
  }
}

/**
 * Hiệu ứng nhấp nháy đỏ khi bấm sai phím
 * @param {string} keyStr Phím bấm sai
 */
function flashErrorKey(keyStr) {
  if (!keyStr) return;
  const keyInfo = KEY_TO_FINGER[keyStr] || KEY_TO_FINGER[keyStr.toLowerCase()];
  if (keyInfo) {
    const keyEl = document.getElementById(keyInfo.keyId);
    if (keyEl) {
      keyEl.classList.add('error');
      setTimeout(() => {
        keyEl.classList.remove('error');
      }, 250);
    }
  }
}

export {
  highlightKey,
  clearHighlights,
  flashErrorKey,
  KEY_TO_FINGER
};
