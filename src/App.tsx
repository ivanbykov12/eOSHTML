import { useState, useEffect, useCallback } from 'react';
import OOBE from './components/OOBE/OOBE';
import Desktop from './components/Desktop/Desktop';
import WindowManager, { WindowState } from './components/WindowManager/WindowManager';
import MenuBar from './components/MenuBar/MenuBar';
import Dock from './components/Dock/Dock';
import MissionControl from './components/WindowManager/MissionControl';
import Launchpad from './components/Launchpad/Launchpad';
import { EApp, loadSystemApps } from './core/EAppParser';
import { loadSettings, saveSettings } from './core/API';
import './styles/liquid-glass.css';

interface InstalledApp {
  id: string;
  name: string;
  icon: string;
  iconUrl?: string;
  color: string;
  app?: EApp;
}

export default function App() {
  const [setupComplete, setSetupComplete] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [showMissionControl, setShowMissionControl] = useState(false);
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [storeApps, setStoreApps] = useState<InstalledApp[]>([]);
  const [brightness, setBrightness] = useState(100);
  const [wallpaper, setWallpaper] = useState('https://image.qwenlm.ai/generated-images/5e8ac870-af53-4f3f-a451-4014bb9cce09/_result.png');
  const [dockSize, setDockSize] = useState(48);
  const [systemAppsLoaded, setSystemAppsLoaded] = useState(false);

  const handleDockReorder = (fromIndex: number, toIndex: number) => {
    setInstalledApps(prev => {
      const newApps = [...prev];
      const [movedApp] = newApps.splice(fromIndex, 1);
      newApps.splice(toIndex, 0, movedApp);
      return newApps;
    });
  };

  const handleRemoveFromDock = (appId: string) => {
    setInstalledApps(prev => prev.filter(app => app.id !== appId));
  };

  const handleAddToDock = (appId: string) => {
    const appData = installedApps.find(a => a.id === appId);
    if (appData && !installedApps.find(a => a.id === appId)) {
      setInstalledApps(prev => [...prev, appData]);
    }
  };

  // Initialize - load settings and system apps
  useEffect(() => {
    const settings = loadSettings();
    const isSetup = localStorage.getItem('eos_setup_complete') === 'true';
    setSetupComplete(isSetup);
    
    if (settings.darkMode !== undefined) {
      setIsDark(settings.darkMode);
    }
    if (settings.brightness) {
      setBrightness(settings.brightness);
    }
    if (settings.wallpaper) {
      setWallpaper(settings.wallpaper);
    }
    if (settings.dockSize) {
      setDockSize(settings.dockSize);
    }

    // Auto fullscreen on touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice && !document.fullscreenElement) {
      const requestFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(err => {
            console.log('Fullscreen request failed:', err);
          });
        } else if ((elem as any).webkitRequestFullscreen) {
          (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).msRequestFullscreen) {
          (elem as any).msRequestFullscreen();
        }
      };
      
      // Try to enter fullscreen on first user interaction
      const handleFirstTouch = () => {
        requestFullscreen();
        document.removeEventListener('touchstart', handleFirstTouch);
        document.removeEventListener('click', handleFirstTouch);
      };
      
      document.addEventListener('touchstart', handleFirstTouch, { once: true });
      document.addEventListener('click', handleFirstTouch, { once: true });
    }

    // Load system .eapp files from /apps/system/
    loadSystemApps().then(apps => {
      const installed: InstalledApp[] = apps.map(app => ({
        id: app.id,
        name: app.name,
        icon: app.icon,
        iconUrl: app.iconUrl,
        color: app.color,
        app,
      }));
      setInstalledApps(installed);
      setSystemAppsLoaded(true);
    }).catch(err => {
      console.error('Failed to load system apps:', err);
      setSystemAppsLoaded(true);
    });
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Apply touch mode and button size
  useEffect(() => {
    const settings = loadSettings();
    
    if (settings.touchMode) {
      document.body.classList.add('touch-mode');
    } else {
      document.body.classList.remove('touch-mode');
    }

    // Apply button size
    const buttonSize = settings.buttonSize || 'medium';
    document.documentElement.setAttribute('data-button-size', buttonSize);
    
    // Apply font size
    const fontSize = settings.fontSize || 14;
    document.documentElement.style.setProperty('--base-font-size', fontSize + 'px');
  }, []);

  const openApp = useCallback((appId: string, appName?: string) => {
    const appData = installedApps.find(a => a.id === appId);
    if (!appData?.app && !appName) return;

    const windowId = `win_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const maxZ = Math.max(...windows.map(w => w.zIndex), 0);

    const newWindow: WindowState = {
      id: windowId,
      appId,
      title: appName || appData?.name || 'Application',
      x: 100 + (windows.length * 30) % 200,
      y: 60 + (windows.length * 30) % 150,
      width: 800,
      height: 550,
      minimized: false,
      maximized: false,
      zIndex: maxZ + 1,
      app: appData?.app,
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(windowId);
  }, [windows, installedApps]);

  // Listen for settings changes from apps (via postMessage from iframes)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'eos-settings') {
        const newSettings = e.data.data || e.data;
        saveSettings(newSettings);
        if (newSettings.darkMode !== undefined) {
          setIsDark(newSettings.darkMode);
        }
        if (newSettings.brightness !== undefined) {
          setBrightness(newSettings.brightness);
        }
      }
      // Console command responses
      if (e.data?.type === 'eos-console') {
        const { command } = e.data;
        // Handle console commands from iframes
        let result = '';
        const cmd = command.trim().toLowerCase();
        if (cmd === 'model') result = 'Macbook 13 Pro\nModel: eosdesktop';
        else if (cmd === 'sysinfo') result = 'eOS Desktop 10.1 beta\nKernel: eOS-Darwin 23.0\nModel: Macbook 13 Pro\nRBAC: SYSTEM_ADMIN';
        else if (cmd === 'ls') result = '📁 Desktop\n📁 Documents\n📁 Downloads';
        else if (cmd === 'whoami') result = loadSettings().name || 'ivan';
        else if (cmd === 'uptime') result = `up ${Math.floor(performance.now() / 1000)} seconds`;
        else if (cmd === 'help') result = 'Available commands: model, sysinfo, ls, uptime, whoami, help';
        else result = `Command not found: ${command}`;
        
        // Send result back to iframe
        const iframe = document.querySelector('iframe');
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'eos-console-result', result }, '*');
        }
      }
      
      // Handle app installation from App Store
      if (e.data?.type === 'eapp-install-from-file') {
        const { app } = e.data;
        if (app && app.id && app.name) {
          // Add to installed apps
          setInstalledApps(prev => {
            // Check if already installed
            if (prev.find(a => a.id === app.id)) {
              return prev;
            }
            return [...prev, {
              id: app.id,
              name: app.name,
              icon: app.icon || 'material:apps',
              color: app.color || 'from-gray-500 to-gray-700',
              app: app
            }];
          });
          // Remove from store apps if it was there
          setStoreApps(prev => prev.filter(a => a.id !== app.id));
        }
      }

      // Handle adding app to store (from drag&drop)
      if (e.data?.type === 'eapp-add-to-store') {
        const { app } = e.data;
        if (app && app.id && app.name) {
          setStoreApps(prev => {
            if (prev.find(a => a.id === app.id)) {
              return prev;
            }
            return [...prev, {
              id: app.id,
              name: app.name,
              icon: app.icon || 'material:apps',
              color: app.color || 'from-gray-500 to-gray-700',
              app: app
            }];
          });
        }
      }

      // Handle request for store apps
      if (e.data?.type === 'eos-get-store-apps') {
        const storeAppsData = storeApps.map(a => ({
          id: a.id,
          name: a.name,
          icon: a.icon,
          color: a.color,
          app: a.app // Include full app data
        }));
        const source = e.source as Window;
        if (source) {
          source.postMessage({
            type: 'eos-store-apps-data',
            apps: storeAppsData
          }, '*');
        }
      }
      
      // Handle wallpaper change
      if (e.data?.type === 'eos-wallpaper-change') {
        const { wallpaper } = e.data;
        if (wallpaper) {
          setWallpaper(wallpaper);
        }
      }
      
      // Handle open app request (from settings to open Epple ID)
      if (e.data?.type === 'eos-open-app') {
        const { appId } = e.data;
        if (appId) {
          openApp(appId);
        }
      }
      
      // Handle settings change (need to update all windows)
      if (e.data?.type === 'eos-settings-change') {
        const changes = e.data;
        saveSettings(changes);
        
        if (changes.darkMode !== undefined) {
          setIsDark(changes.darkMode);
        }
        if (changes.brightness !== undefined) {
          setBrightness(changes.brightness);
        }
        if (changes.dockSize !== undefined) {
          setDockSize(changes.dockSize);
        }
        
        // Apply touch mode
        if (changes.touchMode !== undefined) {
          if (changes.touchMode) {
            document.body.classList.add('touch-mode');
          } else {
            document.body.classList.remove('touch-mode');
          }
        }
        
        // Apply button size
        if (changes.buttonSize !== undefined) {
          document.documentElement.setAttribute('data-button-size', changes.buttonSize);
        }
        
        // Apply font size
        if (changes.fontSize !== undefined) {
          document.documentElement.style.setProperty('--base-font-size', changes.fontSize + 'px');
        }
        
        // Notify all windows about theme change
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          try {
            iframe.contentWindow?.postMessage({
              type: 'eos-theme-change',
              isDark: changes.darkMode !== undefined ? changes.darkMode : isDark,
              touchMode: changes.touchMode,
              buttonSize: changes.buttonSize,
              fontSize: changes.fontSize
            }, '*');
          } catch (err) {
            // Ignore cross-origin errors
          }
        });
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [isDark, openApp, storeApps]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F3' || (e.ctrlKey && e.key === 'ArrowUp')) {
        e.preventDefault();
        setShowMissionControl(prev => !prev);
      }
      if (e.key === 'F4') {
        e.preventDefault();
        setShowLaunchpad(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        if (activeWindowId) {
          setWindows(prev => prev.filter(w => w.id !== activeWindowId));
          setActiveWindowId(null);
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault();
        if (activeWindowId) {
          setWindows(prev => prev.map(w => w.id === activeWindowId ? { ...w, minimized: true } : w));
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeWindowId]);

  const handleOOBEComplete = useCallback((settings: any) => {
    saveSettings({
      name: settings.name,
      darkMode: settings.theme === 'dark',
      language: settings.language,
      region: settings.region,
      accentColor: settings.accentColor,
    });
    setIsDark(settings.theme === 'dark');
    setSetupComplete(true);
  }, []);

  const handleDockClick = useCallback((appId: string) => {
    const existing = windows.find(w => w.appId === appId);
    if (existing) {
      const maxZ = Math.max(...windows.map(w => w.zIndex), 0);
      setWindows(prev => prev.map(w => 
        w.id === existing.id ? { ...w, minimized: false, zIndex: maxZ + 1 } : w
      ));
      setActiveWindowId(existing.id);
    } else {
      openApp(appId);
    }
  }, [windows, openApp]);

  const handleMissionControlSelect = useCallback((windowId: string) => {
    const maxZ = Math.max(...windows.map(w => w.zIndex), 0);
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, zIndex: maxZ + 1, minimized: false } : w
    ));
    setActiveWindowId(windowId);
    setShowMissionControl(false);
  }, [windows]);

  const activeWindowTitle = windows.find(w => w.id === activeWindowId)?.title || null;

  const dockApps = installedApps.map(a => ({
    id: a.id,
    name: a.name,
    icon: a.icon,
    iconUrl: a.iconUrl,
    color: a.color,
  }));

  const openAppIds = windows.map(w => w.appId);

  // OOBE Screen
  if (!setupComplete) {
    return <OOBE onComplete={handleOOBEComplete} />;
  }

  // Loading state while system apps are loading
  if (!systemAppsLoaded) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
            <span className="material-icons text-white text-3xl">computer</span>
          </div>
          <p className="text-white/60 text-sm">Загрузка системы...</p>
        </div>
      </div>
    );
  }

  // Main Desktop
  return (
    <div className="fixed inset-0 overflow-hidden select-none"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      }}
    >
      {/* Wallpaper */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: `url(${wallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: isDark ? 0.8 : 0.6,
        }}
      />
      {/* Wallpaper overlay for depth */}
      <div className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(120, 80, 255, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(255, 100, 200, 0.1) 0%, transparent 50%)',
        }}
      />

      {/* Brightness overlay */}
      <div
        className="brightness-overlay"
        style={{ background: `rgba(0,0,0,${(100 - brightness) / 200})` }}
      />

      {/* Menu Bar - hidden in Launchpad */}
      {!showLaunchpad && (
        <MenuBar 
          activeWindowTitle={activeWindowTitle} 
          isDark={isDark} 
          onOpenApp={openApp} 
        />
      )}

      {/* Desktop */}
      <Desktop
        onOpenApp={openApp}
        installedApps={dockApps}
      />

      {/* Window Manager */}
      <WindowManager
        windows={windows}
        setWindows={setWindows}
        activeWindowId={activeWindowId}
        setActiveWindowId={setActiveWindowId}
        currentModel="eosdesktop"
      />

      {/* Mission Control */}
      {showMissionControl && (
        <MissionControl
          windows={windows}
          onSelectWindow={handleMissionControlSelect}
          onClose={() => setShowMissionControl(false)}
        />
      )}

      {/* Launchpad */}
      {showLaunchpad && (
        <Launchpad
          apps={dockApps}
          onAppClick={handleDockClick}
          onClose={() => setShowLaunchpad(false)}
          onAddToDock={(appId) => {
            // App is already in dock, just close launchpad
            setShowLaunchpad(false);
          }}
          onDockDrop={handleAddToDock}
        />
      )}

      {/* Dock */}
      <Dock
        apps={dockApps}
        openAppIds={openAppIds}
        onAppClick={handleDockClick}
        onLaunchpadClick={() => setShowLaunchpad(true)}
        onReorder={handleDockReorder}
        onRemoveFromDock={handleRemoveFromDock}
        dockSize={dockSize}
      />
    </div>
  );
}
