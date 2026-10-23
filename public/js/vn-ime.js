/**
 * vn-ime.js
 * Bộ gõ Tiếng Việt nội bộ (Telex & VNI) chuẩn xác và linh hoạt
 * Tối ưu hóa cho Touch Typing không độ trễ
 */

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

const TELEX_TONE_MAP = {
  's': 1, 'f': 2, 'r': 3, 'x': 4, 'j': 5, 'z': 0
};

const VNI_TONE_MAP = {
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '0': 0
};

const TELEX_CIRCUMFLEX = {
  'a': 'â', 'â': 'a',
  'e': 'ê', 'ê': 'e',
  'o': 'ô', 'ô': 'o',
  'd': 'đ', 'đ': 'd'
};

const TELEX_HORN = {
  'a': 'ă', 'ă': 'a',
  'o': 'ơ', 'ơ': 'o',
  'u': 'ư', 'ư': 'u'
};

/**
 * Tìm vị trí đặt dấu thanh CHUẨN XÁC theo ngữ pháp tiếng Việt:
 * 1. Với 'ươ': luôn đặt ở 'ơ' (nước, đường, rượu, hươu).
 * 2. Với 'iê', 'yê', 'uô': luôn đặt ở 'ê' hoặc 'ô' (tiếng, thuyền, muốn).
 * 3. Nếu có phụ âm cuối: đặt ở nguyên âm cuối (toán, hoàn, luật).
 * 4. Không có phụ âm cuối: 'oa', 'oe', 'uy' đặt ở âm 2 (hóa, nhòe, thúy); các âm khác đặt ở âm 1 (mái, núi, nói).
 */
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

  // 1. Cặp 'ươ' (như trong "nước", "đường", "mượn", "rượu", "hươu")
  if (vowelSeq === 'ươ' || vowelSeq.startsWith('ươ')) {
    return vowelIndices[1]; // Đặt ở 'ơ'
  }

  // 2. Cặp 'iê', 'yê', 'uô'
  if (['iê', 'yê', 'uô'].some(seq => vowelSeq.startsWith(seq))) {
    return vowelIndices[1];
  }

  // 3. Có phụ âm cuối
  if (hasEndingConsonant) {
    return vowelIndices[vowelIndices.length - 1];
  } else {
    // Không có phụ âm cuối
    if (['oa', 'oe', 'uy'].includes(vowelSeq)) {
      return vowelIndices[1];
    }
    return vowelIndices[0];
  }
}

/**
 * Xử lý chuỗi phím Telex thành từ tiếng Việt chuẩn
 */
function parseTelex(keys) {
  let chars = [];

  for (let i = 0; i < keys.length; i++) {
    const rawKey = keys[i];
    const key = rawKey.toLowerCase();

    // 1. Phím dấu thanh (s, f, r, x, j, z)
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

    // 2. Phím mũ (a, e, o, d)
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

    // 3. Phím móc (w)
    if (key === 'w') {
      let modified = false;

      // Xử lý thông minh cụm "uo" + "w" -> "ươ" (như nuoc + w -> nươc, duong + w -> đương)
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

        chars[uIdx] = (uChar === uChar.toUpperCase() && uChar !== uChar.toLowerCase())
          ? VOWEL_TABLE['ư'][uTone].toUpperCase()
          : VOWEL_TABLE['ư'][uTone];
        chars[oIdx] = (oChar === oChar.toUpperCase() && oChar !== oChar.toLowerCase())
          ? VOWEL_TABLE['ơ'][oTone].toUpperCase()
          : VOWEL_TABLE['ơ'][oTone];
        modified = true;
      } else {
        // Biến đổi đơn lẻ: u -> ư, o -> ơ, a -> ă
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

/**
 * Xử lý chuỗi phím VNI thành từ tiếng Việt chuẩn
 */
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

/**
 * Đánh giá độ khớp giữa các phím đã gõ và từ mục tiêu
 */
function checkWordMatch(typedKeys, targetWord, method = 'TELEX') {
  if (typedKeys.length === 0) {
    return { status: 'partial', currentWord: '' };
  }

  const currentWord = method === 'TELEX' ? parseTelex(typedKeys) : parseVNI(typedKeys);

  // 1. Khớp hoàn toàn
  if (currentWord === targetWord) {
    return { status: 'complete', currentWord };
  }

  // 2. Khớp tiền tố chính xác
  if (targetWord.startsWith(currentWord)) {
    return { status: 'partial', currentWord };
  }

  // 3. Khớp tiền tố khi bỏ dấu thanh (VD: "Nước" -> bỏ thanh là "Nươc", currentWord là "Nươc")
  const targetWithoutTone = removeTone(targetWord);
  if (targetWithoutTone === currentWord || targetWithoutTone.startsWith(currentWord)) {
    return { status: 'partial', currentWord };
  }

  // 4. Khớp tiền tố khi bỏ cả mũ và móc (VD: "Nuoc" cho "Nước")
  const targetRaw = removeAllAccents(targetWord);
  const currentRaw = removeAllAccents(currentWord);
  if (targetRaw === currentRaw || targetRaw.startsWith(currentRaw)) {
    return { status: 'partial', currentWord };
  }

  return { status: 'wrong', currentWord };
}

/**
 * Gợi ý phím tiếp theo nên gõ cho từ targetWord
 */
function getSuggestedNextKey(currentWord, targetWord, method = 'TELEX') {
  if (!targetWord) return null;
  if (currentWord === targetWord) return ' ';

  const isTelex = method === 'TELEX';

  if (!currentWord) {
    return targetWord[0];
  }

  // Nếu đã gõ xong phần chữ không dấu thanh (VD: "Hêu" cho "Hếu", "Nươc" cho "Nước")
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

  // Nếu chữ thô đã đủ nhưng thiếu mũ/móc
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

/**
 * Tách văn bản thành mảng tokens (từ và khoảng trắng)
 */
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

export {
  parseTelex,
  parseVNI,
  removeTone,
  removeAllAccents,
  checkWordMatch,
  getSuggestedNextKey,
  tokenizeText,
  CHAR_TO_VOWEL_INFO,
  VOWEL_TABLE
};
