import React, { useState, useEffect } from 'react';

/**
 * 自然拼读实验室 - 音形映射表 (简化版)
 * 将音标映射到单词中可能出现的字母组合
 */
const IPA_TO_SPELLING = {
  // ══════════════════════════════════════════════════════════════════
  // 元音 Vowels
  // 规则：按「最长优先」排列，匹配时从数组最前面开始找最长的
  // ══════════════════════════════════════════════════════════════════

  // /iː/ 长 i 音 - see, feet, me, happy, chief, receive, key
  'iː': ['ee', 'ea', 'ie', 'ei', 'ey', 'igh', 'e', 'y'],

  // /ɪ/ 短 i 音 - sit, gym, build, myth
  'ɪ':  ['i', 'y', 'ui'],

  // /e/ 短 e 音 - bed, head, any, said, friend
  'e':  ['ea', 'ai', 'ie', 'e', 'a'],

  // /æ/ 短 a 音 - cat, hat, map
  'æ':  ['a'],

  // /ɑː/ 长 a 音 - car, father, palm, bath(英)
  'ɑː': ['ar', 'alm', 'a'],

  // /ɒ/ 短 o 音 - hot, dog, want, wash
  'ɒ':  ['o', 'a', 'ou'],

  // /ɔː/ 长 or 音 - fork, bore, floor, saw, caught, walk, bought, all
  'ɔː': ['oor', 'ore', 'ough', 'aught', 'ought', 'aw', 'or', 'au', 'al', 'a'],

  // /ʌ/ 短 u 音 - cup, son, blood, young, come
  'ʌ':  ['oo', 'ou', 'u', 'o'],

  // /ʊ/ 短 oo 音 - book, put, could, wolf
  'ʊ':  ['oo', 'ou', 'u', 'o'],

  // /uː/ 长 oo 音 - moon, blue, drew, soup, rule, rude
  'uː': ['oo', 'ew', 'ue', 'ui', 'ou', 'oe', 'u'],

  // /ɜː/ er 音（r-controlled）- bird, turn, her, learn, word, journal, myrtle
  'ɜː': ['ear', 'our', 'yr', 'ir', 'ur', 'er', 'or'],

  // /ə/ 弱化元音（schwa）- sofa, about, open, pencil, lemon
  'ə':  ['ture', 'our', 'ar', 'er', 'or', 'ure', 'a', 'e', 'i', 'o', 'u'],

  // ── 双元音 Diphthongs ──────────────────────────────────────────────

  // /eɪ/ 长 a 音 - day, rain, cake, they, eight, great, vein
  'eɪ': ['eigh', 'aigh', 'ay', 'ai', 'ey', 'ea', 'a'],

  // /aɪ/ 长 i 音 - night, tie, time, fly, buy, eye, pie
  'aɪ': ['igh', 'ie', 'uy', 'eye', 'i', 'y'],

  // /ɔɪ/ oi 音 - oil, boy, coin
  'ɔɪ': ['oi', 'oy'],

  // /aʊ/ ou 音 - out, cow, house, doubt
  'aʊ': ['ou', 'ow'],

  // /əʊ/ 长 o 音（英）- boat, snow, go, toe, home, sew
  'əʊ': ['oa', 'ow', 'oe', 'ew', 'ough', 'o'],

  // /oʊ/ 长 o 音（美）- 同上
  'oʊ': ['oa', 'ow', 'oe', 'ough', 'o'],

  // /ɪə/ ear 音 - ear, deer, here, pier, weird
  'ɪə': ['eer', 'ear', 'ere', 'ier', 'eir'],

  // /eə/ air 音 - hair, bare, bear, there, prayer
  'eə': ['air', 'are', 'ear', 'ere', 'ayer'],

  // /ʊə/ ure 音 - pure, poor, tour, moor
  'ʊə': ['ure', 'oor', 'our'],

  // ══════════════════════════════════════════════════════════════════
  // 辅音 Consonants
  // ══════════════════════════════════════════════════════════════════

  // /p/ - pen, apple
  'p':  ['p', 'pp'],

  // /b/ - bed, rabbit
  'b':  ['b', 'bb'],

  // /t/ - ten, butter, jumped, doubt(silent b)
  't':  ['tt', 't', 'ed'],

  // /d/ - dog, muddy, played
  'd':  ['dd', 'd', 'ed'],

  // /k/ - kit, duck, cat, school, account, quay, Christmas
  'k':  ['ck', 'ch', 'cc', 'qu', 'c', 'k', 'q'],

  // /g/ - get, egg, ghost, guest, catalogue
  'g':  ['gg', 'gh', 'gu', 'g'],
  'ɡ':  ['gg', 'gh', 'gu', 'g'],

  // /f/ - fun, off, photo, laugh, calf
  'f':  ['ph', 'ff', 'gh', 'f'],

  // /v/ - van, have, of
  'v':  ['ve', 'v'],

  // /s/ - sun, miss, city, scene, ice, house, psalm
  's':  ['ss', 'sc', 'ce', 'se', 'ps', 'c', 's'],

  // /z/ - zoo, jazz, is, nose, freeze, xylophone
  'z':  ['zz', 'se', 'ze', 'z', 's'],

  // /θ/ thin - th
  'θ':  ['th'],

  // /ð/ this - th (所有 th 开头的虚词)
  'ð':  ['th'],

  // /ʃ/ she - sh, machine, nation, special, mission, mansion, sure
  'ʃ':  ['ssi', 'tio', 'sch', 'shi', 'sh', 'ci', 'ti', 'si', 'ch', 's'],

  // /ʒ/ measure - s, si, ge, z, zh
  'ʒ':  ['si', 'ge', 'z', 's'],

  // /h/ hat - h, wh (who)
  'h':  ['wh', 'h'],

  // /tʃ/ chin - ch, -ture词尾, watch, question, future, nature, picture
  // 注意：优先匹配最长组合
  'tʃ': ['tch', 'ture', 'tio', 'tu', 'ti', 'ch'],

  // /dʒ/ jump - j, gym, badge, bridge, age, soldier
  'dʒ': ['dge', 'dg', 'gg', 'ge', 'di', 'j', 'g'],

  // /m/ man - m, mm, lamb, column
  'm':  ['mm', 'mb', 'mn', 'm'],

  // /n/ no - n, nn, knee, gnaw, pneumonia
  'n':  ['kn', 'gn', 'pn', 'nn', 'n'],

  // /ŋ/ sing - ng, nk (think), n (uncle)
  'ŋ':  ['ng', 'nk', 'n'],

  // /l/ leg - l, ll, -le结尾
  'l':  ['ll', 'le', 'l'],

  // /r/ red - r, rr, write, rhyme
  'r':  ['rr', 'wr', 'rh', 'r'],

  // /j/ yes - y, i (onion), u (union)
  'j':  ['y', 'i'],

  // /w/ wet - w, wh, u (quiet), o (one)
  'w':  ['wh', 'w', 'u'],
};

