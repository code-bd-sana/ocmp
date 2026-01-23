// Utility function to search data based on a query
export const searchData = <T>(
  data: readonly T[],
  query: string,
  columns: readonly (keyof T)[],
): T[] => {
  if (!query.trim()) return Array.from(data);

  const lowerQuery = query.toLowerCase();
  return Array.from(data).filter((row) =>
    columns.some((key) =>
      String(row[key] ?? "")
        .toLowerCase()
        .includes(lowerQuery),
    ),
  );
};

// Utility function to handle pagination
export const paginateData = <T>(
  data: readonly T[],
  page: number,
  pageSize: number,
): { items: T[]; totalPages: number; safePage: number } => {
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const start = (page - 1) * pageSize;

  // Calculate the safe page value to ensure it's within valid bounds
  const safePage = Math.min(page, totalPages);

  return {
    items: Array.from(data).slice(start, start + pageSize),
    totalPages,
    safePage,
  };
};

// Utility function for sorting
export const sortData = <T>(
  data: readonly T[],
  key: keyof T,
  dir: "asc" | "desc",
): T[] => {
  const sorted = Array.from(data).sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    const an = Number(av);
    const bn = Number(bv);
    const bothNumeric = Number.isFinite(an) && Number.isFinite(bn);
    return bothNumeric ? an - bn : String(av).localeCompare(String(bv));
  });

  return dir === "asc" ? sorted : sorted.reverse();
};
