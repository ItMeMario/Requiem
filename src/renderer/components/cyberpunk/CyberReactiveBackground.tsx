import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  phase: number;
}

export function CyberReactiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];

    // Configuration for a subtle, atmospheric effect
    const SPACING = 55; // Distance between nodes in grid
    const JITTER = 20; // Random offset from perfect grid
    const CONNECTION_DISTANCE = 85;
    const MOUSE_RADIUS = 180;
    const BASE_COLOR = '0, 255, 255'; // #0ff
    
    const initNodes = () => {
      nodes = [];
      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      
      for (let i = -1; i <= cols; i++) {
        for (let j = -1; j <= rows; j++) {
          nodes.push({
            x: i * SPACING + (Math.random() - 0.5) * JITTER,
            y: j * SPACING + (Math.random() - 0.5) * JITTER,
            vx: (Math.random() - 0.5) * 0.2, // Very slow movement
            vy: (Math.random() - 0.5) * 0.2,
            baseRadius: 0.8 + Math.random() * 0.7, // Small base radius
            phase: Math.random() * Math.PI * 2
          });
        }
      }
    };

    const resize = () => {
      // Use devicePixelRatio for sharp rendering
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      initNodes();
    };

    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      // Clear with slight transparency for trailing effect if desired, but here we just clear
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const time = Date.now() * 0.001;

      // Update node positions subtly
      nodes.forEach(node => {
        // Idle wandering
        node.x += node.vx;
        node.y += node.vy;

        // Wrap around bounds (with margin)
        if (node.x < -SPACING * 2) node.x = width + SPACING;
        if (node.x > width + SPACING * 2) node.x = -SPACING;
        if (node.y < -SPACING * 2) node.y = height + SPACING;
        if (node.y > height + SPACING * 2) node.y = -SPACING;
      });

      // Draw connections
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        
        // Distance to mouse for the first node
        const dx1 = n1.x - mx;
        const dy1 = n1.y - my;
        const distToMouse1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        
        // Calculate influence of mouse on this node
        const mouseInfluence1 = Math.max(0, 1 - distToMouse1 / MOUSE_RADIUS);

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            // Check second node's mouse connection
            const dx2 = n2.x - mx;
            const dy2 = n2.y - my;
            const distToMouse2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            const mouseInfluence2 = Math.max(0, 1 - distToMouse2 / MOUSE_RADIUS);
            
            // Average influence
            const avgInfluence = (mouseInfluence1 + mouseInfluence2) / 2;
            
            // Base opacity for connections is very low, spikes near mouse
            const baseOpacity = Math.max(0, 1 - dist / CONNECTION_DISTANCE) * 0.05;
            const activeOpacity = baseOpacity + (avgInfluence * 0.35); // Max opacity ~0.4

            if (activeOpacity > 0.01) {
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.strokeStyle = `rgba(${BASE_COLOR}, ${activeOpacity})`;
              ctx.stroke();
            }
          }
        }
      }

      // Draw nodes
      nodes.forEach(node => {
        const dx = node.x - mx;
        const dy = node.y - my;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        const mouseInfluence = Math.max(0, 1 - distToMouse / MOUSE_RADIUS);

        // Breathing pulse
        const pulse = Math.sin(time + node.phase) * 0.5 + 0.5;
        
        // Base opacity is subtle, gets brighter with pulse and much brighter near mouse
        const nodeOpacity = 0.15 + (pulse * 0.15) + (mouseInfluence * 0.7);
        const currentRadius = node.baseRadius + (mouseInfluence * 1.5);

        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${BASE_COLOR}, ${nodeOpacity})`;
        
        if (mouseInfluence > 0.2) {
          ctx.shadowBlur = 10 * mouseInfluence;
          ctx.shadowColor = `rgba(${BASE_COLOR}, 1)`;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 mix-blend-screen"
    />
  );
}
