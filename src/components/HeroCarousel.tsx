"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { Movie } from "@/types/movie";

interface HeroCarouselProps {
  movies: Movie[];
}

const INTERVAL = 5000;
const HERO_SIZE = {
  minHeight: "clamp(420px, 58vh, 640px)",
};
const HERO_LAYOUT = {
  display: "grid",
  alignItems: "center",
  minHeight: "inherit",
};
const POSTER_FRAME = {
  aspectRatio: "2 / 3",
};

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function HeroCarousel({ movies }: HeroCarouselProps) {
  const [[current, direction], setCurrent] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const [failedPosters, setFailedPosters] = useState<Set<number>>(
    () => new Set()
  );
  const [isNarrow, setIsNarrow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const paginate = useCallback(
    (newDirection: number) => {
      setCurrent(([prev]) => {
        const next = prev + newDirection;
        if (next < 0) return [movies.length - 1, newDirection];
        if (next >= movies.length) return [0, newDirection];
        return [next, newDirection];
      });
    },
    [movies.length]
  );

  const goTo = useCallback((index: number) => {
    setCurrent(([prev]) => [index, index >= prev ? 1 : -1]);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => paginate(1), INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, paginate]);

  useEffect(() => {
    const updateLayout = () => {
      setIsNarrow(window.innerWidth < 768);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);

    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  if (movies.length === 0) return null;

  const movie = movies[current];
  const hasFailedPoster = failedPosters.has(movie.id);

  return (
    <div
      className="relative w-full overflow-hidden border-b border-dark-border bg-dark-bg"
      style={HERO_SIZE}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={movie.id}
          custom={direction}
          initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_35%,rgba(245,158,11,0.14),transparent_32%),linear-gradient(135deg,#0a0a0a_0%,#141414_52%,#0a0a0a_100%)]" />
        </motion.div>
      </AnimatePresence>

      <div
        className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6"
        style={{
          ...HERO_LAYOUT,
          gridTemplateColumns: isNarrow
            ? "1fr"
            : "minmax(220px, 340px) minmax(0, 1fr)",
          gap: isNarrow ? "1.5rem" : "3rem",
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={`${movie.id}-poster`}
            custom={direction}
            initial={{ x: direction > 0 ? 48 : -48, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -48 : 48, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative mx-auto overflow-hidden rounded-lg border border-white/10 bg-dark-surface shadow-2xl shadow-black/50"
            style={{
              ...POSTER_FRAME,
              width: isNarrow ? "min(62vw, 240px)" : "min(100%, 340px)",
            }}
          >
            {hasFailedPoster ? (
              <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                <span className="text-2xl font-bold text-dark-text-secondary">
                  {movie.title}
                </span>
              </div>
            ) : (
              <Image
                src={movie.poster}
                alt={movie.title}
                fill
                priority={current === 0}
                sizes="(max-width: 768px) 260px, 340px"
                className="object-cover"
                unoptimized
                onError={() => {
                  setFailedPosters((currentFailedPosters) => {
                    const nextFailedPosters = new Set(currentFailedPosters);
                    nextFailedPosters.add(movie.id);
                    return nextFailedPosters;
                  });
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={`${movie.id}-content`}
            custom={direction}
            initial={{ x: direction > 0 ? 36 : -36, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -36 : 36, opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-3xl text-center md:text-left"
            style={{ textAlign: isNarrow ? "center" : "left" }}
          >
          <div className="mb-3 flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-amber-glow/20 px-2.5 py-0.5">
              <StarIcon className="h-3.5 w-3.5 text-amber-glow" />
              <span className="text-sm font-bold text-amber-glow">
                {movie.rating}
              </span>
            </span>
            <span className="text-sm text-white/60">{movie.year}</span>
          </div>

          <h2 className="mb-3 text-4xl font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-5xl md:text-6xl">
            {movie.title}
          </h2>

          <p className="mb-5 text-sm text-white/55 sm:text-base">
            {movie.originalTitle} · {movie.director} · {movie.duration}
          </p>

          <div className="flex flex-wrap gap-2">
            {movie.genre.map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-white/15 px-3 py-1 text-xs text-white/80"
              >
                {genre}
              </span>
            ))}
          </div>

            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
              {movie.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={() => paginate(-1)}
        className="absolute left-4 z-20 rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white"
        style={{ top: "50%", transform: "translateY(-50%)" }}
        aria-label="上一部"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => paginate(1)}
        className="absolute right-4 z-20 rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white"
        style={{ top: "50%", transform: "translateY(-50%)" }}
        aria-label="下一部"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        className="absolute z-20 flex items-center gap-2"
        style={{ bottom: "1.5rem", left: "50%", transform: "translateX(-50%)" }}
      >
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`跳转到第 ${i + 1} 部电影`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
