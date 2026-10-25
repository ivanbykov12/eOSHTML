import { WindowState } from '../WindowManager/WindowManager';

interface MissionControlProps {
  windows: WindowState[];
  onSelectWindow: (id: string) => void;
  onClose: () => void;
}

export default function MissionControl({ windows, onSelectWindow, onClose }: MissionControlProps) {
  return (
    <div
      className="fixed inset-0 z-[8500] bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center mission-control"
      onClick={onClose}
    >
      <div className="w-full max-w-6xl px-8">
        {/* Desktop thumbnails */}
        <div className="flex gap-4 justify-center mb-8">
          <div className="w-40 h-24 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/60 text-sm">
            Рабочий стол
          </div>
        </div>

        {/* Window previews */}
        <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
          {windows.filter(w => !w.minimized).map(win => (
            <div
              key={win.id}
              className="liquid-glass rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              onClick={(e) => { e.stopPropagation(); onSelectWindow(win.id); }}
            >
              <div className="h-4 bg-black/20 flex items-center px-2 gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[9px] text-white/60 ml-2 truncate">{win.title}</span>
              </div>
              <div className="h-32 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <span className="material-icons text-white/30 text-4xl">
                  {win.app?.icon?.replace('material:', '') || 'window'}
                </span>
              </div>
              <div className="p-2 text-center">
                <span className="text-white text-xs">{win.title}</span>
              </div>
            </div>
          ))}
        </div>

        {windows.length === 0 && (
          <div className="text-center text-white/40 mt-12">
            <span className="material-icons text-6xl mb-4 block">desktop_windows</span>
            <p>Нет открытых окон</p>
          </div>
        )}
      </div>
    </div>
  );
}
