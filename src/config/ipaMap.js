// 统一的纯净美音音频映射字典 (US Phonics Mapping)
// 必须确保云存储的 /word-learning-app/audio/ipa/ 目录下真实存在以下文件。

export const IPA_FILENAME_MAP = {
  // 单辅音
  'p': 'p_isolation.mp3', 
  'b': 'b_isolation.mp3',
  't': 't_isolation.mp3', 
  'd': 'd_isolation.mp3',
  'k': 'k_isolation.mp3', 
  'g': 'g_isolation.mp3', 
  'ɡ': 'g_isolation.mp3', // 兼容不同的 Unicode g
  'f': 'f_isolation.mp3', 
  'v': 'v_isolation.mp3',
  's': 's_isolation.mp3', 
  'z': 'z_isolation.mp3',
  'θ': 'θ_isolation.mp3', 
  'ð': 'ð_isolation.mp3',
  'ʃ': 'ʃ_isolation.mp3', 
  'ʒ': 'ʒ_isolation.mp3',
  'h': 'h_isolation.mp3', 
  'm': 'm_isolation.mp3',
  'n': 'n_isolation.mp3', 
  'ŋ': 'ŋ_isolation.mp3',
  'l': 'l_isolation.mp3', 
  'r': 'r_isolation.mp3',
  'j': 'j_isolation.mp3', 
  'w': 'w_isolation.mp3',
  'tʃ': 'tʃ_isolation.mp3', 
  'dʒ': 'dʒ_isolation.mp3',
  
  // 复合辅音 (如 box 的 x)
  'ks': 'ks_isolation.mp3',

  // 美式短元音
  'æ': 'æ_isolation.mp3', 
  'e': 'e_isolation.mp3',
  'ɪ': 'ɪ_isolation.mp3', 
  'ɑː': 'ɑː_isolation.mp3', // 美音 hot, box 发此音
  'ʌ': 'ʌ_isolation.mp3', 
  'ʊ': 'ʊ_isolation.mp3',
  'ə': 'ə_isolation.mp3', // Schwa 弱读音
  
  // 美式长元音/双元音
  'iː': 'iː_isolation.mp3', 
  'uː': 'uː_isolation.mp3',
  'aɪ': 'aɪ_isolation.mp3', 
  'eɪ': 'eɪ_isolation.mp3',
  'oʊ': 'oʊ_isolation.mp3', // 规范的美音 oa 发音
  'aʊ': 'aʊ_isolation.mp3', 
  'ɔɪ': 'ɔɪ_isolation.mp3',
  
  // 美式 r-controlled 元音 (Bossy R)
  'ɜː': 'ɜː_isolation.mp3', // her, bird, turn (美音带卷舌)
  'ɑr': 'ɑr_isolation.mp3', // car
  'ɔr': 'ɔr_isolation.mp3'  // for
};
