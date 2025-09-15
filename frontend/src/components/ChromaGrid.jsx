import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

const ChromaGrid = ({
  courses,
  className = "",
  radius = 300,
  damping = 0.45,
  fadeOut = 0.6,
  ease = "power3.out",
}) => {
  const rootRef = useRef(null);
  const fadeRef = useRef(null);
  const setX = useRef(null);
  const setY = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const [touchedCard, setTouchedCard] = useState(null);

  const data = courses?.length && courses;
  

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, "--x", "px");
    setY.current = gsap.quickSetter(el, "--y", "px");
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x, y) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const handleMove = (e) => {
    const r = rootRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    
    if (clientX && clientY) {
      moveTo(clientX - r.left, clientY - r.top);
      gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
    }
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, {
      opacity: 1,
      duration: fadeOut,
      overwrite: true,
    });
    setTouchedCard(null);
  };

  const handleCardMove = (e) => {
    const c = e.currentTarget;
    const rect = c.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    
    if (clientX && clientY) {
      c.style.setProperty("--mouse-x", `${clientX - rect.left}px`);
      c.style.setProperty("--mouse-y", `${clientY - rect.top}px`);
    }
  };

  const handleTouchStart = (e, cardId) => {
    e.preventDefault();
    setTouchedCard(cardId);
    handleCardMove(e);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    handleMove(e);
    handleCardMove(e);
  };

  const handleTouchEnd = () => {
    setTouchedCard(null);
    handleLeave();
  };

  if(!data) return <div>No courses available</div>

  return (
    <div
      ref={rootRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-full py-10 flex flex-wrap justify-center items-start gap-5 ${className}`}
      style={
        {
          "--r": `${radius}px`,
          "--x": "50%",
          "--y": "50%",
        }
      }
    >
      {data.map((c) => (
        <article
          key={c.id}
          onMouseMove={handleCardMove}
          onTouchStart={(e) => handleTouchStart(e, c.id)}
          onTouchMove={handleCardMove}
          className={`mx-3 group relative flex flex-col w-[300px] rounded-[20px] overflow-hidden border-2 border-transparent transition-colors duration-300 cursor-pointer ${
            touchedCard === c.id ? 'spotlight-active' : ''
          }`}
          style={
            {
              "--card-border": c.borderColor || "transparent",
              background: c.gradient,
              "--spotlight-color": "rgba(255,255,255,0.3)",
            }
          }
        >
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 ${
              touchedCard === c.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            style={{
              background:
                "radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)",
            }}
          />
          <div className="relative z-10 flex-1 p-[10px] box-border">
            <img
              src={c.thumbnail}
              alt={c.title}
              loading="lazy"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <footer className="relative h-[120px] z-10 p-3 text-white font-sans flex flex-col gap-y-1">
            <h3 className="m-0 text-[1.05rem] font-semibold w-full">{c.title}</h3>
            <div className="flex justify-between items-baseline flex-col">
              <p className="m-0 text-[0.85rem] opacity-85">{c.instructor?.fullName}</p>
              <p className="absolute text-[0.85rem] opacity-100 bottom-2">{c.category}</p>
            </div>
            
              <span className="absolute text-[0.85rem] opacity-85 bottom-2 right-2">
                {new Date(c.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                })}
              </span>
            
          </footer>
        </article>
      ))}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          backdropFilter: "grayscale(1) brightness(0.78)",
          WebkitBackdropFilter: "grayscale(1) brightness(0.78)",
          background: "rgba(0,0,0,0.001)",
          maskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22)45%,rgba(0,0,0,0.35)60%,rgba(0,0,0,0.50)75%,rgba(0,0,0,0.68)88%,white 100%)",
          WebkitMaskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22)45%,rgba(0,0,0,0.35)60%,rgba(0,0,0,0.50)75%,rgba(0,0,0,0.68)88%,white 100%)",
        }}
      />
      <div
        ref={fadeRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-[250ms] z-40"
        style={{
          backdropFilter: "grayscale(1) brightness(0.78)",
          WebkitBackdropFilter: "grayscale(1) brightness(0.78)",
          background: "rgba(0,0,0,0.001)",
          maskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)",
          opacity: 1,
        }}
      />
    </div>
  );
};

export default ChromaGrid;
