import { useEffect, useState } from 'react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const POSES = ['hero', 'wave', 'reading', 'celebrating'];
const SRC = {
  hero: '/mascot/alano-hero.webp',
  wave: '/mascot/alano-wave.webp',
  reading: '/mascot/alano-reading.webp',
  celebrating: '/mascot/alano-celebrating.webp',
};

const HEART_PARTICLES = [
  { left: '8%', top: '38%', dx: '-16px', delay: 0 },
  { left: '76%', top: '32%', dx: '18px', delay: 120 },
  { left: '30%', top: '12%', dx: '-8px', delay: 260 },
  { left: '58%', top: '8%', dx: '10px', delay: 400 },
  { left: '45%', top: '42%', dx: '2px', delay: 180 },
];

let assetsPreloaded = false;
function preloadAssets() {
  if (assetsPreloaded || typeof window === 'undefined') return;
  assetsPreloaded = true;
  Object.values(SRC).forEach((src) => {
    const img = new window.Image();
    img.src = src;
  });
}

/**
 * Alano — animirana maskota platforme (4 providne .webp poze, čist CSS, bez videa/gifa).
 *
 * pose:
 *  - 'idle'        — hero poza, suptilno "disanje" u petlji (podrazumevano stanje mirovanja)
 *  - 'wave'        — jednokratni pozdrav, sam se vrati na idle (poziva onPoseEnd)
 *  - 'celebrating' — jednokratni skok + bacanje srca, sam se vrati na idle (poziva onPoseEnd)
 *  - 'reading'     — statična dekorativna poza, bez animacije u petlji
 *
 * Poštuje prefers-reduced-motion: disanje/mahanje/skok/srca se gase, ostaje samo kratak
 * crossfade između poza.
 */
export default function Alano({ pose = 'idle', size = 72, className = '', onPoseEnd }) {
  const reducedMotion = usePrefersReducedMotion();
  const activeImg = pose === 'idle' ? 'hero' : pose;

  useEffect(() => {
    preloadAssets();
  }, []);

  // Jednokratne poze (wave/celebrating) se same vraćaju na idle nakon animacije
  useEffect(() => {
    if (pose !== 'wave' && pose !== 'celebrating') return undefined;
    const duration = reducedMotion ? 150 : pose === 'wave' ? 1800 : 1600;
    const timer = setTimeout(() => onPoseEnd?.(), duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pose, reducedMotion]);

  const animClass = reducedMotion
    ? ''
    : pose === 'idle'
    ? 'alano-breathe'
    : pose === 'wave'
    ? 'alano-wave-anim'
    : pose === 'celebrating'
    ? 'alano-jump-anim'
    : '';

  return (
    <div
      className={`relative inline-block flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {POSES.map((p) => (
        <img
          key={p}
          src={SRC[p]}
          alt=""
          draggable={false}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ease-out ${
            activeImg === p ? `opacity-100 ${animClass}` : 'opacity-0 pointer-events-none'
          }`}
        />
      ))}

      {pose === 'celebrating' && !reducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {HEART_PARTICLES.map((h, i) => (
            <span
              key={i}
              className="alano-heart"
              style={{ left: h.left, top: h.top, animationDelay: `${h.delay}ms`, '--dx': h.dx }}
            >
              ❤️
            </span>
          ))}
        </div>
      )}

      <style>{`
        @keyframes alano-breathe-kf {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.015); }
        }
        .alano-breathe { animation: alano-breathe-kf 3.2s ease-in-out infinite; transform-origin: bottom center; }

        @keyframes alano-wave-kf {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-6deg); }
          40% { transform: rotate(5deg); }
          60% { transform: rotate(-4deg); }
          80% { transform: rotate(3deg); }
        }
        .alano-wave-anim { animation: alano-wave-kf 1.8s ease-in-out 1; transform-origin: bottom center; }

        @keyframes alano-jump-kf {
          0%, 100% { transform: translateY(0) scale(1, 1); }
          25% { transform: translateY(-16px) scale(1.06, 0.94); }
          50% { transform: translateY(-20px) scale(0.95, 1.06); }
          75% { transform: translateY(-6px) scale(1.03, 0.97); }
        }
        .alano-jump-anim { animation: alano-jump-kf 1.6s cubic-bezier(.34,1.56,.64,1) 1; transform-origin: bottom center; }

        @keyframes alano-heart-kf {
          0% { opacity: 0; transform: translate(0, 0) scale(0.4); }
          15% { opacity: 1; }
          100% { opacity: 0; transform: translate(var(--dx, 0px), -60px) scale(1.1); }
        }
        .alano-heart {
          position: absolute;
          font-size: 14px;
          animation: alano-heart-kf 1.4s ease-out 1 backwards;
        }
      `}</style>
    </div>
  );
}
