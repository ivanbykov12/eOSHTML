import { useState, useEffect, useRef } from 'react';
import ControlCenter from '../ControlCenter/ControlCenter';
import { isUIElementVisible } from '../../core/AppDependencies';

interface MenuBarProps {
  activeWindowTitle: string | null;
  isDark: boolean;
  onOpenApp: (appId: string) => void;
  installedApps?: { id: string }[];
}

// SVG Icons
const Icons = {
  apple: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.47-2.35 1.05-3.11z"/>
    </svg>
  ),
  wifi: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
    </svg>
  ),
  bluetooth: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/>
    </svg>
  ),
  battery: () => (
    <svg width="20" height="12" viewBox="0 0 25 12" fill="currentColor">
      <rect x="1" y="1" width="20" height="10" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="3" width="16" height="6" rx="1" ry="1" fill="currentColor"/>
      <rect x="22" y="4" width="2" height="4" rx="0.5" ry="0.5" fill="currentColor"/>
    </svg>
  ),
  search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  ),
  control: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
    </svg>
  ),
  fullscreen: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
    </svg>
  ),
  fullscreenExit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
    </svg>
  ),
  spotlight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  ),
  siri: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="4" fill="currentColor"/>
    </svg>
  ),
  notification: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
    </svg>
  )
};

