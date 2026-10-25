import type { Metadata } from "next";
import { getProducts } from "@/lib/db";
import Storefront from "@/components/storefront";
export const metadata: Metadata = { title: "Ürünler" };
export const dynamic = "force-dynamic";
export default async function Products({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <Storefront
      products={await getProducts()}
      catalog
      initialQuery={typeof params.ara === "string" ? params.ara : ""}
      initialCategory={
        typeof params.kategori === "string" ? params.kategori : "Tümü"
      }
    />
  );
}
