import { useState, useEffect, useCallback } from 'react';
import OOBE from './components/OOBE/OOBE';
import Desktop from './components/Desktop/Desktop';
import WindowManager, { WindowState } from './components/WindowManager/WindowManager';
import MenuBar from './components/MenuBar/MenuBar';
import Dock from './components/Dock/Dock';
import MissionControl from './components/WindowManager/MissionControl';
import { settingsApp } from './components/Apps/SettingsApp';
import { terminalApp } from './components/Apps/TerminalApp';
import { finderApp } from './components/Apps/FinderApp';
import { appStoreApp } from './components/Apps/AppStoreApp';
import { calculatorApp } from './components/Apps/CalculatorApp';
import { EApp } from './core/EAppParser';
import { loadSettings, saveSettings } from './core/API';
import './styles/liquid-glass.css';

// System apps registry
const SYSTEM_APPS: EApp[] = [settingsApp, terminalApp, finderApp, appStoreApp, calculatorApp];

interface InstalledApp {
  id: string;
  name: string;
  icon: string;
  color: string;
  app?: EApp;
}

export default function App() {
  const [setupComplete, setSetupComplete] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [showMissionControl, setShowMissionControl] = useState(false);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [brightness, setBrightness] = useState(100);

  // Initialize
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

    // Install system apps
    const apps: InstalledApp[] = SYSTEM_APPS.map(app => ({
      id: app.id,
      name: app.name,
      icon: app.icon,
      color: app.color,
      app,
    }));
    setInstalledApps(apps);
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Listen for settings changes from apps
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'eos-settings') {
        const newSettings = e.data.data;
        saveSettings(newSettings);
        if (newSettings.darkMode !== undefined) {
          setIsDark(newSettings.darkMode);
        }
        if (newSettings.brightness !== undefined) {
          setBrightness(newSettings.brightness);
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // F3 or Ctrl+Up for Mission Control
      if (e.key === 'F3' || (e.ctrlKey && e.key === 'ArrowUp')) {
        e.preventDefault();
        setShowMissionControl(prev => !prev);
      }
      // Cmd+W to close window
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        if (activeWindowId) {
          setWindows(prev => prev.filter(w => w.id !== activeWindowId));
          setActiveWindowId(null);
        }
      }
      // Cmd+M to minimize
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

  const openApp = useCallback((appId: string, appName?: string) => {
    // Find app
    const appData = SYSTEM_APPS.find(a => a.id === appId);
    if (!appData && !appName) return;

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
      app: appData,
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(windowId);
  }, [windows]);

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
    // Check if already open
    const existing = windows.find(w => w.appId === appId);
    if (existing) {
      // Focus or restore
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

  // Get active window title for menu bar
  const activeWindowTitle = windows.find(w => w.id === activeWindowId)?.title || null;

  // Dock apps
  const dockApps = installedApps.map(a => ({
    id: a.id,
    name: a.name,
    icon: a.icon,
    color: a.color,
  }));

  const openAppIds = windows.map(w => w.appId);

  // OOBE Screen
  if (!setupComplete) {
    return <OOBE onComplete={handleOOBEComplete} />;
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
          backgroundImage: 'url(https://image.qwenlm.ai/generated-images/5e8ac870-af53-4f3f-a451-4014bb9cce09/_result.png)',
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

      {/* Menu Bar */}
      <MenuBar activeWindowTitle={activeWindowTitle} isDark={isDark} />

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

      {/* Dock */}
      <Dock
        apps={dockApps}
        openAppIds={openAppIds}
        onAppClick={handleDockClick}
      />
    </div>
  );
}
