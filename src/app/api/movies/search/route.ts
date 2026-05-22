import { searchMovies, getAllMovies, MOVIE_PAGE_SIZE } from "@/lib/movies";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);

  if (!query) {
    return Response.json({ movies: [], total: 0, page: 1, pageSize: MOVIE_PAGE_SIZE, totalPages: 0, query });
  }

  const allMovies = await getAllMovies();
  const featuredMovies = allMovies.filter((m) => m.rating >= 9.5);
  const results = await searchMovies(query);
  const total = results.length;
  const totalPages = Math.max(Math.ceil(total / MOVIE_PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * MOVIE_PAGE_SIZE;

  return Response.json({
    movies: results.slice(start, start + MOVIE_PAGE_SIZE),
    featuredMovies,
    page: currentPage,
    pageSize: MOVIE_PAGE_SIZE,
    total,
    totalPages,
    query,
  });
}
