/**
 * vn-decomposer.js
 * Bộ giải mã và tách ký tự / từ Tiếng Việt thành chuỗi phím bấm vật lý chuẩn cho TELEX và VNI
 */

// Bảng quy chiếu nguyên âm có mũ / móc cơ bản
const TELEX_MODIFIERS = {
  'ă': ['a', 'w'],
  'â': ['a', 'a'],
  'đ': ['d', 'd'],
  'ê': ['e', 'e'],
  'ô': ['o', 'o'],
  'ơ': ['o', 'w'],
  'ư': ['u', 'w'],
};

const VNI_MODIFIERS = {
  'ă': ['a', '8'],
  'â': ['a', '6'],
  'đ': ['d', '9'],
  'ê': ['e', '6'],
  'ô': ['o', '6'],
  'ơ': ['o', '7'],
  'ư': ['u', '7'],
};

// Bảng thanh điệu (Tone marks)
const TELEX_TONES = {
  'sắc': 's',
  'huyền': 'f',
  'hỏi': 'r',
  'ngã': 'x',
  'nặng': 'j',
  'none': ''
};

const VNI_TONES = {
  'sắc': '1',
  'huyền': '2',
  'hỏi': '3',
  'ngã': '4',
  'nặng': '5',
  'none': ''
};

// Bảng mapping nguyên âm có dấu → base character + tone
const VOWEL_DECOMP = {
  // A series
  'á': { base: 'a', tone: 'sắc' },
  'à': { base: 'a', tone: 'huyền' },
  'ả': { base: 'a', tone: 'hỏi' },
  'ã': { base: 'a', tone: 'ngã' },
  'ạ': { base: 'a', tone: 'nặng' },

  // Ă series
  'ă': { base: 'ă', tone: 'none' },
  'ắ': { base: 'ă', tone: 'sắc' },
  'ằ': { base: 'ă', tone: 'huyền' },
  'ẳ': { base: 'ă', tone: 'hỏi' },
  'ẵ': { base: 'ă', tone: 'ngã' },
  'ặ': { base: 'ă', tone: 'nặng' },

  // Â series
  'â': { base: 'â', tone: 'none' },
  'ấ': { base: 'â', tone: 'sắc' },
  'ầ': { base: 'â', tone: 'huyền' },
  'ẩ': { base: 'â', tone: 'hỏi' },
  'ẫ': { base: 'â', tone: 'ngã' },
  'ậ': { base: 'â', tone: 'nặng' },

  // E series
  'é': { base: 'e', tone: 'sắc' },
  'è': { base: 'e', tone: 'huyền' },
  'ẻ': { base: 'e', tone: 'hỏi' },
  'ẽ': { base: 'e', tone: 'ngã' },
  'ẹ': { base: 'e', tone: 'nặng' },

  // Ê series
  'ê': { base: 'ê', tone: 'none' },
  'ế': { base: 'ê', tone: 'sắc' },
  'ề': { base: 'ê', tone: 'huyền' },
  'ể': { base: 'ê', tone: 'hỏi' },
  'ễ': { base: 'ê', tone: 'ngã' },
  'ệ': { base: 'ê', tone: 'nặng' },

  // I series
  'í': { base: 'i', tone: 'sắc' },
  'ì': { base: 'i', tone: 'huyền' },
  'ỉ': { base: 'i', tone: 'hỏi' },
  'ĩ': { base: 'i', tone: 'ngã' },
  'ị': { base: 'i', tone: 'nặng' },

  // O series
  'ó': { base: 'o', tone: 'sắc' },
  'ò': { base: 'o', tone: 'huyền' },
  'ỏ': { base: 'o', tone: 'hỏi' },
  'õ': { base: 'o', tone: 'ngã' },
  'ọ': { base: 'o', tone: 'nặng' },

  // Ô series
  'ô': { base: 'ô', tone: 'none' },
  'ố': { base: 'ô', tone: 'sắc' },
  'ồ': { base: 'ô', tone: 'huyền' },
  'ổ': { base: 'ô', tone: 'hỏi' },
  'ỗ': { base: 'ô', tone: 'ngã' },
  'ộ': { base: 'ô', tone: 'nặng' },

  // Ơ series
  'ơ': { base: 'ơ', tone: 'none' },
  'ớ': { base: 'ơ', tone: 'sắc' },
  'ờ': { base: 'ơ', tone: 'huyền' },
  'ở': { base: 'ơ', tone: 'hỏi' },
  'ỡ': { base: 'ơ', tone: 'ngã' },
  'ợ': { base: 'ơ', tone: 'nặng' },

  // U series
  'ú': { base: 'u', tone: 'sắc' },
  'ù': { base: 'u', tone: 'huyền' },
  'ủ': { base: 'u', tone: 'hỏi' },
  'ũ': { base: 'u', tone: 'ngã' },
  'ụ': { base: 'u', tone: 'nặng' },

  // Ư series
  'ư': { base: 'ư', tone: 'none' },
  'ứ': { base: 'ư', tone: 'sắc' },
  'ừ': { base: 'ư', tone: 'huyền' },
  'ử': { base: 'ư', tone: 'hỏi' },
  'ữ': { base: 'ư', tone: 'ngã' },
  'ự': { base: 'ư', tone: 'nặng' },

  // Y series
  'ý': { base: 'y', tone: 'sắc' },
  'ỳ': { base: 'y', tone: 'huyền' },
  'ỷ': { base: 'y', tone: 'hỏi' },
  'ỹ': { base: 'y', tone: 'ngã' },
  'ỵ': { base: 'y', tone: 'nặng' },

  // Đ
  'đ': { base: 'đ', tone: 'none' }
};

