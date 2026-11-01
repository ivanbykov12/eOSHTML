import React from 'react';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const WarningModal: React.FC<WarningModalProps> = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(30, 30, 30, 0.95)',
          backdropFilter: 'blur(40px)',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '400px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          animation: 'scaleIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff9500, #ff3b30)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>!</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#f5f5f7' }}>
            {title}
          </h2>
        </div>
        
        <p style={{ margin: '0 0 20px 0', fontSize: '14px', lineHeight: '1.5', color: 'rgba(245, 245, 247, 0.8)' }}>
          {message}
        </p>
        
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px 20px',
            background: 'rgba(0, 122, 255, 0.9)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(0, 122, 255, 1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(0, 122, 255, 0.9)';
          }}
        >
          Понятно
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default WarningModal;
