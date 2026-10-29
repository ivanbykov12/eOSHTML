import { useState, useCallback, useEffect } from 'react';
import { fs } from '../../core/FileSystem';
import { getIconName } from '../../core/EAppParser';

interface DesktopProps {
  onOpenApp: (appId: string, appName: string) => void;
  installedApps: { id: string; name: string; icon: string; iconUrl?: string; color: string }[];
  onReorderApps?: (apps: any[]) => void;
}

const LAYOUT_KEY = 'eos_desktop_layout';

export default function Desktop({ onOpenApp, installedApps, onReorderApps }: DesktopProps) {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item?: string } | null>(null);
  const [appsOrder, setAppsOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem(LAYOUT_KEY);
    return saved ? JSON.parse(saved) : installedApps.map(app => app.id);
  });
  const [draggedApp, setDraggedApp] = useState<string | null>(null);
  const [dragOverApp, setDragOverApp] = useState<string | null>(null);

  // Обновляем порядок при изменении installedApps
  useEffect(() => {
    const currentIds = installedApps.map(app => app.id);
    const newOrder = appsOrder.filter(id => currentIds.includes(id));
    
    // Добавляем новые приложения в конец
    currentIds.forEach(id => {
      if (!newOrder.includes(id)) {
        newOrder.push(id);
      }
    });
    
    if (JSON.stringify(newOrder) !== JSON.stringify(appsOrder)) {
      setAppsOrder(newOrder);
    }
  }, [installedApps]);

  // Сохраняем порядок в localStorage
  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(appsOrder));
  }, [appsOrder]);

  const desktopFiles = fs.list('/users/ivan/Desktop');

  // Сортируем приложения согласно порядку
  const sortedApps = appsOrder
    .map(id => installedApps.find(app => app.id === id))
    .filter(app => app !== undefined) as typeof installedApps;

  const handleIconClick = useCallback((id: string) => {
    setSelectedIcon(id);
    setContextMenu(null);
  }, []);

  const handleIconDoubleClick = useCallback((app: any) => {
    onOpenApp(app.id || app.metadata?.appId, app.name);
  }, [onOpenApp]);

  const handleContextMenu = useCallback((e: React.MouseEvent, itemId?: string) => {
    e.preventDefault();
    e.stopPropagation();
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
          try {
            const appData = JSON.parse(content);
            fs.writeFile(`/users/ivan/Desktop/${file.name}`, content, { type: 'eapp' });
            window.postMessage({
              type: 'eapp-add-to-store',
              app: appData
            }, '*');
          } catch (err) {
            console.error('Invalid .eapp file:', err);
          }
        };
        reader.readAsText(file);
      }
    }
    setDraggedApp(null);
    setDragOverApp(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleAppDragStart = useCallback((e: React.DragEvent, appId: string) => {
    setDraggedApp(appId);
    e.dataTransfer.setData('appId', appId);
    e.dataTransfer.setData('source', 'desktop');
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleAppDragOver = useCallback((e: React.DragEvent, targetAppId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedApp && draggedApp !== targetAppId) {
      setDragOverApp(targetAppId);
    }
  }, [draggedApp]);

  const handleAppDrop = useCallback((e: React.DragEvent, targetAppId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const sourceAppId = e.dataTransfer.getData('appId');
    const source = e.dataTransfer.getData('source');
    
    if (sourceAppId && source === 'desktop' && sourceAppId !== targetAppId) {
      setAppsOrder(prev => {
        const newOrder = [...prev];
        const fromIndex = newOrder.indexOf(sourceAppId);
        const toIndex = newOrder.indexOf(targetAppId);
        
        if (fromIndex !== -1 && toIndex !== -1) {
          newOrder.splice(fromIndex, 1);
          newOrder.splice(toIndex, 0, sourceAppId);
        }
        
        return newOrder;
      });
    }
    
    setDraggedApp(null);
    setDragOverApp(null);
  }, []);

  const handleAppDragEnd = useCallback(() => {
    setDraggedApp(null);
    setDragOverApp(null);
  }, []);

  return (
    <div
      className="absolute inset-0 pt-8 pb-20 px-4"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => { setSelectedIcon(null); setContextMenu(null); }}
      onContextMenu={(e) => handleContextMenu(e)}
      onTouchStart={() => { setContextMenu(null); }}
    >
      {/* Desktop Icons Grid */}
      <div 
        className="grid gap-4 content-start h-full"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, 80px)',
          gridAutoRows: '90px',
        }}
      >
        {/* Installed Apps */}
        {sortedApps.map(app => (
          <div
            key={app.id}
            className={`desktop-icon flex flex-col items-center w-20 p-2 cursor-pointer rounded-lg transition-all ${
              selectedIcon === app.id ? 'bg-blue-500/20' : ''
            } ${draggedApp === app.id ? 'opacity-50 scale-95' : ''} ${
              dragOverApp === app.id ? 'bg-blue-500/30 scale-105' : ''
            }`}
            draggable
            onDragStart={(e) => handleAppDragStart(e, app.id)}
            onDragOver={(e) => handleAppDragOver(e, app.id)}
            onDrop={(e) => handleAppDrop(e, app.id)}
            onDragEnd={handleAppDragEnd}
            onClick={(e) => { e.stopPropagation(); handleIconClick(app.id); }}
            onDoubleClick={() => handleIconDoubleClick(app)}
            onTouchEnd={(e) => {
              e.stopPropagation();
              const now = Date.now();
              const lastTap = (e.currentTarget as any)._lastTap || 0;
              if (now - lastTap < 300) {
                handleIconDoubleClick(app);
              } else {
                handleIconClick(app.id);
              }
              (e.currentTarget as any)._lastTap = now;
            }}
            onContextMenu={(e) => { e.stopPropagation(); handleContextMenu(e, app.id); }}
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg mb-1">
              {app.iconUrl ? (
                <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover scale-117" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${app.color} flex items-center justify-center`}>
                  <span className="material-icons text-white text-2xl">{getIconName(app.icon)}</span>
                </div>
              )}
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
            className={`desktop-icon flex flex-col items-center w-20 p-2 cursor-pointer rounded-lg ${
              selectedIcon === file.id ? 'bg-blue-500/20' : ''
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