/**
 * Tách một ký tự Tiếng Việt đơn lẻ thành mảng các phím bấm vật lý
 * @param {string} char Ký tự đầu vào (VD: 'ệ', 'Ă', 'd', ' ')
 * @param {'TELEX'|'VNI'} inputMethod Kiểu gõ ('TELEX' hoặc 'VNI')
 * @returns {string[]} Mảng các phím vật lý cần bấm (VD: ['e', 'e', 'j'] hoặc ['e', '6', '5'])
 */
function decomposeVietnameseChar(char, inputMethod = 'TELEX') {
  if (!char) return [];

  const isUpper = char !== char.toLowerCase() && char === char.toUpperCase();
  const lowerChar = char.toLowerCase();

  // Nếu là ký tự có dấu hoặc nguyên âm mũ trong tiếng Việt
  if (VOWEL_DECOMP[lowerChar]) {
    const { base, tone } = VOWEL_DECOMP[lowerChar];
    const isTelex = inputMethod === 'TELEX';
    const toneKey = isTelex ? TELEX_TONES[tone] : VNI_TONES[tone];
    let baseKeys = [];

    if (isTelex) {
      baseKeys = TELEX_MODIFIERS[base] ? [...TELEX_MODIFIERS[base]] : [base];
    } else {
      baseKeys = VNI_MODIFIERS[base] ? [...VNI_MODIFIERS[base]] : [base];
    }

    // Nếu ký tự gốc là in hoa, ký tự đầu tiên trong mảng được viết hoa
    if (isUpper && baseKeys.length > 0) {
      baseKeys[0] = baseKeys[0].toUpperCase();
    }

    if (toneKey) {
      baseKeys.push(toneKey);
    }

    return baseKeys;
  }

  // Nếu là ký tự latin thông thường hoặc ký tự đặc biệt
  return [char];
}

/**
 * Tách toàn bộ một từ hoặc chuỗi thành mảng các phím bấm vật lý tuần tự
 * @param {string} word Từ hoặc cụm từ
 * @param {'TELEX'|'VNI'} inputMethod
 * @returns {string[]} Mảng phím
 */
function decomposeWord(word, inputMethod = 'TELEX') {
  if (!word) return [];

  const keys = [];
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const decomposed = decomposeVietnameseChar(char, inputMethod);
    keys.push(...decomposed);
  }
  return keys;
}

export {
  decomposeVietnameseChar,
  decomposeWord,
  TELEX_MODIFIERS,
  VNI_MODIFIERS,
  TELEX_TONES,
  VNI_TONES,
  VOWEL_DECOMP
};
