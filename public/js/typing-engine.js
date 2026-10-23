/**
 * typing-engine.js  (v4 – Vietnamese Smart IME Engine)
 *
 * Tối ưu hóa:
 *   - Xử lý ghép âm vần tiếng Việt chuẩn xác (nước, đường, tiếng, đất...).
 *   - Cơ chế tự phục hồi: nếu gõ sai, bấm lại phím đầu từ hoặc bấm Backspace/Escape sẽ tự reset.
 *   - Phím Space linh hoạt: hoàn thành từ hoặc chuyển sang từ tiếp theo nếu bỏ qua từ lỗi, không bao giờ bị kẹt.
 *   - Highlight phím chuẩn và ngón tay tương ứng trên bàn phím ảo.
 */

import { highlightKey, clearHighlights, flashErrorKey } from './virtual-hands.js';
import { playKeySound, playErrorSound, setSoundTheme } from './sound-manager.js';
import {
  checkWordMatch,
  getSuggestedNextKey,
  tokenizeText,
} from './vn-ime.js';

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

    // Escape: Reset từ hiện tại để gõ lại từ đầu
    if (e.key === 'Escape') {
      this.resetCurrentWord();
      return;
    }

    // Backspace: Xóa phím gõ nhầm
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

    // 1. Token là dấu cách / xuống dòng
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

    // 2. Token là từ, người dùng nhấn phím Space
    if (pressedKey === ' ') {
      if (this.currentTypedWord === token.value) {
        // Gõ đúng hoàn toàn từ -> thành công
        this.correctKeystrokes++;
        playKeySound(this.soundTheme);
        this.markTokenSuccess(this.tokenIndex);
        this.tokenIndex++;
        this.currentKeys = [];
        this.currentTypedWord = '';

        // Tự động bỏ qua dấu cách kế tiếp
        if (this.tokenIndex < this.tokens.length && this.tokens[this.tokenIndex].type === 'space') {
          this.markTokenSuccess(this.tokenIndex);
          this.tokenIndex++;
        }

        this.updateCursor();
        this.highlightNextExpectedKey();
      } else {
        // Gõ dở hoặc gõ sai mà bấm Space -> đánh dấu lỗi từ và chuyển tiếp (không bị kẹt)
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

    // 3. Cơ chế tự phục hồi thông minh:
    // Nếu người dùng bấm đúng phím đầu tiên của từ (VD: 'N' cho "Nước")
    // mà từ hiện tại chưa gõ đúng -> reset và bắt đầu từ đầu
    const firstChar = token.chars[0];
    if (pressedKey === firstChar && this.currentKeys.length > 0 && this.currentTypedWord !== token.value) {
      // Thử xem nếu reset rồi thêm phím này có khớp không
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

    // 4. Gõ ký tự bình thường vào từ
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
    const acc = this.totalKeystrokes > 0
      ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100)
      : 100;

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
    const finalAcc = this.totalKeystrokes > 0
      ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100)
      : 100;

    this.saveResult(finalWpm, finalKcpm, finalAcc, elapsed);
    this.showResultModal(finalWpm, finalKcpm, finalAcc, elapsed);
  }

  async saveResult(wpm, kcpm, accuracy, duration) {
    try {
      await fetch('/api/stats/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wpm,
          kcpm,
          accuracy,
          missedKeys: this.missedKeys,
          duration,
          lessonId: this.lessonId
        })
      });
    } catch (err) {
      console.warn('Lỗi khi lưu kết quả:', err.message);
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
        label.textContent = this.imeMode === 'INTERNAL'
          ? 'Bộ gõ Web (Khuyên dùng)'
          : 'Dùng Unikey ngoài';
      }
      this.currentKeys = [];
      this.currentTypedWord = '';
      this.highlightNextExpectedKey();
    });
  }
}

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

export { TypingEngine };
