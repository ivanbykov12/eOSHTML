import { useState, useEffect, useRef } from 'react';

interface ControlCenterProps {
  isDark: boolean;
  onOpenApp?: (appId: string) => void;
  onClose: () => void;
}

type WidgetId = 'wifi' | 'bluetooth' | 'airplane' | 'focus' | 'mirror' | 'brightness' | 'volume' | 'media' | 'timer' | 'calculator' | 'camera' | 'screenshot' | 'notes' | 'clock';

interface WidgetConfig {
  id: WidgetId;
  type: 'small' | 'medium' | 'slider';
  name: string;
  icon: string;
}

const ALL_WIDGETS: Record<WidgetId, WidgetConfig> = {
  wifi: { id: 'wifi', type: 'small', name: 'Wi-Fi', icon: 'wifi' },
  bluetooth: { id: 'bluetooth', type: 'small', name: 'Bluetooth', icon: 'bluetooth' },
  airplane: { id: 'airplane', type: 'small', name: 'Airplane', icon: 'airplanemode_active' },
  focus: { id: 'focus', type: 'small', name: 'Focus', icon: 'do_not_disturb_on' },
  mirror: { id: 'mirror', type: 'small', name: 'Mirror', icon: 'screen_share' },
  brightness: { id: 'brightness', type: 'slider', name: 'Brightness', icon: 'brightness_high' },
  volume: { id: 'volume', type: 'slider', name: 'Volume', icon: 'volume_up' },
  media: { id: 'media', type: 'medium', name: 'Media', icon: 'music_note' },
  timer: { id: 'timer', type: 'small', name: 'Timer', icon: 'timer' },
  calculator: { id: 'calculator', type: 'small', name: 'Calc', icon: 'calculate' },
  camera: { id: 'camera', type: 'small', name: 'Camera', icon: 'photo_camera' },
  screenshot: { id: 'screenshot', type: 'small', name: 'Screenshot', icon: 'screenshot_monitor' },
  notes: { id: 'notes', type: 'small', name: 'Notes', icon: 'note' },
  clock: { id: 'clock', type: 'small', name: 'Clock', icon: 'schedule' },
};

const DEFAULT_LAYOUT: WidgetId[] = [
  'wifi', 'bluetooth', 'airplane', 'focus',
  'brightness', 'volume',
  'timer', 'calculator', 'camera', 'screenshot'
];

const STORAGE_KEY = 'eos_cc_layout';
const STATE_KEY = 'eos_cc_state';

interface WidgetState {
  wifi: boolean;
  bluetooth: boolean;
  airplane: boolean;
  focus: boolean;
  mirror: boolean;
  brightness: number;
  volume: number;
}

