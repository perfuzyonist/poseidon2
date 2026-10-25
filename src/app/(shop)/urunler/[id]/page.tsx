import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProducts } from "@/lib/db";
import ProductPage from "@/components/product-page";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = (await getProducts()).find((p) => p.id === id);
  return { title: p?.name || "Ürün bulunamadı", description: p?.description };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  const related = products
    .filter((p) => p.id !== id)
    .sort(
      (a, b) =>
        Number(b.category === product.category) -
        Number(a.category === product.category),
    )
    .slice(0, 4);
  return <ProductPage product={product} related={related} />;
}
