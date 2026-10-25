import { useState, useCallback } from 'react';
import { fs } from '../../core/FileSystem';
import { getIconName } from '../../core/EAppParser';

interface DesktopProps {
  onOpenApp: (appId: string, appName: string) => void;
  installedApps: { id: string; name: string; icon: string; color: string }[];
}

export default function Desktop({ onOpenApp, installedApps }: DesktopProps) {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item?: string } | null>(null);

  const desktopFiles = fs.list('/users/ivan/Desktop');

  const handleIconClick = useCallback((id: string) => {
    setSelectedIcon(id);
    setContextMenu(null);
  }, []);

  const handleIconDoubleClick = useCallback((app: any) => {
    onOpenApp(app.id || app.metadata?.appId, app.name);
  }, [onOpenApp]);

  const handleContextMenu = useCallback((e: React.MouseEvent, itemId?: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item: itemId });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.endsWith('.eapp')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const content = ev.target?.result as string;
          fs.writeFile(`/users/ivan/Desktop/${file.name}`, content, { type: 'eapp' });
        };
        reader.readAsText(file);
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className="absolute inset-0 pt-8 pb-20 px-4"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => { setSelectedIcon(null); setContextMenu(null); }}
      onContextMenu={(e) => handleContextMenu(e)}
    >
      {/* Desktop Icons Grid */}
      <div className="flex flex-col flex-wrap gap-2 h-full content-start">
        {/* Installed Apps */}
        {installedApps.map(app => (
          <div
            key={app.id}
            className={`desktop-icon flex flex-col items-center w-20 p-2 cursor-pointer ${
              selectedIcon === app.id ? 'selected' : ''
            }`}
            onClick={(e) => { e.stopPropagation(); handleIconClick(app.id); }}
            onDoubleClick={() => handleIconDoubleClick(app)}
            onContextMenu={(e) => { e.stopPropagation(); handleContextMenu(e, app.id); }}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center shadow-lg mb-1`}>
              <span className="material-icons text-white text-2xl">{getIconName(app.icon)}</span>
            </div>
            <span className="text-white text-xs text-center leading-tight drop-shadow-lg line-clamp-2">
              {app.name}
            </span>
          </div>
        ))}

        {/* Desktop Files */}
        {desktopFiles.filter(f => f.type === 'file').map(file => (
          <div
            key={file.id}
            className={`desktop-icon flex flex-col items-center w-20 p-2 cursor-pointer ${
              selectedIcon === file.id ? 'selected' : ''
            }`}
            onClick={(e) => { e.stopPropagation(); handleIconClick(file.id); }}
            onDoubleClick={() => {
              if (file.metadata?.appId) {
                onOpenApp(file.metadata.appId, file.name);
              }
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg mb-1 border border-white/10">
              <span className="material-icons text-white text-2xl">description</span>
            </div>
            <span className="text-white text-xs text-center leading-tight drop-shadow-lg line-clamp-2">
              {file.name}
            </span>
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[9999] liquid-glass rounded-xl py-2 min-w-[200px] shadow-2xl"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm flex items-center gap-3" onClick={() => setContextMenu(null)}>
            <span className="material-icons text-base">refresh</span> Обновить
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm flex items-center gap-3" onClick={() => setContextMenu(null)}>
            <span className="material-icons text-base">create_new_folder</span> Новая папка
          </div>
          <div className="border-t border-white/10 my-1" />
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm flex items-center gap-3" onClick={() => setContextMenu(null)}>
            <span className="material-icons text-base">sort</span> Сортировка
          </div>
          <div className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm flex items-center gap-3" onClick={() => setContextMenu(null)}>
            <span className="material-icons text-base">view_module</span> Вид
          </div>
        </div>
      )}
    </div>
  );
}
