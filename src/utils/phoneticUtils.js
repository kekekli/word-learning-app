export const IPA_TO_SPELLING = {
  // 元音 Vowels
  'iː': ['ee', 'ea', 'ie', 'ei', 'ey', 'igh', 'e', 'y'],
  'ɪ':  ['i', 'y', 'ui'],
  'e':  ['ea', 'ai', 'ie', 'e', 'a'],
  'æ':  ['a'],
  'ɑː': ['ar', 'alm', 'a', 'o'],
  'ɒ':  ['o', 'a', 'ou'],
  'ɔː': ['oor', 'ore', 'ough', 'aught', 'ought', 'aw', 'or', 'au', 'al', 'a'],
  'ʌ':  ['oo', 'ou', 'u', 'o'],
  'ʊ':  ['oo', 'ou', 'u', 'o'],
  'uː': ['oo', 'ew', 'ue', 'ui', 'ou', 'oe', 'u'],
  'ɜː': ['ear', 'our', 'yr', 'ir', 'ur', 'er', 'or'],
  'ə':  ['ture', 'our', 'ar', 'er', 'or', 'ure', 'a', 'e', 'i', 'o', 'u'],

  // 双元音 Diphthongs
  'eɪ': ['eigh', 'aigh', 'ay', 'ai', 'ey', 'ea', 'a'],
  'aɪ': ['igh', 'ie', 'uy', 'eye', 'i', 'y'],
  'ɔɪ': ['oi', 'oy'],
  'aʊ': ['ou', 'ow'],
  'əʊ': ['oa', 'ow', 'oe', 'ew', 'ough', 'o'],
  'oʊ': ['oa', 'ow', 'oe', 'ough', 'o'],
  'ɪə': ['eer', 'ear', 'ere', 'ier', 'eir'],
  'eə': ['air', 'are', 'ear', 'ere', 'ayer'],
  'ʊə': ['ure', 'oor', 'our'],

  // 辅音 Consonants
  'p':  ['p', 'pp'],
  'b':  ['b', 'bb'],
  't':  ['tt', 't', 'ed'],
  'd':  ['dd', 'd', 'ed'],
  'k':  ['ck', 'ch', 'cc', 'qu', 'c', 'k', 'q'],
  'g':  ['gg', 'gh', 'gu', 'g'],
  'ɡ':  ['gg', 'gh', 'gu', 'g'],
  'f':  ['ph', 'ff', 'gh', 'f'],
  'v':  ['ve', 'v'],
  's':  ['ss', 'sc', 'ce', 'se', 'ps', 'c', 's'],
  'z':  ['zz', 'se', 'ze', 'z', 's'],
  'θ':  ['th'],
  'ð':  ['th'],
  'ʃ':  ['ssi', 'tio', 'sch', 'shi', 'sh', 'ci', 'ti', 'si', 'ch', 's'],
  'ʒ':  ['si', 'ge', 'z', 's'],
  'h':  ['wh', 'h'],
  'tʃ': ['tch', 'ture', 'tio', 'tu', 'ti', 'ch'],
  'dʒ': ['dge', 'dg', 'gg', 'ge', 'di', 'j', 'g'],
  'm':  ['mm', 'mb', 'mn', 'm'],
  'n':  ['kn', 'gn', 'pn', 'nn', 'n'],
  'ŋ':  ['ng', 'nk', 'n'],
  'l':  ['ll', 'le', 'l'],
  'r':  ['rr', 'wr', 'rh', 'r'],
  'j':  ['y', 'i'],
  'w':  ['wh', 'w', 'u'],
  'ks': ['x', 'cks', 'ks']
};

const PHONEME_REGEX = /(tr|dr|ts|dz|tʃ|dʒ|iː|ɜː|uː|ɔː|ɑː|aɪ|aʊ|eɪ|oʊ|əʊ|ɔɪ|ɪə|eə|ʊə|ks|p|b|t|d|k|g|ɡ|f|v|s|z|θ|ð|ʃ|ʒ|h|m|n|ŋ|l|r|j|w|ɪ|e|æ|ə|ʌ|ʊ|ɒ)/g;

export function generatePhoneticBlocks(word, ipa) {
  if (!word || !ipa) return [];

  const cleanIpa = ipa.replace(/[\/\\\[\]ˈˌ()\s]/g, '');
  const phonemes = [];
  let match;
  PHONEME_REGEX.lastIndex = 0;
  while ((match = PHONEME_REGEX.exec(cleanIpa)) !== null) {
    phonemes.push(match[0]);
  }

  const wordLower = word.toLowerCase();

  function backtrack(wordIndex, phonemeIndex) {
    if (phonemeIndex === phonemes.length) {
      if (wordIndex < wordLower.length) {
         return [{ letters: wordLower.substring(wordIndex), phonetic: '', is_silent: true }];
      }
      return [];
    }
    
    if (wordIndex >= wordLower.length) return null;
    
    const currentPhoneme = phonemes[phonemeIndex];
    const possibleSpellings = IPA_TO_SPELLING[currentPhoneme] || [];
    
    // 优先尝试完整的字母组合匹配
    for (const spelling of possibleSpellings) {
      if (wordLower.substring(wordIndex).startsWith(spelling)) {
        const nextBlocks = backtrack(wordIndex + spelling.length, phonemeIndex + 1);
        if (nextBlocks !== null) {
          return [{ letters: wordLower.substring(wordIndex, wordIndex + spelling.length), phonetic: currentPhoneme }, ...nextBlocks];
        }
      }
    }
    
    // 如果没有精准匹配，尝试将当前字母当作静音字母跳过
    const skippingNextBlocks = backtrack(wordIndex + 1, phonemeIndex);
    if (skippingNextBlocks !== null) {
      // 检查后续连续静音字母能否合并
      return [{ letters: wordLower[wordIndex], phonetic: '', is_silent: true }, ...skippingNextBlocks];
    }
    
    return null;
  }
  
  const result = backtrack(0, 0);
  
  if (result) {
    // 恢复原有大小写，并合并相邻的静音字母
    let originalIdx = 0;
    const finalBlocks = [];
    
    for (let i = 0; i < result.length; i++) {
      const block = result[i];
      const originalLetters = word.substring(originalIdx, originalIdx + block.letters.length);
      
      if (block.is_silent && finalBlocks.length > 0 && finalBlocks[finalBlocks.length - 1].is_silent) {
        finalBlocks[finalBlocks.length - 1].letters += originalLetters;
      } else {
        finalBlocks.push({ ...block, letters: originalLetters });
      }
      originalIdx += block.letters.length;
    }
    return finalBlocks;
  }
  
  // 失败降级：如果不匹配，就当作一个整体展示。我们不希望失败时直接白板或抛错
  return [
    { letters: word, phonetic: '', is_silent: true },
    { letters: '', phonetic: cleanIpa, is_silent: false }
  ];
}
