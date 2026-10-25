import type { Product } from "./types";

export function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .trim();
}

export function matchesProduct(product: Product, query: string) {
  const text = normalizeSearch(
    `${product.name} ${product.category} ${product.description}`,
  );
  return normalizeSearch(query)
    .split(/\s+/)
    .every((word) => text.includes(word));
}
