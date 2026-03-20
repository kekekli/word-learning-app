import React, { useState } from 'react';

// ✅ 纯净美式发音映射表 (US Phonemes)
// 移除了所有不规范的降级映射 (如 tr->t)，缺少的复合音应在云端补充真实 mp3
const AUDIO_BASE = '/word-learning-app/audio/ipa/';

const IPA_FILENAME_MAP = {
  // ── 美式单元音 Vowels ───────────────────────────────────────────
  'iː': 'iː_isolation.mp3',     // see, feet
  'ɪ':  'ɪ_isolation.mp3',      // sit, bit
  'e':  'e_isolation.mp3',      // bed, red (有时也写作 /ɛ/)
  'æ':  'æ_isolation.mp3',      // cat, hat
  'ɜː': 'ɜː_isolation.mp3',     // bird, girl (美音带 r 色彩，通常写作 /ɝ/)
  'ə':  'ə_isolation.mp3',      // about, sofa
  'ʌ':  'ʌ_isolation.mp3',      // cup, but
  'uː': 'uː_isolation.mp3',     // food, moon
  'ʊ':  'ʊ_isolation.mp3',      // book, good
  'ɔː': 'ɔː_isolation.mp3',     // ball, call (美音中常与 /ɑː/ 合并)
  'ɑː': 'ɑː_isolation.mp3',     // car, farm, hot (美音 hot 发 /ɑː/)

  // ── 美式双元音 Diphthongs ───────────────────────────────────────
  'aɪ': 'aɪ_isolation.mp3',     // my, time
  'aʊ': 'aʊ_isolation.mp3',     // now, out
  'eɪ': 'eɪ_isolation.mp3',     // day, name
  'oʊ': 'oʊ_isolation.mp3',     // go, home (美式规范写法，替代英式的 əʊ)
  'ɔɪ': 'ɔɪ_isolation.mp3',     // boy, oil

  // 美音中带 r 的元音通常不再视作独立双元音，而是 元音+r，但为兼容拆解保留：
  'ɪr': 'ɪr_isolation.mp3',     // ear, here (美音发音)
  'er': 'er_isolation.mp3',     // air, care (美音发音)
  'ʊr': 'ʊr_isolation.mp3',     // tour, pure (美音发音)

  // ── 辅音 Consonants ─────────────────────────────────────────────
  'p':  'p_isolation.mp3',
  'b':  'b_isolation.mp3',
  't':  't_isolation.mp3',
  'd':  'd_isolation.mp3',
  'k':  'k_isolation.mp3',
  'g':  'g_isolation.mp3',
  'ɡ':  'g_isolation.mp3',      // 兼容 Unicode U+0261
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
  'ks': 'ks_isolation.mp3'      // x as in box
};

/**
 * PhoneticPlayer 组件
 * @param {Array} blocks - 结构化数组。示例: [{ letters: "g", phonetic: "g" }, { letters: "e", phonetic: "", is_silent: true }]
 */
export default function PhoneticPlayer({ blocks, onActiveBlockChange }) {
  // 使用 index 而不是 phonetic 文本来记录 active 状态，防止单词中有两个相同的音标导致同时高亮
  const [activeIndex, setActiveIndex] = useState(null);

  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return null;

  const playBlock = (block, index) => {
    // 拦截静音字母（如 Magic E）
    if (block.is_silent || !block.phonetic) {
      console.log(`[点击拦截] 字母 ${block.letters} 为静音字母，不播放发音。`);
      return;
    }

    const phoneme = block.phonetic.replace(/[\/\\\[\]]/g, ''); // 清理可能带入的斜杠
    
    // 设置高亮
    setActiveIndex(index);
    onActiveBlockChange?.(block);

    const filename = IPA_FILENAME_MAP[phoneme];
    if (filename) {
      const url = `${AUDIO_BASE}${filename}`;
      const audio = new Audio(url);
      audio.crossOrigin = "anonymous";
      audio.play().catch(e => {
        // 网络或浏览器策略拦截时报错，绝不使用机器配音兜底
        console.error(`[播放失败] 音频文件加载失败: ${url}`, e);
      });
    } else {
      // 字典表未匹配到时，直接阻断并抛出清晰错误
      console.error(`[严重数据缺失] 音标 /${phoneme}/ 未在 IPA_FILENAME_MAP 中找到对应音频！请核对 JSON 数据或补充音频。`);
    }

    // 1.5秒后清除高亮状态
    setTimeout(() => {
      setActiveIndex(null);
      onActiveBlockChange?.(null);
    }, 1500);
  };

  return (
    <div className="phonetic-container flex flex-wrap items-center justify-center gap-2 mt-8 mb-4 select-none">
      {blocks.map((block, idx) => {
        const isSilent = block.is_silent || !block.phonetic;
        const isActive = activeIndex === idx;

        return (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              playBlock(block, idx);
            }}
            disabled={isSilent}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all relative outline-none
              ${isSilent 
                ? 'opacity-40 cursor-not-allowed grayscale' 
                : 'cursor-pointer hover:bg-rose-50 active:scale-95'
              }
              ${isActive 
                ? 'bg-rose-100 shadow-sm scale-110 z-10' 
                : 'bg-transparent'
              }
            `}
          >
            {/* 字母层 (UI 上方) */}
            <span className={`font-sans text-4xl font-bold leading-none mb-1 
              ${isActive ? 'text-rose-600' : (isSilent ? 'text-slate-400' : 'text-slate-700')}
            `}>
              {block.letters}
            </span>

            {/* 音标层 (UI 下方) */}
            {!isSilent && (
              <span className={`font-mono text-xl leading-none 
                ${isActive ? 'text-rose-500 font-bold' : 'text-slate-500'}
              `}>
                /{block.phonetic}/
              </span>
            )}

            {/* 高亮指示圆点 */}
            <span className={`absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-rose-500 rounded-full transition-opacity duration-200 
              ${isActive ? 'opacity-100' : 'opacity-0'}
            `}></span>
          </button>
        );
      })}
    </div>
  );
}