// ✅ 音源目录：使用 /audio/ipa/ 下已验证质量良好的 isolation 版本
const AUDIO_BASE = '/word-learning-app/audio/ipa/';

const IPA_FILENAME_MAP = {
  // ── 单元音 ──────────────────────────────────────────────
  'iː': 'iː_isolation.mp3',     // see, feet
  'ɪ':  'ɪ_isolation.mp3',      // sit, bit
  'e':  'e_isolation.mp3',      // bed, red
  'æ':  'æ_isolation.mp3',      // cat, hat
  'ɜː': 'ɜː_isolation.mp3',     // bird, girl
  'ə':  'ə_isolation.mp3',      // about, sofa
  'ʌ':  'ʌ_isolation.mp3',      // cup, but
  'uː': 'uː_isolation.mp3',     // food, moon
  'ʊ':  'ʊ_isolation.mp3',      // book, good
  'ɔː': 'ɔː_isolation.mp3',     // ball, call
  'ɒ':  'ɒ_isolation.mp3',      // hot, dog
  'ɑː': 'ɑː_isolation.mp3',     // car, farm

  // ── 双元音 ──────────────────────────────────────────────
  'aɪ': 'aɪ_isolation.mp3',     // my, time  ← 爱音，解决"ai读成a"问题
  'aʊ': 'aʊ_isolation.mp3',     // now, out
  'eɪ': 'eɪ_isolation.mp3',     // day, name
  'əʊ': 'əʊ_isolation.mp3',     // go, home
  'oʊ': 'əʊ_isolation.mp3',     // go, home (美式写法，共用同一文件)
  'ɔɪ': 'ɔɪ_isolation.mp3',     // boy, oil  ← good解决
  'ɪə': 'ɪə_isolation.mp3',     // ear, here
  'eə': 'eə_isolation.mp3',     // air, care
  'ʊə': 'ʊə_isolation.mp3',     // tour, pure

  // ── 辅音 ────────────────────────────────────────────────
  'p':  'p_isolation.mp3',
  'b':  'b_isolation.mp3',
  't':  't_isolation.mp3',
  'd':  'd_isolation.mp3',
  'k':  'k_isolation.mp3',
  'g':  'g_isolation.mp3',
  'ɡ':  'g_isolation.mp3',      // 兼容另一种 g 字形
  'f':  'f_isolation.mp3',
  'v':  'v_isolation.mp3',
  's':  's_isolation.mp3',
  'z':  'z_isolation.mp3',
  'θ':  'θ_isolation.mp3',      // think
  'ð':  'ð_isolation.mp3',      // this
  'ʃ':  'ʃ_isolation.mp3',      // she
  'ʒ':  'ʒ_isolation.mp3',      // measure
  'h':  'h_isolation.mp3',
  'm':  'm_isolation.mp3',
  'n':  'n_isolation.mp3',
  'ŋ':  'ŋ_isolation.mp3',      // sing
  'l':  'l_isolation.mp3',
  'r':  'r_isolation.mp3',
  'j':  'j_isolation.mp3',      // yes
  'w':  'w_isolation.mp3',
  'tʃ': 'tʃ_isolation.mp3',     // China, check
  'dʒ': 'dʒ_isolation.mp3',     // jump, age
  // 库中无独立 tr/dr/ts/dz 文件，降级到各自首音素
  'tr': 't_isolation.mp3',
  'dr': 'd_isolation.mp3',
  'ts': 't_isolation.mp3',
  'dz': 'd_isolation.mp3',
};

