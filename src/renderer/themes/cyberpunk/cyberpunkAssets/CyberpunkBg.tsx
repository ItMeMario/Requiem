import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  z: number; // Depth for parallax (1 to 3)
  vx: number;
  vy: number;
  baseRadius: number;
  phase: number;
  colorType: 'cyan' | 'purple' | 'blue';
}

interface HexChar {
  x: number;
  y: number;
  char: string;
  speed: number;
  opacity: number;
}

export function CyberpunkBg() {
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
    let hexDrops: HexChar[] = [];

    const SPACING = 65; 
    const JITTER = 25; 
    const CONNECTION_DISTANCE = 100;
    const MOUSE_RADIUS = 200;
    
    // Cyberpunk Color Palette
    const COLORS = {
      cyan: '0, 255, 255',
      purple: '180, 0, 255',
      blue: '0, 85, 255'
    };

    const HEX_CHARS = "0123456789ABCDEF@#$&*";

    const initCanvas = () => {
      nodes = [];
      hexDrops = [];
      const cols = Math.ceil(width / SPACING) + 2;
      const rows = Math.ceil(height / SPACING) + 2;
      
      for (let i = -2; i <= cols; i++) {
        for (let j = -2; j <= rows; j++) {
          const z = Math.random() > 0.7 ? 1 : Math.random() > 0.4 ? 2 : 3; // 1 = Foreground, 3 = Background
          const colorRoll = Math.random();
          const colorType = colorRoll > 0.85 ? 'purple' : (colorRoll > 0.6 ? 'blue' : 'cyan');

          nodes.push({
            x: i * SPACING + (Math.random() - 0.5) * JITTER,
            y: j * SPACING + (Math.random() - 0.5) * JITTER,
            z: z,
            vx: (Math.random() - 0.5) * 0.15 * (4 - z), // Closer nodes move slightly faster
            vy: (Math.random() - 0.5) * 0.15 * (4 - z),
            baseRadius: (0.5 + Math.random() * 0.8) / z, 
            phase: Math.random() * Math.PI * 2,
            colorType
          });
        }
      }

      // Init Hex Drops
      const numDrops = Math.floor(width / 40);
      for(let i=0; i<numDrops; i++) {
        hexDrops.push({
          x: Math.random() * width,
          y: Math.random() * height * -1,
          char: HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)],
          speed: 0.5 + Math.random() * 1.5,
          opacity: 0.05 + Math.random() * 0.15
        });
      }
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      initCanvas();
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

    const drawHexGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const hexSize = 40;
      const hexHeight = hexSize * Math.sqrt(3);
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      for(let y = 0; y < h + hexHeight; y += hexHeight) {
        for(let x = 0, odd = false; x < w + hexSize * 1.5; x += hexSize * 1.5, odd = !odd) {
          const cy = odd ? y + hexHeight/2 : y;
          ctx.moveTo(x + hexSize * Math.cos(0), cy + hexSize * Math.sin(0));
          for (let i = 1; i <= 6; i++) {
            ctx.lineTo(x + hexSize * Math.cos(i * Math.PI / 3), cy + hexSize * Math.sin(i * Math.PI / 3));
          }
        }
      }
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const time = Date.now() * 0.001;

      // 1. Draw Hexagonal Grid Background
      drawHexGrid(ctx, width, height);

      // 2. Draw Digital Rain (Hex drops)
      ctx.font = '12px Courier New';
      hexDrops.forEach(drop => {
        ctx.fillStyle = `rgba(0, 255, 255, ${drop.opacity})`;
        ctx.fillText(drop.char, drop.x, drop.y);
        drop.y += drop.speed;
        if(Math.random() > 0.98) drop.char = HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
        if(drop.y > height) {
          drop.y = -20;
          drop.x = Math.random() * width;
        }
      });

      // Update node positions with Parallax Response to Mouse (Subtle)
      const targetParallaxX = (mx - width/2) * 0.01;
      const targetParallaxY = (my - height/2) * 0.01;

      nodes.forEach(node => {
        node.x += node.vx + (targetParallaxX / node.z);
        node.y += node.vy + (targetParallaxY / node.z);

        if (node.x < -SPACING * 3) node.x = width + SPACING * 2;
        if (node.x > width + SPACING * 3) node.x = -SPACING * 2;
        if (node.y < -SPACING * 3) node.y = height + SPACING * 2;
        if (node.y > height + SPACING * 3) node.y = -SPACING * 2;
      });

      // 3. Draw Nodes and Connections
      // Sort nodes by depth so background draws first
      const sortedNodes = [...nodes].sort((a, b) => b.z - a.z);

      ctx.lineWidth = 1;
      for (let i = 0; i < sortedNodes.length; i++) {
        const n1 = sortedNodes[i];
        
        const dx1 = n1.x - mx;
        const dy1 = n1.y - my;
        const distToMouse1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        const mouseInfluence1 = Math.max(0, 1 - distToMouse1 / MOUSE_RADIUS);

        for (let j = i + 1; j < sortedNodes.length; j++) {
          const n2 = sortedNodes[j];
          
          // Only connect nodes somewhat on the same depth layer to maintain parallax illusion
          if (Math.abs(n1.z - n2.z) > 1) continue;

          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const dx2 = n2.x - mx;
            const dy2 = n2.y - my;
            const distToMouse2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            const mouseInfluence2 = Math.max(0, 1 - distToMouse2 / MOUSE_RADIUS);
            
            const avgInfluence = (mouseInfluence1 + mouseInfluence2) / 2;
            
            const baseOpacity = Math.max(0, 1 - dist / CONNECTION_DISTANCE) * (0.05 / n1.z); // Farther = fainter
            const activeOpacity = baseOpacity + (avgInfluence * 0.4); 

            if (activeOpacity > 0.01) {
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              
              // Gradient line between different colors
              const grad = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
              grad.addColorStop(0, `rgba(${COLORS[n1.colorType]}, ${activeOpacity})`);
              grad.addColorStop(1, `rgba(${COLORS[n2.colorType]}, ${activeOpacity})`);
              
              ctx.strokeStyle = grad;
              ctx.stroke();
            }
          }
        }

        // Draw individual Node
        const pulse = Math.sin(time + n1.phase) * 0.5 + 0.5;
        const nodeOpacity = (0.1 + (pulse * 0.2) + (mouseInfluence1 * 0.5)) / (n1.z * 0.8);
        const currentRadius = n1.baseRadius + (mouseInfluence1 * 2);

        ctx.beginPath();
        ctx.arc(n1.x, n1.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${COLORS[n1.colorType]}, ${nodeOpacity})`;
        
        if (mouseInfluence1 > 0.1) {
          ctx.shadowBlur = 12 * mouseInfluence1;
          ctx.shadowColor = `rgba(${COLORS[n1.colorType]}, 1)`;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;
      }

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
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Background Deep Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e001f]/20 via-transparent to-[#001133]/20 mix-blend-multiply" />
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 mix-blend-screen"
      />
    </div>
  );
}
