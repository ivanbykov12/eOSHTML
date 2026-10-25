// API injection for eOS Desktop applications
// Provides window.ePhone, window.ePhoneContext, window.ePhoneConsole

import { fs } from './FileSystem';
import { rbac } from './RBAC';

export interface EPhoneSettings {
  name?: string;
  darkMode?: boolean;
  brightness?: number;
  accentColor?: string;
  language?: string;
  region?: string;
  wallpaper?: string;
}

export interface EPhoneContext {
  modelName: string;
  model: string;
  isDesktop: boolean;
  osVersion: string;
}

export interface EPhoneAPI {
  close: () => void;
  minimize: () => void;
  checkPermission: (resource: string, action: string) => boolean;
  getDevice: () => string;
  getRBACLevel: () => string;
  getSettings: () => EPhoneSettings;
  setSettings: (settings: Partial<EPhoneSettings>) => void;
}

export interface EPhoneConsoleAPI {
  execute: (command: string) => Promise<string>;
}

let settings: EPhoneSettings = {};
let onCloseCallback: (() => void) | null = null;
let onMinimizeCallback: (() => void) | null = null;

export function loadSettings(): EPhoneSettings {
  const stored = localStorage.getItem('eos_settings');
  if (stored) {
    try {
      settings = JSON.parse(stored);
    } catch {
      settings = {};
    }
  }
  return settings;
}

export function saveSettings(newSettings: Partial<EPhoneSettings>): void {
  settings = { ...settings, ...newSettings };
  localStorage.setItem('eos_settings', JSON.stringify(settings));
}

export function getSettings(): EPhoneSettings {
  return { ...settings };
}

export function setCallbacks(onClose: () => void, onMinimize: () => void) {
  onCloseCallback = onClose;
  onMinimizeCallback = onMinimize;
}

export function injectAPI(iframe: HTMLIFrameElement): void {
  const context: EPhoneContext = {
    modelName: 'Macbook 13 Pro',
    model: 'eosdesktop',
    isDesktop: true,
    osVersion: '10.1 beta'
  };

  const api: EPhoneAPI = {
    close: () => { if (onCloseCallback) onCloseCallback(); },
    minimize: () => { if (onMinimizeCallback) onMinimizeCallback(); },
    checkPermission: (resource: string, action: string) => {
      return rbac.checkPermission(resource, action as any);
    },
    getDevice: () => context.modelName,
    getRBACLevel: () => rbac.getLevel(),
    getSettings: () => getSettings(),
    setSettings: (s: Partial<EPhoneSettings>) => saveSettings(s),
  };

  const consoleApi: EPhoneConsoleAPI = {
    execute: async (command: string): Promise<string> => {
      const cmd = command.trim().toLowerCase();
      
      if (cmd === 'model') {
        return `${context.modelName}\nModel: ${context.model}`;
      }
      if (cmd === 'sysinfo') {
        return `eOS Desktop ${context.osVersion}\nKernel: eOS-Darwin 23.0\nModel: ${context.modelName}\nRBAC: ${rbac.getLevel()}`;
      }
      if (cmd === 'ls') {
        const items = fs.list('/users/ivan/Desktop');
        return items.map(i => `${i.type === 'directory' ? '📁' : '📄'} ${i.name}`).join('\n') || '(empty)';
      }
      if (cmd === 'uptime') {
        return `up ${Math.floor((Date.now() - performance.timing.navigationStart) / 1000)} seconds`;
      }
      if (cmd === 'whoami') {
        return settings.name || 'ivan';
      }
      if (cmd === 'help') {
        return 'Available commands: model, sysinfo, ls, uptime, whoami, help';
      }
      
      return `Command not found: ${command}`;
    }
  };

  // Inject into iframe when loaded
  iframe.addEventListener('load', () => {
    try {
      const iframeWindow = iframe.contentWindow as any;
      if (iframeWindow) {
        iframeWindow.ePhone = api;
        iframeWindow.ePhoneContext = context;
        iframeWindow.ePhoneConsole = consoleApi;
      }
    } catch (e) {
      // Cross-origin restrictions - expected for sandboxed iframes
    }
  });
}

export function getAPIScript(): string {
  return `
    <script>
      if (!window.ePhone) {
        window.ePhone = {
          close: function() { window.parent.postMessage({type:'eos-close'}, '*'); },
          minimize: function() { window.parent.postMessage({type:'eos-minimize'}, '*'); },
          checkPermission: function(r, a) { return true; },
          getDevice: function() { return 'Macbook 13 Pro'; },
          getRBACLevel: function() { return '${rbac.getLevel()}'; },
          getSettings: function() { return ${JSON.stringify(getSettings())}; },
          setSettings: function(s) { window.parent.postMessage({type:'eos-settings', data:s}, '*'); }
        };
        window.ePhoneContext = {
          modelName: 'Macbook 13 Pro',
          model: 'eosdesktop',
          isDesktop: true,
          osVersion: '10.1 beta'
        };
        window.ePhoneConsole = {
          execute: function(cmd) {
            return new Promise(function(resolve) {
              window.parent.postMessage({type:'eos-console', command:cmd}, '*');
              window.addEventListener('message', function handler(e) {
                if (e.data && e.data.type === 'eos-console-result') {
                  window.removeEventListener('message', handler);
                  resolve(e.data.result);
                }
              });
            });
          }
        };
      }
    </script>
  `;
}
