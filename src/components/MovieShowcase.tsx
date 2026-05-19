"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import moviesData from "@/data/movies.json";
import HeroCarousel from "@/components/HeroCarousel";
import type { Movie } from "@/types/movie";

const movies: Movie[] = moviesData;
const featuredMovies = movies.filter((m) => m.rating >= 9.5);

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  );
}

function MoviePoster({ movie }: { movie: Movie }) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-dark-border bg-dark-card transition-all duration-300 hover:border-dark-border-hover hover:shadow-xl hover:shadow-black/50">
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Image
          src={movie.poster}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <div className="flex items-center gap-1.5 mb-1.5">
            <StarIcon className="w-3 h-3 text-amber-glow" />
            <span className="text-xs font-semibold text-amber-glow">
              {movie.rating}
            </span>
            <span className="text-[11px] text-white/50 ml-1">{movie.duration}</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {movie.genre.map((g) => (
              <span
                key={g}
                className="px-1.5 py-0.5 text-[10px] rounded bg-white/15 text-white/80"
              >
                {g}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-white/60 line-clamp-3 leading-relaxed">
            {movie.description}
          </p>
          <div className="mt-2 pt-2 border-t border-white/10">
            <span className="text-[11px] text-white/40">{movie.director}</span>
          </div>
        </div>
      </div>

      <div className="px-3 py-2.5">
        <h3 className="text-sm font-medium text-dark-text truncate">
          {movie.title}
        </h3>
        <p className="text-xs text-dark-text-muted mt-0.5">
          {movie.originalTitle} · {movie.year}
        </p>
      </div>
    </div>
  );
}

export default function MovieShowcase() {
  const [search, setSearch] = useState("");

  const filteredMovies = useMemo(() => {
    if (!search.trim()) return movies;

    const query = search.toLowerCase().trim();
    return movies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(query) ||
        movie.originalTitle.toLowerCase().includes(query) ||
        movie.director.toLowerCase().includes(query) ||
        movie.genre.some((g) => g.toLowerCase().includes(query)) ||
        movie.year.toString().includes(query)
    );
  }, [search]);

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <header className="sticky top-0 z-20 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <FilmIcon className="w-5 h-5 text-dark-text-secondary" />
            <h1 className="text-lg font-semibold tracking-tight text-dark-text">
              电影集
            </h1>
          </div>
          <div className="relative flex-1 max-w-md ml-auto">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索电影名、导演、类型..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-dark-surface border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-dark-border-hover transition-colors"
            />
          </div>
        </div>
      </header>

      {!search.trim() && featuredMovies.length > 0 && (
        <HeroCarousel movies={featuredMovies} />
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {filteredMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-dark-text-muted">
            <SearchIcon className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg">未找到匹配的电影</p>
            <p className="text-sm mt-1">试试其他关键词</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-dark-text-muted">
                共 <span className="text-dark-text font-medium">{filteredMovies.length}</span> 部电影
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMovies.map((movie) => (
                <MoviePoster key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-dark-border py-6">
        <p className="text-center text-sm text-dark-text-muted">
          电影集 · 精选经典电影
        </p>
      </footer>
    </div>
  );
}
