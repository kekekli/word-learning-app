import React, { useState, useEffect } from 'react';

/**
 * 自然拼读实验室 - 音形映射表 (简化版)
 * 将音标映射到单词中可能出现的字母组合
 */
const IPA_TO_SPELLING = {
  'iː': ['ee', 'ea', 'e', 'ie', 'ei'],
  'ɪ': ['i', 'y', 'ui'],
  'e': ['e', 'ea', 'a'],
  'æ': ['a'],
  'ɜː': ['ir', 'ur', 'er', 'or'],
  'ə': ['a', 'e', 'i', 'o', 'u', 'y'],
  'ʌ': ['u', 'o', 'ou'],
  'uː': ['oo', 'u', 'ew', 'ue'],
  'ʊ': ['oo', 'u', 'ou'],
  'ɔː': ['al', 'au', 'aw', 'or', 'oor'],
  'ɒ': ['o', 'a'],
  'ɑː': ['a', 'ar'],
  'aɪ': ['i', 'y', 'ie', 'uy'],
  'aʊ': ['ou', 'ow'],
  'eɪ': ['a', 'ai', 'ay', 'ea', 'ey'],
  'oʊ': ['o', 'oa', 'ow', 'oe'],
  'əʊ': ['o', 'oa', 'ow', 'oe'],
  'ɔɪ': ['oi', 'oy'],
  'ɪə': ['eer', 'ear', 'ere'],
  'eə': ['air', 'are', 'ear'],
  'ʊə': ['ure', 'oor', 'our'],
  'p': ['p'], 'b': ['b'], 't': ['t'], 'd': ['d'], 'k': ['k', 'ck', 'ch', 'c'], 'g': ['g', 'gg'], 'ɡ': ['g', 'gg'],
  'f': ['f', 'ff', 'ph'], 'v': ['v'], 's': ['s', 'ss', 'c'], 'z': ['z', 's', 'ss'], 'h': ['h'],
  'm': ['m', 'mm'], 'n': ['n', 'nn', 'kn'], 'ŋ': ['ng'], 'l': ['l', 'll'], 'r': ['r', 'rr', 'wr'],
  'j': ['y', 'i'], 'w': ['w', 'wh'], 'ʃ': ['sh', 'ch', 'ti', 'ci'], 'ʒ': ['s', 'si', 'ge'],
  'tʃ': ['ch', 'tch'], 'dʒ': ['j', 'g', 'dg', 'ge'], 'tr': ['tr'], 'dr': ['dr'], 'ts': ['ts'], 'dz': ['dz']
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

  const cleanIpa = ipa.replace(/[\/\\\[\]]/g, '');
  const segments = [];
  let match;
  let lastIndex = 0;

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
