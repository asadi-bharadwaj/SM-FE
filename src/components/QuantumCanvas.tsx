import React from 'react';

interface QuantumCanvasProps {
  children: React.ReactNode;
}

const QuantumCanvas: React.FC<QuantumCanvasProps> = ({ children }) => {
  return (
    <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%' }}>
      {/* Main content */}
      {children}
    </div>
  );
};

export default QuantumCanvas;