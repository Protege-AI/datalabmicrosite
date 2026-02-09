'use client';

import { useRef, useEffect, useCallback } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

// Full brand palette — primary weighted heavier, secondary adds variety
const NODE_COLORS = [
  '#683EF3', // Pro Indigo (primary)
  '#683EF3',
  '#683EF3',
  '#A6C5F2', // Sky
  '#A6C5F2',
  '#CACEF2', // Powder
  '#CACEF2',
  '#4575EC', // Blue
  '#5F1490', // Purple
  '#F4624A', // Orange
  '#F7CD69', // Yellow
  '#D6C09D', // Sand
];

const CONNECTION_DISTANCE = 0.2;
const NODE_COUNT = 40;

function createNodes(width: number, height: number): Node[] {
  const nodes: Node[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: 3 + Math.random() * 9,
      opacity: 0.2 + Math.random() * 0.3,
      color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)],
    });
  }
  return nodes;
}

export default function PixelGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;

    // Reinitialize nodes if container size changed significantly
    if (
      nodesRef.current.length === 0 ||
      Math.abs(sizeRef.current.w - width) > 50 ||
      Math.abs(sizeRef.current.h - height) > 50
    ) {
      nodesRef.current = createNodes(width, height);
      sizeRef.current = { w: width, h: height };
    }

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const nodes = nodesRef.current;
    const diagonal = Math.sqrt(width * width + height * height);
    const maxDist = CONNECTION_DISTANCE * diagonal;

    // Update positions — gentle drift
    for (const node of nodes) {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < -30) node.x = width + 30;
      if (node.x > width + 30) node.x = -30;
      if (node.y < -30) node.y = height + 30;
      if (node.y > height + 30) node.y = -30;
    }

    // Draw connections — thin indigo lines that fade with distance
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const t = 1 - dist / maxDist;
          const opacity = 0.15 * t;
          ctx.strokeStyle = `rgba(104, 62, 243, ${opacity})`;
          ctx.lineWidth = 0.2 + t * 0.55;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes as squares (brand mark motif)
    for (const node of nodes) {
      const half = node.size / 2;
      ctx.globalAlpha = node.opacity;
      ctx.fillStyle = node.color;
      ctx.fillRect(node.x - half, node.y - half, node.size, node.size);
    }
    ctx.globalAlpha = 1;

    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      nodesRef.current = [];
    });
    observer.observe(container);

    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
    };
  }, [draw]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Abstract data network visualization with connected nodes"
        className="block w-full h-full"
      />
    </div>
  );
}
