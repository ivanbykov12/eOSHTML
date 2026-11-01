// Virtual File System for eOS Desktop
export interface FSNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FSNode[];
  createdAt: number;
  modifiedAt: number;
  size?: number;
  mimeType?: string;
  metadata?: Record<string, any>;
}

export class FileSystem {
  private root: FSNode;
  private static STORAGE_KEY = 'eos_fs';

  constructor() {
    const stored = localStorage.getItem(FileSystem.STORAGE_KEY);
    if (stored) {
      try {
        this.root = JSON.parse(stored);
      } catch {
        this.root = this.createDefaultStructure();
      }
    } else {
      this.root = this.createDefaultStructure();
    }
    this.save();
  }

  private createDefaultStructure(): FSNode {
    const now = Date.now();
    return {
      id: 'root',
      name: '/',
      type: 'directory',
      createdAt: now,
      modifiedAt: now,
      children: [
        {
          id: 'public',
          name: 'public',
          type: 'directory',
          createdAt: now,
          modifiedAt: now,
          children: [
            {
              id: 'apps',
              name: 'apps',
              type: 'directory',
              createdAt: now,
              modifiedAt: now,
              children: [
                {
                  id: 'system',
                  name: 'system',
                  type: 'directory',
                  createdAt: now,
                  modifiedAt: now,
                  children: []
                }
              ]
            }
          ]
        },
        {
          id: 'users',
          name: 'users',
          type: 'directory',
          createdAt: now,
          modifiedAt: now,
          children: [
            {
              id: 'user_desktop',
              name: 'ivan',
              type: 'directory',
              createdAt: now,
              modifiedAt: now,
              children: [
                {
                  id: 'desktop',
                  name: 'Desktop',
                  type: 'directory',
                  createdAt: now,
                  modifiedAt: now,
                  children: []
                },
                {
                  id: 'documents',
                  name: 'Documents',
                  type: 'directory',
                  createdAt: now,
                  modifiedAt: now,
                  children: []
                },
                {
                  id: 'downloads',
                  name: 'Downloads',
                  type: 'directory',
                  createdAt: now,
                  modifiedAt: now,
                  children: []
                }
              ]
            }
          ]
        }
      ]
    };
  }

  private save(): void {
    localStorage.setItem(FileSystem.STORAGE_KEY, JSON.stringify(this.root));
  }

  private resolvePath(path: string): FSNode | null {
    const parts = path.split('/').filter(p => p.length > 0);
    let current: FSNode = this.root;
    
    for (const part of parts) {
      if (!current.children) return null;
      const child = current.children.find(c => c.name === part);
      if (!child) return null;
      current = child;
    }
    return current;
  }

  private getParent(path: string): { parent: FSNode; name: string } | null {
    const parts = path.split('/').filter(p => p.length > 0);
    if (parts.length === 0) return null;
    
    const name = parts.pop()!;
    const parentPath = '/' + parts.join('/');
    const parent = this.resolvePath(parentPath === '/' ? '/' : parentPath);
    if (!parent) return null;
    return { parent, name };
  }

  list(path: string): FSNode[] {
    const node = this.resolvePath(path);
    if (!node || node.type !== 'directory') return [];
    return node.children || [];
  }

  get(path: string): FSNode | null {
    return this.resolvePath(path);
  }

  exists(path: string): boolean {
    return this.resolvePath(path) !== null;
  }

  mkdir(path: string): boolean {
    const parts = path.split('/').filter(p => p.length > 0);
    const name = parts.pop();
    if (!name) return false;
    
    const parentPath = '/' + parts.join('/');
    const parent = this.resolvePath(parentPath || '/');
    if (!parent || parent.type !== 'directory') return false;
    
    if (!parent.children) parent.children = [];
    if (parent.children.find(c => c.name === name)) return false;
    
    const now = Date.now();
    parent.children.push({
      id: `dir_${now}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'directory',
      children: [],
      createdAt: now,
      modifiedAt: now
    });
    
    parent.modifiedAt = now;
    this.save();
    return true;
  }

  writeFile(path: string, content: string, metadata?: Record<string, any>): boolean {
    const parts = path.split('/').filter(p => p.length > 0);
    const name = parts.pop();
    if (!name) return false;
    
    const parentPath = '/' + parts.join('/');
    const parent = this.resolvePath(parentPath || '/');
    if (!parent || parent.type !== 'directory') return false;
    
    if (!parent.children) parent.children = [];
    const now = Date.now();
    
    const existing = parent.children.find(c => c.name === name);
    if (existing) {
      existing.content = content;
      existing.modifiedAt = now;
      existing.size = content.length;
      if (metadata) existing.metadata = metadata;
    } else {
      parent.children.push({
        id: `file_${now}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        type: 'file',
        content,
        createdAt: now,
        modifiedAt: now,
        size: content.length,
        metadata
      });
    }
    
    parent.modifiedAt = now;
    this.save();
    return true;
  }

  readFile(path: string): string | null {
    const node = this.resolvePath(path);
    if (!node || node.type !== 'file') return null;
    return node.content || null;
  }

  delete(path: string): boolean {
    const parts = path.split('/').filter(p => p.length > 0);
    const name = parts.pop();
    if (!name) return false;
    
    const parentPath = '/' + parts.join('/');
    const parent = this.resolvePath(parentPath || '/');
    if (!parent || !parent.children) return false;
    
    const idx = parent.children.findIndex(c => c.name === name);
    if (idx === -1) return false;
    
    // Check if system file
    if (path.includes('/system/') && parent.children[idx].metadata?.isSystem) {
      return false;
    }
    
    parent.children.splice(idx, 1);
    parent.modifiedAt = Date.now();
    this.save();
    return true;
  }

  rename(path: string, newName: string): boolean {
    const node = this.resolvePath(path);
    if (!node) return false;
    node.name = newName;
    node.modifiedAt = Date.now();
    this.save();
    return true;
  }

  move(sourcePath: string, destPath: string): boolean {
    const sourceParts = sourcePath.split('/').filter(p => p.length > 0);
    const sourceName = sourceParts.pop();
    if (!sourceName) return false;
    
    const sourceParentPath = '/' + sourceParts.join('/');
    const sourceParent = this.resolvePath(sourceParentPath || '/');
    if (!sourceParent || !sourceParent.children) return false;
    
    const sourceIdx = sourceParent.children.findIndex(c => c.name === sourceName);
    if (sourceIdx === -1) return false;
    
    const destDir = this.resolvePath(destPath);
    if (!destDir || destDir.type !== 'directory') return false;
    
    const [node] = sourceParent.children.splice(sourceIdx, 1);
    if (!destDir.children) destDir.children = [];
    destDir.children.push(node);
    
    this.save();
    return true;
  }

  getRoot(): FSNode {
    return this.root;
  }

  reset(): void {
    this.root = this.createDefaultStructure();
    this.save();
  }
}

export const fs = new FileSystem();
