import { useState, useEffect, useRef } from 'react';
import { isUIElementVisible } from '../../core/AppDependencies';

interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  installedApps?: { id: string }[];
}

type WidgetType = 'toggle' | 'slider' | 'action';
type WidgetSize = '1x1' | '1x2' | '2x1' | '2x2';

interface WidgetState {
  wifi: boolean;
  bluetooth: boolean;
  airplane: boolean;
  focus: boolean;
  brightness: number;
  volume: number;
}

interface WidgetInstance {
  instanceId: string; // Уникальный ID для каждого экземпляра
  id: string;
  type: WidgetType;
  icon: string;
  label: string;
  size: WidgetSize;
  appId?: string;
}

interface WidgetTemplate {
  id: string;
  type: WidgetType;
  icon: string;
  label: string;
  defaultSize: WidgetSize;
  appId?: string;
}

const WIDGET_TEMPLATES: WidgetTemplate[] = [
  { id: 'wifi', type: 'toggle', icon: 'wifi', label: 'Wi-Fi', defaultSize: '1x1' },
  { id: 'bluetooth', type: 'toggle', icon: 'bluetooth', label: 'Bluetooth', defaultSize: '1x1' },
  { id: 'airplane', type: 'toggle', icon: 'airplanemode_active', label: 'Airplane', defaultSize: '1x1' },
  { id: 'focus', type: 'toggle', icon: 'do_not_disturb_on', label: 'Focus', defaultSize: '1x1' },
  { id: 'brightness', type: 'slider', icon: 'brightness_high', label: 'Brightness', defaultSize: '2x1' },
  { id: 'volume', type: 'slider', icon: 'volume_up', label: 'Volume', defaultSize: '2x1' },
  { id: 'timer', type: 'action', icon: 'timer', label: 'Timer', defaultSize: '1x1', appId: 'clock_desktop' },
  { id: 'calculator', type: 'action', icon: 'calculate', label: 'Calculator', defaultSize: '1x1', appId: 'calculator_desktop' },
  { id: 'camera', type: 'action', icon: 'photo_camera', label: 'Camera', defaultSize: '1x1', appId: 'photos_desktop' },
  { id: 'screenshot', type: 'action', icon: 'screenshot_monitor', label: 'Screenshot', defaultSize: '1x1', appId: 'photos_desktop' },
];

const DEFAULT_LAYOUT: WidgetInstance[] = [
  { instanceId: 'wifi-1', id: 'wifi', type: 'toggle', icon: 'wifi', label: 'Wi-Fi', size: '1x1' },
  { instanceId: 'bluetooth-1', id: 'bluetooth', type: 'toggle', icon: 'bluetooth', label: 'Bluetooth', size: '1x1' },
  { instanceId: 'airplane-1', id: 'airplane', type: 'toggle', icon: 'airplanemode_active', label: 'Airplane', size: '1x1' },
  { instanceId: 'focus-1', id: 'focus', type: 'toggle', icon: 'do_not_disturb_on', label: 'Focus', size: '1x1' },
  { instanceId: 'brightness-1', id: 'brightness', type: 'slider', icon: 'brightness_high', label: 'Brightness', size: '2x1' },
  { instanceId: 'volume-1', id: 'volume', type: 'slider', icon: 'volume_up', label: 'Volume', size: '2x1' },
  { instanceId: 'timer-1', id: 'timer', type: 'action', icon: 'timer', label: 'Timer', size: '1x1', appId: 'clock_desktop' },
  { instanceId: 'calculator-1', id: 'calculator', type: 'action', icon: 'calculate', label: 'Calculator', size: '1x1', appId: 'calculator_desktop' },
  { instanceId: 'camera-1', id: 'camera', type: 'action', icon: 'photo_camera', label: 'Camera', size: '1x1', appId: 'photos_desktop' },
  { instanceId: 'screenshot-1', id: 'screenshot', type: 'action', icon: 'screenshot_monitor', label: 'Screenshot', size: '1x1', appId: 'photos_desktop' },
];

