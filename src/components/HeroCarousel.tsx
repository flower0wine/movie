"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Movie } from "@/types/movie";

interface HeroCarouselProps {
  movies: Movie[];
}

const INTERVAL = 5000;

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

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

const contentVariants = {
  enter: { opacity: 0, y: 30 },
  center: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export default function HeroCarousel({ movies }: HeroCarouselProps) {
  const [[current, direction], setCurrent] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);

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

  const goTo = useCallback(
    (index: number) => {
      setCurrent(([prev]) => [index, index > prev ? 1 : -1]);
    },
    []
  );

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => paginate(1), INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, paginate]);

  const movie = movies[current];

  return (
    <div
      className="relative w-full h-[65vh] min-h-[420px] max-h-[680px] overflow-hidden bg-dark-bg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={movie.poster}
            alt={movie.title}
            fill
            priority
            className="object-cover scale-110 blur-sm brightness-[0.3]"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-dark-bg/40" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-10 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex gap-8 items-center w-full"
          >
            <div className="hidden sm:block shrink-0 w-44 md:w-52">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60">
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>

            <div className="flex-1 min-w-0 py-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-glow/15 border border-amber-glow/30">
                  <StarIcon className="w-4 h-4 text-amber-glow" />
                  <span className="text-sm font-bold text-amber-glow">{movie.rating}</span>
                </span>
                <span className="text-sm text-white/50">{movie.duration}</span>
                <span className="text-sm text-white/50">{movie.year}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-2 leading-tight">
                {movie.title}
              </h2>
              <p className="text-base sm:text-lg text-white/50 mb-5 font-light">
                {movie.originalTitle}
              </p>

              <div className="flex flex-wrap gap-2 mb-5">
                {movie.genre.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 text-xs rounded-full bg-white/10 text-white/70 border border-white/10"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-xl line-clamp-3 mb-6">
                {movie.description}
              </p>

              <div className="flex items-center gap-2 text-sm text-white/40">
                <span className="text-white/60">{movie.director}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={() => paginate(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm"
        aria-label="上一部"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => paginate(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm"
        aria-label="下一部"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`跳转到第 ${i + 1} 部电影`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current
                ? "w-8 bg-white"
                : "w-1.5 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {!isPaused && (
        <div className="absolute bottom-0 left-0 h-[2px] bg-white/30 z-20">
          <motion.div
            className="h-full bg-white/80"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: INTERVAL / 1000, ease: "linear" }}
            key={current}
          />
        </div>
      )}
    </div>
  );
}
