import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import Fuse, { type IFuseOptions } from "fuse.js";
import type { Movie } from "@/types/movie";

const MOVIES_DIR = path.join(process.cwd(), "src", "data", "movies");
const PAGE_FILE_PATTERN = /^page-(\d+)\.json$/;
export const MOVIE_PAGE_SIZE = 10;

let cachedMovies: Movie[] | null = null;
let fuseInstance: Fuse<Movie> | null = null;

const FUSE_OPTIONS: IFuseOptions<Movie> = {
  keys: [
    { name: "title", weight: 2 },
    { name: "originalTitle", weight: 1.5 },
    { name: "director", weight: 1.5 },
    { name: "genre", weight: 1 },
    { name: "description", weight: 0.8 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 1,
};

async function getPageFiles() {
  const files = await readdir(MOVIES_DIR);

  return files
    .map((file) => {
      const match = file.match(PAGE_FILE_PATTERN);
      return match ? { file, page: Number(match[1]) } : null;
    })
    .filter((entry): entry is { file: string; page: number } => entry !== null)
    .sort((a, b) => a.page - b.page);
}

async function readMoviePage(file: string): Promise<Movie[]> {
  const content = await readFile(path.join(MOVIES_DIR, file), "utf8");
  return JSON.parse(content) as Movie[];
}

export async function getAllMovies() {
  if (cachedMovies) return cachedMovies;

  const pages = await getPageFiles();
  const moviesByPage = await Promise.all(
    pages.map((page) => readMoviePage(page.file))
  );

  cachedMovies = moviesByPage.flat();
  return cachedMovies;
}

export function clearMovieCache() {
  cachedMovies = null;
  fuseInstance = null;
}

function getFuseInstance(movies: Movie[]) {
  if (!fuseInstance) {
    fuseInstance = new Fuse(movies, FUSE_OPTIONS);
  }
  return fuseInstance;
}

export async function searchMovies(query: string) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const movies = await getAllMovies();
  const fuse = getFuseInstance(movies);
  const results = fuse.search(normalizedQuery);

  return results.map((result) => ({
    ...result.item,
    _score: result.score,
  }));
}

export async function getMoviesPage(page: number) {
  const pages = await getPageFiles();
  const targetPage = Math.min(Math.max(page, 1), Math.max(pages.length, 1));
  const pageFile = pages.find((entry) => entry.page === targetPage);
  const movies = pageFile ? await readMoviePage(pageFile.file) : [];
  const counts = await Promise.all(pages.map((entry) => readMoviePage(entry.file)));
  const total = counts.reduce((sum, items) => sum + items.length, 0);

  return {
    movies,
    page: targetPage,
    pageSize: MOVIE_PAGE_SIZE,
    total,
    totalPages: pages.length,
  };
}

export function filterMovies(movies: Movie[], query: string) {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return movies;

  return movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(normalizedQuery) ||
      movie.originalTitle.toLowerCase().includes(normalizedQuery) ||
      movie.director.toLowerCase().includes(normalizedQuery) ||
      movie.genre.some((genre) => genre.toLowerCase().includes(normalizedQuery)) ||
      movie.year.toString().includes(normalizedQuery)
  );
}
