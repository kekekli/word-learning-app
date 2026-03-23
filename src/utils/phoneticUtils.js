/**
 * Phonics Engine V3 - 基于人教版及自然拼读 (Phonics) Hall 1-7 教学逻辑
 * 支持复杂的单词切分、静音字母识别、以及多音一字/一音多字的情况。
 */

// 1. 定义音标到字母组合的映射字典 (包含 Hall 1-7 所有核心规则)
export const IPA_TO_SPELLING = {
  // --- 元音 Vowels ---
  'iː': ['ee', 'ea', 'ie', 'ei', 'ey', 'e', 'y', 'i'],
  'ɪ':  ['i', 'y', 'ui', 'e', 'o'],
  'e':  ['e', 'ea', 'ai', 'ie', 'a'],
  'æ':  ['a'],
  'ɑː': ['ar', 'alm', 'a', 'o'],
  'ɒ':  ['o', 'a', 'ou'],
  'ɔː': ['or', 'oor', 'ore', 'aw', 'au', 'al', 'ough', 'aught', 'ought', 'a', 'oo'], // 增加 oo 对应 floor
  'ʌ':  ['u', 'o', 'ou', 'oo'],
  'ʊ':  ['oo', 'u', 'ou', 'o'],
  'uː': ['oo', 'u', 'ew', 'ue', 'ui', 'ou', 'oe'],
  'ɜː': ['er', 'ir', 'ur', 'or', 'ear', 'our', 'yr'],
  'ə':  ['er', 'ar', 'or', 'ur', 'ure', 'a', 'e', 'i', 'o', 'u', 'our', 'ture'],

  // --- 双元音 Diphthongs ---
  'eɪ': ['ai', 'ay', 'a', 'ey', 'ea', 'eigh', 'aigh'], 
  'aɪ': ['i', 'y', 'igh', 'ie', 'uy', 'eye'],
  'ɔɪ': ['oi', 'oy'],
  'aʊ': ['ou', 'ow'],
  'əʊ': ['oa', 'ow', 'o', 'oe', 'ew', 'ough'],
  'oʊ': ['oa', 'ow', 'o', 'oe', 'ough'], // 美式常用
  'ɪə': ['eer', 'ear', 'ere', 'ier', 'eir'],
  'eə': ['air', 'are', 'ear', 'ere', 'ayer'],
  'ʊə': ['ure', 'oor', 'our'],

  // --- 辅音 Consonants ---
  'p':  ['p', 'pp'],
  'b':  ['b', 'bb'],
  't':  ['t', 'tt', 'ed', 'bt'],
  'd':  ['d', 'dd', 'ed'],
  'k':  ['c', 'k', 'ck', 'ch', 'cc', 'qu', 'q'],
  'g':  ['g', 'gg', 'gh', 'gu'],
  'ɡ':  ['g', 'gg', 'gh', 'gu'],
  'f':  ['f', 'ff', 'ph', 'gh'],
  'v':  ['v', 've'],
  's':  ['s', 'ss', 'c', 'ce', 'se', 'sc', 'ps'],
  'z':  ['z', 's', 'zz', 'se', 'ze'],
  'θ':  ['th'],
  'ð':  ['th'],
  'ʃ':  ['sh', 'ti', 'ci', 'si', 'ch', 's', 'ssi', 'tio'],
  'ʒ':  ['s', 'ge', 'si', 'z'],
  'h':  ['h', 'wh'],
  'tʃ': ['ch', 'tch', 'tu', 'ti', 'ture'],
  'dʒ': ['j', 'g', 'ge', 'dge', 'dg', 'gg', 'di'],
  'm':  ['m', 'mm', 'mb', 'mn'],
  'n':  ['n', 'nn', 'kn', 'gn', 'pn'],
  'ŋ':  ['ng', 'nk', 'n'],
  'l':  ['l', 'll', 'le'],
  'r':  ['r', 'rr', 'wr', 'rh'],
  'j':  ['y', 'i', 'j'],
  'w':  ['w', 'wh', 'u'],
  'ks': ['x', 'cks', 'ks'],
  
  // --- 特殊/复合 Phonics 处理 (Hall 7) ---
  'juː': ['u', 'ew', 'ue'], // 解决 computer, pupil 等 u 发 /j/+/u/ 的情况
};

