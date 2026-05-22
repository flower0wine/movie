import { filterMovies, getAllMovies, getMoviesPage, MOVIE_PAGE_SIZE } from "@/lib/movies";

export const runtime = "nodejs";

function parsePage(value: string | null) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parsePage(url.searchParams.get("page"));
  const query = url.searchParams.get("q")?.trim() ?? "";
  const featuredMovies = filterMovies(await getAllMovies(), "").filter(
    (movie) => movie.rating >= 9.5
  );

  if (!query) {
    const result = await getMoviesPage(page);

    return Response.json({
      ...result,
      query,
      featuredMovies,
    });
  }

  const filteredMovies = filterMovies(await getAllMovies(), query);
  const total = filteredMovies.length;
  const totalPages = Math.max(Math.ceil(total / MOVIE_PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * MOVIE_PAGE_SIZE;

  return Response.json({
    movies: filteredMovies.slice(start, start + MOVIE_PAGE_SIZE),
    featuredMovies,
    page: currentPage,
    pageSize: MOVIE_PAGE_SIZE,
    total,
    totalPages,
    query,
  });
}
