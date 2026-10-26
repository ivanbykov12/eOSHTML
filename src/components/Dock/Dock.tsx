import { useState, useRef } from 'react';
import { getIconName } from '../../core/EAppParser';

interface DockProps {
  apps: { id: string; name: string; icon: string; iconUrl?: string; color: string }[];
  openAppIds: string[];
  onAppClick: (appId: string) => void;
  onLaunchpadClick?: () => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  dockSize?: number;
}

export default function Dock({ apps, openAppIds, onAppClick, onLaunchpadClick, onReorder, dockSize = 48 }: DockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [touchActive, setTouchActive] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const getScale = (index: number): number => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(index - hoveredIndex);
    if (distance === 0) return 1.45;
    if (distance === 1) return 1.25;
    if (distance === 2) return 1.08;
    return 1;
  };

  const getTranslateY = (index: number): number => {
    if (hoveredIndex === null) return 0;
    const distance = Math.abs(index - hoveredIndex);
    if (distance === 0) return -16;
    if (distance === 1) return -8;
    if (distance === 2) return -3;
    return 0;
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      if (onReorder) {
        onReorder(draggedIndex, index);
        setDraggedIndex(index);
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('appId');
    if (appId) {
      // App is already in dock from launchpad, just visual feedback
      console.log('Dropped app in dock:', appId);
    }
  };

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[8000]">
      <div
        ref={dockRef}
        className="liquid-glass-heavy flex items-end gap-1 px-3 py-1.5 rounded-2xl"
        onMouseLeave={() => setHoveredIndex(null)}
        onTouchEnd={() => {
          setTouchActive(false);
          setHoveredIndex(null);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Finder - always first, cannot be moved */}
        <div
          className="dock-item relative flex flex-col items-center cursor-pointer"
          style={{
            transform: hoveredIndex === 0 ? 'translateY(-16px) scale(1.45)' : 'scale(1)',
            transformOrigin: 'bottom center',
            transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={() => setHoveredIndex(0)}
          onClick={() => onAppClick('finder_desktop')}
        >
          <div className="rounded-xl overflow-hidden shadow-lg" style={{ width: dockSize, height: dockSize }}>
            <img 
              src="https://cdn.jim-nielsen.com/.netlify/images?url=/icongallery/macos/finder-2026-09-23/1024.png&w=512" 
              alt="Finder"
              className="w-full h-full object-cover scale-117"
            />
          </div>
          {openAppIds.includes('finder_desktop') && (
            <div className="w-1 h-1 rounded-full bg-white/80 mt-0.5 absolute -bottom-1" />
          )}
        </div>

        {/* Launchpad */}
        <div
          className="dock-item relative flex flex-col items-center cursor-pointer"
          style={{
            transform: hoveredIndex === 1 ? 'translateY(-16px) scale(1.45)' : 'scale(1)',
            transformOrigin: 'bottom center',
            transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={() => setHoveredIndex(1)}
          onClick={onLaunchpadClick}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <circle cx="5" cy="5" r="2"/>
              <circle cx="12" cy="5" r="2"/>
              <circle cx="19" cy="5" r="2"/>
              <circle cx="5" cy="12" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="19" cy="12" r="2"/>
              <circle cx="5" cy="19" r="2"/>
              <circle cx="12" cy="19" r="2"/>
              <circle cx="19" cy="19" r="2"/>
            </svg>
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-10 bg-white/20 mx-1 self-center" />

        {/* Apps */}
        {apps.filter(app => app.id !== 'finder_desktop').map((app, idx) => {
          const actualIndex = idx + 2; // +2 for Finder and Launchpad
          const scale = getScale(actualIndex);
          const translateY = getTranslateY(actualIndex);
          const isOpen = openAppIds.includes(app.id);

          return (
            <div
              key={app.id}
              className="dock-item relative flex flex-col items-center cursor-pointer"
              style={{
                transform: `translateY(${translateY}px) scale(${scale})`,
                transformOrigin: 'bottom center',
                transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: draggedIndex === actualIndex ? 0.5 : 1,
              }}
              onMouseEnter={() => setHoveredIndex(actualIndex)}
              onTouchStart={(e) => {
                e.preventDefault();
                setTouchActive(true);
                setHoveredIndex(actualIndex);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                onAppClick(app.id);
                setTimeout(() => {
                  setTouchActive(false);
                  setHoveredIndex(null);
                }, 150);
              }}
              onClick={() => {
                if (!touchActive) {
                  onAppClick(app.id);
                }
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, actualIndex)}
              onDragOver={(e) => handleDragOver(e, actualIndex)}
              onDragEnd={handleDragEnd}
            >
              {/* Tooltip */}
              {hoveredIndex === actualIndex && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-xs whitespace-nowrap liquid-glass pointer-events-none"
                  style={{ color: 'var(--text-primary)', fontSize: '11px' }}
                >
                  {app.name}
                </div>
              )}

              {/* Icon */}
              <div className="rounded-xl overflow-hidden shadow-lg" style={{ width: dockSize, height: dockSize }}>
                {app.iconUrl ? (
                  <img 
                    src={app.iconUrl} 
                    alt={app.name}
                    className="w-full h-full object-cover scale-117"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${app.color} flex items-center justify-center`}>
                    <span className="material-icons text-white" style={{ fontSize: dockSize * 0.5 }}>{getIconName(app.icon)}</span>
                  </div>
                )}
              </div>

              {/* Open indicator */}
              {isOpen && (
                <div className="w-1 h-1 rounded-full bg-white/80 mt-0.5 absolute -bottom-1" />
              )}
            </div>
          );
        })}

        {/* Separator */}
        <div className="w-px h-10 bg-white/20 mx-1 self-center" />

        {/* Trash */}
        <div
          className="dock-item relative flex flex-col items-center cursor-pointer"
          style={{
            transform: hoveredIndex === apps.length + 2 ? 'translateY(-16px) scale(1.45)' : 'scale(1)',
            transformOrigin: 'bottom center',
            transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={() => setHoveredIndex(apps.length + 2)}
        >
          <div className="rounded-xl overflow-hidden shadow-lg" style={{ width: dockSize, height: dockSize }}>
            <img 
              src="https://www.nicepng.com/png/full/203-2036322_yosemite-trash-can-icon-os-x-mac-os.png" 
              alt="Trash"
              className="w-full h-full object-cover scale-117"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
