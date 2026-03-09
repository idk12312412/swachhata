import { useEffect, useRef, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Particle {
  x: number;
  y: number;
  alpha: number;
  scale: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

const CURSOR_SIZE = 28;
const PARTICLE_SIZE = 15;
const TRAIL_LENGTH = 20;
const EASE = 0.15;
const MAGNETIC_RANGE = 120;
const MAGNETIC_STRENGTH = 0.5;

const CursorFollower = () => {
  const isMobile = useIsMobile();
  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const cursor = useRef({ x: -100, y: -100 });
  const particles = useRef<Particle[]>([]);
  const ripples = useRef<Ripple[]>([]);
  const isHovering = useRef(false);
  const isClicked = useRef(false);
  const rafId = useRef<number>(0);

  const animate = useCallback(() => {
    const dx = mouse.current.x - cursor.current.x;
    const dy = mouse.current.y - cursor.current.y;
    cursor.current.x += dx * EASE;
    cursor.current.y += dy * EASE;

    if (cursorRef.current) {
      const size = isClicked.current ? CURSOR_SIZE * 1.5 : isHovering.current ? CURSOR_SIZE * 1.4 : CURSOR_SIZE;
      cursorRef.current.style.transform = `translate(${cursor.current.x - size / 2}px, ${cursor.current.y - size / 2}px)`;
      cursorRef.current.style.width = `${size}px`;
      cursorRef.current.style.height = `${size}px`;
      cursorRef.current.style.opacity = isHovering.current ? "0.9" : "0.7";
    }

    // Add particle
    particles.current.unshift({ x: cursor.current.x, y: cursor.current.y, alpha: 0.8, scale: 1 });
    if (particles.current.length > TRAIL_LENGTH) particles.current.pop();

    // Draw
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Particles
        particles.current.forEach((p, i) => {
          p.alpha *= 0.9;
          p.scale *= 0.96;
          const r = (PARTICLE_SIZE / 2) * p.scale;
          if (r < 0.5) return;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          const hue = 142 + i * 3;
          ctx.fillStyle = `hsla(${hue}, 65%, 55%, ${p.alpha})`;
          ctx.shadowColor = `hsla(${hue}, 65%, 55%, ${p.alpha * 0.6})`;
          ctx.shadowBlur = 10;
          ctx.fill();
        });

        // Ripples
        ripples.current = ripples.current.filter(r => r.alpha > 0.02);
        ripples.current.forEach(r => {
          r.radius += 3;
          r.alpha *= 0.92;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(142, 65%, 55%, ${r.alpha})`;
          ctx.lineWidth = 2;
          ctx.shadowColor = `hsla(142, 65%, 55%, ${r.alpha * 0.5})`;
          ctx.shadowBlur = 8;
          ctx.stroke();
        });
      }
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const onMouseMove = (e: MouseEvent) => {
      let tx = e.clientX;
      let ty = e.clientY;

      const interactives = document.querySelectorAll("a, button, [role='button'], input, textarea, select");
      interactives.forEach((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(tx - cx, ty - cy);
        if (dist < MAGNETIC_RANGE) {
          const pull = (1 - dist / MAGNETIC_RANGE) * MAGNETIC_STRENGTH;
          tx += (cx - tx) * pull;
          ty += (cy - ty) * pull;
          isHovering.current = true;
        }
      });

      mouse.current = { x: tx, y: ty };
    };

    const onMouseLeave = () => {
      mouse.current = { x: -100, y: -100 };
      isHovering.current = false;
    };

    const onMouseOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      isHovering.current = !!t.closest("a, button, [role='button'], input, textarea, select");
    };

    const onMouseDown = () => {
      isClicked.current = true;
      ripples.current.push({ x: cursor.current.x, y: cursor.current.y, radius: 5, alpha: 0.7 });
    };
    const onMouseUp = () => { isClicked.current = false; };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    rafId.current = requestAnimationFrame(animate);

    document.body.style.cursor = "none";
    document.querySelectorAll("a, button").forEach(el => {
      (el as HTMLElement).style.cursor = "none";
    });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(rafId.current);
      document.body.style.cursor = "";
      document.querySelectorAll("a, button").forEach(el => {
        (el as HTMLElement).style.cursor = "";
      });
    };
  }, [isMobile, animate]);

  if (isMobile) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{ width: "100vw", height: "100vh" }}
      />
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full border border-primary/50 bg-primary/20 shadow-[0_0_12px_hsl(var(--primary)/0.4)] transition-[width,height,opacity] duration-150 ease-out"
        style={{ width: CURSOR_SIZE, height: CURSOR_SIZE }}
      />
    </>
  );
};

export default CursorFollower;
