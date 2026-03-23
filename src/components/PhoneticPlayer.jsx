import React, { useState } from 'react';
import { IPA_FILENAME_MAP } from '../config/ipaMap'; // 引入外部定义的并规范好的映射表

const AUDIO_BASE = '/word-learning-app/audio/ipa/';

export default function PhoneticPlayer({ wordData, onActiveBlockChange, onPlayWord }) {
  // 通过索引绑定上下区域，彻底解决重复字母高亮错位问题
  const [activeIndex, setActiveIndex] = useState(null);

  if (!wordData || !wordData.blocks || wordData.blocks.length === 0) return null;
  const { blocks } = wordData;

  const playBlock = (block, index) => {
    // 拦截静音字母 (Magic E)
    if (block.is_silent || !block.phonetic) {
      console.log(`[静音拦截] ${block.letters} 是静音字母，不播放。`);
      return;
    }

    const phoneme = block.phonetic.replace(/[\/\\\[\]]/g, '');
    
    // 设置高亮状态（上下 UI 联动）
    setActiveIndex(index);
    onActiveBlockChange?.(block);

    const filename = IPA_FILENAME_MAP[phoneme];
    if (filename) {
      const url = `${AUDIO_BASE}${filename}`;
      const audio = new Audio(url);
      audio.crossOrigin = "anonymous";
      audio.play().catch(e => {
        console.error(`[播放失败] 文件找不到或被拦截: ${url}`, e);
      });
    } else {
      console.error(`[致命错误] 字典表中缺少音标映射: /${phoneme}/。请勿使用机器配音，必须补充音频文件！`);
    }

    // 1.2秒后恢复默认状态
    setTimeout(() => {
      setActiveIndex(null);
      onActiveBlockChange?.(null);
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full mt-6">
      
      {/* 顶部：完整单词展示区 (由 blocks 拼装，取代死板的字符串) */}
      <div 
        className="flex items-center justify-center mb-12 group cursor-pointer active:scale-95 transition-transform"
        onClick={() => onPlayWord && onPlayWord()}
        title="点击重新听发音"
      >
        <div className="flex justify-center text-5xl md:text-6xl font-black tracking-wide select-none">
          {blocks.map((block, idx) => {
            const isActive = activeIndex === idx;
            const isSilent = block.is_silent;
            return (
              <span 
                key={`top-${idx}`} 
                className={`transition-colors duration-200 
                  ${isActive ? 'text-rose-500' : (isSilent ? 'text-slate-300' : 'text-slate-800')}
                `}
              >
                {block.letters}
              </span>
            );
          })}
        </div>
        
        {/* 喇叭图标，整词发音提示 */}
        <div className="ml-4 w-12 h-12 rounded-[1.2rem] bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all opacity-80 group-hover:opacity-100 shadow-sm border border-indigo-100/50">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
        </div>
      </div>

      {/* 底部：音素切片交互区 */}
      <div className="phonetic-container flex flex-wrap items-center justify-center gap-2 select-none">
        {blocks.map((block, idx) => {
          const isSilent = block.is_silent || !block.phonetic;
          const isActive = activeIndex === idx;

          return (
            <button
              key={`bot-${idx}`}
              onClick={(e) => {
                e.stopPropagation();
                playBlock(block, idx);
              }}
              disabled={isSilent}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all relative outline-none min-w-[3.5rem]
                ${isSilent 
                  ? 'opacity-40 cursor-not-allowed grayscale' 
                  : 'cursor-pointer hover:bg-slate-50 active:scale-95'
                }
                ${isActive 
                  ? 'bg-rose-50 shadow-md scale-110 z-10 border border-rose-100' 
                  : 'bg-transparent border border-transparent'
                }
              `}
            >
              {/* 交互区块：字母 */}
              <span className={`font-sans text-3xl font-bold leading-none mb-2 
                ${isActive ? 'text-rose-600' : (isSilent ? 'text-slate-400' : 'text-slate-700')}
              `}>
                {block.letters}
              </span>

              {/* 交互区块：音标 */}
              {!isSilent && (
                <span className={`font-mono text-xl leading-none 
                  ${isActive ? 'text-rose-500 font-bold' : 'text-slate-400'}
                `}>
                  /{block.phonetic}/
                </span>
              )}

              {/* 顶部的小红点指示器 */}
              <span className={`absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-rose-500 rounded-full transition-opacity duration-200 
                ${isActive ? 'opacity-100' : 'opacity-0'}
              `}></span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