// 2. 音素提取正则 (越长的复合音素排得越前，确保贪婪匹配)
const PHONEME_REGEX = /(tʃ|dʒ|juː|iː|ɜː|uː|ɔː|ɑː|aɪ|aʊ|eɪ|oʊ|əʊ|ɔɪ|ɪə|eə|ʊə|ks|tr|dr|ts|dz|p|b|t|d|k|g|ɡ|f|v|s|z|θ|ð|ʃ|ʒ|h|m|n|ŋ|l|r|j|w|ɪ|e|æ|ə|ʌ|ʊ|ɒ)/g;

/**
 * 单词切分主函数
 */
export function generatePhoneticBlocks(word, ipa) {
  if (!word || !ipa) return [];

  // 清刷音标：处理特殊长音号 `:`, 替换成标准的 `ː`，并移除重音符号
  const cleanIpa = ipa
    .replace(/:/g, 'ː')
    .replace(/[\/\\\[\]ˈˌ()\s]/g, '');

  // 提取单词中的音素序列
  const phonemes = [];
  let match;
  PHONEME_REGEX.lastIndex = 0;
  while ((match = PHONEME_REGEX.exec(cleanIpa)) !== null) {
    phonemes.push(match[0]);
  }

  const wordLower = word.toLowerCase();
  
  // 使用 Map 进行记忆化，防止复杂单词递归爆炸
  const memo = new Map();

  /**
   * 回溯匹配核心递归函数
   */
  function backtrack(wordIdx, phonemeIdx) {
    const memoKey = `${wordIdx}-${phonemeIdx}`;
    if (memo.has(memoKey)) return memo.get(memoKey);

    // 基础出口：音标匹配完了
    if (phonemeIdx === phonemes.length) {
      // 如果单词有剩余，作为静音字母处理（Hall 3 & 7）
      if (wordIdx < wordLower.length) {
        return [{ letters: wordLower.substring(wordIdx), phonetic: '', is_silent: true }];
      }
      return [];
    }
    
    // 如果单词用完了但音标还有，说明匹配失败
    if (wordIdx >= wordLower.length) return null;
    
    const curPhoneme = phonemes[phonemeIdx];
    const spellings = IPA_TO_SPELLING[curPhoneme] || [];
    
    // 方案 A: 尝试正常字母组合匹配 (贪婪匹配：长的组合优先)
    for (const spelling of spellings) {
      if (wordLower.substring(wordIdx).startsWith(spelling)) {
        const next = backtrack(wordIdx + spelling.length, phonemeIdx + 1);
        if (next !== null) {
          const res = [{ letters: wordLower.substring(wordIdx, wordIdx + spelling.length), phonetic: curPhoneme, is_silent: false }, ...next];
          memo.set(memoKey, res);
          return res;
        }
      }
    }
    
    // 方案 B: 容错处理 - 尝试跳过一个字母作为静音字母 (Magic E 等情境)
    const skipOne = backtrack(wordIdx + 1, phonemeIdx);
    if (skipOne !== null) {
      const res = [{ letters: wordLower[wordIdx], phonetic: '', is_silent: true }, ...skipOne];
      memo.set(memoKey, res);
      return res;
    }
    
    memo.set(memoKey, null);
    return null;
  }
  
  const result = backtrack(0, 0);
  
  // 后置处理：恢复原始大小写，并合并相邻的静音字母块
  if (result) {
    let originalIdx = 0;
    const finalBlocks = [];
    
    for (let i = 0; i < result.length; i++) {
       const block = result[i];
       const originalText = word.substring(originalIdx, originalIdx + block.letters.length);
       
       // 合并逻辑：如果当前块是静音，且前一个块也是静音，则合并到前一个
       if (block.is_silent && finalBlocks.length > 0 && finalBlocks[finalBlocks.length - 1].is_silent) {
         finalBlocks[finalBlocks.length - 1].letters += originalText;
       } else {
         finalBlocks.push({ ...block, letters: originalText });
       }
       originalIdx += block.letters.length;
    }
    return finalBlocks;
  }
  
  // 失败降级策略：至少让单词能显示出来
  return [
    { letters: word, phonetic: '', is_silent: true },
    { letters: '', phonetic: cleanIpa, is_silent: false }
  ];
}
