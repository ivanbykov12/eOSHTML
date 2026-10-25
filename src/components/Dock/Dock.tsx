import { useState, useRef } from 'react';
import { getIconName } from '../../core/EAppParser';

interface DockProps {
  apps: { id: string; name: string; icon: string; color: string }[];
  openAppIds: string[];
  onAppClick: (appId: string) => void;
}

export default function Dock({ apps, openAppIds, onAppClick }: DockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const getScale = (index: number): number => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(index - hoveredIndex);
    if (distance === 0) return 1.4;
    if (distance === 1) return 1.2;
    if (distance === 2) return 1.05;
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

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[8000]">
      <div
        ref={dockRef}
        className="liquid-glass-heavy flex items-end gap-1 px-3 py-1.5 rounded-2xl"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {apps.map((app, index) => {
          const scale = getScale(index);
          const translateY = getTranslateY(index);
          const isOpen = openAppIds.includes(app.id);

          return (
            <div
              key={app.id}
              className="dock-item relative flex flex-col items-center cursor-pointer"
              style={{
                transform: `translateY(${translateY}px) scale(${scale})`,
                transformOrigin: 'bottom center',
                transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onClick={() => onAppClick(app.id)}
            >
              {/* Tooltip */}
              {hoveredIndex === index && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-xs whitespace-nowrap liquid-glass pointer-events-none"
                  style={{ color: 'var(--text-primary)', fontSize: '11px' }}
                >
                  {app.name}
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center shadow-lg`}>
                <span className="material-icons text-white text-2xl">{getIconName(app.icon)}</span>
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

        {/* Finder (always first) */}
        <div
          className="dock-item relative flex flex-col items-center cursor-pointer"
          style={{
            transform: hoveredIndex === apps.length ? 'translateY(-16px) scale(1.4)' : 'scale(1)',
            transformOrigin: 'bottom center',
            transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={() => setHoveredIndex(apps.length)}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
            <span className="material-icons text-white text-2xl">folder</span>
          </div>
        </div>

        {/* Trash */}
        <div
          className="dock-item relative flex flex-col items-center cursor-pointer"
          style={{
            transform: hoveredIndex === apps.length + 1 ? 'translateY(-16px) scale(1.4)' : 'scale(1)',
            transformOrigin: 'bottom center',
            transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={() => setHoveredIndex(apps.length + 1)}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-lg">
            <span className="material-icons text-white text-2xl">delete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
