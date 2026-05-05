import { useEffect, useRef } from 'react';

export const useQuantumEffects = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create quantum rift effect
    const createQuantumRift = () => {
      const rift = document.createElement('div');
      rift.className = 'quantum-rift';
      rift.style.cssText = `
        position: absolute;
        width: 2px;
        height: ${Math.random() * 200 + 100}px;
        background: linear-gradient(to bottom, transparent, var(--quantum-primary), transparent);
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: 0;
        animation: rift-appear 2s ease-out forwards;
        z-index: 1;
      `;

      container.appendChild(rift);

      setTimeout(() => {
        rift.remove();
      }, 2000);
    };

    // Create energy pulse
    const createEnergyPulse = () => {
      const pulse = document.createElement('div');
      pulse.className = 'energy-pulse';
      pulse.style.cssText = `
        position: absolute;
        width: 50px;
        height: 50px;
        border: 2px solid var(--quantum-secondary);
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: 0;
        animation: pulse-expand 1.5s ease-out forwards;
        z-index: 1;
      `;

      container.appendChild(pulse);

      setTimeout(() => {
        pulse.remove();
      }, 1500);
    };

    // Create data stream
    const createDataStream = () => {
      const stream = document.createElement('div');
      stream.className = 'data-stream';
      stream.style.cssText = `
        position: absolute;
        width: 1px;
        height: ${Math.random() * 300 + 100}px;
        background: repeating-linear-gradient(
          to bottom,
          transparent 0px,
          var(--quantum-tertiary) 2px,
          var(--quantum-tertiary) 4px,
          transparent 6px
        );
        left: ${Math.random() * 100}%;
        top: -100px;
        opacity: 0.6;
        animation: stream-fall ${Math.random() * 3 + 2}s linear forwards;
        z-index: 1;
      `;

      container.appendChild(stream);

      setTimeout(() => {
        stream.remove();
      }, 5000);
    };

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes rift-appear {
        0% { opacity: 0; transform: scaleY(0); }
        50% { opacity: 1; transform: scaleY(1); }
        100% { opacity: 0; transform: scaleY(0); }
      }

      @keyframes pulse-expand {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(3); opacity: 0; }
      }

      @keyframes stream-fall {
        0% { transform: translateY(-100px); opacity: 0.6; }
        100% { transform: translateY(calc(100vh + 100px)); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    // Start effects
    const riftInterval = setInterval(createQuantumRift, 3000);
    const pulseInterval = setInterval(createEnergyPulse, 2000);
    const streamInterval = setInterval(createDataStream, 1500);

    return () => {
      clearInterval(riftInterval);
      clearInterval(pulseInterval);
      clearInterval(streamInterval);
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return containerRef;
};