export default function MenuBar({ activeWindowTitle, isDark, onOpenApp, installedApps = [] }: MenuBarProps) {
  const [time, setTime] = useState(new Date());
  const [showAppleMenu, setShowAppleMenu] = useState(false);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState('');
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const appleMenuRef = useRef<HTMLDivElement>(null);
  const controlCenterRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Sync Wi-Fi/Bluetooth state from localStorage
  useEffect(() => {
    const syncState = () => {
      const saved = localStorage.getItem('eos_cc_state');
      if (saved) {
        try {
          const state = JSON.parse(saved);
          setWifiEnabled(state.wifi !== false);
          setBluetoothEnabled(state.bluetooth !== false);
        } catch (e) {
          console.error('Failed to parse CC state:', e);
        }
      }
    };

    // Initial sync
    syncState();

    // Listen for storage changes
    window.addEventListener('storage', syncState);
    
    // Also check periodically (for same-tab changes)
    const interval = setInterval(syncState, 500);

    return () => {
      window.removeEventListener('storage', syncState);
      clearInterval(interval);
    };
  }, []);

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

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
      if (spotlightRef.current && !spotlightRef.current.contains(e.target as Node)) {
        setShowSpotlight(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
      
      // Close all dropdown menus
      const dropdowns = document.querySelectorAll('.liquid-glass-panel[style*="display: block"]');
      dropdowns.forEach(dropdown => {
        if (!dropdown.contains(e.target as Node)) {
          (dropdown as HTMLElement).style.display = 'none';
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for Spotlight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ' ') {
        e.preventDefault();
        setShowSpotlight(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeWithSeconds = (d: Date) => {
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const generateCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = date.getDate();
    
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    // Convert Sunday=0 to 6, Monday=1 to 0, etc. (week starts on Monday)
    const firstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    
    const days = [];
    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return {
      monthName: monthNames[month],
      year,
      days,
      today
    };
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
      case 'appstore':
        onOpenApp('appstore_desktop');
        break;
      case 'sleep':
        console.log('Sleep mode activated');
        break;
      case 'restart':
        if (confirm('Restart your computer?')) {
          window.location.reload();
        }
        break;
      case 'shutdown':
        if (confirm('Shut down your computer?')) {
          window.location.reload();
        }
        break;
      case 'lock':
        console.log('Lock screen activated');
        break;
      case 'logout':
        if (confirm('Log out of this user?')) {
          localStorage.removeItem('eos_setup_complete');
          window.location.reload();
        }
        break;
    }
  };

  const handleSpotlightSearch = (query: string) => {
    setSpotlightQuery(query);
    // Here you could implement actual search functionality
  };

  return (
    <>
      <div className="menu-bar liquid-glass-panel fixed top-0 left-0 right-0 h-7 flex items-center px-3 z-[9000] select-none"
        style={{ fontSize: '13px', borderRadius: 0 }}
      >
        {/* Left side */}
        <div className="flex items-center gap-3 flex-1">
          {/* Apple Logo */}
          <div className="relative" ref={appleMenuRef}>
            <button
              className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowAppleMenu(!showAppleMenu);
                setShowControlCenter(false);
                setShowSpotlight(false);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAppleMenu(!showAppleMenu);
                setShowControlCenter(false);
                setShowSpotlight(false);
              }}
              style={{ color: 'var(--text-primary)' }}
            >
              <Icons.apple />
            </button>

            {showAppleMenu && (
              <div
                className="absolute top-7 left-0 liquid-glass-panel rounded-xl py-2 min-w-[220px]"
                style={{ 
                  zIndex: 9999
                }}
                onClick={e => e.stopPropagation()}
              >
                {isUIElementVisible('menubar', 'about-menu-item', installedApps) && (
                  <div 
                    className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm transition-colors font-semibold" 
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => handleAppleMenuClick('about')}
                  >
                    Об этом Mac
                  </div>
                )}
                <div className="border-t border-white/10 my-1" />
                {isUIElementVisible('menubar', 'settings-menu-item', installedApps) && (
                  <div 
                    className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm transition-colors" 
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => handleAppleMenuClick('settings')}
                  >
                    Системные настройки...
                  </div>
                )}
                {isUIElementVisible('menubar', 'appstore-menu-item', installedApps) && (
                  <div 
                    className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm transition-colors" 
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => handleAppleMenuClick('appstore')}
                  >
                    App Store...
                  </div>
                )}
                <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm transition-colors opacity-60">
                  Недавние объекты ▸
                </div>
                <div className="border-t border-white/10 my-1" />
                <div 
                  className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm transition-colors" 
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => handleAppleMenuClick('sleep')}
                >
                  Сон
                </div>
                <div 
                  className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm transition-colors" 
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => handleAppleMenuClick('restart')}
                >
                  Перезагрузить...
                </div>
                <div 
                  className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm transition-colors" 
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => handleAppleMenuClick('shutdown')}
                >
                  Выключить...
                </div>
                <div className="border-t border-white/10 my-1" />
                <div 
                  className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm transition-colors" 
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => handleAppleMenuClick('lock')}
                >
                  Экран блокировки
                </div>
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
          <div className="relative">
            <button
              className="text-sm opacity-70 hover:opacity-100 px-2 py-0.5 rounded hover:bg-white/10 transition-all"
              style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                // Toggle file menu
                const menu = e.currentTarget.nextElementSibling as HTMLElement;
                if (menu) {
                  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                }
              }}
            >
              Файл
            </button>
            <div
              className="absolute top-7 left-0 liquid-glass-panel rounded-xl py-2 min-w-[180px]"
              style={{
                display: 'none',
                zIndex: 9999
              }}
            >
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Новое окно
              </div>
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Открыть...
              </div>
              <div className="border-t border-white/10 my-1" />
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Сохранить
              </div>
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Сохранить как...
              </div>
              <div className="border-t border-white/10 my-1" />
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Закрыть окно
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              className="text-sm opacity-70 hover:opacity-100 px-2 py-0.5 rounded hover:bg-white/10 transition-all"
              style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                const menu = e.currentTarget.nextElementSibling as HTMLElement;
                if (menu) {
                  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                }
              }}
            >
              Правка
            </button>
            <div
              className="absolute top-7 left-0 liquid-glass-panel rounded-xl py-2 min-w-[180px]"
              style={{
                display: 'none',
                zIndex: 9999
              }}
            >
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Отменить
              </div>
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Повторить
              </div>
              <div className="border-t border-white/10 my-1" />
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Вырезать
              </div>
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Копировать
              </div>
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Вставить
              </div>
              <div className="border-t border-white/10 my-1" />
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Выделить всё
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              className="text-sm opacity-70 hover:opacity-100 px-2 py-0.5 rounded hover:bg-white/10 transition-all"
              style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                const menu = e.currentTarget.nextElementSibling as HTMLElement;
                if (menu) {
                  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                }
              }}
            >
              Вид
            </button>
            <div
              className="absolute top-7 left-0 liquid-glass-panel rounded-xl py-2 min-w-[180px]"
              style={{
                display: 'none',
                zIndex: 9999
              }}
            >
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Как значки
              </div>
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Как список
              </div>
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Как колонки
              </div>
              <div className="border-t border-white/10 my-1" />
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Сортировка по имени
              </div>
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Сортировка по дате
              </div>
              <div className="border-t border-white/10 my-1" />
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Показать панель инструментов
              </div>
              <div className="px-4 py-1.5 hover:bg-blue-500/20 cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                Показать строку состояния
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Status Icons */}
          <button
            className={`flex items-center transition-opacity hover:opacity-100 cursor-pointer`}
            style={{ color: 'var(--text-primary)', opacity: wifiEnabled ? 0.8 : 0.3 }}
            title={wifiEnabled ? 'Wi-Fi подключено' : 'Wi-Fi отключено'}
            onClick={(e) => {
              e.stopPropagation();
              onOpenApp('settings_desktop');
              // Открываем вкладку Wi-Fi в настройках
              setTimeout(() => {
                window.postMessage({ type: 'eos-open-settings-tab', tab: 'wifi' }, '*');
              }, 100);
            }}
          >
            <Icons.wifi />
          </button>
          <button
            className={`flex items-center transition-opacity hover:opacity-100 cursor-pointer`}
            style={{ color: 'var(--text-primary)', opacity: bluetoothEnabled ? 0.8 : 0.3 }}
            title={bluetoothEnabled ? 'Bluetooth включен' : 'Bluetooth отключен'}
            onClick={(e) => {
              e.stopPropagation();
              onOpenApp('settings_desktop');
              // Открываем вкладку Bluetooth в настройках
              setTimeout(() => {
                window.postMessage({ type: 'eos-open-settings-tab', tab: 'bluetooth' }, '*');
              }, 100);
            }}
          >
            <Icons.bluetooth />
          </button>

          {/* Spotlight Button */}
          <div className="relative" ref={spotlightRef}>
            <button
              className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowSpotlight(!showSpotlight);
                setShowAppleMenu(false);
                setShowControlCenter(false);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowSpotlight(!showSpotlight);
                setShowAppleMenu(false);
                setShowControlCenter(false);
              }}
              title="Spotlight (Cmd+Space)"
            >
              <Icons.spotlight />
            </button>

            {showSpotlight && (
              <div
                className="absolute top-8 right-0 liquid-glass-panel rounded-xl p-4 w-96"
                style={{ 
                  zIndex: 9999
                }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icons.search />
                  <input
                    type="text"
                    placeholder="Поиск Spotlight"
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    style={{ color: 'var(--text-primary)' }}
                    value={spotlightQuery}
                    onChange={(e) => handleSpotlightSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                {spotlightQuery && (
                  <div className="text-xs opacity-60" style={{ color: 'var(--text-primary)' }}>
                    Поиск: "{spotlightQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Control Center Button */}
          <div className="relative" ref={controlCenterRef}>
            <button
              className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowControlCenter(!showControlCenter);
                setShowAppleMenu(false);
                setShowSpotlight(false);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowControlCenter(!showControlCenter);
                setShowAppleMenu(false);
                setShowSpotlight(false);
              }}
              title="Control Center"
            >
              <Icons.control />
            </button>

            {/* Control Center - macOS Tahoe Liquid Glass Style */}
            {showControlCenter && (
              <ControlCenter
                isOpen={showControlCenter}
                onClose={() => setShowControlCenter(false)}
                installedApps={installedApps}
              />
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
            onClick={toggleFullscreen}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFullscreen();
            }}
            title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
          >
            {isFullscreen ? <Icons.fullscreenExit /> : <Icons.fullscreen />}
          </button>

          {/* Date & Time with Calendar */}
          <div className="relative" ref={calendarRef}>
            <button
              className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 transition-colors text-sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowCalendar(!showCalendar);
                setShowAppleMenu(false);
                setShowControlCenter(false);
                setShowSpotlight(false);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowCalendar(!showCalendar);
                setShowAppleMenu(false);
                setShowControlCenter(false);
                setShowSpotlight(false);
              }}
              style={{ color: 'var(--text-primary)' }}
            >
              {formatDate(time)} {formatTime(time)}
            </button>

            {showCalendar && (
              <div
                className="absolute top-8 right-0 liquid-glass-panel rounded-xl p-4 w-80"
                style={{ 
                  zIndex: 9999
                }}
                onClick={e => e.stopPropagation()}
              >
                {/* Current Time with Seconds */}
                <div className="text-center mb-4">
                  <div className="text-3xl font-light mb-1" style={{ color: 'var(--text-primary)' }}>
                    {formatTimeWithSeconds(time)}
                  </div>
                  <div className="text-sm opacity-60" style={{ color: 'var(--text-primary)' }}>
                    {time.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>

                {/* Calendar */}
                {(() => {
                  const cal = generateCalendar(time);
                  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
                  
                  return (
                    <div>
                      <div className="text-center font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                        {cal.monthName} {cal.year}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {weekDays.map(day => (
                          <div key={day} className="py-1 opacity-60 font-medium" style={{ color: 'var(--text-primary)' }}>
                            {day}
                          </div>
                        ))}
                        {cal.days.map((day, idx) => (
                          <div 
                            key={idx} 
                            className={`py-1 rounded ${day === cal.today ? 'bg-blue-500 text-white font-semibold' : ''}`}
                            style={{ 
                              color: day === cal.today ? 'white' : 'var(--text-primary)',
                              opacity: day ? 1 : 0
                            }}
                          >
                            {day || ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