const LAYOUT_KEY = 'eos_cc_layout_v3';
const STATE_KEY = 'eos_cc_state';

let instanceCounter = 100;

export default function ControlCenter({ isOpen, onClose, installedApps = [] }: ControlCenterProps) {
  const [layout, setLayout] = useState<WidgetInstance[]>(() => {
    const saved = localStorage.getItem(LAYOUT_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });

  const [widgetState, setWidgetState] = useState<WidgetState>(() => {
    const saved = localStorage.getItem(STATE_KEY);
    return saved ? JSON.parse(saved) : {
      wifi: true,
      bluetooth: true,
      airplane: false,
      focus: false,
      brightness: 80,
      volume: 60,
    };
  });

  const [editMode, setEditMode] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  }, [layout]);

  useEffect(() => {
    localStorage.setItem(STATE_KEY, JSON.stringify(widgetState));
  }, [widgetState]);

  // Sync state from localStorage
  useEffect(() => {
    const syncState = () => {
      const saved = localStorage.getItem(STATE_KEY);
      if (saved) {
        try {
          const state = JSON.parse(saved);
          setWidgetState(prev => {
            if (prev.wifi !== state.wifi || prev.bluetooth !== state.bluetooth || 
                prev.airplane !== state.airplane || prev.focus !== state.focus) {
              return { ...prev, ...state };
            }
            return prev;
          });
        } catch (e) {
          console.error('Failed to sync CC state:', e);
        }
      }
    };

    window.addEventListener('storage', syncState);
    const interval = setInterval(syncState, 500);

    return () => {
      window.removeEventListener('storage', syncState);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showCreateMenu) {
          setShowCreateMenu(false);
        } else if (editMode) {
          setEditMode(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, editMode, showCreateMenu, onClose]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    if (isOpen) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isOpen]);

  const toggleWidget = (widget: WidgetInstance) => {
    if (editMode) return;
    
    if (widget.type === 'toggle') {
      setWidgetState(prev => {
        const newState = { ...prev };
        if (widget.id === 'wifi') {
          newState.wifi = !prev.wifi;
          if (newState.wifi) newState.airplane = false;
        }
        if (widget.id === 'bluetooth') {
          newState.bluetooth = !prev.bluetooth;
          if (newState.bluetooth) newState.airplane = false;
        }
        if (widget.id === 'airplane') {
          newState.airplane = !prev.airplane;
          if (newState.airplane) {
            newState.wifi = false;
            newState.bluetooth = false;
          }
        }
        if (widget.id === 'focus') newState.focus = !prev.focus;
        return newState;
      });
    } else if (widget.type === 'action' && widget.appId) {
      window.postMessage({ type: 'eos-open-app', appId: widget.appId }, '*');
      onClose();
    }
  };

  const updateSlider = (id: string, value: number) => {
    setWidgetState(prev => ({ ...prev, [id]: value }));
  };

  const removeWidget = (instanceId: string) => {
    setLayout(prev => prev.filter(w => w.instanceId !== instanceId));
  };

  const addWidget = (template: WidgetTemplate, size: WidgetSize = template.defaultSize) => {
    instanceCounter++;
    const newWidget: WidgetInstance = {
      instanceId: `${template.id}-${instanceCounter}`,
      id: template.id,
      type: template.type,
      icon: template.icon,
      label: template.label,
      size: size,
      appId: template.appId,
    };
    setLayout(prev => [...prev, newWidget]);
    setShowCreateMenu(false);
  };

  const changeWidgetSize = (instanceId: string, newSize: WidgetSize) => {
    setLayout(prev => prev.map(w => w.instanceId === instanceId ? { ...w, size: newSize } : w));
  };

  const handleDragStart = (instanceId: string) => {
    setDraggedWidget(instanceId);
  };

  const handleDragOver = (e: React.DragEvent, instanceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverWidget(instanceId);
  };

  const handleDrop = (targetInstanceId: string) => {
    if (draggedWidget && draggedWidget !== targetInstanceId) {
      setLayout(prev => {
        const newLayout = [...prev];
        const fromIndex = newLayout.findIndex(w => w.instanceId === draggedWidget);
        const toIndex = newLayout.findIndex(w => w.instanceId === targetInstanceId);
        if (fromIndex !== -1 && toIndex !== -1) {
          const [moved] = newLayout.splice(fromIndex, 1);
          newLayout.splice(toIndex, 0, moved);
        }
        return newLayout;
      });
    }
    setDraggedWidget(null);
    setDragOverWidget(null);
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
    setDragOverWidget(null);
  };

  const getGridSpan = (size: WidgetSize): string => {
    switch (size) {
      case '1x1': return 'span 1';
      case '1x2': return 'span 2';
      case '2x1': return 'span 2';
      case '2x2': return 'span 4';
      default: return 'span 1';
    }
  };

  const getWidgetDimensions = (size: WidgetSize) => {
    switch (size) {
      case '1x1': return { width: '70px', height: '70px' };
      case '1x2': return { width: '156px', height: '70px' };
      case '2x1': return { width: '156px', height: '70px' };
      case '2x2': return { width: '156px', height: '156px' };
      default: return { width: '70px', height: '70px' };
    }
  };

  const isWidgetActive = (widget: WidgetInstance): boolean => {
    if (widget.type !== 'toggle') return false;
    if (widget.id === 'wifi') return widgetState.wifi;
    if (widget.id === 'bluetooth') return widgetState.bluetooth;
    if (widget.id === 'airplane') return widgetState.airplane;
    if (widget.id === 'focus') return widgetState.focus;
    return false;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* SVG Filter for Liquid Glass Distortion */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="liquid-glass-distortion">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="2"
              seed={Math.floor(mousePos.x * 10)}
              result="turbulence"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="12"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Control Center Panel */}
      <div
        ref={containerRef}
        className={`cc-panel ${editMode ? 'cc-edit-mode' : ''}`}
        style={{
          position: 'fixed',
          top: '44px',
          right: '12px',
          width: '360px',
          maxHeight: 'calc(100vh - 80px)',
          overflowY: 'auto',
          background: 'rgba(30, 30, 30, 0.4)',
          backdropFilter: 'blur(50px) saturate(200%) brightness(1.1)',
          WebkitBackdropFilter: 'blur(50px) saturate(200%) brightness(1.1)',
          borderRadius: '40px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
          color: '#f5f5f7',
          animation: 'ccOpen 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          zIndex: 9999,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Widget Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          {layout.filter(widget => {
            // Filter widgets based on installed apps
            const widgetElementId = `${widget.id}-widget`;
            return isUIElementVisible('controlcenter', widgetElementId, installedApps);
          }).map(widget => {
            if (widget.type === 'slider') {
              return (
                <LiquidSlider
                  key={widget.instanceId}
                  widget={widget}
                  value={widgetState[widget.id as 'brightness' | 'volume']}
                  onChange={(v) => updateSlider(widget.id, v)}
                  editMode={editMode}
                  onRemove={() => removeWidget(widget.instanceId)}
                  onResize={(size) => changeWidgetSize(widget.instanceId, size)}
                  dragged={draggedWidget === widget.instanceId}
                  dragOver={dragOverWidget === widget.instanceId}
                  onDragStart={() => handleDragStart(widget.instanceId)}
                  onDragOver={(e) => handleDragOver(e, widget.instanceId)}
                  onDrop={() => handleDrop(widget.instanceId)}
                  onDragEnd={handleDragEnd}
                />
              );
            }

            const active = isWidgetActive(widget);
            const dims = getWidgetDimensions(widget.size);

            return (
              <div
                key={widget.instanceId}
                draggable={editMode}
                onDragStart={() => handleDragStart(widget.instanceId)}
                onDragOver={(e) => handleDragOver(e, widget.instanceId)}
                onDrop={() => handleDrop(widget.instanceId)}
                onDragEnd={handleDragEnd}
                onClick={() => toggleWidget(widget)}
                className={`cc-widget ${editMode ? 'cc-edit-mode' : ''} ${draggedWidget === widget.instanceId ? 'cc-dragging' : ''} ${dragOverWidget === widget.instanceId && draggedWidget !== widget.instanceId ? 'cc-drag-over' : ''}`}
                style={{
                  gridColumn: getGridSpan(widget.size),
                  ...dims,
                  borderRadius: widget.size === '1x1' ? '50%' : '35px',
                  background: active
                    ? 'linear-gradient(135deg, #0A84FF, #007AFF)'
                    : 'rgba(255, 255, 255, 0.08)',
                  border: active
                    ? '1px solid rgba(255, 255, 255, 0.35)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: editMode ? 'grab' : 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
                  boxShadow: active
                    ? `
                      0 6px 16px rgba(10, 132, 255, 0.5),
                      inset 0 1px 0 rgba(255, 255, 255, 0.35),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.25),
                      0 0 0 1px rgba(255, 255, 255, 0.1)
                    `
                    : `
                      0 4px 12px rgba(0, 0, 0, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.12),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.15),
                      0 0 0 1px rgba(255, 255, 255, 0.05)
                    `,
                }}
              >
                {editMode && (
                  <>
                    <button
                      className="cc-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWidget(widget.instanceId);
                      }}
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        left: '-6px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: 'rgba(120, 120, 120, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        color: 'white',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      −
                    </button>
                    <SizeSelector
                      currentSize={widget.size}
                      onSizeChange={(size) => changeWidgetSize(widget.instanceId, size)}
                    />
                  </>
                )}
                <span className="material-icons" style={{ 
                  fontSize: widget.size === '1x1' ? '28px' : '32px',
                  color: 'white',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}>
                  {widget.icon}
                </span>
                <span style={{ 
                  fontSize: widget.size === '1x1' ? '10px' : '12px',
                  fontWeight: 500, 
                  color: 'white', 
                  marginTop: '3px',
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)'
                }}>
                  {widget.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Edit Mode Controls */}
        {editMode && (
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(52, 199, 89, 0.2)',
                border: '1px solid rgba(52, 199, 89, 0.4)',
                borderRadius: '14px',
                color: '#34c759',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <span className="material-icons" style={{ fontSize: '18px' }}>add_circle</span>
              Добавить виджет
            </button>

            {showCreateMenu && (
              <div style={{ 
                marginTop: '12px',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '10px', opacity: 0.6 }}>
                  Выберите тип виджета
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {WIDGET_TEMPLATES.map(template => (
                    <div
                      key={template.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '10px',
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: '18px', opacity: 0.8 }}>
                        {template.icon}
                      </span>
                      <span style={{ flex: 1, fontSize: '12px' }}>{template.label}</span>
                      <select
                        onChange={(e) => addWidget(template, e.target.value as WidgetSize)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          color: 'white',
                          cursor: 'pointer',
                        }}
                      >
                        <option value={template.defaultSize}>Добавить ({template.defaultSize})</option>
                        <option value="1x1">1×1</option>
                        <option value="1x2">1×2</option>
                        <option value="2x1">2×1</option>
                        <option value="2x2">2×2</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Controls Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => {
              setEditMode(!editMode);
              setShowCreateMenu(false);
            }}
            style={{
              background: editMode ? '#0A84FF' : 'transparent',
              color: editMode ? 'white' : 'rgba(255, 255, 255, 0.85)',
              border: editMode ? 'none' : '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '999px',
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              backdropFilter: editMode ? 'none' : 'blur(10px)',
              boxShadow: editMode
                ? '0 4px 16px rgba(10, 132, 255, 0.5)'
                : '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            {editMode ? 'Готово' : 'Изменить виджеты'}
          </button>
        </div>
      </div>
    </>
  );
}

// Size Selector Component
function SizeSelector({ currentSize, onSizeChange }: { currentSize: WidgetSize; onSizeChange: (size: WidgetSize) => void }) {
  const sizes: WidgetSize[] = ['1x1', '1x2', '2x1', '2x2'];
  
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '-8px',
        right: '-8px',
        display: 'flex',
        gap: '2px',
        background: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '8px',
        padding: '2px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        zIndex: 10,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {sizes.map(size => (
        <button
          key={size}
          onClick={(e) => {
            e.stopPropagation();
            onSizeChange(size);
          }}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '6px',
            background: currentSize === size ? '#0A84FF' : 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '9px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          {size}
        </button>
      ))}
    </div>
  );
}

// Liquid Slider Component
function LiquidSlider({
  widget,
  value,
  onChange,
  editMode,
  onRemove,
  onResize,
  dragged,
  dragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  widget: WidgetInstance;
  value: number;
  onChange: (v: number) => void;
  editMode: boolean;
  onRemove: () => void;
  onResize: (size: WidgetSize) => void;
  dragged: boolean;
  dragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = (clientX: number) => {
    if (!sliderRef.current || editMode) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = (clientX - rect.left) / rect.width;
    const clamped = Math.max(0, Math.min(100, Math.round(percent * 100)));
    onChange(clamped);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (editMode) return;
    setIsDragging(true);
    handleInteraction(e.clientX);
  };

  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => handleInteraction(e.clientX);
    const handleMouseUp = () => setIsDragging(false);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleInteraction(e.touches[0].clientX);
    };
    const handleTouchEnd = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, value]);

  const startIcon = widget.id === 'brightness' ? 'brightness_low' : 'volume_mute';
  const endIcon = widget.id === 'brightness' ? 'brightness_high' : 'volume_up';

  return (
    <div
      draggable={editMode}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`cc-slider ${dragged ? 'cc-dragging' : ''} ${dragOver ? 'cc-drag-over' : ''}`}
      style={{
        gridColumn: getGridSpan(widget.size),
        height: '56px',
        borderRadius: '999px',
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        position: 'relative',
        cursor: editMode ? 'grab' : 'pointer',
        overflow: 'hidden',
        boxShadow: `
          0 4px 12px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.15),
          inset 0 -1px 0 rgba(0, 0, 0, 0.15),
          0 0 0 1px rgba(255, 255, 255, 0.05)
        `,
      }}
    >
      {editMode && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            style={{
              position: 'absolute',
              top: '6px',
              left: '6px',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'rgba(120, 120, 120, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: 'white',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            −
          </button>
          <SizeSelector currentSize={widget.size} onSizeChange={onResize} />
        </>
      )}
      
      {/* Fill */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${value}%`,
          background: widget.id === 'volume' 
            ? 'linear-gradient(to right, #0A84FF, #007AFF)'
            : 'linear-gradient(to right, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
          borderRadius: '999px',
          transition: isDragging ? 'none' : 'width 0.1s ease',
          boxShadow: 'inset 1px 0 0 rgba(255, 255, 255, 0.6)',
        }}
      />
      
      {/* Interactive area */}
      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onTouchStart={(e) => {
          if (!editMode && e.touches[0]) {
            setIsDragging(true);
            handleInteraction(e.touches[0].clientX);
          }
        }}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 5,
        }}
      />
      
      {/* Left icon (min) */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '16px',
        transform: 'translateY(-50%)',
        zIndex: 6,
        pointerEvents: 'none',
      }}>
        <span className="material-icons" style={{
          fontSize: '20px',
          color: 'rgba(255, 255, 255, 0.9)',
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
        }}>
          {startIcon}
        </span>
      </div>
      
      {/* Right icon (max) */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '16px',
        transform: 'translateY(-50%)',
        zIndex: 6,
        pointerEvents: 'none',
      }}>
        <span className="material-icons" style={{
          fontSize: '22px',
          color: 'rgba(255, 255, 255, 0.9)',
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
        }}>
          {endIcon}
        </span>
      </div>
    </div>
  );
}

function getGridSpan(size: WidgetSize): string {
  switch (size) {
    case '1x1': return 'span 1';
    case '1x2': return 'span 2';
    case '2x1': return 'span 2';
    case '2x2': return 'span 4';
    default: return 'span 1';
  }
}
