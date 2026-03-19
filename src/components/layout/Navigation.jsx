import React from 'react';
import { useApp } from '../../context/AppContext';

// SVG图标
export const HomeIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

export const WrongBookIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

export const HistoryIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"></line>
    <line x1="18" y1="20" x2="18" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="16"></line>
  </svg>
);

export const LibraryIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

export const Sidebar = () => {
  const { currentPage, navigateTo } = useApp();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 p-6 hidden md:flex flex-col sidebar shadow-xl border-r border-indigo-100/50">
      <div className="mb-10 group cursor-pointer" onClick={() => navigateTo('home')}>
        <div className="flex items-center mb-2">
          <div className="p-2 bg-white/20 rounded-xl mr-2 shadow-inner group-hover:scale-110 transition-transform">
            <LibraryIcon />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wider">七七英语</h1>
        </div>
        <p className="text-white/60 text-xs ml-11 uppercase tracking-widest font-medium">Learning & Success</p>
      </div>

      <nav className="flex-1 space-y-2">
        <NavButton active={currentPage === 'home'} icon={<HomeIcon />} label="开始学习" onClick={() => navigateTo('home')} />
        <NavButton active={currentPage === 'wrongbook'} icon={<WrongBookIcon />} label="我的错词" onClick={() => navigateTo('wrongbook')} />
        <NavButton active={currentPage === 'history'} icon={<HistoryIcon />} label="学习足迹" onClick={() => navigateTo('history')} />
        <NavButton active={currentPage === 'library'} icon={<LibraryIcon />} label="系统设置" onClick={() => navigateTo('library')} />
      </nav>
      
      <div className="mt-auto p-4 bg-indigo-900/40 rounded-2xl border border-indigo-700/30">
        <p className="text-xs text-indigo-200/70 leading-relaxed text-center">
          "The limit of your language is the limit of your world."
        </p>
      </div>
    </aside>
  );
};

export const MobileNav = () => {
  const { currentPage, navigateTo } = useApp();

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-4 py-2 z-50 md:hidden flex justify-around items-center">
      <MobileNavItem active={currentPage === 'home'} icon={<HomeIcon />} label="学习" onClick={() => navigateTo('home')} />
      <MobileNavItem active={currentPage === 'wrongbook'} icon={<WrongBookIcon />} label="错词" onClick={() => navigateTo('wrongbook')} />
      <MobileNavItem active={currentPage === 'history'} icon={<HistoryIcon />} label="足迹" onClick={() => navigateTo('history')} />
      <MobileNavItem active={currentPage === 'library'} icon={<LibraryIcon />} label="库" onClick={() => navigateTo('library')} />
    </nav>
  );
};

const NavButton = ({ active, icon, label, onClick }) => (
  <div
    className={`nav-item group flex items-center p-3 rounded-2xl transition-all cursor-pointer ${
      active ? 'active shadow-lg shadow-indigo-900/20 translate-x-1' : 'hover:bg-white/10 text-indigo-100/70 hover:text-white'
    }`}
    onClick={onClick}
  >
    <div className={`mr-3 transition-colors ${active ? 'text-white' : 'group-hover:text-white'}`}>
      {icon}
    </div>
    <span className="font-semibold">{label}</span>
  </div>
);

const MobileNavItem = ({ active, icon, label, onClick }) => (
  <div 
    className={`flex flex-col items-center py-2 px-4 transition-all ${active ? 'scale-110' : 'opacity-60'}`} 
    onClick={onClick}
  >
    <div className={`${active ? 'text-indigo-600' : 'text-gray-500'}`}>
      {icon}
    </div>
    <span className={`text-[10px] mt-1 font-bold ${active ? 'text-indigo-600' : 'text-gray-500'}`}>{label}</span>
  </div>
);