const PHONEME_REGEX = /(tr|dr|ts|dz|tʃ|dʒ|iː|ɜː|uː|ɔː|ɑː|aɪ|aʊ|eɪ|oʊ|əʊ|ɔɪ|ɪə|eə|ʊə|p|b|t|d|k|g|ɡ|f|v|s|z|θ|ð|ʃ|ʒ|h|m|n|ŋ|l|r|j|w|ɪ|e|æ|ə|ʌ|ʊ|ɒ)/g;

export default function PhoneticPlayer({ ipa, word, onActivePhonemeChange }) {
  const [localActive, setLocalActive] = useState(null);

  if (!ipa) return null;

  const cleanIpa = ipa.replace(/[\/\\\[\]ˈˌ()\s]/g, '');
  const segments = [];
  let match;
  let lastIndex = 0;

  PHONEME_REGEX.lastIndex = 0; // 防止 React re-render 时 lastIndex 残留污染
  while ((match = PHONEME_REGEX.exec(cleanIpa)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: cleanIpa.substring(lastIndex, match.index), isPhoneme: false });
    }
    segments.push({ text: match[0], isPhoneme: true });
    lastIndex = PHONEME_REGEX.lastIndex;
  }
  
  if (lastIndex < cleanIpa.length) {
    segments.push({ text: cleanIpa.substring(lastIndex), isPhoneme: false });
  }

  const playPhoneme = (phoneme) => {
    // 设置高亮
    setLocalActive(phoneme);
    onActivePhonemeChange?.(phoneme);

    const filename = IPA_FILENAME_MAP[phoneme];
    if (filename) {
      const url = `${AUDIO_BASE}${filename}`;
      const audio = new Audio(url);
      audio.crossOrigin = "anonymous";
      audio.play().catch(e => {
        console.warn(`Local audio fail for ${phoneme}:`, e);
        speakFallback(phoneme);
      });
    } else {
      speakFallback(phoneme);
    }

    // 2秒后清除高亮
    setTimeout(() => {
      setLocalActive(null);
      onActivePhonemeChange?.(null);
    }, 1500);
  };

  const speakFallback = (phoneme) => {
    const utterance = new SpeechSynthesisUtterance(phoneme);
    utterance.lang = 'en-US';
    utterance.rate = 0.5;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="phonetic-container flex items-center justify-center space-x-1 mt-6 mb-2 select-none group/player">

      <span className="text-slate-300 font-mono text-2xl leading-none self-center">/</span>
      <div className="flex items-center space-x-0.5 h-12">
        {segments.map((seg, idx) => (
          seg.isPhoneme ? (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                playPhoneme(seg.text);
              }}
              className={`phoneme-btn h-10 min-w-[2rem] px-2 flex items-center justify-center rounded-2xl transition-all relative font-mono text-2xl font-black ${
                localActive === seg.text 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 scale-125 z-20' 
                  : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600 active:scale-110'
              }`}
            >
              <span className="leading-none transform translate-y-[1px]">{seg.text}</span>
              <span className={`absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-400 rounded-full transition-opacity ${localActive === seg.text ? 'opacity-100' : 'opacity-0'}`}></span>
            </button>
          ) : (
            <span key={idx} className="text-slate-400 font-mono text-xl self-center px-1 leading-none">{seg.text}</span>
          )
        ))}
      </div>
      <span className="text-slate-300 font-mono text-2xl leading-none self-center">/</span>
    </div>
  );
}

// 导出映射逻辑供外部使用
export { IPA_TO_SPELLING };