export default function ControlCenter({ isDark, onOpenApp, onClose }: ControlCenterProps) {
  const [layout, setLayout] = useState<WidgetId[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
    } catch {
      return DEFAULT_LAYOUT;
    }
  });

  const [widgetState, setWidgetState] = useState<WidgetState>(() => {
    try {
      const saved = localStorage.getItem(STATE_KEY);
      return saved ? JSON.parse(saved) : {
        wifi: true,
        bluetooth: true,
        airplane: false,
        focus: false,
        mirror: false,
        brightness: 100,
        volume: 75,
      };
    } catch {
      return {
        wifi: true,
        bluetooth: true,
        airplane: false,
        focus: false,
        mirror: false,
        brightness: 100,
        volume: 75,
      };
    }
  });

  const [editMode, setEditMode] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<WidgetId | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<WidgetId | null>(null);
  const [closing, setClosing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Save layout to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(STATE_KEY, JSON.stringify(widgetState));
  }, [widgetState]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [editMode]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    // Delay to avoid immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onClose(), 200);
  };

  const toggleWidget = (id: WidgetId) => {
    if (editMode) return;
    
    setWidgetState(prev => {
      const newState = { ...prev };
      if (id === 'wifi') {
        newState.wifi = !prev.wifi;
        if (newState.wifi) newState.airplane = false;
      } else if (id === 'bluetooth') {
        newState.bluetooth = !prev.bluetooth;
        if (newState.bluetooth) newState.airplane = false;
      } else if (id === 'airplane') {
        newState.airplane = !prev.airplane;
        if (newState.airplane) {
          newState.wifi = false;
          newState.bluetooth = false;
        }
      } else if (id === 'focus') {
        newState.focus = !prev.focus;
      } else if (id === 'mirror') {
        newState.mirror = !prev.mirror;
      }
      return newState;
    });
  };

  const openAppWidget = (appId: string) => {
    if (editMode) return;
    if (onOpenApp) onOpenApp(appId);
    handleClose();
  };

  const removeWidget = (id: WidgetId) => {
    setLayout(prev => prev.filter(w => w !== id));
  };

  const addWidget = (id: WidgetId) => {
    if (!layout.includes(id)) {
      setLayout(prev => [...prev, id]);
    }
  };

  const handleDragStart = (id: WidgetId) => {
    setDraggedWidget(id);
  };

  const handleDragOver = (e: React.DragEvent, id: WidgetId) => {
    e.preventDefault();
    setDragOverWidget(id);
  };

  const handleDrop = (targetId: WidgetId) => {
    if (draggedWidget && draggedWidget !== targetId) {
      setLayout(prev => {
        const newLayout = [...prev];
        const fromIndex = newLayout.indexOf(draggedWidget);
        const toIndex = newLayout.indexOf(targetId);
        if (fromIndex !== -1 && toIndex !== -1) {
          newLayout.splice(fromIndex, 1);
          newLayout.splice(toIndex, 0, draggedWidget);
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

  const availableWidgets = (Object.keys(ALL_WIDGETS) as WidgetId[]).filter(
    id => !layout.includes(id)
  );

  const isActive = (id: WidgetId): boolean => {
    if (id === 'wifi') return widgetState.wifi;
    if (id === 'bluetooth') return widgetState.bluetooth;
    if (id === 'airplane') return widgetState.airplane;
    if (id === 'focus') return widgetState.focus;
    if (id === 'mirror') return widgetState.mirror;
    return false;
  };

  const getWidgetStatus = (id: WidgetId): string => {
    if (id === 'wifi') return widgetState.wifi ? 'Домашняя' : 'Выкл.';
    if (id === 'bluetooth') return widgetState.bluetooth ? 'Вкл.' : 'Выкл.';
    if (id === 'airplane') return widgetState.airplane ? 'Вкл.' : 'Выкл.';
    if (id === 'focus') return widgetState.focus ? 'Не беспокоить' : 'Выкл.';
    if (id === 'mirror') return widgetState.mirror ? 'Подключено' : 'Выкл.';
    return '';
  };

  const handleSliderChange = (id: 'brightness' | 'volume', value: number) => {
    setWidgetState(prev => ({ ...prev, [id]: value }));
  };

  const getGridSpan = (widget: WidgetConfig): string => {
    if (widget.type === 'medium') return 'span 2';
    return 'span 1';
  };

  return (
    <div
      ref={containerRef}
      className={`control-center-container ${closing ? 'cc-closing' : 'cc-opening'}`}
      style={{
        position: 'fixed',
        top: '36px',
        right: '8px',
        width: 'min(340px, 90vw)',
        maxHeight: 'calc(100vh - 60px)',
        overflowY: 'auto',
        zIndex: 9999,
        background: isDark ? 'rgba(30, 30, 30, 0.75)' : 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        borderRadius: '32px',
        padding: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'}`,
        color: isDark ? '#f5f5f7' : '#1d1d1f',
        transformOrigin: 'top right',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Main Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
        }}
      >
        {layout.map(id => {
          const widget = ALL_WIDGETS[id];
          if (!widget) return null;

          if (widget.type === 'slider') {
            return (
              <SliderWidget
                key={id}
                widget={widget}
                value={widgetState[id as 'brightness' | 'volume']}
                onChange={(v) => handleSliderChange(id as 'brightness' | 'volume', v)}
                isDark={isDark}
                editMode={editMode}
                onRemove={() => removeWidget(id)}
                dragged={draggedWidget === id}
                dragOver={dragOverWidget === id}
                onDragStart={() => handleDragStart(id)}
                onDragOver={(e) => handleDragOver(e, id)}
                onDrop={() => handleDrop(id)}
                onDragEnd={handleDragEnd}
              />
            );
          }

          if (widget.type === 'medium' && id === 'media') {
            return (
              <MediaWidget
                key={id}
                isDark={isDark}
                editMode={editMode}
                onRemove={() => removeWidget(id)}
                dragged={draggedWidget === id}
                dragOver={dragOverWidget === id}
                onDragStart={() => handleDragStart(id)}
                onDragOver={(e) => handleDragOver(e, id)}
                onDrop={() => handleDrop(id)}
                onDragEnd={handleDragEnd}
              />
            );
          }

          const active = isActive(id);
          const isToggle = ['wifi', 'bluetooth', 'airplane', 'focus', 'mirror'].includes(id);
          const isApp = ['timer', 'calculator', 'camera', 'screenshot', 'notes', 'clock'].includes(id);

          return (
            <div
              key={id}
              draggable={editMode}
              onDragStart={() => handleDragStart(id)}
              onDragOver={(e) => handleDragOver(e, id)}
              onDrop={() => handleDrop(id)}
              onDragEnd={handleDragEnd}
              onClick={() => {
                if (isToggle) toggleWidget(id);
                else if (isApp) {
                  const appMap: Record<string, string> = {
                    timer: 'clock_desktop',
                    calculator: 'calculator_desktop',
                    camera: 'photos_desktop',
                    screenshot: 'photos_desktop',
                    notes: 'notes_desktop',
                    clock: 'clock_desktop',
                  };
                  openAppWidget(appMap[id] || '');
                }
              }}
              className={`cc-tile ${editMode ? 'cc-edit-mode' : ''} ${draggedWidget === id ? 'cc-dragging' : ''} ${dragOverWidget === id && draggedWidget !== id ? 'cc-drag-over' : ''}`}
              style={{
                gridColumn: getGridSpan(widget),
                background: active
                  ? (id === 'airplane' ? '#ff9500' : id === 'focus' ? '#af52de' : '#0A84FF')
                  : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
                borderRadius: '16px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: editMode ? 'grab' : 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                minHeight: '70px',
                userSelect: 'none',
              }}
            >
              {editMode && (
                <button
                  className="cc-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWidget(id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '-6px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)',
                    border: 'none',
                    color: 'white',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                  }}
                >
                  −
                </button>
              )}
              <span className="material-icons" style={{ fontSize: '24px', color: 'white' }}>
                {widget.icon}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'white', textAlign: 'center' }}>
                {widget.name}
              </span>
              {isToggle && (
                <span style={{ fontSize: '10px', color: 'white', opacity: 0.7, textAlign: 'center' }}>
                  {getWidgetStatus(id)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Mode - Available Widgets */}
      {editMode && availableWidgets.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', opacity: 0.7 }}>
            Доступные виджеты
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {availableWidgets.map(id => {
              const widget = ALL_WIDGETS[id];
              return (
                <div
                  key={id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    borderRadius: '10px',
                  }}
                >
                  <span className="material-icons" style={{ fontSize: '20px', opacity: 0.7 }}>
                    {widget.icon}
                  </span>
                  <span style={{ flex: 1, fontSize: '13px' }}>{widget.name}</span>
                  <button
                    onClick={() => addWidget(id)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#34c759',
                      border: 'none',
                      color: 'white',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Controls Button */}
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            background: editMode ? '#0A84FF' : 'transparent',
            color: editMode ? 'white' : (isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)'),
            border: editMode ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {editMode ? 'Готово' : 'Изменить виджеты'}
        </button>
      </div>
    </div>
  );
}

// Slider Widget Component
function SliderWidget({
  widget,
  value,
  onChange,
  isDark,
  editMode,
  onRemove,
  dragged,
  dragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  widget: WidgetConfig;
  value: number;
  onChange: (v: number) => void;
  isDark: boolean;
  editMode: boolean;
  onRemove: () => void;
  dragged: boolean;
  dragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = (clientY: number) => {
    if (!sliderRef.current || editMode) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = 1 - (clientY - rect.top) / rect.height;
    const clamped = Math.max(0, Math.min(100, Math.round(percent * 100)));
    onChange(clamped);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (editMode) return;
    setIsDragging(true);
    handleInteraction(e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => handleInteraction(e.clientY);
    const handleMouseUp = () => setIsDragging(false);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleInteraction(e.touches[0].clientY);
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
        gridColumn: 'span 2',
        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        borderRadius: '16px',
        padding: '8px',
        position: 'relative',
        cursor: editMode ? 'grab' : 'pointer',
        transition: dragged ? 'none' : 'all 0.2s',
        minHeight: '140px',
      }}
    >
      {editMode && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{
            position: 'absolute',
            top: '-6px',
            left: '-6px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)',
            border: 'none',
            color: 'white',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          −
        </button>
      )}
      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onTouchStart={(e) => {
          if (!editMode && e.touches[0]) {
            setIsDragging(true);
            handleInteraction(e.touches[0].clientY);
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '120px',
          borderRadius: '12px',
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Fill */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${value}%`,
            background: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)',
            borderRadius: '12px',
            transition: isDragging ? 'none' : 'height 0.1s ease',
          }}
        />
        {/* Top icon */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
        }}>
          <span className="material-icons" style={{
            fontSize: '20px',
            color: value > 50 ? (isDark ? '#333' : '#fff') : (isDark ? '#fff' : '#333'),
          }}>
            {endIcon}
          </span>
        </div>
        {/* Bottom icon */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
        }}>
          <span className="material-icons" style={{
            fontSize: '16px',
            color: value < 50 ? (isDark ? '#333' : '#fff') : (isDark ? '#fff' : '#333'),
          }}>
            {startIcon}
          </span>
        </div>
      </div>
    </div>
  );
}

// Media Widget Component
function MediaWidget({
  isDark,
  editMode,
  onRemove,
  dragged,
  dragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  isDark: boolean;
  editMode: boolean;
  onRemove: () => void;
  dragged: boolean;
  dragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      draggable={editMode}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`cc-media ${dragged ? 'cc-dragging' : ''} ${dragOver ? 'cc-drag-over' : ''}`}
      style={{
        gridColumn: 'span 2',
        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        borderRadius: '16px',
        padding: '12px',
        position: 'relative',
        cursor: editMode ? 'grab' : 'default',
        minHeight: '70px',
      }}
    >
      {editMode && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{
            position: 'absolute',
            top: '-6px',
            left: '-6px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)',
            border: 'none',
            color: 'white',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          −
        </button>
      )}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {/* Album art placeholder */}
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span className="material-icons" style={{ color: 'white', fontSize: '20px' }}>music_note</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Не воспроизводится
          </div>
          <div style={{ fontSize: '10px', opacity: 0.6 }}>
            Откройте Music
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
        <button
          onClick={() => !editMode && setPlaying(!playing)}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '4px',
            opacity: 0.7,
          }}
        >
          <span className="material-icons" style={{ fontSize: '20px' }}>skip_previous</span>
        </button>
        <button
          onClick={() => !editMode && setPlaying(!playing)}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <span className="material-icons" style={{ fontSize: '24px' }}>
            {playing ? 'pause' : 'play_arrow'}
          </span>
        </button>
        <button
          onClick={() => !editMode && setPlaying(!playing)}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '4px',
            opacity: 0.7,
          }}
        >
          <span className="material-icons" style={{ fontSize: '20px' }}>skip_next</span>
        </button>
      </div>
    </div>
  );
}
