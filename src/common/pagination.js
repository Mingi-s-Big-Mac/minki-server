export const defaultPage = 1;
export const defaultSize = 20;
export const maxSize = 50;

export function getPagination({ page = defaultPage, size = defaultSize } = {}) {
  const normalizedPage = Math.max(Number(page), 1);
  const normalizedSize = Math.min(Math.max(Number(size), 1), maxSize);

  return {
    page: normalizedPage,
    size: normalizedSize,
    skip: (normalizedPage - 1) * normalizedSize,
    take: normalizedSize,
  };
}

export function createPageMeta(total, { page, size }) {
  return {
    page,
    size,
    total,
    totalPages: Math.ceil(total / size),
  };
}
