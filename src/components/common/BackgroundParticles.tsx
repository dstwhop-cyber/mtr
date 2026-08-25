import React, { useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  opacitySpeed: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: 'star' | 'heart' | 'circle' | 'sparkle';
}

export const BackgroundParticles: React.FC = () => {
  const { settings } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Gradient Orb Colors by Theme Preset
  const getOrbGradients = () => {
    switch (settings.themePreset) {
      case 'rose-gold':
        return {
          orb1: 'bg-rose-500/25',
          orb2: 'bg-pink-500/20',
          orb3: 'bg-amber-400/15',
          orb4: 'bg-rose-400/20',
        };
      case 'soft-peach':
        return {
          orb1: 'bg-orange-500/25',
          orb2: 'bg-amber-500/20',
          orb3: 'bg-rose-400/15',
          orb4: 'bg-yellow-400/20',
        };
      case 'lavender':
        return {
          orb1: 'bg-purple-500/25',
          orb2: 'bg-indigo-500/20',
          orb3: 'bg-pink-500/15',
          orb4: 'bg-violet-400/20',
        };
      case 'sage-green':
        return {
          orb1: 'bg-emerald-500/25',
          orb2: 'bg-teal-500/20',
          orb3: 'bg-green-400/15',
          orb4: 'bg-lime-400/20',
        };
      case 'starry-dusk':
        return {
          orb1: 'bg-indigo-500/30',
          orb2: 'bg-purple-500/25',
          orb3: 'bg-blue-500/20',
          orb4: 'bg-amber-400/15',
        };
      default: // warm-amber
        return {
          orb1: 'bg-amber-500/25',
          orb2: 'bg-orange-500/20',
          orb3: 'bg-rose-500/15',
          orb4: 'bg-yellow-500/20',
        };
    }
  };

  const orbs = getOrbGradients();

  useEffect(() => {
    if (!settings.animationsEnabled || settings.particleType === 'none') {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particleCount = Math.min(Math.floor((width * height) / 25000), 40);
    const particles: Particle[] = [];

    const getColors = () => {
      switch (settings.themePreset) {
        case 'rose-gold':
          return ['rgba(244, 114, 182, 0.5)', 'rgba(251, 146, 60, 0.4)', 'rgba(253, 164, 175, 0.6)'];
        case 'soft-peach':
          return ['rgba(251, 146, 60, 0.5)', 'rgba(252, 211, 77, 0.5)', 'rgba(249, 115, 22, 0.4)'];
        case 'lavender':
          return ['rgba(192, 132, 252, 0.5)', 'rgba(167, 139, 250, 0.5)', 'rgba(232, 121, 249, 0.4)'];
        case 'sage-green':
          return ['rgba(52, 211, 153, 0.5)', 'rgba(110, 231, 183, 0.4)', 'rgba(167, 243, 208, 0.5)'];
        case 'starry-dusk':
          return ['rgba(147, 197, 253, 0.6)', 'rgba(199, 210, 254, 0.5)', 'rgba(253, 224, 71, 0.5)'];
        default:
          return ['rgba(245, 158, 11, 0.5)', 'rgba(251, 191, 36, 0.4)', 'rgba(252, 211, 77, 0.5)'];
      }
    };

    const colors = getColors();

    const getShapeForType = (): 'star' | 'heart' | 'circle' | 'sparkle' => {
      if (settings.particleType === 'hearts') return 'heart';
      if (settings.particleType === 'stars') return 'star';
      if (settings.particleType === 'champagne') return 'sparkle';
      return 'circle';
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (settings.particleType === 'warm-glow' ? 16 : 6) + 4,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: settings.particleType === 'champagne' ? -(Math.random() * 0.5 + 0.25) : (Math.random() - 0.5) * 0.35,
        opacity: Math.random() * 0.5 + 0.2,
        opacitySpeed: (Math.random() * 0.006 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        shape: getShapeForType(),
      });
    }

    const drawHeart = (c: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      c.save();
      c.translate(x, y);
      c.scale(size / 15, size / 15);
      c.beginPath();
      c.moveTo(0, 0);
      c.bezierCurveTo(-5, -7, -12, -2, -12, 5);
      c.bezierCurveTo(-12, 12, -4, 18, 0, 22);
      c.bezierCurveTo(4, 18, 12, 12, 12, 5);
      c.bezierCurveTo(12, -2, 5, -7, 0, 0);
      c.fill();
      c.restore();
    };

    const drawStar = (c: CanvasRenderingContext2D, cx: number, cy: number, spikes = 4, outerRadius = 8, innerRadius = 3) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      c.beginPath();
      c.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        c.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        c.lineTo(x, y);
        rot += step;
      }
      c.lineTo(cx, cy - outerRadius);
      c.closePath();
      c.fill();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.opacity += p.opacitySpeed;

        if (p.opacity > 0.7 || p.opacity < 0.1) {
          p.opacitySpeed = -p.opacitySpeed;
        }

        // Wrap around boundaries
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.05, Math.min(0.7, p.opacity));

        if (p.shape === 'heart') {
          drawHeart(ctx, p.x, p.y, p.size);
        } else if (p.shape === 'star' || p.shape === 'sparkle') {
          drawStar(ctx, p.x, p.y, 4, p.size, p.size * 0.4);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [settings.particleType, settings.animationsEnabled, settings.themePreset]);

  return (
    <>
      {/* Ambient glowing orbs for radiant Frosted Glass effect */}
      <div className="frosted-ambient-bg">
        <div
          className={`frosted-orb ${orbs.orb1} w-[500px] h-[500px] -top-32 -left-20`}
          style={{ animationDuration: '22s' }}
        />
        <div
          className={`frosted-orb ${orbs.orb2} w-[450px] h-[450px] top-1/3 -right-24`}
          style={{ animationDuration: '26s', animationDelay: '-5s' }}
        />
        <div
          className={`frosted-orb ${orbs.orb3} w-[550px] h-[550px] top-2/3 -left-32`}
          style={{ animationDuration: '28s', animationDelay: '-10s' }}
        />
        <div
          className={`frosted-orb ${orbs.orb4} w-[400px] h-[400px] -bottom-24 right-1/4`}
          style={{ animationDuration: '20s', animationDelay: '-15s' }}
        />
      </div>

      {/* Floating Canvas Particles */}
      {settings.animationsEnabled && settings.particleType !== 'none' && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-0 opacity-70"
          aria-hidden="true"
        />
      )}
    </>
  );
};
