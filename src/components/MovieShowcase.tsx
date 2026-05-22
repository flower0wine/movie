"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import HeroCarousel from "@/components/HeroCarousel";
import type { Movie } from "@/types/movie";

interface MoviesResponse {
  movies: Movie[];
  featuredMovies: Movie[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  query: string;
}

const LOAD_AHEAD_MARGIN = "700px";
const VIRTUAL_OVERSCAN_ROWS = 2;
const GRID_GAP = 16;

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
    <div className="group relative overflow-hidden rounded-lg border border-dark-border transition-all duration-300 hover:border-dark-border-hover hover:shadow-xl hover:shadow-black/50">
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Image
          src={movie.poster}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          unoptimized
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-3 px-3 opacity-100 group-hover:opacity-0 transition-opacity duration-200">
          <h3 className="text-sm font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] truncate">
            {movie.title}
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            {movie.year}
          </p>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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
    </div>
  );
}

function getGridColumns() {
  if (typeof window === "undefined") return 5;

  if (window.innerWidth >= 1024) return 5;
  if (window.innerWidth >= 768) return 4;
  if (window.innerWidth >= 640) return 3;
  return 2;
}

function VirtualMovieGrid({
  movies,
  isLoading,
}: {
  movies: Movie[];
  isLoading: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(900);
  const [layout, setLayout] = useState({
    columns: getGridColumns(),
    rowHeight: 360,
    top: 0,
  });

  useEffect(() => {
    let frame = 0;

    const updateScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setScrollTop(window.scrollY);
        setViewportHeight(window.innerHeight);
      });
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateLayout = () => {
      const columns = getGridColumns();
      const width = container.clientWidth;
      const cardWidth = (width - GRID_GAP * (columns - 1)) / columns;
      const rowHeight = cardWidth * 1.5 + GRID_GAP;
      const top = container.getBoundingClientRect().top + window.scrollY;

      setLayout({ columns, rowHeight, top });
    };

    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(container);
    window.addEventListener("resize", updateLayout);
    window.requestAnimationFrame(updateLayout);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [movies.length]);

  const virtualWindow = useMemo(() => {
    const totalRows = Math.ceil(movies.length / layout.columns);
    const firstVisibleRow = Math.max(
      Math.floor((scrollTop - layout.top) / layout.rowHeight) -
        VIRTUAL_OVERSCAN_ROWS,
      0
    );
    const lastVisibleRow = Math.min(
      Math.ceil((scrollTop + viewportHeight - layout.top) / layout.rowHeight) +
        VIRTUAL_OVERSCAN_ROWS,
      totalRows
    );
    const startIndex = firstVisibleRow * layout.columns;
    const endIndex = Math.min(lastVisibleRow * layout.columns, movies.length);

    return {
      items: movies.slice(startIndex, endIndex),
      startIndex,
      topPadding: firstVisibleRow * layout.rowHeight,
      bottomPadding: Math.max((totalRows - lastVisibleRow) * layout.rowHeight, 0),
    };
  }, [layout, movies, scrollTop, viewportHeight]);

  return (
    <div ref={containerRef}>
      <div style={{ height: virtualWindow.topPadding }} />
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${
          isLoading ? "opacity-60" : ""
        }`}
      >
        {virtualWindow.items.map((movie) => (
          <MoviePoster key={movie.id} movie={movie} />
        ))}
      </div>
      <div style={{ height: virtualWindow.bottomPadding }} />
    </div>
  );
}

export default function MovieShowcase() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(isLoading);
  const hasMore = page < totalPages;

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const fetchMovies = useCallback(
    async (signal: AbortSignal) => {
      const trimmed = search.trim();
      const isSearch = trimmed.length > 0;
      const searchParams = new URLSearchParams({ page: String(page) });

      if (isSearch) {
        searchParams.set("q", trimmed);
      }

      try {
        setIsLoading(true);
        setError("");

        const endpoint = isSearch ? "/api/movies/search" : "/api/movies";
        const response = await fetch(`${endpoint}?${searchParams.toString()}`, {
          signal,
        });

        if (!response.ok) {
          throw new Error("获取电影数据失败");
        }

        const data = (await response.json()) as MoviesResponse;
        setMovies((currentMovies) => {
          if (data.page === 1) return data.movies;

          const existingIds = new Set(currentMovies.map((movie) => movie.id));
          const newMovies = data.movies.filter(
            (movie) => !existingIds.has(movie.id)
          );
          return [...currentMovies, ...newMovies];
        });
        setFeaturedMovies(data.featuredMovies);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setPageSize(data.pageSize);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "获取电影数据失败");
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [page, search]
  );

  useEffect(() => {
    const controller = new AbortController();
    const trimmed = search.trim();
    const delay = trimmed ? 300 : 0;

    const timer = window.setTimeout(() => {
      fetchMovies(controller.signal);
    }, delay);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [fetchMovies, search]);

  useEffect(() => {
    const marker = loadMoreRef.current;
    if (!marker) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || isLoadingRef.current) return;
        setPage((currentPage) =>
          currentPage < totalPages ? currentPage + 1 : currentPage
        );
      },
      { root: null, rootMargin: `0px 0px ${LOAD_AHEAD_MARGIN} 0px` }
    );

    observer.observe(marker);

    return () => observer.disconnect();
  }, [movies.length, totalPages]);

  const loadedCount = movies.length;

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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                setMovies([]);
                setTotal(0);
                setTotalPages(1);
                setError("");
              }}
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
        {error ? (
          <div className="flex flex-col items-center justify-center py-24 text-dark-text-muted">
            <SearchIcon className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg text-dark-text">数据加载失败</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : isLoading && movies.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: pageSize }).map((_, index) => (
              <div key={index} className="relative aspect-[2/3] rounded-lg border border-dark-border bg-dark-surface overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent bg-[length:200%_100%] animate-shimmer" />
                <div className="absolute bottom-0 inset-x-0 h-12 bg-dark-card">
                  <div className="h-3 w-3/4 rounded bg-dark-border mt-3 mx-3" />
                  <div className="h-2 w-1/3 rounded bg-dark-border mt-2 mx-3" />
                </div>
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-dark-text-muted">
            <SearchIcon className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg">未找到匹配的电影</p>
            <p className="text-sm mt-1">试试其他关键词</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-dark-text-muted">
                共 <span className="text-dark-text font-medium">{total}</span> 部电影
                <span className="ml-2">
                  已加载 <span className="text-dark-text font-medium">{loadedCount}</span> 部
                </span>
              </p>
            </div>
            <VirtualMovieGrid movies={movies} isLoading={isLoading} />
            <div ref={loadMoreRef} className="h-12" aria-hidden="true" />
            {isLoading && movies.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                {Array.from({ length: pageSize }).map((_, index) => (
                  <div key={index} className="relative aspect-[2/3] rounded-lg border border-dark-border bg-dark-surface overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent bg-[length:200%_100%] animate-shimmer" />
                    <div className="absolute bottom-0 inset-x-0 h-12 bg-dark-card">
                      <div className="h-3 w-3/4 rounded bg-dark-border mt-3 mx-3" />
                      <div className="h-2 w-1/3 rounded bg-dark-border mt-2 mx-3" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!hasMore && movies.length > 0 && (
              <div className="py-6 text-center text-sm text-dark-text-muted">
                已加载全部电影
              </div>
            )}
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
