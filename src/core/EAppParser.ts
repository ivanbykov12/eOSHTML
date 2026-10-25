// EApp Parser - supports v1.0 (Legacy) and v1.1 (Modern) formats

export interface EAppBase {
  id: string;
  name: string;
  icon: string;
  color: string;
  code: string;
  style?: string;
}

export interface EAppV10 extends EAppBase {
  // Legacy format - minimal fields
}

export interface EAppV11 extends EAppBase {
  version: string;
  eappVersion: '1.1';
  supportedModels?: string[];
  isSystem?: boolean;
  background?: string;
  author?: string;
  description?: string;
}

export type EApp = EAppV10 | EAppV11;

export function isV11(app: EApp): app is EAppV11 {
  return 'eappVersion' in app && app.eappVersion === '1.1';
}

export function parseEApp(json: string): EApp {
  const parsed = JSON.parse(json);
  
  // Validate required fields
  if (!parsed.id || !parsed.name || !parsed.icon || !parsed.code) {
    throw new Error('Invalid .eapp: missing required fields (id, name, icon, code)');
  }
  
  if (parsed.eappVersion === '1.1') {
    // V1.1 validation
    if (!parsed.version) {
      throw new Error('Invalid .eapp v1.1: missing version field');
    }
    return parsed as EAppV11;
  }
  
  return parsed as EAppV10;
}

export function parseEAppFromFile(content: string): EApp {
  return parseEApp(content);
}

export function getEAppVersion(app: EApp): string {
  return isV11(app) ? '1.1' : '1.0';
}

export function isCompatible(app: EApp, currentModel: string): boolean {
  if (!isV11(app)) return true; // V1.0 runs everywhere
  if (!app.supportedModels || app.supportedModels.length === 0) return true;
  return app.supportedModels.includes(currentModel);
}

export function getIconName(icon: string): string {
  if (icon.startsWith('material:')) {
    return icon.replace('material:', '');
  }
  return icon;
}
