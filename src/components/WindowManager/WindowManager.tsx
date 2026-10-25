import { useState, useRef, useEffect, useCallback } from 'react';
import { EApp, getIconName, isV11, isCompatible } from '../../core/EAppParser';
import { getAPIScript } from '../../core/API';

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  app?: EApp;
  tabs?: { id: string; title: string; appId: string }[];
  activeTab?: number;
}

interface WindowManagerProps {
  windows: WindowState[];
  setWindows: React.Dispatch<React.SetStateAction<WindowState[]>>;
  activeWindowId: string | null;
  setActiveWindowId: (id: string | null) => void;
  currentModel: string;
}

export default function WindowManager({
  windows,
  setWindows,
  activeWindowId,
  setActiveWindowId,
  currentModel,
}: WindowManagerProps) {
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; startX: number; startY: number; startW: number; startH: number } | null>(null);
  const [compatibilityWarning, setCompatibilityWarning] = useState<{ windowId: string; app: EApp } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, windowId: string) => {
    const win = windows.find(w => w.id === windowId);
    if (!win || win.maximized) return;
    
    setDragging({
      id: windowId,
      offsetX: e.clientX - win.x,
      offsetY: e.clientY - win.y,
    });
    setActiveWindowId(windowId);
  }, [windows, setActiveWindowId]);

  const handleResizeStart = useCallback((e: React.MouseEvent, windowId: string) => {
    e.stopPropagation();
    const win = windows.find(w => w.id === windowId);
    if (!win) return;
    
    setResizing({
      id: windowId,
      startX: e.clientX,
      startY: e.clientY,
      startW: win.width,
      startH: win.height,
    });
  }, [windows]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        setWindows(prev => prev.map(w =>
          w.id === dragging.id
            ? { ...w, x: e.clientX - dragging.offsetX, y: Math.max(28, e.clientY - dragging.offsetY) }
            : w
        ));
      }
      if (resizing) {
        const dx = e.clientX - resizing.startX;
        const dy = e.clientY - resizing.startY;
        setWindows(prev => prev.map(w =>
          w.id === resizing.id
            ? { ...w, width: Math.max(300, resizing.startW + dx), height: Math.max(200, resizing.startH + dy) }
            : w
        ));
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
      setResizing(null);
    };

    if (dragging || resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, resizing, setWindows]);

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) {
      const remaining = windows.filter(w => w.id !== id);
      setActiveWindowId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w));
  };

  const maximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w));
  };

  const focusWindow = (id: string) => {
    const maxZ = Math.max(...windows.map(w => w.zIndex), 0);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1, minimized: false } : w));
    setActiveWindowId(id);
  };

  const handleIframeMessage = (e: MessageEvent, windowId: string) => {
    if (e.data?.type === 'eos-close') {
      closeWindow(windowId);
    } else if (e.data?.type === 'eos-minimize') {
      minimizeWindow(windowId);
    }
  };

  return (
    <>
      {windows.map(win => (
        <div
          key={win.id}
          className={`eos-window absolute flex flex-col ${
            win.minimized ? 'minimized' : 'opening'
          } ${activeWindowId === win.id ? 'ring-1 ring-white/20' : ''}`}
          style={{
            left: win.maximized ? 0 : win.x,
            top: win.maximized ? 28 : win.y,
            width: win.maximized ? '100%' : win.width,
            height: win.maximized ? 'calc(100% - 28px - 72px)' : win.height,
            zIndex: win.zIndex,
            display: win.minimized ? 'none' : 'flex',
          }}
          onClick={() => focusWindow(win.id)}
        >
          {/* Title Bar */}
          <div
            className="liquid-glass flex items-center h-10 px-3 cursor-default select-none shrink-0 rounded-t-xl"
            onMouseDown={(e) => handleMouseDown(e, win.id)}
            onDoubleClick={() => maximizeWindow(win.id)}
          >
            {/* Traffic Lights */}
            <div className="flex gap-2 mr-3">
              <button
                className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center group"
                onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
              >
                <span className="material-icons text-[8px] text-red-900 opacity-0 group-hover:opacity-100">close</span>
              </button>
              <button
                className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors flex items-center justify-center group"
                onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
              >
                <span className="material-icons text-[8px] text-yellow-900 opacity-0 group-hover:opacity-100">remove</span>
              </button>
              <button
                className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center group"
                onClick={(e) => { e.stopPropagation(); maximizeWindow(win.id); }}
              >
                <span className="material-icons text-[8px] text-green-900 opacity-0 group-hover:opacity-100">fullscreen</span>
              </button>
            </div>

            {/* Title */}
            <div className="flex-1 text-center text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {win.title}
            </div>

            {/* Spacer for traffic lights */}
            <div className="w-14" />
          </div>

          {/* Tabs (if multiple) */}
          {win.tabs && win.tabs.length > 1 && (
            <div className="flex bg-black/5 border-b border-white/5">
              {win.tabs.map((tab, idx) => (
                <div
                  key={tab.id}
                  className={`window-tab px-4 py-1.5 text-xs cursor-pointer border-r border-white/5 ${
                    idx === (win.activeTab || 0) ? 'active' : 'opacity-60'
                  }`}
                  style={{ color: 'var(--text-primary)' }}
                >
                  {tab.title}
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="window-content flex-1 overflow-hidden relative" style={{ background: win.app && isV11(win.app) && win.app.background !== 'transparent' ? win.app.background : undefined }}>
            {win.app ? (
              <AppRenderer
                app={win.app}
                windowId={win.id}
                onMessage={(e) => handleIframeMessage(e, win.id)}
              />
            ) : (
              <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-secondary)' }}>
                <span>Загрузка приложения...</span>
              </div>
            )}
          </div>

          {/* Resize Handle */}
          {!win.maximized && (
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
              onMouseDown={(e) => handleResizeStart(e, win.id)}
            />
          )}
        </div>
      ))}

      {/* Compatibility Warning Modal */}
      {compatibilityWarning && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="liquid-glass rounded-2xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-icons text-yellow-500 text-3xl">warning</span>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Предупреждение совместимости</h3>
            </div>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Приложение "{compatibilityWarning.app.name}" не поддерживает текущую модель устройства. 
              Некоторые функции могут работать некорректно.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-sm"
                style={{ color: 'var(--text-primary)' }}
                onClick={() => setCompatibilityWarning(null)}
              >
                Отмена
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all text-sm"
                onClick={() => {
                  setCompatibilityWarning(null);
                }}
              >
                Всё равно запустить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// App Renderer - renders eapp code in sandboxed iframe
function AppRenderer({ app, windowId, onMessage }: { app: EApp; windowId: string; onMessage: (e: MessageEvent) => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => onMessage(e);
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onMessage]);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        const apiScript = getAPIScript();
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; 
                overflow: auto; 
                height: 100vh;
                color: ${document.documentElement.classList.contains('dark') ? '#f5f5f7' : '#1d1d1f'};
                background: transparent;
              }
              .liquid-glass {
                background: ${document.documentElement.classList.contains('dark') ? 'rgba(30,30,30,0.65)' : 'rgba(255,255,255,0.65)'};
                backdrop-filter: blur(24px) saturate(180%);
                -webkit-backdrop-filter: blur(24px) saturate(180%);
                border: 1px solid ${document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.3)'};
              }
            </style>
          </head>
          <body>
            ${app.code}
            ${apiScript}
          </body>
          </html>
        `;
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [app, windowId]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin allow-popups"
      title={app.name}
    />
  );
}
