import { useState, useEffect } from 'react';

interface LaunchpadProps {
  apps: { id: string; name: string; icon: string; iconUrl?: string; color: string }[];
  onAppClick: (appId: string) => void;
  onClose: () => void;
  onAddToDock?: (appId: string) => void;
}

export default function Launchpad({ apps, onAppClick, onClose, onAddToDock }: LaunchpadProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const appsPerPage = 35; // 7x5 grid

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredApps.length / appsPerPage);
  const currentApps = filteredApps.slice(
    currentPage * appsPerPage,
    (currentPage + 1) * appsPerPage
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const getIconName = (icon: string) => {
    if (icon.startsWith('material:')) {
      return icon.replace('material:', '');
    }
    return icon;
  };

  return (
    <div 
      className="fixed inset-0 z-[8500] flex flex-col items-center justify-center"
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)'
      }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>

      {/* Search Bar */}
      <div className="w-full max-w-md mb-8 px-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full px-4 py-2 pl-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none focus:border-white/40 transition-all"
            autoFocus
          />
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="flex-1 w-full max-w-6xl px-8 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-7 gap-6 justify-items-center">
          {currentApps.map(app => (
            <div
              key={app.id}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => {
                onAppClick(app.id);
                onClose();
              }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('appId', app.id);
                e.dataTransfer.effectAllowed = 'copy';
              }}
            >
              <div 
                className={`w-16 h-16 rounded-2xl overflow-hidden shadow-lg mb-2 transition-transform group-hover:scale-110`}
              >
                {app.iconUrl ? (
                  <img 
                    src={app.iconUrl} 
                    alt={app.name}
                    className="w-full h-full object-cover scale-112"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${app.color} flex items-center justify-center`}>
                    <span className="material-icons text-white text-3xl">
                      {getIconName(app.icon)}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-white text-xs text-center font-medium drop-shadow-lg">
                {app.name}
              </span>
            </div>
          ))}
        </div>

        {currentApps.length === 0 && (
          <div className="text-center text-white/50 mt-20">
            <span className="material-icons text-6xl mb-4 block">search_off</span>
            <p>Nothing found</p>
          </div>
        )}
      </div>

      {/* Dock in Launchpad */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[8600]">
        <div className="liquid-glass-heavy flex items-end gap-2 px-4 py-2 rounded-2xl">
          {/* Finder */}
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg cursor-pointer hover:scale-110 transition-transform">
            <img 
              src="https://cdn.jim-nielsen.com/.netlify/images?url=/icongallery/macos/finder-2026-09-23/1024.png&w=512" 
              alt="Finder"
              className="w-full h-full object-cover scale-112"
            />
          </div>
          
          {/* Apps */}
          {apps.slice(0, 6).map((app, idx) => (
            <div
              key={app.id}
              className="w-12 h-12 rounded-xl overflow-hidden shadow-lg cursor-pointer hover:scale-110 transition-transform"
              onClick={() => {
                onAppClick(app.id);
                onClose();
              }}
            >
              {app.iconUrl ? (
                <img 
                  src={app.iconUrl} 
                  alt={app.name}
                  className="w-full h-full object-cover scale-112"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${app.color} flex items-center justify-center`}>
                  <span className="material-icons text-white text-2xl">
                    {getIconName(app.icon)}
                  </span>
                </div>
              )}
            </div>
          ))}
          
          {/* Separator */}
          <div className="w-px h-10 bg-white/20 mx-1 self-center" />
          
          {/* Trash */}
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg">
            <img 
              src="https://www.nicepng.com/png/full/203-2036322_yosemite-trash-can-icon-os-x-mac-os.png" 
              alt="Trash"
              className="w-full h-full object-cover scale-112"
            />
          </div>
        </div>
      </div>

      {/* Page Indicators */}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-8 mb-4">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentPage ? 'bg-white' : 'bg-white/30'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(idx);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
