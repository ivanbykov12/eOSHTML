import { useState, useEffect, useRef } from 'react';

interface MenuBarProps {
  activeWindowTitle: string | null;
  isDark: boolean;
  onOpenApp: (appId: string) => void;
}

export default function MenuBar({ activeWindowTitle, isDark, onOpenApp }: MenuBarProps) {
  const [time, setTime] = useState(new Date());
  const [showAppleMenu, setShowAppleMenu] = useState(false);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const appleMenuRef = useRef<HTMLDivElement>(null);
  const controlCenterRef = useRef<HTMLDivElement>(null);

  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [volume, setVolume] = useState(75);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Global click handler to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (appleMenuRef.current && !appleMenuRef.current.contains(e.target as Node)) {
        setShowAppleMenu(false);
      }
      if (controlCenterRef.current && !controlCenterRef.current.contains(e.target as Node)) {
        setShowControlCenter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const handleAppleMenuClick = (action: string) => {
    setShowAppleMenu(false);
    
    switch (action) {
      case 'about':
        onOpenApp('about_eos');
        break;
      case 'settings':
        onOpenApp('settings_desktop');
        break;
      case 'sleep':
        // Implement sleep mode
        console.log('Sleep mode activated');
        break;
      case 'restart':
        if (confirm('Перезагрузить систему?')) {
          window.location.reload();
        }
        break;
      case 'logout':
        if (confirm('Завершить сеанс?')) {
          localStorage.removeItem('eos_setup_complete');
          window.location.reload();
        }
        break;
    }
  };

  return (
    <>
      <div className="menu-bar fixed top-0 left-0 right-0 h-7 flex items-center px-3 z-[9000] select-none"
        style={{ fontSize: '13px' }}
      >
        {/* Left side */}
        <div className="flex items-center gap-4 flex-1">
          {/* Apple/eOS Logo */}
          <div className="relative" ref={appleMenuRef}>
            <button
              className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowAppleMenu(!showAppleMenu);
                setShowControlCenter(false);
              }}
            >
              <span className="material-icons text-sm" style={{ color: 'var(--text-primary)' }}>
                desktop_windows
              </span>
            </button>

            {showAppleMenu && (
              <div
                className="absolute top-7 left-0 liquid-glass-heavy rounded-xl py-2 min-w-[220px] shadow-2xl"
                style={{ 
                  zIndex: 9999,
                  background: isDark ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(30px) saturate(180%)'
                }}
                onClick={e => e.stopPropagation()}
              >
                <div 
                  className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm transition-colors" 
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => handleAppleMenuClick('about')}
                >
                  Об этом eOS
                </div>
                <div className="border-t border-white/10 my-1" />
                <div 
                  className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm transition-colors" 
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => handleAppleMenuClick('settings')}
                >
                  Системные настройки...
                </div>
                <div className="border-t border-white/10 my-1" />
                <div 
                  className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm transition-colors" 
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => handleAppleMenuClick('sleep')}
                >
                  Режим сна
                </div>
                <div 
                  className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm transition-colors" 
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => handleAppleMenuClick('restart')}
                >
                  Перезагрузить...
                </div>
                <div className="border-t border-white/10 my-1" />
                <div 
                  className="px-4 py-1.5 hover:bg-red-500/20 cursor-pointer text-sm transition-colors text-red-400" 
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => handleAppleMenuClick('logout')}
                >
                  Завершить сеанс...
                </div>
              </div>
            )}
          </div>

          {/* Active App Name */}
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {activeWindowTitle || 'eOS Desktop'}
          </span>

          {/* Menu Items */}
          <span className="text-sm opacity-70" style={{ color: 'var(--text-primary)' }}>Файл</span>
          <span className="text-sm opacity-70" style={{ color: 'var(--text-primary)' }}>Правка</span>
          <span className="text-sm opacity-70" style={{ color: 'var(--text-primary)' }}>Вид</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Status Icons */}
          <span className={`material-icons text-sm ${wifi ? 'opacity-80' : 'opacity-30'}`} style={{ color: 'var(--text-primary)' }}>
            wifi
          </span>
          <span className={`material-icons text-sm ${bluetooth ? 'opacity-80' : 'opacity-30'}`} style={{ color: 'var(--text-primary)' }}>
            bluetooth
          </span>
          <span className="material-icons text-sm opacity-80" style={{ color: 'var(--text-primary)' }}>
            battery_full
          </span>

          {/* Control Center Button */}
          <div className="relative" ref={controlCenterRef}>
            <button
              className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowControlCenter(!showControlCenter);
                setShowAppleMenu(false);
              }}
            >
              <span className="material-icons text-sm" style={{ color: 'var(--text-primary)' }}>
                tune
              </span>
            </button>

            {/* Control Center */}
            {showControlCenter && (
              <div
                className="control-center absolute top-8 right-0 z-[9999] w-80 p-4 liquid-glass-heavy rounded-2xl shadow-2xl"
                style={{ 
                  background: isDark ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(40px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(200%)'
                }}
                onClick={e => e.stopPropagation()}
              >
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {/* Network */}
                  <div className="liquid-glass rounded-xl p-3">
                    <button
                      className={`flex items-center gap-2 w-full ${wifi ? '' : 'opacity-50'}`}
                      onClick={() => setWifi(!wifi)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${wifi ? 'bg-blue-500' : 'bg-gray-500'}`}>
                        <span className="material-icons text-white text-sm">wifi</span>
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Wi-Fi</div>
                        <div className="text-[10px] opacity-60" style={{ color: 'var(--text-primary)' }}>{wifi ? 'Домашняя' : 'Выкл.'}</div>
                      </div>
                    </button>
                  </div>

                  {/* Bluetooth */}
                  <div className="liquid-glass rounded-xl p-3">
                    <button
                      className={`flex items-center gap-2 w-full ${bluetooth ? '' : 'opacity-50'}`}
                      onClick={() => setBluetooth(!bluetooth)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bluetooth ? 'bg-blue-500' : 'bg-gray-500'}`}>
                        <span className="material-icons text-white text-sm">bluetooth</span>
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Bluetooth</div>
                        <div className="text-[10px] opacity-60" style={{ color: 'var(--text-primary)' }}>{bluetooth ? 'Вкл.' : 'Выкл.'}</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Focus */}
                <div className="liquid-glass rounded-xl p-3 mb-3">
                  <button
                    className="flex items-center gap-3 w-full"
                    onClick={() => setFocusMode(!focusMode)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${focusMode ? 'bg-purple-500' : 'bg-gray-500'}`}>
                      <span className="material-icons text-white text-sm">focus_mode</span>
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Фокусирование</div>
                      <div className="text-[10px] opacity-60" style={{ color: 'var(--text-primary)' }}>{focusMode ? 'Вкл.' : 'Выкл.'}</div>
                    </div>
                  </button>
                </div>

                {/* Display Brightness */}
                <div className="liquid-glass rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="material-icons text-sm" style={{ color: 'var(--text-primary)' }}>brightness_high</span>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={brightness}
                      onChange={e => setBrightness(Number(e.target.value))}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="text-xs w-8 text-right" style={{ color: 'var(--text-primary)' }}>{brightness}%</span>
                  </div>
                </div>

                {/* Sound */}
                <div className="liquid-glass rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <span className="material-icons text-sm" style={{ color: 'var(--text-primary)' }}>volume_up</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={e => setVolume(Number(e.target.value))}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="text-xs w-8 text-right" style={{ color: 'var(--text-primary)' }}>{volume}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <span className="text-sm ml-2" style={{ color: 'var(--text-primary)' }}>
            {formatDate(time)} {formatTime(time)}
          </span>
        </div>
      </div>
    </>
  );
}
