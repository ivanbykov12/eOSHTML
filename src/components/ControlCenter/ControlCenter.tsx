import { useState, useEffect, useRef } from 'react';

interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

type WidgetId = 'wifi' | 'bluetooth' | 'airplane' | 'focus' | 'brightness' | 'volume' | 'timer' | 'calculator' | 'camera' | 'screenshot';

interface WidgetState {
  wifi: boolean;
  bluetooth: boolean;
  airplane: boolean;
  focus: boolean;
  brightness: number;
  volume: number;
}

interface WidgetConfig {
  id: WidgetId;
  icon: string;
  label: string;
  type: 'toggle' | 'slider' | 'action';
}

const ALL_WIDGETS: WidgetConfig[] = [
  { id: 'wifi', icon: 'wifi', label: 'Wi-Fi', type: 'toggle' },
  { id: 'bluetooth', icon: 'bluetooth', label: 'Bluetooth', type: 'toggle' },
  { id: 'airplane', icon: 'airplanemode_active', label: 'Airplane', type: 'toggle' },
  { id: 'focus', icon: 'do_not_disturb_on', label: 'Focus', type: 'toggle' },
  { id: 'brightness', icon: 'brightness_high', label: 'Brightness', type: 'slider' },
  { id: 'volume', icon: 'volume_up', label: 'Volume', type: 'slider' },
  { id: 'timer', icon: 'timer', label: 'Timer', type: 'action' },
  { id: 'calculator', icon: 'calculate', label: 'Calculator', type: 'action' },
  { id: 'camera', icon: 'photo_camera', label: 'Camera', type: 'action' },
  { id: 'screenshot', icon: 'screenshot_monitor', label: 'Screenshot', type: 'action' },
];

const DEFAULT_LAYOUT: WidgetId[] = [
  'wifi', 'bluetooth', 'airplane', 'focus',
  'brightness', 'volume',
  'timer', 'calculator', 'camera', 'screenshot'
];

export default function ControlCenter({ isOpen, onClose }: ControlCenterProps) {
  const [layout, setLayout] = useState<WidgetId[]>(() => {
    const saved = localStorage.getItem('eos_cc_layout');
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });

  const [widgetState, setWidgetState] = useState<WidgetState>(() => {
    const saved = localStorage.getItem('eos_cc_state');
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
  const [draggedWidget, setDraggedWidget] = useState<WidgetId | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<WidgetId | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('eos_cc_layout', JSON.stringify(layout));
  }, [layout]);

  useEffect(() => {
    localStorage.setItem('eos_cc_state', JSON.stringify(widgetState));
  }, [widgetState]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (editMode) {
          setEditMode(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, editMode, onClose]);

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

  const toggleWidget = (id: WidgetId) => {
    if (editMode) return;
    
    setWidgetState(prev => {
      const newState = { ...prev };
      if (id === 'wifi') newState.wifi = !prev.wifi;
      if (id === 'bluetooth') newState.bluetooth = !prev.bluetooth;
      if (id === 'airplane') {
        newState.airplane = !prev.airplane;
        if (newState.airplane) {
          newState.wifi = false;
          newState.bluetooth = false;
        }
      }
      if (id === 'focus') newState.focus = !prev.focus;
      return newState;
    });
  };

  const updateSlider = (id: 'brightness' | 'volume', value: number) => {
    setWidgetState(prev => ({ ...prev, [id]: value }));
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

  const availableWidgets = ALL_WIDGETS.filter(w => !layout.includes(w.id));

  const isWidgetActive = (id: WidgetId): boolean => {
    if (id === 'wifi') return widgetState.wifi;
    if (id === 'bluetooth') return widgetState.bluetooth;
    if (id === 'airplane') return widgetState.airplane;
    if (id === 'focus') return widgetState.focus;
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

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
        style={{ background: 'transparent' }}
      />

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
          background: 'rgba(30, 30, 30, 0.65)',
          backdropFilter: 'blur(40px) saturate(200%) brightness(1.1)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%) brightness(1.1)',
          borderRadius: '40px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -1px 0 rgba(0, 0, 0, 0.15)
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
          {layout.map(id => {
            const widget = ALL_WIDGETS.find(w => w.id === id);
            if (!widget) return null;

            if (widget.type === 'slider') {
              return (
                <LiquidSlider
                  key={id}
                  widget={widget}
                  value={widgetState[id as 'brightness' | 'volume']}
                  onChange={(v) => updateSlider(id as 'brightness' | 'volume', v)}
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

            const active = isWidgetActive(id);

            return (
              <div
                key={id}
                draggable={editMode}
                onDragStart={() => handleDragStart(id)}
                onDragOver={(e) => handleDragOver(e, id)}
                onDrop={() => handleDrop(id)}
                onDragEnd={handleDragEnd}
                onClick={() => toggleWidget(id)}
                className={`cc-widget ${editMode ? 'cc-edit-mode' : ''} ${draggedWidget === id ? 'cc-dragging' : ''} ${dragOverWidget === id && draggedWidget !== id ? 'cc-drag-over' : ''}`}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
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
                )}
                <span className="material-icons" style={{ 
                  fontSize: '28px', 
                  color: 'white',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}>
                  {widget.icon}
                </span>
                <span style={{ 
                  fontSize: '10px', 
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

        {/* Edit Mode - Available Widgets */}
        {editMode && availableWidgets.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: 600, 
              marginBottom: '10px', 
              opacity: 0.6,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Доступные виджеты
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {availableWidgets.map(widget => (
                <div
                  key={widget.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <span className="material-icons" style={{ fontSize: '20px', opacity: 0.8 }}>
                    {widget.icon}
                  </span>
                  <span style={{ flex: 1, fontSize: '13px' }}>{widget.label}</span>
                  <button
                    onClick={() => addWidget(widget.id)}
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
                      boxShadow: '0 2px 8px rgba(52, 199, 89, 0.5)',
                    }}
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Controls Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => setEditMode(!editMode)}
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

// Liquid Slider Component
function LiquidSlider({
  widget,
  value,
  onChange,
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
        height: '64px',
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
      )}
      
      {/* Fill */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${value}%`,
          background: 'linear-gradient(to top, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.75))',
          borderRadius: '999px',
          transition: isDragging ? 'none' : 'height 0.1s ease',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        }}
      />
      
      {/* Interactive area */}
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
          position: 'absolute',
          inset: 0,
          zIndex: 5,
        }}
      />
      
      {/* Top icon */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '16px',
        transform: 'translateY(-50%)',
        zIndex: 6,
      }}>
        <span className="material-icons" style={{
          fontSize: '22px',
          color: value > 50 ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.95)',
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
        }}>
          {endIcon}
        </span>
      </div>
      
      {/* Bottom icon */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '16px',
        transform: 'translateY(-50%)',
        zIndex: 6,
      }}>
        <span className="material-icons" style={{
          fontSize: '18px',
          color: value < 50 ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.95)',
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
        }}>
          {startIcon}
        </span>
      </div>
    </div>
  );
}
